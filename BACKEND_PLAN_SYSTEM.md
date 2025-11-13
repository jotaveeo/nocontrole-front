# 🎯 Sistema de Planos - Documentação Backend

## 📋 Visão Geral

Sistema Freemium com 4 tipos de planos:
- **FREE**: Gratuito com limites
- **PIX**: R$ 10,00 (30 dias - teste)
- **MONTHLY**: R$ 15,90/mês (recorrente)
- **ANNUAL**: R$ 162,00/ano (economiza R$ 48)

---

## 🗄️ 1. Banco de Dados

### 1.1. Atualizar Tabela `users`

```sql
ALTER TABLE users ADD COLUMN plan_type VARCHAR(20) DEFAULT 'free';
ALTER TABLE users ADD COLUMN plan_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN plan_start_date DATETIME;
ALTER TABLE users ADD COLUMN plan_end_date DATETIME;
ALTER TABLE users ADD COLUMN trial_used BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN trial_start_date DATETIME;
ALTER TABLE users ADD COLUMN trial_end_date DATETIME;
ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
```

**Valores possíveis:**
- `plan_type`: `'free'`, `'pix'`, `'monthly'`, `'annual'`
- `plan_status`: `'active'`, `'expired'`, `'cancelled'`, `'trial'`

---

### 1.2. Nova Tabela `subscriptions`

```sql
CREATE TABLE subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  plan_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(20),
  payment_id VARCHAR(100),
  mercadopago_payment_id VARCHAR(100),
  mercadopago_subscription_id VARCHAR(100),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  start_date DATETIME,
  end_date DATETIME,
  auto_renew BOOLEAN DEFAULT FALSE,
  cancelled_at DATETIME,
  cancellation_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_payment_id (payment_id),
  INDEX idx_status (status)
);
```

**Valores possíveis:**
- `plan_type`: `'pix'`, `'monthly'`, `'annual'`
- `status`: `'pending'`, `'active'`, `'expired'`, `'cancelled'`, `'failed'`
- `payment_method`: `'pix'`, `'credit_card'`

---

### 1.3. Nova Tabela `plan_usage`

```sql
CREATE TABLE plan_usage (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  month_year VARCHAR(7) NOT NULL,
  transactions_count INT DEFAULT 0,
  cards_count INT DEFAULT 0,
  goals_count INT DEFAULT 0,
  reports_generated INT DEFAULT 0,
  exports_count INT DEFAULT 0,
  ai_requests INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_month (user_id, month_year),
  INDEX idx_month_year (month_year)
);
```

**Formato `month_year`**: `'2025-11'`

---

## 🔒 2. Limites dos Planos

### 2.1. Configuração de Limites

```python
# config/plans.py

PLAN_LIMITS = {
    'free': {
        'name': 'Plano Gratuito',
        'price': 0,
        'features': {
            'transactions_per_month': 10,
            'cards': 2,
            'goals': 3,
            'categories': 10,
            'fixed_expenses': 5,
            'investments': 2,
            'debts': 2,
            'wishlist_items': 5,
            'advanced_reports': False,
            'export_data': False,
            'ai_insights': False,
            'auto_categorization': False,
            'multi_currency': False,
            'priority_support': False,
        }
    },
    'pix': {
        'name': 'Plano PIX - 30 Dias',
        'price': 10.00,
        'duration_days': 30,
        'features': 'unlimited'  # Todas as features liberadas
    },
    'monthly': {
        'name': 'Plano Premium Mensal',
        'price': 15.90,
        'duration_days': 30,
        'features': 'unlimited'
    },
    'annual': {
        'name': 'Plano Premium Anual',
        'price': 162.00,
        'duration_days': 365,
        'features': 'unlimited',
        'savings': 48.00  # Economia vs mensal (R$ 15.90 * 12 = R$ 190.80)
    }
}

def get_plan_limits(plan_type):
    """Retorna limites do plano"""
    return PLAN_LIMITS.get(plan_type, PLAN_LIMITS['free'])

def is_premium(plan_type):
    """Verifica se é plano premium"""
    return plan_type in ['pix', 'monthly', 'annual']
```

---

## 🛡️ 3. Middleware de Verificação

### 3.1. Decorator `@check_plan_limit`

```python
# middlewares/plan_checker.py

from functools import wraps
from flask import request, jsonify, g
from datetime import datetime
from models import User, PlanUsage
from config.plans import PLAN_LIMITS, is_premium

def check_plan_limit(feature):
    """
    Decorator para verificar limites do plano
    
    Uso:
    @check_plan_limit('transactions')
    @check_plan_limit('reports')
    @check_plan_limit('export')
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Pegar user_id do JWT
            user_id = g.user_id  # ou get_jwt_identity()
            
            # Buscar usuário
            user = User.query.get(user_id)
            if not user:
                return jsonify({
                    'success': False,
                    'error': 'Usuário não encontrado'
                }), 404
            
            # Se for premium ativo, libera tudo
            if is_premium(user.plan_type):
                if user.plan_status == 'active':
                    # Verificar se não expirou
                    if user.plan_end_date and user.plan_end_date > datetime.now():
                        return f(*args, **kwargs)
                    else:
                        # Expirou - fazer downgrade para free
                        user.plan_type = 'free'
                        user.plan_status = 'expired'
                        db.session.commit()
            
            # Plano FREE - verificar limites
            plan_limits = PLAN_LIMITS['free']['features']
            
            # 1. Verificar limites de QUANTIDADE
            if feature == 'transactions':
                usage = get_or_create_monthly_usage(user_id)
                current = usage.transactions_count
                limit = plan_limits['transactions_per_month']
                
                if current >= limit:
                    return jsonify({
                        'success': False,
                        'error': 'limit_reached',
                        'error_code': 'TRANSACTION_LIMIT_REACHED',
                        'message': f'Você atingiu o limite de {limit} transações do plano gratuito',
                        'current_usage': current,
                        'limit': limit,
                        'upgrade_required': True,
                        'available_plans': ['pix', 'monthly', 'annual']
                    }), 403
            
            elif feature == 'cards':
                from models import Card
                current = Card.query.filter_by(user_id=user_id).count()
                limit = plan_limits['cards']
                
                if current >= limit:
                    return jsonify({
                        'success': False,
                        'error': 'limit_reached',
                        'error_code': 'CARDS_LIMIT_REACHED',
                        'message': f'Você atingiu o limite de {limit} cartões do plano gratuito',
                        'current_usage': current,
                        'limit': limit,
                        'upgrade_required': True
                    }), 403
            
            elif feature == 'goals':
                from models import Goal
                current = Goal.query.filter_by(user_id=user_id).count()
                limit = plan_limits['goals']
                
                if current >= limit:
                    return jsonify({
                        'success': False,
                        'error': 'limit_reached',
                        'error_code': 'GOALS_LIMIT_REACHED',
                        'message': f'Você atingiu o limite de {limit} metas do plano gratuito',
                        'current_usage': current,
                        'limit': limit,
                        'upgrade_required': True
                    }), 403
            
            # 2. Verificar features BLOQUEADAS (boolean)
            elif feature in ['advanced_reports', 'export_data', 'ai_insights', 'auto_categorization']:
                if not plan_limits.get(feature, False):
                    feature_names = {
                        'advanced_reports': 'Relatórios Avançados',
                        'export_data': 'Exportação de Dados',
                        'ai_insights': 'Insights com IA',
                        'auto_categorization': 'Categorização Automática'
                    }
                    
                    return jsonify({
                        'success': False,
                        'error': 'premium_required',
                        'error_code': 'PREMIUM_FEATURE',
                        'message': f'{feature_names[feature]} disponível apenas no plano Premium',
                        'feature': feature,
                        'upgrade_required': True,
                        'available_plans': ['pix', 'monthly', 'annual']
                    }), 403
            
            # Se passou nas verificações, permite execução
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def get_or_create_monthly_usage(user_id):
    """Busca ou cria registro de uso mensal"""
    month_year = datetime.now().strftime('%Y-%m')
    
    usage = PlanUsage.query.filter_by(
        user_id=user_id,
        month_year=month_year
    ).first()
    
    if not usage:
        usage = PlanUsage(
            user_id=user_id,
            month_year=month_year,
            transactions_count=0,
            cards_count=0,
            goals_count=0
        )
        db.session.add(usage)
        db.session.commit()
    
    return usage


def increment_usage(user_id, feature):
    """Incrementa contador de uso"""
    usage = get_or_create_monthly_usage(user_id)
    
    if feature == 'transactions':
        usage.transactions_count += 1
    elif feature == 'reports':
        usage.reports_generated += 1
    elif feature == 'exports':
        usage.exports_count += 1
    elif feature == 'ai':
        usage.ai_requests += 1
    
    db.session.commit()
```

---

## 🔌 4. Endpoints da API

### 4.1. `GET /api/users/plan` - Obter Plano Atual

**Request:**
```http
GET /api/users/plan
Authorization: Bearer <JWT_TOKEN>
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user_id": 123,
    "plan": {
      "type": "free",
      "status": "active",
      "name": "Plano Gratuito",
      "start_date": null,
      "end_date": null,
      "days_remaining": null,
      "auto_renew": false
    },
    "limits": {
      "transactions_per_month": 10,
      "cards": 2,
      "goals": 3,
      "advanced_reports": false,
      "export_data": false,
      "ai_insights": false
    },
    "usage": {
      "month_year": "2025-11",
      "transactions": 5,
      "cards": 1,
      "goals": 2,
      "reports": 0,
      "exports": 0
    },
    "trial": {
      "used": false,
      "available": true
    }
  }
}
```

**Response (Premium):**
```json
{
  "success": true,
  "data": {
    "user_id": 123,
    "plan": {
      "type": "monthly",
      "status": "active",
      "name": "Plano Premium Mensal",
      "start_date": "2025-11-01T00:00:00Z",
      "end_date": "2025-12-01T00:00:00Z",
      "days_remaining": 18,
      "auto_renew": true
    },
    "limits": "unlimited",
    "trial": {
      "used": true
    }
  }
}
```

**Implementação:**
```python
@app.route('/api/users/plan', methods=['GET'])
@jwt_required()
def get_user_plan():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'success': False, 'error': 'Usuário não encontrado'}), 404
    
    # Verificar se plano expirou
    if user.plan_end_date and user.plan_end_date < datetime.now():
        if user.plan_status == 'active':
            user.plan_type = 'free'
            user.plan_status = 'expired'
            db.session.commit()
    
    # Buscar uso mensal
    usage = get_or_create_monthly_usage(user_id)
    
    # Contar recursos
    from models import Card, Goal
    cards_count = Card.query.filter_by(user_id=user_id).count()
    goals_count = Goal.query.filter_by(user_id=user_id).count()
    
    # Calcular dias restantes
    days_remaining = None
    if user.plan_end_date:
        days_remaining = (user.plan_end_date - datetime.now()).days
    
    # Buscar assinatura ativa
    subscription = Subscription.query.filter_by(
        user_id=user_id,
        status='active'
    ).first()
    
    response_data = {
        'user_id': user_id,
        'plan': {
            'type': user.plan_type,
            'status': user.plan_status,
            'name': PLAN_LIMITS[user.plan_type]['name'],
            'start_date': user.plan_start_date.isoformat() if user.plan_start_date else None,
            'end_date': user.plan_end_date.isoformat() if user.plan_end_date else None,
            'days_remaining': days_remaining,
            'auto_renew': subscription.auto_renew if subscription else False
        },
        'trial': {
            'used': user.trial_used,
            'available': not user.trial_used,
            'start_date': user.trial_start_date.isoformat() if user.trial_start_date else None,
            'end_date': user.trial_end_date.isoformat() if user.trial_end_date else None
        }
    }
    
    # Adicionar limites apenas se for FREE
    if user.plan_type == 'free':
        response_data['limits'] = PLAN_LIMITS['free']['features']
        response_data['usage'] = {
            'month_year': usage.month_year,
            'transactions': usage.transactions_count,
            'cards': cards_count,
            'goals': goals_count,
            'reports': usage.reports_generated,
            'exports': usage.exports_count
        }
    else:
        response_data['limits'] = 'unlimited'
    
    return jsonify({
        'success': True,
        'data': response_data
    })
```

---

### 4.2. `POST /api/mercadopago/pix/create` - Criar Pagamento PIX

**Request:**
```json
{
  "amount": 10.00,
  "description": "Plano PIX - 30 Dias - NoControle",
  "planType": "pix",
  "deviceId": "abc123..."
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "paymentId": "1234567890",
    "subscriptionId": 42,
    "status": "pending",
    "amount": 10.00,
    "qrCode": "00020126580014br.gov.bcb.pix...",
    "qrCodeBase64": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "ticketUrl": "https://www.mercadopago.com.br/payments/...",
    "expiresAt": "2025-11-14T10:30:00Z",
    "validityDays": 30
  }
}
```

**Implementação:**
```python
@app.route('/api/mercadopago/pix/create', methods=['POST'])
@jwt_required()
def create_pix_payment():
    user_id = get_jwt_identity()
    data = request.json
    
    amount = data.get('amount')
    description = data.get('description')
    plan_type = data.get('planType', 'pix')
    device_id = data.get('deviceId')
    
    # Validações
    if not amount or amount <= 0:
        return jsonify({'success': False, 'error': 'Valor inválido'}), 400
    
    # Criar assinatura pendente no banco
    plan_config = PLAN_LIMITS[plan_type]
    end_date = datetime.now() + timedelta(days=plan_config['duration_days'])
    
    subscription = Subscription(
        user_id=user_id,
        plan_type=plan_type,
        status='pending',
        payment_method='pix',
        amount=amount,
        currency='BRL',
        end_date=end_date
    )
    db.session.add(subscription)
    db.session.commit()
    
    # Criar pagamento no Mercado Pago
    try:
        mp_payment = create_mercadopago_pix_payment(
            amount=amount,
            description=description,
            external_reference=f"sub_{subscription.id}",
            payer_email=g.user_email,
            device_id=device_id
        )
        
        # Atualizar subscription com payment_id
        subscription.payment_id = str(mp_payment['id'])
        subscription.mercadopago_payment_id = str(mp_payment['id'])
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {
                'paymentId': mp_payment['id'],
                'subscriptionId': subscription.id,
                'status': mp_payment['status'],
                'amount': float(mp_payment['transaction_amount']),
                'qrCode': mp_payment['point_of_interaction']['transaction_data']['qr_code'],
                'qrCodeBase64': mp_payment['point_of_interaction']['transaction_data']['qr_code_base64'],
                'ticketUrl': mp_payment['point_of_interaction']['transaction_data']['ticket_url'],
                'expiresAt': mp_payment['date_of_expiration'],
                'validityDays': plan_config['duration_days']
            }
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
```

---

### 4.3. `POST /api/mercadopago/subscription/create` - Criar Assinatura com Cartão

**Request:**
```json
{
  "cardToken": "abc123token",
  "planType": "monthly",
  "amount": 15.90,
  "installments": 1,
  "paymentMethodId": "visa",
  "issuerId": "123",
  "statement_descriptor": "NOCONTROLE",
  "items": [
    {
      "id": "premium_monthly",
      "title": "Plano Premium Mensal",
      "description": "Plano Premium Mensal - Sistema de Controle Financeiro NoControle - Acesso completo",
      "category_id": "digital_services",
      "quantity": 1,
      "unit_price": 15.90
    }
  ],
  "payer": {
    "email": "user@example.com",
    "identification": {
      "type": "CPF",
      "number": "12345678900"
    }
  }
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "paymentId": "1234567890",
    "subscriptionId": 43,
    "status": "approved",
    "statusDetail": "accredited",
    "amount": 15.90,
    "planType": "monthly",
    "endDate": "2025-12-13T00:00:00Z"
  }
}
```

**Implementação:**
```python
@app.route('/api/mercadopago/subscription/create', methods=['POST'])
@jwt_required()
def create_subscription():
    user_id = get_jwt_identity()
    data = request.json
    
    card_token = data.get('cardToken')
    plan_type = data.get('planType')
    amount = data.get('amount')
    installments = data.get('installments', 1)
    
    # Validações
    if not card_token or not plan_type or not amount:
        return jsonify({'success': False, 'error': 'Dados incompletos'}), 400
    
    # Criar subscription pendente
    plan_config = PLAN_LIMITS[plan_type]
    end_date = datetime.now() + timedelta(days=plan_config['duration_days'])
    
    subscription = Subscription(
        user_id=user_id,
        plan_type=plan_type,
        status='pending',
        payment_method='credit_card',
        amount=amount,
        end_date=end_date,
        auto_renew=(plan_type in ['monthly', 'annual'])  # Renovação automática
    )
    db.session.add(subscription)
    db.session.commit()
    
    # Criar pagamento no Mercado Pago
    try:
        mp_payment = create_mercadopago_card_payment(
            token=card_token,
            amount=amount,
            installments=installments,
            payment_method_id=data.get('paymentMethodId'),
            issuer_id=data.get('issuerId'),
            payer=data.get('payer'),
            statement_descriptor=data.get('statement_descriptor', 'NOCONTROLE'),
            items=data.get('items', []),
            external_reference=f"sub_{subscription.id}"
        )
        
        # Atualizar subscription
        subscription.payment_id = str(mp_payment['id'])
        subscription.mercadopago_payment_id = str(mp_payment['id'])
        
        # Se aprovado, ativar imediatamente
        if mp_payment['status'] == 'approved':
            user = User.query.get(user_id)
            user.plan_type = plan_type
            user.plan_status = 'active'
            user.plan_start_date = datetime.now()
            user.plan_end_date = end_date
            
            subscription.status = 'active'
            subscription.start_date = datetime.now()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {
                'paymentId': mp_payment['id'],
                'subscriptionId': subscription.id,
                'status': mp_payment['status'],
                'statusDetail': mp_payment.get('status_detail'),
                'amount': float(mp_payment['transaction_amount']),
                'planType': plan_type,
                'endDate': end_date.isoformat()
            }
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
```

---

### 4.4. `POST /api/mercadopago/webhook` - Webhook de Notificações

**Request (do Mercado Pago):**
```json
{
  "action": "payment.updated",
  "api_version": "v1",
  "data": {
    "id": "1234567890"
  },
  "date_created": "2025-11-13T10:30:00Z",
  "id": 12345,
  "live_mode": true,
  "type": "payment",
  "user_id": "123456789"
}
```

**Implementação:**
```python
@app.route('/api/mercadopago/webhook', methods=['POST'])
def mercadopago_webhook():
    data = request.json
    
    # Log para debug
    logger.info(f"Webhook received: {data}")
    
    # Validar se é notificação de pagamento
    if data.get('type') != 'payment':
        return jsonify({'success': True, 'message': 'Ignored'}), 200
    
    payment_id = data.get('data', {}).get('id')
    if not payment_id:
        return jsonify({'success': False, 'error': 'Payment ID not found'}), 400
    
    try:
        # Buscar pagamento no Mercado Pago
        mp_payment = get_mercadopago_payment(payment_id)
        
        # Buscar subscription no banco
        subscription = Subscription.query.filter_by(
            mercadopago_payment_id=str(payment_id)
        ).first()
        
        if not subscription:
            logger.warning(f"Subscription not found for payment {payment_id}")
            return jsonify({'success': True, 'message': 'Subscription not found'}), 200
        
        # Atualizar status baseado no status do pagamento
        if mp_payment['status'] == 'approved':
            # Ativar plano
            user = User.query.get(subscription.user_id)
            user.plan_type = subscription.plan_type
            user.plan_status = 'active'
            user.plan_start_date = datetime.now()
            user.plan_end_date = subscription.end_date
            
            subscription.status = 'active'
            subscription.start_date = datetime.now()
            
            db.session.commit()
            
            # Enviar email de confirmação
            send_plan_activated_email(user.email, subscription.plan_type)
            
            logger.info(f"Plan activated for user {user.id}")
        
        elif mp_payment['status'] in ['rejected', 'cancelled']:
            subscription.status = 'failed'
            db.session.commit()
            
            logger.info(f"Payment failed for subscription {subscription.id}")
        
        return jsonify({'success': True}), 200
    
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
```

---

### 4.5. `POST /api/users/plan/cancel` - Cancelar Assinatura

**Request:**
```json
{
  "reason": "Muito caro"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Assinatura cancelada. Você ainda tem acesso até 13/12/2025",
  "data": {
    "plan_end_date": "2025-12-13T00:00:00Z",
    "days_remaining": 30
  }
}
```

**Implementação:**
```python
@app.route('/api/users/plan/cancel', methods=['POST'])
@jwt_required()
def cancel_subscription():
    user_id = get_jwt_identity()
    data = request.json
    reason = data.get('reason', '')
    
    # Buscar assinatura ativa
    subscription = Subscription.query.filter_by(
        user_id=user_id,
        status='active'
    ).first()
    
    if not subscription:
        return jsonify({
            'success': False,
            'error': 'Nenhuma assinatura ativa encontrada'
        }), 404
    
    # Cancelar (mas mantém ativo até end_date)
    subscription.status = 'cancelled'
    subscription.cancelled_at = datetime.now()
    subscription.cancellation_reason = reason
    subscription.auto_renew = False
    
    db.session.commit()
    
    # Calcular dias restantes
    days_remaining = (subscription.end_date - datetime.now()).days
    
    # Enviar email
    user = User.query.get(user_id)
    send_plan_cancelled_email(user.email, subscription.end_date)
    
    return jsonify({
        'success': True,
        'message': f'Assinatura cancelada. Você ainda tem acesso até {subscription.end_date.strftime("%d/%m/%Y")}',
        'data': {
            'plan_end_date': subscription.end_date.isoformat(),
            'days_remaining': days_remaining
        }
    })
```

---

## 5. 📝 Atualizar Endpoints Existentes

### 5.1. Adicionar Verificações nos Endpoints

```python
# Transações
@app.route('/api/transactions', methods=['POST'])
@jwt_required()
@check_plan_limit('transactions')  # ← ADICIONAR
def create_transaction():
    # ... código existente ...
    
    # Após criar, incrementar contador
    increment_usage(user_id, 'transactions')
    
    return jsonify({'success': True, 'data': transaction})


# Cartões
@app.route('/api/cards', methods=['POST'])
@jwt_required()
@check_plan_limit('cards')  # ← ADICIONAR
def create_card():
    # ... código existente ...
    return jsonify({'success': True, 'data': card})


# Metas
@app.route('/api/goals', methods=['POST'])
@jwt_required()
@check_plan_limit('goals')  # ← ADICIONAR
def create_goal():
    # ... código existente ...
    return jsonify({'success': True, 'data': goal})


# Relatórios Avançados
@app.route('/api/reports/advanced', methods=['GET'])
@jwt_required()
@check_plan_limit('advanced_reports')  # ← ADICIONAR
def get_advanced_reports():
    # ... código existente ...
    increment_usage(user_id, 'reports')
    return jsonify({'success': True, 'data': reports})


# Exportação
@app.route('/api/export', methods=['POST'])
@jwt_required()
@check_plan_limit('export_data')  # ← ADICIONAR
def export_data():
    # ... código existente ...
    increment_usage(user_id, 'exports')
    return jsonify({'success': True, 'data': export_url})
```

---

## ⏰ 6. Tarefas Automatizadas (Cron Jobs)

### 6.1. Verificar Planos Expirados (Diariamente)

```python
# tasks/check_expired_plans.py

from datetime import datetime, timedelta
from models import User, Subscription
from extensions import db
from utils.email import send_plan_expired_email

def check_expired_plans():
    """
    Roda diariamente às 00:00
    Verifica planos que expiraram e faz downgrade para FREE
    """
    now = datetime.now()
    
    # Buscar usuários com plano expirado
    expired_users = User.query.filter(
        User.plan_end_date < now,
        User.plan_status == 'active',
        User.plan_type.in_(['pix', 'monthly', 'annual'])
    ).all()
    
    for user in expired_users:
        # Buscar subscription ativa
        subscription = Subscription.query.filter_by(
            user_id=user.id,
            status='active'
        ).first()
        
        if subscription:
            # Se tem renovação automática (cartão), tentar renovar
            if subscription.auto_renew and subscription.payment_method == 'credit_card':
                try:
                    renewed = renew_subscription(subscription.id)
                    if renewed:
                        continue  # Sucesso, pula para próximo
                except Exception as e:
                    logger.error(f"Failed to renew subscription {subscription.id}: {e}")
            
            # Marcar como expirada
            subscription.status = 'expired'
        
        # Downgrade para FREE
        user.plan_type = 'free'
        user.plan_status = 'expired'
        
        db.session.commit()
        
        # Enviar email
        send_plan_expired_email(user.email)
        
        logger.info(f"User {user.id} downgraded to FREE (plan expired)")


def renew_subscription(subscription_id):
    """Tenta renovar assinatura automaticamente"""
    subscription = Subscription.query.get(subscription_id)
    
    # Criar novo pagamento com o mesmo cartão
    # (Mercado Pago permite salvar cartão para cobranças futuras)
    
    # ... implementar lógica de renovação ...
    
    return True  # ou False se falhar
```

### 6.2. Notificar Expiração em 3 Dias

```python
def notify_expiring_plans():
    """
    Roda diariamente
    Notifica usuários que o plano expira em 3 dias
    """
    three_days_from_now = datetime.now() + timedelta(days=3)
    
    users = User.query.filter(
        User.plan_end_date.between(
            three_days_from_now - timedelta(hours=12),
            three_days_from_now + timedelta(hours=12)
        ),
        User.plan_status == 'active'
    ).all()
    
    for user in users:
        send_plan_expiring_soon_email(user.email, 3)
```

### 6.3. Resetar Contadores Mensais

```python
def reset_monthly_usage():
    """
    Roda no dia 1 de cada mês às 00:00
    Reseta contadores de uso do plano FREE
    """
    # Criar novos registros para o mês novo
    # (não deletar os antigos, manter histórico)
    
    logger.info("Monthly usage reset completed")
```

---

## 📧 7. Emails Automáticos

### 7.1. Templates de Email

```python
# utils/email.py

def send_plan_activated_email(email, plan_type):
    """Email quando plano é ativado"""
    subject = "✅ Seu Plano Premium foi Ativado!"
    
    body = f"""
    Parabéns! Seu plano {PLAN_LIMITS[plan_type]['name']} foi ativado com sucesso.
    
    Agora você tem acesso a:
    - Transações ilimitadas
    - Relatórios avançados
    - Exportação de dados
    - Insights com IA
    - Suporte prioritário
    
    Aproveite! 🎉
    """
    
    send_email(email, subject, body)


def send_plan_expired_email(email):
    """Email quando plano expira"""
    subject = "⏰ Seu Plano Premium Expirou"
    
    body = """
    Seu plano premium expirou e você foi movido para o plano gratuito.
    
    Plano Gratuito inclui:
    - 10 transações por mês
    - 2 cartões
    - 3 metas
    
    Deseja continuar com recursos ilimitados?
    [Renovar Agora]
    """
    
    send_email(email, subject, body)


def send_plan_expiring_soon_email(email, days):
    """Email 3 dias antes de expirar"""
    subject = f"⚠️ Seu plano expira em {days} dias"
    
    body = f"""
    Olá!
    
    Seu plano premium expira em {days} dias.
    
    Para continuar aproveitando todos os recursos, renove agora:
    [Renovar Plano]
    """
    
    send_email(email, subject, body)


def send_limit_reached_email(email, feature, limit):
    """Email quando atingir limite do FREE"""
    subject = "🔒 Você atingiu o limite do plano gratuito"
    
    body = f"""
    Você atingiu o limite de {limit} {feature} do plano gratuito.
    
    Faça upgrade para Premium e tenha acesso ilimitado:
    [Ver Planos]
    """
    
    send_email(email, subject, body)
```

---

## 🧪 8. Testes

### 8.1. Testar Criação de Pagamento PIX

```bash
curl -X POST https://api.seudominio.com/api/mercadopago/pix/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "amount": 10.00,
    "description": "Plano PIX - 30 Dias",
    "planType": "pix",
    "deviceId": "test123"
  }'
```

### 8.2. Testar Verificação de Limite

```bash
# Criar 11ª transação (deve falhar se FREE)
curl -X POST https://api.seudominio.com/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "amount": 50.00,
    "description": "Teste limite",
    "category": "Alimentação"
  }'
```

**Resposta esperada (403):**
```json
{
  "success": false,
  "error": "limit_reached",
  "error_code": "TRANSACTION_LIMIT_REACHED",
  "message": "Você atingiu o limite de 10 transações do plano gratuito",
  "current_usage": 10,
  "limit": 10,
  "upgrade_required": true
}
```

---

## 📋 Checklist de Implementação

### **Banco de Dados**
- [ ] Adicionar campos em `users` (plan_type, plan_status, etc)
- [ ] Criar tabela `subscriptions`
- [ ] Criar tabela `plan_usage`
- [ ] Rodar migrations

### **Código**
- [ ] Criar `config/plans.py` com limites
- [ ] Criar `middlewares/plan_checker.py` com decorators
- [ ] Criar `utils/email.py` com templates

### **Endpoints**
- [ ] Implementar `GET /api/users/plan`
- [ ] Atualizar `POST /api/mercadopago/pix/create`
- [ ] Implementar `POST /api/mercadopago/subscription/create`
- [ ] Implementar `POST /api/mercadopago/webhook`
- [ ] Implementar `POST /api/users/plan/cancel`
- [ ] Adicionar `@check_plan_limit()` em endpoints existentes

### **Cron Jobs**
- [ ] Criar task `check_expired_plans()` (diária)
- [ ] Criar task `notify_expiring_plans()` (diária)
- [ ] Criar task `reset_monthly_usage()` (mensal)
- [ ] Configurar scheduler (Celery, APScheduler, etc)

### **Integrações**
- [ ] Configurar webhook no Mercado Pago
- [ ] Configurar envio de emails (SendGrid, AWS SES, etc)
- [ ] Configurar variáveis de ambiente (MERCADOPAGO_ACCESS_TOKEN)

### **Testes**
- [ ] Testar criação de pagamento PIX
- [ ] Testar criação de assinatura com cartão
- [ ] Testar webhook do Mercado Pago
- [ ] Testar verificação de limites
- [ ] Testar cancelamento de assinatura
- [ ] Testar expiração automática

---

## 🔐 Variáveis de Ambiente

```bash
# .env

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxx
MERCADOPAGO_WEBHOOK_SECRET=xxxxx

# Email
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=noreply@nocontrole.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT
JWT_SECRET_KEY=your-secret-key
```

---

## 📞 Contato

Dúvidas sobre a implementação? Entre em contato:
- **Frontend:** Já implementado e pronto
- **Backend:** Seguir esta documentação

**Boa implementação! 🚀**

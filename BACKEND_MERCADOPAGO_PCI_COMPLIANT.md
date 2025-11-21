# 🔐 Guia de Implementação PCI Compliant - Backend

## ⚠️ CRÍTICO: Requisitos do Mercado Pago

Este documento explica como implementar corretamente o backend para:
1. ✅ **Tokenização de Cartão** (PCI Compliance)
2. ✅ **Device ID** (Antifraude)

---

## 1. Tokenização de Cartão (PCI DSS Level 1)

### ❌ O QUE NUNCA FAZER

```python
# ❌ NUNCA RECEBA DADOS DO CARTÃO NO SEU SERVIDOR
@app.route('/api/payment', methods=['POST'])
def create_payment():
    card_number = request.json.get('card_number')  # ❌ PROIBIDO!
    cvv = request.json.get('cvv')                  # ❌ PROIBIDO!
    expiry_date = request.json.get('expiry')       # ❌ PROIBIDO!
    
    # Se você fizer isso, sua aplicação:
    # - Viola PCI Compliance
    # - Pode ser bloqueada pelo Mercado Pago
    # - Está sujeita a multas pesadas
    # - É vulnerável a hackers
```

### ✅ O QUE FAZER

O frontend já está **tokenizando** os dados do cartão:

```typescript
// Frontend (PixCheckout.tsx e CreditCardCheckout.tsx)
const { token } = await cardForm.createCardToken();
// token = "abc123xyz..." (string criptografada)

// Envia APENAS o token para o backend
await apiClient.post('/api/mercadopago/pix/create', {
  cardToken: token,  // ✅ Apenas o token, não os dados do cartão
  deviceId: deviceId,
  ...
});
```

### Backend: Como Receber e Usar o Token

```python
# ✅ CORRETO: Receber apenas o token
@app.route('/api/mercadopago/subscription/create', methods=['POST'])
@jwt_required()
def create_subscription():
    data = request.get_json()
    
    # ✅ Receber token (não dados do cartão)
    card_token = data.get('cardToken')  # String gerada pelo MP SDK
    device_id = data.get('deviceId')    # Device fingerprint
    
    # ✅ Criar pagamento com o token
    payment_data = {
        "token": card_token,  # Usar o token
        "transaction_amount": data.get('amount'),
        "installments": data.get('installments', 1),
        "payment_method_id": data.get('paymentMethodId'),
        "payer": {
            "email": data.get('payer', {}).get('email'),
            "identification": data.get('payer', {}).get('identification'),
        },
        "statement_descriptor": "NOCONTROLE",
        "external_reference": f"sub_{user_id}_{int(time.time())}",
    }
    
    # ✅ CRÍTICO: Adicionar Device ID para antifraude
    if device_id:
        payment_data["device_id"] = device_id
    
    # Fazer requisição à API do Mercado Pago
    response = requests.post(
        "https://api.mercadopago.com/v1/payments",
        json=payment_data,
        headers={
            "Authorization": f"Bearer {MERCADOPAGO_ACCESS_TOKEN}",
            "X-Idempotency-Key": str(uuid.uuid4()),
        }
    )
    
    return jsonify(response.json())
```

---

## 2. Device ID (Antifraude)

### Por Que É Importante

```
❌ SEM Device ID:
- Taxa de rejeição: ~30-40%
- Mercado Pago não confia na transação
- Muitos "payment rejected"

✅ COM Device ID:
- Taxa de rejeição: ~5-10%
- Motor antifraude funciona corretamente
- Melhor experiência do usuário
```

### Como Funciona

**Frontend:**
```typescript
// useMercadoPagoSDK.ts gera automaticamente
const mp = new window.MercadoPago(publicKey, {
  locale: 'pt-BR',
  advancedFraudPrevention: true,  // ✅ Gera Device ID
});

// Captura do cookie ou gera fallback
const deviceId = getDeviceFingerprint() || generateFallbackDeviceId();
```

**Backend:**
```python
# Receber Device ID do frontend
device_id = data.get('deviceId')

# ✅ SEMPRE incluir no payload para o Mercado Pago
payment_data = {
    "token": card_token,
    "device_id": device_id,  # ✅ CRÍTICO para antifraude
    ...
}
```

### Onde Enviar o Device ID

O Device ID pode ser enviado em **2 lugares** (escolha um):

#### Opção 1: No objeto `payer` (Recomendado)
```python
payment_data = {
    "token": card_token,
    "payer": {
        "email": "user@example.com",
        "device_id": device_id,  # ✅ Aqui
        "identification": {...},
    },
}
```

#### Opção 2: Na raiz do objeto
```python
payment_data = {
    "token": card_token,
    "device_id": device_id,  # ✅ Ou aqui
    "payer": {
        "email": "user@example.com",
        "identification": {...},
    },
}
```

---

## 3. Payload Completo Exemplo

### PIX Payment (endpoint: `/api/mercadopago/pix/create`)

```python
@app.route('/api/mercadopago/pix/create', methods=['POST'])
@jwt_required()
def create_pix_payment():
    data = request.get_json()
    user_id = get_jwt_identity()
    
    # ✅ Dados que o frontend envia
    amount = data.get('amount')           # 19.90
    description = data.get('description') # "Plano PIX - 30 Dias"
    plan_type = data.get('planType')      # "pix"
    device_id = data.get('deviceId')      # "abc123xyz..." ou "fallback_..."
    
    # ✅ Criar pagamento PIX
    payment_data = {
        "transaction_amount": amount,
        "description": description,
        "payment_method_id": "pix",
        "payer": {
            "email": current_user.email,
            "first_name": current_user.name.split()[0],
            "last_name": current_user.name.split()[-1] if len(current_user.name.split()) > 1 else "",
        },
        "statement_descriptor": "NOCONTROLE",
        "external_reference": f"pix_{user_id}_{int(time.time())}",
        "notification_url": f"{BASE_URL}/api/mercadopago/webhook",
    }
    
    # ✅ CRÍTICO: Adicionar Device ID
    if device_id:
        payment_data["device_id"] = device_id
    
    # Fazer requisição
    response = requests.post(
        "https://api.mercadopago.com/v1/payments",
        json=payment_data,
        headers={
            "Authorization": f"Bearer {MERCADOPAGO_ACCESS_TOKEN}",
            "X-Idempotency-Key": str(uuid.uuid4()),
        }
    )
    
    result = response.json()
    
    # ✅ Retornar dados do PIX
    return jsonify({
        "success": True,
        "paymentId": result["id"],
        "status": result["status"],
        "qrCode": result["point_of_interaction"]["transaction_data"]["qr_code"],
        "qrCodeBase64": result["point_of_interaction"]["transaction_data"]["qr_code_base64"],
        "ticketUrl": result["point_of_interaction"]["transaction_data"]["ticket_url"],
        "expiresAt": result["date_of_expiration"],
        "amount": result["transaction_amount"],
    })
```

### Credit Card Payment (endpoint: `/api/mercadopago/subscription/create`)

```python
@app.route('/api/mercadopago/subscription/create', methods=['POST'])
@jwt_required()
def create_card_subscription():
    data = request.get_json()
    user_id = get_jwt_identity()
    
    # ✅ Dados que o frontend envia
    card_token = data.get('cardToken')         # Token do cartão (não o número!)
    device_id = data.get('deviceId')           # Device ID
    amount = data.get('amount')                # 24.90 ou 250.80
    installments = data.get('installments', 1) # Número de parcelas
    payment_method_id = data.get('paymentMethodId')  # "visa", "master", etc
    issuer_id = data.get('issuerId')           # ID do banco emissor
    
    # ✅ Criar pagamento com cartão
    payment_data = {
        "token": card_token,  # ✅ Token (não dados do cartão!)
        "transaction_amount": amount,
        "installments": installments,
        "payment_method_id": payment_method_id,
        "issuer_id": issuer_id,
        "payer": {
            "email": data.get('payer', {}).get('email'),
            "identification": data.get('payer', {}).get('identification'),
        },
        "statement_descriptor": "NOCONTROLE",
        "external_reference": f"sub_{user_id}_{int(time.time())}",
        "notification_url": f"{BASE_URL}/api/mercadopago/webhook",
    }
    
    # ✅ CRÍTICO: Adicionar Device ID
    if device_id:
        payment_data["device_id"] = device_id
    
    # Fazer requisição
    response = requests.post(
        "https://api.mercadopago.com/v1/payments",
        json=payment_data,
        headers={
            "Authorization": f"Bearer {MERCADOPAGO_ACCESS_TOKEN}",
            "X-Idempotency-Key": str(uuid.uuid4()),
        }
    )
    
    result = response.json()
    
    return jsonify({
        "success": result["status"] in ["approved", "pending"],
        "paymentId": result["id"],
        "status": result["status"],
        "statusDetail": result.get("status_detail"),
    })
```

---

## 4. Checklist de Segurança

### ✅ Frontend (Já Implementado)
- [x] Usa MercadoPago SDK V2
- [x] Secure Fields para dados do cartão
- [x] Tokenização antes de enviar
- [x] Device ID capturado automaticamente
- [x] Fallback de Device ID se necessário
- [x] Dados do cartão NUNCA tocam o servidor

### ⚠️ Backend (Para Implementar)
- [ ] **NUNCA** aceitar dados de cartão cru (PAN)
- [ ] Receber apenas `cardToken` do frontend
- [ ] Incluir `device_id` em TODAS as requisições ao MP
- [ ] Usar `X-Idempotency-Key` para evitar duplicatas
- [ ] Adicionar `statement_descriptor` para clareza na fatura
- [ ] Adicionar `category_id: "digital_services"` para melhor aprovação
- [ ] Implementar webhook para atualizar status dos pagamentos
- [ ] Validar CPF antes de enviar ao MP

---

## 5. Testes de Qualidade do Mercado Pago

### O que a ferramenta verifica:

#### ✅ Teste 1: Tokenização
```
❌ FALHA: Se enviar card_number, cvv, expiry_date
✅ PASSA: Se enviar apenas cardToken
```

#### ✅ Teste 2: Device ID
```
❌ AVISO: Se não enviar device_id (reduz aprovação)
✅ PASSA: Se enviar device_id válido
```

#### ✅ Teste 3: Webhooks
```
❌ FALHA: Se não processar notificações
✅ PASSA: Se atualizar status via webhook
```

---

## 6. Logs Recomendados

```python
import logging

logger = logging.getLogger('mercadopago')

# ✅ Log seguro (sem dados sensíveis)
logger.info(f"💳 Criando pagamento para user {user_id}")
logger.info(f"🔑 Token recebido: {card_token[:20]}...")  # Primeiros 20 chars
logger.info(f"🛡️ Device ID: {device_id}")

# ❌ NUNCA logar dados do cartão
# logger.info(f"Card: {card_number}")  # ❌ PROIBIDO!
```

---

## 7. Variáveis de Ambiente Necessárias

```bash
# .env
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx-xxx  # Para frontend
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx-xxx  # Para backend
MERCADOPAGO_WEBHOOK_SECRET=xxx  # Para validar webhooks
BASE_URL=https://nocontrole-back.onrender.com
```

---

## 8. Recursos Adicionais

- 📚 [Documentação Oficial - Tokenização](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/card/integrate-via-cardform)
- 📚 [Device ID](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/additional-info)
- 📚 [PCI Compliance](https://www.mercadopago.com.br/developers/pt/docs/security/pci)
- 📚 [Webhooks](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/webhooks)

---

## 🎯 Resumo

### Frontend ✅
- Tokeniza cartão com Secure Fields
- Captura Device ID automaticamente
- Envia apenas `cardToken` + `deviceId` ao backend

### Backend ⚠️ (Implementar)
- Recebe `cardToken` (nunca dados do cartão)
- Inclui `device_id` em requisições ao MP
- Processa webhooks para atualizar status
- Valida CPF antes de enviar

**Com isso, você passa nos testes de qualidade do Mercado Pago! 🚀**

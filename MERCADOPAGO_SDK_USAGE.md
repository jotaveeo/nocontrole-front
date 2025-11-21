# 🔐 MercadoPago SDK V2 - Guia de Uso Simplificado

## 📦 O que foi simplificado

### ✅ Melhorias Implementadas

1. **Tipagem TypeScript Completa**
   - Interfaces claras para CardForm, Installments, Issuers, etc
   - Autocomplete em IDEs (VSCode, WebStorm)
   - Menos erros em tempo de desenvolvimento

2. **Código Mais Limpo**
   - Comentários organizados em seções
   - Lógica clara e sequencial
   - Logs padronizados

3. **Sem Fallback**
   - Removida lógica de Device ID fake
   - Sistema falha se Device ID real não for gerado
   - Maior segurança e taxa de aprovação

4. **Cleanup Correto**
   - `isMounted` flag previne memory leaks
   - Event listeners removidos corretamente

---

## 🚀 Como Usar

### 1. Hook Básico

```typescript
import { useMercadoPagoSDK } from '@/hooks/useMercadoPagoSDK';

function PaymentComponent() {
  const { mp, deviceId, isReady, error } = useMercadoPagoSDK();

  // Carregando
  if (!isReady) {
    return <p>Inicializando MercadoPago...</p>;
  }

  // Erro
  if (error) {
    return <p>Erro: {error}</p>;
  }

  // Device ID não gerado
  if (!deviceId || deviceId === 'generating') {
    return <p>Validando segurança...</p>;
  }

  // Pronto para usar
  return <CardForm mp={mp} deviceId={deviceId} />;
}
```

---

### 2. Hook Simplificado (Apenas Device ID)

```typescript
import { useMercadoPagoDeviceId } from '@/hooks/useMercadoPagoSDK';

function PixPayment() {
  const deviceId = useMercadoPagoDeviceId();

  const handleCreatePix = async () => {
    if (!deviceId) {
      alert('Device ID não disponível');
      return;
    }

    await apiClient.post('/api/mercadopago/pix/create', {
      deviceId,
      amount: 10,
      description: 'Plano PIX'
    });
  };

  return (
    <button 
      onClick={handleCreatePix}
      disabled={!deviceId || deviceId === 'generating'}
    >
      {!deviceId || deviceId === 'generating' ? 'Carregando...' : 'Gerar PIX'}
    </button>
  );
}
```

---

### 3. Card Form com Secure Fields

```typescript
import { useMercadoPagoSDK } from '@/hooks/useMercadoPagoSDK';

function CreditCardForm() {
  const { mp, deviceId, isReady } = useMercadoPagoSDK();
  const [cardForm, setCardForm] = useState(null);

  useEffect(() => {
    if (!isReady || !mp || !deviceId) return;

    const form = mp.cardForm({
      amount: '29.90',
      iframe: true, // Secure Fields (PCI Compliant)
      form: {
        id: 'mp-card-form',
        cardNumber: {
          id: 'mp-card-number',
          placeholder: 'Número do cartão',
          style: {
            fontSize: '16px',
            color: '#000',
          }
        },
        expirationDate: {
          id: 'mp-expiration-date',
          placeholder: 'MM/AA'
        },
        securityCode: {
          id: 'mp-security-code',
          placeholder: 'CVV'
        },
        // ... outros campos
      },
      callbacks: {
        onFormMounted: (error) => {
          if (error) {
            console.error('Erro ao montar form:', error);
            return;
          }
          console.log('Form montado com sucesso');
        },
        onSubmit: async (event) => {
          event.preventDefault();
          
          // Tokenizar cartão
          const { token } = await cardForm.createCardToken();
          
          // Enviar para backend
          await apiClient.post('/api/mercadopago/subscription/create', {
            cardToken: token,
            deviceId: deviceId,
            amount: 29.90
          });
        }
      }
    });

    setCardForm(form);
  }, [isReady, mp, deviceId]);

  return (
    <form id="mp-card-form">
      <div id="mp-card-number"></div>
      <div id="mp-expiration-date"></div>
      <div id="mp-security-code"></div>
      <button type="submit">Pagar</button>
    </form>
  );
}
```

---

## 🔍 Debugging

### Console Logs

O SDK agora loga automaticamente:

```javascript
🚀 Inicializando MercadoPago SDK V2
🔑 Public Key: APP_USR-1d826adb...
✅ SDK carregado
✅ SDK inicializado (advancedFraudPrevention: true)
⏳ Aguardando Device ID...
✅ Device ID capturado: 7f8a9b2c-4d6e-1a3b-8c9d-2e5f7a1b4c8d
```

### Erros Comuns

**Device ID não gerado:**
```
❌ FALHA: Device ID não foi gerado. Recarregue a página.
💡 Causas possíveis: Public Key inválida, bloqueador de anúncios, problemas de rede
```

**Public Key não configurada:**
```
❌ Public Key não configurada. Configure VITE_MERCADOPAGO_PUBLIC_KEY no .env
```

---

## 📋 Checklist de Integração

### Frontend
- [x] Hook `useMercadoPagoSDK` implementado
- [x] Secure Fields (iframe: true)
- [x] Device ID validado
- [x] Tokenização implementada
- [x] Validação de campos
- [x] Tratamento de erros

### Backend
- [ ] Endpoint `/api/mercadopago/subscription/create`
- [ ] Recebe `cardToken` + `deviceId`
- [ ] Envia para API MercadoPago
- [ ] Inclui `additional_info.items`
- [ ] Inclui `metadata.device_id`
- [ ] Inclui `statement_descriptor`

---

## 🎯 Próximos Passos

1. **Teste o Device ID**
   ```javascript
   // No console do navegador
   console.log('Device ID:', window.MP_DEVICE_SESSION_ID);
   ```

2. **Teste com Cartão de Teste**
   - Visa: `4509 9535 6623 3704`
   - CVV: `123`
   - Validade: `11/25`
   - Nome: `APRO`

3. **Monitore os Logs**
   - Abra DevTools (F12)
   - Vá para aba "Console"
   - Veja os logs do MercadoPago SDK

4. **Implemente o Backend**
   - Use a documentação em `BACKEND_MERCADOPAGO_PCI_COMPLIANT.md`
   - Teste localmente antes de fazer deploy

---

## 📚 Referências

- [MercadoPago SDK JS V2](https://www.mercadopago.com.br/developers/pt/docs/sdks-library/client-side/javascript)
- [Secure Fields](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/card/integrate-via-cardform)
- [Cartões de Teste](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test/test-cards)
- [Device ID](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/additional-content/your-integrations/implement-device-fingerprint)

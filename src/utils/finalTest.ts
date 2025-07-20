// Teste final para verificar se o problema foi resolvido
export const finalTest = async () => {
  console.log("🎯 TESTE FINAL - Verificando se o problema foi resolvido");
  
  // 1. Verificar se há token válido
  const accessToken = localStorage.getItem('access_token');
  const expiresAt = localStorage.getItem('expires_at');
  
  if (!accessToken) {
    console.error("❌ Nenhum token encontrado. Faça login primeiro.");
    return false;
  }
  
  const expirationTime = parseInt(expiresAt || '0') * 1000;
  const now = Date.now();
  const isExpired = now >= expirationTime;
  
  console.log("📊 Status do Token:");
  console.log("  - Token existe:", !!accessToken);
  console.log("  - Expira em:", new Date(expirationTime));
  console.log("  - Agora:", new Date(now));
  console.log("  - Expirado?", isExpired);
  
  if (isExpired) {
    console.log("⏰ Token expirado, tentando renovar...");
    
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.error("❌ Sem refresh token. Faça login novamente.");
      return false;
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('expires_at', data.expires_at);
          console.log("✅ Token renovado com sucesso!");
        }
      } else {
        console.error("❌ Falha ao renovar token:", response.status);
        return false;
      }
    } catch (error) {
      console.error("❌ Erro ao renovar token:", error);
      return false;
    }
  }
  
  // 2. Testar requisição para API
  console.log("🚀 Testando requisição para /api/transactions...");
  
  try {
    const { makeApiRequest } = await import('../lib/api');
    const result = await makeApiRequest('/api/transactions', { method: 'GET' });
    
    console.log("✅ Sucesso! Resposta da API:", result);
    console.log("🎉 PROBLEMA RESOLVIDO! As requisições estão funcionando.");
    return true;
  } catch (error) {
    console.error("❌ Ainda há problemas com a API:", error);
    return false;
  }
};

// Auto-execute após 5 segundos para dar tempo dos dados carregarem
setTimeout(() => {
  console.log("🎯 Executando teste final em 5 segundos...");
  finalTest();
}, 5000);

// Disponibilizar globalmente
(window as any).finalTest = finalTest;

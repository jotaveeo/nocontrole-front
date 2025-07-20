// Função para testar e renovar token automaticamente
export const checkAndRenewToken = async () => {
  const accessToken = localStorage.getItem('access_token');
  console.log('🔍 [TOKEN_CHECK] Current token:', accessToken);
  
  if (!accessToken) {
    console.error('❌ [TOKEN_CHECK] No token found');
    return false;
  }

  // Verificar se é um token temporário da migração
  if (accessToken.startsWith('temp-token-')) {
    console.warn('⚠️ [TOKEN_CHECK] Temporary token detected, user needs to login again');
    console.log('💡 [TOKEN_CHECK] Please logout and login again to get a valid JWT token');
    
    // Limpar dados temporários
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('user');
    localStorage.removeItem('financi_user_name');
    
    // Redirecionar para login
    window.location.href = '/login';
    return false;
  }

  // Testar token com o backend
  try {
    const response = await fetch('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const userData = await response.json();
      console.log('✅ [TOKEN_CHECK] Token is valid:', userData);
      return true;
    } else {
      console.error('❌ [TOKEN_CHECK] Token is invalid, response:', response.status);
      return false;
    }
  } catch (error) {
    console.error('💥 [TOKEN_CHECK] Network error:', error);
    return false;
  }
};

// Adicionar ao window para uso manual
if (typeof window !== 'undefined') {
  (window as any).checkAndRenewToken = checkAndRenewToken;
}

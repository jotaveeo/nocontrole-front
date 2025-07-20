// Função para limpar tokens temporários inválidos
export const cleanInvalidTokens = () => {
  const accessToken = localStorage.getItem('access_token');
  
  // Se há um token que começa com "temp-token-", remover tudo
  if (accessToken && accessToken.startsWith('temp-token-')) {
    console.log("🧹 Removendo tokens temporários inválidos...");
    
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("expires_at");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("financi_user_name");
    localStorage.removeItem("financi_user_email");
    localStorage.removeItem("financi_user_id");
    
    console.log("✅ Tokens temporários removidos. Faça login para continuar.");
    
    // Recarregar página para aplicar mudanças
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
    return true;
  }
  
  return false;
};

// Auto-executar na inicialização
cleanInvalidTokens();

// Disponibilizar globalmente
(window as any).cleanInvalidTokens = cleanInvalidTokens;

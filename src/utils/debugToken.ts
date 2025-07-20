// Função para debug manual do token
export const debugToken = () => {
  console.log("🔍 DEBUG TOKEN INFO:");
  console.log("access_token:", localStorage.getItem('access_token'));
  console.log("refresh_token:", localStorage.getItem('refresh_token'));
  console.log("expires_at:", localStorage.getItem('expires_at'));
  console.log("user_id:", localStorage.getItem('user_id'));
  
  const expiresAt = localStorage.getItem('expires_at');
  if (expiresAt) {
    const expirationTime = parseInt(expiresAt) * 1000;
    const now = Date.now();
    const isExpired = now >= expirationTime;
    console.log("Token expired?", isExpired);
    console.log("Expires at:", new Date(expirationTime));
    console.log("Current time:", new Date(now));
    console.log("Time difference:", (expirationTime - now) / 1000 / 60, "minutes");
  }
  
  // Testar se o header seria criado
  const accessToken = localStorage.getItem('access_token');
  if (accessToken && expiresAt) {
    const expirationTime = parseInt(expiresAt) * 1000;
    const now = Date.now();
    
    if (now < expirationTime) {
      const authHeader = `Bearer ${accessToken}`;
      console.log("Auth header would be:", authHeader);
      return authHeader;
    }
  }
  
  console.log("❌ No valid auth header would be created");
  return null;
};

// Executar automaticamente ao carregar
setTimeout(() => {
  console.log("🚀 Auto-executing debugToken...");
  debugToken();
}, 2000);

// Tornar disponível globalmente para debug no console
(window as any).debugToken = debugToken;

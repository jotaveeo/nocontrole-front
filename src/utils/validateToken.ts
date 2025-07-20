// Verificador de token com o backend
export const validateTokenWithBackend = async () => {
  const accessToken = localStorage.getItem('access_token');
  const expiresAt = localStorage.getItem('expires_at');
  
  console.log("🔐 VALIDATING TOKEN WITH BACKEND:");
  
  if (!accessToken) {
    console.error("❌ No access token found");
    return false;
  }
  
  if (!expiresAt) {
    console.error("❌ No expiration time found");
    return false;
  }
  
  const expirationTime = parseInt(expiresAt) * 1000;
  const now = Date.now();
  
  if (now >= expirationTime) {
    console.error("❌ Token is locally expired");
    return false;
  }
  
  console.log("✅ Token passes local validation, testing with backend...");
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log("📥 Backend response status:", response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Token is valid! Backend response:", data);
      return true;
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error("❌ Token is invalid! Backend error:", errorData);
      return false;
    }
  } catch (error) {
    console.error("❌ Failed to validate token:", error);
    return false;
  }
};

// Auto-execute on load
setTimeout(() => {
  console.log("🚀 Auto-validating token with backend...");
  validateTokenWithBackend();
}, 3000);

// Make available globally
(window as any).validateTokenWithBackend = validateTokenWithBackend;

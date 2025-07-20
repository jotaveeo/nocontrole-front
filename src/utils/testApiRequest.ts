// Teste manual de requisição para debug
export const testApiRequest = async () => {
  const accessToken = localStorage.getItem('access_token');
  const expiresAt = localStorage.getItem('expires_at');
  
  console.log("🧪 TEST API REQUEST");
  console.log("Token:", accessToken);
  console.log("Expires at:", expiresAt);
  
  if (!accessToken) {
    console.error("❌ No access token found");
    return;
  }
  
  if (!expiresAt) {
    console.error("❌ No expiration time found");
    return;
  }
  
  const expirationTime = parseInt(expiresAt) * 1000;
  const now = Date.now();
  
  if (now >= expirationTime) {
    console.error("❌ Token is expired");
    return;
  }
  
  console.log("✅ Token is valid, making request...");
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  };
  
  console.log("📤 Headers being sent:", headers);
  
  try {
    const response = await fetch('http://localhost:3000/api/transactions', {
      method: 'GET',
      headers: headers
    });
    
    console.log("📥 Response status:", response.status);
    console.log("📥 Response headers:", Object.fromEntries(response.headers.entries()));
    
    const responseData = await response.json();
    console.log("📥 Response data:", responseData);
    
    return responseData;
  } catch (error) {
    console.error("❌ Request failed:", error);
  }
};

// Tornar disponível globalmente
(window as any).testApiRequest = testApiRequest;

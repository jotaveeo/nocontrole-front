// Teste de login para obter token válido
export const testLogin = async (email: string = 'test@test.com', password: string = 'test123') => {
  console.log("🔐 TESTING LOGIN TO GET FRESH TOKEN:");
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    console.log("📥 Login response status:", response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Login successful! Response:", data);
      
      if (data.access_token) {
        console.log("💾 Storing new token...");
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('expires_at', data.expires_at);
        localStorage.setItem('user_id', data.user.id);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log("✅ New token stored successfully!");
        
        // Test the new token immediately
        setTimeout(() => {
          (window as any).validateTokenWithBackend();
        }, 1000);
        
        return true;
      }
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error("❌ Login failed! Error:", errorData);
      return false;
    }
  } catch (error) {
    console.error("❌ Login request failed:", error);
    return false;
  }
};

// Make available globally
(window as any).testLogin = testLogin;

console.log("🔐 Test login function available. Use: testLogin('your@email.com', 'yourpassword')");

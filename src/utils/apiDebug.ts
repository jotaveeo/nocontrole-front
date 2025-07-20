// Debug utilities para testar headers de API
export const testApiHeaders = async () => {
  const accessToken = localStorage.getItem('access_token');
  console.log('🔍 [API_DEBUG] Access Token:', accessToken ? 'EXISTS' : 'NULL');
  
  if (!accessToken) {
    console.error('❌ [API_DEBUG] No access token found!');
    return;
  }

  try {
    // Teste manual com fetch para verificar headers
    const response = await fetch('http://localhost:3000/api/categories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('📡 [API_DEBUG] Response status:', response.status);
    console.log('📡 [API_DEBUG] Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ [API_DEBUG] API call successful:', data);
    } else {
      const errorData = await response.text();
      console.error('❌ [API_DEBUG] API call failed:', errorData);
    }
  } catch (error) {
    console.error('💥 [API_DEBUG] Network error:', error);
  }
};

// Adicionar função ao window para teste manual
if (typeof window !== 'undefined') {
  (window as any).testApiHeaders = testApiHeaders;
}

// Script simples para testar a API
const API_URL = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 Testando API...\n');

  // Teste 1: Health Check
  try {
    const healthResponse = await fetch(`${API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);
  } catch (error) {
    console.error('❌ Health Check falhou:', error.message);
    return;
  }

  // Teste 2: Login
  try {
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@fittrainer.com',
        password: 'admin123'
      })
    });
    const loginData = await loginResponse.json();
    
    if (loginData.success) {
      console.log('✅ Login bem-sucedido!');
      console.log('   Token recebido:', loginData.token ? 'Sim' : 'Não');
      console.log('   Usuário:', loginData.user?.nome);
      
      // Teste 3: Verificar sessão
      if (loginData.token) {
        const verifyResponse = await fetch(`${API_URL}/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${loginData.token}`
          }
        });
        const verifyData = await verifyResponse.json();
        console.log('✅ Verificação de sessão:', verifyData.success ? 'OK' : 'Falhou');
      }
    } else {
      console.error('❌ Login falhou:', loginData.error);
    }
  } catch (error) {
    console.error('❌ Login falhou:', error.message);
  }

  console.log('\n✅ Testes concluídos!');
}

testAPI();




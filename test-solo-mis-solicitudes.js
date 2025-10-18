const fetch = require('node-fetch');

async function testSoloMisSolicitudes() {
  console.log('🧪 Probando solo el endpoint mis-solicitudes...');

  try {
    // 1. Login como Juan
    console.log('\n1️⃣ Haciendo login como Juan...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'juan@test.com',
        password: 'JuanTest2024!'
      })
    });

    const loginData = await loginResponse.json();
    console.log('🔐 Login Response Status:', loginResponse.status);
    
    if (loginResponse.status !== 200) {
      console.log('❌ Error en login:', loginData);
      return;
    }

    console.log('✅ Login exitoso');
    const token = loginData.access_token;
    console.log('🔑 Token obtenido:', token.substring(0, 50) + '...');

    // 2. Probar endpoint mis-solicitudes con headers detallados
    console.log('\n2️⃣ Probando endpoint mis-solicitudes...');
    
    const misSolicitudesResponse = await fetch('http://localhost:3000/api/usuarios/reservas/mis-solicitudes', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📋 Response Status:', misSolicitudesResponse.status);
    console.log('📋 Response Headers:', Object.fromEntries(misSolicitudesResponse.headers.entries()));
    
    const responseText = await misSolicitudesResponse.text();
    console.log('📋 Response Body (raw):', responseText);
    
    try {
      const misSolicitudesData = JSON.parse(responseText);
      console.log('📋 Response Body (parsed):', JSON.stringify(misSolicitudesData, null, 2));
    } catch (parseError) {
      console.log('❌ Error parsing JSON:', parseError.message);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }

  console.log('\n🎉 Prueba completada');
}

testSoloMisSolicitudes();
const BASE_URL = 'http://localhost:3000/api';

async function verificarUsuarios() {
  console.log('🔍 Verificando usuarios en la base de datos...\n');
  
  try {
    // 1. Intentar login con María García
    console.log('1️⃣ Intentando login con María García...');
    const loginMaria = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'maria@test.com',
        password: 'MariaTest2024!'
      })
    });

    if (loginMaria.ok) {
      const dataMaria = await loginMaria.json();
      console.log('✅ María García autenticada:', {
        id: dataMaria.user.id,
        nombre: dataMaria.user.nombre,
        email: dataMaria.user.email
      });
      
      // Obtener perfil de María
      const perfilMaria = await fetch(`${BASE_URL}/auth/perfil`, {
        headers: {
          'Authorization': `Bearer ${dataMaria.access_token}`
        }
      });
      
      if (perfilMaria.ok) {
        const perfilData = await perfilMaria.json();
        console.log('📋 Perfil de María:', perfilData);
      }
    } else {
      console.log('❌ Error al autenticar María García:', await loginMaria.text());
    }

    console.log('\n2️⃣ Intentando login con Federico...');
    const loginFederico = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'gtbump2012@gmail.com',
        password: 'FedericoTest2024!'
      })
    });

    if (loginFederico.ok) {
      const dataFederico = await loginFederico.json();
      console.log('✅ Federico autenticado:', {
        id: dataFederico.user.id,
        nombre: dataFederico.user.nombre,
        email: dataFederico.user.email
      });
    } else {
      console.log('❌ Error al autenticar Federico:', await loginFederico.text());
    }

    console.log('\n3️⃣ Intentando login con Juan...');
    const loginJuan = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'juan@test.com',
        password: 'JuanTest2024!'
      })
    });

    if (loginJuan.ok) {
      const dataJuan = await loginJuan.json();
      console.log('✅ Juan autenticado:', {
        id: dataJuan.user.id,
        nombre: dataJuan.user.nombre,
        email: dataJuan.user.email
      });
    } else {
      console.log('❌ Error al autenticar Juan:', await loginJuan.text());
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  }
}

verificarUsuarios();
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function crearSegundoUsuario() {
    try {
        console.log('🔍 Creando segundo usuario para pruebas de reservas...');
        
        // Datos del segundo usuario
        const datosUsuario = {
            email: 'cliente@test.com',
            password: 'Cliente123@',
            nombre: 'Cliente',
            apellido: 'Prueba',
            documentoIdentidad: '11223344',
            telefono: '987654321'
        };

        console.log('📝 Registrando usuario cliente@test.com...');
        
        // Registrar usuario
        try {
            const registroResponse = await axios.post(`${BASE_URL}/api/auth/register`, datosUsuario);
            console.log('✅ Usuario registrado exitosamente:', registroResponse.data);
        } catch (registroError) {
            if (registroError.response?.status === 409) {
                console.log('ℹ️ El usuario ya existe, procediendo con el login...');
            } else {
                throw registroError;
            }
        }

        // Hacer login
        console.log('🔑 Haciendo login...');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'cliente@test.com',
            password: 'Cliente123@'
        });

        console.log('✅ Login exitoso!');
        console.log('📋 Respuesta completa:', JSON.stringify(loginResponse.data, null, 2));
        
        // Manejar diferentes estructuras de respuesta
        const usuarioId = loginResponse.data.user?.id || loginResponse.data.usuario?.id;
        const token = loginResponse.data.access_token;
        
        console.log('🆔 Usuario ID:', usuarioId);
        console.log('🎫 Token:', token ? token.substring(0, 50) + '...' : 'No token');

        return {
            usuarioId: usuarioId,
            token: token
        };

    } catch (error) {
        console.error('❌ Error:', error.response?.status, error.response?.statusText);
        if (error.response?.data) {
            console.error('📄 Detalles del error:', JSON.stringify(error.response.data, null, 2));
        }
        console.error('💬 Mensaje:', error.message);
        throw error;
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    crearSegundoUsuario()
        .then(resultado => {
            console.log('🎉 Segundo usuario creado exitosamente!');
            console.log('📋 Resultado:', resultado);
        })
        .catch(error => {
            console.error('💥 Error al crear segundo usuario:', error.message);
            process.exit(1);
        });
}

module.exports = { crearSegundoUsuario };
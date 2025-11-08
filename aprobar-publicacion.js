const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function aprobarPublicaciones() {
    try {
        console.log('🔍 Buscando publicaciones pendientes...');
        
        // Buscar publicaciones pendientes
        const publicacionesPendientes = await prisma.publicacion.findMany({
            where: {
                estadoModeracion: 'PENDIENTE_REVISION'
            },
            select: {
                id: true,
                titulo: true,
                estadoModeracion: true
            }
        });
        
        console.log(`📋 Encontradas ${publicacionesPendientes.length} publicaciones pendientes:`);
        publicacionesPendientes.forEach(pub => {
            console.log(`  - ${pub.titulo} (${pub.id})`);
        });
        
        if (publicacionesPendientes.length > 0) {
            console.log('✅ Aprobando todas las publicaciones pendientes...');
            
            // Aprobar todas las publicaciones pendientes
            const resultado = await prisma.publicacion.updateMany({
                where: {
                    estadoModeracion: 'PENDIENTE_REVISION'
                },
                data: {
                    estadoModeracion: 'APROBADA',
                    fechaModeracion: new Date()
                }
            });
            
            console.log(`✅ ${resultado.count} publicaciones aprobadas exitosamente!`);
        } else {
            console.log('ℹ️ No hay publicaciones pendientes de aprobación');
        }
        
        // Verificar el resultado
        console.log('🔍 Verificando publicaciones aprobadas...');
        const publicacionesAprobadas = await prisma.publicacion.findMany({
            where: {
                estadoModeracion: 'APROBADA'
            },
            select: {
                id: true,
                titulo: true,
                estadoModeracion: true
            }
        });
        
        console.log(`📋 Total de publicaciones aprobadas: ${publicacionesAprobadas.length}`);
        publicacionesAprobadas.forEach(pub => {
            console.log(`  - ${pub.titulo} (${pub.id})`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

aprobarPublicaciones();
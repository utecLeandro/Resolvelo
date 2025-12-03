export const emailTemplates = {
  bienvenida: (nombre: string, linkVerificacion: string) => `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #FF5A5F; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">¡Bienvenido a ReSolVelo!</h1>
      </div>
      <div style="padding: 20px;">
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Gracias por registrarte en nuestra plataforma. Estamos emocionados de tenerte aquí.</p>
        <p>Para comenzar a alquilar o publicar equipos, por favor verifica tu dirección de correo electrónico haciendo clic en el siguiente botón:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${linkVerificacion}" style="background-color: #FF5A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verificar mi correo</a>
        </div>
        <p style="font-size: 12px; color: #666;">Si el botón no funciona, copia y pega este enlace en tu navegador:<br>${linkVerificacion}</p>
      </div>
      <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #999;">
        &copy; ${new Date().getFullYear()} ReSolVelo. Todos los derechos reservados.
      </div>
    </div>
  `,

  reservaCreadaPropietario: (nombrePropietario: string, nombreArrendatario: string, tituloPublicacion: string, fechaInicio: string, fechaFin: string, linkGestion: string) => `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #FF5A5F; padding: 20px; text-align: center;">
        <h2 style="color: white; margin: 0;">Nueva Solicitud de Reserva</h2>
      </div>
      <div style="padding: 20px;">
        <p>Hola <strong>${nombrePropietario}</strong>,</p>
        <p>¡Buenas noticias! <strong>${nombreArrendatario}</strong> quiere alquilar tu equipo.</p>
        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 4px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Equipo:</strong> ${tituloPublicacion}</p>
          <p style="margin: 5px 0;"><strong>Fechas:</strong> Del ${fechaInicio} al ${fechaFin}</p>
        </div>
        <p>Por favor, revisa la solicitud para aprobarla o rechazarla lo antes posible.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${linkGestion}" style="background-color: #FF5A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Gestionar Reserva</a>
        </div>
      </div>
    </div>
  `,

  estadoReservaArrendatario: (nombreArrendatario: string, estado: string, tituloPublicacion: string, linkDetalle: string) => {
    const colorEstado = estado === 'CONFIRMADA' ? '#00A699' : estado === 'RECHAZADA' ? '#FC642D' : '#484848';
    const textoEstado = estado === 'CONFIRMADA' ? 'Aceptada' : estado === 'RECHAZADA' ? 'Rechazada' : estado;
    
    return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <div style="background-color: ${colorEstado}; padding: 20px; text-align: center;">
        <h2 style="color: white; margin: 0;">Tu reserva ha sido ${textoEstado}</h2>
      </div>
      <div style="padding: 20px;">
        <p>Hola <strong>${nombreArrendatario}</strong>,</p>
        <p>El propietario ha actualizado el estado de tu solicitud para <strong>${tituloPublicacion}</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${linkDetalle}" style="background-color: ${colorEstado}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Ver Detalles</a>
        </div>
      </div>
    </div>
  `},

  nuevoMensaje: (nombreReceptor: string, nombreEmisor: string, contenidoMensaje: string, linkMensajes: string) => `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #FF5A5F; padding: 20px; text-align: center;">
        <h2 style="color: white; margin: 0;">Nuevo Mensaje</h2>
      </div>
      <div style="padding: 20px;">
        <p>Hola <strong>${nombreReceptor}</strong>,</p>
        <p>Tienes un nuevo mensaje de <strong>${nombreEmisor}</strong>:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #FF5A5F; margin: 15px 0; font-style: italic;">
          "${contenidoMensaje}"
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${linkMensajes}" style="background-color: #FF5A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Responder</a>
        </div>
      </div>
    </div>
  `,
};

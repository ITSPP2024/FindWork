// ================================================
// EMAIL SERVICE PARA FINDWORK
// Utilizando la integración Replit Mail para notificaciones
// ================================================

// Función para enviar emails usando la API de Replit Mail
async function sendEmail(to, subject, text, html = null) {
  try {
    // Obtener token de autenticación de Replit
    const authToken = process.env.REPL_IDENTITY 
      ? "repl " + process.env.REPL_IDENTITY
      : process.env.WEB_REPL_RENEWAL 
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

    if (!authToken) {
      console.error('No authentication token found for email service');
      return { success: false, error: 'Authentication token not found' };
    }

    const emailData = {
      to: to,
      subject: subject,
      text: text
    };

    if (html) {
      emailData.html = html;
    }

    const response = await fetch(
      "https://connectors.replit.com/api/v2/mailer/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X_REPLIT_TOKEN": authToken,
        },
        body: JSON.stringify(emailData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Error sending email:', error);
      return { success: false, error: error.message || 'Failed to send email' };
    }

    const result = await response.json();
    console.log('✅ Email sent successfully to:', to);
    return { success: true, data: result };

  } catch (error) {
    console.error('Error in email service:', error);
    return { success: false, error: error.message };
  }
}

// Plantillas de email específicas para FindWork
const emailTemplates = {
  // Notificación de nueva aplicación para empresa
  newApplication: (candidatoNombre, puestoTitulo, empresaEmail) => ({
    to: empresaEmail,
    subject: `Nueva aplicación recibida - ${puestoTitulo}`,
    text: `¡Hola!\n\nHas recibido una nueva aplicación para el puesto "${puestoTitulo}" de parte de ${candidatoNombre}.\n\nPuedes revisar la aplicación y el perfil del candidato en tu dashboard de FindWork.\n\n¡Saludos!\nEquipo FindWork`,
    html: `
      <h2>Nueva Aplicación Recibida</h2>
      <p>¡Hola!</p>
      <p>Has recibido una nueva aplicación para el puesto <strong>"${puestoTitulo}"</strong> de parte de <strong>${candidatoNombre}</strong>.</p>
      <p>Puedes revisar la aplicación y el perfil del candidato en tu dashboard de FindWork.</p>
      <br>
      <p>¡Saludos!<br>Equipo FindWork</p>
    `
  }),

  // Confirmación de aplicación para candidato
  applicationConfirmed: (candidatoEmail, puestoTitulo, empresaNombre) => ({
    to: candidatoEmail,
    subject: `Aplicación enviada exitosamente - ${puestoTitulo}`,
    text: `¡Hola!\n\nTu aplicación para el puesto "${puestoTitulo}" en ${empresaNombre} ha sido enviada exitosamente.\n\nLa empresa revisará tu perfil y se pondrá en contacto contigo pronto.\n\n¡Buena suerte!\nEquipo FindWork`,
    html: `
      <h2>Aplicación Enviada Exitosamente</h2>
      <p>¡Hola!</p>
      <p>Tu aplicación para el puesto <strong>"${puestoTitulo}"</strong> en <strong>${empresaNombre}</strong> ha sido enviada exitosamente.</p>
      <p>La empresa revisará tu perfil y se pondrá en contacto contigo pronto.</p>
      <br>
      <p>¡Buena suerte!<br>Equipo FindWork</p>
    `
  }),

  // Notificación de nueva entrevista
  interviewScheduled: (email, candidatoNombre, puestoTitulo, fechaHora, modalidad) => ({
    to: email,
    subject: `Entrevista programada - ${puestoTitulo}`,
    text: `¡Felicidades ${candidatoNombre}!\n\nSe ha programado una entrevista para el puesto "${puestoTitulo}".\n\nDetalles:\n- Fecha y hora: ${fechaHora}\n- Modalidad: ${modalidad}\n\nRevisa tu dashboard para más información.\n\n¡Éxito en tu entrevista!\nEquipo FindWork`,
    html: `
      <h2>Entrevista Programada</h2>
      <p>¡Felicidades <strong>${candidatoNombre}</strong>!</p>
      <p>Se ha programado una entrevista para el puesto <strong>"${puestoTitulo}"</strong>.</p>
      <h3>Detalles:</h3>
      <ul>
        <li><strong>Fecha y hora:</strong> ${fechaHora}</li>
        <li><strong>Modalidad:</strong> ${modalidad}</li>
      </ul>
      <p>Revisa tu dashboard para más información.</p>
      <br>
      <p>¡Éxito en tu entrevista!<br>Equipo FindWork</p>
    `
  }),

  // Notificación de nuevo mensaje
  newMessage: (email, remitenteNombre, asunto) => ({
    to: email,
    subject: `Nuevo mensaje en FindWork`,
    text: `¡Hola!\n\nHas recibido un nuevo mensaje de ${remitenteNombre}.\n\nAsunto: ${asunto}\n\nRevisa tu bandeja de mensajes en FindWork para responder.\n\nSaludos,\nEquipo FindWork`,
    html: `
      <h2>Nuevo Mensaje</h2>
      <p>¡Hola!</p>
      <p>Has recibido un nuevo mensaje de <strong>${remitenteNombre}</strong>.</p>
      <p><strong>Asunto:</strong> ${asunto}</p>
      <p>Revisa tu bandeja de mensajes en FindWork para responder.</p>
      <br>
      <p>Saludos,<br>Equipo FindWork</p>
    `
  }),

  // Bienvenida a nuevo usuario
  welcome: (email, nombre, tipoUsuario) => ({
    to: email,
    subject: `¡Bienvenido a FindWork!`,
    text: `¡Hola ${nombre}!\n\nBienvenido a FindWork, tu plataforma de búsqueda laboral.\n\nComo ${tipoUsuario}, tienes acceso a todas las herramientas necesarias para ${tipoUsuario === 'candidato' ? 'encontrar tu trabajo ideal' : 'encontrar los mejores candidatos'}.\n\nComienza explorando tu dashboard y completa tu perfil.\n\n¡Éxito en tu búsqueda!\nEquipo FindWork`,
    html: `
      <h2>¡Bienvenido a FindWork!</h2>
      <p>¡Hola <strong>${nombre}</strong>!</p>
      <p>Bienvenido a FindWork, tu plataforma de búsqueda laboral.</p>
      <p>Como <strong>${tipoUsuario}</strong>, tienes acceso a todas las herramientas necesarias para <strong>${tipoUsuario === 'candidato' ? 'encontrar tu trabajo ideal' : 'encontrar los mejores candidatos'}</strong>.</p>
      <p>Comienza explorando tu dashboard y completa tu perfil.</p>
      <br>
      <p>¡Éxito en tu búsqueda!<br>Equipo FindWork</p>
    `
  })
};

// Funciones específicas para cada tipo de notificación
async function sendNewApplicationEmail(candidatoNombre, puestoTitulo, empresaEmail) {
  const template = emailTemplates.newApplication(candidatoNombre, puestoTitulo, empresaEmail);
  return await sendEmail(template.to, template.subject, template.text, template.html);
}

async function sendApplicationConfirmationEmail(candidatoEmail, puestoTitulo, empresaNombre) {
  const template = emailTemplates.applicationConfirmed(candidatoEmail, puestoTitulo, empresaNombre);
  return await sendEmail(template.to, template.subject, template.text, template.html);
}

async function sendInterviewScheduledEmail(email, candidatoNombre, puestoTitulo, fechaHora, modalidad) {
  const template = emailTemplates.interviewScheduled(email, candidatoNombre, puestoTitulo, fechaHora, modalidad);
  return await sendEmail(template.to, template.subject, template.text, template.html);
}

async function sendNewMessageEmail(email, remitenteNombre, asunto) {
  const template = emailTemplates.newMessage(email, remitenteNombre, asunto);
  return await sendEmail(template.to, template.subject, template.text, template.html);
}

async function sendWelcomeEmail(email, nombre, tipoUsuario) {
  const template = emailTemplates.welcome(email, nombre, tipoUsuario);
  return await sendEmail(template.to, template.subject, template.text, template.html);
}

module.exports = {
  sendEmail,
  sendNewApplicationEmail,
  sendApplicationConfirmationEmail,
  sendInterviewScheduledEmail,
  sendNewMessageEmail,
  sendWelcomeEmail,
  emailTemplates
};
import { SalonRequestData } from '../types';

// Email service interface
interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// For now, we'll create a mock email service that logs emails
// In production, this would integrate with services like Resend, SendGrid, or AWS SES
export const emailService = {
  async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      // Mock implementation - in production, replace with actual email service
      console.log('📧 Email would be sent:', {
        to: template.to,
        subject: template.subject,
        html: template.html
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In production, this would be something like:
      // const response = await fetch('https://api.resend.com/emails', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     from: 'DataSalon <noreply@datasalon.com>',
      //     to: template.to,
      //     subject: template.subject,
      //     html: template.html,
      //   }),
      // });
      // return response.ok;

      return true; // Mock success
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  },

  async sendSalonRequestNotification(requestData: SalonRequestData): Promise<boolean> {
    const template = this.generateSalonRequestEmailTemplate(requestData);
    return await this.sendEmail(template);
  },

  async sendSalonCredentials(adminEmail: string, credentials: {
    salonName: string;
    adminName: string;
    email: string;
    password: string;
    loginUrl: string;
  }): Promise<boolean> {
    const template = this.generateSalonCredentialsEmailTemplate(credentials);
    return await this.sendEmail(template);
  },

  async sendEmployeeCredentials(employeeEmail: string, credentials: {
    employeeName: string;
    salonName: string;
    email: string;
    password: string;
    loginUrl: string;
  }): Promise<boolean> {
    const template = this.generateEmployeeCredentialsEmailTemplate(credentials);
    return await this.sendEmail(template);
  },

  async sendAppointmentReminder(clientEmail: string, appointmentData: {
    clientName: string;
    salonName: string;
    serviceName: string;
    employeeName: string;
    date: string;
    time: string;
    confirmationUrl: string;
  }): Promise<boolean> {
    const template = this.generateAppointmentReminderEmailTemplate(appointmentData);
    return await this.sendEmail(template);
  },

  generateSalonRequestEmailTemplate(requestData: SalonRequestData): EmailTemplate {
    return {
      to: 'datasalon98@gmail.com',
      subject: 'Nueva Solicitud de Salón - DataSalon',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nueva Solicitud de Salón</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e91e63, #9c27b0); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .request-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e91e63; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #e91e63; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .cta-button { display: inline-block; background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Nueva Solicitud de Salón</h1>
              <p>DataSalon - Sistema de Gestión</p>
            </div>
            
            <div class="content">
              <h2>Se ha recibido una nueva solicitud de acceso</h2>
              <p>Un administrador de salón ha solicitado acceso a la plataforma DataSalon.</p>
              
              <div class="request-details">
                <h3>Detalles de la Solicitud</h3>
                <div class="detail-row">
                  <span class="label">Administrador:</span> ${requestData.adminName}
                </div>
                <div class="detail-row">
                  <span class="label">Nombre del Salón:</span> ${requestData.salonName}
                </div>
                <div class="detail-row">
                  <span class="label">Email:</span> ${requestData.email}
                </div>
                <div class="detail-row">
                  <span class="label">Teléfono:</span> ${requestData.phone}
                </div>
                <div class="detail-row">
                  <span class="label">Fecha de Solicitud:</span> ${new Date().toLocaleDateString('es-ES')}
                </div>
              </div>
              
              <p><strong>Próximos pasos:</strong></p>
              <ol>
                <li>Revisar la información proporcionada</li>
                <li>Crear las credenciales de acceso para el salón</li>
                <li>Enviar las credenciales al administrador</li>
                <li>Activar el salón en el sistema</li>
              </ol>
              
              <div style="text-align: center;">
                <a href="#" class="cta-button">Revisar Solicitud</a>
              </div>
            </div>
            
            <div class="footer">
              <p>Este es un mensaje automático del sistema DataSalon.</p>
              <p>Si tienes alguna pregunta, contacta al equipo de soporte.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  },

  generateSalonCredentialsEmailTemplate(credentials: {
    salonName: string;
    adminName: string;
    email: string;
    password: string;
    loginUrl: string;
  }): EmailTemplate {
    return {
      to: credentials.email,
      subject: `¡Bienvenido a DataSalon! - Credenciales de acceso para ${credentials.salonName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenido a DataSalon</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e91e63, #9c27b0); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e91e63; }
            .credential-row { margin: 10px 0; }
            .label { font-weight: bold; color: #e91e63; }
            .password { background: #f0f0f0; padding: 8px; border-radius: 4px; font-family: monospace; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .cta-button { display: inline-block; background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Bienvenido a DataSalon!</h1>
              <p>Tu salón ha sido aprobado</p>
            </div>
            
            <div class="content">
              <h2>Hola ${credentials.adminName},</h2>
              <p>¡Excelentes noticias! Tu solicitud para <strong>${credentials.salonName}</strong> ha sido aprobada y ya tienes acceso a la plataforma DataSalon.</p>
              
              <div class="credentials">
                <h3>🔑 Tus Credenciales de Acceso</h3>
                <div class="credential-row">
                  <span class="label">Email:</span> ${credentials.email}
                </div>
                <div class="credential-row">
                  <span class="label">Contraseña:</span>
                  <div class="password">${credentials.password}</div>
                </div>
                <div class="credential-row">
                  <span class="label">URL de Acceso:</span> <a href="${credentials.loginUrl}">${credentials.loginUrl}</a>
                </div>
              </div>
              
              <p><strong>Próximos pasos:</strong></p>
              <ol>
                <li>Inicia sesión con las credenciales proporcionadas</li>
                <li>Configura los servicios que ofrece tu salón</li>
                <li>Registra a tus empleados</li>
                <li>Establece horarios de trabajo</li>
                <li>¡Comienza a recibir clientes!</li>
              </ol>
              
              <div style="text-align: center;">
                <a href="${credentials.loginUrl}" class="cta-button">Iniciar Sesión Ahora</a>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <strong>⚠️ Importante:</strong> Por seguridad, te recomendamos cambiar tu contraseña después del primer inicio de sesión.
              </div>
            </div>
            
            <div class="footer">
              <p>Este es un mensaje automático del sistema DataSalon.</p>
              <p>Si tienes alguna pregunta, contacta al equipo de soporte.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  },

  generateEmployeeCredentialsEmailTemplate(credentials: {
    employeeName: string;
    salonName: string;
    email: string;
    password: string;
    loginUrl: string;
  }): EmailTemplate {
    return {
      to: credentials.email,
      subject: `¡Bienvenido a DataSalon! - Acceso como empleado de ${credentials.salonName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenido a DataSalon</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e91e63, #9c27b0); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e91e63; }
            .credential-row { margin: 10px 0; }
            .label { font-weight: bold; color: #e91e63; }
            .password { background: #f0f0f0; padding: 8px; border-radius: 4px; font-family: monospace; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .cta-button { display: inline-block; background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Bienvenido a DataSalon!</h1>
              <p>Tu cuenta de empleado está lista</p>
            </div>
            
            <div class="content">
              <h2>Hola ${credentials.employeeName},</h2>
              <p>¡Bienvenido al equipo de <strong>${credentials.salonName}</strong>! Tu administrador te ha registrado en la plataforma DataSalon.</p>
              
              <div class="credentials">
                <h3>🔑 Tus Credenciales de Acceso</h3>
                <div class="credential-row">
                  <span class="label">Email:</span> ${credentials.email}
                </div>
                <div class="credential-row">
                  <span class="label">Contraseña:</span>
                  <div class="password">${credentials.password}</div>
                </div>
                <div class="credential-row">
                  <span class="label">URL de Acceso:</span> <a href="${credentials.loginUrl}">${credentials.loginUrl}</a>
                </div>
              </div>
              
              <p><strong>Con tu cuenta podrás:</strong></p>
              <ul>
                <li>Ver tus citas asignadas</li>
                <li>Confirmar la llegada de clientes</li>
                <li>Registrar servicios completados</li>
                <li>Gestionar pagos</li>
                <li>Ver tu horario de trabajo</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${credentials.loginUrl}" class="cta-button">Iniciar Sesión Ahora</a>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <strong>⚠️ Importante:</strong> Por seguridad, te recomendamos cambiar tu contraseña después del primer inicio de sesión.
              </div>
            </div>
            
            <div class="footer">
              <p>Este es un mensaje automático del sistema DataSalon.</p>
              <p>Si tienes alguna pregunta, contacta a tu administrador.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  },

  generateAppointmentReminderEmailTemplate(appointmentData: {
    clientName: string;
    salonName: string;
    serviceName: string;
    employeeName: string;
    date: string;
    time: string;
    confirmationUrl: string;
  }): EmailTemplate {
    return {
      to: appointmentData.clientName, // This would be the actual client email
      subject: `Recordatorio de cita - ${appointmentData.salonName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recordatorio de Cita</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e91e63, #9c27b0); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e91e63; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #e91e63; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .cta-button { display: inline-block; background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Recordatorio de Cita</h1>
              <p>Tu cita está próxima</p>
            </div>
            
            <div class="content">
              <h2>Hola ${appointmentData.clientName},</h2>
              <p>Te recordamos que tienes una cita programada en <strong>${appointmentData.salonName}</strong>.</p>
              
              <div class="appointment-details">
                <h3>📅 Detalles de tu Cita</h3>
                <div class="detail-row">
                  <span class="label">Servicio:</span> ${appointmentData.serviceName}
                </div>
                <div class="detail-row">
                  <span class="label">Profesional:</span> ${appointmentData.employeeName}
                </div>
                <div class="detail-row">
                  <span class="label">Fecha:</span> ${appointmentData.date}
                </div>
                <div class="detail-row">
                  <span class="label">Hora:</span> ${appointmentData.time}
                </div>
              </div>
              
              <p>Por favor, confirma tu asistencia haciendo clic en el botón de abajo.</p>
              
              <div style="text-align: center;">
                <a href="${appointmentData.confirmationUrl}" class="cta-button">Confirmar Asistencia</a>
              </div>
              
              <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <strong>💡 Consejo:</strong> Llega 10 minutos antes de tu cita para completar el proceso de check-in.
              </div>
            </div>
            
            <div class="footer">
              <p>Este es un mensaje automático del sistema DataSalon.</p>
              <p>Si necesitas cancelar o reprogramar tu cita, contacta al salón.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }
};

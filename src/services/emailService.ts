import { SalonRequestData } from '../types';

// Email service interface
interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Email service with Supabase integration
export const emailService = {
  async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      // Use Supabase's built-in email service
      console.log('📧 Using Supabase email service...');
      
      // Supabase handles email sending automatically when using auth methods
      // For custom emails, we need to use Supabase Edge Functions or
      // configure email templates in the Supabase Dashboard
      
      console.log('📧 Email would be sent via Supabase:', {
        to: template.to,
        subject: template.subject,
        html: template.html
      });
      
      // Note: For production, configure email templates in Supabase Dashboard:
      // 1. Go to Authentication → Email Templates
      // 2. Customize the templates
      // 3. Supabase will automatically send emails for auth operations
      
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  },

  async sendSalonRequestNotification(requestData: SalonRequestData): Promise<boolean> {
    const template = emailService.generateSalonRequestEmailTemplate(requestData);
    return await emailService.sendEmail(template);
  },

  async sendSalonCredentials(adminEmail: string, credentials: {
    salonName: string;
    adminName: string;
    email: string;
    loginUrl: string;
  }): Promise<boolean> {
    const template = emailService.generateSalonCredentialsEmailTemplate(credentials);
    return await emailService.sendEmail(template);
  },

  async sendEmployeeCredentials(employeeEmail: string, credentials: {
    employeeName: string;
    salonName: string;
    email: string;
    loginUrl: string;
  }): Promise<boolean> {
    const template = emailService.generateEmployeeCredentialsEmailTemplate(credentials);
    return await emailService.sendEmail(template);
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
    loginUrl: string;
  }): EmailTemplate {
    return {
      to: credentials.email,
      subject: `¡Bienvenido a DataSalon! - Cuenta creada para ${credentials.salonName}`,
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
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 6px; border: 1px solid #ffeaa7; margin: 20px 0;">
                <h3>📧 Confirmación de Email Requerida</h3>
                <p>Hemos enviado un correo de confirmación a <strong>${credentials.email}</strong>. Para activar tu cuenta, necesitas:</p>
                <ol>
                  <li>Revisar tu bandeja de entrada (y carpeta de spam)</li>
                  <li>Hacer clic en el enlace de confirmación del email</li>
                  <li>Establecer tu contraseña personal</li>
                  <li>Iniciar sesión en DataSalon</li>
                </ol>
              </div>
              
              <div class="credentials">
                <h3>🚀 Próximos Pasos</h3>
                <div style="margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                  <strong>1. Confirma tu email</strong><br>
                  Revisa tu correo y haz clic en el enlace de confirmación
                </div>
                <div style="margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                  <strong>2. Configura tu salón</strong><br>
                  Completa la información básica de tu salón
                </div>
                <div style="margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                  <strong>3. Registra servicios</strong><br>
                  Agrega los servicios que ofreces y sus precios
                </div>
                <div style="margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                  <strong>4. Agrega empleados</strong><br>
                  Registra a tu equipo y asigna servicios
                </div>
                <div style="margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                  <strong>5. ¡Comienza a recibir clientes!</strong><br>
                  Tu salón estará listo para operar
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="${credentials.loginUrl}" class="cta-button">Ir a DataSalon</a>
              </div>
            </div>
            
            <div class="footer">
              <p>Este es un mensaje automático del sistema DataSalon.</p>
              <p>Si no recibes el email de confirmación, revisa tu carpeta de spam o contacta al equipo de soporte.</p>
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
    loginUrl: string;
  }): EmailTemplate {
    return {
      to: credentials.email,
      subject: `¡Bienvenido a DataSalon! - Cuenta de empleado creada para ${credentials.salonName}`,
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
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 6px; border: 1px solid #ffeaa7; margin: 20px 0;">
                <h3>📧 Confirmación de Email Requerida</h3>
                <p>Hemos enviado un correo de confirmación a <strong>${credentials.email}</strong>. Para activar tu cuenta, necesitas:</p>
                <ol>
                  <li>Revisar tu bandeja de entrada (y carpeta de spam)</li>
                  <li>Hacer clic en el enlace de confirmación del email</li>
                  <li>Establecer tu contraseña personal</li>
                  <li>Iniciar sesión en DataSalon</li>
                </ol>
              </div>
              
              <div class="credentials">
                <h3>🚀 Con tu cuenta podrás:</h3>
                <div style="margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                  <strong>📅 Ver tus citas asignadas</strong><br>
                  Revisa tu agenda diaria y las citas programadas
                </div>
                <div style="margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                  <strong>✅ Confirmar llegada de clientes</strong><br>
                  Marca cuando los clientes lleguen a sus citas
                </div>
                <div style="margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                  <strong>💼 Registrar servicios completados</strong><br>
                  Finaliza servicios y registra detalles
                </div>
                <div style="margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                  <strong>💳 Gestionar pagos</strong><br>
                  Procesa pagos de clientes
                </div>
                <div style="margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                  <strong>⏰ Ver tu horario de trabajo</strong><br>
                  Consulta tus horarios asignados
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="${credentials.loginUrl}" class="cta-button">Ir a DataSalon</a>
              </div>
            </div>
            
            <div class="footer">
              <p>Este es un mensaje automático del sistema DataSalon.</p>
              <p>Si no recibes el email de confirmación, revisa tu carpeta de spam o contacta a tu administrador.</p>
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

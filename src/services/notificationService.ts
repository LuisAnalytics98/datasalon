import { supabase } from '../config/supabase';
import { emailService } from './emailService';
import { Appointment, Notification } from '../types';

export const notificationService = {
  async scheduleAppointmentReminders(): Promise<void> {
    try {
      // Check if we're in development mode and skip if no real database
      if (import.meta.env.DEV) {
        console.log('Development mode: Skipping appointment reminders');
        return;
      }

      // Get appointments that are 8 hours away
      const now = new Date();
      const eightHoursFromNow = new Date(now.getTime() + 8 * 60 * 60 * 1000);
      
      // Format dates for database query
      const today = now.toISOString().split('T')[0];
      const tomorrow = eightHoursFromNow.toISOString().split('T')[0];
      
      // Get appointments that need reminders
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services:serviceId(*),
          employees:employeeId(*),
          clients:clientId(*),
          salons:salonId(*)
        `)
        .eq('status', 'confirmed')
        .gte('date', today)
        .lte('date', tomorrow)
        .eq('reminder_sent', false); // Only get appointments that haven't had reminders sent

      if (error) {
        console.error('Error fetching appointments for reminders:', error);
        return;
      }

      if (!appointments || appointments.length === 0) {
        console.log('No appointments need reminders at this time');
        return;
      }

      // Process each appointment
      for (const appointment of appointments) {
        await this.sendAppointmentReminder(appointment);
        
        // Mark reminder as sent
        await supabase
          .from('appointments')
          .update({ reminder_sent: true })
          .eq('id', appointment.id);
      }

      console.log(`Sent ${appointments.length} appointment reminders`);
    } catch (error) {
      console.error('Error scheduling appointment reminders:', error);
      // Don't throw error in development mode
      if (import.meta.env.PROD) {
        throw error;
      }
    }
  },

  async sendAppointmentReminder(appointment: any): Promise<void> {
    try {
      const clientEmail = appointment.clients?.email;
      if (!clientEmail) {
        console.warn(`No email found for client in appointment ${appointment.id}`);
        return;
      }

      // Send email reminder
      await emailService.sendAppointmentReminder(clientEmail, {
        clientName: `${appointment.clients?.firstName} ${appointment.clients?.lastName}`,
        salonName: appointment.salons?.name || 'Salón',
        serviceName: appointment.services?.name || 'Servicio',
        employeeName: `${appointment.employees?.firstName} ${appointment.employees?.lastName}`,
        date: new Date(appointment.date).toLocaleDateString('es-ES'),
        time: this.formatTime(appointment.startTime),
        confirmationUrl: `${window.location.origin}/appointments/${appointment.id}/confirm`
      });

      // Create in-app notification
      await this.createNotification({
        userId: appointment.clientId,
        title: 'Recordatorio de Cita',
        message: `Tienes una cita mañana a las ${this.formatTime(appointment.startTime)} para ${appointment.services?.name}`,
        type: 'reminder'
      });

    } catch (error) {
      console.error(`Error sending reminder for appointment ${appointment.id}:`, error);
    }
  },

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: notification.userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        is_read: notification.isRead
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      message: data.message,
      type: data.type,
      isRead: data.is_read,
      createdAt: data.created_at
    };
  },

  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(notification => ({
      id: notification.id,
      userId: notification.user_id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.is_read,
      createdAt: notification.created_at
    }));
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  },

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  },

  async sendAppointmentConfirmation(appointment: any): Promise<void> {
    try {
      const clientEmail = appointment.clients?.email;
      if (!clientEmail) return;

      // Send confirmation email
      await emailService.sendEmail({
        to: clientEmail,
        subject: `Confirmación de Cita - ${appointment.salons?.name}`,
        html: this.generateConfirmationEmailTemplate(appointment)
      });

      // Create in-app notification
      await this.createNotification({
        userId: appointment.clientId,
        title: 'Cita Confirmada',
        message: `Tu cita para ${appointment.services?.name} ha sido confirmada`,
        type: 'confirmation'
      });

    } catch (error) {
      console.error(`Error sending confirmation for appointment ${appointment.id}:`, error);
    }
  },

  async sendAppointmentCancellation(appointment: any): Promise<void> {
    try {
      const clientEmail = appointment.clients?.email;
      if (!clientEmail) return;

      // Send cancellation email
      await emailService.sendEmail({
        to: clientEmail,
        subject: `Cita Cancelada - ${appointment.salons?.name}`,
        html: this.generateCancellationEmailTemplate(appointment)
      });

      // Create in-app notification
      await this.createNotification({
        userId: appointment.clientId,
        title: 'Cita Cancelada',
        message: `Tu cita para ${appointment.services?.name} ha sido cancelada`,
        type: 'cancellation'
      });

    } catch (error) {
      console.error(`Error sending cancellation for appointment ${appointment.id}:`, error);
    }
  },

  formatTime(time: string): string {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  generateConfirmationEmailTemplate(appointment: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Cita</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #e91e63, #9c27b0); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e91e63; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #e91e63; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Cita Confirmada!</h1>
            <p>Tu cita ha sido confirmada exitosamente</p>
          </div>
          
          <div class="content">
            <h2>Hola ${appointment.clients?.firstName},</h2>
            <p>Tu cita ha sido confirmada en <strong>${appointment.salons?.name}</strong>.</p>
            
            <div class="appointment-details">
              <h3>📅 Detalles de tu Cita</h3>
              <div class="detail-row">
                <span class="label">Servicio:</span> ${appointment.services?.name}
              </div>
              <div class="detail-row">
                <span class="label">Profesional:</span> ${appointment.employees?.firstName} ${appointment.employees?.lastName}
              </div>
              <div class="detail-row">
                <span class="label">Fecha:</span> ${new Date(appointment.date).toLocaleDateString('es-ES')}
              </div>
              <div class="detail-row">
                <span class="label">Hora:</span> ${this.formatTime(appointment.startTime)}
              </div>
            </div>
            
            <p>Te esperamos en el salón. ¡Que tengas un excelente día!</p>
          </div>
          
          <div class="footer">
            <p>Este es un mensaje automático del sistema DataSalon.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  generateCancellationEmailTemplate(appointment: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cita Cancelada</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #dc3545; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Cita Cancelada</h1>
            <p>Tu cita ha sido cancelada</p>
          </div>
          
          <div class="content">
            <h2>Hola ${appointment.clients?.firstName},</h2>
            <p>Lamentamos informarte que tu cita en <strong>${appointment.salons?.name}</strong> ha sido cancelada.</p>
            
            <div class="appointment-details">
              <h3>📅 Detalles de la Cita Cancelada</h3>
              <div class="detail-row">
                <span class="label">Servicio:</span> ${appointment.services?.name}
              </div>
              <div class="detail-row">
                <span class="label">Profesional:</span> ${appointment.employees?.firstName} ${appointment.employees?.lastName}
              </div>
              <div class="detail-row">
                <span class="label">Fecha:</span> ${new Date(appointment.date).toLocaleDateString('es-ES')}
              </div>
              <div class="detail-row">
                <span class="label">Hora:</span> ${this.formatTime(appointment.startTime)}
              </div>
            </div>
            
            <p>Si tienes alguna pregunta o deseas reprogramar tu cita, por favor contacta al salón.</p>
          </div>
          
          <div class="footer">
            <p>Este es un mensaje automático del sistema DataSalon.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
};

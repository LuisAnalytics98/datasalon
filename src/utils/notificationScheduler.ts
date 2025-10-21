import { notificationService } from '../services/notificationService';

class NotificationScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) {
      console.log('Notification scheduler is already running');
      return;
    }

    console.log('Starting notification scheduler...');
    this.isRunning = true;

    // Run immediately
    this.runScheduledTasks();

    // Then run every hour
    this.intervalId = setInterval(() => {
      this.runScheduledTasks();
    }, 60 * 60 * 1000); // 1 hour
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Notification scheduler stopped');
  }

  private async runScheduledTasks() {
    try {
      console.log('Running scheduled notification tasks...');
      
      // Schedule appointment reminders (8 hours before)
      await notificationService.scheduleAppointmentReminders();
      
      console.log('Scheduled notification tasks completed');
    } catch (error) {
      console.error('Error running scheduled notification tasks:', error);
    }
  }

  // Method to manually trigger reminders (useful for testing)
  async triggerReminders() {
    try {
      console.log('Manually triggering appointment reminders...');
      await notificationService.scheduleAppointmentReminders();
      console.log('Manual reminder trigger completed');
    } catch (error) {
      console.error('Error manually triggering reminders:', error);
    }
  }
}

// Create a singleton instance
export const notificationScheduler = new NotificationScheduler();

// Auto-start the scheduler when the module is imported
if (typeof window !== 'undefined') {
  // Only start in browser environment
  notificationScheduler.start();
}

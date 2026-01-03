/**
 * Reminder-related types and interfaces
 * Used for notifications, reminders, and user preferences
 */

export interface Reminder {
  reminder_id: number;
  userId: number;
  reminderType: number;
  relatedRoomId: number;
  relatedEventId: number;
  reminderTime: string;
  isRead: boolean;
  title: string;
  message: string;
}

export interface ReminderPreferences {
  user_id?: number;
  id?: number;
  eventReminder: boolean;
  bookingReminder: boolean;
  reminderAdvanceMinutes: string; // TimeSpan as string from API
}

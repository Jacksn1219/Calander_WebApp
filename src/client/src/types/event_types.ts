/**
 * Event-related types and interfaces
 * Used for calendar events, event management, and event participation
 */

export interface CalendarParticipant {
  userId: number;
  name: string;
  email: string;
  status: 'Pending' | 'Accepted' | 'Declined';
}

export interface CalendarEvent {
  eventId: number;
  title: string;
  description?: string;
  eventDate: Date; // start
  endTime: Date;  // end
  location?: string;
  bookingId?: number;
  createdBy: number;
  participants: CalendarParticipant[];
}

export interface EventItem {
  event_id: number;
  title: string;
  description: string;
  eventDate: string; // start date-time ISO
  endTime: string;   // end date-time ISO
  location?: string | null;
  roomId?: number;
  bookingId?: number | null;
  createdBy: number;
  expectedAttendees: number | null;
}

/**
 * Room-related types and interfaces
 * Used for room management, bookings, and room data
 */

export interface RoomDto {
  room_id: number;
  roomName: string;
  capacity?: number | null;
  location: string;
}

export interface RoomFormState {
  id?: number | null;
  roomName: string;
  location: string;
  capacity: string;
}

export type RoomBookingSummary = {
  id: number;
  roomName: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  bookingDate: string; // ISO string (optional)
  purpose: string; // optional
};

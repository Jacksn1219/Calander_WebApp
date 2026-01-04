import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from '../config/api';
import { RoomBookingSummary } from '../types/room_types';

export const useUserRoomBookings = (userId?: number) => {
  const [bookings, setBookings] = useState<RoomBookingSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setBookings([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch(`/api/room-bookings/user/${userId}`);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to load room bookings');
      }

      const data = await response.json();

      // Fetch room details for each booking if roomId is defined
      const mapped: RoomBookingSummary[] = await Promise.all((data || []).map(async (b: any) => {
        const bookingDateRaw: string  = b.bookingDate ?? b.bookingDateUtc ?? b.bookingDateLocal;
        const startTimeRaw: string  = b.startTime;
        const endTimeRaw: string  = b.endTime;

        const buildDateTime = (date: string, time: string): string => {
          if (!date || !time) return '2000-01-01T00:00:00Z'; // Fallback
          const datePart = date.split('T')[0];
          return `${datePart}T${time}`;
        };

        let roomName = "TEST";
        if (b.roomId !== undefined && b.roomId !== null) {
          try {
            const resp = await apiFetch(`/api/rooms/${b.roomId}`);
            if (resp.ok) {
              const roomData = await resp.json();
              if (roomData && (roomData.roomName || roomData.name)) {
                roomName = roomData.roomName || roomData.name;
              }
            }
          } catch (e) {
            // ignore room fetch error, fallback to existing roomName
          }
        }

        return {
          id: b.id ?? b.roomBookingId ?? 0,
          roomName,
          startTime: buildDateTime(bookingDateRaw, startTimeRaw),
          endTime: buildDateTime(bookingDateRaw, endTimeRaw),
          bookingDate: bookingDateRaw || '',
          purpose: b.purpose ?? '',
        };
      }));

      setBookings(mapped);
    } catch (err: any) {
      console.error('Error loading room bookings', err);
      setError(err.message ?? 'Failed to load room bookings');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { bookings, loading, error, reload: load };
};

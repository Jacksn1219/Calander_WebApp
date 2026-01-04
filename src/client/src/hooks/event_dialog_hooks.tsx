import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiFetch } from '../config/api';
import { RoomDto } from '../types/room_types';  

/**
 ====================================
EVENT DIALOG & CALENDAR HOOKS
  ====================================
*/

/**
 Custom hook for event dialog state and actions
 */
export const useEventDialog = (events: any[], onStatusChange?: () => void, onClose?: () => void) => {
  const [selectedEvent, setSelectedEvent] = useState<any | null>(events.length === 1 ? events[0] : null);
  const [userParticipationStatus, setUserParticipationStatus] = useState<string>('not-registered');
  const [roomDetails, setRoomDetails] = useState<RoomDto | null>(null);
  const { user } = useAuth();


  // Fetch room details when selectedEvent has a bookingId
  useEffect(() => {
    if (!selectedEvent?.bookingId) {
      setRoomDetails(null);
      return;
    }

    const fetchRoomDetails = async () => {
      try {
        // First fetch the booking to get the roomId
        const bookingResponse = await apiFetch(`/api/room-bookings/${selectedEvent.bookingId}`);
        if (bookingResponse.ok) {
          const bookingData = await bookingResponse.json();
          const roomId = bookingData.roomId ?? bookingData.RoomId ?? bookingData.room_id;
          
          if (roomId) {
            // Then fetch the room details using the roomId
            const roomResponse = await apiFetch(`/api/rooms/${roomId}`);
            if (roomResponse.ok) {
              const room: RoomDto = await roomResponse.json();
              setRoomDetails(room);
            }
          }
        }
      } catch (error) {
        console.error(`Failed to fetch room for booking ${selectedEvent.bookingId}:`, error);
        setRoomDetails(null);
      }
    };

    fetchRoomDetails();
  }, [selectedEvent?.bookingId]);

  // keep participation status in sync with the selected event
  useEffect(() => {
    if (!selectedEvent || !user?.userId) {
      setUserParticipationStatus('not-registered');
      return;
    }
    const me = (selectedEvent.participants || []).find((p: any) => p.userId === user.userId);
    // Status is already normalized to string 'Accepted', 'Pending', or 'Declined' from the fetch
    if (me && me.status === 'Accepted') {
      setUserParticipationStatus('accepted');
    } else {
      setUserParticipationStatus('not-registered');
    }
  }, [selectedEvent, user?.userId]);

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const handleAttend = useCallback(async (eventId: number) => {
    if (!user?.userId || !user?.name) return;
    try {
      const res = await apiFetch('/api/event-participation', {
        method: 'POST',
        body: JSON.stringify({ eventId, userId: user.userId, status: 1 }),
      });
      if (!res.ok) throw new Error('Failed to register for event');

      const newParticipant = {
        userId: user.userId,
        name: user.name,
        email: (user as any).email ?? '',
        status: 'Accepted',
      };

      setSelectedEvent((prev: any) => {
        if (!prev) return prev;
        const exists = (prev.participants || []).some((p: any) => p.userId === user.userId);
        const participants = exists
          ? prev.participants.map((p: any) => p.userId === user.userId ? { ...p, status: 'Accepted' } : p)
          : [...(prev.participants || []), newParticipant];
        return { ...prev, participants };
      });

      const idx = events.findIndex((e: any) => (e.eventId ?? e.EventId) === eventId);
      if (idx >= 0) {
        const target = events[idx];
        const exists = (target.participants || []).some((p: any) => p.userId === user.userId);
        if (exists) {
          target.participants = target.participants.map((p: any) => p.userId === user.userId ? { ...p, status: 'Accepted' } : p);
        } else {
          target.participants = [...(target.participants || []), newParticipant];
        }
      }

      setUserParticipationStatus('accepted');
      onStatusChange?.();
      alert('You have successfully registered for this event.');
      if (onClose) onClose();
    } catch (e) {
      console.error(e);
      alert('Unable to register for this event. Please try again.');
      if (onClose) onClose();
    }
  }, [events, user, onClose, onStatusChange]);

  const handleUnattend = useCallback(async (eventId: number) => {
    if (!user?.userId) return;
    try {
      const res = await apiFetch('/api/event-participation', {
        method: 'DELETE',
        body: JSON.stringify({ eventId, userId: user.userId }),
      });
      if (!res.ok) throw new Error('Failed to unregister from event');

      setSelectedEvent((prev: any) => {
        if (!prev) return prev;
        const participants = (prev.participants || []).filter((p: any) => p.userId !== user.userId);
        return { ...prev, participants };
      });

      const idx = events.findIndex((e: any) => (e.eventId ?? e.EventId) === eventId);
      if (idx >= 0) {
        const target = events[idx];
        target.participants = (target.participants || []).filter((p: any) => p.userId !== user.userId);
      }

      setUserParticipationStatus('not-registered');
      onStatusChange?.();
      alert('Your registration has been cancelled.');
      if (onClose) onClose();
    } catch (e) {
      console.error(e);
      alert('Unable to cancel your registration. Please try again.');
      if (onClose) onClose();
    }
  }, [events, user, onClose, onStatusChange]);

  return {
    selectedEvent,
    setSelectedEvent,
    userParticipationStatus,
    roomDetails,
    formatDate,
    formatTime,
    handleAttend,
    handleUnattend,
  };
};

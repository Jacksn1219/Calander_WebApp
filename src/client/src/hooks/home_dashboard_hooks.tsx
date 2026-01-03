import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiFetch } from '../config/api';
import { useCalendarEvents } from './calendar_hooks';
import { useUserRoomBookings } from './room_bookings_hooks';
import { RoomDto } from './../types/room_types';
import { CalendarEvent } from './../types/event_types';



// _________________________________________
// functions home
// _________________________________________

export const useHomeDashboard = () => {
  const { user } = useAuth();

  const { loading, error, events, reload, getEventsForDate } = useCalendarEvents(user);

  const {
    bookings: roomBookings,
    loading: roomBookingsLoading,
    error: roomBookingsError,
  } = useUserRoomBookings(user?.userId);

  const [roomsById, setRoomsById] = useState<Record<number, RoomDto>>({});

  const { upcomingEvents, totalEvents, acceptedEventsForUser, weekEventsAttending } = useMemo(() => {
    const now = new Date();
    const sorted = [...events].sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
    let acceptedForUser = 0;

    sorted.forEach(ev => {
      if (user?.userId) {
        const me = ev.participants.find(p => p.userId === user.userId);
        if (me && me.status === 'Accepted') {
          acceptedForUser += 1;
        }
      }
    });

    // Only show events attended by the user for the week calendar
    const weekEventsAttending = sorted.filter(ev => {
      if (ev.eventDate < now) return false;
      if (!user?.userId) return false;
      const me = ev.participants.find(p => p.userId === user.userId);
      return me && me.status === 'Accepted';
    });

    // Filter to show only upcoming events that the user hasn't attended yet
    const upcoming = sorted.filter(ev => {
      if (ev.eventDate < now) return false;
      if (!user?.userId) return false; // Don't show any events if user not loaded
      const me = ev.participants.find(p => p.userId === user.userId);
      return !me || me.status !== 'Accepted';
    });

    return {
      upcomingEvents: upcoming,
      totalEvents: events.length,
      acceptedEventsForUser: acceptedForUser,
      weekEventsAttending,
    };
  }, [events, user?.userId]);

  // Fetch room details for events with bookingID
  useEffect(() => {
    const bookingIds = Array.from(new Set(upcomingEvents.map(ev => ev.bookingId).filter((id): id is number => id != null)));
    
    bookingIds.forEach(async (bookingId) => {
      if (!roomsById[bookingId]) {
        try {
          // First fetch the booking to get the roomId
          const bookingResponse = await apiFetch(`/api/room-bookings/${bookingId}`);
          if (bookingResponse.ok) {
            const bookingData = await bookingResponse.json();
            const roomId = bookingData.roomId ?? bookingData.RoomId ?? bookingData.room_id;
            
            if (roomId) {
              // Then fetch the room details using the roomId
              const roomResponse = await apiFetch(`/api/rooms/${roomId}`);
              if (roomResponse.ok) {
                const room: RoomDto = await roomResponse.json();
                // Store using bookingId as key so we can look it up by ev.bookingId
                setRoomsById(prev => ({ ...prev, [bookingId]: room }));
              }
            }
          }
        } catch (error) {
           console.error(`Failed to fetch room for booking ${bookingId}:`, error);
        }
      }
    });
  }, [upcomingEvents, roomsById]);

  const attendanceRate = totalEvents > 0
    ? Math.round((acceptedEventsForUser / totalEvents) * 100)
    : 0;

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    const dayOfWeek = base.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;
    base.setDate(base.getDate() - diffToMonday);
    return base;
  });

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[] | null>(null);
  const [selectedDateForDialog, setSelectedDateForDialog] = useState<Date | null>(null);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedDayEvents([event]);
    setSelectedDateForDialog(event.eventDate);
    setSelectedEvent(event);
  };

  const handleDayClick = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length === 0) return;
    setSelectedDayEvents(dayEvents);
    setSelectedDateForDialog(date);
    setSelectedEvent(dayEvents[0]);
  };

  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;
    today.setDate(today.getDate() - diffToMonday);
    setCurrentWeekStart(today);
  };

  const closeDialog = () => {
    setSelectedEvent(null);
    setSelectedDayEvents(null);
    setSelectedDateForDialog(null);
  };

  const handleAttend = useCallback(async (eventId: number) => {
    if (!user?.userId || !user?.name) return;
    try {
      const res = await apiFetch('/api/event-participation', {
        method: 'POST',
        body: JSON.stringify({ eventId, userId: user.userId, status: 1 }),
      });
      if (!res.ok) throw new Error('Failed to register for event');

      // Reload events to refresh the list
      await reload();
      alert('You have successfully registered for this event.');
    } catch (e) {
      console.error(e);
      alert('Unable to register for this event. Please try again.');
    }
  }, [user, reload]);

  return {
    user,
    loading,
    error,
    events,
    reload,
    upcomingEvents,
    attendanceRate,
    currentWeekStart,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    handleEventClick,
    handleDayClick,
    selectedEvent,
    selectedDayEvents,
    selectedDateForDialog,
    closeDialog,
    roomBookings,
    roomBookingsLoading,
    roomBookingsError,
    handleAttend,
    roomsById,
    weekEventsAttending,
  };
};



import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiFetch } from '../config/api';
import { 
  MONTH_NAMES, 
  WEEKDAY_LABELS, 
  ESTIMATED_EVENT_CARD_HEIGHT, 
  MIN_UPCOMING_EVENTS, 
  DEFAULT_UPCOMING_EVENTS 
} from '../constants/calendar_constants';
import { RoomDto } from '../types/room_types';
import { CalendarEvent, CalendarParticipant } from '../types/event_types';

interface CalendarDayCell {
  key: string;
  isEmpty: boolean;
  dayNumber?: number;
  date?: Date;
  isToday?: boolean;
  hasEvents?: boolean;
  eventCount?: number;
  isPast?: boolean;
}

interface UpcomingEventSummary {
  eventId: number;
  date: Date;
  day: number;
  monthAbbrev: string;
  title: string;
  description?: string;
  timeLabel: string;
  acceptedCount: number;
  location?: string;
  bookingId?: number;
  roomName?: string;
  roomLocation?: string;
}

/*
 ====================================
CALENDAR HOOKS
 ====================================
 */

/**
 * Custom hook for calendar navigation and date selection
 */
export const useCalendar = () => {
  const { user } = useAuth();
  const { loading, error, events: roleScopedEvents, getEventsForDate, reload } = useCalendarEvents(user);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateSource, setSelectedDateSource] = useState<'calendar' | 'upcoming'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [listMonthOffset, setListMonthOffset] = useState(0);
  const [eventPage, setEventPage] = useState(0);
  const [maxUpcomingEvents, setMaxUpcomingEvents] = useState(DEFAULT_UPCOMING_EVENTS);
   const [roomsById, setRoomsById] = useState<Record<number, RoomDto>>({});

  const calendarGridRef = useRef<HTMLDivElement>(null);
  const upcomingHeaderRef = useRef<HTMLDivElement>(null);

  const isAcceptedByUser = useCallback((event: any): boolean => {
    const userId = user?.userId;
    if (!userId) return false;
    const participants = event?.participants ?? [];
    return participants.some((p: any) => {
      if (p.userId !== userId) return false;
      const status = typeof p.status === 'string' ? p.status.toLowerCase() : p.status;
      return status === 'accepted' || status === 1;
    });
  }, [user?.userId]);

  const timeFormatter = useMemo(() => new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  }), []);

  const normalizedCurrentMonth = useMemo(() => (
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  ), [currentMonth]);
  const normalizedCurrentMonthKey = `${normalizedCurrentMonth.getFullYear()}-${normalizedCurrentMonth.getMonth()}`;

  useEffect(() => {
    setListMonthOffset(0);
    setEventPage(0);
  }, [normalizedCurrentMonthKey]);

  useEffect(() => {
    setEventPage(0);
  }, [listMonthOffset]);

  const listMonth = useMemo(() => {
    const month = new Date(normalizedCurrentMonth);
    month.setMonth(month.getMonth() + listMonthOffset);
    return month;
  }, [normalizedCurrentMonth, listMonthOffset]);

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  // ResizeObserver to dynamically calculate max events based on calendar height
  useEffect(() => {
    const calendarGrid = calendarGridRef.current;
    const upcomingHeader = upcomingHeaderRef.current;

    if (!calendarGrid || !upcomingHeader) return;

    const observer = new ResizeObserver(() => {
      const calendarHeight = calendarGrid.offsetHeight;
      const headerHeight = upcomingHeader.offsetHeight;
      const availableHeight = calendarHeight - headerHeight;

      // Calculate how many events can fit
      const calculatedMax = Math.max(
        MIN_UPCOMING_EVENTS,
        Math.floor(availableHeight / ESTIMATED_EVENT_CARD_HEIGHT)
      );

      setMaxUpcomingEvents(calculatedMax);
    });

    observer.observe(calendarGrid);
    observer.observe(upcomingHeader);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Reset page when maxUpcomingEvents changes
  useEffect(() => {
    setEventPage(0);
  }, [maxUpcomingEvents]);

  const calendarMonthLabel = useMemo(() => (
    `${MONTH_NAMES[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`
  ), [currentMonth]);

  const calendarDays = useMemo<CalendarDayCell[]>(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    const startOffset = firstDay.getDay();
    const cells: CalendarDayCell[] = [];

    for (let i = 0; i < startOffset; i++) {
      cells.push({ key: `empty-${i}`, isEmpty: true });
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      const dayEvents = getEventsForDate(date).filter(isAcceptedByUser);
      cells.push({
        key: `day-${day}`,
        isEmpty: false,
        dayNumber: day,
        date,
        isPast: date.getTime() < today.getTime(),
        isToday: date.getTime() === today.getTime(),
        hasEvents: dayEvents.length > 0,
        eventCount: dayEvents.length
      });
    }

    return cells;
  }, [currentMonth, getEventsForDate, isAcceptedByUser, today]);

  const monthlyEvents = useMemo(() => {
    const monthStart = new Date(listMonth.getFullYear(), listMonth.getMonth(), 1);
    return roleScopedEvents
      .filter(event => {
        const eventDate = new Date(event.eventDate);
        const normalizedEventDate = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        const matchesMonth = eventDate.getMonth() === monthStart.getMonth() && eventDate.getFullYear() === monthStart.getFullYear();
        const isFuture = normalizedEventDate >= today;
        const notAlreadyAccepted = !isAcceptedByUser(event);
        return matchesMonth && isFuture && notAlreadyAccepted;
      })
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }, [roleScopedEvents, listMonth, isAcceptedByUser, today]);

  useEffect(() => {
    const totalPages = Math.ceil(monthlyEvents.length / maxUpcomingEvents);
    if (eventPage > 0 && eventPage >= totalPages) {
      setEventPage(totalPages > 0 ? totalPages - 1 : 0);
    }
  }, [monthlyEvents.length, eventPage, maxUpcomingEvents]);

  const pagedEvents = useMemo(() => {
    const start = eventPage * maxUpcomingEvents;
    return monthlyEvents.slice(start, start + maxUpcomingEvents);
  }, [monthlyEvents, eventPage, maxUpcomingEvents]);

  // Fetch room details for events with bookingId
  useEffect(() => {
    const bookingIds = Array.from(new Set(monthlyEvents.map(ev => ev.bookingId).filter((id): id is number => id != null)));
    
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
  }, [monthlyEvents, roomsById]);

  const upcomingEvents = useMemo<UpcomingEventSummary[]>(() => {
    return pagedEvents.map(event => {
      const eventDate = new Date(event.eventDate);
      const acceptedCount = event.participants.filter(p => p.status === 'Accepted').length;
      const room = event.bookingId ? roomsById[event.bookingId] : undefined;

      return {
        eventId: event.eventId,
        date: eventDate,
        day: eventDate.getDate(),
        monthAbbrev: MONTH_NAMES[eventDate.getMonth()].slice(0, 3),
        title: event.title,
        description: event.description,
        timeLabel: timeFormatter.format(eventDate),
        acceptedCount,
        location: event.location,
        bookingId: event.bookingId,
        roomName: room?.roomName,
        roomLocation: room?.location,
      };
    });
  }, [pagedEvents, timeFormatter, isAcceptedByUser, roomsById]);

  const listMonthLabel = useMemo(() => (
    `${MONTH_NAMES[listMonth.getMonth()]} ${listMonth.getFullYear()}`
  ), [listMonth]);

  const hasFutureMonths = useMemo(() => {
    const monthEnd = new Date(listMonth.getFullYear(), listMonth.getMonth() + 1, 0, 23, 59, 59, 999);
    return roleScopedEvents.some(event => {
      const eventDate = new Date(event.eventDate);
      const normalizedEventDate = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      return normalizedEventDate >= today && eventDate > monthEnd;
    });
  }, [roleScopedEvents, listMonth, today]);

  const hasNextEventPage = monthlyEvents.length > (eventPage + 1) * maxUpcomingEvents;
  const hasPrevEventPage = eventPage > 0;
  const canGoBackInList = hasPrevEventPage || listMonthOffset > 0;
  const canGoForwardInList = hasNextEventPage || hasFutureMonths;

  const handlePreviousMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleToday = useCallback(() => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  }, []);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedDateSource('calendar');
  }, []);

  const handleCloseDialog = useCallback(() => {
    setSelectedDate(null);
  }, []);

  const handlePreviousListMonth = useCallback(() => {
    if (eventPage > 0) {
      setEventPage(prev => Math.max(prev - 1, 0));
    } else if (listMonthOffset > 0) {
      setListMonthOffset(prev => (prev > 0 ? prev - 1 : 0));
    }
  }, [eventPage, listMonthOffset]);

  const handleNextListMonth = useCallback(() => {
    if (hasNextEventPage) {
      setEventPage(prev => prev + 1);
    } else if (hasFutureMonths) {
      setListMonthOffset(prev => prev + 1);
    }
  }, [hasNextEventPage, hasFutureMonths]);

  const handleUpcomingEventClick = useCallback((eventDate: Date) => {
    const monthStart = new Date(eventDate.getFullYear(), eventDate.getMonth(), 1);
    setCurrentMonth(monthStart);
    setSelectedDate(new Date(eventDate));
    setSelectedDateSource('upcoming');
  }, []);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const eventsForDay = getEventsForDate(selectedDate);
    if (selectedDateSource === 'calendar') {
      return eventsForDay.filter(isAcceptedByUser);
    }
    return eventsForDay;
  }, [selectedDate, selectedDateSource, getEventsForDate, isAcceptedByUser]);

  return {
    loading,
    error,
    reload,
    weekdays: WEEKDAY_LABELS,
    calendarMonthLabel,
    calendarDays,
    goToPreviousMonth: handlePreviousMonth,
    goToNextMonth: handleNextMonth,
    goToToday: handleToday,
    onDaySelect: handleSelectDate,
    selectedDate,
    selectedDateEvents,
    closeDialog: handleCloseDialog,
    upcomingLabel: listMonthLabel,
    upcomingEvents,
    hasUpcomingEvents: monthlyEvents.length > 0,
    canGoBackUpcoming: canGoBackInList,
    canGoForwardUpcoming: canGoForwardInList,
    onUpcomingBack: handlePreviousListMonth,
    onUpcomingForward: handleNextListMonth,
    onUpcomingEventSelect: handleUpcomingEventClick,
    calendarGridRef,
    upcomingHeaderRef,
  };
};

/*
  Custom hook for fetching and managing calendar events
 */
export const useCalendarEvents = (user: { userId?: number; role?: string } | null) => {
  const isAdmin = user?.role === 'Admin';
  const [rawEvents, setRawEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventsRes, participationRes, employeesRes] = await Promise.all([
        apiFetch('/api/events'),
        apiFetch('/api/event-participation'),
        apiFetch('/api/employees')
      ]);

      if (!eventsRes.ok) throw new Error('Failed to load events');
      if (!participationRes.ok) throw new Error('Failed to load participations');
      if (!employeesRes.ok) throw new Error('Failed to load employees');

      const eventsJson = await eventsRes.json();
      const participationsJson = await participationRes.json();
      const employeesJson = await employeesRes.json();

      const employeeMap: Record<number, { name: string; email: string }> = {};
      employeesJson.forEach((emp: any) => {
        const id: number = emp.user_id ?? emp.Id ?? emp.id;
        if (id != null) {
          employeeMap[id] = { name: emp.Name ?? emp.name ?? '', email: emp.Email ?? emp.email ?? '' };
        }
      });

      const participationByEvent: Record<number, CalendarParticipant[]> = {};
      participationsJson.forEach((p: any) => {
        const eventId: number = p.EventId ?? p.event_id ?? p.eventId;
        const userId: number = p.UserId ?? p.user_id ?? p.userId;
        if (eventId == null || userId == null) return;

        const rawStatus = p.Status ?? p.status; // may be number (enum) or string
        let status: CalendarParticipant['status'];
        if (typeof rawStatus === 'number') {
          status = ['Pending','Accepted','Declined'][rawStatus] as CalendarParticipant['status'] || 'Pending';
        } else if (typeof rawStatus === 'string') {
          const lower = rawStatus.toLowerCase();
          if (lower === 'accepted') status = 'Accepted';
          else if (lower === 'declined') status = 'Declined';
          else status = 'Pending';
        } else {
          status = 'Pending';
        }

        const emp = employeeMap[userId];
        const participant: CalendarParticipant = {
          userId,
          name: emp?.name ?? `User ${userId}`,
          email: emp?.email ?? '',
          status
        };
        if (!participationByEvent[eventId]) participationByEvent[eventId] = [];
        participationByEvent[eventId].push(participant);
      });

      const transformed: CalendarEvent[] = eventsJson.map((ev: any) => {
        const id: number = ev.event_id ?? ev.EventId ?? ev.Id ?? ev.eventId;
        const createdBy: number = ev.CreatedBy ?? ev.created_by ?? ev.createdBy;
        const eventDateString: string = ev.EventDate ?? ev.event_date ?? ev.eventDate;
        const endDateString: string = ev.EndTime ?? ev.end_time ?? ev.endTime ?? '';
        const startDate = eventDateString ? new Date(eventDateString) : new Date();
        const fallbackDuration = ev.DurationMinutes ?? ev.duration_minutes ?? ev.durationMinutes ?? 60;
        const computedEnd = endDateString ? new Date(endDateString) : new Date(startDate.getTime() + fallbackDuration * 60000);
        const bookingId: number | undefined = ev.BookingId ?? ev.booking_id ?? ev.bookingId ?? undefined;
        const location: string | undefined = ev.Location ?? ev.location ?? undefined;
        return {
          eventId: id,
          title: ev.Title ?? ev.title ?? 'Untitled Event',
          description: ev.Description ?? ev.description ?? undefined,
          eventDate: startDate,
          endTime: computedEnd,
          location,
          bookingId,
          createdBy,
          participants: participationByEvent[id] ?? []
        };
      });

      setRawEvents(transformed);
    } catch (e: any) {
      setError(e.message || 'Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Clear previous events on user change to avoid stale visibility
    setRawEvents([]);
    fetchAll();
  }, [fetchAll, user?.userId, user?.role]);

  // All users (including non-admin) now see all events.
  const scopedEvents = rawEvents;

  const getEventsForDate = useCallback((date: Date): CalendarEvent[] => {
    return scopedEvents.filter(event => {
      const eventDate = new Date(event.eventDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  }, [scopedEvents]);

  return {
    loading,
    error,
    rawEvents,
    events: scopedEvents,
    getEventsForDate,
    reload: fetchAll,
  };
};

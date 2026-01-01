import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../states/AuthContext';
import { apiFetch } from '../config/api';
import { isSuperAdmin } from '../constants/superAdmin';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Conservative estimate for event card height: date badge + title + time + description (2 lines) + attending + padding
const ESTIMATED_EVENT_CARD_HEIGHT = 115;
const MIN_UPCOMING_EVENTS = 1;
const DEFAULT_UPCOMING_EVENTS = 3;

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
}


/*
 ====================================
LOGIN FORM HOOKS
 ====================================
 */

/*
 Custom hook for form validation and error handling
 */
export const useFormValidation = () => {
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const validateEmail = useCallback((email: string): boolean => {
    if (!email) {
      setError('Email is required.');
      return false;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Enter a valid email address.');
      return false;
    }
    return true;
  }, []);

  const validatePassword = useCallback((password: string, minLength: number = 8): boolean => {
    if (!password) {
      setError('Password is required.');
      return false;
    }
    if (password.length < minLength) {
      setError(`Password must be at least ${minLength} characters long.`);
      return false;
    }
    return true;
  }, []);

  const validatePasswordMatch = useCallback((password: string, confirmPassword: string): boolean => {
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  }, []);

  const validateRequired = useCallback((fields: Record<string, any>, fieldNames?: string[]): boolean => {
    const fieldsToCheck = fieldNames || Object.keys(fields);
    const emptyFields = fieldsToCheck.filter(key => !fields[key]);
    
    if (emptyFields.length > 0) {
      setError('All fields are required.');
      return false;
    }
    return true;
  }, []);

  return {
    error,
    setError,
    clearError,
    validateEmail,
    validatePassword,
    validatePasswordMatch,
    validateRequired,
  };
};

/*
 Custom hook for password visibility toggle
 */
export const usePasswordVisibility = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return {
    showPassword,
    setShowPassword,
    togglePasswordVisibility,
  };
};

/*
 Custom hook for login form logic
 */
export const useLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { error, setError, validateEmail, validatePassword, clearError } = useFormValidation();
  const { showPassword, togglePasswordVisibility } = usePasswordVisibility();
  const navigate = useNavigate();
  const { login } = useAuth();

  const validate = useCallback((): boolean => {
    clearError();
    if (!email || !password) {
      setError('Email and password are required.');
      return false;
    }
    if (!validateEmail(email)) {
      return false;
    }
    return true;
  }, [email, password, validateEmail, clearError, setError]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Login failed');
      }

      const data = await response.json();
      // Expected format : { token: string, user: { userId, name, email, role } }
      const token: string | undefined = data.token || data.Token; 
      const user = data.user;

      if (!token || !user) {
        throw new Error('Malformed login response');
      }

      const superAdminFlag = isSuperAdmin(user.email, password);

      // Persist token & user via context
      login({
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        isSuperAdmin: superAdminFlag,
      }, token);

      navigate('/home');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message ?? 'Unexpected error during login');
    } finally {
      setLoading(false);
    }
  }, [email, password, validate, login, navigate, setError]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    showPassword,
    togglePasswordVisibility,
    handleSubmit,
  };
};

// --- Room bookings ---

export type RoomBookingSummary = {
  id: number;
  roomName: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  bookingDate: string; // ISO string (optional)
  purpose: string; // optional
};

export type RoomToFindName = {
  id: number;
  name: string;
  location: string;
  capacity: number;
};


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

/*
 ====================================
CREATE EMPLOYEE FORM HOOKS
 ====================================
 */
/*
Custom hook for create employee form logic
 */
export const useCreateEmployeeForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRoleState] = useState<string>('User');
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { error, setError, validateEmail, validatePassword, validatePasswordMatch, validateRequired, clearError } = useFormValidation();
  const { showPassword, togglePasswordVisibility } = usePasswordVisibility();
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const canAssignAdminRole = Boolean(user?.isSuperAdmin);

  useEffect(() => {
    if (!canAssignAdminRole) {
      setRoleState('User');
    }
  }, [canAssignAdminRole]);

  const setRole = useCallback((newRole: string) => {
    if (!canAssignAdminRole && newRole !== 'User') {
      setRoleState('User');
      return;
    }
    setRoleState(newRole);
  }, [canAssignAdminRole]);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const resetForm = useCallback(() => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setRoleState('User');
  }, []);

  const validate = useCallback((): boolean => {
    clearError();
    setSuccess(null);
    
    if (!validateRequired({ name, email, password, confirmPassword })) {
      return false;
    }
    
    if (!validateEmail(email)) {
      return false;
    }

    if (!validatePassword(password, 8)) {
      return false;
    }

    if (!validatePasswordMatch(password, confirmPassword)) {
      return false;
    }

    return true;
  }, [name, email, password, confirmPassword, validateRequired, validateEmail, validatePassword, validatePasswordMatch, clearError]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await apiFetch('/api/employees', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role })
      });

      const rawBody = await response.text();
      let data: any = null;

      if (rawBody) {
        try {
          data = JSON.parse(rawBody);
        } catch {
          data = rawBody;
        }
      }

      if (!response.ok) {
        const extractErrorMessage = (payload: any): string | null => {
          if (!payload) {
            return null;
          }

          if (typeof payload === 'string') {
            return payload;
          }

          if (Array.isArray(payload)) {
            return payload.filter(Boolean).join('\n');
          }

          if (typeof payload === 'object') {
            if (payload.message || payload.error || payload.title || payload.detail) {
              return payload.message || payload.error || payload.title || payload.detail;
            }

            if (payload.errors && typeof payload.errors === 'object') {
              const firstKey = Object.keys(payload.errors)[0];
              if (firstKey) {
                const firstError = payload.errors[firstKey];
                if (Array.isArray(firstError)) {
                  return firstError.filter(Boolean).join('\n');
                }
                if (typeof firstError === 'string') {
                  return firstError;
                }
              }
            }
          }

          return null;
        };

        const message = extractErrorMessage(data) ?? 'Failed to create employee.';
        throw new Error(message);
      }

      setSuccess('Employee created successfully.');
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create employee. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [name, email, password, role, validate, setError, resetForm]);

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    role,
    setRole,
    canAssignAdminRole,
    error,
    success,
    loading,
    showPassword,
    togglePasswordVisibility,
    showConfirmPassword,
    toggleConfirmPasswordVisibility,
    handleSubmit,
  };
};

/*
 ====================================
SIDEBAR HOOKS
 ====================================
 */
/*
 Custom hook for sidebar logic
 */
export const useSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      logout();
      navigate('/login');
    }
  }, [logout, navigate]);

  useEffect(() => {
    document.body.classList.toggle('sidebar-collapsed', isCollapsed);
  }, [isCollapsed]);

  return {
    isCollapsed,
    toggleSidebar,
    handleLogout,
  };
};


/*
 ====================================
LOGOUT HOOKS
 ====================================
 */

/**
 * Custom hook for logout confirmation with navigation
 */
export const useLogoutWithConfirmation = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = useCallback(() => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      logout();
      navigate('/login');
    }
  }, [logout, navigate]);

  return handleLogout;
};

/**
 ====================================
EVENT DIALOG & CALENDAR HOOKS
  ====================================
*/

/**
 Custom hook for event dialog state and actions
 */
export const useEventDialog = (events: any[], onStatusChange?: () => void,onClose?: () => void) => {
  const [selectedEvent, setSelectedEvent] = useState<any | null>(events.length === 1 ? events[0] : null);
  const [userParticipationStatus, setUserParticipationStatus] = useState<string>('not-registered');
  const { user } = useAuth();

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
  }, [events, user, onClose]);

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
  }, [events, user, onClose]);

  return {
    selectedEvent,
    setSelectedEvent,
    userParticipationStatus,
    formatDate,
    formatTime,
    handleAttend,
    handleUnattend,
  };
};

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

  const upcomingEvents = useMemo<UpcomingEventSummary[]>(() => {
    return pagedEvents.map(event => {
      const eventDate = new Date(event.eventDate);
      const acceptedCount = event.participants.filter(p => p.status === 'Accepted').length;
      return {
        eventId: event.eventId,
        date: eventDate,
        day: eventDate.getDate(),
        monthAbbrev: MONTH_NAMES[eventDate.getMonth()].slice(0, 3),
        title: event.title,
        description: event.description,
        timeLabel: timeFormatter.format(eventDate),
        acceptedCount,
      };
    });
  }, [pagedEvents, timeFormatter, isAcceptedByUser]);

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

export interface Employee {
  user_id: number;
  name: string;
  email: string;
}


/*
 ====================================
ADMINISTRATIVE DASHBOARD HOOKS
 ====================================
 */
export const  useAdministrativeDashboard = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [currentEvent, setEvent] = useState<EventItem>();
  const [usernames, setUsernames] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await apiFetch("/api/events");
      if (!response.ok) throw new Error("Failed to fetch events");
      const data: EventItem[] = await response.json();

      setEvents(data);

      for (const e of data) {
        loadUsername(Number(e.createdBy));
      }

    } catch (err) {
      console.error("Fetching events failed:", err);
      setEvents([]);
    }
  };

  const loadUsername = async (id: number) => {
    if (usernames[id]) return;

    try {
      const response = await apiFetch(`/api/employees/${id}`);
      if (!response.ok) throw new Error("Failed fetching employee");

      const employee = await response.json();

      setUsernames((u) => ({...u, [id]: employee.name}));
    } catch (err) {
      console.error("Error fetching username:", err);
    }
  };
  
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete?")) return;

    try {
      const res = await apiFetch(`/api/events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed delete");

      setEvents((prev) => prev.filter((e) => e.event_id !== id));
      alert('Event deleted successfully');
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return { events, currentEvent, setEvent, usernames, handleDelete, fetchEvents };
};

export const useEditEvent = (event: EventItem | undefined, onClose: () => void, reloadEvents: () => void) => {
  const [availableRooms, setAvailableRooms] = useState<RoomDto[]>([]);
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    bookingId: null as number | null,
    expectedAttendees: 1,
    createdBy: "",
  });

  useEffect(() => {
    if (!event) {
      alert("Event not found");
      onClose();
      return;
    }

    const start = new Date(event.eventDate);
    const end = new Date(event.endTime);
    setFormData({
      title: event.title,
      description: event.description,
      date: start.toLocaleDateString('en-CA'),
      startTime: start.toTimeString().slice(0, 5),
      endTime: end.toTimeString().slice(0, 5),
      location: event.location ?? '',
      bookingId: event.bookingId ?? null,
      expectedAttendees: event.expectedAttendees ?? 1,
      createdBy: event.createdBy.toString(),
    });
  }, [event, onClose]);

  useEffect(() => {
    const canQuery = formData.date && formData.startTime && formData.endTime && formData.expectedAttendees > 0;
    if (!canQuery) {
      setAvailableRooms([]);
      return;
    }
    const loadRooms = async () => {
      try {
        const startIso = `${formData.date}T${formData.startTime}:00`;
        const endIso = `${formData.date}T${formData.endTime}:00`;
        const capacity = formData.expectedAttendees;
        const res = await apiFetch(`/api/Rooms/available-by-capacity?starttime=${startIso}&endtime=${endIso}&capacity=${capacity}`);
        if (res.ok) {
          const rooms = await res.json();
          setAvailableRooms(rooms || []);
        }
      } catch (err) {
        console.error('Failed to load available rooms', err);
        setAvailableRooms([]);
      }
    };
    loadRooms();
  }, [formData.date, formData.startTime, formData.endTime, formData.expectedAttendees]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'expectedAttendees') {
      setFormData(prev => ({ ...prev, expectedAttendees: Math.max(0, parseInt(value) || 0) }));
      return;
    }
    
    if (name === 'location') {
      const newValue = value;
      // When user types manually, clear the room selection (free-form location)
      setFormData(prev => ({ ...prev, location: newValue }));
      setSelectedRoomId(null);
      setShowRoomDropdown(newValue === '');
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectRoom = (room: RoomDto) => {
    setFormData(prev => ({ ...prev, location: room.roomName }));
    setSelectedRoomId(room.room_id);
    console.log('Selected room:', room);
    setShowRoomDropdown(false);
  };

  const validateBasics = () => {
    if (!formData.title.trim()) return 'Title cannot be empty';
    if (!formData.description.trim()) return 'Description cannot be empty';
    if (!formData.date) return 'Date cannot be empty';
    if (!formData.startTime) return 'Start time cannot be empty';
    if (!formData.endTime) return 'End time cannot be empty';
    if (!formData.location.trim()) return 'Location cannot be empty';
    if (formData.expectedAttendees <= 0) return 'Attendee count must be at least 1';
    const start = new Date(`${formData.date}T${formData.startTime}:00`);
    const end = new Date(`${formData.date}T${formData.endTime}:00`);
    if (end <= start) return 'End time must be after start time';
    return '';
  };

  const handleSave = async () => {
    const validationMessage = validateBasics();
    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    const startIso = `${formData.date}T${formData.startTime}:00`;
    const endIso = `${formData.date}T${formData.endTime}:00`;
    const bookingOwner = Number.parseInt(formData.createdBy || "0", 10) || event?.createdBy || 0;

    try {
      let bookingId = formData.bookingId ?? event?.bookingId ?? null;

      // Only create/update room booking if a room is selected
      if (selectedRoomId !== null) {
        const bookingPayload = {
          roomId: selectedRoomId,
          userId: bookingOwner,
          bookingDate: `${formData.date}T00:00:00`,
          startTime: `${formData.startTime}:00`,
          endTime: `${formData.endTime}:00`,
          eventId: event?.event_id ?? null,
          purpose: formData.title,
        };

        if (bookingId) {
          const updateBookingRes = await apiFetch(`/api/room-bookings/${bookingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookingPayload),
          });
          if (!updateBookingRes.ok) {
            const text = await updateBookingRes.text();
            throw new Error(text || "Failed to update booking");
          }
        } else {
          const createBookingRes = await apiFetch('/api/room-bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingPayload),
          });
          if (!createBookingRes.ok) {
            const text = await createBookingRes.text();
            throw new Error(text || 'Failed to create booking');
          }
          const createdBooking = await createBookingRes.json();
          bookingId = createdBooking?.booking_id ?? createdBooking?.bookingId ?? createdBooking?.id;
          if (bookingId) {
            setFormData(prev => ({ ...prev, bookingId }));
          }
        }
      } else {
        // No room selected - if there was a booking, detach it
        if (bookingId) {
          bookingId = null;
        }
      }

      const payload = {
        event_id: event?.event_id,
        title: formData.title,
        description: formData.description || "",
        eventDate: startIso,
        endTime: endIso,
        location: formData.location || undefined,
        ...(bookingId !== null && { bookingId }),
        createdBy: event?.createdBy,
        expectedAttendees: formData.expectedAttendees,
      };

      const response = await apiFetch(`/api/events/${event?.event_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Failed to update event");
      reloadEvents();
      onClose();
      alert('Event updated successfully');
    } catch (err: any) {
      console.error("Error updating event:", err);
      alert(err.message || "Failed to update event");
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return { formData, availableRooms, showRoomDropdown, setShowRoomDropdown, selectRoom, handleChange, handleSave, handleCancel };
};

export const useCreateEvent = (onClose: () => void, reloadEvents: () => void, defaultDate?: Date) => {
  const { user } = useAuth();
  const [availableRooms, setAvailableRooms] = useState<RoomDto[]>([]);
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);

  const getDefaultTimes = () => {
    const base = defaultDate ? new Date(defaultDate) : new Date();
    const start = new Date(base);
    start.setMinutes(start.getMinutes() + (15 - (start.getMinutes() % 15)) % 15);
    const end = new Date(start.getTime() + 60 * 60000);
    const fmt = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return { date: start.toLocaleDateString('en-CA'), startTime: fmt(start), endTime: fmt(end) };
  };

  const defaults = getDefaultTimes();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: defaults.date,
    startTime: defaults.startTime,
    endTime: defaults.endTime,
    location: "",
    expectedAttendees: 1,
    createdBy: user?.userId,
  });

  // Track whether the location is from a room selection (actual room) or free-form typing
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  useEffect(() => {
    const canQuery = formData.date && formData.startTime && formData.endTime && formData.expectedAttendees > 0;
    if (!canQuery) {
      setAvailableRooms([]);
      return;
    }
    const loadRooms = async () => {
      try {
        const startIso = `${formData.date}T${formData.startTime}:00`;
        const endIso = `${formData.date}T${formData.endTime}:00`;
        const capacity = formData.expectedAttendees;
        const res = await apiFetch(`/api/Rooms/available-by-capacity?starttime=${startIso}&endtime=${endIso}&capacity=${capacity}`);
        if (res.ok) {
          const rooms = await res.json();
          setAvailableRooms(rooms || []);
        }
      } catch (err) {
        console.error('Failed to load available rooms', err);
        setAvailableRooms([]);
      }
    };
    loadRooms();
  }, [formData.date, formData.startTime, formData.endTime, formData.expectedAttendees]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'expectedAttendees') {
      setFormData(prev => ({ ...prev, expectedAttendees: Math.max(0, parseInt(value) || 0) }));
      return;
    }
    
    if (name === 'location') {
      const newValue = value;
      // When user types manually, clear the room selection (free-form location)
      setFormData(prev => ({ ...prev, location: newValue }));
      setSelectedRoomId(null);
      setShowRoomDropdown(newValue === '');
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectRoom = (room: RoomDto) => {
    // User selected a room from dropdown - this is an actual room booking
    setFormData(prev => ({ ...prev, location: room.roomName }));
    setSelectedRoomId(room.room_id);
    setShowRoomDropdown(false);
  };

  const validateBasics = () => {
    if (!formData.title.trim()) return 'Title cannot be empty';
    if (!formData.description.trim()) return 'Description cannot be empty';
    if (!formData.date) return 'Date cannot be empty';
    if (!formData.startTime) return 'Start time cannot be empty';
    if (!formData.endTime) return 'End time cannot be empty';
    if (!formData.location.trim()) return 'Location cannot be empty';
    if (formData.expectedAttendees <= 0) return 'Expected attendees must be at least 1';
    const start = new Date(`${formData.date}T${formData.startTime}:00`);
    const end = new Date(`${formData.date}T${formData.endTime}:00`);
    if (end <= start) return 'End time must be after start time';
    return '';
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user?.userId) {
      alert('User is not logged in.');
      return;
    }

    const validationMessage = validateBasics();
    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    const startIso = `${formData.date}T${formData.startTime}:00`;
    const endIso = `${formData.date}T${formData.endTime}:00`;

    try {
      let bookingId: number | null = null;

      // Conditional logic: only create room booking if a room was selected
      if (selectedRoomId !== null) {
        // Room selected - create room booking and link to event
        const bookingPayload = {
          roomId: selectedRoomId,
          userId: user.userId,
          bookingDate: `${formData.date}T00:00:00`,
          startTime: `${formData.startTime}:00`,
          endTime: `${formData.endTime}:00`,
          eventId: null,
          purpose: formData.title,
        };

        const bookingRes = await apiFetch('/api/room-bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingPayload),
        });

        if (!bookingRes.ok) {
          const text = await bookingRes.text();
          throw new Error(text || 'Failed to create room booking');
        }

        const createdBooking = await bookingRes.json();
        bookingId = createdBooking?.booking_id ?? createdBooking?.bookingId ?? createdBooking?.id;
        if (!bookingId) {
          throw new Error('Booking id missing after booking creation.');
        }
      }

      // Create event with bookingId only if a room booking was created, otherwise null
      const payload = {
        event_id: null,
        title: formData.title,
        description: formData.description || '',
        eventDate: startIso,
        endTime: endIso,
        location: formData.location || undefined,
        ...(bookingId !== null && { bookingId }),
        createdBy: user.userId,
        expectedAttendees: formData.expectedAttendees,
      };

      const response = await apiFetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to create event');
      }
      alert('Event created successfully');
      reloadEvents();
      onClose();
    } catch (err: any) {
      console.error('Events error:', err);
      alert(err.message || 'Error creating an event');
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return { formData, availableRooms, showRoomDropdown, setShowRoomDropdown, selectRoom, handleChange, handleSubmit, handleCancel };
};

export const useViewAttendees = (event: EventItem | undefined, onClose: () => void) => {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    if (!event?.event_id) return;
    fetchUsers(event.event_id);
  }, [event?.event_id]);

  const fetchUsers = async (eventId: number) => {
    try {
      const response = await apiFetch(`/api/event-participation/event/${eventId}`);
      if (!response.ok) throw new Error("Failed");

      const participations = await response.json();

      const users = [];
      for (const participation of participations) {
        const res = await apiFetch(`/api/employees/${participation.userId}`);
        const user = await res.json();
        users.push(user);
      }

      setEmployees(users);

    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    onClose();
  }

  return { employees, handleCancel };
};

/*
 Types for calendar events and participants (shared)
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

/*
====================================
REMINDERS SECTION
====================================
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

/*
 Custom hook to fetch reminders for the logged-in user
 */
export const useReminders = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchReminders = useCallback(async (silent = false) => {
    if (!user?.userId) {
      setError('No user logged in');
      return;
    }

    // Only show loading state on initial load, not on polling refreshes
    if (!silent) {
      setLoading(true);
    }
    setError(null);

    try {
      // Helper to format date as YYYY-MM-DDTHH:mm:ss in local time if we ever implement reminder time like the bydate filter
      // const formatLocalDateTime = (date: Date): string => {
      //   const year = date.getFullYear();
      //   const month = String(date.getMonth() + 1).padStart(2, '0');
      //   const day = String(date.getDate()).padStart(2, '0');
      //   const hours = String(date.getHours()).padStart(2, '0');
      //   const minutes = String(date.getMinutes()).padStart(2, '0');
      //   const seconds = String(date.getSeconds()).padStart(2, '0');
      //   return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      // };
      // Fetch only reminders that are due (ReminderTime <= now)
      // use the formatLocalDateTime if we implement fromTime/toTime filtering dont use isostring
      // const now = formatLocalDateTime(new Date());
      // const fromTime = formatLocalDateTime(new Date(0));
      // const toTime = now;
      // console.log('Fetching reminders from', fromTime, 'to', toTime);

      //  const response = await apiFetch(
      //   `/api/reminders/user/${user.userId}/bydate?fromTime=${(fromTime)}&toTime=${(toTime)}`,
      //   {
      //     method: 'GET',
      //   }
      // );
  
      const response = await apiFetch(
        `/api/reminders/user/${user.userId}`,{
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch reminders: ${response.statusText}`);
      }

      const data = await response.json();
      setReminders(data);
      setIsInitialLoad(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching reminders');
      console.error('Error fetching reminders:', err);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [user?.userId]);

  // Refresh reminders on user interaction and window focus
  useEffect(() => {
    fetchReminders(false); // Initial load with loading state
    
    // Refresh when user returns to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchReminders(true); // Silent refresh
      }
    };

    // Refresh when window gains focus
    const handleFocus = () => {
      fetchReminders(true); // Silent refresh
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Fallback: refresh every 2 minutes as backup (less aggressive than 30s)
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchReminders(true);
      }
    }, 120000); // 2 minutes

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, [fetchReminders]);

  const markAsRead = useCallback(async (reminderId: number) => {
    try {
      const response = await apiFetch(`/api/reminders/mark-as-read/${reminderId}`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error(`Failed to mark reminder as read: ${response.statusText}`);
      }

      // Update local state immediately for instant feedback
      setReminders(prev => 
        prev.map(r => r.reminder_id === reminderId ? { ...r, isRead: true } : r)
      );
    } catch (err: any) {
      console.error('Error marking reminder as read:', err);
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const unsentReminders = reminders.filter(r => !r.isRead);
      await Promise.all(
        unsentReminders.map(r => markAsRead(r.reminder_id))
      );
    } catch (err: any) {
      console.error('Error marking all reminders as read:', err);
    }
  }, [reminders, markAsRead]);

  return {
    reminders,
    loading,
    error,
    refetch: () => fetchReminders(false),
    markAsRead,
    markAllAsRead,
  };
};

// USER SETTINGS / PREFERENCES
export interface ReminderPreferences {
  user_id?: number;
  id?: number;
  eventReminder: boolean;
  bookingReminder: boolean;
  reminderAdvanceMinutes: string; // TimeSpan as string from API
}

export const getRoomById = async (roomId: number): Promise<RoomDto | null> => {
  try {
    const response = await apiFetch(`/api/rooms/${roomId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch room');
    }
    const data = await response.json();
    return {
      room_id: data.room_id ?? data.RoomId ?? data.id ?? data.Id,
      roomName: data.room_name ?? data.roomName ?? data.RoomName ?? 'Room',
      capacity: data.capacity ?? data.Capacity ?? null,
      location: data.location ?? data.Location ?? '',
    };
  } catch (err) {
    console.error('Error fetching room:', err);
    return null;
  }
};

export const useUserSettings = () => {
  const [preferences, setPreferences] = useState<ReminderPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPreferences = useCallback(async () => {
    if (!user?.userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/reminderspreferences/user/${user.userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }

      const data = await response.json();
      if (data && data.length > 0) {
        setPreferences(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  const toggleEventReminder = useCallback(async () => {
    if (!user?.userId) return;

    try {
      const response = await apiFetch(`/api/reminderspreferences/${user.userId}/toggle-eventreminder`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle event reminder');
      }

      const newValue = await response.json();
      setPreferences(prev => prev ? { ...prev, eventReminder: newValue } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [user?.userId]);

  const toggleBookingReminder = useCallback(async () => {
    if (!user?.userId) return;

    try {
      const response = await apiFetch(`/api/reminderspreferences/${user.userId}/toggle-bookingreminder`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle booking reminder');
      }

      const newValue = await response.json();
      setPreferences(prev => prev ? { ...prev, bookingReminder: newValue } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [user?.userId]);

  const updateAdvanceMinutes = useCallback(async (minutes: number) => {
    if (!user?.userId) return;

    try {
      // Convert minutes to TimeSpan format (HH:mm:ss)
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const timeSpan = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;

      const response = await apiFetch(`/api/reminderspreferences/${user.userId}/advance-minutes`, {
        method: 'PATCH',
        body: JSON.stringify(timeSpan),
      });

      if (!response.ok) {
        throw new Error('Failed to update advance minutes');
      }

      const updated = await response.json();
      setPreferences(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    toggleEventReminder,
    toggleBookingReminder,
    updateAdvanceMinutes,
    refetch: fetchPreferences,
  };
};

/*
====================================
REMINDERS SECTION
====================================
*/

// _________________________________________
// end functions reminders
// _________________________________________
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

  // Fetch room details for events with roomId
  useEffect(() => {
    const roomIds = Array.from(new Set(upcomingEvents.map(ev => ev.bookingId).filter((id): id is number => id != null)));
    
    roomIds.forEach(async (roomId) => {
      if (!roomsById[roomId]) {
        try {
          const response = await apiFetch(`/api/rooms/${roomId}`);
          if (response.ok) {
            const room: RoomDto = await response.json();
            setRoomsById(prev => ({ ...prev, [roomId]: room }));
          }
        } catch (error) {
          console.error(`Failed to fetch room ${roomId}:`, error);
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

// NOTIFICATIONS
// Add these helper functions at the end of the file or in a utilities section

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('nl-NL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateOnly = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: 'short'
  });
};

export const formatTimeOnly = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// _________________________________________
// end functions home
// _________________________________________

// _________________________________________
// functions rooms
// _________________________________________

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

export const useRoomsAdmin = () => {
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<Omit<RoomFormState, 'id'>>({
    roomName: '',
    location: '',
    capacity: ''
  });

  const [editForm, setEditForm] = useState<RoomFormState>({
    id: null,
    roomName: '',
    location: '',
    capacity: ''
  });


  const loadRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/rooms');
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to load rooms');
      }
      const data = await res.json();
      const mapped: RoomDto[] = (data || []).map((r: any) => ({
        id: r.room_id ?? r.id ?? r.roomId ?? r.RoomId ?? 0,
        roomName: r.room_name ?? r.roomName ?? r.RoomName ?? 'Room',
        capacity: r.capacity ?? r.Capacity ?? null,
        location: r.location ?? r.Location ?? '',
      }));
      setRooms(mapped);
    } catch (e: any) {
      console.error('Error loading rooms', e);
      setError(e.message ?? 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const isEditing = editForm.id != null;

  const resetCreateForm = () => {
    setCreateForm({ roomName: '', location: '', capacity: '' });
  };

  const resetEditForm = () => {
    setEditForm({ id: null, roomName: '', location: '', capacity: '' });
  };

  const startEdit = (room: RoomDto) => {
    setEditForm({
      id: room.room_id,
      roomName: room.roomName,
      location: (room as any).location ?? (room as any).Location ?? '',
      capacity: room.capacity != null ? String(room.capacity) : '',
    });
  };

  const updateCreateField = (field: keyof Omit<RoomFormState, 'id'>, value: string) => {
    setCreateForm(prev => ({ ...prev, [field]: value }));
  };

  const updateEditField = (field: keyof RoomFormState, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const saveRoom = async (
    mode: 'create' | 'edit',
    e?: React.FormEvent
  ): Promise<boolean> => {
    if (e) e.preventDefault();

    const form = mode === 'create'
      ? { ...createForm, id: null }
      : editForm;

    const fail = (reason: string) => {
      const action = mode === 'create' ? 'create' : 'edit';
      setError(`Couldn't ${action} because ${reason}`);
      return false;
    };

    if (!form.roomName.trim()) {
      return fail('room name is required');
    }

    if (!form.location.trim()) {
      return fail('room location is required');
    }

    if (!form.capacity.trim()) {
      return fail('room capacity is required');
    }

    const capacityNumber = form.capacity.trim() ? Number(form.capacity) : null;

    if (capacityNumber != null && (Number.isNaN(capacityNumber) || capacityNumber < 1)) {
      return fail('room capacity must be at least 1');
    }

    const payload: any = {
      roomName: form.roomName.trim(),
      location: form.location.trim(),
      capacity: capacityNumber,
    };

    try {
      setLoading(true);
      setError(null);

      let res: Response;
      if (mode === 'edit' && form.id != null) {
        res = await apiFetch(`/api/rooms/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: form.id, ...payload }),
        });
      } else {
        res = await apiFetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to save room');
      }

      await loadRooms();
      if (mode === 'create') {
        resetCreateForm();
      } else {
        resetEditForm();
      }
      return true;
    } catch (e: any) {
      console.error('Error saving room', e);
      const reason = e?.message || 'failed to save room';
      return fail(reason);
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/rooms/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to delete room');
      }
      await loadRooms();
    } catch (e: any) {
      console.error('Error deleting room', e);
      setError(e.message ?? 'Failed to delete room');
    } finally {
      setLoading(false);
    }
  };

  return {
    rooms,
    loading,
    error,
    setError,
    createForm,
    editForm,
    isEditing,
    loadRooms,
    resetCreateForm,
    resetEditForm,
    startEdit,
    updateCreateField,
    updateEditField,
    saveRoom,
    deleteRoom,
  };
};

// _________________________________________
// end functions rooms

// Employee management types
interface EmployeeDto {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface EmployeeFormState {
  id: number | null;
  name: string;
  email: string;
  role: string;
  password?: string;
  confirmPassword?: string;
}

/**
 * Hook for managing employees in the admin panel
 */
export const useEmployeesAdmin = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<Omit<EmployeeFormState, 'id'>>({
    name: '',
    email: '',
    role: 'User',
    password: '',
    confirmPassword: '',
  });

  const [editForm, setEditForm] = useState<EmployeeFormState>({
    id: null,
    name: '',
    email: '',
    role: 'User',
    password: '',
  });

  const canAssignAdminRole = user?.role === 'SuperAdmin';

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/employees');
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to load employees');
      }
      const data = await res.json();
      const mapped: EmployeeDto[] = (data || []).map((emp: any) => ({
        id: emp.user_id ?? emp.Id ?? emp.id ?? 0,
        name: emp.name ?? emp.Name ?? 'Unknown',
        email: emp.email ?? emp.Email ?? '',
        role: emp.role ?? emp.Role ?? 'User',
      }));
      setEmployees(mapped);
    } catch (e: any) {
      console.error('Error loading employees', e);
      setError(e.message ?? 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const isEditing = editForm.id != null;

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      email: '',
      role: 'User',
      password: '',
      confirmPassword: '',
    });
  };

  const resetEditForm = () => {
    setEditForm({
      id: null,
      name: '',
      email: '',
      role: 'User',
      password: '',
    });
  };

  const startEdit = (employee: EmployeeDto) => {
    setEditForm({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      password: '',
    });
  };

  const updateCreateField = (
    field: keyof Omit<EmployeeFormState, 'id'>,
    value: string
  ) => {
    setCreateForm(prev => ({ ...prev, [field]: value }));
  };

  const updateEditField = (field: keyof EmployeeFormState, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const saveEmployee = async (mode: 'create' | 'edit', e?: React.FormEvent): Promise<boolean> => {
    if (e) e.preventDefault();

    const form = mode === 'create' ? { ...createForm, id: null } : editForm;

    const fail = (reason: string) => {
      const action = mode === 'create' ? 'create' : 'edit';
      setError(`Couldn't ${action} because ${reason}`);
      return false;
    };

    if (!form.name.trim()) {
      return fail('full name is required');
    }

    if (!form.email.trim()) {
      return fail('email is required');
    }
    // Validate email format
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(form.email.trim())) {
      return fail('the email address is invalid');
    }
    if (mode === 'create') {
      if (!form.password || form.password.length < 8) {
        return fail('password must be at least 8 characters');
      }

      if (form.password !== form.confirmPassword) {
        return fail('passwords do not match');
      }
    }

    const payload: any = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role || 'User',
    };

    if (mode === 'create') {
      payload.password = form.password;
    } else if (mode === 'edit' && form.password && form.password.trim()) {
      payload.password = form.password.trim();
    }

    try {
      setLoading(true);
      setError(null);

      let res: Response;
      if (mode === 'edit' && form.id != null) {
        res = await apiFetch(`/api/employees/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: form.id, ...payload }),
        });
      } else {
        res = await apiFetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to save employee');
      }

      await loadEmployees();
      if (mode === 'create') {
        resetCreateForm();
      } else {
        resetEditForm();
      }
      return true;
    } catch (e: any) {
      console.error('Error saving employee', e);
      const reason = e?.message || 'failed to save employee';
      return fail(reason);
    } finally {
      setLoading(false);
    }
  };

  const deleteEmployee = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/employees/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to delete employee');
      }
      await loadEmployees();
    } catch (e: any) {
      console.error('Error deleting employee', e);
      setError(e.message ?? 'Failed to delete employee');
    } finally {
      setLoading(false);
    }
  };

  return {
    employees,
    loading,
    error,
    setError,
    createForm,
    editForm,
    isEditing,
    canAssignAdminRole,
    loadEmployees,
    resetCreateForm,
    resetEditForm,
    startEdit,
    updateCreateField,
    updateEditField,
    saveEmployee,
    deleteEmployee,
  };
};

// _________________________________________
// end functions employees
// _________________________________________
// _________________________________________
// _________________________________________
// start functions roombooking
// _________________________________________
export type Room = {
  room_id: number;
  roomName: string;
  capacity: number;
  location: string;
};

export type RoomBooking = {
  booking_id?: number;
  roomId: number;
  userId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  eventId?: number | null;
};

export const useCreateRoomBookingDialog = (onClose: () => void, selectedDate: Date, reloadBookings: () => void) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [capacity, setCapacity] = useState<number>(1);
  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");
  const [eventId, setEventId] = useState(0);
  const { user } = useAuth()

  useEffect(() => {
    if (selectedDate && startTime && endTime && capacity > 0) {
      loadAvailableRooms();
    } else {
      setRooms([]);
    }
  }, [selectedDate, startTime, endTime, capacity]);

  const loadAvailableRooms = async () => {
    try {
      const start = selectedDate.toLocaleDateString("en-GB") + "T" + startTime + ":00";
      const end = selectedDate.toLocaleDateString("en-GB") + "T" + endTime + ":00";
      const result = await apiFetch(`/api/Rooms/available-by-capacity?starttime=${start}&endtime=${end}&capacity=${capacity}`);
      if (!result.ok) throw new Error("Failed to fetch available rooms");

      const data = await result.json();
      setRooms(data);
    } catch (err) {
      setRooms([]);
    }
  };

  const checkConflict = (start: string, end: string) => {
    const toMinutes = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const newStart = toMinutes(start);
    const newEnd = toMinutes(end);

    return bookings.some(
      (b) => toMinutes(b.startTime) < newEnd && toMinutes(b.endTime) > newStart
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!user?.userId) {
      alert("User is not logged in.");
      return;
    }

    if (!startTime || !endTime || !purpose) {
      setMessage("Please fill all required fields.");
      return;
    }

    if (checkConflict(startTime, endTime)) {
      setMessage("Time slot already booked for this room.");
      return;
    }

    if (endTime <= startTime) {
      setMessage("End time must be after start time.");
      return;
    }

    if (rooms.length < 1 || !roomId) {
      setMessage("There are no rooms. Please create a room first.")
      return;
    }

    if (rooms.every(r => r.capacity < capacity)) {
      setMessage("There are no rooms with enough capacity.")
      return;
    }

    selectedDate.setDate(selectedDate.getDate() + 1);

    const payload = {
      roomId,
      userId: user?.userId,
      bookingDate: selectedDate.toISOString().split("T")[0] + "T00:00:00",
      startTime: startTime,
      endTime: endTime,
      purpose: purpose,
      eventId: null
    };

    selectedDate.setDate(selectedDate.getDate() - 1);

    try {
      const res = await apiFetch("/api/room-bookings", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        setMessage("This room is already booked for the selected time.");
        return;
      }

      if (!res.ok) throw new Error("Failed to create booking");

      reloadBookings()
      onClose()

      setRoomId(null);
      setStartTime("");
      setEndTime("");
      setCapacity(1);
      setPurpose("");
    } catch (err) {
      console.error("Error creating booking:", err);
      setMessage("Error adding booking.");
    }
  };

  const generateTime = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        if (h === 0 && m === 0) continue;
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        options.push(`${hh}:${mm}`);
      }
    }
    return options;
  };

  return {
    rooms, 
    bookings, 
    roomId,
    startTime,
    endTime,
    capacity,
    purpose,
    message,
    eventId,

    setRoomId,
    setStartTime,
    setEndTime,
    setCapacity,
    setPurpose,
    handleSubmit,
    generateTime
  };
};

export const useRoomBooking = () => {
  const { user } = useAuth()
  const [roomBookings, setRoomBookings] = useState<RoomBooking[]>([]);
  const [roomBookingsOnDay, setRoomBookingsOnDay] = useState<RoomBooking[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchRoomBookings = async () => {
    if (!user) return;
    try {
      const response = await apiFetch(`/api/room-bookings/user/${user.userId}`);

      if (!response.ok) throw new Error("Failed to fetch roombookings");

      const data: RoomBooking[] = await response.json();
      setRoomBookings(data);
    } catch (err) {
      console.error("Fetching roombookings failed: ", err);
      setRoomBookings([]);
    }
  };

  useEffect(() => {
    fetchRoomBookings();
  }, [user]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToCurrentDate = () => {
    setCurrentDate(new Date());
  };

  return { fetchRoomBookings, roomBookings, setRoomBookings, roomBookingsOnDay, setRoomBookingsOnDay, 
    currentDate, setCurrentDate, selectedDate, setSelectedDate, goToPreviousMonth, goToNextMonth, goToCurrentDate };
}

export const useViewRoomBookingsDialog = (onClose: () => void, roomBookings: RoomBooking[], reloadBookings: () => void) => {
  const [editingBooking, setEditingBooking] = useState<RoomBooking | null>(null);
  const [capacityFilter, setCapacityFilter] = useState<number | "">("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);

  const allFieldsFilled =
    editingBooking?.purpose &&
    editingBooking?.startTime &&
    editingBooking?.endTime &&
    capacityFilter !== "";


  const getRoomName = (roomId: number | undefined) => {
    if (!roomId) return "-";
    const room = allRooms.find(r => r.room_id === roomId);
    return room ? room.roomName : "-";
  };

  useEffect(() => {
    const fetchAllRooms = async () => {
      const data = await apiFetch("/api/Rooms");
      const result: Room[] = await data.json();
      setAllRooms(result);
    };
    fetchAllRooms();
  }, []);

  useEffect(() => {
    if (!allFieldsFilled) return;

    const fetchRooms = async () => {
      const data = await apiFetch("/api/Rooms");
      const result: Room[] = await data.json()
      setRooms(result.filter(r => r.capacity >= Number(capacityFilter)));
    };

    fetchRooms();
  }, [allFieldsFilled, capacityFilter]);

  const checkConflict = (start: string, end: string, currentId?: number) => {
    const toMin = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    return roomBookings.some(
      b =>
        b.booking_id !== currentId &&
        toMin(b.startTime) < toMin(end) &&
        toMin(b.endTime) > toMin(start)
    );
  };

  const handleSaveEdit = async () => {
    if (!editingBooking || capacityFilter === "") return;

    if (editingBooking.endTime <= editingBooking.startTime) {
      alert("End time must be after start time");
      return;
    }

    if (checkConflict(editingBooking.startTime, editingBooking.endTime, editingBooking.booking_id)) {
      alert("Time slot already booked");
      return;
    }

    await apiFetch(`/api/room-bookings/${editingBooking.booking_id}`, {
      method: "PUT",
      body: JSON.stringify({
        booking_id: editingBooking.booking_id,
        roomId: editingBooking.roomId,
        userId: editingBooking.userId,
        bookingDate: editingBooking.bookingDate,
        startTime: editingBooking.startTime.slice(0, 5),
        endTime: editingBooking.endTime.slice(0, 5),
        eventId: null,
        purpose: editingBooking.purpose,
      }),
    });

    setEditingBooking(null);
    reloadBookings();
    onClose();
  };

  const handleDelete = async (booking: RoomBooking) => {
    if (!window.confirm("Delete this booking?")) return;

    await apiFetch(`/api/room-bookings`, {
      method: "DELETE",
      body: JSON.stringify({
        roomId: booking.roomId,
        userId: booking.userId,
        bookingDate: booking.bookingDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
      }),
    });

    reloadBookings()
    onClose();
  };

  const generateTime = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        if (h === 0 && m === 0) continue;
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        options.push(`${hh}:${mm}:00`);
      }
    }
    return options;
  };

  return {
    editingBooking,
    setEditingBooking,
    handleSaveEdit,
    capacityFilter,
    setCapacityFilter,
    rooms,
    handleDelete,
    getRoomName,
    generateTime
  };
};

// _________________________________________
// end functions roombooking
// _________________________________________

// _________________________________________
// start functions office attendance
// _________________________________________

const STATUS_TO_INT = {
  Present: 0,
  Absent: 1,
  Remote: 2,
} as const;

const INT_TO_STATUS = {
  0: 'Present',
  1: 'Absent',
  2: 'Remote',
} as const;

export type AttendanceStatus = 'Present' | 'Absent' | 'Remote';

export const useOfficeAttendance = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Load today's attendance for the current user
   */
  useEffect(() => {
    const loadTodayAttendance = async () => {
      if (!user?.userId) return;
      
      try {
        const res = await apiFetch(`/api/office-attendance/today/${user.userId}`);

        if (res.ok) {
          const data: { status: number } = await res.json();
          setStatus(INT_TO_STATUS[data.status as 0 | 1 | 2]);
        } else if (res.status === 404) {
          // No attendance set for today
          setStatus(null);
        } else {
          console.error('Failed to load attendance:', res.status);
        }
      } catch (err) {
        console.error('Attendance load error', err);
        setStatus(null);
      }
    };

    loadTodayAttendance();
  }, []);

  /**
   * Set or update today's attendance (UPSERT)
   */
  const setTodayAttendance = async (newStatus: AttendanceStatus) => {
    if (!user?.userId) return;
    
    setLoading(true);

    try {
      const res = await apiFetch(`/api/office-attendance/today/${user.userId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: STATUS_TO_INT[newStatus],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Update failed (${res.status}): ${text}`);
      }

      const data: { status: number } = await res.json();
      setStatus(INT_TO_STATUS[data.status as 0 | 1 | 2]);
    } catch (err) {
      console.error('Attendance update error', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    status,
    loading,
    setTodayAttendance,
  };
};
// _________________________________________
// end functions office attendance
// _________________________________________ 
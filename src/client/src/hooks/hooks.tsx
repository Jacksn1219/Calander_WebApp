import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../states/AuthContext';
import { apiFetch } from '../config/api';
import { isSuperAdmin } from '../constants/superAdmin';

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
      // Expect an array of bookings with room and time info.
      // Backend sends BookingDate (DateTime) and StartTime/EndTime (TimeSpan),
      // so we compose full ISO strings for the frontend Date constructor.
      const mapped: RoomBookingSummary[] = (data || []).map((b: any) => {
        const bookingDateRaw: string | undefined = b.bookingDate ?? b.bookingDateUtc ?? b.bookingDateLocal;
        const startTimeRaw: string | undefined = b.startTime;
        const endTimeRaw: string | undefined = b.endTime;

        const buildDateTime = (date: string | undefined, time: string | undefined): string => {
          if (!date || !time) return '';
          const datePart = date.split('T')[0];
          return `${datePart}T${time}`;
        };

        return {
          id: b.id ?? b.roomBookingId ?? 0,
          roomName: b.room?.name ?? b.roomName ?? 'Room',
          startTime: buildDateTime(bookingDateRaw, startTimeRaw),
          endTime: buildDateTime(bookingDateRaw, endTimeRaw),
        };
      });

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
Custom hook for create employee form logic
 */
export const useCreateEmployeeForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRoleState] = useState<'Admin' | 'User'>('User');
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

  const setRole = useCallback((newRole: 'Admin' | 'User') => {
    if (!canAssignAdminRole) {
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

  return {
    isCollapsed,
    toggleSidebar,
    handleLogout,
  };
};

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

/*
 Custom hook for event dialog state and actions
 */
export const useEventDialog = (events: any[]) => {
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
    // Support both string and possible numeric enum values (0 Pending,1 Accepted,2 Declined)
    if (me && (me.status === 'Accepted' || me.status === 'accepted' || me.status === 1)) {
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
      alert('You have successfully registered for this event.');
    } catch (e) {
      console.error(e);
      alert('Unable to register for this event. Please try again.');
    }
  }, [events, user]);

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
      alert('Your registration has been cancelled.');
    } catch (e) {
      console.error(e);
      alert('Unable to cancel your registration. Please try again.');
    }
  }, [events, user]);

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


/**
 * Custom hook for calendar navigation and date selection
 */
export const useCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleDateClick = useCallback((day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(date);
  }, [currentMonth]);

  const handleCloseDialog = useCallback(() => {
    setSelectedDate(null);
  }, []);

  const handlePreviousMonth = useCallback(() => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  }, [currentMonth]);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  }, [currentMonth]);

  const handleToday = useCallback(() => {
    setCurrentMonth(new Date());
  }, []);

  const getDaysInMonth = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  }, []);

  return {
    selectedDate,
    setSelectedDate,
    currentMonth,
    handleDateClick,
    handleCloseDialog,
    handlePreviousMonth,
    handleNextMonth,
    handleToday,
    getDaysInMonth,
  };
};

/*
  Custom hook for fetching and managing calendar events
  with participation and employee data enrichment.
  No longer performs role-based filtering; all users see all events.
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
        const durationMinutes: number = ev.DurationMinutes ?? ev.duration_minutes ?? ev.durationMinutes ?? 60;
        const roomId: number | undefined = ev.RoomId ?? ev.room_id ?? ev.roomId ?? undefined;
        return {
          eventId: id,
          title: ev.Title ?? ev.title ?? 'Untitled Event',
          description: ev.Description ?? ev.description ?? undefined,
          eventDate: eventDateString ? new Date(eventDateString) : new Date(),
          durationMinutes,
          roomId,
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
  eventDate: string;
  durationMinutes: number;
  roomId?: number;
  createdBy: number;
}

export interface Employee {
  user_id: number;
  name: string;
  email: string;
}

export const useAdministrativeDashboard = () => {
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
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return { events, currentEvent, setEvent, usernames, handleDelete, fetchEvents };
};

export const useEditEvent = (event: EventItem | undefined, onClose: () => void, reloadEvents: () => void) => {
  const navigate = useNavigate();
  const currentEvent = event;
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    durationMinutes: 60,
    roomId: null as number | null,
    createdBy: "",
  });

  useEffect(() => {
    if (!currentEvent) {
      alert("Event not found");
      onClose();
      return;
    }
    const eventDateTime = new Date(currentEvent.eventDate);
    setFormData({
      title: currentEvent.title,
      description: currentEvent.description,
      date: eventDateTime.toLocaleDateString('en-CA'),
      time: eventDateTime.toTimeString().slice(0, 5), // HH:MM format
      durationMinutes: currentEvent.durationMinutes || 60,
      roomId: currentEvent.roomId ?? null,
      createdBy: currentEvent.createdBy.toString()
    });
  }, [currentEvent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const processedValue = (name === 'durationMinutes' || name === 'roomId') 
      ? (value === '' ? undefined : Number(value))
      : value;
    setFormData((events) => ({ ...events, [name]: processedValue }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert("Title cannot be empty");
      return;
    }
    if (!formData.description.trim()) {
      alert("Description cannot be empty");
      return;
    }
    if (!formData.date.trim()) {
      alert("Date cannot be empty");
      return;
    }
    if (!formData.time.trim()) {
      alert("Time cannot be empty");
      return;
    }
    if (!formData.durationMinutes || formData.durationMinutes <= 0) {
      alert("Duration must be greater than 0");
      return;
    }
    const selectedDate = new Date(formData.date);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      alert("Date must be today or later");
      return;
    }

    try {
      // Combine date and time into a single DateTime
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);
      
      const payload = {
        event_id: currentEvent?.event_id,
        title: formData.title,
        description: formData.description || "",
        eventDate: eventDateTime.toISOString(),
        durationMinutes: formData.durationMinutes || 60,
        roomId: formData.roomId === null || formData.roomId === undefined ? null : formData.roomId,
        createdBy: currentEvent?.createdBy
      };
      
      console.log('Sending PUT request with payload:', payload);
      
      const response = await apiFetch(`/api/events/${currentEvent?.event_id}`, { 
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Failed to update event");
      setFormData({ title: "", description: "", date: "", time: "", durationMinutes: 60, roomId: null, createdBy: formData.createdBy });
      reloadEvents();
      onClose();
    } catch (err: any) {
      console.error("Error updating event:", err);
      alert("Failed to update event");
    }
  };

  const handleCancel = () => {
    setFormData({ title: "", description: "", date: "", time: "", durationMinutes: 60, roomId: null, createdBy: formData.createdBy });
    onClose();
  };

  return { formData, handleChange, handleSave, handleCancel };
};

export const useCreateEvent = (onClose: () => void, reloadEvents: () => void) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    durationMinutes: 60,
    roomId: null as number | null,
    createdBy: user?.userId,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue: any = value;
    
    if (name === 'durationMinutes') {
      processedValue = value === '' ? 60 : Number(value);
    } else if (name === 'roomId') {
      processedValue = value === '' ? null : Number(value);
    }
    
    setFormData((events) => ({ ...events, [name]: processedValue }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!user?.userId) {
      alert("User is not logged in.");
      return;
    }

    if (!formData.title.trim()) {
      alert("Title cannot be empty");
      return;
    }
    if (!formData.description.trim()) {
      alert("Description cannot be empty");
      return;
    }
    if (!formData.date.trim()) {
      alert("Date cannot be empty");
      return;
    }
    if (!formData.time.trim()) {
      alert("Time cannot be empty");
      return;
    }
    if (!formData.durationMinutes || formData.durationMinutes <= 0) {
      alert("Duration must be greater than 0");
      return;
    }
    const selectedDate = new Date(formData.date);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      alert("Date must be today or later");
      return;
    }

    try {
      // Combine date and time into a single DateTime
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);
      
      const response = await apiFetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: null,
          title: formData.title,
          description: formData.description || "",
          eventDate: eventDateTime.toISOString(),
          durationMinutes: formData.durationMinutes || 60,
          roomId: formData.roomId === null || formData.roomId === undefined ? null : formData.roomId,
          createdBy: user.userId,
        }),
      });

      if (!response.ok) {
        alert("Failed to create event");
        console.error("Server response error:", response.status);
        return;
      }

      const result = await response.json();
      console.log("Event created:", result);

      setFormData({ title: "", description: "", date: "", time: "", durationMinutes: 60, roomId: null, createdBy: user.userId });
      reloadEvents();
      onClose();
    } catch (err: any) {
      console.error("Events error:", err);
      alert("Error creating an event");
    }
  };

  const handleCancel = () => {
    setFormData({ title: "", description: "", date: "", time: "", durationMinutes: 60, roomId: null, createdBy: user?.userId });
    onClose();
  };

  return { formData, handleChange, handleSubmit, handleCancel };
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
/**
 * Custom hook for managing hidden events with localStorage persistence
 */
// const HIDDEN_EVENTS_KEY = 'hiddenEventIds';

// export const useHiddenEvents = () => {
//   const [hiddenEventIds, setHiddenEventIds] = useState<number[]>(() => {
//     // Initialize state from localStorage
//     const stored = localStorage.getItem(HIDDEN_EVENTS_KEY);
//     if (stored) {
//       try {
//         const parsed = JSON.parse(stored);
//         return Array.isArray(parsed) ? parsed : [];
//       } catch {
//         return [];
//       }
//     }
//     return [];
//   });

//   // Persist hidden events to localStorage on change
//   useEffect(() => {
//     localStorage.setItem(HIDDEN_EVENTS_KEY, JSON.stringify(hiddenEventIds));
//   }, [hiddenEventIds]);

//   // Pure function to hide an event
//   const hideEvent = useCallback((eventId: number): void => {
//     setHiddenEventIds(prev => [...prev, eventId]);
//   }, []);

//   // Pure function to restore all hidden events
//   const restoreAllEvents = useCallback((): void => {
//     setHiddenEventIds([]);
//   }, []);

//   // Pure function to filter out hidden events
//   const filterHiddenEvents = useCallback((events: CalendarEvent[]): CalendarEvent[] => {
//     return events.filter(event => !hiddenEventIds.includes(event.eventId));
//   }, [hiddenEventIds]);

//   return {
//     hiddenEventIds,
//     hideEvent,
//     restoreAllEvents,
//     filterHiddenEvents,
//   };
// };

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
  eventDate: Date;
  durationMinutes: number;
  roomId?: number;
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

  const fetchReminders = useCallback(async () => {
    if (!user?.userId) {
      setError('No user logged in');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch(`/api/reminders/user/${user.userId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reminders: ${response.statusText}`);
      }

      const data = await response.json();
      setReminders(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching reminders');
      console.error('Error fetching reminders:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const markAsRead = useCallback(async (reminderId: number) => {
    try {
      const response = await apiFetch(`/api/reminders/mark-as-read/${reminderId}`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error(`Failed to mark reminder as read: ${response.statusText}`);
      }

      // Update local state
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
    refetch: fetchReminders,
    markAsRead,
    markAllAsRead,
  };
};
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

  const { upcomingEvents, totalEvents, acceptedEventsForUser } = useMemo(() => {
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

    const upcoming = sorted.filter(ev => ev.eventDate >= now);

    return {
      upcomingEvents: upcoming,
      totalEvents: events.length,
      acceptedEventsForUser: acceptedForUser,
    };
  }, [events, user?.userId]);

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
  id: number;
  name: string;
  capacity?: number | null;
  location: string;
}

export interface RoomFormState {
  id?: number | null;
  name: string;
  location: string;
  capacity: string;
}

export const useRoomsAdmin = () => {
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<Omit<RoomFormState, 'id'>>({
    name: '',
    location: '',
    capacity: ''
  });

  const [editForm, setEditForm] = useState<RoomFormState>({
    id: null,
    name: '',
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
        name: r.room_name ?? r.roomName ?? r.RoomName ?? 'Room',
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
    setCreateForm({ name: '', location: '', capacity: '' });
  };

  const resetEditForm = () => {
    setEditForm({ id: null, name: '', location: '', capacity: '' });
  };

  const startEdit = (room: RoomDto) => {
    setEditForm({
      id: room.id,
      name: room.name,
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
  ) => {
    if (e) e.preventDefault();

    const form = mode === 'create'
      ? { ...createForm, id: null }
      : editForm;

    if (!form.name.trim()) {
      setError('Room name is required');
      return;
    }

    if (!form.location.trim()) {
      setError('Room location is required');
      return;
    }

    if (!form.capacity.trim()) {
      setError('Room capacity is required');
      return;
    }

    const capacityNumber = form.capacity.trim() ? Number(form.capacity) : null;

    if (capacityNumber != null && (Number.isNaN(capacityNumber) || capacityNumber < 0)) {
      setError('Room capacity must be a non-negative number');
      return;
    }

    const payload: any = {
      roomName: form.name.trim(),
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
    } catch (e: any) {
      console.error('Error saving room', e);
      setError(e.message ?? 'Failed to save room');
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
        id: emp.employee_id ?? emp.id ?? emp.employeeId ?? emp.EmployeeId ?? 0,
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

  const saveEmployee = async (mode: 'create' | 'edit', e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const form = mode === 'create' ? { ...createForm, id: null } : editForm;

    if (!form.name.trim()) {
      setError('Full name is required');
      return;
    }

    if (!form.email.trim()) {
      setError('Email is required');
      return;
    }

    if (mode === 'create') {
      if (!form.password || form.password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match');
        return;
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
    } catch (e: any) {
      console.error('Error saving employee', e);
      setError(e.message ?? 'Failed to save employee');
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

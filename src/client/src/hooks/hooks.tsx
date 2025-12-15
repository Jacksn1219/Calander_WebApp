import { useState, useCallback, useEffect } from 'react';
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
        return {
          eventId: id,
          title: ev.Title ?? ev.title ?? 'Untitled Event',
          description: ev.Description ?? ev.description ?? undefined,
          eventDate: eventDateString ? new Date(eventDateString) : new Date(),
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
    createdBy: "",
  });

  useEffect(() => {
    if (!currentEvent) {
      alert("Event not found");
      onClose();
      return;
    }
    setFormData({
      title: currentEvent.title,
      description: currentEvent.description,
      date: new Date(currentEvent.eventDate).toISOString().split("T")[0],
      createdBy: currentEvent.createdBy.toString()
    });
  }, [currentEvent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((events) => ({ ...events, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.date) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await apiFetch(`/api/events/${currentEvent?.event_id}`, { 
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: currentEvent?.event_id,
          title: formData.title,
          description: formData.description,
          eventDate: new Date(formData.date).toISOString(),
          createdBy: currentEvent?.createdBy
        })
      });
      if (!response.ok) throw new Error("Failed to update event");
      setFormData({ title: "", description: "", date: "", createdBy: formData.createdBy });
      reloadEvents();
      onClose();
    } catch (err: any) {
      console.error("Error updating event:", err);
      alert("Failed to update event");
    }
  };

  const handleCancel = () => {
    setFormData({ title: "", description: "", date: "", createdBy: formData.createdBy });
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
    createdBy: user?.userId,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((events) => ({ ...events, [name]: value }));
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

    try {
      const response = await apiFetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: null,
          title: formData.title,
          description: formData.description,
          eventDate: new Date(formData.date).toISOString(),
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

      setFormData({ title: "", description: "", date: "", createdBy: user.userId });
      reloadEvents();
      onClose();
    } catch (err: any) {
      console.error("Events error:", err);
      alert("Error creating an event");
    }
  };

  const handleCancel = () => {
    setFormData({ title: "", description: "", date: "", createdBy: user?.userId });
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

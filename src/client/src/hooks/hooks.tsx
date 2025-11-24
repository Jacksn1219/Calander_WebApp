import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../states/AuthContext';
import { apiFetch } from '../config/api';

/**
 * Custom hook for form validation and error handling
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

/**
 * Custom hook for password visibility toggle
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

/**
 * Custom hook for login form logic
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
        // Attempt to parse error text
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

      // Persist token & user via context
      login({
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role
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

/**
 * Custom hook for registration form logic
 */
export const useRegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'Admin' | 'User'>('User');
  const [success, setSuccess] = useState<string | null>(null);
  
  const { error, setError, validateEmail, validatePassword, validatePasswordMatch, validateRequired, clearError } = useFormValidation();
  const { showPassword, togglePasswordVisibility } = usePasswordVisibility();
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const validate = useCallback((): boolean => {
    clearError();
    
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

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const userData = { name, email, role };

    // TODO: Backend Integration - Replace mock registration with actual API call
    // POST /api/employees/register with { name, email, password, role }
    // Should return { token: string, user: { userId, name, email, role } }
    // Use EmployeesService.Post() method
    // On success, auto-login the user with returned token
    setTimeout(() => {
      setSuccess('Registration successful! Logging you in...');
      console.log('Mock user created:', userData);
      
      setTimeout(() => {
        login(userData);
        navigate('/home');
      }, 1000);
    }, 500);
  }, [name, email, role, validate, login, navigate]);

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
    error,
    success,
    showPassword,
    togglePasswordVisibility,
    showConfirmPassword,
    toggleConfirmPasswordVisibility,
    handleSubmit,
  };
};

/**
 * Custom hook for sidebar logic
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

/**
 * Custom hook for event dialog state and actions
 */
export const useEventDialog = (events: any[]) => {
  const [selectedEvent, setSelectedEvent] = useState<any | null>(events.length === 1 ? events[0] : null);
  const [userParticipationStatus, setUserParticipationStatus] = useState<string>('not-registered');

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

  const handleAttend = useCallback((eventId: number) => {
    // TODO: Backend Integration - Replace mock attendance with actual API call
    // POST /api/eventparticipation with { eventId, userId, status: 'Accepted' }
    // Use EventParticipationService.Post() method
    // Should update participant list in real-time
    console.log('Attending event:', eventId);
    setUserParticipationStatus('accepted');
    alert('You have registered for this event');
  }, []);

  const handleUnattend = useCallback((eventId: number) => {
    // TODO: Backend Integration - Replace mock unattend with actual API call
    // DELETE /api/eventparticipation with { eventId, userId }
    // Use EventParticipationService.Delete() method
    // Should update participant list in real-time
    console.log('Unattending event:', eventId);
    setUserParticipationStatus('not-registered');
    alert('You have unregistered from this event');
  }, []);

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

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  createdBy: string;
}

const dummyEvents: EventItem[] = [
  { id: "id1", title: "Event 1", description: "Description 1", date: "2025-11-01", createdBy: "Admin" },
  { id: "id2", title: "Event 2", description: "Description 2", date: "2025-11-02", createdBy: "Admin" },
  { id: "id3", title: "Event 3", description: "Description 3", date: "2025-11-03", createdBy: "Admin" },
];

const loadEvents = (): EventItem[] => {
  const data = localStorage.getItem("events");
  if (data)
  {
    return JSON.parse(data);
  }
  else
  {
    return dummyEvents;
  }
};

export const useAdministrativeDashboard = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setEvents(loadEvents());
  }, [location]);

  const handleCreate = () => {
    navigate("/administrative-dashboard/create");
  };

  const handleEdit = (id: string) => {
    navigate(`/administrative-dashboard/edit/${id}`);
  };

  const handleViewAttendees = (id: string) => {
    navigate(`/administrative-dashboard/view-attendees/${id}`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      const updated = events.filter((event) => event.id !== id);
      setEvents(updated);
      localStorage.setItem("events", JSON.stringify(updated));
    }
  };

  return { events, handleCreate, handleEdit, handleViewAttendees, handleDelete };
};

export const useEditEvent = (id: string | undefined) => {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState<EventItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    createdBy: "",
  });

  useEffect(() => {
    const loadedEvents = loadEvents();
    const foundEvent = loadedEvents.find((e) => e.id === id);
    if (foundEvent) {
      setEventData(foundEvent);
      setFormData({
        title: foundEvent.title,
        description: foundEvent.description,
        date: foundEvent.date,
        createdBy: foundEvent.createdBy,
      });
    } else {
      alert("Event not found");
      navigate("/administrative-dashboard");
    }
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((events) => ({ ...events, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.title || !formData.date) {
      alert("Please fill in all required fields");
      return;
    }

    const loadedEvents = loadEvents();
    const updatedEvents = loadedEvents.map((event) =>
      event.id === id ? { ...event, ...formData } : event
    );

    localStorage.setItem("events", JSON.stringify(updatedEvents));
    navigate("/administrative-dashboard");
  };

  const handleCancel = () => {
    navigate("/administrative-dashboard");
  };

  return { eventData, formData, handleChange, handleSave, handleCancel };
};

export const useCreateEvent = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    createdBy: "Admin",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((events) => ({ ...events, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.title || !formData.date) {
      alert("Please fill in all required fields");
      return;
    }

    const stored = loadEvents();
    const nextId = `id${stored.length + 1}`;
    const updatedEvents = [...stored, { id: nextId, ...formData }];

    localStorage.setItem("events", JSON.stringify(updatedEvents));

    navigate("/administrative-dashboard");
  };

  const handleCancel = () => {
    navigate("/administrative-dashboard");
  };

  return { formData, handleChange, handleSave, handleCancel };
};

export const useViewAttendees = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/administrative-dashboard");
  }

  return { handleBack };
}
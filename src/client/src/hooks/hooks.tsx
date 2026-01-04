/*
 ====================================
 CENTRALIZED HOOKS EXPORT FILE
 ====================================
 This file re-exports all hooks from their respective modules
 for easy importing throughout the application.
 */

// Type exports from centralized types folder
export type { CalendarEvent, CalendarParticipant, EventItem } from '../types/event_types';
export type { User, Employee, EmployeeFormState } from '../types/user_types';
export type { RoomDto, RoomFormState, RoomBookingSummary } from '../types/room_types';
export type { Reminder, ReminderPreferences } from '../types/reminder_types';
export type { AttendanceStatus } from '../types/attendance_types';

// Login form hooks
export { 
  useFormValidation, 
  usePasswordVisibility, 
  useLoginForm 
} from './login_form_hooks';

// Room bookings hooks
export { 
  useUserRoomBookings
} from './room_bookings_hooks';

// Sidebar hooks
export { 
  useSidebar 
} from './sidebar_hooks';

// Logout hooks
export { 
  useLogoutWithConfirmation 
} from './logout_hooks';

// Event dialog hooks
export { 
  useEventDialog 
} from './event_dialog_hooks';

// Calendar hooks and types
export { 
  useCalendar, 
  useCalendarEvents
} from './calendar_hooks';

// Calendar constants
export { 
  MONTH_NAMES, 
  WEEKDAY_LABELS, 
  ESTIMATED_EVENT_CARD_HEIGHT, 
  MIN_UPCOMING_EVENTS, 
  DEFAULT_UPCOMING_EVENTS 
} from '../constants/calendar_constants';

// Administrative dashboard hooks
export { 
  useAdministrativeDashboard, 
  useEditEvent, 
  useCreateEvent, 
  useViewAttendees
} from './administrative_dashboard_hooks';

// Reminders hooks
export { 
  useReminders, 
  useUserSettings, 
  // getRoomById
} from './reminders_hooks';

// Home dashboard hooks
export { 
  useHomeDashboard
} from './home_dashboard_hooks';

// Date formatting utilities
export { 
  formatDate,
  formatDateOnly,
  formatTimeOnly
} from '../utils/dateFormatters';

// Rooms admin hooks
export { 
  useRoomsAdmin
} from './rooms_admin_hooks';

// Employees admin hooks
export { 
  useEmployeesAdmin
} from './employees_admin_hooks';

// Office attendance hooks
export { 
  useOfficeAttendance
} from './office_attendance_hooks';


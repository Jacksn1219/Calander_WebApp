# Backend Integration Checklist

This document outlines all the locations in the frontend code that require backend API integration once the ASP.NET Core backend is complete.

## 🔐 Authentication & Authorization

### 1. Login Flow (`src/client/src/hooks/hooks.tsx` - `useLoginForm`)
- **Location**: Line ~108-125
- **Current**: Mock authentication with hardcoded credentials
- **Required API**: `POST /api/auth/login`
- **Request Body**: `{ email: string, password: string }`
- **Response**: `{ token: string, user: { userId: number, name: string, email: string, role: 'Admin' | 'User' } }`
- **Backend Service**: `EmployeesService` authentication endpoint
- **Notes**: 
  - Replace `demo-token` with actual JWT
  - Store JWT in Authorization header for subsequent requests
  - Handle password hashing on backend

### 2. Registration Flow (`src/client/src/hooks/hooks.tsx` - `useRegisterForm`)
- **Location**: Line ~187-205
- **Current**: Mock registration with setTimeout
- **Required API**: `POST /api/employees/register`
- **Request Body**: `{ name: string, email: string, password: string, role: 'Admin' | 'User' }`
- **Response**: `{ token: string, user: { userId: number, name: string, email: string, role: string } }`
- **Backend Service**: `EmployeesService.Post()`
- **Notes**: 
  - Auto-login user after successful registration
  - Validate email uniqueness on backend
  - Hash password before storing

### 3. Token Validation (`src/client/src/states/AuthContext.tsx`)
- **Location**: Line ~33-47 (useEffect)
- **Current**: Only validates localStorage token exists
- **Required API**: `GET /api/auth/verify` or `GET /api/auth/me`
- **Response**: `{ user: { userId: number, name: string, email: string, role: string } }`
- **Notes**: 
  - Validate JWT on app load
  - Refresh user data from backend
  - Handle expired tokens

### 4. Login Method (`src/client/src/states/AuthContext.tsx`)
- **Location**: Line ~49-54
- **Current**: Stores mock token in localStorage
- **Notes**: Should receive actual JWT from login API call

### 5. Logout Method (`src/client/src/states/AuthContext.tsx`)
- **Location**: Line ~56-61
- **Current**: Only clears localStorage
- **Optional API**: `POST /api/auth/logout`
- **Notes**: If using refresh tokens, invalidate them on backend

---

## 📅 Events Management

### 6. Fetch User Events (`src/client/src/components/MyEvents.tsx`)
- **Location**: Line ~29-41
- **Current**: Hardcoded mock events array
- **Required API**: `GET /api/events/user/:userId` or `GET /api/events`
- **Response**: `Event[]`
  ```typescript
  interface Event {
    eventId: number;
    title: string;
    description?: string;
    eventDate: string; // ISO 8601 format
    createdBy: number;
    participants: Participant[];
  }
  ```
- **Backend Service**: `EventsService.GetEventsByUserAsync(userId)`
- **Notes**: 
  - Filter events based on authenticated user
  - Parse `eventDate` string to Date object
  - Include participant data with join

### 7. Event Attendance - Register (`src/client/src/hooks/hooks.tsx` - `useEventDialog`)
- **Location**: Line ~349-356
- **Current**: Mock console.log and alert
- **Required API**: `POST /api/eventparticipation`
- **Request Body**: `{ eventId: number, userId: number, status: 'Accepted' | 'Pending' | 'Declined' }`
- **Response**: `EventParticipationModel`
- **Backend Service**: `EventParticipationService.Post()`
- **Notes**: 
  - Update participant list in UI after success
  - Handle duplicate registration error
  - Consider optimistic UI updates

### 8. Event Attendance - Unregister (`src/client/src/hooks/hooks.tsx` - `useEventDialog`)
- **Location**: Line ~358-365
- **Current**: Mock console.log and alert
- **Required API**: `DELETE /api/eventparticipation`
- **Request Body**: `{ eventId: number, userId: number }`
- **Response**: Success message or deleted entity
- **Backend Service**: `EventParticipationService.Delete(entity)`
- **Notes**: 
  - Update participant list in UI after success
  - Handle not-found errors gracefully

---

## 🏠 Home/Dashboard

### 9. Home Page Dashboard (`src/client/src/components/Home.tsx`)
- **Location**: Line ~7-16
- **Current**: Placeholder static content
- **Required APIs**:
  - `GET /api/events/upcoming?fromDate={today}` - Get upcoming events
  - `GET /api/eventparticipation/user/:userId` - Get user's event registrations
  - `GET /api/officeattendance/user/:userId` - Get office attendance data (optional)
- **Backend Services**: 
  - `EventsService.GetUpcomingEventsAsync(fromDate)`
  - `EventParticipationService.Get()`
  - `OfficeAttendanceService` (if implementing office tracking)
- **Features to Implement**:
  - User statistics (total events, attendance rate)
  - Upcoming events list
  - Recent activity feed
  - Office attendance status

---

## 🛠️ Future API Endpoints Needed

These features exist in the backend models but are not yet implemented in the frontend:

### 10. Event CRUD Operations
- **Create Event**: `POST /api/events`
  - Request: `{ title, description, eventDate, createdBy }`
  - Service: `EventsService.Post()`
  
- **Update Event**: `PUT /api/events/:id`
  - Request: `{ eventId, title, description, eventDate }`
  - Service: `EventsService.Put()`
  
- **Delete Event**: `DELETE /api/events/:id`
  - Service: `EventsService.Delete(id)`

### 11. Group Management
- **Fetch Groups**: `GET /api/groups`
  - Service: `GroupsService.Get()`
  
- **Group Memberships**: `GET /api/groupmemberships/user/:userId`
  - Service: `GroupMembershipsService`

### 12. Admin Functions
- **Manage Users**: `GET /api/employees`, `PUT /api/employees/:id`, `DELETE /api/employees/:id`
  - Service: `EmployeesService`
  
- **Manage Admins**: `GET /api/admins`, `POST /api/admins`
  - Service: `AdminsService`

### 13. Office Attendance
- **Check-in/Check-out**: `POST /api/officeattendance`
  - Service: `OfficeAttendanceService`

---

## 📋 Implementation Steps

1. **Setup API Client**
   - Create axios instance with base URL
   - Add JWT token interceptor for Authorization header
   - Add error handling interceptor
   - Create `src/client/src/services/api.ts`

2. **Create API Service Layer**
   - `src/client/src/services/authService.ts` - Login, register, verify
   - `src/client/src/services/eventsService.ts` - Event CRUD
   - `src/client/src/services/participationService.ts` - Attendance management

3. **Update Hooks**
   - Replace all mock data with actual API calls
   - Add loading states (isLoading)
   - Add error handling
   - Implement retry logic for failed requests

4. **Environment Configuration**
   - Create `.env` file with `REACT_APP_API_URL`
   - Update for different environments (dev, staging, prod)

5. **Testing**
   - Test each endpoint integration
   - Handle edge cases (network errors, validation errors)
   - Test token expiration and refresh

---

## 🔍 Search for TODO Comments

All locations marked with `TODO: Backend Integration` comments in the codebase:
- `src/client/src/components/Login.tsx` (line ~8)
- `src/client/src/components/Register.tsx` (line ~26)
- `src/client/src/components/MyEvents.tsx` (line ~29)
- `src/client/src/components/Home.tsx` (line ~7)
- `src/client/src/states/AuthContext.tsx` (lines ~34, ~50, ~57)
- `src/client/src/hooks/hooks.tsx` (lines ~108, ~187, ~349, ~358)

Use your IDE's search function to find all `TODO: Backend Integration` comments.

---

## 📝 Notes

- All dates from backend will be in ISO 8601 format - convert to Date objects
- JWT tokens should be stored securely (consider HttpOnly cookies for production)
- Implement request/response interceptors for consistent error handling
- Add loading spinners during API calls for better UX
- Consider implementing React Query or SWR for data fetching and caching
- Validate all user inputs on both frontend and backend
- Handle CORS properly in ASP.NET Core Program.cs

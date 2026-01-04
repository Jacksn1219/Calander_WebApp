# Controllers Overview - Complete Endpoint List

This document lists all implemented controllers and their endpoints in the Calender_WebApp API.

**Legend:**
- `[F]` = Used in Frontend (client/src)
- `[ ]` = Not used anywhere

---

## 1. AdminsController ✅
**Service:** `IAdminsService`  
**Base Route:** `/api/admins`  
**Endpoints:**
- [ ] `GET /api/admins/all-admins` — Get all admins
- [ ] `GET /api/admins/{id}` — Get admin by ID
- [ ] `GET /api/admins/by-username/{username}` — Get admin by username
- [ ] `POST /api/admins/create-admin` — Create new admin
- [ ] `PUT /api/admins/{id}` — Update admin
- [ ] `DELETE /api/admins/{id}` — Delete admin

---

## 2. EmployeesController ✅
**Service:** `IEmployeesService`, `IReminderPreferencesService`  
**Base Route:** `/api/employees`  
**Authorization:** Most endpoints require authentication; Create/Update/Delete require Admin or SuperAdmin role  
**Endpoints:**
- [F] `GET /api/employees` — Get all employees
- [F] `GET /api/employees/{id}` — Get employee by ID
- [ ] `GET /api/employees/by-email/{email}` — Get employee by email
- [F] `POST /api/employees` — Create new employee (Admin/SuperAdmin only) - also creates default reminder preferences
- [F] `PUT /api/employees/{id}` — Update employee (Admin/SuperAdmin only)
- [F] `DELETE /api/employees/{id}` — Delete employee (Admin/SuperAdmin only) - also deletes reminder preferences

---

## 3. EventsController ✅
**Service:** `IEventsService`, `IEventParticipationService`  
**Base Route:** `/api/events`  
**Authorization:** All endpoints require authentication; Update/Delete require Admin or SuperAdmin role  
**Endpoints:**
- [F] `GET /api/events` — Get all events
- [ ] `GET /api/events/{id}` — Get event by ID
- [ ] `GET /api/events/by-user/{userId}` — Get events created by user
- [ ] `GET /api/events/upcoming?fromDate={date}` — Get upcoming events from date
- [F] `POST /api/events` — Create new event
- [F] `PUT /api/events/{id}` — Update event (Admin/SuperAdmin only)
- [F] `DELETE /api/events/{id}` — Delete event (Admin/SuperAdmin only)

---

## 4. EventParticipationController ✅
**Service:** `IEventParticipationService`, `IRemindersService`  
**Base Route:** `/api/event-participation`  
**Endpoints:**
- [F] `GET /api/event-participation` — Get all participations
- [F] `GET /api/event-participation/event/{eventId}` — Get participations by event
- [ ] `GET /api/event-participation/user/{userId}` — Get participations by user
- [ ] `GET /api/event-participation/event/{eventId}/user/{userId}` — Check if user is participating
- [F] `POST /api/event-participation` — Create participation
- [ ] `PUT /api/event-participation/event/{eventId}/user/{userId}/status` — Update participation status (body: { "status": 0|1|2 })
- [F] `DELETE /api/event-participation` — Remove participation (body: { "eventId": int, "userId": int })

---

## 5. GroupsController ✅
**Service:** `IGroupsService`  
**Base Route:** `/api/Groups`  
**Endpoints:**
- [ ] `GET /api/Groups` — Get all groups
- [ ] `GET /api/Groups/{id}` — Get group by ID
- [ ] `GET /api/Groups/by-user/{userId}` — Get groups by user
- [ ] `POST /api/Groups` — Create new group
- [ ] `PUT /api/Groups/{id}` — Update group
- [ ] `DELETE /api/Groups/{id}` — Delete group

---

## 6. GroupMembershipsController ✅
**Service:** `IGroupMembershipsService`  
**Base Route:** `/api/GroupsMemberships`  
**Endpoints:**
- [ ] `GET /api/GroupsMemberships` — Get all memberships
- [ ] `GET /api/GroupsMemberships/group/{groupId}` — Get memberships by group
- [ ] `GET /api/GroupsMemberships/user/{userId}` — Get memberships by user
- [ ] `POST /api/GroupsMemberships` — Add user to group
- [ ] `DELETE /api/GroupsMemberships` — Remove user from group (body: { "groupId": int, "userId": int })

---

## 7. OfficeAttendanceController ✅
**Service:** `IOfficeAttendanceService`  
**Base Route:** `/api/office-attendance`  
**Endpoints:**
- [ ] `GET /api/office-attendance` — Get all attendance records
- [ ] `GET /api/office-attendance/{id}` — Get attendance by ID
- [ ] `GET /api/office-attendance/user/{userId}` — Get user's attendance for today
- [ ] `GET /api/office-attendance/user/{userId}/date/{date}` — Get specific user attendance on specific date
- [ ] `GET /api/office-attendance/date/{date}` — Get all attendance records by date
- [F] `GET /api/office-attendance/today/{userId}` — Get today's attendance for user
- [ ] `POST /api/office-attendance` — Create attendance record
- [F] `PUT /api/office-attendance/today/{userId}` — Update/upsert today's attendance (body: { "status": int })
- [ ] `DELETE /api/office-attendance/{id}` — Delete attendance

---

## 8. RoomsController ✅
**Service:** `IRoomsService`  
**Base Route:** `/api/Rooms`  
**Endpoints:**
- [F] `GET /api/Rooms` — Get all rooms
- [F] `GET /api/Rooms/{id}` — Get room by ID
- [ ] `GET /api/Rooms/by-name/{name}` — Get room by name
- [ ] `GET /api/Rooms/{id}/availability?start={start}&end={end}` — Check room availability
- [F] `GET /api/Rooms/available-by-capacity?start={start}&end={end}&capacity={capacity}` — Get available rooms by capacity
- [F] `POST /api/Rooms` — Create new room
- [F] `PUT /api/Rooms/{id}` — Update room
- [F] `DELETE /api/Rooms/{id}` — Delete room

---

## 9. RoomBookingsController ✅
**Service:** `IRoomBookingsService`, `IRemindersService`  
**Base Route:** `/api/room-bookings`  
**Endpoints:**
- [ ] `GET /api/room-bookings` — Get all bookings
- [F] `GET /api/room-bookings/{id}` — Get booking by ID
- [ ] `GET /api/room-bookings/room/{roomId}` — Get bookings by room
- [F] `GET /api/room-bookings/user/{userId}` — Get bookings by user
- [ ] `GET /api/room-bookings/available?start={start}&end={end}` — Get available rooms for date range
- [F] `POST /api/room-bookings` — Create new booking
- [F] `PUT /api/room-bookings/{bookingId}` — Update booking by ID
- [ ] `PATCH /api/room-bookings/update-start-time` — Update booking start time (body: { roomId, userId, bookingDate, startTime, endTime, newStartTime })
- [ ] `PATCH /api/room-bookings/update-end-time` — Update booking end time (body: { roomId, userId, bookingDate, startTime, endTime, newEndTime })
- [ ] `DELETE /api/room-bookings` — Delete booking (body: { roomId, userId, bookingDate, startTime, endTime }) - also deletes associated reminders

---

## 10. RemindersController ✅
**Service:** `IRemindersService`  
**Base Route:** `/api/reminders`  
**Endpoints:**
- [ ] `GET /api/reminders` — Get all reminders
- [F] `GET /api/reminders/user/{userId}` — Get reminders by user
- [ ] `GET /api/reminders/user/{userId}/bydate?fromTime={fromTime}&toTime={toTime}` — Get reminders by user within date range
- [ ] `GET /api/reminders/today/{userId}` — Get today's reminders for user
- [ ] `POST /api/reminders` — Create reminder
- [F] `PUT /api/reminders/mark-as-read/{reminderId}` — Mark reminder as read

---

## 11. ReminderPreferencesController ✅
**Service:** `IReminderPreferencesService`  
**Base Route:** `/api/reminderspreferences`  
**Endpoints:**
- [ ] `GET /api/reminderspreferences` — Get all reminder preferences
- [ ] `GET /api/reminderspreferences/room/{roomId}` — Get reminder preferences by room ID
- [F] `GET /api/reminderspreferences/user/{userId}` — Get reminder preferences by user
- [F] `PATCH /api/reminderspreferences/{id}/toggle-eventreminder` — Toggle event reminders on/off
- [F] `PATCH /api/reminderspreferences/{id}/toggle-bookingreminder` — Toggle booking reminders on/off
- [F] `PATCH /api/reminderspreferences/{id}/advance-minutes` — Update advance minutes (body: string in timespan format)

---

## 12. LoginController (AuthController) ✅
**Service:** `AuthService`  
**Base Route:** `/api/auth`  
**Endpoints:**
- [F] `POST /api/auth/login` — Login (body: { "email": string, "password": string }) - returns JWT token and user info
- [F] `GET /api/auth/me` — Get current authenticated user info (requires Authorization header)

---

## 13. TestController ✅
**Service:** None  
**Base Route:** `/api/test`  
**Endpoints:**
- [ ] `GET /api/test/secure` — Authenticated test endpoint (requires JWT token)
- [ ] `GET /api/test/public` — Public test endpoint (no authentication required)

---

## Summary

**Total Controllers:** 13  
**Total Endpoints:** 85+

**Authentication Notes:**
- Most endpoints require JWT authentication via `[Authorize]` attribute
- Admin/SuperAdmin roles required for certain operations (Create/Update/Delete in most controllers)
- Public endpoints: `/api/auth/login` and `/api/test/public`

**Key Features:**
- Automatic reminder preference creation when creating employees
- Automatic reminder deletion when deleting room bookings
- Cascade operations for employee deletion (includes reminder preferences)
- JWT token-based authentication system


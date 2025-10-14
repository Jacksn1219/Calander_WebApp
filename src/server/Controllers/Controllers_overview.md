# Needed Controllers Based on Services

Based on your **Services** folder, you need the following **10 controllers**:

---

## 1. AdminsController
**Service:** `IAdminsService`  
**Endpoints:**
- `GET /api/admins` — Get all admins
- `GET /api/admins/{id}` — Get admin by ID
- `GET /api/admins/by-username/{username}` — Get admin by username
- `POST /api/admins` — Create new admin
- `PUT /api/admins/{id}` — Update admin
- `DELETE /api/admins/{id}` — Delete admin

---

## 2. EmployeesController
**Service:** `IEmployeesService`  
**Endpoints:**
- `GET /api/employees` — Get all employees
- `GET /api/employees/{id}` — Get employee by ID
- `GET /api/employees/by-email/{email}` — Get employee by email
- `POST /api/employees` — Create new employee
- `PUT /api/employees/{id}` — Update employee
- `DELETE /api/employees/{id}` — Delete employee

---

## 3. EventsController
**Service:** `IEventsService`  
**Endpoints:**
- `GET /api/events` — Get all events
- `GET /api/events/{id}` — Get event by ID
- `GET /api/events/by-user/{userId}` — Get events created by user
- `GET /api/events/upcoming?fromDate={date}` — Get upcoming events
- `POST /api/events` — Create new event
- `PUT /api/events/{id}` — Update event
- `DELETE /api/events/{id}` — Delete event

---

## 4. EventParticipationController
**Service:** `IEventParticipationService`  
**Endpoints:**
- `GET /api/event-participation` — Get all participations
- `GET /api/event-participation/event/{eventId}` — Get participations by event
- `GET /api/event-participation/user/{userId}` — Get participations by user
- `GET /api/event-participation/event/{eventId}/user/{userId}` — Check if user is participating
- `POST /api/event-participation` — Create participation
- `PUT /api/event-participation/event/{eventId}/user/{userId}/status` — Update participation status (body: { "status": "Accepted|Declined|Pending" })
- `DELETE /api/event-participation` — Remove participation (body: { "eventId": int, "userId": int })

---

## 5. GroupsController
**Service:** `IGroupsService`  
**Endpoints:**
- `GET /api/groups` — Get all groups
- `GET /api/groups/{id}` — Get group by ID
- `GET /api/groups/by-user/{userId}` — Get groups by user
- `POST /api/groups` — Create new group
- `PUT /api/groups/{id}` — Update group
- `DELETE /api/groups/{id}` — Delete group

---

## 6. GroupMembershipsController
**Service:** `IGroupMembershipsService`  
**Endpoints:**
- `GET /api/group-memberships` — Get all memberships
- `GET /api/group-memberships/group/{groupId}` — Get memberships by group
- `GET /api/group-memberships/user/{userId}` — Get memberships by user
- `POST /api/group-memberships` — Add user to group
- `DELETE /api/group-memberships` — Remove user from group

---

## 7. OfficeAttendanceController
**Service:** `IOfficeAttendanceService`  
**Endpoints:**
- `GET /api/office-attendance` — Get all attendance records
- `GET /api/office-attendance/{id}` — Get attendance by ID
- `GET /api/office-attendance/user/{userId}` — Get all attendance records for user
- `GET /api/office-attendance/user/{userId}/date/{date}` — Get specific user attendance on specific date
- `GET /api/office-attendance/date/{date}` — Get all attendance records by date
- `POST /api/office-attendance` — Create attendance record
- `PUT /api/office-attendance/{id}` — Update attendance
- `DELETE /api/office-attendance/{id}` — Delete attendance

---

## 8. RoomsController
**Service:** `IRoomsService`  
**Endpoints:**
- `GET /api/rooms` — Get all rooms
- `GET /api/rooms/{id}` — Get room by ID
- `GET /api/rooms/by-name/{name}` — Get room by name
- `GET /api/rooms/{id}/availability?start={start}&end={end}` — Check room availability
- `POST /api/rooms` — Create new room
- `PUT /api/rooms/{id}` — Update room
- `DELETE /api/rooms/{id}` — Delete room

---

## 9. RoomBookingsController
**Service:** `IRoomBookingsService`  
**Endpoints:**
- `GET /api/room-bookings` — Get all bookings
- `GET /api/room-bookings/room/{roomId}` — Get bookings by room
- `GET /api/room-bookings/user/{userId}` — Get bookings by user
- `GET /api/room-bookings/available?start={start}&end={end}` — Get available rooms for date range
- `POST /api/room-bookings` — Create new booking
- `PATCH /api/room-bookings/update-start-time` — Update booking start time (body: booking details + newStartTime)
- `PATCH /api/room-bookings/update-end-time` — Update booking end time (body: booking details + newEndTime)
- `DELETE /api/room-bookings` — Delete booking (body: booking details)

---

## 10. CrudController (Base/Generic - Optional)
**Service:** `ICrudService<T>`  
This would be a base controller that other controllers inherit from, providing common CRUD operations.

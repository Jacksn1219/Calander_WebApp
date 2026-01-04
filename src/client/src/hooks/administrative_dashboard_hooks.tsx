import { useState, useEffect } from 'react';
import { apiFetch } from '../config/api';
import { useAuth } from '../auth/AuthContext';
import { EventItem } from '../types/event_types';
import { Employee } from '../types/user_types';
import { RoomDto } from '../types/room_types';

/*
 ====================================
ADMINISTRATIVE DASHBOARD HOOKS
 ====================================
 */
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
      const rawData = await response.json();

      // Normalize property names from backend (PascalCase/snake_case) to camelCase
      const data: EventItem[] = rawData.map((ev: any) => {
        return {
          event_id: ev.event_id ?? ev.EventId ?? ev.Id,
          title: ev.title ?? ev.Title ?? '',
          description: ev.description ?? ev.Description ?? '',
          eventDate: ev.eventDate ?? ev.EventDate ?? ev.event_date ?? '',
          endTime: ev.endTime ?? ev.EndTime ?? ev.end_time ?? '',
          location: ev.location ?? ev.Location ?? null,
          roomId: ev.roomId ?? ev.RoomId ?? ev.room_id ?? undefined,
          bookingId: ev.bookingId ?? ev.BookingId ?? ev.booking_id ?? ev.roomBookingId ?? ev.RoomBookingId ?? ev.room_booking_id ?? null,
          createdBy: ev.createdBy ?? ev.CreatedBy ?? ev.created_by ?? 0,
          expectedAttendees: ev.expectedAttendees ?? ev.ExpectedAttendees ?? ev.expected_attendees ?? null,
        };
      });

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

      setUsernames((u) => ({ ...u, [id]: employee.name }));
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
      
      // Get the current room ID - either from selectedRoomId or fetch from existing booking
      let currentRoomId = selectedRoomId;
      
      if (bookingId && currentRoomId === null) {
        // If we have a booking but no room selected, fetch the room from the booking
        const bookingRes = await apiFetch(`/api/room-bookings/${bookingId}`);
        if (bookingRes.ok) {
          const bookingData = await bookingRes.json();
          currentRoomId = bookingData.roomId ?? bookingData.RoomId ?? null;
          // Also update state for future reference
          setSelectedRoomId(currentRoomId);
        }
      }
      
      // Only create/update room booking if a room is selected
      if (currentRoomId !== null) {
        const bookingPayload = {
          roomId: currentRoomId,
          userId: bookingOwner,
          bookingDate: `${formData.date}T00:00:00`,
          startTime: `${formData.startTime}:00`,
          endTime: `${formData.endTime}:00`,
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
    bookingId: null as number | null,
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

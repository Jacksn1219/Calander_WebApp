import React, { useState } from 'react';
import '../styles/RoomBooking.css';
import '../styles/login-page.css';
import Sidebar from './Sidebar';

type Room = {
  room_id: number;
  room_name: string;
  capacity: number;
  location: string;
};

type RoomBooking = {
  room_id: number;
  user_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  purpose: string;
};

const testUser = {
  user_id: 102,
  name: "John Doe"
};

const testRooms: Room[] = [
  { room_id: 1, room_name: 'Vergaderruimte A', capacity: 6, location: '1e verdieping' },
  { room_id: 2, room_name: 'Vergaderruimte B', capacity: 10, location: '2e verdieping' },
];

const testBookings: RoomBooking[] = [
  {
    room_id: 1,
    user_id: 102,
    booking_date: '2025-10-14',
    start_time: '10:00',
    end_time: '11:00',
    purpose: 'Important Announcement',
  },
  {
    room_id: 2,
    user_id: 103,
    booking_date: '2025-10-14',
    start_time: '14:00',
    end_time: '15:30',
    purpose: 'Discussion about AI',
  },
];

const RoomBooking: React.FC = () => {
  const [roomId, setRoomId] = useState<number | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [bookings, setBookings] = useState<RoomBooking[]>(testBookings);
  const [message, setMessage] = useState('');

  const checkConflict = (roomId: number, bookingDate: string, start: string, end: string): boolean => {
    const toMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const newStart = toMinutes(start);
    const newEnd = toMinutes(end);

    return bookings.some(
      (b) =>
        b.room_id === roomId &&
        b.booking_date === bookingDate &&
        toMinutes(b.start_time) < newEnd &&
        toMinutes(b.end_time) > newStart
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomId || !bookingDate || !startTime || !endTime || !purpose) {
      setMessage('Vul alle velden in.');
      return;
    }

    if (checkConflict(roomId, bookingDate, startTime, endTime)) {
      setMessage('Tijdslot al geboekt voor deze ruimte.');
      return;
    }

    const newBooking: RoomBooking = {
      room_id: roomId,
      user_id: testUser.user_id,
      booking_date: bookingDate,
      start_time: startTime,
      end_time: endTime,
      purpose,
    };

    setBookings([...bookings, newBooking]);
    setMessage('Boeking succesvol toegevoegd!');

    setRoomId(null);
    setBookingDate('');
    setStartTime('');
    setEndTime('');
    setPurpose('');
  };
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="booking-container">
        <form className="booking-card" onSubmit={(e) => handleSubmit(e)}>
          <h2>Reserveer een vergaderruimte</h2>
          <p>Vul de gegevens in om een ruimte te reserveren.</p>

          <label>Ruimte</label>
          <select value={roomId ?? ''} onChange={(e) => setRoomId(Number(e.target.value))}>
            <option value="">Kies een ruimte</option>
            {testRooms.map((room) => (
              <option key={room.room_id} value={room.room_id}>
                {room.room_name} ({room.capacity} pers, {room.location})
              </option>
            ))}
          </select>

          <label>Datum</label>
          <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />

          <label>Starttijd</label>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />

          <label>Eindtijd</label>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />

          <label>Opmerking</label>
          <input type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Bijv. teams meeting" />

          <button type="submit">Reserveer</button>

          {message && <p className="message">{message}</p>}
        </form>

        {roomId && bookingDate && (
          <div className="existing-bookings">
            <h4>Huidige boekingen</h4>
            <ul>
              {bookings
                .filter((b) => b.room_id === roomId && b.booking_date === bookingDate)
                .map((b, i) => (
                  <li key={i}>
                    {b.start_time} - {b.end_time}: {b.purpose}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomBooking;

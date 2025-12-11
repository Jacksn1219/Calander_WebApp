import React from "react";
import "../styles/RoomBooking.css";
import "../styles/login-page.css";
import Sidebar from "./Sidebar";
import { useRoomBooking } from "../hooks/hooks";

const RoomBooking: React.FC = () => {
  const { rooms, bookings, roomId, bookingDate, startTime, endTime, purpose, message,
    setRoomId, setBookingDate, setStartTime, setEndTime, setPurpose, handleSubmit } = useRoomBooking();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="booking-container">
        <form className="booking-card" onSubmit={handleSubmit}>
          <h2>Book a meeting room</h2>
          <p>Please fill the details to reserve a room.</p>

          <label>Room</label>
          <select value={roomId ?? ""} onChange={(e) => setRoomId(Number(e.target.value))}>
            <option value="">Choose a room</option>
            {rooms.map((room) => (
              <option key={room.room_id} value={room.room_id}>
                {room.roomName} ({room.capacity} pers, {room.location})
              </option>
            ))}
          </select>

          <label>Date</label>
          <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />

          <label>Start time</label>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />

          <label>End time</label>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />

          <label>Purpose</label>
          <input type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Bijv. teams meeting" />

          <button type="submit">Make a reservation</button>

          {message && <p className="message">{message}</p>}
        </form>

        {(roomId && bookingDate && bookings.length > 0) ? (
          <div className="existing-bookings">
            <h4>Booked rooms for {new Date(bookingDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}</h4>
            <ul>
              {bookings.map((b) => (
                <li key={b.booking_id ?? `${b.startTime}-${b.endTime}`}>
                  {b.startTime.slice(0, 5)} - {b.endTime.slice(0, 5)}: {b.purpose}
                </li>
              ))}
            </ul>
          </div>
        ) : ""}
      </div>
    </div>
  );
};

export default RoomBooking;
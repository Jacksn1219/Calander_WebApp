import React from "react";
import "../styles/RoomBooking.css";
import "../styles/login-page.css";
import Sidebar from "./Sidebar";
import { useRoomBooking } from "../hooks/hooks";

const RoomBooking: React.FC = () => {
  const {
    rooms,
    bookings,
    roomId,
    bookingDate,
    startTime,
    endTime,
    capacity,
    purpose,
    message,

    setRoomId,
    setBookingDate,
    setStartTime,
    setEndTime,
    setCapacity,
    setPurpose,
    handleSubmit,
  } = useRoomBooking();

  const formattedDate = bookingDate
    ? new Date(bookingDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="booking-container">
        <form className="booking-card" onSubmit={handleSubmit}>
          <h2>Book a meeting room</h2>
          <p>Please fill the details to reserve a room.</p>

          <label>Date</label>
          <input
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
          />

          <label>Start time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />

          <label>End time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />

          <label>Capacity</label>
          <input
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
          />

          <label>Purpose</label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Optional purpose"
          />

          {rooms.length > 0 && (
            <>
              <label>Select Room</label>
              <select
                value={roomId ?? ""}
                onChange={(e) => setRoomId(Number(e.target.value))}
              >
                <option value="">Choose a room</option>
                {rooms.map((room) => (
                  <option key={room.room_id} value={room.room_id}>
                    {room.roomName} ({room.capacity} pers, {room.location})
                  </option>
                ))}
              </select>
            </>
          )}

          <button type="submit" disabled={!roomId}>
            Make a reservation
          </button>

          {message && <p className="message">{message}</p>}
        </form>

        {roomId && bookingDate && bookings.length > 0 ? (
          <div className="existing-bookings">
            <h4>Booked rooms for {formattedDate}</h4>
            <ul>
              {bookings.map((b) => (
                <li key={b.booking_id ?? `${b.startTime}-${b.endTime}`}>
                  {b.startTime.slice(0, 5)} - {b.endTime.slice(0, 5)}:{" "}
                  {b.purpose}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default RoomBooking;

import React from "react";
import "../styles/event-dialog.css";
import "../styles/RoomBooking.css";
import { useCreateRoomBookingDialog } from "../hooks/hooks";

interface RoomBookingDialogProps {
  onClose: () => void;
  selectedDate: Date;
  reloadBookings: () => void
}

const RoomBookingDialog: React.FC<RoomBookingDialogProps> = ({ onClose, selectedDate, reloadBookings }) => {
  const { rooms, bookings, roomId, startTime, endTime, capacity, purpose, message,
    setRoomId, setStartTime, setEndTime, setCapacity, setPurpose, handleSubmit } = useCreateRoomBookingDialog(onClose, selectedDate, reloadBookings);

  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    : "";

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="dialog-backdrop" onClick={(e) => handleBackdropClick(e)}>
      <div className="dialog-content">
        <div className="dialog-header">
          <h2>Book a room on {selectedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</h2>
          <button className="btn-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="dialog-body">
          <form className="booking-card" onSubmit={handleSubmit}>
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

            <div className="create-event-buttons">
              <button type="submit" disabled={!roomId} className="create-event-save">
                Make Reservation
              </button>
              <button type="button" className="create-event-cancel" onClick={onClose}>
                Cancel
              </button>
            </div>

            {message && <p className="message">{message}</p>}
          </form>

          {roomId && selectedDate && bookings.length > 0 && (
            <div className="existing-bookings">
              <h4>Booked rooms for {formattedDate}</h4>
              <ul>
                {bookings.map((b) => (
                  <li key={b.booking_id ?? `${b.startTime}-${b.endTime}`}>
                    {b.startTime.slice(0, 5)} - {b.endTime.slice(0, 5)}: {b.purpose}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomBookingDialog;

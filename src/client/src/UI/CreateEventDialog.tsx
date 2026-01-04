import React, { useRef, useEffect } from "react";
import "../styles/event-dialog.css";
import "../styles/create-event-dialog.css";
import { useCreateEvent } from "../hooks/hooks";

interface CreateEventDialogProps {
  onClose: () => void;
  reloadEvents: () => void;
  defaultDate?: Date;
}

const CreateEventDialog: React.FC<CreateEventDialogProps> = ({ onClose, reloadEvents, defaultDate }) => {
  const { formData, availableRooms, showRoomDropdown, setShowRoomDropdown, selectRoom, handleChange, handleSubmit, handleCancel } = useCreateEvent(onClose, reloadEvents, defaultDate);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowRoomDropdown(false);
      }
    };
    if (showRoomDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showRoomDropdown, setShowRoomDropdown]);

  // ESC key handler and focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent background scroll while dialog open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, []);

  return (
    <div className="create-dialog-backdrop" onClick={handleBackdropClick} ref={dialogRef}>
      <div className="dialog-content">
        <div className="dialog-header">
          <h2>Create Event</h2>
          <button className="btn-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="dialog-body">
          <form className="create-event-form" onSubmit={handleSubmit}>
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              required
            />
            
            <label>Description *</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter event description"
              required
            />
            
            <label>Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
            
            <label>Start Time *</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
            
            <label>End Time *</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
            />

            <label>Number of Invitees *</label>
            <input
              type="number"
              name="expectedAttendees"
              value={formData.expectedAttendees}
              onChange={handleChange}
              min="1"
              placeholder="1"
              required
            />
            
            <label>Location *</label>
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                onFocus={() => formData.location === '' && setShowRoomDropdown(true)}
                placeholder={formData.expectedAttendees > 0 ? "Start typing or select a room..." : "Enter attendee count first"}
                disabled={formData.expectedAttendees <= 0}
              />
              
              {showRoomDropdown && availableRooms.length > 0 && (
                <div className="dropdown-menu">
                  {availableRooms.map((room) => (
                    <div
                      key={room.room_id}
                      onClick={() => selectRoom(room)}
                      className="dropdown-item"
                    >
                      {room.roomName} (Capacity: {room.capacity})
                    </div>
                  ))}
                </div>
              )}

              {showRoomDropdown && availableRooms.length === 0 && formData.expectedAttendees > 0 && (
                <div className="dropdown-empty">
                  No available rooms for this time
                </div>
              )}
            </div>
            
            <div className="create-event-buttons">
              <button type="submit" className="create-event-save">
                CREATE
              </button>
              <button type="button" className="create-event-cancel" onClick={handleCancel}>
                CANCEL
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventDialog;
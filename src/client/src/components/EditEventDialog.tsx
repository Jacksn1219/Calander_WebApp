import React, { useRef, useEffect } from "react";
import "../styles/event-dialog.css";
import "../styles/edit-event.css";
import { EventItem, useEditEvent } from "../hooks/hooks";

interface EditEventDialogProps {
  currentEvent: EventItem | undefined;
  onClose: () => void;
  reloadEvents: () => void;
}

const EditEventDialog: React.FC<EditEventDialogProps> = ({ currentEvent, onClose, reloadEvents }) => {
  const { formData, availableRooms, showRoomDropdown, setShowRoomDropdown, selectRoom, handleChange, handleSave, handleCancel } = useEditEvent(currentEvent, onClose, reloadEvents);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="dialog-backdrop edit-dialog-backdrop" onClick={handleBackdropClick}>
      <div className="dialog-content">
        <div className="dialog-header">
          <h2>Edit Event</h2>
          <button className="btn-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="dialog-body">
          <form className="edit-event-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
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

            <label>Number of Attendees *</label>
            <input
              type="number"
              name="expectedAttendees"
              value={formData.expectedAttendees}
              onChange={handleChange}
              min="1"
              placeholder="Enter number of attendees"
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
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  marginTop: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {availableRooms.map((room) => (
                    <div
                      key={room.room_id}
                      onClick={() => selectRoom(room)}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <strong>{room.roomName}</strong> (Capacity: {room.capacity})
                    </div>
                  ))}
                </div>
              )}

              {showRoomDropdown && availableRooms.length === 0 && formData.expectedAttendees > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  zIndex: 1000,
                  marginTop: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  color: '#666'
                }}>
                  No available rooms for this time
                </div>
              )}
            </div>
            
            <div className="edit-event-buttons">
              <button type="submit" className="edit-event-save">SAVE</button>
              <button type="button" className="edit-event-cancel" onClick={handleCancel}>CANCEL</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEventDialog;
import React from "react";
import "../styles/event-dialog.css";
import "../styles/edit-event.css";
import { EventItem, useEditEvent } from "../hooks/hooks";

interface EditEventDialogProps {
  currentEvent: EventItem | undefined;
  onClose: () => void;
  reloadEvents: () => void
}

const EditEventDialog: React.FC<EditEventDialogProps> = ({ currentEvent, onClose, reloadEvents }) => {
  const { formData, handleChange, handleSave, handleCancel, generateTimeOptions } = useEditEvent(currentEvent, onClose, reloadEvents);
  
  const timeOptions = generateTimeOptions();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="dialog-content">
        <div className="dialog-header">
          <h2>Edit Event</h2>
          <button className="btn-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="dialog-body">
          <div className="event-details">
            <div className="create-event-form">
                <label>Title:</label>
                <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                />
                <label>Description:</label>
                <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                />
                <label>Date:</label>
                <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                />
                <label>Time:</label>
                <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                >
                  <option value="">Select time</option>
                  {timeOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <label>Duration (minutes):</label>
                <input
                type="number"
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleChange}
                min="1"
                placeholder="Duration in minutes"
                />
                <label>Room ID (optional):</label>
                <input
                type="number"
                name="roomId"
                value={formData.roomId || ''}
                onChange={handleChange}
                placeholder="Enter room ID (optional)"
                />
                <div className="edit-event-buttons">
                <button className="edit-event-save" onClick={handleSave}>SAVE</button>
                <button className="edit-event-cancel" onClick={handleCancel}>CANCEL</button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEventDialog;
import React from "react";
import "../styles/event-dialog.css";
import "../styles/create-event.css";
import { useCreateEvent } from "../hooks/hooks";

interface CreateEventDialogProps {
  onClose: () => void;
  reloadEvents: () => void
}

const CreateEventDialog: React.FC<CreateEventDialogProps> = ({ onClose, reloadEvents }) => {
  const { formData, handleChange, handleSubmit, handleCancel, generateTimeOptions } = useCreateEvent(onClose, reloadEvents);
  
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
          <h2>Create Event</h2>
          <button className="btn-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="dialog-body">
          <form className="booking-card" onSubmit={handleSubmit}>
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
            />
            
            <label>Description:</label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter event description"
              />
            
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
            
            <label>Time</label>
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
            
            <label>Duration (minutes)</label>
            <input
              type="number"
              name="durationMinutes"
              value={formData.durationMinutes}
              onChange={handleChange}
              min="1"
              placeholder="Duration in minutes"
            />
            
            <label>Room ID (optional)</label>
            <input
              type="number"
              name="roomId"
              value={formData.roomId || ''}
              onChange={handleChange}
              placeholder="Enter room ID (optional)"
            />
            
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
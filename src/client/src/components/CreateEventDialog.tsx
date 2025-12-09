import React from "react";
import "../styles/event-dialog.css";
import "../styles/create-event.css";
import { useCreateEvent } from "../hooks/hooks";

interface CreateEventDialogProps {
  onClose: () => void;
  reloadEvents: () => void
}

const CreateEventDialog: React.FC<CreateEventDialogProps> = ({ onClose, reloadEvents }) => {
  const { formData, handleChange, handleSubmit, handleCancel } = useCreateEvent(onClose, reloadEvents);

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
          <div className="event-details">
            <div className="create-event-form">
              <label>Title:</label>
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
              <label>Date:</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
              <div className="create-event-buttons">
                <button className="create-event-save" onClick={(e) => handleSubmit(e)}>
                  CREATE
                </button>
                <button className="create-event-cancel" onClick={handleCancel}>
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventDialog;
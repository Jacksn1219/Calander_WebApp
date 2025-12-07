import React from "react";
import "../styles/event-dialog.css";
import "../styles/edit-event.css";
import { EventItem, useEditEvent } from "../hooks/hooks";

interface EditEventDialogProps {
  currentEvent: EventItem | undefined;
  onClose: () => void;
}

const EditEventDialog: React.FC<EditEventDialogProps> = ({ currentEvent, onClose }) => {
  const { formData, handleChange, handleSave, handleCancel } = useEditEvent(currentEvent, onClose);

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
import React from "react";
import { useParams } from "react-router-dom";
import "../styles/edit-event.css";
import Sidebar from "./Sidebar";
import { useEditEvent } from "../hooks/hooks";

const EditEvent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { eventData, formData, handleChange, handleSave, handleCancel } = useEditEvent(id);

  if (!eventData) return null;

  return (
    <div className="edit-event-layout">
      <Sidebar />
      <div className="edit-event-dashboard">
        <div className="edit-event-section">
          <h1>Edit Event</h1>

          <div className="edit-event-form">
            <label>ID:</label>
            <input type="text" value={id} disabled />

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

            <label>Created By:</label>
            <input
              type="text"
              name="createdBy"
              value={formData.createdBy}
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
  );
};

export default EditEvent;

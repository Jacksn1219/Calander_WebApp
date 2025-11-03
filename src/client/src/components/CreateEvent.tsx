import React from "react";
import "../styles/create-event.css";
import Sidebar from "./Sidebar";
import { useCreateEvent } from "../hooks/hooks";

const CreateEvent: React.FC = () => {
  const { formData, handleChange, handleSave, handleCancel } = useCreateEvent();

  return (
    <div className="create-event-layout">
      <Sidebar />
      <div className="create-event-dashboard">
        <div className="create-event-section">
          <h1>Create Event</h1>

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
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Enter event description"
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

            <div className="create-event-buttons">
              <button className="create-event-save" onClick={handleSave}>
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
  );
};

export default CreateEvent;

import React, { useState } from "react";
import "../styles/administrative-dashboard.css";
import Sidebar from "./Sidebar";
import { useAdministrativeDashboard } from "../hooks/hooks";
import CreateEventDialog from "./CreateEventDialog";
import EditEventDialog from "./EditEventDialog";

const AdministrativeDashboard: React.FC = () => {
  const { events, currentEvent, setEvent, usernames, handleCreate, handleEdit, handleViewAttendees, handleDelete } = useAdministrativeDashboard();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  return (
    <div className="administrative-layout">
      <Sidebar />
      <div className="administrative-dashboard">
        <div className="events-section">
          <h1>Administrative Dashboard</h1>
          <h2>Events</h2>

          <button className="create-button" onClick={() => setShowCreateDialog(true)}>Create new event</button>

          { events.length != 0 ? (
          <table className="administrative-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Date</th>
                <th>Created By</th>
                <th>Attendees</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.event_id}>
                  <td>{event.title}</td>
                  <td>{event.description}</td>
                  <td>{event.eventDate}</td>
                  <td>{usernames[event.createdBy]}</td>
                  <td>
                    <button className="view-button" onClick={() => handleViewAttendees(event.event_id)}>
                      VIEW
                    </button>
                  </td>
                  <td>
                    <button
                      className="edit-button"
                      onClick={() => {
                        setEvent(event);
                        setShowEditDialog(true);
                      }}
                    >
                      EDIT
                    </button>
                  </td>
                  <td>
                    <button className="delete-button" onClick={() => handleDelete(event.event_id)}>
                      DELETE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          ) : <h2>There are no events. Create an event first</h2>}
        </div>
      </div>
      {showCreateDialog && (
        <CreateEventDialog onClose={() => setShowCreateDialog(false)} />
      )}
      {showEditDialog && (
        <EditEventDialog 
          currentEvent={currentEvent} 
          onClose={() => setShowEditDialog(false)} 
        />
      )}
    </div>
  );
};

export default AdministrativeDashboard;

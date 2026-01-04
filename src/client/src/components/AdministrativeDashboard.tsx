import React, { useState } from "react";
import "../styles/administrative-dashboard.css";
import Sidebar from "../UI/Sidebar";
import { useNavigate } from "react-router-dom";
import { useAdministrativeDashboard } from "../hooks/hooks";
import CreateEventDialog from "../UI/CreateEventDialog";
import EditEventDialog from "../UI/EditEventDialog";
import ViewAttendeesDialog from "../UI/ViewAttendeesDialog";

const AdministrativeDashboard: React.FC = () => {
  const { events, currentEvent, setEvent, usernames, handleDelete, fetchEvents } = useAdministrativeDashboard();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="administrative-layout">
      <Sidebar />
      <div className="administrative-dashboard">
        <div className="events-section">
          <div style={{ marginBottom: 16 }}>
            <button
              className="btn-today"
              style={{ minWidth: 180, height: 40 }}
              onClick={() => navigate('/admin-panel')}
            >
              Go Back to Admin Panel
            </button>
          </div>
          <h1>Administrative Dashboard</h1>
          <h2>Manage events and attendees</h2>
          <button className="create-button" onClick={() => setShowCreateDialog(true)}>Create new event</button>

          { events.length !== 0 ? (
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
                  <td>{new Date(event.eventDate).toLocaleDateString()}</td>
                  <td>{usernames[event.createdBy]}</td>
                  <td>
                    <button
                      className="view-button"
                      onClick={() => {
                        setEvent(event);
                        setShowViewDialog(true);
                      }}
                    >
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
          ) : <p className="muted">There are no events. Create an event first</p>}
        </div>
      </div>
      {showCreateDialog && (
        <CreateEventDialog 
          onClose={() => setShowCreateDialog(false)}
          reloadEvents={fetchEvents}
        />
      )}
      {showEditDialog && (
        <EditEventDialog 
          currentEvent={currentEvent} 
          onClose={() => setShowEditDialog(false)} 
          reloadEvents={fetchEvents}
        />
      )}
      {showViewDialog && (
        <ViewAttendeesDialog 
          currentEvent={currentEvent} 
          onClose={() => setShowViewDialog(false)} 
        />
      )}
    </div>
  );
};

export default AdministrativeDashboard;

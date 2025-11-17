import React from "react";
import "../styles/administrative-dashboard.css";
import Sidebar from "./Sidebar";
import { useAdministrativeDashboard } from "../hooks/hooks";

const AdministrativeDashboard: React.FC = () => {
  const { events, handleCreate, handleEdit, handleViewAttendees, handleDelete } = useAdministrativeDashboard();

  return (
    <div className="administrative-layout">
      <Sidebar />
      <div className="administrative-dashboard">
        <div className="events-section">
          <h1>Administrative Dashboard</h1>
          <h2>Events</h2>

          <button className="create-button" onClick={handleCreate}>
            Create new event
          </button>
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
                <tr key={event.id}>
                  <td>{event.title}</td>
                  <td>{event.description}</td>
                  <td>{event.date}</td>
                  <td>{event.createdBy}</td>
                  <td>
                    <button className="view-button" onClick={() => handleViewAttendees(event.id)}>
                      VIEW
                    </button>
                  </td>
                  <td>
                    <button className="edit-button" onClick={() => handleEdit(event.id)}>
                      EDIT
                    </button>
                  </td>
                  <td>
                    <button className="delete-button" onClick={() => handleDelete(event.id)}>
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
    </div>
  );
};

export default AdministrativeDashboard;

import React from "react";
import "../styles/admin-dashboard.css";
import Sidebar from "./Sidebar";
import { useAdminDashboard } from "../hooks/hooks";

const AdminDashboard: React.FC = () => {
  const { events, handleCreate, handleEdit, handleDelete } = useAdminDashboard();

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-dashboard">
        <div className="events-section">
          <h1>Admin Dashboard</h1>
          <h2>Events</h2>

          <button className="create-button" onClick={handleCreate}>
            CREATE EVENT
          </button>

          <table className="admin-table">
            <thead>
              <tr>
                <th>id</th>
                <th>title</th>
                <th>description</th>
                <th>datum</th>
                <th>created_by</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.id}</td>
                  <td>{event.title}</td>
                  <td>{event.description}</td>
                  <td>{event.date}</td>
                  <td>{event.createdBy}</td>
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

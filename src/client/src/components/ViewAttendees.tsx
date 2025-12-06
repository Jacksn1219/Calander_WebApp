import React from "react";
import "../styles/administrative-dashboard.css";
import Sidebar from "./Sidebar";
import { useViewAttendees } from "../hooks/hooks";

const ViewAttendees: React.FC = () => {
  const { employees, handleBack } = useViewAttendees();

  return (
    <div className="administrative-layout">
      <Sidebar />
      <div className="administrative-dashboard">
        <div className="events-section">
          <h1>Administrative Dashboard</h1>
          <h2>Events</h2>

          { employees.length != 0 ? (
          <table className="administrative-table">
            <thead>
              <tr>
                <th>User Id</th>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.user_id}>
                  <td>{employee.user_id}</td>
                  <td>{employee.name}</td>
                  <td>{employee.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
          ) : <h2>There are no events. Create an event first</h2>}
        </div>
        <button className="create-event-cancel" onClick={handleBack}>
          CANCEL
        </button>
      </div>
    </div>
  );
};

export default ViewAttendees;
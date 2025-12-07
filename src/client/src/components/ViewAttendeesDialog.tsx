import React from "react";
import "../styles/event-dialog.css";
import "../styles/view-attendees.css";
import { EventItem, useViewAttendees } from "../hooks/hooks";

interface ViewAttendeesDialogProps {
  currentEvent: EventItem | undefined;
  onClose: () => void;
}

const ViewAttendeesDialog: React.FC<ViewAttendeesDialogProps> = ({ currentEvent, onClose }) => {
  const { employees, handleCancel } = useViewAttendees(currentEvent, onClose);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="dialog-content">
        <div className="dialog-header">
          <h2>View Attendees</h2>
          <button className="btn-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="dialog-body">
          <div className="event-details">
            <div>
                { employees.length != 0 ? (
                <>
                    <h2>Users</h2>
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
                </>
                ) : <p>There are no people attending this event.</p>}
                <div className="view-attendees-buttons">
                <button className="view-attendees-cancel" onClick={handleCancel}>CANCEL</button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAttendeesDialog;
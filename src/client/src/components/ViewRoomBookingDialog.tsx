import React, { useState } from "react";
import "../styles/event-dialog.css";
import "../styles/view-room-booking.css";
import { RoomBooking, Room } from "../hooks/hooks";
import { useViewRoomBookingsDialog } from "../hooks/hooks";

interface ViewRoomBookingDialogProps {
  onClose: () => void;
  roomBookingsOnDay: RoomBooking[];
  reloadBookings: () => void
}

const ViewRoomBookingDialog: React.FC<ViewRoomBookingDialogProps> = ({ onClose, roomBookingsOnDay, reloadBookings }) => {
  const { editingBooking, setEditingBooking, handleDelete, handleSaveEdit } = useViewRoomBookingsDialog(onClose, roomBookingsOnDay, reloadBookings);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const dialogLargeStyle: React.CSSProperties = roomBookingsOnDay.some(rb => rb.purpose.length > 14) ? { maxWidth: '810px' } : { maxWidth: '600px' }

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="dialog-content" style={dialogLargeStyle}>
        <div className="dialog-header">
          <h2>Room bookings for today</h2>
          <button className="btn-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="dialog-body table-wrapper">
          {roomBookingsOnDay.length === 0 ? (
            <p>There are no rooms booked today.</p>
          ) : (
            <table className="fancy-table">
              <thead>
                <tr>
                  <th>Purpose</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Room</th>
                  <th className="actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roomBookingsOnDay.map((b) => {
                  const isEditing = editingBooking?.booking_id === b.booking_id;

                  return (
                    <tr key={b.booking_id}>
                      <td>{(b.purpose)}</td>
                      <td>
                        {isEditing ? (
                          <input
                            type="time"
                            value={editingBooking!.startTime}
                            onChange={(e) =>
                              setEditingBooking({
                                ...editingBooking!,
                                startTime: e.target.value,
                              })
                            }
                          />
                        ) : (
                          b.startTime.slice(0, 5)
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="time"
                            value={editingBooking!.endTime}
                            onChange={(e) =>
                              setEditingBooking({
                                ...editingBooking!,
                                endTime: e.target.value,
                              })
                            }
                          />
                        ) : (
                          b.endTime.slice(0, 5)
                        )}
                      </td>
                      <td>{(b.roomId)}</td>
                      <td className="actions">
                        {isEditing ? (
                          <>
                            <button className="edit-button" onClick={handleSaveEdit}>Save</button>
                            <button className="delete-button" onClick={() => setEditingBooking(null)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button className="edit-button" onClick={() => setEditingBooking(b)}>Edit</button>
                            <button className="delete-button" onClick={() => handleDelete(b)}>Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewRoomBookingDialog;
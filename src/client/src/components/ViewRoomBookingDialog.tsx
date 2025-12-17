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
  const { editingBooking, setEditingBooking, rooms, handleSaveEdit, capacityFilter, setCapacityFilter, handleDelete, getRoomName, generateTime } = useViewRoomBookingsDialog(onClose, roomBookingsOnDay, reloadBookings);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const dialogLargeStyle: React.CSSProperties = editingBooking ? { maxWidth: '1250px' } : { maxWidth: '650px' }

  const times = generateTime();

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
                  {editingBooking && (
                    <th>Attendees</th>
                  )}
                  <th>Room</th>
                  <th className="actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roomBookingsOnDay.map((b) => {
                  const isEditing = editingBooking?.booking_id === b.booking_id;

                  return (
                    <tr key={b.booking_id}>
                      <td>
                        {isEditing ? (
                          <input
                            value={editingBooking!.purpose}
                            onChange={e =>
                              setEditingBooking({ ...editingBooking!, purpose: e.target.value })
                            }
                          />
                        ) : (
                          b.purpose
                        )}
                      </td>

                      <td>
                        {isEditing ? (
                          <select
                            value={editingBooking!.startTime}
                            onChange={e => setEditingBooking({ ...editingBooking!, startTime: e.target.value })}>
                            <option value="">Select start time</option>
                            {times.map((time) => (
                              <option key={time} value={time}>
                                {time.slice(0, 5)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          b.startTime.slice(0, 5)
                        )}
                      </td>

                      <td>
                        {isEditing ? (
                          <select
                            value={editingBooking!.endTime}
                            onChange={e => setEditingBooking({ ...editingBooking!, endTime: e.target.value })}>
                            <option value="">Select end time</option>
                            {times.map((time) => (
                              <option key={time} value={time}>
                                {time.slice(0, 5)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          b.endTime.slice(0, 5)
                        )}
                      </td>

                      {isEditing && (
                        <td>
                          <input
                            type="number"
                            placeholder="Capacity"
                            value={capacityFilter}
                            onChange={e =>
                              setCapacityFilter(e.target.value === "" ? "" : Number(e.target.value))
                            }
                          />
                        </td>
                      )}

                      <td>
                        {isEditing ? (
                          <select
                            disabled={!rooms.length}
                            value={editingBooking!.roomId}
                            onChange={e =>
                              setEditingBooking({
                                ...editingBooking!,
                                roomId: Number(e.target.value),
                              })
                            }
                          >
                            <option value="">Select room</option>
                            {rooms.map(r => (
                              <option key={r.room_id} value={r.room_id}>
                                {r.roomName} ({r.capacity})
                              </option>
                            ))}
                          </select>
                        ) : (
                          getRoomName(b.roomId)
                        )}
                      </td>

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
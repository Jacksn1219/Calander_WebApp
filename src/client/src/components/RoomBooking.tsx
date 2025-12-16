import React, { useEffect, useState } from "react";
import "../styles/calendar.css";
import "../styles/RoomBooking.css";
import Sidebar from "./Sidebar";
import CreateRoomBookingDialog from "./CreateRoomBookingDialog";
import { useRoomBooking } from "../hooks/hooks";
import ViewRoomBookingDialog from "./ViewRoomBookingDialog";

const RoomBooking: React.FC = () => {
    const { fetchRoomBookings, roomBookingsOnDay, setRoomBookingsOnDay, roomBookings,
        currentDate, selectedDate, setSelectedDate, goToPreviousMonth, goToNextMonth, goToCurrentDate } = useRoomBooking()
    const today = new Date();
    const [showCreateBookingDialog, setShowCreateBookingDialog] = useState(false);
    const [showViewBookingDialog, setShowViewBookingDialog] = useState(false);
    const [isMobile] = useState<boolean>(window.innerWidth <= 500);

    const daysArray = [];
    for (let i = 0; i < new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); i++) daysArray.push(null);
    for (let d = 1; d <= new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(); d++) daysArray.push(d);

    const calendarContainerStyle: React.CSSProperties = { width: '60%' };

    const mainContentStyle: React.CSSProperties = { padding: '20px' };

    const calendarGridStyle: React.CSSProperties = isMobile ? { overflowX: 'auto' } : {};

    const calendarInnerStyle: React.CSSProperties = isMobile ? { minWidth: '700px', paddingRight: '900px' } : {};

    useEffect(() => {
        if (showCreateBookingDialog) {
            setShowViewBookingDialog(false);
        }
    }, [showCreateBookingDialog]);

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content" style={mainContentStyle}>
                <div className="planner-layout">
                    <div className="calendar-container" style={calendarContainerStyle}>
                        <div className="calendar-controls">
                            <button className="btn-nav" onClick={goToPreviousMonth}>←</button>
                            {isMobile &&
                                <>
                                    <button className="btn-today" onClick={goToCurrentDate}>Today</button>
                                    <button className="btn-nav" onClick={goToNextMonth}>→</button>
                                </>
                            }

                            <div className="month-year">
                                <h2>
                                    Room Bookings - {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
                                </h2>
                            </div>

                            <button className="btn-nav" onClick={goToNextMonth}>→</button>

                            <button className="btn-today" onClick={goToCurrentDate}>Today</button>
                        </div>

                        <div className="calendar-grid" style={calendarGridStyle}>
                            <div className="calendar-header" style={calendarInnerStyle}>
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (<div key={d} className="weekday">{d}</div>))}
                            </div>
                            <div className="calendar-days" style={calendarInnerStyle}>
                                {daysArray.map((day, i) => {
                                    if (day === null) return <div key={i} className="calendar-day empty"></div>;

                                    const isToday = day === today.getDate() &&
                                        currentDate.getMonth() === today.getMonth() &&
                                        currentDate.getFullYear() === today.getFullYear();

                                    const roomBookingsForDay = roomBookings.filter(booking => {
                                        const bookingDate = new Date(booking.bookingDate);
                                        return bookingDate.getFullYear() === currentDate.getFullYear() &&
                                            bookingDate.getMonth() === currentDate.getMonth() &&
                                            bookingDate.getDate() === day;
                                    });
                                    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

                                    return (
                                        <div key={i} className={`calendar-day ${isToday ? "today" : (roomBookingsForDay.length > 0 ? "has-event" : "")}`}
                                            onClick={() => {
                                                setShowViewBookingDialog(true);
                                                setRoomBookingsOnDay(roomBookingsForDay);
                                            }}>
                                            <div className="day-number">{day}</div>
                                            {roomBookingsForDay.length > 0 && (
                                                <div className="event-indicator">
                                                    <span className="event-count">{roomBookingsForDay.length}</span>
                                                </div>
                                            )}
                                            {newDate.setHours(0, 0, 0, 0) >= today.setHours(0, 0, 0, 0) &&
                                                <div className="add-roombooking" onClick={() => {
                                                    setShowCreateBookingDialog(true);
                                                    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                                                }}>＋</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="planner-side-panel">
                        <h3>Here are all your bookings</h3>
                        <p>...</p>
                    </div>
                </div>
            </main>
            {showCreateBookingDialog && (
                <CreateRoomBookingDialog
                    onClose={() => setShowCreateBookingDialog(false)}
                    selectedDate={selectedDate}
                    reloadBookings={fetchRoomBookings}
                />
            )}
            {showViewBookingDialog && (
                <ViewRoomBookingDialog
                    onClose={() => setShowViewBookingDialog(false)}
                    roomBookingsOnDay={roomBookingsOnDay}
                    reloadBookings={fetchRoomBookings}
                />
            )}
        </div>
    );
}

export default RoomBooking
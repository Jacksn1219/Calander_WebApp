import React from 'react';
import Sidebar from './Sidebar';
import EventDialog from './EventDialog';
import { useCalendar, useCalendarEvents } from '../hooks/hooks';
import { useAuth } from '../states/AuthContext';
import '../styles/calendar.css';

const Calendar: React.FC = () => {
  const {
    selectedDate,
    currentMonth,
    handleDateClick,
    handleCloseDialog,
    handlePreviousMonth,
    handleNextMonth,
    handleToday,
    getDaysInMonth,
  } = useCalendar();

  const { user } = useAuth();
  const { loading, error, events: roleScopedEvents, getEventsForDate: fetchEventsForDate, reload } = useCalendarEvents(user);
  // const { hiddenEventIds, hideEvent, restoreAllEvents, filterHiddenEvents } = useHiddenEvents();

  // Filter out hidden events using functional approach
  // const getEventsForDate = (date: Date) => {
  //   return filterHiddenEvents(fetchEventsForDate(date));
  // };
  const getEventsForDate = fetchEventsForDate;

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];
    const today = new Date();

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const events = getEventsForDate(date);
      const isToday =
        day === today.getDate() &&
        currentMonth.getMonth() === today.getMonth() &&
        currentMonth.getFullYear() === today.getFullYear();

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${events.length > 0 ? 'has-event' : ''}`}
          onClick={() => handleDateClick(day)}
        >
          <span className="day-number">{day}</span>
          {events.length > 0 && (
            <div className="event-indicator">
              <span className="event-count">{events.length}</span>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="events-header">
          <div className="events-header-left">
            <h1>Calendar</h1>
            <p className="muted">Viewing all events</p>
            {loading && <p className="muted">Loading events...</p>}
            {error && (
              <div className="calendar-status error">
                <span>{error}</span>
                <button type="button" onClick={reload}>Retry</button>
              </div>
            )}
          </div>
          {/* {hiddenEventIds.length > 0 && (
            <button
              type="button"
              className="btn-restore"
              onClick={restoreAllEvents}
              aria-label={`Restore ${hiddenEventIds.length} hidden event${hiddenEventIds.length > 1 ? 's' : ''}`}
            >
              🔄 Restore Hidden ({hiddenEventIds.length})
            </button>
          )} */}
        </div>

        <div className="calendar-container">
          <div className="calendar-controls">
            <button onClick={handlePreviousMonth} className="btn-nav" aria-label="Previous month">
              ←
            </button>
            <div className="month-year">
              <h2>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
              <button onClick={handleToday} className="btn-today">Today</button>
            </div>
            <button onClick={handleNextMonth} className="btn-nav" aria-label="Next month">
              →
            </button>
          </div>

          <div className="calendar-grid">
            <div className="calendar-header">
              <div className="weekday">Sun</div>
              <div className="weekday">Mon</div>
              <div className="weekday">Tue</div>
              <div className="weekday">Wed</div>
              <div className="weekday">Thu</div>
              <div className="weekday">Fri</div>
              <div className="weekday">Sat</div>
            </div>
            <div className="calendar-days">
              {renderCalendar()}
            </div>
          </div>
        </div>

        {selectedDate && (
          <EventDialog
            date={selectedDate}
            events={getEventsForDate(selectedDate)}
            onClose={handleCloseDialog}
            // onHideEvent={hideEvent}
          />
        )}
      </main>
    </div>
  );
};

export default Calendar;

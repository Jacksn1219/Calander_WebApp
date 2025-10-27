import React from 'react';
import Sidebar from './Sidebar';
import EventDialog from './EventDialog';
import { useCalendar } from '../hooks/hooks';
import '../styles/my-events.css';

interface Event {
  eventId: number;
  title: string;
  description?: string;
  eventDate: Date;
  createdBy: number;
  participants: Participant[];
}

interface Participant {
  userId: number;
  name: string;
  email: string;
  status: 'Pending' | 'Accepted' | 'Declined';
}

const MyEvents: React.FC = () => {
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

  // TODO: Backend Integration - Replace mock data with actual API call
  // GET /api/events or GET /api/events/user/:userId
  // Should fetch events from EventsService.GetEventsByUserAsync()
  const mockEvents: Event[] = [
    {
      eventId: 1,
      title: 'Team Meeting',
      description: 'Weekly sync with the development team',
      eventDate: new Date(2025, 9, 25, 14, 0),
      createdBy: 1,
      participants: [
        { userId: 1, name: 'Admin User', email: 'admin@example.com', status: 'Accepted' },
        { userId: 2, name: 'John Doe', email: 'john@example.com', status: 'Accepted' },
      ],
    },
  ];

  const getEventsForDate = (date: Date): Event[] => {
    return mockEvents.filter(event => {
      const eventDate = new Date(event.eventDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

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
          <h1>My Events</h1>
          <p className="muted">View and manage your events</p>
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
          />
        )}
      </main>
    </div>
  );
};

export default MyEvents;

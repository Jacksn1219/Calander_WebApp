import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import EventDialog from './EventDialog';
import ReminderNotification from './ReminderNotification';
import UserSettings from './UserSettings';
import { useHomeDashboard } from '../hooks/hooks';
import '../styles/home.css';
import '../styles/login-page.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    loading,
    error,
    events,
    weekEventsAttending,
    reload,
    upcomingEvents,
    attendanceRate,
    currentWeekStart,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    handleEventClick,
    handleDayClick,
    selectedEvent,
    selectedDayEvents,
    selectedDateForDialog,
    closeDialog,
    roomBookings,
    roomBookingsLoading,
    roomBookingsError,
    handleAttend,
    roomsById,
  } = useHomeDashboard();

  const displayedUpcoming = React.useMemo(
    () => upcomingEvents.slice(0, 4),
    [upcomingEvents]
  );


  const renderMiniWeek = () => {
    const startOfWeek = currentWeekStart;
    const today = new Date();
    const days = [];

    // Only render 5 working days: Monday–Friday
    for (let i = 0; i < 5; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      const eventsOnDay = weekEventsAttending.filter(ev => {
        const d = ev.eventDate;
        return (
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate()
        );
      });
      const isPast = date < today && !isToday;

      const classNames = [
        'calendar-day',
        isToday ? 'today' : '',
        eventsOnDay.length > 0 ? 'has-event' : '',
        isPast ? 'past-event-day' : '',
      ]
        .filter(Boolean)
        .join(' ');

      const weekdayLabel = date.toLocaleDateString(undefined, { weekday: 'short' });

      days.push(
        <div
          key={date.toISOString()}
          className={classNames}
          onClick={() => handleDayClick(date)}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleDayClick(date);
            }
          }}
        >
          <span className="weekday-label">{weekdayLabel}</span>
          <span className="day-number">{date.getDate()}</span>
          {eventsOnDay.length > 0 && (
            <div className="event-indicator">
              <span className="event-count">{eventsOnDay.length}</span>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="app-layout home-page">
      <Sidebar />
      <main className="main-content">
        <div className="events-header">
          <div className="events-header-left">
            <h1>Welcome {user?.name}</h1>
            <p className="muted">Review your meetings, bookings, and events in one place.</p>
            {loading && <p className="muted">Loading dashboard data...</p>}
            {error && (
              <div className="calendar-status error">
                <span>{error}</span>
                <button type="button" onClick={reload}>Retry</button>
              </div>
            )}
          </div>
          <div className="home-header-right">
            <ReminderNotification />
          </div>
        </div>

        {/* Main content layout: left column (mini calendar + room booking) and right column (upcoming events) */}
        <div className="home-row">
          {/* Left column: mini calendar on top, Room Booking below */}
          <div className="home-left-column">
            <div className="calendar-container">
              {/* Embedded week calendar preview */}
              <section className="calendar-grid home-calendar-section">
                <div className="calendar-controls">
                  <button onClick={goToPreviousWeek} className="btn-icon" aria-label="Previous week">
                    ←
                  </button>
                  <div className="month-year">
                    <h2>
                      {currentWeekStart.toLocaleDateString(undefined, {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </h2>
                    <button onClick={goToCurrentWeek} className="btn-today">This week</button>
                  </div>
                  <button onClick={goToNextWeek} className="btn-icon primary" aria-label="Next week">
                    →
                  </button>
                </div>

                <div className="calendar-grid">
                  
                  <div className="calendar-days">
                    {renderMiniWeek()}
                  </div>
                </div>

                <div className="home-see-more-wrapper">
                  <button
                    type="button"
                    className="btn-today"
                    onClick={() => navigate('/calendar')}
                  >
                    See more...
                  </button>
                </div>
              </section>
            </div>

          </div>

          {/* Right column: Upcoming Events */}
          <div className="calendar-container home-upcoming-events home-right-column">
            <aside className="upcoming-panel home-upcoming-panel" aria-live="polite">
              <div className="upcoming-header">
                <div>
                  <h3>New upcoming events</h3>
                </div>
              </div>

              <div className="upcoming-list">
                {!loading && !error && upcomingEvents.length === 0 ? (
                  <p className="upcoming-empty">No upcoming events for you to attend.</p>
                ) : (
                  displayedUpcoming.map(ev => {
                    const start = ev.eventDate;
                    const end = ev.endTime;
                    const timeRange = `${start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
                    return (
                      <button
                        type="button"
                        key={ev.eventId}
                        className="upcoming-card home-upcoming-card"
                        onClick={() => handleEventClick(ev)}
                      >
                        <div className="upcoming-date">
                          <span className="upcoming-date-day">{start.getDate()}</span>
                          <span className="upcoming-date-month">
                            {start.toLocaleDateString(undefined, { month: 'short' })}
                          </span>
                        </div>
                        <div className="upcoming-details">
                          <h4>{ev.title}</h4>
                          <p className="upcoming-time">{timeRange}</p>
                          {ev.description && ev.description.trim().length > 0 && (
                            <p className="upcoming-description">
                              {ev.description.length > 120
                                ? `${ev.description.slice(0, 117)}...`
                                : ev.description}
                            </p>
                          )}
                          {ev.bookingId != null && roomsById[ev.bookingId] && (
                            <p className="upcoming-location">
                              {roomsById[ev.bookingId].roomName}
                              {roomsById[ev.bookingId].location && ` — ${roomsById[ev.bookingId].location}`}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
              
              {upcomingEvents.length > 0 && (
                <div className="upcoming-footer">
                  <button
                    type="button"
                    className="btn-today"
                    onClick={() => navigate('/calendar')}
                  >
                    See more...
                  </button>
                </div>
              )}
            </aside>
          </div>
        </div>

        {selectedDayEvents && selectedDateForDialog && (
            <EventDialog
              date={selectedDateForDialog}
              events={selectedDayEvents}
              onClose={() => {
                closeDialog();
                reload();
              }}
            />
          )}
        </main>
      </div>
    );
  };

  export default Home;
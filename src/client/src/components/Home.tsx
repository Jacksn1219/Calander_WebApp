import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import EventDialog from './EventDialog';
import { CalendarEvent, useHomeDashboard } from '../hooks/hooks';
import '../styles/calendar-home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    loading,
    error,
    events,
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
  } = useHomeDashboard();

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

      const eventsOnDay = events.filter(ev => {
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
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="events-header">
          <div className="events-header-left">
            <h1>Your week at a glance</h1>
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
            <button
              type="button"
              className="home-notification-button"
              aria-label="Open notifications"
              onClick={() => navigate('/notifications')}
            >
              <span className="home-notification-icon" />
              <span className="home-notification-dot" />
            </button>
            {user && (
              <div className="home-header-user">
                <div className="home-header-avatar">
                  {(user.name || user.email || '?').charAt(0).toUpperCase()}
                </div>
                <div className="home-header-user-text">
                  <span className="home-header-user-name">{user.name || 'User'}</span>
                  <span className="home-header-user-role">{user.role}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main content layout: left column (mini calendar + room booking) and right column (upcoming events) */}
        <div className="home-row" style={{ marginTop: '1.5rem' }}>
          {/* Left column: mini calendar on top, Room Booking below */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="calendar-container">
              {/* Embedded week calendar preview */}
              <section className="calendar-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="calendar-controls">
                  <button onClick={goToPreviousWeek} className="btn-nav" aria-label="Previous week">
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
                  <button onClick={goToNextWeek} className="btn-nav" aria-label="Next week">
                    →
                  </button>
                </div>

                <div className="calendar-grid">
                  
                  <div className="calendar-days">
                    {renderMiniWeek()}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn-today"
                    onClick={() => navigate('/calendar')}
                  >
                    See more
                  </button>
                </div>
              </section>
            </div>

            <div className="calendar-container">
              <section className="calendar-grid">
                <h2 className="section-title">Room Booking</h2>
                {roomBookingsLoading && (
                  <p className="muted">Loading your room bookings...</p>
                )}
                {roomBookingsError && (
                  <p className="muted" style={{ color: '#b91c1c' }}>
                    {roomBookingsError}
                  </p>
                )}
                {!roomBookingsLoading && !roomBookingsError && roomBookings.length === 0 && (
                  <p className="muted">You have no room bookings yet.</p>
                )}

                {roomBookings.length > 0 && (
                  <>
                    <div className="room-booking-list">
                      {roomBookings.slice(0, 4).map(b => {
                        const start = new Date(b.startTime);
                        const end = new Date(b.endTime);
                        const dateLabel = start.toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        });
                        const timeRange = `${start.toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })} - ${end.toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}`;

                        return (
                          <div key={b.id} className="room-booking-row">
                            <div className="room-booking-date">
                              <span className="room-booking-date-label">{dateLabel}</span>
                            </div>
                            <div className="room-booking-details">
                              <div className="room-booking-room">{b.roomName}</div>
                              <div className="room-booking-time">{timeRange}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                      <button
                        type="button"
                        className="btn-today"
                        onClick={() => navigate('/roombooking')}
                      >
                        See all
                      </button>
                    </div>
                  </>
                )}
              </section>
            </div>
          </div>

          {/* Right column: Upcoming Events */}
          <div className="calendar-container home-upcoming-events" style={{ flex: 0.8 }}>
            <section className="calendar-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="section-title" style={{ marginBottom: 0 }}>Upcoming Events</h2>
                <button
                  type="button"
                  className="btn-today"
                  onClick={() => navigate('/calendar')}
                  style={{ paddingInline: '0.9rem', paddingBlock: '0.35rem' }}
                >
                  See more
                </button>
              </div>

              <div className="calendar-days" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                {!loading && !error && events.length === 0 && (
                  <p className="muted">There are no events yet.</p>
                )}
                {upcomingEvents.slice(0, 5).map(ev => (
                  <div
                    key={ev.eventId}
                    className="calendar-day has-event"
                    onClick={() => handleEventClick(ev)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleEventClick(ev);
                      }
                    }}
                  >
                    <span className="day-number">
                      {ev.eventDate.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <div className="event-indicator">
                      <span className="event-count">{ev.title}</span>
                    </div>
                    {ev.description && (
                      <p className="muted" style={{ marginTop: '0.35rem' }}>
                        {ev.description.length > 80
                          ? `${ev.description.slice(0, 77)}...`
                          : ev.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {selectedDayEvents && selectedDateForDialog && (
          <EventDialog
            date={selectedDateForDialog}
            events={selectedDayEvents}
            onClose={() => {
              closeDialog();
            }}
          />
        )}
      </main>
    </div>
  );
};

export default Home;

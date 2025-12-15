import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import EventDialog from './EventDialog';
import { CalendarEvent, useHomeDashboard, useReminders } from '../hooks/hooks';
import '../styles/index.css';
import '../styles/login-page.css';

const Home: React.FC = () => {
  const [showReminders, setShowReminders] = useState(false);
  const { reminders, loading, error, refetch, markAsRead, markAllAsRead } = useReminders();
  const dropdownRef = useRef<HTMLDivElement>(null);
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
  
// Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowReminders(false);
      }
    };

    if (showReminders) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showReminders]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('nl-NL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: 'short'
    });
  };

  const formatTimeOnly = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMarkAsRead = async (reminderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAsRead(reminderId);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const unsentReminders = reminders.filter(r => !r.isRead);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content"  style={{ position: 'relative' }}>
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

        {/* Reminder Button - Upper Right */}
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          zIndex: 100 
        }}>
          <button
            onClick={() => setShowReminders(!showReminders)}
            style={{
              padding: '0',
              width: '45px',
              height: '45px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unsentReminders.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                backgroundColor: '#dc3545',
                color: 'white',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                fontSize: '11px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {unsentReminders.length}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showReminders && (
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                minWidth: '350px',
                maxWidth: '400px',
                maxHeight: '400px',
                overflowY: 'auto',
                zIndex: 1000
              }}
            >
              <div style={{
                padding: '15px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Notifications</h3>
                  {unsentReminders.length > 0 && (
                    <button
                      onClick={markAllAsRead}
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
  
                {loading ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    Loading...
                  </div>
                ) : error ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#dc3545' }}>
                    {error}
                  </div>
                ) : unsentReminders.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    No new notifications
                  </div>
                ) : (
                  <div>
                    {unsentReminders.slice(0, 5).map((reminder) => (
                      <div
                      key={reminder.reminder_id}
                      style={{
                        padding: '8px',
                        borderBottom: '1px solid #e0e0e0'
                      }}
                    >
                      <div style={{ 
                        padding: '0',
                        backgroundColor: '#e8e8e8',
                        borderRadius: '6px',
                        overflow: 'hidden'
                      }}>
                        {/* Header Bar with Cross */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: '10px 15px',
                          backgroundColor: '#e8e8e8',
                          marginBottom: '-10px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px' }}>
                              {reminder.reminderType === 0 ? '📅' : '🔔'}
                            </span>
                            <span style={{ 
                              fontSize: '13px', 
                              fontWeight: '600',
                              color: '#333'
                            }}>
                              {reminder.title}
                            </span>
                          </div>
                          {!reminder.isRead && (
                            <button
                              onClick={(e) => handleMarkAsRead(reminder.reminder_id, e)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#666',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '3px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#d0d0d0';
                                e.currentTarget.style.color = '#333';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#666';
                              }}
                              title="Mark as read"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Separator line under header */}
                        <div style={{ padding: '0 15px' }}>
                          <div style={{
                            borderTop: '1px solid #c0c0c0',
                            margin: '8px 0'
                          }} />
                        </div>

                        {/* Date and Time Row with IDs */}
                        <div style={{ 
                          fontSize: '12px',
                          color: '#666',
                          fontWeight: '500',
                          marginBottom: '8px',
                          padding: '0 15px',
                          display: 'flex',
                          gap: '10px',
                          alignItems: 'center'
                        }}>
                          <span>{formatDateOnly(reminder.reminderTime)} • {formatTimeOnly(reminder.reminderTime)}</span>
                          {reminder.relatedEventId !== 0 && (
                            <>
                              <span style={{ color: '#999' }}>|</span>
                              <span style={{ fontSize: '11px' }}>Event ID: {reminder.relatedEventId}</span>
                            </>
                          )}
                          {reminder.relatedRoomId !== 0 && (
                            <>
                              <span style={{ color: '#999' }}>|</span>
                              <span style={{ fontSize: '11px' }}>Room ID: {reminder.relatedRoomId}</span>
                            </>
                          )}
                        </div>

                        {/* Content Row */}
                        <div style={{ padding: '0 15px 12px 15px' }}>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#666',
                            lineHeight: '1.4'
                          }}>
                            {reminder.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{
                padding: '12px',
                textAlign: 'center',
                borderTop: '1px solid #eee'
              }}>
                <button
                  onClick={() => {
                    setShowReminders(false);
                    navigate('/notifications');
                  }}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;

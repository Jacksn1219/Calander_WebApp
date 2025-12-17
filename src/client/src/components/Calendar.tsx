import React from 'react';
import Sidebar from './Sidebar';
import EventDialog from './EventDialog';
import { useCalendar } from '../hooks/hooks';
import '../styles/calendar.css';

const Calendar: React.FC = () => {
  const {
    loading,
    error,
    reload,
    weekdays,
    calendarMonthLabel,
    calendarDays,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    onDaySelect,
    selectedDate,
    selectedDateEvents,
    closeDialog,
    upcomingLabel,
    upcomingEvents,
    hasUpcomingEvents,
    canGoBackUpcoming,
    canGoForwardUpcoming,
    onUpcomingBack,
    onUpcomingForward,
    onUpcomingEventSelect,
    calendarGridRef,
    upcomingHeaderRef,
  } = useCalendar();

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
        </div>

        <div className="calendar-container">
          <div className="calendar-controls">
            <button onClick={goToPreviousMonth} className="btn-nav" aria-label="Previous month">
              ←
            </button>
            <div className="month-year">
              <h2>{calendarMonthLabel}</h2>
              <button onClick={goToToday} className="btn-today">Today</button>
            </div>
            <button onClick={goToNextMonth} className="btn-nav" aria-label="Next month">
              →
            </button>
          </div>

          <div className="calendar-content">
            <div className="calendar-grid-wrapper">
              <div className="calendar-grid" ref={calendarGridRef}>
                <div className="calendar-header">
                  {weekdays.map(weekday => (
                    <div key={weekday} className="weekday">{weekday}</div>
                  ))}
                </div>
                <div className="calendar-days">
                  {calendarDays.map(day => {
                    const classNames = ['calendar-day'];
                    if (day.isEmpty) classNames.push('empty');
                    if (!day.isEmpty && day.isToday) classNames.push('today');
                    if (!day.isEmpty && day.hasEvents) classNames.push('has-event');

                    const isInteractive = !day.isEmpty && Boolean(day.date);
                    const handleClick = isInteractive
                      ? () => {
                          if (day.date) {
                            onDaySelect(day.date);
                          }
                        }
                      : undefined;

                    return (
                      <div
                        key={day.key}
                        className={classNames.join(' ')}
                        onClick={handleClick}
                      >
                        {!day.isEmpty && (
                          <>
                            <span className="day-number">{day.dayNumber}</span>
                            {day.hasEvents && (
                              <div className="event-indicator">
                                <span className="event-count">{day.eventCount}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <aside className="upcoming-panel" aria-live="polite">
              <div className="upcoming-header" ref={upcomingHeaderRef}>
                <div>
                  <p className="muted uppercase">Upcoming events</p>
                  <h3>{upcomingLabel}</h3>
                </div>
                <div className="upcoming-nav">
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={onUpcomingBack}
                    disabled={!canGoBackUpcoming}
                    aria-label="Show previous events"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="btn-icon primary"
                    onClick={onUpcomingForward}
                    disabled={!canGoForwardUpcoming}
                    aria-label="Show future events"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="upcoming-list">
                {!hasUpcomingEvents ? (
                  <p className="upcoming-empty">No upcoming events for this month.</p>
                ) : (
                  upcomingEvents.map(event => (
                    <button
                      type="button"
                      key={event.eventId}
                      className="upcoming-card"
                      onClick={() => onUpcomingEventSelect(event.date)}
                    >
                      <div className="upcoming-date">
                        <span className="upcoming-date-day">{event.day}</span>
                        <span className="upcoming-date-month">{event.monthAbbrev}</span>
                      </div>
                      <div className="upcoming-details">
                        <h4>{event.title}</h4>
                        <p className="upcoming-time">{event.timeLabel}</p>
                        {event.description && (
                          <p className="upcoming-description">{event.description}</p>
                        )}
                        <span className="upcoming-meta">{event.acceptedCount} attending</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </aside>
          </div>
        </div>

        {selectedDate && (
          <EventDialog
            date={selectedDate}
            events={selectedDateEvents}
            onClose={closeDialog}
          />
        )}
      </main>
    </div>
  );
};

export default Calendar;

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import '../styles/event-dialog.css';
import { CalendarEvent, CalendarParticipant, useEventDialog } from '../hooks/hooks';
import { useAuth } from '../states/AuthContext';

interface EventDialogProps {
  events: CalendarEvent[];
  date: Date | null;
  onClose: () => void;
  onStatusChange?: () => void;
}

const EventDialog: React.FC<EventDialogProps> = ({ date, events, onClose, onStatusChange }) => {
  const {
    selectedEvent,
    setSelectedEvent,
    userParticipationStatus,
    formatDate,
    formatTime,
    handleAttend,
    handleUnattend,
  } = useEventDialog(events, onStatusChange, onClose);
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'list' | 'detail'>(events.length > 1 ? 'list' : 'detail');

  const isPastSelectedEvent = useMemo(() => {
    if (!selectedEvent) return false;
    const eventDate = new Date(selectedEvent.eventDate);
    const today = new Date();
    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return eventDate.getTime() < today.getTime();
  }, [selectedEvent]);

  const selectEvent = useCallback((ev: CalendarEvent) => {
    setSelectedEvent(ev);
    setViewMode('detail');
  }, [setSelectedEvent]);

  const backToList = useCallback(() => {
    setViewMode('list');
    setSelectedEvent(null);
  }, [setSelectedEvent]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Focus management & trap
  useEffect(() => {
    if (!dialogRef.current) return;
    previouslyFocused.current = document.activeElement as HTMLElement;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab') {
        const nodes = Array.from(focusable).filter(el => !el.hasAttribute('disabled'));
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [onClose]);

  // Prevent background scroll while dialog open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, []);

  return (
    <div
      className="dialog-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      ref={dialogRef}
    >
      <div className="dialog-content" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 id="dialog-title">{date ? formatDate(date) : 'Selected Date'}</h2>
          <div className="dialog-header-actions">
            <button className="btn-close" onClick={onClose} aria-label="Close dialog">×</button>
          </div>
        </div>
        <div className="dialog-body">
          {events.length === 0 && (
            <div className="no-events" role="status">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <p>No events scheduled for this date</p>
            </div>
          )}

          {events.length > 0 && viewMode === 'list' && (
            <div className="multiple-events">
              <h3>Events ({events.length})</h3>
              <div className="events-list" role="list">
                {events.map(event => {
                  const userIsParticipant = event.participants.some(p => p.userId === user?.userId);
                  return (
                    <button
                      key={event.eventId}
                      type="button"
                      role="listitem"
                      className="event-item selectable"
                      onClick={() => selectEvent(event)}
                      aria-label={`View details for ${event.title}`}
                    >
                      <div className="event-item-time">{formatTime(new Date(event.eventDate))}</div>
                      <div className="event-item-title">{event.title}</div>
                      <div className="event-meta">
                        <span className="event-badge participants" title="Attendees">👥 {event.participants.length}</span>
                        {userIsParticipant && <span className="event-badge joined" title="You are attending">✓ Joined</span>}
                      </div>
                      <div className="event-item-arrow" aria-hidden="true">→</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

           {events.length > 0 && viewMode === 'detail' && selectedEvent && (
            <div className="event-details">
              {events.length > 1 && (
                <button className="btn-back" type="button" onClick={backToList} aria-label="Back to events list">← Back</button>
              )}
              <div className="event-info">
                <h3>{selectedEvent.title}</h3>
                <div className="event-time">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  <span>{formatTime(new Date(selectedEvent.eventDate))} - {formatTime(new Date(selectedEvent.endTime))}</span>
                </div>
                {selectedEvent.location && (
                  <div className="event-location">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
                {selectedEvent.description && <p className="event-description">{selectedEvent.description}</p>}
              </div>
              {!isPastSelectedEvent && (
                <div className="event-actions">
                  {userParticipationStatus === 'not-registered' ? (
                    <button className="btn-attend" onClick={() => handleAttend(selectedEvent.eventId)}>Attend Event</button>
                  ) : (
                    <button className="btn-unattend" onClick={() => handleUnattend(selectedEvent.eventId)}>Cancel Registration</button>
                  )}
                </div>
              )}
              <div className="participants-section">
                <h4>Attendees ({selectedEvent.participants.length})</h4>
                <div className="participants-list">
                  {selectedEvent.participants.map((participant: CalendarParticipant) => {
                    const statusLabel = participant.status;
                    const statusClass = statusLabel.toLowerCase();
                    return (
                      <div key={participant.userId} className="participant-item">
                        <div className="participant-avatar" aria-hidden="true">{participant.name.charAt(0).toUpperCase()}</div>
                        <div className="participant-info">
                          <span className="participant-name">{participant.name}</span>
                          <span className={`participant-status status-${statusClass}`}>{statusLabel}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDialog;

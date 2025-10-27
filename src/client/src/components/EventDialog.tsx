import React from 'react';
import { useEventDialog } from '../hooks/hooks';
import '../styles/event-dialog.css';

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

interface EventDialogProps {
  date: Date;
  events: Event[];
  onClose: () => void;
}

const EventDialog: React.FC<EventDialogProps> = ({ date, events, onClose }) => {
  const {
    selectedEvent,
    setSelectedEvent,
    userParticipationStatus,
    formatDate,
    formatTime,
    handleAttend,
    handleUnattend,
  } = useEventDialog(events);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="dialog-content">
        <div className="dialog-header">
          <h2>{formatDate(date)}</h2>
          <button className="btn-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="dialog-body">
          {events.length === 0 ? (
            <div className="no-events">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <p>No events scheduled for this date</p>
            </div>
          ) : events.length === 1 || selectedEvent ? (
            <div className="event-details">
              {selectedEvent && (
                <>
                  <div className="event-info">
                    <h3>{selectedEvent.title}</h3>
                    <div className="event-time">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                      <span>{formatTime(new Date(selectedEvent.eventDate))}</span>
                    </div>
                    {selectedEvent.description && (
                      <p className="event-description">{selectedEvent.description}</p>
                    )}
                  </div>

                  <div className="event-actions">
                    {userParticipationStatus === 'not-registered' ? (
                      <button 
                        className="btn-attend" 
                        onClick={() => handleAttend(selectedEvent.eventId)}
                      >
                        Attend Event
                      </button>
                    ) : (
                      <button 
                        className="btn-unattend" 
                        onClick={() => handleUnattend(selectedEvent.eventId)}
                      >
                        Cancel Registration
                      </button>
                    )}
                  </div>

                  <div className="participants-section">
                    <h4>Attendees ({selectedEvent.participants.length})</h4>
                    <div className="participants-list">
                      {selectedEvent.participants.map((participant: Participant) => (
                        <div key={participant.userId} className="participant-item">
                          <div className="participant-avatar">
                            {participant.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="participant-info">
                            <span className="participant-name">{participant.name}</span>
                            <span className={`participant-status status-${participant.status.toLowerCase()}`}>
                              {participant.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="multiple-events">
              <h3>Multiple Events ({events.length})</h3>
              <div className="events-list">
                {events.map((event) => (
                  <div 
                    key={event.eventId} 
                    className="event-item"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="event-item-time">{formatTime(new Date(event.eventDate))}</div>
                    <div className="event-item-title">{event.title}</div>
                    <div className="event-item-arrow">→</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDialog;

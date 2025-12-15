import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReminders, formatDateOnly, formatTimeOnly } from '../hooks/hooks';
import '../styles/reminder-notification.css';

const ReminderNotification: React.FC = () => {
  const [showReminders, setShowReminders] = useState(false);
  const { reminders, loading, error, markAsRead, markAllAsRead } = useReminders();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unsentReminders = reminders.filter(r => !r.isRead);

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

  const handleMarkAsRead = async (reminderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAsRead(reminderId);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  return (
    <div className="reminder-notification-container">
      <button
        onClick={() => setShowReminders(!showReminders)}
        className="reminder-notification-button"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unsentReminders.length > 0 && (
          <span className="reminder-notification-badge">
            {unsentReminders.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showReminders && (
        <div ref={dropdownRef} className="reminder-dropdown">
          <div className="reminder-dropdown-header">
            <h3 className="reminder-dropdown-title">Notifications</h3>
            {unsentReminders.length > 0 && (
              <button onClick={markAllAsRead} className="reminder-mark-all-btn">
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div className="reminder-dropdown-loading">
              Loading...
            </div>
          ) : error ? (
            <div className="reminder-dropdown-error">
              {error}
            </div>
          ) : unsentReminders.length === 0 ? (
            <div className="reminder-dropdown-empty">
              No new notifications
            </div>
          ) : (
            <div>
              {unsentReminders.slice(0, 5).map((reminder) => {
                // Determine icon and color based on reminder type
                const isChanged = reminder.reminderType === 2 || reminder.reminderType === 3;
                const icon = reminder.reminderType === 0 || reminder.reminderType === 2 ? '📅' : '🔔';
                const itemClass = `reminder-item ${isChanged ? 'reminder-item-changed' : ''}`;
                
                return (
                <div key={reminder.reminder_id} className="reminder-item-wrapper">
                  <div className={itemClass}>
                    {/* Header Bar with Cross */}
                    <div className="reminder-item-header">
                      <div className="reminder-item-header-left">
                        <span className="reminder-item-icon">
                          {icon}
                          {isChanged && <span className="reminder-changed-badge">📝</span>}
                        </span>
                        <span className="reminder-item-title">
                          {reminder.title}
                        </span>
                      </div>
                      {!reminder.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(reminder.reminder_id, e)}
                          className="reminder-mark-read-btn"
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
                    <div className="reminder-item-separator">
                      <div className="reminder-item-separator-line" />
                    </div>

                    {/* Date and Time Row with IDs */}
                    <div className="reminder-item-meta">
                      <span>{formatDateOnly(reminder.reminderTime)} • {formatTimeOnly(reminder.reminderTime)}</span>
                      {reminder.relatedEventId !== 0 && (
                        <>
                          <span className="reminder-item-meta-divider">|</span>
                          <span className="reminder-item-meta-id">Event ID: {reminder.relatedEventId}</span>
                        </>
                      )}
                      {reminder.relatedRoomId !== 0 && (
                        <>
                          <span className="reminder-item-meta-divider">|</span>
                          <span className="reminder-item-meta-id">Room ID: {reminder.relatedRoomId}</span>
                        </>
                      )}
                    </div>

                    {/* Content Row */}
                    <div className="reminder-item-content">
                      <div className="reminder-item-message">
                        {reminder.message}
                      </div>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          )}

          <div className="reminder-dropdown-footer">
            <button
              onClick={() => {
                setShowReminders(false);
                navigate('/notifications');
              }}
              className="reminder-view-all-btn"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderNotification;
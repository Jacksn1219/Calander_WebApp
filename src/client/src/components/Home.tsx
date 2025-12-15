import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useReminders } from '../hooks/hooks';
import '../styles/index.css';
import '../styles/login-page.css';

const Home: React.FC = () => {
  const [showReminders, setShowReminders] = useState(false);
  const { reminders, loading, error, refetch, markAsRead, markAllAsRead } = useReminders();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
      <main className="main-content" style={{ position: 'relative' }}>
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

        <h1>Welcome</h1>
        <p>This is a placeholder Home page. Backend integration will provide dynamic content.</p>
      </main>
    </div>
  );
};

export default Home;

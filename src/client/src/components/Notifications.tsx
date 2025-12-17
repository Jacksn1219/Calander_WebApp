import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useReminders } from '../hooks/hooks';
import '../styles/index.css';

const Notifications: React.FC = () => {
  const { reminders, loading, error, markAsRead, markAllAsRead } = useReminders();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

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
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTimeOnly = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMarkAsRead = async (reminderId: number) => {
    try {
      await markAsRead(reminderId);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const filteredReminders = reminders.filter(r => {
    if (filter === 'unread') return !r.isRead;
    if (filter === 'read') return r.isRead;
    return true;
  });

  const unreadCount = reminders.filter(r => !r.isRead).length;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
          {/* Header */}
          <div style={{ 
            marginBottom: '30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div>
              <h1 style={{ margin: '0 0 5px 0', fontSize: '28px' }}>Notifications</h1>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
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

          {/* Filter Tabs */}
          <div style={{ 
            marginBottom: '20px',
            borderBottom: '2px solid #e9ecef',
            display: 'flex',
            gap: '20px'
          }}>
            {(['all', 'unread', 'read'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                style={{
                  padding: '12px 5px',
                  background: 'none',
                  border: 'none',
                  borderBottom: filter === filterOption ? '2px solid #007bff' : '2px solid transparent',
                  color: filter === filterOption ? '#007bff' : '#666',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: filter === filterOption ? '600' : '400',
                  marginBottom: '-2px',
                  transition: 'all 0.2s',
                  textTransform: 'capitalize'
                }}
              >
                {filterOption}                {filterOption === 'all' && reminders.length > 0 && (
                  <span style={{
                    marginLeft: '8px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {reminders.length}
                  </span>
                )}                {filterOption === 'unread' && unreadCount > 0 && (
                  <span style={{
                    marginLeft: '8px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{ 
              padding: '60px 20px', 
              textAlign: 'center', 
              color: '#666' 
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #007bff',
                borderRadius: '50%',
                margin: '0 auto 15px',
                animation: 'spin 1s linear infinite'
              }} />
              Loading notifications...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div style={{ 
              padding: '40px 20px', 
              textAlign: 'center',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              borderRadius: '8px',
              border: '1px solid #f5c6cb'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#721c24" strokeWidth="2" style={{ margin: '0 auto 10px' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p style={{ margin: 0, fontSize: '14px' }}>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredReminders.length === 0 && (
            <div style={{ 
              padding: '60px 20px', 
              textAlign: 'center',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              color: '#666'
            }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" style={{ margin: '0 auto 15px' }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>
                {filter === 'all' && 'No notifications'}
                {filter === 'unread' && 'No unread notifications'}
                {filter === 'read' && 'No read notifications'}
              </h3>
              <p style={{ margin: 0, fontSize: '14px' }}>
                {filter === 'all' && 'You\'re all caught up!'}
                {filter === 'unread' && 'All your notifications have been read'}
                {filter === 'read' && 'No notification history available'}
              </p>
            </div>
          )}

          {/* Notifications List */}
          {!loading && !error && filteredReminders.length > 0 && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e9ecef',
              overflow: 'hidden'
            }}>
              {filteredReminders.map((reminder, index) => {
                const isChanged = reminder.reminderType === 2 || reminder.reminderType === 3;
                const isCanceled = reminder.reminderType === 4 || reminder.reminderType === 5;
                
                return (
                <div
                  key={reminder.reminder_id}
                  style={{
                    padding: '20px',
                    borderBottom: index < filteredReminders.length - 1 ? '1px solid #f0f0f0' : 'none',
                    backgroundColor: reminder.isRead ? 'white' : '#f8f9fa',
                    transition: 'background-color 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = reminder.isRead ? 'white' : '#f8f9fa'}
                >
                  <div style={{ 
                    padding: '15px',
                    backgroundColor: isChanged ? '#fff8e1' : isCanceled ? '#f8d7da' : '#e8e8e8',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    borderLeft: isChanged ? '4px solid #ff9800' : isCanceled ? '4px solid #dc3545' : 'none'
                  }}>
                    {/* Header Bar with Cross */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '10px 15px',
                      backgroundColor: isChanged ? '#fff8e1' : isCanceled ? '#f8d7da' : '#e8e8e8',
                      marginBottom: '-20px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>
                          {reminder.reminderType === 0 || reminder.reminderType === 2 || reminder.reminderType === 4 ? '📅' : '🔔'}
                          {(reminder.reminderType === 2 || reminder.reminderType === 3) && (
                            <span style={{ marginLeft: '6px', fontSize: '14px' }}>📝</span>
                          )}
                          {(reminder.reminderType === 4 || reminder.reminderType === 5) && (
                            <span style={{ marginLeft: '6px', fontSize: '14px' }}>❌</span>
                          )}
                        </span>
                        <span style={{ 
                          fontSize: '15px', 
                          fontWeight: '600',
                          color: '#333'
                        }}>
                          {reminder.title}
                        </span>
                      </div>
                      <button
                        onClick={() => !reminder.isRead && handleMarkAsRead(reminder.reminder_id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: reminder.isRead ? 'default' : 'pointer',
                          color: reminder.isRead ? 'transparent' : '#666',
                          padding: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                          visibility: reminder.isRead ? 'hidden' : 'visible'
                        }}
                        onMouseEnter={(e) => {
                          if (!reminder.isRead) {
                            e.currentTarget.style.backgroundColor = '#d0d0d0';
                            e.currentTarget.style.color = '#333';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!reminder.isRead) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#666';
                          }
                        }}
                        title={reminder.isRead ? '' : 'Mark as read'}
                        disabled={reminder.isRead}
                      >
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>

                    {/* Separator line under header */}
                    <div style={{ padding: '0 15px' }}>
                      <div style={{
                        borderTop: '1px solid #c0c0c0',
                        margin: '10px 0'
                      }} />
                    </div>

                    {/* Date and Time Row with IDs */}
                    <div style={{ 
                      fontSize: '14px',
                      color: '#666',
                      fontWeight: '500',
                      marginBottom: '12px',
                      padding: '0 15px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center'
                    }}>
                      <span>{formatDateOnly(reminder.reminderTime)} • {formatTimeOnly(reminder.reminderTime)}</span>
                      {reminder.relatedEventId !== 0 && (
                        <>
                          <span style={{ color: '#999' }}>|</span>
                          <span style={{ fontSize: '13px' }}>Event ID: {reminder.relatedEventId}</span>
                        </>
                      )}
                      {reminder.relatedRoomId !== 0 && (
                        <>
                          <span style={{ color: '#999' }}>|</span>
                          <span style={{ fontSize: '13px' }}>Room ID: {reminder.relatedRoomId}</span>
                        </>
                      )}
                    </div>

                    {/* Content Row */}
                    <div style={{ padding: '0 15px 12px 15px' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#666',
                        lineHeight: '1.5'
                      }}>
                        {reminder.message}
                      </div>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>

        {/* Add spinner animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </main>
    </div>
  );
};

export default Notifications;

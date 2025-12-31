import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useReminders, getRoomById, RoomDto } from '../hooks/hooks';
import '../styles/index.css';

const Notifications: React.FC = () => {
  const { reminders, loading, error, markAsRead, markAllAsRead } = useReminders();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [roomsCache, setRoomsCache] = useState<Record<number, RoomDto>>({});

  // Fetch room details for reminders with room IDs
  useEffect(() => {
    const roomIds = Array.from(new Set(
      reminders
        .filter(r => r.relatedRoomId !== 0)
        .map(r => r.relatedRoomId)
    ));

    roomIds.forEach(async (roomId) => {
      if (!roomsCache[roomId]) {
        try {
          const room = await getRoomById(roomId);
          if (room) {
            setRoomsCache(prev => ({ ...prev, [roomId]: room }));
          }
        } catch (error) {
          console.error(`Failed to fetch room ${roomId}:`, error);
        }
      }
    });
  }, [reminders]);

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
  }).sort((a, b) => b.reminder_id - a.reminder_id);

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
              <h1 style={{ margin: '0 0 5px 0', fontSize: '28px', color: 'var(--text-primary)' }}>Notifications</h1>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '25px',
            backgroundColor: 'var(--bg-tertiary)',
            padding: '6px',
            borderRadius: '10px'
          }}>
            {(['all', 'unread', 'read'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? 'var(--bg-primary)' : 'none',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  position: 'relative',
                  color: filter === f ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'unread' && unreadCount > 0 && (
                  <span style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginLeft: '6px'
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
              color: '#999' 
            }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" style={{ margin: '0 auto 15px' }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <h3 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '18px' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredReminders.map((reminder) => {
                const isChanged = reminder.reminderType === 2 || reminder.reminderType === 3;
                const isCanceled = reminder.reminderType === 4 || reminder.reminderType === 5;

                return (
                  <div 
                    key={reminder.reminder_id} 
                    style={{
                      backgroundColor: reminder.isRead ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '16px',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 4px var(--shadow)'
                    }}
                  >
                    <div className="reminder-item" style={{ 
                      padding: '15px',
                      // backgroundColor: isChanged ? '#fff8e1' : isCanceled ? '#f8d7da' : '#e8e8e8',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      borderLeft: isChanged ? '4px solid #ff9800' : isCanceled ? '4px solid #dc3545' : 'none'
                    }}>
                      {/* Header Bar with Cross */}
                      <div className="reminder-item-header" style={{ padding: '12px 16px' }}>
                        <div className="reminder-item-header-left">
                          <span className="reminder-item-icon" style={{ fontSize: '28px' }}>
                            {reminder.reminderType === 0 ? '📅' : '🔔'}
                          </span>
                          <span className="reminder-item-title" style={{ fontSize: '18px', fontWeight: '600' }}>
                            {reminder.title}
                          </span>
                        </div>
                        {!reminder.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(reminder.reminder_id)}
                            className="reminder-mark-read-btn"
                            title="Mark as read"
                            style={{ width: '28px', height: '28px' }}
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Date and Time Row with Room Info */}
                      <div style={{ 
                        fontSize: '13px', 
                        color: 'var(--text-secondary)', 
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span>{formatDateOnly(reminder.reminderTime)} • {formatTimeOnly(reminder.reminderTime)}</span>
                        {reminder.relatedRoomId !== 0 && roomsCache[reminder.relatedRoomId] && (
                          <>
                            <span> | </span>
                            <span>{roomsCache[reminder.relatedRoomId].roomName} • {roomsCache[reminder.relatedRoomId].location}</span>
                          </>
                        )}
                      </div>

                      {/* Content Row */}
                      <div style={{ 
                        fontSize: '14px', 
                        lineHeight: '1.5',
                        color: 'var(--text-primary)'
                      }}>
                        {reminder.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

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

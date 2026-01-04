import React, { useState, useEffect } from 'react';
import Sidebar from '../UI/Sidebar';
import { useReminders, RoomDto } from '../hooks/hooks';
// import { getRoomById } from '../hooks/hooks';

import { formatDateOnly, formatTimeOnly } from '../utils/dateFormatters';
import '../styles/index.css';
import '../styles/notifications-page.css';
import '../styles/reminder-notification.css';

const Notifications: React.FC = () => {
  const { reminders, loading, error, markAsRead, markAllAsRead } = useReminders();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [roomsCache, setRoomsCache] = useState<Record<number, RoomDto>>({});

  // Fetch room details for reminders with room IDs
  // useEffect(() => {
  //   const roomIds = Array.from(new Set(
  //     reminders
  //       .filter(r => r.relatedRoomId !== 0)
  //       .map(r => r.relatedRoomId)
  //   ));

  //   const fetchRooms = async () => {
  //     const roomsToFetch = roomIds.filter(roomId => !roomsCache[roomId]);
      
  //     if (roomsToFetch.length === 0) return;

  //     try {
  //       const roomPromises = roomsToFetch.map(roomId => 
  //         getRoomById(roomId).catch(error => {
  //           console.error(`Failed to fetch room ${roomId}:`, error);
  //           return null;
  //         })
  //       );
        
  //       const rooms = await Promise.all(roomPromises);
        
  //       const newRooms: Record<number, RoomDto> = {};
  //       rooms.forEach((room, index) => {
  //         if (room) {
  //           newRooms[roomsToFetch[index]] = room;
  //         }
  //       });
        
  //       if (Object.keys(newRooms).length > 0) {
  //         setRoomsCache(prev => ({ ...prev, ...newRooms }));
  //       }
  //     } catch (error) {
  //       console.error('Failed to fetch rooms:', error);
  //     }
  //   };

  //   fetchRooms();
  // }, [reminders, roomsCache]);

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
        <div className="notifications-container">
          {/* Header */}
          <div className="notifications-header-card">
            <div className="notifications-header">
              <h1>Notifications</h1>
              <p className="notifications-status">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
          </div>

          {/* Filter Tabs with Mark All Button - Outside card */}
          <div className="notifications-tabs-wrapper">
            <div className="notifications-tabs">
              {(['all', 'unread', 'read'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`notifications-tab ${filter === f ? 'active' : ''}`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === 'unread' && unreadCount > 0 && (
                    <span className="notifications-tab-badge">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="notifications-mark-all-btn"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Content Card */}
          <div className="notifications-content-card">

          {/* Loading State */}
          {loading && (
            <div className="notifications-loading">
              <div className="spinner" />
              Loading notifications...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="notifications-error">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredReminders.length === 0 && (
            <div className="notifications-empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <h3>
                {filter === 'all' && 'No notifications'}
                {filter === 'unread' && 'No unread notifications'}
                {filter === 'read' && 'No read notifications'}
              </h3>
              <p>
                {filter === 'all' && 'You\'re all caught up!'}
                {filter === 'unread' && 'All your notifications have been read'}
                {filter === 'read' && 'No notification history available'}
              </p>
            </div>
          )}

          {/* Notifications List */}
          {!loading && !error && filteredReminders.length > 0 && (
            <div className="notifications-list">
              {filteredReminders.map((reminder) => {
                const isChanged = reminder.reminderType === 2 || reminder.reminderType === 3;
                const isCanceled = reminder.reminderType === 4 || reminder.reminderType === 5;
                const icon = reminder.reminderType === 0 || reminder.reminderType === 2 || reminder.reminderType === 4 ? '📅' : '🔔';
                const itemClass = `reminder-item ${isChanged ? 'reminder-item-changed' : ''} ${isCanceled ? 'reminder-item-canceled' : ''}`;

                return (
                  <div key={reminder.reminder_id} className="reminder-item-wrapper">
                    <div className={itemClass}>
                      {/* Header Bar with Cross */}
                      <div className="reminder-item-header">
                        <div className="reminder-item-header-left">
                          <span className="reminder-item-icon">
                            {icon}
                            {isChanged && <span className="reminder-changed-badge">📝</span>}
                            {isCanceled && <span className="reminder-canceled-badge">❌</span>}
                          </span>
                          <span className="reminder-item-title">
                            {reminder.title}
                          </span>
                        </div>
                        {!reminder.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(reminder.reminder_id)}
                            className="reminder-item-close"
                            title="Mark as read"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {/* Date and Time Row with Room Info */}
                      <div className="reminder-item-body">
                        <div className="reminder-item-description">
                          {formatDateOnly(reminder.reminderTime)} • {formatTimeOnly(reminder.reminderTime)}
                          {/* {reminder.relatedRoomId !== 0 && roomsCache[reminder.relatedRoomId] && (
                            <span> | {roomsCache[reminder.relatedRoomId].roomName} • {roomsCache[reminder.relatedRoomId].location}</span>
                          )} */}
                        </div>
                        <div className="reminder-item-info">
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
        </div>
      </main>
    </div>
  );
};

export default Notifications;
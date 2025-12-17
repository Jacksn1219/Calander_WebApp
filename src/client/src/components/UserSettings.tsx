import React, { useState, useRef, useEffect } from 'react';
import { useUserSettings, useLogoutWithConfirmation } from '../hooks/hooks';
import { useAuth } from '../states/AuthContext';
import '../styles/user-settings.css';

const UserSettings: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [advanceMinutesInput, setAdvanceMinutesInput] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const handleLogout = useLogoutWithConfirmation();
  const {
    preferences,
    loading,
    error,
    toggleEventReminder,
    toggleBookingReminder,
    updateAdvanceMinutes,
  } = useUserSettings();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

  // Parse TimeSpan to minutes
  useEffect(() => {
    if (preferences?.reminderAdvanceMinutes) {
      const parts = preferences.reminderAdvanceMinutes.split(':');
      const hours = parseInt(parts[0], 10) || 0;
      const mins = parseInt(parts[1], 10) || 0;
      const totalMinutes = hours * 60 + mins;
      setAdvanceMinutesInput(totalMinutes.toString());
    }
  }, [preferences]);

  const handleAdvanceMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdvanceMinutesInput(e.target.value);
  };

  const handleAdvanceMinutesBlur = () => {
    const minutes = parseInt(advanceMinutesInput, 10);
    if (!isNaN(minutes) && minutes >= 0) {
      updateAdvanceMinutes(minutes);
    }
  };

  return (
    <div className="user-settings-container">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="user-settings-button"
      >
        <div className="user-avatar">
          {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <span className="user-name">{user?.name || 'User'}</span>
          <span className="user-role">{user?.role || 'Role'}</span>
        </div>
      </button>

      {showSettings && (
        <div ref={dropdownRef} className="user-settings-dropdown">
          <div className="user-settings-header">
            <h3 className="user-settings-title">Settings</h3>
          </div>

          {loading ? (
            <div className="user-settings-loading">Loading...</div>
          ) : error ? (
            <div className="user-settings-error">{error}</div>
          ) : preferences ? (
            <div className="user-settings-content">
              <div className="settings-section">
                <h4 className="settings-section-title">Reminder Preferences</h4>
                
                <div className="settings-item">
                  <div className="settings-item-label">
                    <span>Event Reminders</span>
                  </div>
                  <button
                    onClick={toggleEventReminder}
                    className={`toggle-button ${preferences.eventReminder ? 'active' : ''}`}
                  >
                    <span className="toggle-slider"></span>
                  </button>
                </div>

                <div className="settings-item">
                  <div className="settings-item-label">
                    <span>Booking Reminders</span>
                  </div>
                  <button
                    onClick={toggleBookingReminder}
                    className={`toggle-button ${preferences.bookingReminder ? 'active' : ''}`}
                  >
                    <span className="toggle-slider"></span>
                  </button>
                </div>

                <div className="settings-item">
                  <div className="settings-item-label">
                    <span>Advance Notice (minutes)</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={advanceMinutesInput}
                    onChange={handleAdvanceMinutesChange}
                    onBlur={handleAdvanceMinutesBlur}
                    className="advance-minutes-input"
                  />
                </div>
              </div>

              <div className="settings-divider"></div>

              <div className="settings-actions">
                <button onClick={handleLogout} className="logout-button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="user-settings-empty">No preferences found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSettings;

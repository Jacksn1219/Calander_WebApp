import React, { useState, useRef, useEffect } from 'react';
import { useUserSettings, useLogoutWithConfirmation } from '../hooks/hooks';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../auth/ThemeContext';
import '../styles/user-settings.css';
import '../styles/sidebar.css';

type UserSettingsDropdownPlacement = 'below' | 'right';

type UserSettingsProps = {
  dropdownPlacement?: UserSettingsDropdownPlacement;
  showLogoutAction?: boolean;
  showLabel?: boolean;
};

const UserSettings: React.FC<UserSettingsProps> = ({
  dropdownPlacement = 'below',
  showLogoutAction = true,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [advanceMinutesInput, setAdvanceMinutesInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

  // Close dropdown on Escape
  useEffect(() => {
    if (!showSettings) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setShowSettings(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
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
    <div
      className={
        `user-settings-container` +
        (dropdownPlacement === 'right' ? ' dropdown-right' : '')
      }
      ref={containerRef}
    >

        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className="user-settings-button"
          aria-haspopup="menu"
          aria-expanded={showSettings}
        >
          <div className="user-avatar">
            {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-role">{user?.role || 'Role'}</span>
          </div>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 'auto', opacity: 1 }}>
            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
          </svg>
        </button>

      {showSettings && (
        <div className="user-settings-dropdown">
          <div className="user-settings-header">
            <h3 className="user-settings-title">Settings</h3>
          </div>

          {loading ? (
            <div className="user-settings-loading">Loading...</div>
          ) : error ? (
            <div className="user-settings-error">{error}</div>
          ) : (
            <div className="user-settings-content">
              <div className="settings-section">
                <h4 className="settings-section-title">Appearance</h4>
                
                <div className="settings-item">
                  <div className="settings-item-label">
                    <span>Dark Mode</span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`toggle-button ${theme === 'dark' ? 'active' : ''}`}
                  >
                    <span className="toggle-slider"></span>
                  </button>
                </div>
              </div>

              {preferences ? (
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

                </div>
              ) : (
                <div className="user-settings-empty">No preferences found</div>
              )}

              <div className="settings-divider"></div>

            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSettings;

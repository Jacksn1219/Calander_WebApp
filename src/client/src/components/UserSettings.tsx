import React, { useState, useRef, useEffect } from 'react';
import { useUserSettings, useLogoutWithConfirmation } from '../hooks/hooks';
import { useAuth } from '../states/AuthContext';
import { useTheme } from '../states/ThemeContext';
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

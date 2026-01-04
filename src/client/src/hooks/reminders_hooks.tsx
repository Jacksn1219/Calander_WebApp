import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiFetch } from '../config/api';
import { RoomDto } from '../types/room_types';
import { Reminder, ReminderPreferences } from '../types/reminder_types';

/*
====================================
REMINDERS SECTION
====================================
*/

/*
 Custom hook to fetch reminders for the logged-in user
 */
export const useReminders = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchReminders = useCallback(async (silent = false) => {
    if (!user?.userId) {
      setError('No user logged in');
      return;
    }

    // Only show loading state on initial load, not on polling refreshes
    if (!silent) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await apiFetch(
        `/api/reminders/user/${user.userId}`, {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch reminders: ${response.statusText}`);
      }

      const data = await response.json();
      setReminders(data);
      setIsInitialLoad(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching reminders');
      console.error('Error fetching reminders:', err);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [user?.userId]);

  // Refresh reminders on user interaction and window focus
  useEffect(() => {
    fetchReminders(false); // Initial load with loading state
    
    // Refresh when user returns to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchReminders(true); // Silent refresh
      }
    };

    // Refresh when window gains focus
    const handleFocus = () => {
      fetchReminders(true); // Silent refresh
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Fallback: refresh every 2 minutes as backup (less aggressive than 30s)
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchReminders(true);
      }
    }, 120000); // 2 minutes

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, [fetchReminders]);

  const markAsRead = useCallback(async (reminderId: number) => {
    try {
      const response = await apiFetch(`/api/reminders/mark-as-read/${reminderId}`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error(`Failed to mark reminder as read: ${response.statusText}`);
      }

      // Update local state immediately for instant feedback
      setReminders(prev => 
        prev.map(r => r.reminder_id === reminderId ? { ...r, isRead: true } : r)
      );
    } catch (err: any) {
      console.error('Error marking reminder as read:', err);
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const unsentReminders = reminders.filter(r => !r.isRead);
      await Promise.all(
        unsentReminders.map(r => markAsRead(r.reminder_id))
      );
    } catch (err: any) {
      console.error('Error marking all reminders as read:', err);
    }
  }, [reminders, markAsRead]);

  return {
    reminders,
    loading,
    error,
    refetch: () => fetchReminders(false),
    markAsRead,
    markAllAsRead,
  };
};

// USER SETTINGS / PREFERENCES

// export const getRoomById = async (roomId: number): Promise<RoomDto | null> => {
//   try {
//     const response = await apiFetch(`/api/rooms/${roomId}`);
//     if (!response.ok) {
//       throw new Error('Failed to fetch room');
//     }
//     const data = await response.json();
//     return {
//       room_id: data.room_id ?? data.RoomId ?? data.id ?? data.Id,
//       roomName: data.room_name ?? data.roomName ?? data.RoomName ?? 'Room',
//       capacity: data.capacity ?? data.Capacity ?? null,
//       location: data.location ?? data.Location ?? '',
//     };
//   } catch (err) {
//     console.error('Error fetching room:', err);
//     return null;
//   }
// };

export const useUserSettings = () => {
  const [preferences, setPreferences] = useState<ReminderPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPreferences = useCallback(async () => {
    if (!user?.userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/reminderspreferences/user/${user.userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }

      const data = await response.json();
      if (data && data.length > 0) {
        setPreferences(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  const toggleEventReminder = useCallback(async () => {
    if (!user?.userId) return;

    try {
      const response = await apiFetch(`/api/reminderspreferences/${user.userId}/toggle-eventreminder`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle event reminder');
      }

      const newValue = await response.json();
      setPreferences(prev => prev ? { ...prev, eventReminder: newValue } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [user?.userId]);

  const toggleBookingReminder = useCallback(async () => {
    if (!user?.userId) return;

    try {
      const response = await apiFetch(`/api/reminderspreferences/${user.userId}/toggle-bookingreminder`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle booking reminder');
      }

      const newValue = await response.json();
      setPreferences(prev => prev ? { ...prev, bookingReminder: newValue } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [user?.userId]);

  const updateAdvanceMinutes = useCallback(async (minutes: number) => {
    if (!user?.userId) return;

    try {
      // Convert minutes to TimeSpan format (HH:mm:ss)
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const timeSpan = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;

      const response = await apiFetch(`/api/reminderspreferences/${user.userId}/advance-minutes`, {
        method: 'PATCH',
        body: JSON.stringify(timeSpan),
      });

      if (!response.ok) {
        throw new Error('Failed to update advance minutes');
      }

      const updated = await response.json();
      setPreferences(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    toggleEventReminder,
    toggleBookingReminder,
    updateAdvanceMinutes,
    refetch: fetchPreferences,
  };
};

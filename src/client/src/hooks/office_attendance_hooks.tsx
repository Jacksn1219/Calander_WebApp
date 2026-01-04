import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiFetch } from '../config/api';
import { AttendanceStatus } from '../types/attendance_types';

// _________________________________________
// start functions office attendance
// _________________________________________

const STATUS_TO_INT = {
  Present: 0,
  Absent: 1,
  Remote: 2,
} as const;

const INT_TO_STATUS = {
  0: 'Present',
  1: 'Absent',
  2: 'Remote',
} as const;

export const useOfficeAttendance = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Load today's attendance for the current user
   */
  useEffect(() => {
    const loadTodayAttendance = async () => {
      if (!user?.userId) return;
      
      try {
        const res = await apiFetch(`/api/office-attendance/today/${user.userId}`);

        if (res.ok) {
          const data: { status: number } = await res.json();
          setStatus(INT_TO_STATUS[data.status as 0 | 1 | 2]);
        } else if (res.status === 404) {
          // No attendance set for today
          setStatus(null);
        } else {
          console.error('Failed to load attendance:', res.status);
        }
      } catch (err) {
        console.error('Attendance load error', err);
        setStatus(null);
      }
    };

    loadTodayAttendance();
  }, []);

  /**
   * Set or update today's attendance (UPSERT)
   */
  const setTodayAttendance = async (newStatus: AttendanceStatus) => {
    if (!user?.userId) return;
    
    setLoading(true);

    try {
      const res = await apiFetch(`/api/office-attendance/today/${user.userId}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: STATUS_TO_INT[newStatus],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Update failed (${res.status}): ${text}`);
      }

      const data: { status: number } = await res.json();
      setStatus(INT_TO_STATUS[data.status as 0 | 1 | 2]);
    } catch (err) {
      console.error('Attendance update error', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    status,
    loading,
    setTodayAttendance,
  };
};
// _________________________________________
// end functions office attendance
// _________________________________________

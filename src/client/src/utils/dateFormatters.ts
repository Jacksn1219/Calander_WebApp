/**
 * Date formatting utilities
 * Centralized date/time formatting functions used across the application
 */

/**
 * Format a date string to include date and time
 * @param dateString ISO date string
 * @returns Formatted string like "03 jan. 2026, 14:30"
 */
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('nl-NL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format a date string to show only the date
 * @param dateString ISO date string
 * @returns Formatted string like "03 jan. 2026"
 */
export const formatDateOnly = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Format a date string to show only the time
 * @param dateString ISO date string
 * @returns Formatted string like "14:30"
 */
export const formatTimeOnly = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

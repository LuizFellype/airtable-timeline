
import { format, differenceInDays, isValid, parseISO } from 'date-fns';

export { parseISO } from 'date-fns';
/**
 * Format a date string for display
 */
export const formatDateForDisplay = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;
    return format(date, 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
};

/**
 * Format a date string for input fields (YYYY-MM-DD)
 */
export const formatDateForInput = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;
    return format(date, 'yyyy-MM-dd');
  } catch {
    return dateString;
  }
};

/**
 * Calculate duration between two dates in days (inclusive)
 */
export const calculateDuration = (startDate: string, endDate: string): number => {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (!isValid(start) || !isValid(end)) return 0;

    // Add 1 to include both start and end days
    return Math.abs(differenceInDays(end, start)) + 1;
  } catch {
    return 0;
  }
};

/**
 * Validate if a date string is valid
 */
export const isValidDateString = (dateString: string): boolean => {
  try {
    const date = parseISO(dateString);
    return isValid(date);
  } catch {
    return false;
  }
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

/**
 * Ensure end date is not before start date
 */
export const validateDateRange = (startDate: string, endDate: string): { startDate: string; endDate: string } => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  if (!isValid(start) || !isValid(end)) {
    return { startDate, endDate };
  }

  if (start > end) {
    // Swap dates if end is before start
    return {
      startDate: format(end, 'yyyy-MM-dd'),
      endDate: format(start, 'yyyy-MM-dd')
    };
  }

  return { startDate, endDate };
};

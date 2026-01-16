import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging Tailwind classes
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format date helper
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format time helper
export function formatTime(timeString) {
  return timeString;
}

// Get status color
export function getStatusColor(status) {
  switch (status) {
    case 'present':
      return 'status-present';
    case 'absent':
      return 'status-absent';
    case 'leave':
      return 'status-leave';
    case 'holiday':
      return 'status-holiday';
    default:
      return 'bg-gray-300';
  }
}

// Get status label
export function getStatusLabel(status) {
  switch (status) {
    case 'present':
      return 'P';
    case 'absent':
      return 'A';
    case 'leave':
      return 'L';
    case 'holiday':
      return 'H';
    default:
      return '-';
  }
}

// Generate calendar days for a month
export function getMonthDays(month, year) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    days.push({
      date: day,
      dateString: date.toISOString().split('T')[0],
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
    });
  }
  
  return days;
}

// Get week days (last 7 days)
export function getWeekDays() {
  const days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push({
      date: date.getDate(),
      dateString: date.toISOString().split('T')[0],
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: date,
    });
  }
  
  return days;
}

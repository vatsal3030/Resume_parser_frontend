/**
 * Global date formatting utility.
 * All dates in the app should use these functions for consistency.
 * Format: DD/MM/YYYY
 */

/**
 * Format a date string or Date object to DD/MM/YYYY
 * @param {string|Date} dateInput - ISO string, Date object, or any parseable date
 * @param {object} options - { showTime: false, showRelative: false }
 * @returns {string} Formatted date string
 */
export function formatDate(dateInput, options = {}) {
  if (!dateInput) return '—';
  
  const { showTime = false, showRelative = false } = options;
  const date = new Date(dateInput);
  
  if (isNaN(date.getTime())) return '—';

  if (showRelative) {
    const relative = getRelativeTime(date);
    if (relative) return relative;
  }

  const d = date.getDate();
  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  
  const dayWithSuffix = getOrdinal(d);
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  if (showTime) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${dayWithSuffix} ${month} ${year} ${hours}:${minutes}`;
  }

  return `${dayWithSuffix} ${month} ${year}`;
}

/**
 * Get relative time string (e.g., "2 hours ago", "Just now")
 * Returns null if older than 7 days (caller should fall back to absolute date)
 */
function getRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return null; // Older than 7 days — use absolute
}

/**
 * Format date as "Month DD, YYYY" for display contexts that need it
 */
export function formatDateLong(dateInput) {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '—';
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

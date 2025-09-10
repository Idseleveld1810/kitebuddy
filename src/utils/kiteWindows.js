/**
 * Utility functions for computing kiteable wind windows
 */

// Threshold for kiteable conditions (average wind speed)
const KITEABLE_THRESHOLD = 8;

/**
 * Find all wind windows in a day's hourly data
 * @param {Array} hours - Array of hourly wind data
 * @returns {Array} Array of window objects with start, end, hours, and average speed
 */
export function findWindWindows(hours) {
  if (!hours || hours.length === 0) return [];
  
  const windows = [];
  let currentWindow = null;
  
  for (let i = 0; i < hours.length; i++) {
    const hour = hours[i];
    
    // Check if this hour meets kiteable conditions
    const windSpeed = hour.windSpeed || hour.speed || 0;
    if (windSpeed >= KITEABLE_THRESHOLD) {
      if (!currentWindow) {
        // Start new window
        currentWindow = {
          start: hour.time,
          end: hour.time,
          hours: [hour],
          avgSpeed: windSpeed
        };
      } else {
        // Extend current window
        currentWindow.end = hour.time;
        currentWindow.hours.push(hour);
        currentWindow.avgSpeed = currentWindow.hours.reduce((sum, h) => sum + (h.windSpeed || h.speed || 0), 0) / currentWindow.hours.length;
      }
    } else {
      // Close current window if it exists
      if (currentWindow) {
        windows.push(currentWindow);
        currentWindow = null;
      }
    }
  }
  
  // Don't forget to add the last window if it exists
  if (currentWindow) {
    windows.push(currentWindow);
  }
  
  return windows;
}

/**
 * Get the best wind windows for display
 * @param {Array} hours - Array of hourly wind data
 * @returns {Object} Object with bestSpeed, bestWindow, and allWindows
 */
export function getBestWindWindows(hours) {
  const allWindows = findWindWindows(hours);
  
  if (allWindows.length === 0) {
    return {
      bestSpeed: null,
      bestWindow: null,
      allWindows: []
    };
  }
  
  // Sort windows by: highest average speed, then longer duration, then earlier start
  const sortedWindows = allWindows.sort((a, b) => {
    // First by average speed (descending)
    if (Math.abs(a.avgSpeed - b.avgSpeed) > 0.1) {
      return b.avgSpeed - a.avgSpeed;
    }
    
    // Then by duration (descending)
    const aDuration = a.hours.length;
    const bDuration = b.hours.length;
    if (aDuration !== bDuration) {
      return bDuration - aDuration;
    }
    
    // Finally by start time (ascending)
    return a.start.localeCompare(b.start);
  });
  
  const bestWindow = sortedWindows[0];
  const top2Windows = sortedWindows.slice(0, 2);
  
  return {
    bestSpeed: Math.round(bestWindow.avgSpeed),
    bestWindow: bestWindow,
    allWindows: top2Windows
  };
}

/**
 * Format wind window display string
 * @param {Array} windows - Array of window objects
 * @returns {string} Formatted display string
 */
export function formatWindWindowDisplay(windows) {
  if (windows.length === 0) {
    return 'Geen wind';
  }
  
  const formatTime = (timeStr) => {
    try {
      // Handle both ISO strings and formatted time strings
      if (timeStr.includes('T')) {
        // ISO string format
        return new Date(timeStr).toLocaleTimeString('nl-NL', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
      return timeStr; // Already formatted
    } catch (error) {
      return timeStr; // Fallback to original string
    }
  };
  
  if (windows.length === 1) {
    const window = windows[0];
    const startTime = formatTime(window.start);
    const endTime = formatTime(window.end);
    return startTime === endTime ? startTime : `${startTime}–${endTime}`;
  }
  
  // Multiple windows - return array of strings for multi-line display
  return windows.map(window => {
    const startTime = formatTime(window.start);
    const endTime = formatTime(window.end);
    return startTime === endTime ? startTime : `${startTime}–${endTime}`;
  });
}

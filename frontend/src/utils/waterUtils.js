// frontend/src/utils/waterUtils.js

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Get user's current geolocation
 * @returns {Promise<[number, number]>} [longitude, latitude]
 */
export function getCoordinates() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Geolocation not supported"));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve([longitude, latitude]); // GeoJSON order [lng, lat]
      },
      (error) => reject(error)
    );
  });
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} Whether coordinates are valid
 */
export function isValidCoordinates(lat, lon) {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    !isNaN(lat) &&
    !isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

/**
 * Transform backend water source data to frontend format
 * @param {Object} source - Backend source object
 * @param {number} userLat - User's latitude
 * @param {number} userLon - User's longitude
 * @returns {Object} Transformed source object
 */
export function transformWaterSource(source, userLat, userLon) {
  const lat = source.location?.coordinates?.[1];
  const lon = source.location?.coordinates?.[0];
  
  return {
    _id: source._id,
    name: source.name || 'Unknown',
    lat: lat,
    lon: lon,
    distance_km: calculateDistance(userLat, userLon, lat, lon),
    tests: source.tests || {},
    quality: source.quality,
    ph: source.ph,
    tds: source.tds,
    contaminants: source.contaminants || [],
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}

/**
 * Parse test results from textarea input
 * @param {string} text - Text input with key:value pairs
 * @returns {Object} Parsed test results
 */
export function parseTestResults(text) {
  const lines = text.split('\n');
  const tests = {};
  
  lines.forEach(line => {
    const [key, val] = line.split(':').map(s => s.trim());
    if (key && val) {
      // Try to convert to number if possible
      const numVal = Number(val);
      tests[key] = isNaN(numVal) ? val : numVal;
    }
  });
  
  return tests;
}

/**
 * Format test results for display
 * @param {Object} tests - Test results object
 * @param {number} maxItems - Maximum items to display
 * @returns {string} Formatted string
 */
export function formatTestResults(tests, maxItems = 3) {
  if (!tests || typeof tests !== 'object') return '';
  
  const entries = Object.entries(tests).slice(0, maxItems);
  return entries.map(([key, value]) => `${key}: ${value}`).join(', ');
}

/**
 * Get coordinates with better error handling
 * @returns {Promise<[number, number]>} [longitude, latitude]
 */


/**
 * Get water quality status based on pH and TDS
 * @param {number} ph - pH level
 * @param {number} tds - TDS level (ppm)
 * @returns {Object} { status: string, score: number, message: string }
 */
export function getWaterQualityStatus(ph, tds) {
  let score = 100;
  const issues = [];
  
  // Check pH (safe range: 6.5 - 8.5)
  if (ph < 6.5 || ph > 8.5) {
    score -= 30;
    if (ph < 6.5) {
      issues.push('pH too acidic');
    } else {
      issues.push('pH too alkaline');
    }
  }
  
  // Check TDS (safe range: < 500 ppm)
  if (tds > 500) {
    score -= 40;
    issues.push('High dissolved solids');
  }
  
  const status = score > 60 ? 'Safe' : 'Unsafe';
  const message = issues.length > 0 ? issues.join(', ') : 'Water quality is good';
  
  return { status, score, message, issues };
}

/**
 * Create custom Leaflet icon
 * @param {string} color - Icon color (hex or name)
 * @returns {string} Base64 encoded SVG data URL
 */
export function createMarkerIcon(color = '#3b82f6') {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path fill="${color}" stroke="#fff" stroke-width="2" d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 18 9 18s9-11.25 9-18c0-4.97-4.03-9-9-9z"/>
      <circle cx="12" cy="9" r="4" fill="#fff"/>
    </svg>
  `;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

/**
 * Debounce function for search inputs
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
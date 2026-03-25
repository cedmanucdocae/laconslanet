/**
 * Frontend Configuration
 *
 * This file contains configuration settings for the frontend application.
 * Automatically detects environment (development vs production).
 */

// Detect if we're in production (deployed) or development (localhost)
const isProduction = window.location.hostname !== 'localhost' &&
                     window.location.hostname !== '127.0.0.1';

const CONFIG = {
  // Backend API URL - automatically uses same origin in production
  API_BASE_URL: isProduction ? window.location.origin : "http://localhost:5000",

  // Socket.IO URL - same as API_BASE_URL
  SOCKET_URL: isProduction ? window.location.origin : "http://localhost:5000",

  // API endpoints
  API: {
    AUTH: "/api/auth",
    PROFILE: "/api/profile",
    USERS: "/api/users",
    POSTS: "/api/posts",
    HOMEPOSTS: "/api/homeposts",
    COMMENTS: "/api/comments",
    LIKES: "/api/likes",
    SHARES: "/api/shares",
    NOTIFICATIONS: "/api/notifications",
    MESSAGES: "/api/messages",
    BIRTHDAYS: "/api/birthdays",
    ANNOUNCEMENTS: "/api/announcements",
    NEWS: "/api/news",
    LOSTFOUND: "/api/lostfound",
    REPORTS: "/api/reports",
    ADMIN: "/api/admin",
    ACTIVITY: "/api/activity",
  },
};

// Helper function to get full API URL
function getApiUrl(endpoint) {
  return CONFIG.API_BASE_URL + endpoint;
}

// Export for use in modules (if using module system)
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}

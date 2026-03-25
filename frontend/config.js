/**
 * Frontend Configuration
 *
 * This file contains configuration settings for the frontend application.
 * For production, update API_BASE_URL to your deployed backend URL.
 */

const CONFIG = {
  // Backend API URL - change this for production deployment
  API_BASE_URL: "http://localhost:5000",

  // Socket.IO URL - usually same as API_BASE_URL
  SOCKET_URL: "http://localhost:5000",

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

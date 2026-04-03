// === Global Logout Handler (works on all pages and folders) ===
const apiBaseUrl =
  (window.RUNTIME_CONFIG && window.RUNTIME_CONFIG.API_BASE_URL) ||
  (window.CONFIG && window.CONFIG.API_BASE_URL) ||
  "http://localhost:5000";

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) {
    console.warn("⚠️ No logout button found on this page.");
    return;
  }

  logoutBtn.addEventListener("click", async () => {
    console.log("🟡 Logout button clicked");

    // 🧹 Clear token and user data first
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    const token = localStorage.getItem("token");
    try {
      // optional backend cleanup
      await fetch(`${apiBaseUrl}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
    } catch (err) {
      console.warn("Server logout skipped:", err.message);
    }

    // ✅ Absolute redirect to Login page (works regardless of folder depth)
    let redirectURL = "";

    // Detect where we are and construct a working path
    if (window.location.href.includes("/frontend/Webpage/")) {
      redirectURL = window.location.origin + "/frontend/Login/index.html";
    } else if (window.location.href.includes("/Webpage/")) {
      redirectURL = window.location.origin + "/Login/index.html";
    } else {
      // fallback if running directly from file:// or live server
      redirectURL = "../Login/index.html";
    }

    console.log("🔵 Redirecting to:", redirectURL);
    window.location.href = redirectURL;
  });
});

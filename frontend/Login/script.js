document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const sharedConfig =
    (window.RUNTIME_CONFIG &&
      window.RUNTIME_CONFIG.API_BASE_URL &&
      window.RUNTIME_CONFIG) ||
    (window.CONFIG && window.CONFIG.API_BASE_URL && window.CONFIG) ||
    (typeof CONFIG !== "undefined" ? CONFIG : null);
  const apiBaseUrl =
    (sharedConfig && sharedConfig.API_BASE_URL) || "http://localhost:5000";

  if (!form) {
    console.error("❌ Form #loginForm not found");
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("⚠️ Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("🟢 Login Response:", data);

      if (!response.ok) {
        alert("❌ " + (data.message || "Login failed"));
        return;
      }

      // ⭐ Save token
      localStorage.setItem("token", data.token);

      // ⭐ Save user info
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("firstName", data.user.firstName || "");
      localStorage.setItem("lastName", data.user.lastName || "");
      localStorage.setItem(
        "fullName",
        `${data.user.firstName} ${data.user.lastName}`,
      );
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("department", data.user.department);

      // ⭐ ADMIN REDIRECT
      if (data.user.role === "admin" || data.user.role === "headadmin") {
        window.location.href = "../AdminDashboard/analysis/analysis.html";
        return;
      }

      // ⭐ NORMAL USER REDIRECT
      window.location.href = "../Webpage/Homepage/Homepage.html";
    } catch (error) {
      console.error("🔥 Login error:", error);
      alert("⚠️ Unable to connect to the server.");
    }
  });
});

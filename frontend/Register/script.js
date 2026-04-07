document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const sharedConfig =
    (window.RUNTIME_CONFIG &&
      window.RUNTIME_CONFIG.API_BASE_URL &&
      window.RUNTIME_CONFIG) ||
    (window.CONFIG && window.CONFIG.API_BASE_URL && window.CONFIG) ||
    (typeof CONFIG !== "undefined" ? CONFIG : null);
  const apiBaseUrl =
    (sharedConfig && sharedConfig.API_BASE_URL) || "http://localhost:5000";

  if (!form) {
    console.error("❌ Error: Form with id 'registerForm' not found.");
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Collect fields
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const department = document.getElementById("department").value;

    // Required field validation
    if (!firstName || !lastName || !email || !password || !department) {
      alert("⚠️ Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          department,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Registration successful!");
        window.location.href = "../Login/index.html";
      } else {
        alert(`❌ Registration failed: ${data.message || "Unknown error"}`);
      }

      console.log("Response:", data);
    } catch (error) {
      console.error("🔥 Error during registration:", error);
      alert("⚠️ Unable to connect to the server.");
    }
  });
});

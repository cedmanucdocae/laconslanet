(() => {
  const host = window.location.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1";

  window.RUNTIME_CONFIG = window.RUNTIME_CONFIG || {};

  if (!window.RUNTIME_CONFIG.API_BASE_URL) {
    window.RUNTIME_CONFIG.API_BASE_URL = isLocal
      ? "http://localhost:5000"
      : "https://backend-laconslanet.safehub-lcup.uk";
  }
})();

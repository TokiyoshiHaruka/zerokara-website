window.initLoginPage = function initLoginPage() {
  const form = document.getElementById("login-form");
  const idInput = document.getElementById("login-id");
  const pwInput = document.getElementById("login-password");
  const loadingOverlay = document.getElementById("login-loading");
  const text = (path, fallback) => window.ZeroCore?.t?.(path) || fallback;
  const loginUrl = window.ZeroSiteConfig?.resolveBackend?.("/api/login") || "/api/login";
  const adminUrl = window.ZeroSiteConfig?.resolveAdmin?.("index.html") || "/admin/index.html";
  if (!form || !idInput || !pwInput || form.dataset.bound === "1") return;
  form.dataset.bound = "1";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = idInput.value.trim();
    const password = pwInput.value;
    if (!username || !password) {
      alert(text("login.missing", "Please enter both account and password."));
      return;
    }
    if (form.dataset.submitting === "1") return;
    form.dataset.submitting = "1";

    try {
      const res = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = res.status === 401
          ? text("login.failed", "Account or password is incorrect.")
          : (data.error || text("login.failed", "Login failed."));
        alert(message);
        return;
      }

      if (data.token) {
        localStorage.setItem("zero_token", data.token);
        if (data.user) localStorage.setItem("zero_user", JSON.stringify(data.user));
      }

      if (loadingOverlay) loadingOverlay.classList.add("show");
      setTimeout(() => {
        window.location.href = adminUrl;
      }, 800);
    } catch (error) {
      console.error("[ZERO-LOGIN]", error);
      alert(text("login.connectFailed", "Failed to connect to the server."));
    } finally {
      form.dataset.submitting = "0";
    }
  });
};

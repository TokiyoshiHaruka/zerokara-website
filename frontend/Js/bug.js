window.initBugPage = function initBugPage() {
  const form = document.getElementById("bug-form");
  const successMessage = document.getElementById("success-message");
  const submitBtn = document.getElementById("submit-btn");
  const statusText = submitBtn && submitBtn.querySelector(".submit-label");
  const text = (path, fallback) => window.ZeroCore?.t?.(path) || fallback;
  const submitUrl = window.ZeroSiteConfig?.resolveBackend?.("/api/bugs") || "/api/bugs";
  if (!form || !submitBtn || form.dataset.bound === "1") return;
  form.dataset.bound = "1";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = {
      project: String(formData.get("project") || "").trim(),
      severity: String(formData.get("severity") || "").trim(),
      title: String(formData.get("title") || "").trim(),
      steps: String(formData.get("steps") || "").trim(),
      reporter: String(formData.get("reporter") || "").trim(),
      source: "web"
    };

    if (!payload.project || !payload.severity || !payload.title || !payload.steps || !payload.reporter) {
      alert(text("bug.incomplete", "Please complete every required field."));
      return;
    }

    submitBtn.disabled = true;
    if (statusText) statusText.textContent = text("bug.submitWorking", "Submitting...");

    try {
      const response = await fetch(submitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) throw new Error(result.error || "submit_failed");
      form.style.display = "none";
      successMessage.style.display = "flex";
    } catch (error) {
      const message = error?.message || text("bug.submitFailed", "Failed to submit the report to the server.");
      alert(message);
    } finally {
      submitBtn.disabled = false;
      if (statusText) statusText.textContent = text("bug.submitAction", "Submit Report");
    }
  });

  window.resetForm = function resetForm() {
    form.reset();
    form.style.display = "grid";
    successMessage.style.display = "none";
  };
};

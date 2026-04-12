window.initSchedulePage = function initSchedulePage() {
  const prevBtn = document.querySelector(".calendar-nav-btn[data-direction='prev']");
  const nextBtn = document.querySelector(".calendar-nav-btn[data-direction='next']");
  const grid = document.querySelector(".calendar-grid");
  const timeline = document.getElementById("schedule-timeline");
  const monthLabel = document.getElementById("calendar-month-label");
  if (!prevBtn || !nextBtn || !grid || !timeline || !monthLabel || grid.dataset.bound === "1") return;
  grid.dataset.bound = "1";

  const state = { date: new Date(), items: [] };
  const text = (path, fallback) => window.ZeroCore?.t?.(path) || fallback;
  const locale = () => window.ZeroCore?.getLocaleTag?.() || "ja-JP";
  const scheduleBase = window.ZeroSiteConfig?.resolveBackend?.("/api/schedule-events") || "/api/schedule-events";

  prevBtn.addEventListener("click", () => {
    state.date.setMonth(state.date.getMonth() - 1);
    loadAndRender();
  });
  nextBtn.addEventListener("click", () => {
    state.date.setMonth(state.date.getMonth() + 1);
    loadAndRender();
  });

  function renderMonthLabel(year, month) {
    const date = new Date(year, month - 1, 1);
    monthLabel.textContent = new Intl.DateTimeFormat(locale(), { year: "numeric", month: "2-digit" }).format(date);
  }

  function renderCalendar(year, month, items) {
    grid.querySelectorAll(".calendar-day, .calendar-empty").forEach((el) => el.remove());
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const offset = (firstDay + 6) % 7;
    const daysWithEvents = new Set((items || []).map((item) => new Date(item.eventDate).getDate()).filter(Boolean));
    for (let i = 0; i < offset; i += 1) {
      const empty = document.createElement("div");
      empty.className = "calendar-empty";
      grid.appendChild(empty);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const cell = document.createElement("div");
      cell.className = "calendar-day";
      if (daysWithEvents.has(day)) cell.classList.add("has-event");
      cell.textContent = String(day);
      grid.appendChild(cell);
    }
  }

  function renderTimeline(items) {
    timeline.innerHTML = "";
    if (!items || !items.length) {
      timeline.innerHTML = `<li class="timeline-item"><div class="timeline-title">${text("schedule.empty", "No events are registered for this month yet.")}</div></li>`;
      return;
    }
    items
      .slice()
      .sort((a, b) => `${a.eventDate || ""} ${a.eventTime || ""}`.localeCompare(`${b.eventDate || ""} ${b.eventTime || ""}`))
      .forEach((item) => {
        const li = document.createElement("li");
        li.className = `timeline-item type-${item.category || "other"}`;
        li.innerHTML = `<div class="timeline-date">${item.eventDate || ""}</div><div class="timeline-title">${item.title || "Untitled"}</div><div class="timeline-meta">${item.eventTime ? String(item.eventTime).slice(0, 5) : ""}</div><div class="timeline-desc">${item.detail || ""}</div>`;
        timeline.appendChild(li);
      });
  }

  function draw() {
    const year = state.date.getFullYear();
    const month = state.date.getMonth() + 1;
    renderMonthLabel(year, month);
    renderCalendar(year, month, state.items);
    renderTimeline(state.items);
  }

  function loadAndRender() {
    const year = state.date.getFullYear();
    const month = state.date.getMonth() + 1;
    fetch(`${scheduleBase}?year=${year}&month=${month}`)
      .then((res) => res.json())
      .then((data) => {
        state.items = data.items || [];
        draw();
      })
      .catch((error) => {
        console.error("[ZERO schedule]", error);
        state.items = [];
        draw();
      });
  }

  window.addEventListener("zero:language-changed", () => {
    if (!document.body.contains(grid)) return;
    draw();
  });

  loadAndRender();
};

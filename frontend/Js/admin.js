window.initAdminPage = function initAdminPage() {
  const adminPage = document.body.dataset.adminPage;
  if (!adminPage || document.body.dataset.adminBound === "1") return;
  document.body.dataset.adminBound = "1";

  const LANG_KEY = "zerokara_lang";
  const SUPPORTED_LANGS = ["ja", "zh-TW", "en"];
  const NEXTCLOUD_URL = "https://nextcloud.zerokara.pro";
  const COPY = window.ZeroAdminCopy || {};
  const PAGE_ROUTES = [
    { key: "dashboard", file: "index.html", icon: "01" },
    { key: "bugs", file: "bugs.html", icon: "02" },
    { key: "schedules", file: "schedules.html", icon: "03" },
    { key: "activities", file: "activities.html", icon: "04" },
    { key: "users", file: "users.html", icon: "05" },
    { key: "cloud", file: "cloud.html", icon: "06" }
  ];
  const BUG_STATUSES = ["Pending", "Confirmed", "Fixing", "Fixed", "Deferred", "Duplicate"];
  const SEVERITIES = ["P0", "P1", "P2", "P3"];
  const SCHEDULE_CATEGORIES = ["meeting", "event", "other"];
  const ACTIVITY_STATUSES = ["draft", "published"];
  const USER_ROLES = ["admin", "member"];

  const backendUrl = (path) => window.ZeroSiteConfig?.resolveBackend?.(path) || path;
  const siteUrl = (path) => window.ZeroSiteConfig?.resolveSite?.(path) || path;
  const adminUrl = (file) => window.ZeroSiteConfig?.resolveAdmin?.(file) || `./${file}`;
  const BUGS_API = backendUrl("/api/admin/bugs");
  const BUG_OVERVIEW_API = backendUrl("/api/admin/bugs/stats/overview");
  const ACTIVITIES_API = backendUrl("/api/admin/activities");
  const SCHEDULES_API = backendUrl("/api/admin/schedule-events");
  const USERS_API = backendUrl("/api/admin/users");
  const STATS_SUMMARY_API = backendUrl("/api/admin/stats/summary");
  const STATS_VISITS_API = backendUrl("/api/admin/stats/visits");
  const STATS_LOGS_API = backendUrl("/api/admin/stats/logs");

  const root = document.getElementById("admin-page-root");
  const navRoot = document.getElementById("admin-nav-links");
  const noteRoot = document.getElementById("admin-sidebar-note");
  const modalRoot = document.getElementById("admin-modal-root");
  const toast = document.getElementById("toast");
  const state = { lang: normalizeLang(localStorage.getItem(LANG_KEY) || document.body.dataset.lang || "ja") };

  function normalizeLang(value) {
    return SUPPORTED_LANGS.includes(value) ? value : "ja";
  }

  function getCopy(lang) {
    return COPY[normalizeLang(lang)] || COPY.ja || {};
  }

  function t(path) {
    const segments = String(path).split(".");
    let current = getCopy(state.lang);
    for (const segment of segments) current = current == null ? undefined : current[segment];
    if (current != null) return current;
    current = getCopy("ja");
    for (const segment of segments) current = current == null ? undefined : current[segment];
    return current != null ? current : path;
  }

  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value == null ? "" : String(value);
    return div.innerHTML;
  }

  function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
    return new Intl.DateTimeFormat(state.lang === "zh-TW" ? "zh-Hant-TW" : state.lang === "en" ? "en-US" : "ja-JP", {
      year: "numeric", month: "2-digit", day: "2-digit"
    }).format(date);
  }

  function shortText(value, limit = 72) {
    const text = String(value || "").trim();
    if (!text) return "-";
    return text.length > limit ? `${text.slice(0, limit)}...` : text;
  }

  function loadingBlock() { return `<div class="loading">${escapeHtml(t("common.loading"))}</div>`; }
  function emptyBlock(text) { return `<div class="empty-state">${escapeHtml(text || t("common.noData"))}</div>`; }

  function showToast(message, type = "") {
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type}`.trim();
    toast.style.display = "block";
    clearTimeout(window.__zeroAdminToastTimer);
    window.__zeroAdminToastTimer = setTimeout(() => { toast.style.display = "none"; }, 2600);
  }

  function setLang(lang) {
    state.lang = normalizeLang(lang);
    localStorage.setItem(LANG_KEY, state.lang);
    renderChrome();
  }

  function getAuthHeaders() {
    const token = localStorage.getItem("zero_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function fetchJson(url, options = {}) {
    const response = await fetch(url, { ...options, headers: { ...getAuthHeaders(), ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        showToast(t("common.authExpired"), "error");
        setTimeout(() => { window.location.href = siteUrl("/login.html"); }, 900);
      }
      throw new Error(data.error || data.message || `request_failed:${response.status}`);
    }
    return data;
  }

  function initParticles() {
    if (!window.particlesJS || !document.getElementById("particles-js") || document.querySelector("#particles-js canvas")) return;
    window.particlesJS("particles-js", {
      particles: { number: { value: 42, density: { enable: true, value_area: 1100 } }, color: { value: ["#59d7ff", "#ff6fd8", "#64e8a5"] }, shape: { type: "circle" }, opacity: { value: 0.32, random: true }, size: { value: 2.2, random: true }, line_linked: { enable: true, distance: 150, color: "#59d7ff", opacity: 0.12, width: 1 }, move: { enable: true, speed: 1.1, out_mode: "out" } },
      interactivity: { detect_on: "canvas", events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "push" } }, modes: { grab: { distance: 150, line_linked: { opacity: 0.22 } }, push: { particles_nb: 3 } } },
      retina_detect: true
    });
  }

  function getAdminName() {
    try {
      const raw = localStorage.getItem("zero_user");
      const user = raw ? JSON.parse(raw) : null;
      return user?.display_name || user?.username || "Admin";
    } catch {
      return "Admin";
    }
  }

  function renderNav() {
    if (!navRoot) return;
    navRoot.innerHTML = PAGE_ROUTES.map((route) => `<li><a href="${adminUrl(route.file)}" class="nav-link${route.key === adminPage ? " active" : ""}" data-icon="${route.icon}">${escapeHtml(t(`nav.${route.key}`))}</a></li>`).join("") + `<li><a href="${siteUrl("/index.html")}" class="nav-link" data-icon="07">${escapeHtml(t("shell.back"))}</a></li>`;
    if (noteRoot) noteRoot.textContent = t("shell.note");
  }

  function renderHeader(pageKey) {
    return `<section class="admin-panel admin-header-panel"><div><div class="eyebrow">${escapeHtml(t(`pages.${pageKey}.eyebrow`))}</div><h1>${escapeHtml(t(`pages.${pageKey}.title`))}</h1><p>${escapeHtml(t(`pages.${pageKey}.lead`))}</p></div><div class="admin-header-actions"><label class="admin-lang-wrap"><span>${escapeHtml(t("shell.language"))}</span><select id="admin-lang-select" class="admin-lang-select"><option value="ja"${state.lang === "ja" ? " selected" : ""}>日本語</option><option value="zh-TW"${state.lang === "zh-TW" ? " selected" : ""}>繁體中文</option><option value="en"${state.lang === "en" ? " selected" : ""}>English</option></select></label><div class="admin-user-chip"><span class="admin-user-chip__name">${escapeHtml(getAdminName())}</span><button class="btn btn-secondary" type="button" id="admin-logout-btn">${escapeHtml(t("shell.logout"))}</button></div></div></section>`;
  }

  function setPage(pageKey, html, modalHtml = "") {
    document.documentElement.lang = state.lang === "zh-TW" ? "zh-Hant" : state.lang;
    document.body.dataset.lang = state.lang;
    document.title = `${t(`pages.${pageKey}.title`)} - ZERO`;
    if (root) root.innerHTML = renderHeader(pageKey) + html;
    if (modalRoot) modalRoot.innerHTML = modalHtml;
    document.getElementById("admin-lang-select")?.addEventListener("change", (event) => setLang(event.target.value));
    document.getElementById("admin-logout-btn")?.addEventListener("click", () => { localStorage.removeItem("zero_token"); localStorage.removeItem("zero_user"); window.location.href = siteUrl("/login.html"); });
    modalRoot?.querySelectorAll("[data-modal-close]")?.forEach((button) => button.addEventListener("click", closeModal));
    modalRoot?.querySelectorAll(".modal")?.forEach((modal) => modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); }));
  }

  function closeModal() { modalRoot?.querySelectorAll(".modal").forEach((modal) => modal.classList.remove("active")); }
  function openModal(id) { document.getElementById(id)?.classList.add("active"); }
  function pad2(value) { return String(value).padStart(2, "0"); }
  function setSelectOptions(select, options, selectedValue, { placeholder = "" } = {}) {
    if (!select) return;
    const current = selectedValue == null ? "" : String(selectedValue);
    let html = placeholder ? `<option value="">${escapeHtml(placeholder)}</option>` : "";
    html += options.map((option) => {
      const value = typeof option === "object" ? option.value : option;
      const label = typeof option === "object" ? option.label : option;
      return `<option value="${escapeHtml(String(value))}"${String(value) === current ? " selected" : ""}>${escapeHtml(String(label))}</option>`;
    }).join("");
    select.innerHTML = html;
  }
  function numericOptions(values, { pad = false, suffix = "" } = {}) {
    return values.map((value) => ({ value, label: `${pad ? pad2(value) : value}${suffix}` }));
  }
  function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function normalizeBug(item) {
    return { id: item.id, bug_id: item.bug_id || item.id, project: item.project || "other", severity: item.severity || "P3", title: item.title || "Untitled", reporter: item.reporter || "-", status: item.status || "Pending", handler: item.handler || "", solution: item.solution || "", updated_at: item.updated_at || item.created_at || "", created_at: item.created_at || "" };
  }

  async function getBugs(filters = {}) { const params = new URLSearchParams(); Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); }); const result = await fetchJson(`${BUGS_API}${params.toString() ? `?${params.toString()}` : ""}`); return (result.data || []).map(normalizeBug); }
  async function getBugOverview() { const result = await fetchJson(BUG_OVERVIEW_API); return result.data || { total: 0, bySeverity: [], byStatus: [] }; }
  async function getSchedules() { const result = await fetchJson(SCHEDULES_API); return Array.isArray(result.items) ? result.items : []; }
  async function getActivities() { const result = await fetchJson(ACTIVITIES_API); return Array.isArray(result.items) ? result.items : []; }
  async function getUsers() { const result = await fetchJson(USERS_API); return Array.isArray(result.items) ? result.items : []; }
  async function getSummary() { return fetchJson(STATS_SUMMARY_API); }
  async function getVisits() { return fetchJson(STATS_VISITS_API); }
  async function getLogs() { const result = await fetchJson(STATS_LOGS_API); return Array.isArray(result.items) ? result.items : []; }

  const bugStatusLabel = (value) => t(`bugs.status.${value}`);
  const scheduleCategoryLabel = (value) => t(`schedules.categories.${value}`);
  const activityStatusLabel = (value) => t(`activities.status.${value}`);
  const userRoleLabel = (value) => t(`users.roles.${value}`);
  const activityTitle = (item) => state.lang === "zh-TW" ? (item.titleZh || item.titleJa || item.titleEn || item.slug || "-") : state.lang === "en" ? (item.titleEn || item.titleJa || item.titleZh || item.slug || "-") : (item.titleJa || item.titleZh || item.titleEn || item.slug || "-");
  const renderListCards = (items, renderer, emptyText) => items.length ? `<div class="admin-list">${items.map(renderer).join("")}</div>` : emptyBlock(emptyText);
  async function renderDashboardPage() {
    setPage("dashboard", `<section class="admin-panel"><div class="panel-heading"><div><h2>${escapeHtml(t("dashboard.summaryTitle"))}</h2></div></div><div id="dashboard-cards" class="dashboard-card-grid">${loadingBlock()}</div></section><section class="admin-panel"><div class="panel-heading"><div><h2>${escapeHtml(t("dashboard.quickTitle"))}</h2></div></div><div class="dashboard-shortcut-grid">${PAGE_ROUTES.filter((route) => route.key !== "dashboard").map((route) => `<a class="dashboard-shortcut" href="${adminUrl(route.file)}"><div class="dashboard-shortcut__icon">${escapeHtml(route.icon)}</div><div><strong>${escapeHtml(t(`nav.${route.key}`))}</strong><p>${escapeHtml(t(`pages.${route.key}.lead`))}</p></div></a>`).join("")}</div></section><section class="admin-grid admin-grid--two"><section class="admin-panel"><div class="panel-heading"><div><h2>${escapeHtml(t("dashboard.recentBugs"))}</h2></div></div><div id="dashboard-bugs">${loadingBlock()}</div></section><section class="admin-panel"><div class="panel-heading"><div><h2>${escapeHtml(t("dashboard.recentSchedules"))}</h2></div></div><div id="dashboard-schedules">${loadingBlock()}</div></section></section><section class="admin-grid admin-grid--two"><section class="admin-panel"><div class="panel-heading"><div><h2>${escapeHtml(t("dashboard.recentLogs"))}</h2></div></div><div id="dashboard-logs">${loadingBlock()}</div></section><section class="admin-panel"><div class="panel-heading"><div><h2>${escapeHtml(t("dashboard.topPaths"))}</h2></div></div><div id="dashboard-paths">${loadingBlock()}</div></section></section>`);
    try {
      const [summary, visits, logs, bugs, schedules] = await Promise.all([getSummary(), getVisits().catch(() => ({ today: 0, uniqueToday: 0, paths: [] })), getLogs().catch(() => []), getBugs().catch(() => []), getSchedules().catch(() => [])]);
      const cards = [
        { icon: "BG", label: t("dashboard.cardLabels.bugs"), value: summary.bugs?.total ?? bugs.length, sub: `${summary.bugs?.pending ?? bugs.filter((item) => item.status === "Pending").length} ${t("bugs.stats.pending")}` },
        { icon: "PD", label: t("dashboard.cardLabels.pending"), value: summary.bugs?.pending ?? bugs.filter((item) => item.status === "Pending").length, sub: `${summary.bugs?.fixing ?? bugs.filter((item) => item.status === "Fixing").length} ${t("bugs.stats.fixing")}` },
        { icon: "AC", label: t("dashboard.cardLabels.activities"), value: summary.activities?.published ?? 0, sub: `${summary.activities?.total ?? 0} ${t("activities.summary.total")}` },
        { icon: "SC", label: t("dashboard.cardLabels.schedules"), value: summary.schedules?.upcoming ?? 0, sub: `${summary.schedules?.total ?? 0} ${t("schedules.summary.total")}` },
        { icon: "US", label: t("dashboard.cardLabels.users"), value: summary.users?.total ?? 0, sub: `${summary.users?.byRole?.admin ?? 0} ${t("users.roles.admin")}` },
        { icon: "VT", label: t("dashboard.cardLabels.visits"), value: visits.today ?? 0, sub: String(visits.uniqueToday ?? 0) }
      ];
      document.getElementById("dashboard-cards").innerHTML = cards.map((card) => `<article class="dashboard-card"><div class="dashboard-card__icon">${escapeHtml(card.icon)}</div><div class="dashboard-card__label">${escapeHtml(card.label)}</div><div class="dashboard-card__value">${escapeHtml(card.value)}</div><div class="dashboard-card__sub">${escapeHtml(card.sub)}</div></article>`).join("");
      document.getElementById("dashboard-bugs").innerHTML = renderListCards(bugs.slice(0, 6), (bug) => `<article class="admin-list__item"><div><strong>${escapeHtml(bug.bug_id)}</strong><p>${escapeHtml(bug.title)}</p></div><span class="badge badge-${escapeHtml(bug.severity)}">${escapeHtml(bug.severity)}</span></article>`, t("common.noData"));
      const upcoming = schedules.slice().sort((a, b) => `${a.eventDate || ""} ${a.eventTime || ""}`.localeCompare(`${b.eventDate || ""} ${b.eventTime || ""}`)).filter((item) => item.eventDate).slice(0, 6);
      document.getElementById("dashboard-schedules").innerHTML = renderListCards(upcoming, (item) => `<article class="admin-list__item"><div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.detail || scheduleCategoryLabel(item.category))}</p></div><span>${escapeHtml(formatDate(item.eventDate))}</span></article>`, t("common.noData"));
      document.getElementById("dashboard-logs").innerHTML = renderListCards(logs.slice(0, 6), (log) => `<article class="admin-list__item"><div><strong>${escapeHtml(log.type || "SYSTEM")}</strong><p>${escapeHtml(log.message || "")}</p></div><span>${escapeHtml(formatDate(log.createdAt))}</span></article>`, t("common.noData"));
      document.getElementById("dashboard-paths").innerHTML = renderListCards((visits.paths || []).slice(0, 6), (item) => `<article class="admin-list__item"><div><strong>${escapeHtml(item.path || "/")}</strong><p>${escapeHtml(t("dashboard.cardLabels.visits"))}: ${escapeHtml(String(item.count || 0))}</p></div><span>${escapeHtml(String(item.count || 0))}</span></article>`, t("common.noData"));
    } catch (error) {
      document.getElementById("dashboard-cards").innerHTML = emptyBlock(error.message);
      document.getElementById("dashboard-bugs").innerHTML = emptyBlock();
      document.getElementById("dashboard-schedules").innerHTML = emptyBlock();
      document.getElementById("dashboard-logs").innerHTML = emptyBlock();
      document.getElementById("dashboard-paths").innerHTML = emptyBlock();
    }
  }

  async function renderBugsPage() {
    setPage("bugs", `<section class="admin-panel"><div class="stats-grid"><article class="stat-card"><div class="number" id="stat-total">0</div><div class="label">${escapeHtml(t("bugs.stats.total"))}</div></article><article class="stat-card"><div class="number" id="stat-pending">0</div><div class="label">${escapeHtml(t("bugs.stats.pending"))}</div></article><article class="stat-card"><div class="number" id="stat-fixing">0</div><div class="label">${escapeHtml(t("bugs.stats.fixing"))}</div></article><article class="stat-card"><div class="number" id="stat-fixed">0</div><div class="label">${escapeHtml(t("bugs.stats.fixed"))}</div></article><article class="stat-card"><div class="number" id="stat-p0">0</div><div class="label">${escapeHtml(t("bugs.stats.p0"))}</div></article></div><div class="filters-bar"><select id="filter-project"></select><select id="filter-severity"></select><select id="filter-status"></select><button class="btn btn-secondary" type="button" id="bugs-refresh-btn">${escapeHtml(t("common.refresh"))}</button></div><div class="table-wrap" id="bugs-table-wrap">${loadingBlock()}</div></section>`, `<div class="modal" id="bug-modal"><div class="modal-content"><div class="modal-header"><h2>${escapeHtml(t("bugs.modalTitle"))}</h2><button class="modal-close" type="button" data-modal-close>x</button></div><form id="bug-form-admin"><input type="hidden" id="bug-edit-id" /><div class="form-row"><div class="form-group"><label>${escapeHtml(t("bugs.fields.project"))}</label><input id="bug-project" type="text" readonly /></div><div class="form-group"><label>${escapeHtml(t("bugs.fields.bugId"))}</label><input id="bug-bug-id" type="text" readonly /></div></div><div class="form-group"><label>${escapeHtml(t("bugs.fields.title"))}</label><input id="bug-title" type="text" readonly /></div><div class="form-row"><div class="form-group"><label>${escapeHtml(t("bugs.fields.severity"))}</label><select id="bug-severity">${SEVERITIES.map((value) => `<option value="${value}">${value}</option>`).join("")}</select></div><div class="form-group"><label>${escapeHtml(t("bugs.fields.status"))}</label><select id="bug-status">${BUG_STATUSES.map((value) => `<option value="${value}">${escapeHtml(bugStatusLabel(value))}</option>`).join("")}</select></div></div><div class="form-row"><div class="form-group"><label>${escapeHtml(t("bugs.fields.reporter"))}</label><input id="bug-reporter" type="text" readonly /></div><div class="form-group"><label>${escapeHtml(t("bugs.fields.handler"))}</label><input id="bug-handler" type="text" /></div></div><div class="form-group"><label>${escapeHtml(t("bugs.fields.solution"))}</label><textarea id="bug-solution"></textarea></div><div class="form-actions"><button type="button" class="btn btn-secondary" data-modal-close>${escapeHtml(t("common.cancel"))}</button><button type="submit" class="btn btn-primary">${escapeHtml(t("common.save"))}</button></div></form></div></div>`);
    const projectSelect = document.getElementById("filter-project");
    const severitySelect = document.getElementById("filter-severity");
    const statusSelect = document.getElementById("filter-status");
    projectSelect.innerHTML = `<option value="">${escapeHtml(t("bugs.filters.allProjects"))}</option><option value="zerokara-site">ZERO Website</option><option value="song-of-self">Song of Self</option><option value="other">Other</option>`;
    severitySelect.innerHTML = `<option value="">${escapeHtml(t("bugs.filters.allSeverity"))}</option>${SEVERITIES.map((value) => `<option value="${value}">${value}</option>`).join("")}`;
    statusSelect.innerHTML = `<option value="">${escapeHtml(t("bugs.filters.allStatus"))}</option>${BUG_STATUSES.map((value) => `<option value="${value}">${escapeHtml(bugStatusLabel(value))}</option>`).join("")}`;
    async function loadBugs() {
      const tableWrap = document.getElementById("bugs-table-wrap");
      tableWrap.innerHTML = loadingBlock();
      try {
        const overview = await getBugOverview().catch(() => null);
        const bugs = await getBugs({ project: projectSelect.value, severity: severitySelect.value, status: statusSelect.value });
        document.getElementById("stat-total").textContent = String(overview?.total ?? bugs.length);
        document.getElementById("stat-pending").textContent = String(overview?.byStatus?.find((item) => item.status === "Pending")?.count ?? bugs.filter((item) => item.status === "Pending").length);
        document.getElementById("stat-fixing").textContent = String(overview?.byStatus?.find((item) => item.status === "Fixing")?.count ?? bugs.filter((item) => item.status === "Fixing").length);
        document.getElementById("stat-fixed").textContent = String(overview?.byStatus?.find((item) => item.status === "Fixed")?.count ?? bugs.filter((item) => item.status === "Fixed").length);
        document.getElementById("stat-p0").textContent = String(overview?.bySeverity?.find((item) => item.severity === "P0")?.count ?? bugs.filter((item) => item.severity === "P0").length);
        if (!bugs.length) { tableWrap.innerHTML = emptyBlock(); return; }
        tableWrap.innerHTML = `<table class="data-table"><thead><tr><th>${escapeHtml(t("bugs.table.id"))}</th><th>${escapeHtml(t("bugs.table.title"))}</th><th>${escapeHtml(t("bugs.table.project"))}</th><th>${escapeHtml(t("bugs.table.severity"))}</th><th>${escapeHtml(t("bugs.table.status"))}</th><th>${escapeHtml(t("bugs.table.reporter"))}</th><th>${escapeHtml(t("bugs.table.handler"))}</th><th>${escapeHtml(t("bugs.table.progress"))}</th><th>${escapeHtml(t("bugs.table.updated"))}</th><th>${escapeHtml(t("bugs.table.source"))}</th><th>${escapeHtml(t("bugs.table.actions"))}</th></tr></thead><tbody>${bugs.map((bug) => `<tr><td><strong>${escapeHtml(bug.bug_id)}</strong></td><td>${escapeHtml(bug.title)}</td><td>${escapeHtml(bug.project)}</td><td><span class="badge badge-${escapeHtml(bug.severity)}">${escapeHtml(bug.severity)}</span></td><td><span class="badge badge-status">${escapeHtml(bugStatusLabel(bug.status))}</span></td><td>${escapeHtml(bug.reporter)}</td><td>${escapeHtml(bug.handler || "-")}</td><td>${escapeHtml(shortText(bug.solution))}</td><td>${escapeHtml(formatDate(bug.updated_at))}</td><td>${escapeHtml(t("bugs.sourceServer"))}</td><td class="action-btns"><button class="btn-icon btn-edit" type="button" data-action="edit" data-id="${Number(bug.id)}">${escapeHtml(t("common.edit"))}</button><button class="btn-icon btn-delete" type="button" data-action="delete" data-id="${Number(bug.id)}">${escapeHtml(t("common.delete"))}</button></td></tr>`).join("")}</tbody></table>`;
      } catch (error) { tableWrap.innerHTML = emptyBlock(error.message); }
    }
    async function openBugEditor(id) {
      const bug = await fetchJson(`${BUGS_API}/${id}`).then((result) => normalizeBug(result.data || {}));
      document.getElementById("bug-edit-id").value = bug.id; document.getElementById("bug-project").value = bug.project; document.getElementById("bug-bug-id").value = bug.bug_id; document.getElementById("bug-title").value = bug.title; document.getElementById("bug-severity").value = bug.severity; document.getElementById("bug-status").value = bug.status; document.getElementById("bug-reporter").value = bug.reporter; document.getElementById("bug-handler").value = bug.handler || ""; document.getElementById("bug-solution").value = bug.solution || ""; openModal("bug-modal");
    }
    async function deleteBug(id) {
      if (!window.confirm(t("common.confirmDelete"))) return;
      try {
        await fetchJson(`${BUGS_API}/${id}`, { method: "DELETE" });
        showToast(t("common.deleteSuccess"), "success");
        await loadBugs();
      } catch (error) { showToast(error.message || t("common.deleteFailed"), "error"); }
    }
    document.getElementById("bugs-refresh-btn").addEventListener("click", loadBugs); projectSelect.addEventListener("change", loadBugs); severitySelect.addEventListener("change", loadBugs); statusSelect.addEventListener("change", loadBugs);
    document.getElementById("bugs-table-wrap").addEventListener("click", async (event) => { const button = event.target.closest("[data-action]"); if (!button) return; const id = Number(button.dataset.id); if (!id) return; if (button.dataset.action === "edit") await openBugEditor(id); if (button.dataset.action === "delete") await deleteBug(id); });
    document.getElementById("bug-form-admin").addEventListener("submit", async (event) => { event.preventDefault(); try { const bugId = Number(document.getElementById("bug-edit-id").value); const payload = { severity: document.getElementById("bug-severity").value, status: document.getElementById("bug-status").value, handler: document.getElementById("bug-handler").value, solution: document.getElementById("bug-solution").value }; await fetchJson(`${BUGS_API}/${bugId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); closeModal(); showToast(t("common.saveSuccess"), "success"); loadBugs(); } catch (error) { showToast(error.message || t("common.saveFailed"), "error"); } });
    loadBugs();
  }
  async function renderSchedulesPage() {
    setPage("schedules", `<section class="admin-panel"><div class="stats-grid"><article class="stat-card"><div class="number" id="schedule-total">0</div><div class="label">${escapeHtml(t("schedules.summary.total"))}</div></article><article class="stat-card"><div class="number" id="schedule-upcoming">0</div><div class="label">${escapeHtml(t("schedules.summary.upcoming"))}</div></article></div><div class="panel-heading"><div></div><button class="btn btn-primary" type="button" id="schedule-create-btn">${escapeHtml(t("schedules.newButton"))}</button></div><div class="table-wrap" id="schedules-table-wrap">${loadingBlock()}</div></section>`, `<div class="modal" id="schedule-modal"><div class="modal-content"><div class="modal-header"><h2 id="schedule-modal-title">${escapeHtml(t("schedules.modalCreate"))}</h2><button class="modal-close" type="button" data-modal-close>x</button></div><form id="schedule-form-admin"><input type="hidden" id="schedule-id" /><div class="form-row"><div class="form-group"><label>${escapeHtml(t("schedules.fields.date"))}</label><div class="picker-combo"><input id="schedule-date" type="hidden" required /><div class="picker-combo__segments picker-combo__segments--date"><select id="schedule-year" aria-label="${escapeHtml(t("schedules.fields.date"))} year"></select><select id="schedule-month" aria-label="${escapeHtml(t("schedules.fields.date"))} month"></select><select id="schedule-day" aria-label="${escapeHtml(t("schedules.fields.date"))} day"></select></div></div></div><div class="form-group"><label>${escapeHtml(t("schedules.fields.time"))}</label><div class="picker-combo"><input id="schedule-time" type="hidden" /><div class="picker-combo__segments picker-combo__segments--time"><select id="schedule-hour" aria-label="${escapeHtml(t("schedules.fields.time"))} hour"></select><select id="schedule-minute" aria-label="${escapeHtml(t("schedules.fields.time"))} minute"></select></div></div></div></div><div class="form-group"><label>${escapeHtml(t("schedules.fields.title"))}</label><input id="schedule-title" type="text" required /></div><div class="form-group"><label>${escapeHtml(t("schedules.fields.category"))}</label><select id="schedule-category">${SCHEDULE_CATEGORIES.map((value) => `<option value="${value}">${escapeHtml(scheduleCategoryLabel(value))}</option>`).join("")}</select></div><div class="form-group"><label>${escapeHtml(t("schedules.fields.detail"))}</label><textarea id="schedule-detail"></textarea></div><div class="form-actions"><button type="button" class="btn btn-secondary" data-modal-close>${escapeHtml(t("common.cancel"))}</button><button type="submit" class="btn btn-primary">${escapeHtml(t("common.save"))}</button></div></form></div></div>`);
    const dateInput = document.getElementById("schedule-date");
    const timeInput = document.getElementById("schedule-time");
    const yearSelect = document.getElementById("schedule-year");
    const monthSelect = document.getElementById("schedule-month");
    const daySelect = document.getElementById("schedule-day");
    const hourSelect = document.getElementById("schedule-hour");
    const minuteSelect = document.getElementById("schedule-minute");
    const currentYear = new Date().getFullYear();
    const pickerLabels = state.lang === "en"
      ? { year: "Year", month: "Month", day: "Day", hour: "Hour", minute: "Minute" }
      : state.lang === "zh-TW"
        ? { year: "年份", month: "月份", day: "日期", hour: "時", minute: "分" }
        : { year: "年", month: "月", day: "日", hour: "時", minute: "分" };
    function applyYearOptions(selectedYear) {
      const safeYear = Number(selectedYear || currentYear);
      const startYear = Math.min(currentYear - 5, safeYear - 2);
      const endYear = Math.max(currentYear + 9, safeYear + 2);
      setSelectOptions(
        yearSelect,
        numericOptions(Array.from({ length: endYear - startYear + 1 }, (_, index) => startYear + index)),
        safeYear,
        { placeholder: pickerLabels.year }
      );
    }
    applyYearOptions(currentYear);
    setSelectOptions(monthSelect, numericOptions(Array.from({ length: 12 }, (_, index) => index + 1), { pad: true }), new Date().getMonth() + 1, { placeholder: pickerLabels.month });
    setSelectOptions(hourSelect, numericOptions(Array.from({ length: 24 }, (_, index) => index), { pad: true }), "", { placeholder: pickerLabels.hour });
    setSelectOptions(minuteSelect, numericOptions(Array.from({ length: 60 }, (_, index) => index), { pad: true }), "", { placeholder: pickerLabels.minute });
    function syncDayOptions(selectedDay) {
      const year = Number(yearSelect.value || currentYear);
      const month = Number(monthSelect.value || 1);
      const lastDay = daysInMonth(year, month);
      const nextDay = Math.min(Number(selectedDay || 1), lastDay);
      setSelectOptions(daySelect, numericOptions(Array.from({ length: lastDay }, (_, index) => index + 1), { pad: true }), nextDay, { placeholder: pickerLabels.day });
    }
    function syncDateSegmentsFromInput() {
      const fallback = new Date().toISOString().slice(0, 10);
      const [year, month, day] = String(dateInput.value || fallback).split("-").map(Number);
      applyYearOptions(year);
      yearSelect.value = String(year);
      monthSelect.value = String(month);
      syncDayOptions(day);
      daySelect.value = String(Math.min(day, daysInMonth(year, month)));
    }
    function syncDateInputFromSegments() {
      const year = Number(yearSelect.value);
      const month = Number(monthSelect.value);
      syncDayOptions(daySelect.value);
      const day = Number(daySelect.value);
      if (year && month && day) dateInput.value = `${year}-${pad2(month)}-${pad2(day)}`;
    }
    function syncTimeSegmentsFromInput() {
      if (!timeInput.value) {
        hourSelect.value = "";
        minuteSelect.value = "";
        return;
      }
      const [hour, minute] = timeInput.value.split(":").map(Number);
      hourSelect.value = String(hour);
      minuteSelect.value = String(minute);
    }
    function syncTimeInputFromSegments() {
      if (hourSelect.value === "" || minuteSelect.value === "") {
        timeInput.value = "";
        return;
      }
      timeInput.value = `${pad2(hourSelect.value)}:${pad2(minuteSelect.value)}`;
    }
    [yearSelect, monthSelect, daySelect].forEach((select) => select.addEventListener("change", syncDateInputFromSegments));
    [hourSelect, minuteSelect].forEach((select) => select.addEventListener("change", syncTimeInputFromSegments));
    syncDateSegmentsFromInput();
    syncTimeSegmentsFromInput();
    let currentSchedules = [];
    function openScheduleEditor(item) { document.getElementById("schedule-modal-title").textContent = item ? t("schedules.modalEdit") : t("schedules.modalCreate"); document.getElementById("schedule-id").value = item?.id || ""; dateInput.value = item?.eventDate || new Date().toISOString().slice(0, 10); timeInput.value = item?.eventTime ? String(item.eventTime).slice(0, 5) : ""; syncDateSegmentsFromInput(); syncTimeSegmentsFromInput(); document.getElementById("schedule-title").value = item?.title || ""; document.getElementById("schedule-category").value = item?.category || "other"; document.getElementById("schedule-detail").value = item?.detail || ""; openModal("schedule-modal"); }
    async function loadSchedules() {
      const wrap = document.getElementById("schedules-table-wrap"); wrap.innerHTML = loadingBlock();
      try {
        currentSchedules = await getSchedules();
        const today = new Date().toISOString().slice(0, 10);
        document.getElementById("schedule-total").textContent = String(currentSchedules.length);
        document.getElementById("schedule-upcoming").textContent = String(currentSchedules.filter((item) => item.eventDate >= today).length);
        if (!currentSchedules.length) { wrap.innerHTML = emptyBlock(); return; }
        wrap.innerHTML = `<table class="data-table"><thead><tr><th>${escapeHtml(t("schedules.table.date"))}</th><th>${escapeHtml(t("schedules.table.time"))}</th><th>${escapeHtml(t("schedules.table.title"))}</th><th>${escapeHtml(t("schedules.table.category"))}</th><th>${escapeHtml(t("schedules.table.detail"))}</th><th>${escapeHtml(t("schedules.table.updated"))}</th><th>${escapeHtml(t("schedules.table.actions"))}</th></tr></thead><tbody>${currentSchedules.map((item) => `<tr><td>${escapeHtml(formatDate(item.eventDate))}</td><td>${escapeHtml(item.eventTime ? String(item.eventTime).slice(0, 5) : "-")}</td><td>${escapeHtml(item.title)}</td><td><span class="badge badge-status">${escapeHtml(scheduleCategoryLabel(item.category))}</span></td><td>${escapeHtml(shortText(item.detail))}</td><td>${escapeHtml(formatDate(item.updatedAt || item.createdAt))}</td><td class="action-btns"><button class="btn-icon btn-edit" type="button" data-action="edit" data-id="${Number(item.id)}">${escapeHtml(t("common.edit"))}</button><button class="btn-icon btn-delete" type="button" data-action="delete" data-id="${Number(item.id)}">${escapeHtml(t("common.delete"))}</button></td></tr>`).join("")}</tbody></table>`;
      } catch (error) { wrap.innerHTML = emptyBlock(error.message); }
    }
    document.getElementById("schedule-create-btn").addEventListener("click", () => openScheduleEditor(null));
    document.getElementById("schedules-table-wrap").addEventListener("click", async (event) => { const button = event.target.closest("[data-action]"); if (!button) return; const id = Number(button.dataset.id); const item = currentSchedules.find((entry) => Number(entry.id) === id); if (button.dataset.action === "edit") openScheduleEditor(item); if (button.dataset.action === "delete") { if (!window.confirm(t("common.confirmDelete"))) return; try { await fetchJson(`${SCHEDULES_API}/${id}`, { method: "DELETE" }); showToast(t("common.deleteSuccess"), "success"); loadSchedules(); } catch (error) { showToast(error.message || t("common.deleteFailed"), "error"); } } });
    document.getElementById("schedule-form-admin").addEventListener("submit", async (event) => { event.preventDefault(); const id = document.getElementById("schedule-id").value; const payload = { eventDate: document.getElementById("schedule-date").value, eventTime: document.getElementById("schedule-time").value, title: document.getElementById("schedule-title").value, detail: document.getElementById("schedule-detail").value, category: document.getElementById("schedule-category").value }; try { await fetchJson(id ? `${SCHEDULES_API}/${id}` : SCHEDULES_API, { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); closeModal(); showToast(t("common.saveSuccess"), "success"); loadSchedules(); } catch (error) { showToast(error.message || t("common.saveFailed"), "error"); } });
    loadSchedules();
  }

  async function renderActivitiesPage() {
    setPage("activities", `<section class="admin-panel"><div class="stats-grid"><article class="stat-card"><div class="number" id="activity-total">0</div><div class="label">${escapeHtml(t("activities.summary.total"))}</div></article><article class="stat-card"><div class="number" id="activity-published">0</div><div class="label">${escapeHtml(t("activities.summary.published"))}</div></article></div><div class="panel-heading"><div></div><button class="btn btn-primary" type="button" id="activity-create-btn">${escapeHtml(t("activities.newButton"))}</button></div><div class="table-wrap" id="activities-table-wrap">${loadingBlock()}</div></section>`, `<div class="modal" id="activity-modal"><div class="modal-content modal-content--wide modal-content--scroll"><div class="modal-header"><h2 id="activity-modal-title">${escapeHtml(t("activities.modalCreate"))}</h2><button class="modal-close" type="button" data-modal-close>x</button></div><form id="activity-form-admin"><input type="hidden" id="activity-id" /><div class="form-row form-row--three"><div class="form-group"><label>${escapeHtml(t("activities.fields.slug"))}</label><input id="activity-slug" type="text" required /></div><div class="form-group"><label>${escapeHtml(t("activities.fields.status"))}</label><select id="activity-status">${ACTIVITY_STATUSES.map((value) => `<option value="${value}">${escapeHtml(activityStatusLabel(value))}</option>`).join("")}</select></div><div class="form-group"><label>${escapeHtml(t("activities.fields.sortOrder"))}</label><input id="activity-sort" type="number" value="0" /></div></div><div class="form-group"><label>${escapeHtml(t("activities.fields.coverImage"))}</label><input id="activity-cover" type="text" /></div><div class="locale-grid">${["ja", "zh", "en"].map((locale) => `<section class="locale-card"><div class="section-kicker">${escapeHtml(t(`activities.locale.${locale}`))}</div><div class="form-group"><label>${escapeHtml(t("activities.fields.title"))}</label><input id="activity-title-${locale}" type="text" ${locale === "ja" ? "required" : ""} /></div><div class="form-group"><label>${escapeHtml(t("activities.fields.summary"))}</label><textarea id="activity-summary-${locale}" rows="4"></textarea></div><div class="form-group"><label>${escapeHtml(t("activities.fields.body"))}</label><textarea class="activity-body-input" data-preview="activity-preview-${locale}" id="activity-body-${locale}" rows="8"></textarea></div><div class="preview-box"><div class="preview-box__title">${escapeHtml(t("activities.preview"))}</div><div class="preview-box__body markdown-body" id="activity-preview-${locale}"></div></div></section>`).join("")}</div><div class="form-actions"><button type="button" class="btn btn-secondary" data-modal-close>${escapeHtml(t("common.cancel"))}</button><button type="submit" class="btn btn-primary">${escapeHtml(t("common.save"))}</button></div></form></div></div>`);
    let currentActivities = [];
    function bindActivityPreview() { document.querySelectorAll(".activity-body-input").forEach((textarea) => { const update = () => { const target = document.getElementById(textarea.dataset.preview); if (!target) return; const value = textarea.value.trim(); target.innerHTML = value ? (window.marked ? window.marked.parse(value) : `<pre>${escapeHtml(value)}</pre>`) : `<p>${escapeHtml(t("common.noData"))}</p>`; }; textarea.addEventListener("input", update); update(); }); }
    function openActivityEditor(item) { document.getElementById("activity-modal-title").textContent = item ? t("activities.modalEdit") : t("activities.modalCreate"); document.getElementById("activity-id").value = item?.id || ""; document.getElementById("activity-slug").value = item?.slug || ""; document.getElementById("activity-status").value = item?.status || "draft"; document.getElementById("activity-sort").value = item?.sortOrder || 0; document.getElementById("activity-cover").value = item?.coverImage || ""; document.getElementById("activity-title-ja").value = item?.titleJa || ""; document.getElementById("activity-title-zh").value = item?.titleZh || ""; document.getElementById("activity-title-en").value = item?.titleEn || ""; document.getElementById("activity-summary-ja").value = item?.summaryJa || ""; document.getElementById("activity-summary-zh").value = item?.summaryZh || ""; document.getElementById("activity-summary-en").value = item?.summaryEn || ""; document.getElementById("activity-body-ja").value = item?.bodyMdJa || ""; document.getElementById("activity-body-zh").value = item?.bodyMdZh || ""; document.getElementById("activity-body-en").value = item?.bodyMdEn || ""; bindActivityPreview(); openModal("activity-modal"); }
    async function loadActivities() { const wrap = document.getElementById("activities-table-wrap"); wrap.innerHTML = loadingBlock(); try { currentActivities = await getActivities(); document.getElementById("activity-total").textContent = String(currentActivities.length); document.getElementById("activity-published").textContent = String(currentActivities.filter((item) => item.status === "published").length); if (!currentActivities.length) { wrap.innerHTML = emptyBlock(); return; } wrap.innerHTML = `<table class="data-table"><thead><tr><th>${escapeHtml(t("activities.table.slug"))}</th><th>${escapeHtml(t("activities.table.title"))}</th><th>${escapeHtml(t("activities.table.status"))}</th><th>${escapeHtml(t("activities.table.sortOrder"))}</th><th>${escapeHtml(t("activities.table.updated"))}</th><th>${escapeHtml(t("activities.table.actions"))}</th></tr></thead><tbody>${currentActivities.map((item) => `<tr><td>${escapeHtml(item.slug || "-")}</td><td>${escapeHtml(activityTitle(item))}</td><td><span class="badge badge-status">${escapeHtml(activityStatusLabel(item.status))}</span></td><td>${escapeHtml(String(item.sortOrder ?? 0))}</td><td>${escapeHtml(formatDate(item.updatedAt || item.createdAt))}</td><td class="action-btns"><button class="btn-icon btn-edit" type="button" data-action="edit" data-id="${Number(item.id)}">${escapeHtml(t("common.edit"))}</button><button class="btn-icon btn-delete" type="button" data-action="delete" data-id="${Number(item.id)}">${escapeHtml(t("common.delete"))}</button></td></tr>`).join("")}</tbody></table>`; } catch (error) { wrap.innerHTML = emptyBlock(error.message); } }
    document.getElementById("activity-create-btn").addEventListener("click", () => openActivityEditor(null));
    document.getElementById("activities-table-wrap").addEventListener("click", async (event) => { const button = event.target.closest("[data-action]"); if (!button) return; const id = Number(button.dataset.id); const item = currentActivities.find((entry) => Number(entry.id) === id); if (button.dataset.action === "edit") openActivityEditor(item); if (button.dataset.action === "delete") { if (!window.confirm(t("common.confirmDelete"))) return; try { await fetchJson(`${ACTIVITIES_API}/${id}`, { method: "DELETE" }); showToast(t("common.deleteSuccess"), "success"); loadActivities(); } catch (error) { showToast(error.message || t("common.deleteFailed"), "error"); } } });
    document.getElementById("activity-form-admin").addEventListener("submit", async (event) => { event.preventDefault(); const id = document.getElementById("activity-id").value; const payload = { slug: document.getElementById("activity-slug").value, status: document.getElementById("activity-status").value, sortOrder: Number(document.getElementById("activity-sort").value || 0), coverImage: document.getElementById("activity-cover").value, titleJa: document.getElementById("activity-title-ja").value, titleZh: document.getElementById("activity-title-zh").value, titleEn: document.getElementById("activity-title-en").value, summaryJa: document.getElementById("activity-summary-ja").value, summaryZh: document.getElementById("activity-summary-zh").value, summaryEn: document.getElementById("activity-summary-en").value, bodyMdJa: document.getElementById("activity-body-ja").value, bodyMdZh: document.getElementById("activity-body-zh").value, bodyMdEn: document.getElementById("activity-body-en").value }; try { await fetchJson(id ? `${ACTIVITIES_API}/${id}` : ACTIVITIES_API, { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); closeModal(); showToast(t("common.saveSuccess"), "success"); loadActivities(); } catch (error) { showToast(error.message || t("common.saveFailed"), "error"); } });
    bindActivityPreview(); loadActivities();
  }

  async function renderUsersPage() {
    setPage("users", `<section class="admin-panel"><div class="stats-grid"><article class="stat-card"><div class="number" id="user-total">0</div><div class="label">${escapeHtml(t("users.summary.total"))}</div></article><article class="stat-card"><div class="number" id="user-admins">0</div><div class="label">${escapeHtml(t("users.summary.admins"))}</div></article></div><div class="panel-heading"><div></div><button class="btn btn-primary" type="button" id="user-create-btn">${escapeHtml(t("users.newButton"))}</button></div><div class="table-wrap" id="users-table-wrap">${loadingBlock()}</div></section>`, `<div class="modal" id="user-modal"><div class="modal-content"><div class="modal-header"><h2 id="user-modal-title">${escapeHtml(t("users.modalCreate"))}</h2><button class="modal-close" type="button" data-modal-close>x</button></div><form id="user-form-admin"><input type="hidden" id="user-id" /><div class="form-row"><div class="form-group"><label>${escapeHtml(t("users.fields.username"))}</label><input id="user-username" type="text" required /></div><div class="form-group"><label>${escapeHtml(t("users.fields.displayName"))}</label><input id="user-display-name" type="text" required /></div></div><div class="form-row"><div class="form-group"><label>${escapeHtml(t("users.fields.role"))}</label><select id="user-role">${USER_ROLES.map((value) => `<option value="${value}">${escapeHtml(userRoleLabel(value))}</option>`).join("")}</select></div><div class="form-group"><label>${escapeHtml(t("users.fields.password"))}</label><input id="user-password" type="password" /><div class="form-hint" id="user-password-hint">${escapeHtml(t("users.passwordHintCreate"))}</div></div></div><div class="form-actions"><button type="button" class="btn btn-secondary" data-modal-close>${escapeHtml(t("common.cancel"))}</button><button type="submit" class="btn btn-primary">${escapeHtml(t("common.save"))}</button></div></form></div></div>`);
    let currentUsers = [];
    function openUserEditor(item) {
      document.getElementById("user-modal-title").textContent = item ? t("users.modalEdit") : t("users.modalCreate");
      document.getElementById("user-id").value = item?.id || "";
      document.getElementById("user-username").value = item?.username || "";
      document.getElementById("user-display-name").value = item?.displayName || "";
      document.getElementById("user-role").value = item?.role || "member";
      document.getElementById("user-password").value = "";
      document.getElementById("user-password-hint").textContent = item ? t("users.passwordHintEdit") : t("users.passwordHintCreate");
      openModal("user-modal");
    }
    async function loadUsers() {
      const wrap = document.getElementById("users-table-wrap");
      wrap.innerHTML = loadingBlock();
      try {
        currentUsers = await getUsers();
        document.getElementById("user-total").textContent = String(currentUsers.length);
        document.getElementById("user-admins").textContent = String(currentUsers.filter((item) => item.role === "admin").length);
        if (!currentUsers.length) { wrap.innerHTML = emptyBlock(); return; }
        wrap.innerHTML = `<table class="data-table"><thead><tr><th>${escapeHtml(t("users.table.id"))}</th><th>${escapeHtml(t("users.table.username"))}</th><th>${escapeHtml(t("users.table.displayName"))}</th><th>${escapeHtml(t("users.table.role"))}</th><th>${escapeHtml(t("users.table.createdAt"))}</th><th>${escapeHtml(t("users.table.actions"))}</th></tr></thead><tbody>${currentUsers.map((item) => `<tr><td>${escapeHtml(String(item.id))}</td><td><strong>${escapeHtml(item.username)}</strong></td><td>${escapeHtml(item.displayName || "-")}</td><td><span class="badge badge-status">${escapeHtml(userRoleLabel(item.role))}</span></td><td>${escapeHtml(formatDate(item.createdAt))}</td><td class="action-btns"><button class="btn-icon btn-edit" type="button" data-action="edit" data-id="${Number(item.id)}">${escapeHtml(t("common.edit"))}</button><button class="btn-icon btn-delete" type="button" data-action="delete" data-id="${Number(item.id)}">${escapeHtml(t("common.delete"))}</button></td></tr>`).join("")}</tbody></table>`;
      } catch (error) {
        wrap.innerHTML = emptyBlock(error.message);
      }
    }
    document.getElementById("user-create-btn").addEventListener("click", () => openUserEditor(null));
    document.getElementById("users-table-wrap").addEventListener("click", async (event) => {
      const button = event.target.closest("[data-action]");
      if (!button) return;
      const id = Number(button.dataset.id);
      const item = currentUsers.find((entry) => Number(entry.id) === id);
      if (button.dataset.action === "edit") openUserEditor(item);
      if (button.dataset.action === "delete") {
        if (!window.confirm(t("common.confirmDelete"))) return;
        try {
          await fetchJson(`${USERS_API}/${id}`, { method: "DELETE" });
          showToast(t("common.deleteSuccess"), "success");
          loadUsers();
        } catch (error) {
          showToast(error.message || t("common.deleteFailed"), "error");
        }
      }
    });
    document.getElementById("user-form-admin").addEventListener("submit", async (event) => {
      event.preventDefault();
      const id = document.getElementById("user-id").value;
      const payload = { username: document.getElementById("user-username").value.trim(), displayName: document.getElementById("user-display-name").value.trim(), role: document.getElementById("user-role").value, password: document.getElementById("user-password").value };
      if (!id && !payload.password) {
        showToast(t("users.passwordHintCreate"), "error");
        return;
      }
      if (id && !payload.password) delete payload.password;
      try {
        await fetchJson(id ? `${USERS_API}/${id}` : USERS_API, { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        closeModal();
        showToast(t("common.saveSuccess"), "success");
        loadUsers();
      } catch (error) {
        showToast(error.message || t("common.saveFailed"), "error");
      }
    });
    loadUsers();
  }

  async function renderCloudPage() {
    setPage("cloud", `<section class="admin-grid admin-grid--two"><section class="admin-panel cloud-card"><div class="section-kicker">Nextcloud</div><h2>${escapeHtml(t("cloud.titleA"))}</h2><p>${escapeHtml(t("cloud.bodyA"))}</p><div class="cloud-link-box"><code>${escapeHtml(NEXTCLOUD_URL)}</code></div><div class="hero-actions"><a class="btn btn-primary" href="${escapeHtml(NEXTCLOUD_URL)}" target="_blank" rel="noreferrer">${escapeHtml(t("common.open"))}</a><button class="btn btn-secondary" type="button" id="cloud-copy-btn">${escapeHtml(t("common.copyLink"))}</button></div></section><section class="admin-panel cloud-card"><div class="section-kicker">URL</div><h2>${escapeHtml(t("cloud.titleB"))}</h2><p>${escapeHtml(t("cloud.bodyB"))}</p><ul class="cloud-note-list"><li>${escapeHtml(NEXTCLOUD_URL)}</li><li>${escapeHtml(t("cloud.noteAuth"))}</li><li>${escapeHtml(t("cloud.noteAcl"))}</li></ul></section></section>`);
    document.getElementById("cloud-copy-btn")?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(NEXTCLOUD_URL);
        showToast(t("common.copied"), "success");
      } catch {
        showToast(t("common.copyLink"), "error");
      }
    });
  }

  function renderChrome() {
    renderNav();
    initParticles();
    const pages = {
      dashboard: renderDashboardPage,
      bugs: renderBugsPage,
      schedules: renderSchedulesPage,
      activities: renderActivitiesPage,
      users: renderUsersPage,
      cloud: renderCloudPage
    };
    const renderPage = pages[adminPage] || renderDashboardPage;
    renderPage();
  }

  renderChrome();
};

try {
  window.initAdminPage();
} catch (error) {
  console.error("[ZERO admin] bootstrap failed", error);
  const root = document.getElementById("admin-page-root");
  const safeMessage = String(error?.message || error || "Unknown error")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  if (root) {
    root.innerHTML = `<section class="admin-panel"><div class="eyebrow">ADMIN ERROR</div><h1>Backend UI failed to load</h1><p>The jump target is correct, but the admin page script crashed during startup.</p><div class="cloud-link-box"><code>${safeMessage}</code></div></section>`;
  }
}

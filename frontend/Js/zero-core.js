(function () {
  const PLAYER_KEY = "zero_player_v4";
  const LANG_KEY = "zerokara_lang";
  const SUPPORTED_LANGS = ["ja", "zh-TW", "en"];
  const ROUTES = {
    "/": { key: "home", path: "/index.html" },
    "/index.html": { key: "home", path: "/index.html" },
    "/activity.html": { key: "activity", path: "/activity.html" },
    "/schedule.html": { key: "schedule", path: "/schedule.html" },
    "/join.html": { key: "join", path: "/join.html" },
    "/bug.html": { key: "bug", path: "/bug.html" },
    "/login.html": { key: "login", path: "/login.html" }
  };
  const MAIN_CLASS = {
    home: "main-content",
    activity: "activity-page",
    schedule: "schedule-page",
    join: "join-content",
    bug: "page-content",
    login: "login-page"
  };
  const INITIALIZERS = {
    activity: () => window.initActivityPage && window.initActivityPage(),
    schedule: () => window.initSchedulePage && window.initSchedulePage(),
    bug: () => window.initBugPage && window.initBugPage(),
    login: () => window.initLoginPage && window.initLoginPage()
  };
  const COPY = window.ZeroCopy || {};
  const CONFIG = window.ZeroSiteConfig || {};
  const SITE_BASE = CONFIG.siteBase || "";
  const resolveSite = (path) => CONFIG.resolveSite ? CONFIG.resolveSite(path) : path;
  const BACKGROUND_VIDEO = CONFIG.backgroundVideo || "Video/Video.optimized.mp4";
  const COPY_ALLOW_SELECTOR = "[data-copy-allow], [data-copy-allow] *, input, textarea, select, option, button";

  function normalizePathname(pathname) {
    let value = pathname || "/";
    if (/^https?:\/\//i.test(value)) value = new URL(value).pathname;
    if (SITE_BASE && value === SITE_BASE) return "/";
    if (SITE_BASE && value.startsWith(`${SITE_BASE}/`)) value = value.slice(SITE_BASE.length);
    return value || "/";
  }

  function normalizeLang(value) {
    return SUPPORTED_LANGS.includes(value) ? value : "ja";
  }

  function getCopy(lang) {
    return COPY[normalizeLang(lang)] || COPY.ja || {};
  }

  function t(path, lang) {
    const segments = String(path).split(".");
    let current = getCopy(lang);
    for (const segment of segments) {
      current = current == null ? undefined : current[segment];
    }
    if (current != null) return current;
    current = COPY.ja;
    for (const segment of segments) {
      current = current == null ? undefined : current[segment];
    }
    return current;
  }

  function localeTag(lang) {
    if (lang === "zh-TW") return "zh-Hant-TW";
    if (lang === "en") return "en-US";
    return "ja-JP";
  }

  function routeFor(pathname) {
    return ROUTES[normalizePathname(pathname)] || null;
  }

  function setDoc(routeKey, lang) {
    const safeLang = normalizeLang(lang);
    const titles = t("titles", safeLang) || {};
    document.documentElement.lang = safeLang === "zh-TW" ? "zh-Hant" : safeLang;
    document.body.dataset.lang = safeLang;
    document.body.dataset.page = routeKey;
    document.title = titles[routeKey] || titles.home || "ZERO";
    localStorage.setItem(LANG_KEY, safeLang);
  }

  function makeBridge(readLang, navigate) {
    window.ZeroCore = {
      navigate,
      applyLanguage(nextLang) {
        const lang = normalizeLang(nextLang);
        localStorage.setItem(LANG_KEY, lang);
        window.dispatchEvent(new CustomEvent("zero:language-command", { detail: { lang } }));
      },
      t(path) {
        return t(path, readLang());
      },
      getLang() {
        return readLang();
      },
      getLocaleTag() {
        return localeTag(readLang());
      }
    };
  }

  makeBridge(() => normalizeLang(localStorage.getItem(LANG_KEY) || document.body.dataset.lang || "ja"), (pathname) => {
    const route = routeFor(pathname);
    window.location.href = route ? resolveSite(route.path) : resolveSite(pathname);
  });

  if (!window.Vue || !document.getElementById("app")) return;

  const { createApp, reactive, computed, nextTick, watch } = window.Vue;
  const entry = routeFor(location.pathname) || ROUTES["/"];
  const state = reactive({
    lang: normalizeLang(localStorage.getItem(LANG_KEY) || document.body.dataset.lang || "ja"),
    routeKey: entry.key,
    routePath: entry.path,
    navOpen: false,
    playerCollapsed: false,
    playerTitle: t("player.empty", "ja") || "No track",
    playerSubtitle: t("player.ready", "ja") || "Ready",
    playerHint: "",
    playerProgress: 0,
    playerVolume: 55,
    playerPlaying: false
  });

  function applyRoute(route) {
    state.routeKey = route.key;
    state.routePath = route.path;
    setDoc(route.key, state.lang);
    const video = document.getElementById("hero-video");
    if (route.key === "home") {
      scheduleVisualEnhancements();
    } else if (video) {
      video.pause();
    }
  }

  function initRoute(routeKey) {
    nextTick(() => {
      const fn = INITIALIZERS[routeKey];
      if (typeof fn === "function") fn();
    });
  }

  function navigate(pathname, pushState = true) {
    const route = routeFor(pathname);
    if (!route) {
      window.location.href = resolveSite(pathname);
      return;
    }
    const same = route.path === state.routePath;
    state.navOpen = false;
    applyRoute(route);
    if (pushState && !same) history.pushState({ path: route.path }, "", resolveSite(route.path));
    initRoute(route.key);
  }

  makeBridge(() => state.lang, navigate);

  window.addEventListener("zero:language-command", (event) => {
    const requested = normalizeLang(event.detail && event.detail.lang);
    if (requested !== state.lang) state.lang = requested;
  });

  window.addEventListener("popstate", () => {
    const route = routeFor(location.pathname);
    if (!route) {
      window.location.reload();
      return;
    }
    applyRoute(route);
    initRoute(route.key);
  });

  function initParticles() {
    if (!window.particlesJS || !document.getElementById("particles-js") || document.querySelector("#particles-js canvas")) return;
    window.particlesJS("particles-js", {
      particles: {
        number: { value: 48, density: { enable: true, value_area: 1000 } },
        color: { value: ["#59d7ff", "#ff6fd8", "#64e8a5"] },
        shape: { type: "circle" },
        opacity: { value: 0.35, random: true },
        size: { value: 2.2, random: true },
        line_linked: { enable: true, distance: 150, color: "#59d7ff", opacity: 0.14, width: 1 },
        move: { enable: true, speed: 1.2, out_mode: "out" }
      },
      interactivity: {
        detect_on: "canvas",
        events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "push" } },
        modes: { grab: { distance: 150, line_linked: { opacity: 0.25 } }, push: { particles_nb: 3 } }
      },
      retina_detect: true
    });
  }

  function runWhenIdle(callback, timeout = 1200) {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => callback(), { timeout });
      return;
    }
    window.setTimeout(callback, 180);
  }

  function initBackgroundVideo() {
    const video = document.getElementById("hero-video");
    if (!video || video.dataset.hydrated === "1") return;
    video.dataset.hydrated = "1";
    video.preload = "metadata";
    video.src = resolveSite(BACKGROUND_VIDEO);
    const reveal = () => {
      video.classList.add("is-ready");
      video.play().catch(() => {});
    };
    if (video.readyState >= 2) {
      reveal();
      return;
    }
    video.addEventListener("canplay", reveal, { once: true });
    video.load();
  }

  function scheduleVisualEnhancements() {
    window.requestAnimationFrame(() => {
      runWhenIdle(() => {
        initParticles();
        if (state.routeKey === "home") initBackgroundVideo();
      });
    });
  }

  function bindCopyProtection() {
    if (document.body.dataset.copyProtected === "1") return;
    document.body.dataset.copyProtected = "1";

    const isAllowedTarget = (target) => target instanceof Element && !!target.closest(COPY_ALLOW_SELECTOR);
    const isProtectedTarget = (target) => target instanceof Element && !!target.closest("[data-protect-copy]");

    document.addEventListener("copy", (event) => {
      if (isAllowedTarget(event.target) || !isProtectedTarget(event.target)) return;
      event.preventDefault();
    });

    document.addEventListener("selectstart", (event) => {
      if (isAllowedTarget(event.target) || !isProtectedTarget(event.target)) return;
      event.preventDefault();
    });
  }

  const player = {
    audio: new Audio(),
    playlist: (window.ZeroSiteConfig && window.ZeroSiteConfig.playlist) || [],
    currentIndex: 0,
    loadedTrackId: null,
    resumeTime: 0,
    autoplayOnGesture: false,
    desiredVolume: 0.55,
    gestureBound: false,
    eventsBound: false
  };
  player.audio.preload = "metadata";
  player.audio.autoplay = true;
  player.audio.playsInline = true;

  function readPlayerState() {
    try {
      return JSON.parse(localStorage.getItem(PLAYER_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function persistPlayer() {
    localStorage.setItem(PLAYER_KEY, JSON.stringify({
      currentIndex: player.currentIndex,
      time: Number.isFinite(player.audio.currentTime) ? player.audio.currentTime : 0,
      volume: Number.isFinite(player.desiredVolume) ? player.desiredVolume : 0.55,
      playing: !player.audio.paused
    }));
  }

  function refreshPlayer(statusKey) {
    const track = player.playlist[player.currentIndex];
    state.playerTitle = track ? track.name : t("player.empty", state.lang);
    const label = statusKey || (player.audio.paused ? "paused" : "playing");
    state.playerSubtitle = t(`player.${label}`, state.lang) || t("player.ready", state.lang);
    state.playerHint = player.autoplayOnGesture ? (t("player.unlock", state.lang) || "") : "";
    state.playerPlaying = !player.audio.paused;
    const duration = Number.isFinite(player.audio.duration) && player.audio.duration > 0 ? player.audio.duration : 1;
    state.playerProgress = Math.max(0, Math.min(1000, Math.round((player.audio.currentTime / duration) * 1000)));
    state.playerVolume = Math.round(player.desiredVolume * 100);
  }

  function bindGestureAutoplay() {
    if (player.gestureBound || !player.autoplayOnGesture) return;
    player.gestureBound = true;
    const resume = async () => {
      player.gestureBound = false;
      player.autoplayOnGesture = false;
      try {
        await playTrack(player.currentIndex, player.resumeTime || player.audio.currentTime || 0);
      } catch {}
      persistPlayer();
      refreshPlayer();
    };
    ["pointerdown", "keydown", "touchstart"].forEach((name) => {
      document.addEventListener(name, resume, { once: true, passive: true });
    });
  }

  async function startMutedAutoplay(index, resumeTime) {
    await loadTrack(index, resumeTime || 0);
    player.audio.muted = true;
    player.audio.volume = 0;
    await player.audio.play();
    persistPlayer();
    refreshPlayer("playing");
  }

  async function loadTrack(index, resumeTime) {
    const track = player.playlist[index];
    if (!track) return;
    player.currentIndex = index;
    player.resumeTime = typeof resumeTime === "number" && resumeTime > 0 ? resumeTime : 0;
    if (player.loadedTrackId === track.id && player.audio.src) {
      if (player.resumeTime > 0) player.audio.currentTime = player.resumeTime;
      refreshPlayer();
      return;
    }
    player.loadedTrackId = track.id;
    player.audio.src = resolveSite(track.src);
    player.audio.load();
    await new Promise((resolve) => {
      const settle = () => {
        if (player.resumeTime > 0) player.audio.currentTime = player.resumeTime;
        resolve();
      };
      if (player.audio.readyState >= 1) {
        settle();
        return;
      }
      player.audio.addEventListener("loadedmetadata", settle, { once: true });
    });
    refreshPlayer("ready");
  }

  async function playTrack(index, resumeTime) {
    if (!player.playlist.length) return;
    await loadTrack(index, resumeTime || 0);
    player.audio.muted = false;
    player.audio.volume = player.desiredVolume;
    await player.audio.play();
    persistPlayer();
    refreshPlayer("playing");
  }

  function bindPlayerEvents() {
    if (player.eventsBound) return;
    player.eventsBound = true;
    ["play", "pause", "timeupdate", "loadedmetadata", "ended"].forEach((name) => {
      player.audio.addEventListener(name, () => {
        if (name === "ended") return window.ZeroPlayer.next();
        persistPlayer();
        refreshPlayer();
      });
    });
  }

  function initPlayer() {
    if (!player.playlist.length) return refreshPlayer("empty");
    bindPlayerEvents();
    const saved = readPlayerState();
    player.currentIndex = Number.isInteger(saved.currentIndex) ? saved.currentIndex : 0;
    player.desiredVolume = typeof saved.volume === "number" ? saved.volume : 0.55;
    player.audio.volume = player.desiredVolume;
    player.resumeTime = typeof saved.time === "number" ? saved.time : 0;
    player.autoplayOnGesture = true;
    startMutedAutoplay(player.currentIndex, player.resumeTime)
      .then(async () => {
        try {
          player.audio.muted = false;
          player.audio.volume = player.desiredVolume;
          await player.audio.play();
          player.autoplayOnGesture = false;
          persistPlayer();
          refreshPlayer("playing");
        } catch {
          bindGestureAutoplay();
          refreshPlayer("blocked");
        }
      })
      .catch((error) => {
        console.error("[ZERO] init player failed", error);
        bindGestureAutoplay();
        refreshPlayer("blocked");
      });
  }

  window.ZeroPlayer = {
    toggle() {
      if (player.audio.paused) return playTrack(player.currentIndex, player.audio.currentTime || 0);
      player.audio.pause();
      persistPlayer();
      refreshPlayer("paused");
    },
    next() {
      const nextIndex = (player.currentIndex + 1) % player.playlist.length;
      return playTrack(nextIndex, 0);
    },
    prev() {
      const nextIndex = (player.currentIndex - 1 + player.playlist.length) % player.playlist.length;
      return playTrack(nextIndex, 0);
    },
    setProgress(value) {
      if (!Number.isFinite(player.audio.duration) || player.audio.duration <= 0) return;
      player.audio.currentTime = player.audio.duration * (Number(value) / 1000);
      persistPlayer();
      refreshPlayer();
    },
    setVolume(value) {
      player.desiredVolume = Number(value) / 100;
      player.audio.volume = player.desiredVolume;
      player.audio.muted = false;
      persistPlayer();
      refreshPlayer();
    }
  };

  const app = createApp({
    setup() {
      const route = computed(() => routeFor(state.routePath) || ROUTES["/"]);
      const copy = computed(() => getCopy(state.lang));
      const mainClass = computed(() => MAIN_CLASS[route.value.key] || "page-content");
      const showVideo = computed(() => route.value.key === "home");

      watch(() => state.lang, (lang) => {
        setDoc(route.value.key, lang);
        refreshPlayer();
        window.dispatchEvent(new CustomEvent("zero:language-changed", { detail: { lang } }));
      }, { immediate: true });

      watch(() => state.navOpen, (open) => {
        document.body.classList.toggle("has-drawer", open);
      }, { immediate: true });

      nextTick(() => {
        scheduleVisualEnhancements();
        initPlayer();
        initRoute(route.value.key);
      });

      return {
        state,
        route,
        copy,
        mainClass,
        showVideo,
        navigate,
        siteHref(path) { return resolveSite(path); },
        setLanguage(lang) { state.lang = normalizeLang(lang); },
        toggleNav() { state.navOpen = !state.navOpen; },
        closeNav() { state.navOpen = false; },
        togglePlayerPanel() { state.playerCollapsed = !state.playerCollapsed; },
        togglePlayer() { window.ZeroPlayer.toggle(); },
        prevTrack() { window.ZeroPlayer.prev(); },
        nextTrack() { window.ZeroPlayer.next(); },
        setProgress(event) { window.ZeroPlayer.setProgress(event.target.value); },
        setVolume(event) { window.ZeroPlayer.setVolume(event.target.value); },
        resetBugForm() { if (typeof window.resetForm === "function") window.resetForm(); }
      };
    },
    template: `
      <div class="zero-shell" :class="['lang-' + state.lang, 'route-' + route.key, { 'nav-open': state.navOpen }]">
        <div id="particles-js"></div>
        <div class="video-container" :class="{ 'is-hidden': !showVideo }">
          <video id="hero-video" class="background-video" muted loop playsinline preload="none"></video>
          <div class="video-overlay"></div>
        </div>
        <div class="mobile-topbar">
          <a :href="siteHref('/index.html')" class="mobile-topbar__brand" @click.prevent="navigate('/index.html')">ZERO</a>
          <div class="mobile-topbar__actions">
            <select class="mobile-lang-select" :value="state.lang" @change="setLanguage($event.target.value)">
              <option value="ja">日本語</option><option value="zh-TW">繁體中文</option><option value="en">English</option>
            </select>
            <button type="button" class="mobile-menu-btn" @click="toggleNav" :aria-expanded="state.navOpen ? 'true' : 'false'" aria-label="Open navigation">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
        <button v-if="state.navOpen" type="button" class="mobile-nav-backdrop" @click="closeNav" aria-label="Close navigation"></button>
        <nav class="nav-sidebar">
          <div class="logo"><a :href="siteHref('/index.html')" @click.prevent="navigate('/index.html')"><span class="nav-logo">ZERO</span></a></div>
          <ul>
            <li v-for="item in copy.nav" :key="item.key"><a :href="siteHref(item.href)" class="nav-link" :class="{ active: route.key === item.key }" :data-icon="item.icon" @click.prevent="navigate(item.href)">{{ item.label }}</a></li>
          </ul>
          <div class="sidebar-note">{{ copy.shell.note }}</div>
        </nav>
        <div class="lang-switcher-fixed">
          <label class="visually-hidden" for="lang-select-desktop">{{ copy.shell.languageLabel }}</label>
          <select id="lang-select-desktop" :value="state.lang" @change="setLanguage($event.target.value)">
            <option value="ja">日本語</option><option value="zh-TW">繁體中文</option><option value="en">English</option>
          </select>
        </div>
        <main :class="mainClass" data-protect-copy="true">
          <div v-if="route.key === 'home'" class="hero-shell">
            <section class="hero-grid">
              <article class="glass-panel hero-copy hero-copy--home">
                <div class="eyebrow">{{ copy.home.eyebrow }}</div>
                <h1 class="hero-title hero-title--home">{{ copy.home.title }}</h1>
                <p class="hero-subtitle home-lead">{{ copy.home.lead }}</p>
                <div class="home-story">
                  <p v-for="paragraph in copy.home.story" :key="paragraph">{{ paragraph }}</p>
                </div>
                <div class="hero-actions">
                  <a class="cta-button" :href="siteHref('/bug.html')" @click.prevent="navigate('/bug.html')">{{ copy.home.primary }}</a>
                  <a class="secondary-button" :href="siteHref('/join.html')" @click.prevent="navigate('/join.html')">{{ copy.home.secondary }}</a>
                </div>
                <div class="hero-metric-grid">
                  <article class="hero-metric-card hero-metric-card--guide" v-for="item in copy.home.guides" :key="item.title">
                    <div class="feature-card__eyebrow">{{ item.title }}</div>
                    <p>{{ item.text }}</p>
                  </article>
                </div>
                <div class="home-note">
                  <div class="section-kicker">{{ copy.home.noteLabel }}</div>
                  <p>{{ copy.home.note }}</p>
                </div>
              </article>
              <aside class="glass-panel feature-stack home-stack">
                <div class="section-kicker">{{ copy.home.updatesLabel }}</div>
                <div class="update-log">
                  <article class="update-log__item" v-for="item in copy.home.updates" :key="item.date + item.title">
                    <div class="update-log__date">{{ item.date }}</div>
                    <h3>{{ item.title }}</h3>
                    <p>{{ item.text }}</p>
                  </article>
                </div>
              </aside>
            </section>
          </div>
          <div v-else-if="route.key === 'join'" class="page-grid">
            <section class="join-card join-layout-card">
              <div class="join-header">
                <div class="eyebrow">{{ copy.join.eyebrow }}</div>
                <h1 class="join-title-editorial">
                  <span class="join-title-line" v-for="line in copy.join.titleLines" :key="line.text" :class="{ 'is-accent': line.accent }">{{ line.text }}</span>
                </h1>
                <p class="hero-subtitle join-intro">{{ copy.join.lead }}</p>
              </div>
              <div class="join-stage">
                <div class="join-story-grid"><article class="feature-card join-story-card" v-for="item in copy.join.pillars" :key="item.title"><div class="feature-card__eyebrow">{{ item.kicker }}</div><h3>{{ item.title }}</h3><p>{{ item.text }}</p></article></div>
                <aside class="join-side-column">
                  <section class="join-process"><div class="section-kicker">{{ copy.join.processLabel }}</div><article class="process-step" v-for="step in copy.join.steps" :key="step.index"><div class="process-index">{{ step.index }}</div><div><h3>{{ step.title }}</h3><p>{{ step.text }}</p></div></article></section>
                  <section class="join-contact-panel"><div class="section-kicker">{{ copy.join.contactLabel }}</div><h3>{{ copy.join.contactTitle }}</h3><p>{{ copy.join.contactText }}</p><div class="join-contact-copy">{{ copy.join.contactNote }}</div></section>
                </aside>
              </div>
              <div class="hero-actions join-actions" data-copy-allow="true">
                <a href="https://discord.gg/JTtuRqvKAk" class="cta-button join-primary" target="_blank" rel="noreferrer">{{ copy.join.primary }}</a>
                <a href="mailto:zerocircle2025.dhu@gmail.com" class="secondary-button join-secondary">{{ copy.join.secondary }}</a>
              </div>
              <div class="join-contact-links" data-copy-allow="true">
                <div class="join-contact-links__item">
                  <span class="join-contact-links__label">Discord</span>
                  <a href="https://discord.gg/JTtuRqvKAk" target="_blank" rel="noreferrer">discord.gg/JTtuRqvKAk</a>
                </div>
                <div class="join-contact-links__item">
                  <span class="join-contact-links__label">Email</span>
                  <a href="mailto:zerocircle2025.dhu@gmail.com">zerocircle2025.dhu@gmail.com</a>
                </div>
              </div>
            </section>
          </div>
          <div v-else-if="route.key === 'activity'" class="page-grid"><section class="page-card page-card--activity"><header class="section-header section-header--stack"><div><div class="eyebrow">{{ copy.activity.eyebrow }}</div><h1 class="activity-title">{{ copy.activity.title }}</h1><p class="activity-desc">{{ copy.activity.lead }}</p></div></header><div class="activity-flow-wrapper"><div id="flow" class="activity-flow"></div></div></section></div>
          <div v-else-if="route.key === 'schedule'" class="page-grid"><section class="page-card"><header class="schedule-header"><div><div class="eyebrow">{{ copy.schedule.eyebrow }}</div><h1 class="schedule-title">{{ copy.schedule.title }}</h1><p class="schedule-desc">{{ copy.schedule.lead }}</p></div><div class="schedule-legend"><span class="legend-dot type-meeting"></span>{{ copy.schedule.legend.meeting }}<span class="legend-dot type-event"></span>{{ copy.schedule.legend.event }}<span class="legend-dot type-other"></span>{{ copy.schedule.legend.other }}</div></header><section class="schedule-layout"><div class="schedule-calendar-card"><div class="calendar-header"><div class="calendar-header-row"><button class="calendar-nav-btn" data-direction="prev" :aria-label="copy.player.prev">&lt;</button><div class="calendar-month" id="calendar-month-label"></div><button class="calendar-nav-btn" data-direction="next" :aria-label="copy.player.next">&gt;</button></div></div><div class="calendar-grid"><div class="calendar-weekday" v-for="day in copy.schedule.weekdays" :key="day">{{ day }}</div></div></div><div class="schedule-timeline-card"><h2>{{ copy.schedule.monthSection }}</h2><ul class="schedule-timeline" id="schedule-timeline"></ul></div></section></section></div>
          <div v-else-if="route.key === 'bug'" class="page-grid"><section class="bug-card"><header class="section-header section-header--stack"><div><div class="eyebrow">{{ copy.bug.eyebrow }}</div><h1>{{ copy.bug.title }}</h1><p>{{ copy.bug.lead }}</p></div></header><form id="bug-form" class="bug-form"><div class="form-row"><div class="form-group"><label for="project">{{ copy.bug.labels.project }}</label><select id="project" name="project" required><option value="">{{ copy.bug.projectPlaceholder }}</option><option v-for="project in copy.bug.projects" :key="project.value" :value="project.value">{{ project.label }}</option></select></div><div class="form-group"><label>{{ copy.bug.labels.priority }}</label><div class="severity-selector"><label class="severity-option"><input type="radio" name="severity" value="P0" required><span class="severity-badge severity-p0">P0</span></label><label class="severity-option"><input type="radio" name="severity" value="P1"><span class="severity-badge severity-p1">P1</span></label><label class="severity-option"><input type="radio" name="severity" value="P2"><span class="severity-badge severity-p2">P2</span></label><label class="severity-option"><input type="radio" name="severity" value="P3"><span class="severity-badge severity-p3">P3</span></label></div></div></div><div class="form-group"><label for="title">{{ copy.bug.labels.title }}</label><input id="title" name="title" type="text" maxlength="200" required :placeholder="copy.bug.placeholders.title" /></div><div class="form-group"><label for="steps">{{ copy.bug.labels.detail }}</label><textarea id="steps" name="steps" rows="6" required :placeholder="copy.bug.placeholders.detail"></textarea></div><div class="form-group"><label for="reporter">{{ copy.bug.labels.reporter }}</label><input id="reporter" name="reporter" type="text" required :placeholder="copy.bug.placeholders.reporter" /></div><button type="submit" class="submit-button" id="submit-btn"><span class="submit-label">{{ copy.bug.submitAction }}</span></button></form><div id="success-message" class="success-message" style="display:none;"><div class="success-icon">OK</div><div class="success-text"><h3>{{ copy.bug.successTitle }}</h3><p id="success-note">{{ copy.bug.successBody }}</p></div><button class="btn-reset" type="button" @click="resetBugForm">{{ copy.bug.successReset }}</button></div></section></div>
          <div v-else-if="route.key === 'login'" class="page-grid login-layout login-layout--right"><section class="page-card login-copy"><div class="eyebrow">{{ copy.login.eyebrow }}</div><h1 class="login-title">{{ copy.login.title }}</h1><p class="login-desc">{{ copy.login.lead }}</p><div class="login-info-grid"><article class="feature-card" v-for="panel in copy.login.panels" :key="panel.title"><h3>{{ panel.title }}</h3><p>{{ panel.text }}</p></article></div></section><section class="login-card login-card--focus"><header class="section-header compact"><div><h2 class="section-title">{{ copy.login.formTitle }}</h2></div></header><form id="login-form" class="login-form" autocomplete="off"><div class="login-field"><label for="login-id">{{ copy.login.fields.account }}</label><input id="login-id" type="text" required :placeholder="copy.login.placeholders.account" /></div><div class="login-field"><label for="login-password">{{ copy.login.fields.password }}</label><input id="login-password" type="password" required :placeholder="copy.login.placeholders.password" /></div><button type="submit" class="login-submit-btn">{{ copy.login.submitAction }}</button></form><p class="login-meta">{{ copy.login.meta }}</p></section><div class="login-loading-overlay" id="login-loading" aria-hidden="true"><div class="loading-inner"><div class="loading-title">{{ copy.login.loadingTitle }}</div><div class="loading-sub">{{ copy.login.loadingSub }}</div><div class="loading-bar"><div class="loading-bar-fill"></div></div></div></div></div>
        </main>
        <div class="zero-player" :class="{ 'is-collapsed': state.playerCollapsed }"><div class="zero-player__header"><div class="zero-player__meta"><div class="zero-player__eyebrow">{{ copy.player.eyebrow }}</div><div class="zero-player__title">{{ state.playerTitle }}</div><div class="zero-player__sub">{{ state.playerSubtitle }}</div><div v-if="state.playerHint && !state.playerCollapsed" class="zero-player__hint">{{ state.playerHint }}</div></div><button type="button" class="zero-player__toggle" @click="togglePlayerPanel" :aria-expanded="state.playerCollapsed ? 'false' : 'true'">{{ state.playerCollapsed ? copy.player.expand : copy.player.collapse }}</button></div><div v-if="!state.playerCollapsed" class="zero-player__controls"><button type="button" @click="prevTrack">{{ copy.player.prev }}</button><button type="button" @click="togglePlayer">{{ state.playerPlaying ? copy.player.pause : copy.player.play }}</button><button type="button" @click="nextTrack">{{ copy.player.next }}</button></div><div v-if="!state.playerCollapsed" class="zero-player__bottom"><input type="range" min="0" max="1000" :value="state.playerProgress" @input="setProgress" /><input type="range" min="0" max="100" :value="state.playerVolume" @input="setVolume" /></div></div>
      </div>
    `
  });

  bindCopyProtection();
  app.mount("#app");
})();

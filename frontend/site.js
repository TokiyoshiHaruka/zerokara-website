(function () {
  function readMeta(name) {
    return document.querySelector(`meta[name="${name}"]`)?.content || "";
  }

  function normalizeSiteBase(value) {
    const raw = String(value || "").trim();
    if (!raw || raw === "/") return "";
    return `/${raw.replace(/^\/+|\/+$/g, "")}`;
  }

  function normalizeBackendBase(value) {
    const raw = String(value || "").trim();
    if (!raw || raw === "/") return "";
    if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/g, "");
    return `/${raw.replace(/^\/+|\/+$/g, "")}`;
  }

  function normalizePath(path) {
    const raw = String(path || "").trim();
    if (!raw) return "/";
    if (/^https?:\/\//i.test(raw)) return raw;
    return raw.startsWith("/") ? raw : `/${raw}`;
  }

  function joinUrl(base, path) {
    const normalizedPath = normalizePath(path);
    if (/^https?:\/\//i.test(normalizedPath)) return normalizedPath;
    if (!base) return normalizedPath;
    return normalizedPath === "/" ? base : `${base}${normalizedPath}`;
  }

  const config = window.ZeroSiteConfig || {};
  const siteBase = normalizeSiteBase(config.siteBase || readMeta("zero-site-base"));
  const backendBase = normalizeBackendBase(config.backendBase || readMeta("zero-backend-base"));

  config.siteBase = siteBase;
  config.backendBase = backendBase;
  config.resolveSite = function resolveSite(path) {
    return joinUrl(siteBase, path);
  };
  config.resolveAdmin = function resolveAdmin(path) {
    const file = String(path || "index.html").replace(/^\/+/, "");
    return config.resolveSite(`/admin/${file}`);
  };
  config.resolveBackend = function resolveBackend(path) {
    return joinUrl(backendBase, path);
  };
  config.backgroundVideo = "Video/Video.optimized.mp4";
  config.playlist = window.ZeroSitePlaylist || [];

  window.ZeroSiteConfig = config;
})();

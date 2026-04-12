window.initActivityPage = function initActivityPage() {
  const flow = document.getElementById("flow");
  if (!flow || flow.dataset.bound === "1") return;
  flow.dataset.bound = "1";

  const state = { items: [], frameId: 0 };
  const text = (path, fallback) => window.ZeroCore?.t?.(path) || fallback;
  const lang = () => window.ZeroCore?.getLang?.() || "ja";
  const feedUrl = window.ZeroSiteConfig?.resolveBackend?.("/api/public/activities") || "/api/public/activities";

  function pick(item, variants, fallback = "") {
    const current = lang();
    const order = current === "zh-TW"
      ? [variants.zh, variants.ja, variants.en]
      : current === "en"
        ? [variants.en, variants.ja, variants.zh]
        : [variants.ja, variants.zh, variants.en];
    return order.find(Boolean) || fallback;
  }

  function createCard(item) {
    const title = pick(item, { ja: item.titleJa, zh: item.titleZh, en: item.titleEn }, item.slug || "Untitled");
    const body = pick(item, { ja: item.bodyMdJa || item.summaryJa, zh: item.bodyMdZh || item.summaryZh, en: item.bodyMdEn || item.summaryEn }, "");
    const team = item.team || "ZERO";
    const created = (item.createdAt && String(item.createdAt).slice(0, 10)) || "TBD";
    const statusLabel = item.status === "published" ? "Published" : "Draft";
    const bodyHtml = typeof marked !== "undefined" ? marked.parse(body || "") : `<p>${body || ""}</p>`;
    const card = document.createElement("article");
    card.className = "activity-card";
    card.innerHTML = `<div class="card-header-row"><span>Team: ${team}</span><span>${created}</span></div><h2 class="card-title">${title}</h2><div class="card-tags">Status: ${statusLabel}</div><div class="card-body markdown-body">${bodyHtml || "<p></p>"}</div>`;
    return card;
  }

  function stopLoop() {
    if (state.frameId) cancelAnimationFrame(state.frameId);
    state.frameId = 0;
  }

  function setDisplayMode(mode) {
    const wrapper = flow.parentElement;
    flow.classList.toggle("activity-flow--single", mode === "single");
    wrapper?.classList.toggle("activity-flow-wrapper--single", mode === "single");
  }

  function setupInfiniteScroll() {
    stopLoop();
    setDisplayMode("loop");
    flow.style.transform = "translateX(0)";
    const originals = Array.from(flow.children);
    if (!originals.length) return;
    originals.forEach((card) => flow.appendChild(card.cloneNode(true)));
    const loopWidth = flow.scrollWidth / 2;
    let offset = loopWidth / 2;
    let last = null;
    const speed = 26;
    const frame = (timestamp) => {
      if (!document.body.contains(flow)) return;
      if (last == null) last = timestamp;
      offset += ((timestamp - last) * speed) / 1000;
      last = timestamp;
      if (offset >= loopWidth) offset -= loopWidth;
      flow.style.transform = `translateX(${-offset}px)`;
      state.frameId = requestAnimationFrame(frame);
    };
    state.frameId = requestAnimationFrame(frame);
  }

  function render() {
    stopLoop();
    flow.innerHTML = "";
    if (!state.items.length) {
      setDisplayMode("single");
      flow.innerHTML = `<article class="activity-card"><h2 class="card-title">${text("activity.emptyTitle", "No public activity is available yet")}</h2><div class="card-body"><p>${text("activity.emptyBody", "The activity feed cannot be loaded right now.")}</p></div></article>`;
      return;
    }
    if (state.items.length === 1) {
      setDisplayMode("single");
      flow.appendChild(createCard(state.items[0]));
      flow.style.transform = "translateX(0)";
      return;
    }
    state.items.forEach((item) => flow.appendChild(createCard(item)));
    setupInfiniteScroll();
  }

  fetch(feedUrl)
    .then((res) => res.json())
    .then((data) => {
      state.items = data.items || [];
      render();
    })
    .catch((error) => {
      console.error("[ZERO activity]", error);
      state.items = [];
      render();
    });

  window.addEventListener("zero:language-changed", () => {
    if (!document.body.contains(flow)) return;
    render();
  });
};


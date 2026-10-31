// ===== Un logo que falte no deja el icono de imagen rota =====
document.querySelectorAll(".card__logo").forEach((img) => {
  const drop = () => img.remove();
  img.addEventListener("error", drop);
  if (img.complete && img.naturalWidth === 0) drop();
});

// ===== Entrada del hero =====
window.addEventListener("load", () => {
  document.querySelectorAll("[data-line]").forEach((el, i) => {
    setTimeout(() => el.classList.add("in"), 120 + i * 130);
  });
});

// ===== Reveal on scroll =====
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

// ===== Foco de luz que sigue al cursor dentro de cada card =====
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});

// ===== Trayectoria: filtros por tipo =====
(() => {
  const filters = document.querySelectorAll(".filter");
  const rows = document.querySelectorAll(".row");
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.toggle("is-active", b === btn));
      const kind = btn.dataset.filter;
      rows.forEach((row) => {
        const show = kind === "all" || row.dataset.kind === kind;
        row.classList.toggle("is-hidden", !show);
        if (show) row.classList.add("in");
      });
    });
  });
})();

// ============================================================
// Vista previa en vivo: la web se pinta a 1440x900 dentro de
// un iframe y se encoge hasta caber en el diálogo. No se carga
// nada externo hasta que alguien pulsa "Vista previa".
// ============================================================
(() => {
  const FRAME_W = 1440;
  const FRAME_H = 900;
  const dialog = document.getElementById("preview");
  const view = document.getElementById("preview-view");
  const urlEl = document.getElementById("preview-url");
  let frame = null;

  const fit = () => {
    if (frame) frame.style.transform = `scale(${view.clientWidth / FRAME_W})`;
  };

  document.querySelectorAll("[data-preview]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const url = btn.dataset.preview;
      urlEl.href = url;
      urlEl.textContent = url.replace("https://", "") + " ↗";
      view.innerHTML = "";
      frame = document.createElement("iframe");
      frame.width = FRAME_W;
      frame.height = FRAME_H;
      frame.style.width = FRAME_W + "px";
      frame.style.height = FRAME_H + "px";
      frame.setAttribute("referrerpolicy", "no-referrer");
      frame.src = url;
      view.appendChild(frame);
      dialog.showModal();
      fit();
    });
  });

  const close = () => { dialog.close(); view.innerHTML = ""; frame = null; };
  dialog.querySelector(".preview__close").addEventListener("click", close);
  dialog.addEventListener("click", (e) => { if (e.target === dialog) close(); });
  window.addEventListener("resize", fit);
})();

// ============================================================
// Fondo interactivo: malla de puntos con física de muelle.
// - El cursor (o el dedo) aparta los puntos y los ilumina.
// - Un clic/toque en cualquier hueco lanza una onda expansiva.
// - Sin interacción, una ola lenta recorre la malla.
// ============================================================
(() => {
  const canvas = document.getElementById("field");
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const GAP = 30;          // separación de la malla (px CSS)
  const RADIUS = 160;      // alcance del cursor
  const FORCE = 26;        // cuánto empuja el cursor
  let W, H, dpr, pts = [];

  const pointer = { x: -9999, y: -9999, active: false };
  const waves = [];        // ondas de clic: {x, y, r, life}

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pts = [];
    const cols = Math.ceil(W / GAP) + 1;
    const rows = Math.ceil(H / GAP) + 1;
    const ox = (W - (cols - 1) * GAP) / 2;
    const oy = (H - (rows - 1) * GAP) / 2;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const x = ox + i * GAP, y = oy + j * GAP;
        pts.push({ bx: x, by: y, x, y, vx: 0, vy: 0 });
      }
    }
  }
  build();
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(build, 120); });

  const move = (x, y) => { pointer.x = x; pointer.y = y; pointer.active = true; };
  window.addEventListener("pointermove", (e) => move(e.clientX, e.clientY), { passive: true });
  window.addEventListener("touchmove", (e) => {
    const t = e.touches[0]; if (t) move(t.clientX, t.clientY);
  }, { passive: true });
  document.addEventListener("pointerleave", () => { pointer.active = false; });
  window.addEventListener("touchend", () => { pointer.active = false; });

  // Onda al hacer clic en un hueco (no en botones, enlaces o cards)
  window.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a, button, .card, .filter, .row, dialog, .nav")) return;
    waves.push({ x: e.clientX, y: e.clientY, r: 0, life: 1 });
    if (waves.length > 6) waves.shift();
  });

  let t = 0;
  function frame() {
    t += 0.012;
    ctx.clearRect(0, 0, W, H);

    waves.forEach((w) => { w.r += 9; w.life -= 0.012; });
    while (waves.length && waves[0].life <= 0) waves.shift();

    for (const p of pts) {
      let fx = 0, fy = 0, glow = 0;

      // Cursor: repulsión suave
      if (pointer.active) {
        const dx = p.x - pointer.x, dy = p.y - pointer.y;
        const d = Math.hypot(dx, dy);
        if (d < RADIUS && d > 0.01) {
          const k = 1 - d / RADIUS;
          const s = k * k * FORCE;
          fx += (dx / d) * s * 0.12; fy += (dy / d) * s * 0.12;
          glow = Math.max(glow, k);
        }
      }

      // Ondas de clic: anillo que empuja hacia fuera
      for (const w of waves) {
        const dx = p.bx - w.x, dy = p.by - w.y;
        const d = Math.hypot(dx, dy) || 1;
        const band = 1 - Math.abs(d - w.r) / 60;
        if (band > 0) {
          const s = band * w.life * 6;
          fx += (dx / d) * s; fy += (dy / d) * s;
          glow = Math.max(glow, band * w.life);
        }
      }

      // Ola de fondo cuando no hay nada más
      const idle = Math.sin(p.bx * 0.008 + p.by * 0.006 + t * 1.4) * 0.5 + 0.5;

      // Muelle de vuelta a su sitio + rozamiento
      p.vx += fx + (p.bx - p.x) * 0.06;
      p.vy += fy + (p.by - p.y) * 0.06;
      p.vx *= 0.82; p.vy *= 0.82;
      p.x += p.vx; p.y += p.vy;

      const disp = Math.min(1, Math.hypot(p.x - p.bx, p.y - p.by) / 30);
      const g = Math.max(glow, disp);
      const size = 1 + idle * 0.5 + g * 2.2;
      const alpha = 0.1 + idle * 0.1 + g * 0.8;

      ctx.fillStyle = g > 0.05
        ? `rgba(${Math.round(120 - g * 120)}, ${Math.round(190 - g * 25)}, ${Math.round(210 + g * 7)}, ${alpha})`
        : `rgba(150, 175, 185, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Halo suave bajo el cursor
    if (pointer.active) {
      const grad = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, RADIUS * 1.6);
      grad.addColorStop(0, "rgba(0, 165, 207, 0.10)");
      grad.addColorStop(1, "rgba(0, 165, 207, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(pointer.x - RADIUS * 1.6, pointer.y - RADIUS * 1.6, RADIUS * 3.2, RADIUS * 3.2);
    }

    if (!reduced) requestAnimationFrame(frame);
  }
  frame();
})();

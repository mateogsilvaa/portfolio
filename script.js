// ===== Un logo que falte no deja el icono de imagen rota =====
document.querySelectorAll("img.item__icon").forEach((img) => {
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
// Vista previa en vivo: una ventana flotante como la de un
// escritorio. Se arrastra por la barra, se redimensiona por la
// esquina y la web dentro (pintada a 1440x900) se escala sola.
// No se carga nada externo hasta pulsar "Vista previa".
// ============================================================
(() => {
  const FRAME_W = 1440;
  const FRAME_H = 900;
  const win = document.getElementById("preview");
  const bar = win.querySelector(".preview__bar");
  const view = document.getElementById("preview-view");
  const urlEl = document.getElementById("preview-url");
  let frame = null;

  const fit = () => {
    if (frame) frame.style.transform = `scale(${view.clientWidth / FRAME_W})`;
  };
  new ResizeObserver(fit).observe(view);

  // Mantiene la ventana dentro de la pantalla
  const place = (x, y) => {
    const r = win.getBoundingClientRect();
    x = Math.min(Math.max(x, 8 - r.width + 80), innerWidth - 80);
    y = Math.min(Math.max(y, 8), innerHeight - 40);
    win.style.left = x + "px";
    win.style.top = y + "px";
  };

  document.querySelectorAll("[data-preview]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const url = btn.dataset.preview;
      urlEl.href = url;
      urlEl.textContent = url.replace("https://", "");
      view.innerHTML = "";
      frame = document.createElement("iframe");
      frame.width = FRAME_W;
      frame.height = FRAME_H;
      frame.style.width = FRAME_W + "px";
      frame.style.height = FRAME_H + "px";
      frame.setAttribute("referrerpolicy", "no-referrer");
      frame.src = url;
      view.appendChild(frame);
      const wasHidden = win.hidden;
      win.hidden = false;
      if (wasHidden) {
        const r = win.getBoundingClientRect();
        place((innerWidth - r.width) / 2, Math.max(70, (innerHeight - r.height) / 2));
      }
      fit();
    });
  });

  // Arrastre por la barra (ratón y dedo)
  bar.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a, button")) return;
    const r = win.getBoundingClientRect();
    const dx = e.clientX - r.left, dy = e.clientY - r.top;
    win.classList.add("is-dragging");
    bar.setPointerCapture(e.pointerId);
    const move = (ev) => place(ev.clientX - dx, ev.clientY - dy);
    const up = () => {
      win.classList.remove("is-dragging");
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerup", up);
    };
    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", up);
  });

  const close = () => { win.hidden = true; view.innerHTML = ""; frame = null; };
  win.querySelector(".preview__close").addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !win.hidden) close(); });
})();

// ============================================================
// Fondo: una cuadrícula de plano casi invisible. Una luz suave
// la revela allí donde está el cursor (con inercia) y los
// cruces cercanos se encienden. Sin cursor, la luz deriva sola.
// ============================================================
(() => {
  const canvas = document.getElementById("field");
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const GAP = 44;
  const RADIUS = 260;
  let W, H, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const target = { x: innerWidth * 0.7, y: innerHeight * 0.4 };
  const light = { ...target };
  let lastMove = -1e9;

  const move = (x, y) => { target.x = x; target.y = y; lastMove = performance.now(); };
  window.addEventListener("pointermove", (e) => move(e.clientX, e.clientY), { passive: true });

  let t = 0;
  function frame(now = 0) {
    t += 0.004;

    // Sin cursor durante un rato: la luz pasea despacio
    if (now - lastMove > 3000) {
      target.x = W * (0.5 + 0.3 * Math.sin(t * 0.9));
      target.y = H * (0.45 + 0.25 * Math.sin(t * 1.3 + 1));
    }
    light.x += (target.x - light.x) * 0.06;
    light.y += (target.y - light.y) * 0.06;

    ctx.clearRect(0, 0, W, H);

    // La cuadrícula se mueve un poco con el scroll (parallax)
    const oy = -(scrollY * 0.15) % GAP;

    const grad = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, RADIUS);
    grad.addColorStop(0, "rgba(0, 165, 207, 0.22)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0.025)");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = (W % GAP) / 2; x <= W; x += GAP) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); }
    for (let y = oy; y <= H; y += GAP) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
    ctx.stroke();

    // Cruces cercanos a la luz
    for (let x = (W % GAP) / 2; x <= W; x += GAP) {
      if (Math.abs(x - light.x) > RADIUS) continue;
      for (let y = oy; y <= H; y += GAP) {
        const d = Math.hypot(x - light.x, y - light.y);
        if (d > RADIUS) continue;
        const k = 1 - d / RADIUS;
        ctx.fillStyle = `rgba(0, 165, 207, ${k * 0.7})`;
        ctx.fillRect(x - 1, y - 1, 2 + k, 2 + k);
      }
    }

    if (!reduced) requestAnimationFrame(frame);
  }
  frame();
})();

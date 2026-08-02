// ===== Un logo que falte no deja el icono de imagen rota =====
document.querySelectorAll(".proj__logo").forEach((img) => {
  img.addEventListener("error", () => img.remove());
});

// ===== Loader + animación del hero =====
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  setTimeout(() => {
    loader.classList.add("is-done");
    document.querySelectorAll("[data-line]").forEach((el, i) => {
      setTimeout(() => el.classList.add("in"), 150 + i * 140);
    });
  }, 650);
});

// ===== Primer scroll: se retira la pista y se descubre la web =====
window.addEventListener(
  "scroll",
  () => { if (window.scrollY > 30) document.body.classList.add("scrolled"); },
  { passive: true }
);

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
  { threshold: 0.15 }
);

document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

// ============================================================
// Preview en vivo: al pasar por encima de un proyecto se
// despliega una pantalla con la web tal y como está ahora.
// El iframe se crea en el primer hover (no al cargar) y se
// escala para que quepa entero dentro del marco.
// ============================================================
(() => {
  // El puntero fino es el que puede "pasar por encima"; en táctil
  // el hover no existe y el iframe solo estorbaría.
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const FRAME_W = 1440; // ancho de escritorio que simulamos
  const FRAME_H = 1080;
  const OPEN_DELAY = 260; // ms de gracia: pasar de largo no carga nada

  document.querySelectorAll("[data-preview]").forEach((row) => {
    const url = row.dataset.preview;

    const screen = document.createElement("div");
    screen.className = "proj__screen";
    screen.innerHTML = `
      <div class="proj__screen-bar">
        <span class="proj__screen-dot"></span>
        <span class="proj__screen-dot"></span>
        <span class="proj__screen-dot"></span>
        <span class="proj__screen-url mono">${url}</span>
      </div>
      <div class="proj__screen-view"><div class="proj__screen-load mono">cargando…</div></div>`;
    row.appendChild(screen);

    const view = screen.querySelector(".proj__screen-view");
    let frame = null;
    let openTimer;

    // El iframe se dibuja a tamaño de escritorio y se encoge hasta
    // el ancho del marco; la altura la recorta el marco, así que se
    // ve la parte de arriba de la web como en un monitor pequeño.
    function fit() {
      if (!frame) return;
      frame.style.transform = `scale(${view.clientWidth / FRAME_W})`;
    }

    function load() {
      if (frame) return;
      frame = document.createElement("iframe");
      frame.className = "proj__screen-frame";
      frame.setAttribute("loading", "lazy");
      frame.setAttribute("tabindex", "-1");
      frame.setAttribute("aria-hidden", "true");
      frame.setAttribute("scrolling", "no");
      frame.setAttribute("referrerpolicy", "no-referrer");
      frame.width = FRAME_W;
      frame.height = FRAME_H;
      frame.addEventListener("load", () => screen.classList.add("is-ready"));
      frame.src = url;
      view.appendChild(frame);
      fit();
      window.addEventListener("resize", fit);
    }

    row.addEventListener("mouseenter", () => {
      openTimer = setTimeout(load, OPEN_DELAY);
      fit();
    });
    row.addEventListener("mouseleave", () => clearTimeout(openTimer));
  });
})();

// ============================================================
// Fondo interactivo: olas de mar muy sutiles. El cursor (con
// mucha inercia) hincha suavemente la superficie cercana.
// ============================================================
(() => {
  const canvas = document.getElementById("sea");
  if (!canvas) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  const ctx = canvas.getContext("2d");
  let w, h, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
  }
  resize();
  window.addEventListener("resize", resize);

  let tx = innerWidth * 0.7;
  let ty = innerHeight * 0.35;
  let x = tx, y = ty;

  if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("mousemove", (e) => {
      tx = e.clientX;
      ty = e.clientY;
    }, { passive: true });
  }

  const WAVES = [
    { base: 0.30, amp: 26, freq: 0.0035, speed: 0.6, alpha: 0.020 },
    { base: 0.55, amp: 34, freq: 0.0026, speed: 0.42, alpha: 0.026 },
    { base: 0.78, amp: 22, freq: 0.0042, speed: 0.8, alpha: 0.018 },
  ];

  let t = 0;

  // Altura de la superficie de una ola en un punto (px en canvas)
  function surfaceY(wv, i, px) {
    const baseY = h * wv.base + Math.sin(t * wv.speed + i * 2) * 18 * dpr;
    return (
      baseY +
      Math.sin(px * wv.freq / dpr + t * (1.5 + i * 0.4)) * wv.amp * dpr +
      Math.sin(px * wv.freq * 0.5 / dpr - t) * wv.amp * 0.5 * dpr
    );
  }

  function draw() {
    t += 0.0028;

    x += (tx - x) * 0.012;
    y += (ty - y) * 0.012;

    ctx.clearRect(0, 0, w, h);

    const mx = x * dpr;
    const my = y * dpr;
    const REACH = Math.min(w, h) * 0.45;
    const LIFT = 42 * dpr;

    WAVES.forEach((wv, i) => {
      ctx.beginPath();
      ctx.moveTo(0, h);
      const baseY = h * wv.base + Math.sin(t * wv.speed + i * 2) * 18 * dpr;
      const vClose = Math.max(0, 1 - Math.abs(baseY - my) / (h * 0.45));

      for (let px = 0; px <= w; px += 8 * dpr) {
        const dx = Math.abs(px - mx);
        let swell = 0;
        if (dx < REACH && vClose > 0) {
          const k = 1 - dx / REACH;
          const ease = k * k * (3 - 2 * k);
          swell = ease * vClose * LIFT;
        }
        ctx.lineTo(px, surfaceY(wv, i, px) - swell);
      }
      ctx.lineTo(w, h);
      ctx.closePath();

      const glow = wv.alpha * (1 + vClose * 0.5);
      const grad = ctx.createLinearGradient(0, baseY - 60 * dpr, 0, baseY + h * 0.3);
      grad.addColorStop(0, `rgba(0, 165, 207, ${Math.min(glow, 0.14)})`);
      grad.addColorStop(1, "rgba(0, 165, 207, 0)");
      ctx.fillStyle = grad;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

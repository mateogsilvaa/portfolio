// ===== Nombre: se parte en letras para que suban una a una =====
(() => {
  const h1 = document.querySelector("[data-split]");
  h1.setAttribute("aria-label", h1.textContent);
  let i = 0;
  [...h1.childNodes].forEach((node) => {
    if (node.nodeType !== 3) return;
    const frag = document.createDocumentFragment();
    [...node.textContent].forEach((c) => {
      const ch = document.createElement("span");
      ch.className = "ch";
      ch.setAttribute("aria-hidden", "true");
      ch.innerHTML = `<i style="--i:${i++}">${c}</i>`;
      frag.appendChild(ch);
    });
    node.replaceWith(frag);
  });
})();

// ===== Entrada al hacer scroll, escalonada dentro de cada lista =====
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);
document.querySelectorAll("[data-reveal]").forEach((el) => {
  const pos = [...el.parentElement.children].indexOf(el);
  el.style.setProperty("--d", `${pos * 70}ms`);
  io.observe(el);
});

// ===== Contador: el scroll son los 400 m de la vuelta =====
(() => {
  const out = document.getElementById("meter");
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const m = max > 0 ? Math.round((scrollY / max) * 400) : 0;
    out.textContent = String(Math.min(m, 400)).padStart(3, "0");
  };
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
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

  const close = () => {
    win.classList.add("is-closing");
    setTimeout(() => {
      win.classList.remove("is-closing");
      win.hidden = true;
      view.innerHTML = "";
      frame = null;
    }, 180);
  };
  win.querySelector(".preview__close").addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !win.hidden) close(); });
})();

// ============================================================
// Fondo: calles de pista. Líneas finas que avanzan con el scroll
// y ceden con inercia al paso del cursor.
// ============================================================
(() => {
  const canvas = document.getElementById("track");
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const STEP = 14;
  const REACH = 170;
  const PUSH = 34;
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

  const target = { x: -999, y: -999 };
  const hand = { x: -999, y: -999 };
  window.addEventListener("pointermove", (e) => { target.x = e.clientX; target.y = e.clientY; }, { passive: true });

  let t = 0;
  let smooth = scrollY;
  function frame() {
    t += 0.002;
    smooth += (scrollY - smooth) * 0.08;
    hand.x += (target.x - hand.x) * 0.1;
    hand.y += (target.y - hand.y) * 0.1;
    ctx.clearRect(0, 0, W, H);

    const gap = 120;
    const off = (smooth * 0.2) % gap;
    ctx.strokeStyle = "rgba(255, 248, 239, 0.13)";
    ctx.lineWidth = 1;

    for (let base = -gap * 3; base < H + gap * 3; base += gap) {
      ctx.beginPath();
      for (let x = -STEP; x <= W + STEP; x += STEP) {
        const u = x / W;
        let y = base - off + Math.sin(u * 2.2 + t) * 70 - u * u * 90;
        const d = Math.hypot(x - hand.x, y - hand.y);
        if (d < REACH) {
          const k = 1 - d / REACH;
          y += (y >= hand.y ? 1 : -1) * k * k * PUSH;
        }
        if (x === -STEP) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    if (!reduced) requestAnimationFrame(frame);
  }
  frame();
})();

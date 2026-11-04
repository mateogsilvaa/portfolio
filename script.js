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
// Ventanas tipo macOS. Se mueven por la barra, se redimensionan
// por cualquier borde o esquina, doble clic o botón verde para
// maximizar, y nacen y vuelven a la fila que las abrió.
// ============================================================
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const MIN_W = 280;
const MIN_H = 180;
let topZ = 50;

function makeWindow(el) {
  const bar = el.querySelector(".win__bar");
  let saved = null;

  const box = () => el.getBoundingClientRect();
  const set = (x, y, w, h) => {
    el.style.left = x + "px"; el.style.top = y + "px";
    el.style.width = w + "px"; el.style.height = h + "px";
  };
  const focus = () => {
    el.style.zIndex = ++topZ;
    document.querySelectorAll(".win").forEach((w) => w.classList.toggle("is-front", w === el));
  };

  // Arrastre genérico: mover o redimensionar según quien lo empiece
  const track = (handle, e, onMove) => {
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    el.classList.add("is-busy");
    const end = () => {
      el.classList.remove("is-busy");
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", end);
      handle.removeEventListener("pointercancel", end);
    };
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  };

  bar.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a, button")) return;
    const r = box();
    const dx = e.clientX - r.left, dy = e.clientY - r.top;
    track(bar, e, (ev) => {
      // Siempre queda un trozo de barra a mano
      const x = Math.min(Math.max(ev.clientX - dx, 100 - r.width), innerWidth - 100);
      const y = Math.min(Math.max(ev.clientY - dy, 0), innerHeight - 40);
      el.style.left = x + "px"; el.style.top = y + "px";
    });
  });

  ["n", "s", "e", "w", "nw", "ne", "sw", "se"].forEach((dir) => {
    const grip = document.createElement("span");
    grip.className = `grip grip--${dir}`;
    el.appendChild(grip);
    grip.addEventListener("pointerdown", (e) => {
      focus();
      const r = box();
      const sx = e.clientX, sy = e.clientY;
      track(grip, e, (ev) => {
        const dx = ev.clientX - sx, dy = ev.clientY - sy;
        let { left: x, top: y, width: w, height: h } = r;
        if (dir.includes("e")) w = Math.max(MIN_W, r.width + dx);
        if (dir.includes("s")) h = Math.max(MIN_H, r.height + dy);
        if (dir.includes("w")) { w = Math.max(MIN_W, r.width - dx); x = r.right - w; }
        if (dir.includes("n")) { h = Math.max(MIN_H, r.height - dy); y = r.bottom - h; }
        set(x, y, w, h);
      });
    });
  });

  const toggleMax = () => {
    el.classList.add("is-eased");
    if (saved) { set(...saved); saved = null; }
    else {
      const r = box();
      saved = [r.left, r.top, r.width, r.height];
      set(8, 8, innerWidth - 16, innerHeight - 16);
    }
    setTimeout(() => el.classList.remove("is-eased"), 340);
  };
  bar.addEventListener("dblclick", (e) => { if (!e.target.closest("a, button")) toggleMax(); });
  el.addEventListener("pointerdown", focus);

  // Transformación que lleva la ventana hasta el rectángulo de origen
  const fromRect = (src) => {
    const r = box();
    return `translate(${src.left - r.left}px, ${src.top - r.top}px) scale(${src.width / r.width}, ${src.height / r.height})`;
  };

  const api = {
    source: null,
    open(rect, src, delay = 0) {
      saved = null;
      el.hidden = false;
      set(...rect);
      api.source = src;
      if (REDUCED || !src) return;
      el.animate(
        [{ transformOrigin: "0 0", transform: fromRect(src), opacity: 0.2 },
         { transformOrigin: "0 0", transform: "none", opacity: 1 }],
        { duration: 460, delay, easing: "cubic-bezier(0.2, 0.9, 0.25, 1)", fill: "backwards" }
      );
    },
    close() {
      if (el.hidden) return;
      const done = () => { el.hidden = true; api.onclose?.(); };
      if (REDUCED || !api.source) return done();
      el.animate(
        [{ transformOrigin: "0 0", transform: "none", opacity: 1 },
         { transformOrigin: "0 0", transform: fromRect(api.source), opacity: 0 }],
        { duration: 300, easing: "cubic-bezier(0.5, 0, 0.8, 0.4)", fill: "forwards" }
      );
      // Con temporizador: en una pestaña oculta la animación no termina nunca
      setTimeout(() => { el.getAnimations().forEach((x) => x.cancel()); done(); }, 300);
    },
    focus,
  };
  el.querySelectorAll("[data-act=close]").forEach((b) => b.addEventListener("click", () => api.close()));
  el.querySelector("[data-act=max]").addEventListener("click", toggleMax);
  return api;
}

// ============================================================
// Proyectos: abrir uno saca la web en vivo y, detrás, la terminal
// que lo explica. La web no se carga hasta que alguien la pide.
// ============================================================
const PROJECTS = {
  ma: {
    url: "https://mundoatletismo.es", file: "mundo-atletismo.md",
    text: [
      ["h", "Mundo Atletismo"],
      ["d", "Todo el atletismo español, en un solo sitio."],
      ["", ""],
      ["k", "Qué es"],
      ["", "Una web pública con rankings top-200, Campeonato de España, récords, predictor de marcas e insights."],
      ["", ""],
      ["k", "Cómo está hecho"],
      ["", "· React + TypeScript + Vite, instalable como PWA"],
      ["", "· Firebase: Firestore, reglas de seguridad y Hosting"],
      ["", "· Varias apps sobre un proyecto, una por rama de git"],
      ["", "· resultados.mundoatletismo.es: resultados en directo y podios"],
      ["", "· Un push, un deploy, con GitHub Actions"],
      ["", ""],
      ["k", "Mi papel"],
      ["", "Cofundador. Web, contenidos y producto, en equipo."],
    ],
  },
  ld: {
    url: "https://lanedata.es", file: "lanedata.md", repo: "https://github.com/lanedata/lanedataweb",
    text: [
      ["h", "Lanedata"],
      ["d", "El atletismo español, contado con datos."],
      ["", ""],
      ["k", "Qué es"],
      ["", "Web editorial de análisis, estadísticas y contexto, con calendario, fichajes, archivo y calculadoras."],
      ["", ""],
      ["k", "Cómo está hecho"],
      ["", "· Next.js 15 + TypeScript + Tailwind CSS"],
      ["", "· Supabase: autenticación, base de datos y almacenamiento"],
      ["", "· Panel de administración propio para publicar artículos"],
      ["", "· Scrapers en Python para el calendario de competiciones"],
      ["", "· Despliegue automático con GitHub Actions"],
      ["", ""],
      ["k", "Mi papel"],
      ["", "Fundador."],
    ],
  },
  tf: {
    url: "https://tripfinder.es", file: "tripfinder.md", repo: "https://github.com/mateogsilvaa/tripfinder",
    text: [
      ["h", "Tripfinder"],
      ["d", "Acercando viajar a todos los bolsillos."],
      ["", ""],
      ["k", "Qué es"],
      ["", "Un buscador automático de chollos de vuelo que avisa por correo y, si una oferta interesa, busca alojamiento para esas fechas."],
      ["", ""],
      ["k", "Cómo funciona"],
      ["", "· Cada 12 h, GitHub Actions lanza el rastreo en Python"],
      ["", "· Puntúa cada precio contra su histórico para detectar chollos"],
      ["", "· Alojamiento bajo demanda: hoteles y Airbnb"],
      ["", "· Web en JavaScript, cuentas y encargos en Firebase"],
      ["", "· Tests con pytest y Playwright"],
      ["", ""],
      ["k", "Estado"],
      ["", "Abierto, aunque todavía no está orientado al público general."],
      ["", ""],
      ["k", "Mi papel"],
      ["", "Creador."],
    ],
  },
  fa: {
    file: "fantasy-atletismo.md",
    text: [
      ["h", "Fantasy Atletismo"],
      ["", ""],
      ["", "Lanzamiento previsto en diciembre."],
      ["d", "Todavía no se puede dar mucha información."],
    ],
  },
};

(() => {
  const FRAME_W = 1440;
  const web = makeWindow(document.getElementById("win-web"));
  const term = makeWindow(document.getElementById("win-term"));
  const view = document.getElementById("web-view");
  const urlEl = document.getElementById("web-url");
  const out = document.getElementById("term-out");
  const title = document.getElementById("term-title");
  let frame = null;
  let run = 0;

  // La web se pinta a ancho de escritorio y se encoge; al estirar
  // la ventana en alto se ve más página, como en un navegador real.
  const fit = () => {
    if (!frame) return;
    const k = view.clientWidth / FRAME_W;
    frame.style.transform = `scale(${k})`;
    frame.style.height = view.clientHeight / k + "px";
  };
  new ResizeObserver(fit).observe(view);
  web.onclose = () => { view.innerHTML = ""; frame = null; };
  term.onclose = () => { run++; };

  const wait = (ms) => new Promise((r) => setTimeout(r, REDUCED ? 0 : ms));

  async function type(p) {
    const id = ++run;
    out.textContent = "";
    title.textContent = `mateo — ${p.file}`;

    const cursor = document.createElement("span");
    cursor.className = "cur";
    out.appendChild(cursor);
    // Todo se inserta antes del cursor, que siempre queda al final
    const put = (node) => { out.insertBefore(node, cursor); out.scrollTop = out.scrollHeight; return node; };
    const span = (cls, text) => {
      const s = document.createElement("span");
      if (cls) s.className = cls;
      s.textContent = text;
      return put(s);
    };

    span("p", "mateo@portfolio ~ % ");
    const cmd = span("", "");
    await wait(620);
    for (const c of `cat ${p.file}`) {
      if (id !== run) return;
      cmd.textContent += c;
      await wait(26);
    }
    await wait(220);
    span("", "\n\n");
    for (const [cls, line] of p.text) {
      if (id !== run) return;
      span(cls, line + "\n");
      await wait(line ? 55 : 20);
    }
    if (id !== run) return;
    if (p.repo) {
      const a = document.createElement("a");
      a.href = p.repo; a.target = "_blank"; a.rel = "noopener";
      a.textContent = p.repo.replace("https://", "");
      span("", "\n");
      put(a);
      span("", "\n");
    }
    span("", "\n");
    span("p", "mateo@portfolio ~ % ");
  }

  // Colocación inicial: terminal asomando por detrás de la web
  function layout(hasWeb) {
    const W = innerWidth, H = innerHeight;
    if (W < 760) {
      const w = W - 16;
      const webH = Math.round(w * 0.625) + 40;
      return hasWeb
        ? { web: [8, 8, w, webH], term: [8, webH + 16, w, Math.max(MIN_H, H - webH - 24)] }
        : { term: [8, 60, w, Math.min(320, H - 120)] };
    }
    const w = Math.min(920, W * 0.6);
    const h = Math.min(Math.round(w * 0.625) + 40, H - 120);
    const x = Math.round((W - w) / 2 + W * 0.09);
    const y = Math.round((H - h) / 2 - 16);
    const tw = Math.min(560, W * 0.42);
    const th = Math.min(H - y - 72, 600);
    return hasWeb
      ? { web: [x, y, w, h], term: [Math.max(16, x - tw * 0.72), y + 56, tw, th] }
      : { term: [Math.round((W - tw) / 2), Math.round((H - 320) / 2), tw, 320] };
  }

  document.querySelectorAll("[data-project]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = PROJECTS[btn.dataset.project];
      const src = btn.getBoundingClientRect();
      const pos = layout(Boolean(p.url));

      term.open(pos.term, src, p.url ? 110 : 0);
      type(p);

      if (!p.url) {
        web.close();
        term.focus();
        return;
      }
      urlEl.href = p.url;
      urlEl.textContent = p.url.replace("https://", "");
      view.innerHTML = "";
      frame = document.createElement("iframe");
      frame.width = FRAME_W;
      frame.style.width = FRAME_W + "px";
      frame.setAttribute("referrerpolicy", "no-referrer");
      frame.src = p.url;
      view.appendChild(frame);
      web.open(pos.web, src);
      web.focus();
      fit();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { web.close(); term.close(); }
  });
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

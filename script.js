// ===== Proyecto X: la letra glitchea de vez en cuando =====
(() => {
  const el = document.getElementById("glitch-x");
  if (!el) return;
  const GLYPHS = "X#%&?ØΔ$@";
  setInterval(() => {
    let i = 0;
    const spin = setInterval(() => {
      el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      if (++i > 5) {
        clearInterval(spin);
        el.textContent = "X";
      }
    }, 70);
  }, 3800);
})();

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
// Escamas triangulares sobre las filas de proyecto.
// data-scales="r,g,b" define el color del brillo de cada marca.
// ============================================================
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const COLS = 22;
  const ROWS = 4;
  const VW = 220;
  const VH = 40;
  const tw = VW / COLS;
  const th = VH / ROWS;

  document.querySelectorAll("[data-scales]").forEach((el) => {
    const rgb = el.dataset.scales || "0,165,207";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${VW} ${VH}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.classList.add("proj__scales");

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = c * tw;
        const y = r * th;
        const tris = [
          `${x},${y} ${x + tw},${y} ${x},${y + th}`,
          `${x + tw},${y} ${x + tw},${y + th} ${x},${y + th}`,
        ];
        tris.forEach((points, k) => {
          const p = document.createElementNS(NS, "polygon");
          p.setAttribute("points", points);
          p.setAttribute("fill", `rgb(${rgb})`);
          const delay = (c + r) * 0.07 + k * 0.04 + Math.random() * 0.3;
          p.style.animationDelay = `${delay}s`;
          svg.appendChild(p);
        });
      }
    }
    el.appendChild(svg);
  });
})();

// ============================================================
// Proyecto oculto: hileras de caracteres en cascada que se
// desvanecen alrededor del ojo de "contenido oculto".
// ============================================================
(() => {
  const canvas = document.querySelector(".proj__rain");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const CHARS = "アイウエオ01<>{}[]#$%&*+=/\\|~^?!";
  let cols = [];
  let fontSize = 12;
  let w, h, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    w = canvas.width = rect.width * dpr;
    h = canvas.height = rect.height * dpr;
    fontSize = Math.max(10, rect.height / 6) * dpr;
    const n = Math.floor(w / fontSize);
    cols = Array.from({ length: n }, () => ({
      y: Math.random() * -h * 2,
      speed: (0.35 + Math.random() * 0.7) * dpr,
    }));
  }
  resize();
  window.addEventListener("resize", resize);

  function draw() {
    ctx.fillStyle = "rgba(11, 14, 16, 0.14)";
    ctx.fillRect(0, 0, w, h);

    ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

    // El ojo vive a la izquierda: los caracteres se desvanecen allí
    const eyeX = 44 * dpr;
    const clearR = 46 * dpr;

    cols.forEach((col, i) => {
      const x = i * fontSize;
      const ch = CHARS[Math.floor(Math.random() * CHARS.length)];

      const dist = Math.hypot(x - eyeX, col.y - h / 2);
      const fade = Math.min(1, Math.max(0, (dist - clearR) / (clearR * 0.8)));
      const alpha = 0.15 * fade;

      if (alpha > 0.01) {
        ctx.fillStyle = `rgba(0, 165, 207, ${alpha})`;
        ctx.fillText(ch, x, col.y);
      }

      col.y += col.speed;
      if (col.y > h + fontSize * 3) {
        col.y = Math.random() * -h;
        col.speed = (0.35 + Math.random() * 0.7) * dpr;
      }
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

// ============================================================
// Fondo interactivo: olas de mar muy sutiles. El cursor (con
// mucha inercia) hincha suavemente la superficie cercana.
// El color se lee cada frame para respetar el modo lando.
// ============================================================
(() => {
  const canvas = document.getElementById("sea");
  if (!canvas) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  const ctx = canvas.getContext("2d");
  const tideCanvas = document.getElementById("tide");
  const tctx = tideCanvas.getContext("2d");
  let w, h, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = tideCanvas.width = innerWidth * dpr;
    h = canvas.height = tideCanvas.height = innerHeight * dpr;
    [canvas, tideCanvas].forEach((c) => {
      c.style.width = innerWidth + "px";
      c.style.height = innerHeight + "px";
    });
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

  // Estado de tormenta (el easter egg lo controla desde fuera)
  const sea = (window.__sea = {
    stormTarget: 0,
    storm: 0,
    // Ola de primer plano: {t0, dur} cuando está activa
    tide: null,
    // Posición del frente de la ola en px CSS (para sincronizar el barrido)
    tideFrontX(now) {
      if (!this.tide) return -Infinity;
      const p = (now - this.tide.t0) / this.tide.dur;
      return (-0.3 + p * 1.75) * innerWidth;
    },
  });

  const WAVES = [
    { base: 0.30, amp: 26, freq: 0.0035, speed: 0.6, alpha: 0.020 },
    { base: 0.55, amp: 34, freq: 0.0026, speed: 0.42, alpha: 0.026 },
    { base: 0.78, amp: 22, freq: 0.0042, speed: 0.8, alpha: 0.018 },
  ];

  let t = 0;

  // Altura de la superficie de una ola en un punto (px en canvas)
  function surfaceY(wv, i, px, ampMul) {
    const baseY = h * wv.base + Math.sin(t * wv.speed + i * 2) * 18 * dpr;
    return (
      baseY +
      Math.sin(px * wv.freq / dpr + t * (1.5 + i * 0.4)) * wv.amp * ampMul * dpr +
      Math.sin(px * wv.freq * 0.5 / dpr - t) * wv.amp * 0.5 * ampMul * dpr
    );
  }

  // Ola gigante de primer plano: una masa de agua con frente y
  // cola ondulados que cruza la pantalla de izquierda a derecha.
  function drawTide(now) {
    tctx.clearRect(0, 0, w, h);
    if (!sea.tide) return;

    const p = (now - sea.tide.t0) / sea.tide.dur;
    if (p > 1.3) {
      sea.tide = null;
      return;
    }

    const frontX = sea.tideFrontX(now) * dpr;
    const bandW = 0.55 * w;
    const STEP = 14 * dpr;

    const edge = (yy, phase, wob) =>
      Math.sin(yy * 0.006 / dpr + t * 9 + phase) * wob * dpr +
      Math.sin(yy * 0.0022 / dpr - t * 5 + phase * 2) * wob * 1.8 * dpr;

    tctx.beginPath();
    // Frente (arriba → abajo)
    for (let yy = 0; yy <= h + STEP; yy += STEP) {
      const xx = frontX + edge(yy, 0, 26);
      yy === 0 ? tctx.moveTo(xx, yy) : tctx.lineTo(xx, yy);
    }
    // Cola (abajo → arriba)
    for (let yy = h; yy >= -STEP; yy -= STEP) {
      tctx.lineTo(frontX - bandW + edge(yy, 4, 34), yy);
    }
    tctx.closePath();

    const grad = tctx.createLinearGradient(frontX - bandW, 0, frontX, 0);
    grad.addColorStop(0, "rgba(3, 20, 28, 0.55)");
    grad.addColorStop(0.55, "rgba(4, 34, 46, 0.9)");
    grad.addColorStop(1, "rgba(0, 120, 152, 0.95)");
    tctx.fillStyle = grad;
    tctx.fill();

    // Espuma del frente
    tctx.beginPath();
    for (let yy = 0; yy <= h + STEP; yy += STEP) {
      const xx = frontX + edge(yy, 0, 26);
      yy === 0 ? tctx.moveTo(xx, yy) : tctx.lineTo(xx, yy);
    }
    tctx.strokeStyle = "rgba(230, 248, 253, 0.75)";
    tctx.lineWidth = 3 * dpr;
    tctx.stroke();
    tctx.strokeStyle = "rgba(0, 165, 207, 0.5)";
    tctx.lineWidth = 9 * dpr;
    tctx.stroke();
  }

  function draw() {
    // La tormenta acelera el tiempo del mar
    sea.storm += (sea.stormTarget - sea.storm) * 0.015;
    t += 0.0028 * (1 + sea.storm * 2.2);

    x += (tx - x) * 0.012;
    y += (ty - y) * 0.012;

    ctx.clearRect(0, 0, w, h);

    const ampMul = 1 + sea.storm * 2.6;   // olas más grandes
    const alphaMul = 1 + sea.storm * 3.2; // y más visibles

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
        ctx.lineTo(px, surfaceY(wv, i, px, ampMul) - swell);
      }
      ctx.lineTo(w, h);
      ctx.closePath();

      const glow = wv.alpha * (1 + vClose * 0.5) * alphaMul;
      const grad = ctx.createLinearGradient(0, baseY - 60 * dpr, 0, baseY + h * 0.3);
      grad.addColorStop(0, `rgba(0, 165, 207, ${Math.min(glow, 0.14)})`);
      grad.addColorStop(1, "rgba(0, 165, 207, 0)");
      ctx.fillStyle = grad;
      ctx.fill();
    });

    // Ola de primer plano (easter egg)
    drawTide(performance.now());

    requestAnimationFrame(draw);
  }
  draw();
})();

// ============================================================
// 🥚 Easter egg: código Konami (↑↑↓↓←→←→BA, o con swipes y
// dos toques en móvil). Se desata una tormenta y una ola
// gigante cruza la pantalla arrasando lo que toca; cuando el
// mar se calma, la marea lo devuelve todo.
// ============================================================
(() => {
  const SEQ = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "b", "a",
  ];
  let pos = 0;
  let running = false;

  const toast = document.getElementById("egg-toast");
  const dark = document.getElementById("storm-dark");
  const lightning = document.getElementById("lightning");
  let toastTimer;

  function showToast(msg, ms = 3200) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), ms);
  }

  function flash() {
    lightning.classList.remove("flash");
    void lightning.offsetWidth; // reinicia la animación
    lightning.classList.add("flash");
  }

  const TIDE_DUR = 5200;

  function storm() {
    running = true;
    const sea = window.__sea;
    const cards = document.querySelectorAll(".proj, .cert, .xp__item, .link-card");

    // 1) Se avecina tormenta: el mar se embravece
    showToast("⛈️ SE AVECINA TORMENTA…");
    if (sea) sea.stormTarget = 1;
    dark.classList.add("on");
    setTimeout(flash, 900);
    setTimeout(flash, 1800);
    setTimeout(flash, 2700);

    // 2) Llega LA OLA: cruza la pantalla por delante del contenido
    //    y arrasa exactamente lo que va tocando su frente.
    setTimeout(() => {
      showToast("🌊 AHÍ VIENE");
      flash();
      if (sea) sea.tide = { t0: performance.now(), dur: TIDE_DUR };

      const pending = new Set(cards);
      cards.forEach((el) => {
        const rot = (Math.random() * 20 - 10).toFixed(1) + "deg";
        el.style.setProperty("--swept-rot", rot);
      });

      const deadline = performance.now() + TIDE_DUR * 1.4;
      (function sync() {
        const now = performance.now();
        const frontX = sea ? sea.tideFrontX(now) : Infinity;
        pending.forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.left + r.width * 0.4 < frontX) {
            el.classList.add("swept");
            pending.delete(el);
          }
        });
        if (pending.size > 0 && now < deadline) requestAnimationFrame(sync);
        else pending.forEach((el) => el.classList.add("swept"));
      })();
    }, 3000);

    // 3) La ola ya pasó y no queda nada. La tormenta sigue un
    //    rato más y amaina despacio.
    setTimeout(() => {
      if (sea) sea.stormTarget = 0;
      dark.classList.remove("on");
    }, 3000 + TIDE_DUR + 2800);

    // 4) Con el mar ya en calma, la marea lo devuelve todo.
    //    En silencio: no hace falta anunciarlo.
    setTimeout(() => {
      cards.forEach((el) => {
        setTimeout(() => el.classList.remove("swept"), Math.random() * 1800);
      });
    }, 3000 + TIDE_DUR + 6200);

    setTimeout(() => { running = false; }, 3000 + TIDE_DUR + 9500);
  }

  function feed(key) {
    pos = key === SEQ[pos] ? pos + 1 : key === SEQ[0] ? 1 : 0;
    if (pos === SEQ.length) {
      pos = 0;
      if (!running) storm();
    }
  }

  // Teclado (escritorio)
  window.addEventListener("keydown", (e) => {
    feed(e.key.length === 1 ? e.key.toLowerCase() : e.key);
  });

  // La pista vive donde solo miran los curiosos
  console.log(
    "%c🌊 el mar guarda secretos… ↑↑↓↓←→←→BA",
    "color:#00a5cf; font-family:monospace; font-size:13px;"
  );

  // Móvil: los swipes chocaban con el scroll, así que aquí el
  // secreto se despierta tocando "el mar" tres veces seguidas.
  (() => {
    const seaText = document.querySelector(".footer__sea");
    if (!seaText) return;
    let taps = 0;
    let last = 0;
    seaText.addEventListener("click", () => {
      const now = Date.now();
      taps = now - last < 800 ? taps + 1 : 1;
      last = now;
      if (taps >= 3) {
        taps = 0;
        if (!running) storm();
      }
    });
  })();
})();

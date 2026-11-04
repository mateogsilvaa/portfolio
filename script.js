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

// ============================================================
// Enanos: la portada aún se está montando. Uno empuja el apellido,
// otro baja el acento de González con una grúa y otro empuja la
// carrera. Te ven, se quedan helados, acaban a toda prisa, saludan
// y se van. Uno pierde el gorro y vuelve a por él.
// ============================================================
(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (scrollY > innerHeight / 2) return;

  const stage = document.querySelector(".start");
  const h1 = stage.querySelector("h1");
  const career = stage.querySelector(".start__text");
  const chars = [...h1.querySelectorAll(".ch")];
  const silva = chars.slice(-5);
  const accented = chars.find((c) => c.textContent === "á");
  const after = chars[chars.indexOf(accented) + 2]; // la "e", donde se apoya la grúa
  const zed = chars[chars.indexOf(accented) + 3];
  accented.firstChild.textContent = "a";

  // Marca invisible para saber dónde está la línea base del texto
  const probe = document.createElement("span");
  probe.style.cssText = "display:inline-block;width:0;height:0";
  accented.appendChild(probe);

  const canvas = document.createElement("canvas");
  canvas.className = "crew";
  canvas.setAttribute("aria-hidden", "true");
  stage.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const FG = "#fff8ef";
  const INK = "#0b1426";
  let W = 0, H = 0, fs, size, ground, base, xh, top, aLeft, aMid, craneX, zMid, zRight, rowTop;
  let sRight, tEdge, tFloor, dir, sShift, tShift;
  let pS = 0, pT = 0, pA = 0, mast = 0;

  const measure = () => {
    const box = stage.getBoundingClientRect();
    const rel = (el) => {
      const r = el.getBoundingClientRect();
      return { l: r.left - box.left, r: r.right - box.left, t: r.top - box.top, b: r.bottom - box.top };
    };
    fs = parseFloat(getComputedStyle(h1).fontSize);
    size = Math.min(Math.max(fs * 0.34, 38), 72);
    ctx.font = `${fs}px Anton, Impact, sans-serif`;
    const m = ctx.measureText("a");
    xh = m.actualBoundingBoxAscent;
    top = ctx.measureText("á").actualBoundingBoxAscent;

    const a = rel(accented), e = rel(after), z = rel(zed);
    base = rel(probe).b;
    aLeft = a.l; aMid = (a.l + a.r) / 2;
    craneX = (e.l + e.r) / 2;
    zMid = (z.l + z.r) / 2; zRight = z.r;
    rowTop = a.t;

    const row = getComputedStyle(stage).flexDirection === "row";
    dir = row ? 1 : -1; // en escritorio empuja hacia la derecha; en móvil, a la izquierda
    sShift = fs * 0.62;
    tShift = row ? Math.min(150, box.width * 0.15) : Math.min(46, box.width * 0.12);

    const last = rel(silva[4]);
    ground = last.b - fs * 0.07;
    sRight = last.r;

    const range = document.createRange();
    range.selectNodeContents(career);
    const t = range.getBoundingClientRect();
    tEdge = (dir > 0 ? t.left : t.right) - box.left;
    tFloor = t.bottom - box.top + 2;

    if (W === box.width && H === box.height) return;
    W = box.width; H = box.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const shove = () => {
    const off = sShift * (1 - pS);
    silva.forEach((l) => { l.style.translate = `${off}px 0`; });
    career.style.translate = `${-dir * tShift * (1 - pT)}px 0`;
  };
  measure();
  shove();
  measure();

  // ---------- Personajes ----------
  const dwarf = (x, face, coat, coatDark, hat, hatDark, floor) => ({
    x, y: 0, vy: 0, face, coat, coatDark, hat, hatDark, floor,
    tx: null, speed: 0, then: null, pose: "idle", step: 0, turn: 0, wantTurn: 0, lean: 0, shock: 0, hatOn: true,
  });
  const a = dwarf(0, -1, "#3f8f83", "#2f7168", "#e0614f", "#b84638", () => ground);
  const b = dwarf(0, -1, "#b9743c", "#94592b", "#3f6fb5", "#2e5490", () => (b.x < zRight + size * 0.1 ? base - xh : ground));
  const c = dwarf(0, 1, "#8a5aa8", "#6d4387", "#e8b04a", "#c28d31", () => tFloor);
  c.face = dir;
  const crew = [a, b, c];
  a.pose = c.pose = "push";
  b.pose = "lever";
  crew.forEach((d) => { d.y = d.floor(); });

  const glue = () => {
    if (a.tx === null && a.pose === "push") a.x = sRight + size * 0.36;
    if (c.tx === null && c.pose === "push") c.x = tEdge - dir * size * 0.36;
    if (b.tx === null && b.pose === "lever") b.x = zMid;
  };

  let eye = 0;
  window.addEventListener("pointermove", (e) => {
    eye = Math.max(-1, Math.min(1, (e.clientX - innerWidth / 2) / (innerWidth / 2)));
  }, { passive: true });

  const dust = [];
  const puff = (x, y, n = 8) => {
    for (let i = 0; i < n; i++) {
      dust.push({ x, y, vx: (Math.random() - 0.5) * 150, vy: -20 - Math.random() * 70, r: 2 + Math.random() * 4, life: 0.5, max: 0.5 });
    }
  };

  const bean = (x, y, rx, ry) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 7); ctx.fill(); };
  const limb = (x1, y1, x2, y2, w, color) => {
    ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  };

  const hatShape = (d, sway) => {
    ctx.fillStyle = d.hat;
    ctx.beginPath();
    ctx.moveTo(-19, -72);
    ctx.bezierCurveTo(-16, -96, -6, -112, -24 - sway, -118);
    ctx.bezierCurveTo(-2, -122, 16, -100, 20, -72);
    ctx.quadraticCurveTo(0, -80, -19, -72);
    ctx.fill();
    ctx.fillStyle = d.hatDark;
    ctx.beginPath();
    ctx.moveTo(-20, -72); ctx.quadraticCurveTo(0, -81, 21, -72);
    ctx.lineTo(21, -66); ctx.quadraticCurveTo(0, -75, -20, -66);
    ctx.fill();
  };

  const draw = (d) => {
    const u = size / 100;
    const moving = d.tx !== null || d.pose === "push";
    const swing = moving ? Math.sin(d.step) : 0;
    const fx = (1 - d.turn) * 6; // la cara gira de perfil a de frente

    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.scale(u * d.face, u);

    ctx.fillStyle = "rgba(4, 9, 20, 0.28)";
    bean(0, 1, 22, 3.5);

    ctx.rotate(d.lean);

    // Piernas y botas
    const leg = (x, s) => {
      const k = s * 7;
      limb(x, -24, x + k, -9, 9, "#26324a");
      ctx.fillStyle = "#5a3a26";
      ctx.beginPath(); ctx.roundRect(x + k - 6, -11 - Math.max(0, -k) * 0.3, 15, 11, 5); ctx.fill();
      ctx.fillStyle = "#2c1c13";
      ctx.fillRect(x + k - 6, -2 - Math.max(0, -k) * 0.3, 15, 2);
    };
    leg(-8, -swing); leg(6, swing);

    // Brazo de atrás
    let far = [18, -30], near = [18, -46];
    if (d.pose === "push") { far = [26, -46]; near = [26, -38]; }
    else if (d.pose === "lever") { far = [22, -38 + Math.sin(clock * 5) * 4]; near = [24, -34 + Math.sin(clock * 5) * 4]; }
    else if (d.pose === "wave") { far = [-14, -24]; near = [20, -72 + Math.sin(clock * 15) * 6]; }
    else if (d.tx !== null) { far = [14 * swing, -28]; near = [-14 * swing, -28]; }
    else if (d.shock > 0) { far = [-22, -60]; near = [22, -60]; }
    else { far = [-12, -24]; near = [12, -24]; }

    limb(-2, -48, far[0], far[1], 9, d.coatDark);
    ctx.fillStyle = "#efbd9b"; bean(far[0], far[1], 5, 5);

    // Túnica, sombra lateral y cinturón
    ctx.fillStyle = d.coat;
    ctx.beginPath();
    ctx.moveTo(-14, -54);
    ctx.bezierCurveTo(-23, -40, -22, -24, -17, -18);
    ctx.quadraticCurveTo(0, -13, 17, -18);
    ctx.bezierCurveTo(22, -24, 23, -40, 14, -54);
    ctx.closePath(); ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = d.coatDark; ctx.fillRect(-24, -56, 11, 44);
    ctx.fillStyle = "#3a2518"; ctx.fillRect(-24, -32, 48, 6);
    ctx.fillStyle = "#e8c15e"; ctx.fillRect(-4 + fx, -33, 9, 8);
    ctx.restore();

    // Cabeza
    ctx.fillStyle = "#f3c6a5"; bean(0, -62, 16, 15);
    ctx.fillStyle = "rgba(226, 118, 96, 0.55)"; bean(-7 + fx, -58, 4, 3); bean(9 + fx, -58, 4, 3);

    // Barba con mechones
    ctx.fillStyle = FG;
    ctx.beginPath();
    ctx.moveTo(-16, -60);
    ctx.bezierCurveTo(-20, -40, -8, -30, 1 + fx * 0.5, -22);
    ctx.bezierCurveTo(10, -30, 20, -40, 16, -60);
    ctx.quadraticCurveTo(10 + fx, -50, 1 + fx, -53);
    ctx.quadraticCurveTo(-8 + fx, -50, -16, -60);
    ctx.fill();
    ctx.strokeStyle = "#dccdb8"; ctx.lineWidth = 1.6; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-5 + fx * 0.6, -46); ctx.quadraticCurveTo(-5, -36, -1, -30);
    ctx.moveTo(6 + fx * 0.6, -46); ctx.quadraticCurveTo(7, -38, 3, -31);
    ctx.stroke();

    // Nariz, ojos y cejas
    ctx.fillStyle = "#e8a988"; bean(1 + fx * 1.5, -57, 6, 5);
    const look = d.turn * eye * d.face * 2.5;
    const big = d.shock > 0 ? 3.2 : 2.1;
    ctx.fillStyle = INK;
    bean(-5 + fx + look, -65, big * 0.85, big);
    bean(7 + fx + look, -65, big * 0.85, big);
    const brow = d.shock > 0 ? -6 : 0;
    limb(-9 + fx, -70 + brow, -2 + fx, -71 + brow, 2.6, FG);
    limb(4 + fx, -71 + brow, 11 + fx, -70 + brow, 2.6, FG);

    if (d.hatOn) hatShape(d, swing * 3 + Math.sin(clock * 2) * 1.5);
    else { ctx.fillStyle = "#f3c6a5"; bean(0, -72, 14, 8); }

    // Brazo de delante
    limb(3, -48, near[0], near[1], 9, d.coat);
    ctx.fillStyle = "#f3c6a5"; bean(near[0], near[1], 5.5, 5.5);
    ctx.restore();

    if (d.shock > 0) {
      ctx.fillStyle = "#ff6b5e";
      ctx.font = `${size * 0.5}px Anton, Impact, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("!", d.x, d.y - size * 1.3);
    }
  };

  const drawCrane = () => {
    if (mast <= 0) return;
    const steel = "#e8b04a", shade = "#b98530";
    const footY = base - xh;
    const peak = footY - (footY - (rowTop - size * 0.25)) * mast;
    const w = Math.max(size * 0.12, 6);

    // Mástil de celosía
    ctx.strokeStyle = steel; ctx.lineWidth = 1.6; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(craneX - w, footY); ctx.lineTo(craneX - w, peak);
    ctx.moveTo(craneX + w, footY); ctx.lineTo(craneX + w, peak);
    let side = -1;
    for (let y = footY; y > peak + w; y -= w * 1.6) {
      ctx.moveTo(craneX + side * w, y);
      ctx.lineTo(craneX - side * w, Math.max(peak, y - w * 1.6));
      side = -side;
    }
    ctx.stroke();

    ctx.fillStyle = shade; // base
    ctx.beginPath(); ctx.roundRect(craneX - w * 2, footY - w * 0.7, w * 4, w * 0.8, 2); ctx.fill();

    // Pluma hasta el acento y contrapeso detrás
    const tip = craneX + (aMid - craneX - w) * mast;
    const back = craneX + w * 4 * mast;
    ctx.strokeStyle = steel; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(tip, peak); ctx.lineTo(back, peak); ctx.stroke();
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(tip, peak); ctx.lineTo(craneX, peak - w * 2 * mast); ctx.lineTo(back, peak);
    ctx.stroke();
    ctx.fillStyle = "#3b4a68";
    ctx.beginPath(); ctx.roundRect(back - w * 1.6, peak, w * 1.8, w * 1.5, 2); ctx.fill();
    ctx.fillStyle = shade;
    ctx.beginPath(); ctx.roundRect(craneX - w * 1.1, peak - w * 0.1, w * 2.2, w * 1.5, 2); ctx.fill();

    if (pA >= 1) return;

    // Acento: es el del propio tipo de letra, recortado del glifo "á"
    const drop = (1 - pA) * (base - top - peak - size * 0.12);
    const sway = Math.sin(clock * 3.2) * size * 0.07 * (1 - pA);
    const hookY = base - top - drop;
    ctx.strokeStyle = "rgba(255, 248, 239, 0.75)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(tip, peak); ctx.lineTo(aMid + sway, hookY); ctx.stroke();

    ctx.save();
    ctx.translate(sway, -drop);
    ctx.beginPath();
    ctx.rect(aLeft - fs, base - top - 2, fs * 3, top - xh - fs * 0.015);
    ctx.clip();
    ctx.fillStyle = FG;
    ctx.font = `${fs}px Anton, Impact, sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText("á", aLeft, base);
    ctx.restore();
  };

  // ---------- Guion ----------
  const stopGo = (u) => u - Math.sin(u * Math.PI * 8) / (Math.PI * 8); // empuje a tirones
  const push = (t, start) => {
    if (t < start) return 0;
    if (t < 2.7) return 0.55 * stopGo((t - start) / (2.7 - start));
    if (t < 3.9) return 0.55;
    if (t < 4.5) return 0.55 + 0.45 * ((t - 3.9) / 0.6) ** 2;
    return 1;
  };
  const notice = (d) => { d.pose = "idle"; d.wantTurn = 1; d.lean = 0; d.shock = 0.8; d.vy = -190; };
  const back = (d, pose) => { d.pose = pose; d.wantTurn = 0; };
  const leave = (d) => {
    d.pose = "idle"; d.wantTurn = 0; d.then = null;
    d.tx = W + size * 2; d.speed = Math.max(W / 1.5, size * 11);
  };

  let hat = null;
  const story = [
    [2.7, () => notice(a)],
    [2.95, () => notice(c)],
    [3.15, () => notice(b)],
    [3.9, () => { back(a, "push"); back(b, "lever"); back(c, "push"); }],
    [4.5, () => {
      silva.forEach((l) => l.classList.add("done"));
      career.style.translate = "";
      puff(sRight, ground, 12);
      puff(tEdge, tFloor, 10);
      accented.firstChild.textContent = "á";
      accented.classList.add("done");
      puff(aMid, base - xh, 8);
      hat = { x: a.x + size * 0.1, y: ground - size * 0.8, vy: -240, vx: size * 1.6, spin: 0 };
      a.hatOn = false;
    }],
    [5.1, () => crew.forEach((d) => { d.pose = "wave"; d.wantTurn = 1; d.vy = -150; })],
    [5.95, () => leave(c)],
    [6.1, () => leave(a)],
    [6.6, () => leave(b)],
    [8.2, () => {
      a.tx = hat.x; a.speed = Math.max(W / 1.5, size * 11);
      a.then = () => {
        hat = null; a.hatOn = true; a.vy = -210;
        a.wantTurn = 1;
        setTimeout(() => leave(a), 330);
      };
    }],
  ];

  let clock = 0;
  let last = performance.now();
  let over = false;

  const finish = () => {
    if (over) return;
    over = true;
    accented.firstChild.textContent = "á";
    probe.remove();
    silva.forEach((l) => { l.style.translate = ""; });
    career.style.translate = "";
    canvas.remove();
    window.removeEventListener("resize", measure);
  };
  window.addEventListener("resize", measure);
  setTimeout(finish, 16000); // si la pestaña se queda dormida, nada se queda a medias

  const tick = (now) => {
    if (over) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    clock += dt;

    const before = [pS, pT];
    pS = push(clock, 1.1);
    pT = push(clock, 1.3);
    pA = push(clock, 1.5);
    mast = clock < 6.3 ? Math.min(1, Math.max(0, (clock - 0.5) / 0.7)) : Math.max(0, 1 - (clock - 6.3) / 0.35);
    if (clock < 4.5) shove();
    else if (!a.settled) { a.settled = true; silva.forEach((l) => { l.style.translate = ""; }); }
    measure();
    glue();
    while (story.length && story[0][0] <= clock) story.shift()[1]();

    ctx.clearRect(0, 0, W, H);
    drawCrane();

    if (hat) {
      hat.vy += 900 * dt; hat.y += hat.vy * dt; hat.x += hat.vx * dt; hat.spin += dt * 9;
      if (hat.y >= ground - size * 0.08) { hat.y = ground - size * 0.08; hat.vy = 0; hat.vx = 0; hat.spin = 0.25; }
      const u = size / 100;
      ctx.save();
      ctx.translate(hat.x, hat.y); ctx.rotate(hat.spin); ctx.scale(u, u); ctx.translate(0, 72);
      hatShape(a, 0);
      ctx.restore();
    }

    crew.forEach((d, i) => {
      d.shock = Math.max(0, d.shock - dt);
      d.turn += (d.wantTurn - d.turn) * Math.min(1, dt * 14);
      const moved = (i === 0 ? pS - before[0] : i === 2 ? pT - before[1] : 0);
      if (d.pose === "push") {
        d.step += dt * 6 + moved * 90;
        d.lean += (0.3 - d.lean) * Math.min(1, dt * 10);
      } else d.lean += (0 - d.lean) * Math.min(1, dt * 10);

      if (d.tx !== null) {
        const gap = d.tx - d.x;
        const move = d.speed * dt;
        d.face = gap < 0 ? -1 : 1;
        d.step += dt * 24;
        if (Math.abs(gap) <= move) {
          d.x = d.tx; d.tx = null;
          const next = d.then; d.then = null;
          next?.();
        } else d.x += Math.sign(gap) * move;
      }

      d.vy += 900 * dt;
      d.y += d.vy * dt;
      const floor = d.floor();
      if (d.y >= floor) { d.y = floor; d.vy = 0; }
      draw(d);
    });

    for (let i = dust.length - 1; i >= 0; i--) {
      const p = dust[i];
      p.life -= dt;
      if (p.life <= 0) { dust.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.96;
      ctx.fillStyle = `rgba(255, 248, 239, ${(p.life / p.max) * 0.5})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1.6 - p.life / p.max), 0, 7); ctx.fill();
    }

    if (!story.length && crew.every((d) => d.x > W + size)) return finish();
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
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

// ===== Proyecto sin anunciar: alguien intenta adivinar el nombre y falla =====
// Cada intento va fijando letras (inventadas) y, cuando parece que lo
// tiene, falla y vuelve a empezar. El nombre real no está en el código.
(() => {
  const el = document.getElementById("scramble");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const pick = () => ABC[Math.floor(Math.random() * ABC.length)];
  const shape = [...el.textContent];
  const held = document.createElement("span");
  const loose = document.createElement("span");
  loose.className = "scramble__loose";
  el.textContent = "";
  el.append(held, loose);

  const noise = (from) => shape.slice(from).map((c) => (c === " " ? " " : pick())).join("");
  let locked = "";
  let stop = 0;
  let tick = 0;

  const attempt = () => {
    locked = "";
    // Se queda a dos o tres letras, o a veces mucho antes
    stop = shape.length - 2 - Math.floor(Math.random() * 7);
    el.classList.remove("is-wrong");
  };
  attempt();

  setInterval(() => {
    if (el.classList.contains("is-wrong")) return;
    tick++;
    if (tick % 3 === 0) locked += shape[locked.length] === " " ? " " : pick();
    held.textContent = locked;
    loose.textContent = noise(locked.length);
    if (locked.length >= stop) {
      el.classList.add("is-wrong");
      setTimeout(attempt, 750);
    }
  }, 70);
})();

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
      ["", "Web editorial de análisis, estadísticas y contexto, con fichajes, archivo y calculadoras."],
      ["", ""],
      ["k", "Cómo está hecho"],
      ["", "· Next.js 15 + TypeScript + Tailwind CSS"],
      ["", "· Supabase: autenticación, base de datos y almacenamiento"],
      ["", "· Panel de administración propio para publicar artículos"],
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
  ufv: {
    file: "ufv-racing.md",
    media: ["coche.jpg", "simulador.jpg", "simulink.mp4", "modelo-3d.mp4"],
    text: [
      ["h", "UFV Racing Team"],
      ["d", "Formula Student · departamento de Electrical · un año"],
      ["", ""],
      ["k", "Qué hice"],
      ["", "Creé desde cero las simulaciones del coche, con MATLAB y Simulink."],
    ],
  },
  ac: {
    file: "aire-claro.md", repo: "https://airelimpio.netlify.app",
    text: [
      ["h", "Aire Claro"],
      ["d", "San Esteban Tech Challenge 2026 · equipo Absolute Lockin"],
      ["", ""],
      ["k", "El reto"],
      ["", "Dar a San Esteban de Gormaz una forma clara de comprobar que la futura planta de biometano cumple su compromiso."],
      ["", ""],
      ["k", "La propuesta"],
      ["", "· Cinco estaciones con sensores de H₂S y amoniaco y veleta"],
      ["", "· Avisos anónimos de vecinos y una web pública"],
      ["", "· Los mismos datos para vecinos, Ayuntamiento y empresa"],
      ["", ""],
      ["k", "Demo"],
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
    if (p.media) {
      // Material sin pulir: solo se carga si alguien lo pide
      const more = document.createElement("button");
      more.type = "button";
      more.className = "term__more";
      more.textContent = "ls media/";
      span("", "\n");
      put(more);
      span("", "\n");
      more.addEventListener("click", () => {
        const grid = document.createElement("span");
        grid.className = "term__media";
        p.media.forEach((name) => {
          const src = `assets/ufv/${name}`;
          if (name.endsWith(".mp4")) {
            const v = document.createElement("video");
            v.src = src; v.controls = true; v.muted = true; v.playsInline = true; v.preload = "metadata";
            grid.appendChild(v);
          } else {
            const a = document.createElement("a");
            a.href = src; a.target = "_blank"; a.rel = "noopener";
            const img = document.createElement("img");
            img.src = src; img.alt = "";
            a.appendChild(img);
            grid.appendChild(a);
          }
        });
        more.replaceWith(grid);
      });
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
        : { term: [8, 60, w, Math.min(420, H - 120)] };
    }
    const w = Math.min(920, W * 0.6);
    const h = Math.min(Math.round(w * 0.625) + 40, H - 120);
    const x = Math.round((W - w) / 2 + W * 0.09);
    const y = Math.round((H - h) / 2 - 16);
    const tw = Math.min(560, W * 0.42);
    const th = Math.min(H - y - 72, 600);
    return hasWeb
      ? { web: [x, y, w, h], term: [Math.max(16, x - tw * 0.72), y + 56, tw, th] }
      : { term: [Math.round((W - tw) / 2), Math.round((H - 420) / 2), tw, 420] };
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
      frame.style.width = FRAME_W + 20 + "px"; // la barra de la web queda fuera, recortada
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

// Mateo González Silva — piezas comunes de la opción 1: cabecera, menú, pie, entradas y webs en vivo
(() => {
  const base = "/";
  const here = document.body.dataset.page || "inicio";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const pages = [
    ["inicio", "Inicio", base],
    ["proyectos", "Proyectos", base + "proyectos/"],
    ["premio", "Premio", base + "premio/"],
    ["experiencia", "Experiencia", base + "experiencia/"],
    ["educacion", "Educación", base + "educacion/"],
    ["voluntariado", "Voluntariado", base + "voluntariado/"],
    ["contacto", "Contacto", base + "#contacto"],
  ];
  const social = `
    <a href="https://www.linkedin.com/in/mateo-gonz%C3%A1lez-silva-58b61641b" target="_blank" rel="noopener">LinkedIn ↗</a>
    <a href="https://github.com/mateogsilvaa" target="_blank" rel="noopener">GitHub ↗</a>
    <a href="https://www.instagram.com/mateogsilvaa/" target="_blank" rel="noopener">Instagram ↗</a>`;

  // Cabecera, menú y barra de progreso
  document.body.insertAdjacentHTML("afterbegin", `
    <div class="prog" aria-hidden="true"></div>
    <header class="top mono" id="top">
      <a class="top__logo" href="${base}" aria-label="Inicio">MGS</a>
      <button class="burger" type="button" aria-expanded="false" aria-controls="menu">
        <span class="burger__word"><span>Menú</span><span>Cerrar</span></span>
        <span class="burger__lines" aria-hidden="true"><i></i><i></i></span>
      </button>
    </header>
    <div class="menu" id="menu" aria-hidden="true">
      <ul class="menu__list">
        ${pages.map(([id, name, href], i) => `<li><a href="${href}" style="--i:${i}"${id === here ? ' class="on" aria-current="page"' : ""}><span class="n">${String(i).padStart(2, "0")}</span><span class="w">${name}</span></a></li>`).join("")}
      </ul>
      <div class="menu__foot mono"><a href="mailto:contacto@mateogsilvaa.es">contacto@mateogsilvaa.es</a><span class="foot__now">Madrid · <time class="clock"></time></span><nav>${social}</nav></div>
    </div>`);

  // Pie en las páginas interiores
  if (here !== "inicio") document.body.insertAdjacentHTML("beforeend", `
    <footer class="foot mono"><span>© 2026 Mateo González Silva</span><span class="foot__now">Madrid · <time class="clock"></time></span><nav><a href="mailto:contacto@mateogsilvaa.es">Correo</a>${social}<a class="totop" href="#top">Arriba ↑</a></nav></footer>`);

  const root = document.documentElement, burger = document.querySelector(".burger"), menu = document.querySelector(".menu");
  const setMenu = (open) => {
    root.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", open); menu.setAttribute("aria-hidden", !open);
    document.body.classList.toggle("lock", open);
  };
  burger.addEventListener("click", () => setMenu(!root.classList.contains("menu-open")));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Títulos que suben y bloques que aparecen al entrar en pantalla
  document.querySelectorAll(".head h2").forEach((h) => h.innerHTML = `<span>${h.innerHTML}</span>`);
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .1 });
  document.querySelectorAll("[data-in]").forEach((el) => io.observe(el));

  // Barra de progreso de lectura
  const prog = document.querySelector(".prog"); let tick = false;
  const onScroll = () => { tick = false; const max = root.scrollHeight - innerHeight; prog.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`; };
  addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Webs en vivo: se cargan al acercarse, a tamaño escritorio y encogidas
  const fit = (box) => { const f = box.querySelector("iframe"); if (f) f.style.transform = `scale(${box.clientWidth / 1440})`; };
  const mount = (box) => {
    if (box.querySelector("iframe")) return;
    box.classList.add("wait");
    const f = document.createElement("iframe");
    f.src = box.dataset.src; f.tabIndex = -1; f.setAttribute("aria-hidden", "true");
    const done = () => { f.classList.add("on"); box.classList.remove("wait"); };
    f.addEventListener("load", done); setTimeout(done, 6000);
    box.prepend(f); fit(box); new ResizeObserver(() => fit(box)).observe(box);
  };
  const lazy = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { mount(e.target); lazy.unobserve(e.target); } }), { rootMargin: "300px 600px" });
  document.querySelectorAll(".live[data-src]").forEach((el) => lazy.observe(el));

  // Copiar el correo
  document.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", async () => {
    const t = b.querySelector(".t") || b, old = t.textContent;
    try { await navigator.clipboard.writeText(b.dataset.copy); t.textContent = "¡Copiado!"; } catch { location.href = "mailto:" + b.dataset.copy; }
    setTimeout(() => t.textContent = old, 1800);
  }));

  // Hora de Madrid
  const clocks = document.querySelectorAll(".clock");
  const tickClock = () => { const t = new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit" }).format(new Date()); clocks.forEach((c) => c.textContent = t); };
  if (clocks.length) { tickClock(); setInterval(tickClock, 20000); }
  document.querySelectorAll('a[href="#top"]').forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); }));

  // Cifras que cuentan al aparecer (solo las que son número)
  const num = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; num.unobserve(e.target);
    const el = e.target, m = el.textContent.match(/^([^\d]*)([\d.,]+)(.*)$/); if (!m || reduce) return;
    const raw = m[2], dec = raw.includes(",") ? raw.split(",")[1].length : 0, val = parseFloat(raw.replace(/\./g, "").replace(",", "."));
    if (!isFinite(val) || val < 2) return;
    const fmt = (v) => m[1] + v.toLocaleString("es-ES", { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: raw.includes(".") }) + m[3];
    const t0 = performance.now(), dur = 1400;
    const step = (t) => { const k = Math.min(1, (t - t0) / dur), ek = 1 - Math.pow(1 - k, 4); el.textContent = fmt(val * ek); if (k < 1) requestAnimationFrame(step); };
    el.textContent = fmt(0); requestAnimationFrame(step);
  }), { threshold: .6 });
  document.querySelectorAll(".stats b, .cover__stats b:not(.w), .scard__stats b").forEach((b) => num.observe(b));

  // Lupa "Abrir" al pasar por encima de una web en vivo
  if (matchMedia("(hover: hover)").matches && !reduce) {
    const peek = document.createElement("div"); peek.className = "peek"; peek.textContent = "Abrir ↗"; document.body.append(peek);
    addEventListener("mousemove", (e) => { peek.style.left = e.clientX + "px"; peek.style.top = e.clientY + "px"; }, { passive: true });
    document.addEventListener("mouseover", (e) => peek.classList.toggle("on", !!e.target.closest(".live")));
  }

  // Cortina azul entre páginas
  const cur = document.createElement("div"); cur.className = "curtain"; cur.innerHTML = "<b></b>"; document.body.append(cur);
  let came = false; try { came = !!sessionStorage.getItem("mgs-nav"); sessionStorage.removeItem("mgs-nav"); } catch (e) {}
  if (reduce || !came) cur.classList.add("low");
  else requestAnimationFrame(() => requestAnimationFrame(() => cur.classList.add("up")));
  addEventListener("pageshow", (e) => { if (e.persisted) cur.className = "curtain low"; });
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a"); if (!a || reduce || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || u.pathname === location.pathname || a.hasAttribute("download")) return;
    e.preventDefault();
    const pg = pages.find(([, , h]) => h === u.pathname);
    cur.querySelector("b").textContent = pg ? pg[1] : "";
    cur.className = "curtain low"; void cur.offsetWidth; cur.className = "curtain go";
    try { sessionStorage.setItem("mgs-nav", "1"); } catch (err) {}
    setTimeout(() => { location.href = a.href; }, 720);
  });

  window.MGS = { reduce };
})();

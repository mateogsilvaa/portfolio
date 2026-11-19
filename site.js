// Mateo González Silva — piezas comunes de la opción 1: cabecera, menú, pie, entradas y webs en vivo
(() => {
  const en = document.documentElement.lang === "en";
  const L = (es, eng) => (en ? eng : es);
  const base = en ? "/en/" : "/";
  const cv = en ? "/cv/CV-Mateo-Gonzalez-Silva-EN.pdf" : "/cv/CV-Mateo-Gonzalez-Silva.pdf";
  const other = en ? (location.pathname.replace(/^\/en/, "") || "/") : "/en" + location.pathname;
  const here = document.body.dataset.page || "inicio";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const pages = [
    ["inicio", L("Inicio", "Home"), base],
    ["proyectos", L("Proyectos", "Projects"), base + "proyectos/"],
    ["premio", L("Premio", "Award"), base + "premio/"],
    ["experiencia", L("Experiencia", "Experience"), base + "experiencia/"],
    ["educacion", L("Educación", "Education"), base + "educacion/"],
    ["voluntariado", L("Voluntariado", "Volunteering"), base + "voluntariado/"],
    ["contacto", L("Contacto", "Contact"), base + "#contacto"],
  ];
  const social = `
    <a href="https://www.linkedin.com/in/mateogonzalezsilva" target="_blank" rel="noopener">LinkedIn ↗</a>
    <a href="https://github.com/mateogsilvaa" target="_blank" rel="noopener">GitHub ↗</a>
    <a href="https://www.instagram.com/mateogsilvaa/" target="_blank" rel="noopener">Instagram ↗</a>`;

  // Logo: cuadrado redondeado con la M y el punto recortados (toma el color del texto)
  const mark = (id) => `<svg class="mk" viewBox="0 0 120 120" aria-hidden="true"><defs><mask id="mk-${id}"><rect width="120" height="120" fill="#fff"/><text x="11" y="94" font-family="Inter Tight, sans-serif" font-weight="900" font-size="92" letter-spacing="-6" fill="#000">M</text><circle cx="101" cy="87" r="8" fill="#000"/></mask></defs><rect width="120" height="120" rx="28" fill="currentColor" mask="url(#mk-${id})"/></svg>`;

  // Cabecera, menú y barra de progreso
  document.body.insertAdjacentHTML("afterbegin", `
    <div class="prog" aria-hidden="true"></div>
    <header class="top mono" id="top">
      <div class="top__l"><a class="top__logo" href="${base}" aria-label="${L("Inicio", "Home")}">${mark("h")}</a><a class="lang" href="${other}${location.hash}" hreflang="${en ? "es" : "en"}" lang="${en ? "es" : "en"}" aria-label="${L("Read in English", "Leer en español")}"><span${en ? "" : ' class="on"'}>ES</span><span${en ? ' class="on"' : ""}>EN</span></a></div>
      <button class="burger" type="button" aria-expanded="false" aria-controls="menu">
        <span class="burger__word"><span>${L("Menú", "Menu")}</span><span>${L("Cerrar", "Close")}</span></span>
        <span class="burger__lines" aria-hidden="true"><i></i><i></i></span>
      </button>
    </header>
    <div class="menu" id="menu" aria-hidden="true">
      <ul class="menu__list">
        ${pages.map(([id, name, href], i) => `<li><a href="${href}" style="--i:${i}"${id === here ? ' class="on" aria-current="page"' : ""}><span class="n">${String(i).padStart(2, "0")}</span><span class="w">${name}</span></a></li>`).join("")}
      </ul>
      <div class="menu__foot mono"><a href="mailto:contacto@mateogsilvaa.es">contacto@mateogsilvaa.es</a><nav>${social}</nav></div>
    </div>`);

  // Pie: bloque oscuro con logo, páginas, contacto y redes (en todas las páginas)
  document.body.insertAdjacentHTML("beforeend", `
    <footer class="ft">
      ${here !== "inicio" ? `<div class="ft__cta"><span class="mono">${L("¿Hablamos?", "Let's talk")}</span><a class="ft__mail" href="mailto:contacto@mateogsilvaa.es">contacto@<wbr>mateogsilvaa.es</a></div>` : ""}
      <div class="ft__grid">
        <a class="ft__brand" href="${base}">${mark("f")}<span><b>Mateo González Silva</b><span>${L("Ingeniería, IA y atletismo · Madrid", "Engineering, AI and athletics · Madrid")}</span></span></a>
        <nav aria-label="${L("Páginas", "Pages")}"><span class="mono">${L("Páginas", "Pages")}</span>${pages.filter(([id]) => id !== "contacto").map(([, name, href]) => `<a href="${href}">${name}</a>`).join("")}</nav>
        <nav aria-label="${L("Contacto", "Contact")}"><span class="mono">${L("Contacto", "Contact")}</span><a href="mailto:contacto@mateogsilvaa.es">${L("Correo", "Email")}</a><a href="${cv}" download>${L("Descargar CV ↓", "Download CV ↓")}</a></nav>
        <nav aria-label="${L("Redes", "Social")}"><span class="mono">${L("Redes", "Social")}</span>${social}</nav>
      </div>
      <div class="ft__bar mono"><span>© 2026 Mateo González Silva</span><a href="${other}" hreflang="${en ? "es" : "en"}">${L("English version", "Versión en español")}</a></div>
    </footer>`);

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
    try { await navigator.clipboard.writeText(b.dataset.copy); t.textContent = L("¡Copiado!", "Copied!"); } catch { location.href = "mailto:" + b.dataset.copy; }
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
  document.querySelectorAll(".stats b, .cover__stats b:not(.w), .scard__stats b, .facts b:not(.w), .big b").forEach((b) => num.observe(b));

  // Botones: relleno que nace desde donde entra el ratón
  document.addEventListener("pointerover", (e) => {
    const b = e.target.closest(".btn"); if (!b || e.pointerType !== "mouse") return;
    const r = b.getBoundingClientRect();
    b.style.setProperty("--x", e.clientX - r.left + "px"); b.style.setProperty("--y", e.clientY - r.top + "px");
  });
  document.addEventListener("pointerout", (e) => {
    const b = e.target.closest(".btn"); if (!b || b.contains(e.relatedTarget)) return;
    const r = b.getBoundingClientRect();
    b.style.setProperty("--x", e.clientX - r.left + "px"); b.style.setProperty("--y", e.clientY - r.top + "px");
  });

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

// Cabecera: se esconde al bajar y reaparece al subir
(() => {
  const t = document.querySelector(".top"); if (!t) return; let y0 = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY;
    if (Math.abs(y - y0) < 8) return;
    t.classList.toggle("hide", y > y0 && y > 120 && !document.documentElement.classList.contains("menu-open") && !document.body.classList.contains("menu-open"));
    y0 = y;
  }, { passive: true });
})();

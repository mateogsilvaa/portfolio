// Mateo González Silva — piezas comunes de la opción 1: cabecera, menú, pie, entradas y webs en vivo
(() => {
  const base = "/opcion1/";
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
    <header class="top mono">
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
      <div class="menu__foot mono"><a href="mailto:contacto@mateogsilvaa.es">contacto@mateogsilvaa.es</a><nav>${social}</nav></div>
    </div>`);

  // Pie en las páginas interiores
  if (here !== "inicio") document.body.insertAdjacentHTML("beforeend", `
    <footer class="foot mono"><span>© 2026 Mateo González Silva</span><nav><a href="mailto:contacto@mateogsilvaa.es">Correo</a>${social}</nav></footer>`);

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

  window.MGS = { reduce };
})();

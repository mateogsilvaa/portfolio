import re, os, json
SP = os.path.dirname(os.path.abspath(__file__))
R = os.path.dirname(SP)
T = json.load(open(os.path.join(SP, "en.json"), encoding="utf8"))
U = "https://mateogsilvaa.es"
PAGES = ["", "proyectos/", "premio/", "experiencia/", "educacion/", "voluntariado/"]
LINKS = {"/", "/proyectos/", "/premio/", "/experiencia/", "/educacion/", "/voluntariado/"}

def tr_text(m):
    raw = m.group(1); k = raw.strip()
    if k in T: return ">" + raw.replace(k, T[k]) + "<"
    return m.group(0)

def tr_attr(m):
    k = m.group(2)
    return f'{m.group(1)}="{T.get(k, k)}"'

def hreflang(path):
    return (f'<link rel="alternate" hreflang="es" href="{U}/{path}" />\n'
            f'<link rel="alternate" hreflang="en" href="{U}/en/{path}" />\n'
            f'<link rel="alternate" hreflang="x-default" href="{U}/{path}" />\n')

for path in PAGES:
    src = os.path.join(R, path, "index.html")
    s = open(src, encoding="utf8").read()
    # Añade hreflang a la versión española
    if 'hreflang="en"' not in s:
        s = s.replace('<link rel="stylesheet" href="/site.css" />', hreflang(path) + '<link rel="stylesheet" href="/site.css" />', 1)
        open(src, "w", encoding="utf8").write(s)
    e = s
    head, body = e.split("</head>", 1)
    # Cabecera: atributos y título
    head = re.sub(r'(content|title)="([^"]+)"', tr_attr, head)
    head = re.sub(r"<title>(.*?)</title>", lambda m: f"<title>{T.get(m.group(1), m.group(1))}</title>", head)
    head = head.replace(f'rel="canonical" href="{U}/{path}"', f'rel="canonical" href="{U}/en/{path}"')
    head = head.replace(f'og:url" content="{U}/{path}"', f'og:url" content="{U}/en/{path}"')
    head = head.replace('content="es_ES"', 'content="en_GB"')
    # Cuerpo: separa scripts para no tocar código salvo cadenas concretas
    parts = re.split(r"(<script.*?</script>)", body, flags=re.S)
    for i, p in enumerate(parts):
        if p.startswith("<script"):
            for k, v in T.items():
                if len(k) > 8: p = p.replace(f'"{k}"', json.dumps(v, ensure_ascii=False))
            p = p.replace('data-t="Ver más →">Ver más →', 'data-t="Read more →">Read more →').replace('data-t="Visitar ↗">Visitar ↗', 'data-t="Visit ↗">Visit ↗')
            p = p.replace('aria-label="Ver ${name}"', 'aria-label="See ${name}"')
            p = p.replace('href="/proyectos/#${id}"', 'href="/en/proyectos/#${id}"')
            p = p.replace('hot = ["ingeniería", "inteligencia", "artificial,", "atletismo", "productos", "de", "verdad."]', 'hot = ["engineering", "artificial", "intelligence,", "track", "building", "websites."]')
            parts[i] = p
        else:
            p = re.sub(r">([^<]+)<", tr_text, p)
            p = re.sub(r'(aria-label|alt|title|data-t)="([^"]+)"', tr_attr, p)
            parts[i] = p
    body = "".join(parts)
    e = head + "</head>" + body
    e = e.replace('<html lang="es">', '<html lang="en">')
    # Enlaces internos a la versión inglesa
    e = re.sub(r'href="(/[a-z]*/?)(#[^"]*)?"', lambda m: f'href="/en{m.group(1)}{m.group(2) or ""}"' if m.group(1) in LINKS else m.group(0), e)
    out = os.path.join(R, "en", path, "index.html")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, "w", encoding="utf8").write(e)
    left = [t for t in re.findall(r">([^<]{4,})<", re.sub(r"<script.*?</script>|<style.*?</style>", "", body, flags=re.S)) if re.search(r"[áéíóúñ¿]", t)]
    print(path or "home", "pendientes:", left[:6])

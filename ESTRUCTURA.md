# Estructura del Sitio Web: Noticias de Corea - Doramas 2026

## Resumen

Sitio web estático de noticias de doramas (series coreanas) con 7 páginas de detalle, sistema de comentarios/likes vía Firebase, menú lateral, favoritos, tracker de episodios y sistema de anuncios. Tema oscuro premium con fuente Outfit.

---

## 1. Archivos del Proyecto

```
html/
├── index.html                    # Página principal (grid de 7 tarjetas)
├── login.html                    # Login/Registro (Firebase Auth)
├── sitemap.xml                   # Sitemap con 8 URLs
├── robots.txt                    # Permisos de crawlers
│
├── shop_for_killers_s2.html      # Detalle: A Shop for Killers S2
├── dream_to_you.html             # Detalle: Dream to You
├── spooky_in_love.html           # Detalle: Spooky in Love
├── doctor_on_edge.html           # Detalle: Doctor on the Edge
├── agent_kim_reactivated.html    # Detalle: Agent Kim Reactivated
├── blossoms_of_power.html        # Detalle: Blossoms of Power
├── love_in_sync.html             # Detalle: Love in Sync
│
├── css/
│   ├── style.css                 # Estilos principales (929 lineas)
│   ├── login.css                 # Estilos de login/registro
│   ├── comments-likes.css        # Estilos de comentarios y likes
│   └── hamburger.css             # Estilos de menu lateral y hamburguesa
│
├── js/
│   ├── firebase-config.js        # Config Firebase (API keys, init)
│   ├── script.js                 # Filtrado por categorias (index)
│   ├── index-menu.js             # Menu lateral hamburguesa (module)
│   ├── login.js                  # Logica login/registro (module)
│   ├── comments-likes.js         # Comentarios y likes en tiempo real (module)
│   ├── detail-features.js        # Favoritos, compartir, tracker episodios
│   └── ads.js                    # Sistema de anuncios
│
└── images/
    ├── shop_killers.jpg          # Poster A Shop for Killers S2
    ├── dream_to_you.jpg          # Poster Dream to You
    ├── spooky_in_love.jpg        # Poster Spooky in Love
    ├── doctor_on_edge.jpg        # Poster Doctor on the Edge
    ├── agent_kim.jpg             # Poster Agent Kim Reactivated
    ├── blossoms_of_power.jpg     # Poster Blossoms of Power
    └── love_in_sync.jpg          # Poster Love in Sync
```

---

## 2. Archivos HTML - Estructura

### 2.1 index.html

**Scripts cargados (en orden):**
1. `js/script.js` (regular) - Filtrado de categorias
2. `js/index-menu.js` (module) - Menu lateral
3. `js/ads.js` (regular) - Inyeccion de anuncios

**Estructura del body:**
```
header.main-header          → h1 "Doramas en Emisión", p.tagline
nav.categories-nav          → 6 botones de categoría (Todos, Acción, Romance, Fantasía, Médico, Histórico)
main.news-container
  └─ div.news-grid#news-grid → 7 article.news-card + anuncios inyectados por ads.js
button.hamburger-menu-btn   → Menu hamburguesa
footer.main-footer          → Copyright
```

**Structured Data JSON-LD (2 bloques):**
1. `@type: WebSite` - Info del sitio
2. `@type: ItemList` - Lista de 7 doramas con posiciones y URLs

**Cada article.news-card tiene:**
```html
<article class="news-card" data-category="CATEGORIA" id="news-N">
    <div class="card-image-wrapper">
        <img src="images/ARCHIVO.jpg" alt="TITULO" class="card-image" loading="lazy" width="400" height="300">
        <span class="card-badge badge-CATEGORIA">TEXTO_BADGE</span>
    </div>
    <div class="card-content">
        <span class="card-date">Estreno: FECHA</span>
        <h2 class="card-title">TITULO</h2>
        <p class="card-excerpt">SINOPSIS_CORTA</p>
        <a href="ARCHIVO.html" class="read-more-btn">Ver más <span class="arrow">&rarr;</span></a>
    </div>
</article>
```

**Categorías disponibles:**
| data-category | badge class | Texto |
|---------------|-------------|-------|
| accion | badge-accion | Acción / Thriller |
| romance | badge-romance | Romance / Comedia |
| fantasia | badge-fantasia | Fantasía / Romance |
| medico | badge-medico | Médico / Romance |
| historico | badge-historico | Histórico / Romance |

---

### 2.2 Páginas de Detalle (las 7 páginas)

Todas siguen la misma plantilla. Scripts cargados:
1. `js/index-menu.js` (module)
2. `js/comments-likes.js` (module)
3. `js/detail-features.js` (regular)
4. `js/ads.js` (regular)

**Estructura del body:**
```
header.main-header              → h1 = TITULO, p.tagline
main.detail-container
  ├─ a.back-btn                 → "← Volver al inicio" → index.html
  └─ article.detail-card
       └─ div.detail-grid       → 2 columnas: sidebar + contenido
            ├─ div.detail-sidebar
            │    ├─ div.detail-poster-wrapper → img.detail-poster
            │    └─ div.detail-info-block     → Ficha Técnica (Estreno, Episodios, Cadena, Estado)
            └─ div.detail-content
                 ├─ span.detail-genre-tag.badge-CATEGORIA
                 ├─ h2.detail-title.detail-title-CATEGORIA
                 ├─ section.detail-section → Sinopsis (2 párrafos)
                 ├─ section.detail-section → Expectativas y Producción
                 ├─ section.detail-section → Reparto Principal (div.cast-grid)
                 ├─ [detail-features.js inyecta] div.detail-toolbar → Favorito + Compartir
                 ├─ [detail-features.js inyecta] section.episode-tracker-section → Tracker
                 ├─ [comments-likes.js inyecta] div.likes-comments-bar → Like + Comentar
                 └─ [ads.js inyecta] div.ad-wrapper → Anuncios
button.hamburger-menu-btn
footer.main-footer
```

**Head de cada detalle incluye:**
- Meta: description, keywords, author, canonical, robots
- Open Graph: og:type=article, og:title, og:description, og:url, og:image (800x1200), article:published_time, article:section
- Twitter Card: summary_large_image
- JSON-LD: `@type: Article` con headline, description, image, datePublished, author (Organization), publisher, mainEntityOfPage

---

### 2.3 login.html

**Scripts:** `js/login.js` (module)

**Estructura:**
```
div.auth-container
  ├─ a.back-home-btn           → index.html
  └─ div.auth-card
       ├─ div.auth-tabs        → 2 botones: "Iniciar Sesión" / "Registrarse"
       ├─ div#auth-alert       → Mensajes de error/éxito
       ├─ form#auth-form
       │    ├─ div#group-name        → Input nombre (solo registro)
       │    ├─ div                   → Input email
       │    ├─ div                   → Input password (min 6 chars)
       │    ├─ div#group-avatar      → Upload foto perfil (solo registro)
       │    └─ button#btn-submit     → "Ingresar" / "Registrarse"
       └─ div.auth-footer      → Link cambiar entre login/register
```

---

## 3. JavaScript - Detalle de cada archivo

### 3.1 js/firebase-config.js (module)

Configura e inicializa Firebase. Exporta:
- `app` - Instancia de Firebase App
- `auth` - Firebase Authentication
- `db` - Firebase Realtime Database
- `storage` - Firebase Storage

**Proyecto Firebase:** `abby-cdb30`

---

### 3.2 js/script.js (regular)

Filtrado de tarjetas por categoría en index.html.

**Lógica:**
- Al hacer click en un `.category-btn`:
  1. Quita `.active` de todos los botones, lo agrega al clickeado
  2. Obtiene `data-category` del botón
  3. Si es "all" o coincide con `data-category` de la tarjeta → `display: flex` + re-animate fadeIn
  4. Si no → `display: none`

---

### 3.3 js/index-menu.js (module)

Menú lateral tipo drawer que se abre desde la hamburguesa.

**Inyecta en el body:**
- `div.side-drawer#side-drawer` → Perfil, links (Inicio, Ingresar, Cerrar Sesión)
- `div.drawer-overlay#drawer-overlay` → Fondo oscuro

**Funcionalidad:**
- Abre/cierra con hamburger, close button o click en overlay
- Muestra avatar y nombre del usuario logueado (lee de `users/{uid}` en Firebase)
- Si no hay sesión: muestra "Invitado" con avatar de DiceBear
- Botón "Cerrar Sesión" → `signOut(auth)`

---

### 3.4 js/comments-likes.js (module)

Sistema completo de comentarios y likes en tiempo real con Firebase.

**Omite ejecución en:** index.html, ruta raíz, `/html/`

**Inyecta 3 elementos:**
1. **Barra de likes/comentarios** (`.likes-comments-bar`) → Botón like con contador, botón comentarios
2. **Burbuja flotante** (`.floating-comment-bubble`) → Badge con cantidad de comentarios
3. **Modal de comentarios** (`.comments-modal`) → Lista de comentarios, editor, indicador de respuesta

**Firebase paths utilizados:**
- `likes/{pageId}/count` → Contador total de likes
- `likes/{pageId}/users/{uid}` → Like del usuario (true/null)
- `comments/{pageId}` → Comentarios (con soporte threaded via `parentId`)
- `users/{uid}` → Perfiles de usuario (displayName, photoURL)

**Características:**
- Comentarios anidados (hijos via `parentId`)
- Re-render automático cuando cambian perfiles de usuario
- XSS protection con `escapeHtml()` (maneja non-string)
- Avatar con fallback a DiceBear API

---

### 3.5 js/detail-features.js (regular)

Funcionalidades extra para páginas de detalle. **Omite ejecución en index.html.**

**3 funcionalidades:**

#### a) Toolbar de Favoritos y Compartir (`injectToolbar`)
Se inyecta al final de `.detail-content`:
```html
<div class="detail-toolbar">
    <div class="toolbar-group">
        <button class="fav-btn">♥ Favorito / En favoritos</button>
        <div class="share-group">
            <a href="https://api.whatsapp.com/send?text=...">WhatsApp</a>
            <a href="https://twitter.com/intent/tweet?text=...">Twitter/X</a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=...">Facebook</a>
        </div>
    </div>
</div>
```
- **Favoritos:** Guarda/quita en `localStorage` key `dorama_favorites` (array de pageIds)
- **Compartir:** Links pre-llenados con título y URL de la página

#### b) Tracker de Episodios (`injectEpisodeTracker`)
Se inyecta después de la sección de reparto:
```html
<section class="detail-section episode-tracker-section">
    <h2>Mi Progreso</h2>
    <div class="episode-progress-bar"><div class="progress-fill"></div></div>
    <p class="progress-text">X / Y episodios vistos</p>
    <div class="episode-grid">
        <button class="episode-btn watched">1</button>
        <button class="episode-btn">2</button>
        ...
    </div>
</section>
```
- Lee el total de episodios del campo "Episodios:" en la Ficha Técnica
- Guarda progreso en `localStorage` key `dorama_episodes` → `{pageId: [1, 3, 5, ...]}`

---

### 3.6 js/ads.js (regular)

Sistema de anuncios flexible. **Array de anuncios:**

```javascript
const ADS = [
    {
        id: 'ad-1',
        url: 'https://www.effectivecpmnetwork.com/ygd9cvhvm6?key=0ff3cff18391c0af70e39222d51a1c3a',
        label: 'Publicidad',
        type: 'banner',
        size: 'horizontal'
    },
    {
        id: 'ad-2',
        url: 'https://www.effectivecpmnetwork.com/nvbf20zwi?key=d865ba581655ace4fea9ee9780fc7b0d',
        label: 'Publicidad',
        type: 'banner',
        size: 'horizontal'
    },
];
```

**Ubicación de anuncios:**
- **Index:** ad-1 después de tarjeta 3, ad-2 después de tarjeta 6 (dentro del grid)
- **Detalle:** ad-1 después de la sección de reparto, ad-2 después del toolbar de favoritos

**Para agregar más anuncios:** Agregar objetos al array `ADS` en `js/ads.js`. El sistema inyecta automáticamente.

---

### 3.7 js/login.js (module)

Sistema de autenticación completo.

**Modos:**
- **Login:** Email + Password → `signInWithEmailAndPassword`
- **Registro:** Nombre + Email + Password + Avatar → `createUserWithEmailAndPassword`

**Upload de avatar (3 intentos):**
1. Subir a Firebase Storage (`avatars/{uid}`) → URL de descarga
2. Si falla: Comprimir a base64 (120x120, JPEG 0.7) → Guardar en Realtime DB
3. Si falla: Usar URL de DiceBear generada

**Datos guardados en `users/{uid}`:**
```json
{
    "displayName": "Nombre",
    "email": "email@ejemplo.com",
    "photoURL": "https://...",
    "updatedAt": 1234567890
}
```

**Mensajes de error traducidos al español.**

---

## 4. CSS - Resumen de estilos principales

### 4.1 css/style.css

**Tema oscuro con variables CSS:**
```css
--bg-primary: #0a0b10;
--bg-secondary: #12141c;
--card-bg: #1a1d26;
--text-primary: #f3f4f6;
--text-secondary: #9ca3af;
--accent-blue: #3b82f6;
--accent-purple: #8b5cf6;
--accent-pink: #ec4899;
```

**Colores de categoría:**
| Categoría | Color |
|-----------|-------|
| accion | #ef4444 (rojo) |
| romance | #f43f5e (rosa) |
| fantasia | #a855f7 (púrpura) |
| medico | #0d9488 (teal) |
| historico | #d97706 (ámbar) |

**Breakpoints responsive:**
- 768px → Ajustes generales
- 640px → Navegación horizontal scroll
- 480px → Grid 1 columna, todo más compacto
- 360px → Ultra compacto

---

## 5. Cómo Agregar una Nueva Noticia (Dorama)

### Paso 1: Crear la imagen
- Guardar como `images/NOMBRE_DEL_ARCHIVO.jpg`
- Tamaño recomendado: 400x600px (portrait para póster) o 400x300 (landscape para card)

### Paso 2: Crear la página de detalle
Copiar una existente (ej: `love_in_sync.html`) y cambiar:

**En el `<head>`:**
- `<meta name="description">` → Descripción del nuevo dorama
- `<meta name="keywords">` → Palabras clave relevantes
- `<link rel="canonical">` → URL de la nueva página
- `<title>` → "TITULO | Detalles del Dorama"
- Open Graph → og:title, og:description, og:url, og:image, article:published_time, article:section
- Twitter Card → twitter:title, twitter:description, twitter:image
- JSON-LD → headline, description, image, datePublished

**En el `<body>`:**
- `header h1` → Título del dorama
- `detail-poster img src` → `images/ARCHIVO.jpg`
- `detail-info-block` → Estreno, Episodios, Cadena/Red, Estado
- `detail-genre-tag` → badge-CATEGORIA y texto
- `detail-title` → Título con clase `detail-title-CATEGORIA`
- Sección Sinopsis → 2 párrafos
- Sección Expectativas → 1 párrafo
- Sección Reparto → Grid de cast cards

**Clases CSS para el título gradiente (elegir una):**
- `detail-title-accion` (rojo)
- `detail-title-romance` (rosa)
- `detail-title-fantasia` (púrpura)
- `detail-title-medico` (teal)
- `detail-title-historico` (ámbar)

### Paso 3: Agregar al index.html

Dentro de `div.news-grid`, agregar antes del cierre `</div>`:

```html
<!-- Tarjeta N: TITULO (CATEGORÍA) -->
<article class="news-card" data-category="CATEGORIA" id="news-N">
    <div class="card-image-wrapper">
        <img src="images/ARCHIVO.jpg" alt="TITULO" class="card-image" loading="lazy" width="400" height="300">
        <span class="card-badge badge-CATEGORIA">TEXTO_BADGE</span>
    </div>
    <div class="card-content">
        <span class="card-date">Estreno: FECHA</span>
        <h2 class="card-title">TITULO</h2>
        <p class="card-excerpt">SINOPSIS_CORTA (máximo 3 líneas)</p>
        <a href="ARCHIVO.html" class="read-more-btn">Ver más <span class="arrow">&rarr;</span></a>
    </div>
</article>
```

### Paso 4: Actualizar sitemap.xml

Agregar antes de `</urlset>`:
```xml
<url>
    <loc>https://tudominio.com/ARCHIVO.html</loc>
    <lastmod>AAAA-MM-DD</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
</url>
```

### Paso 5: Actualizar Structured Data del index

En el JSON-LD `ItemList` del index.html, incrementar `numberOfItems` y agregar:
```json
{"@type": "ListItem", "position": N, "url": "https://tudominio.com/ARCHIVO.html"}
```

### Paso 6: Agregar imagen de card (si es diferente al póster)
Si la imagen de la card en el index es diferente a la del póster del detalle, usar la imagen de card en el index y la del póster en el detalle.

---

## 6. Cómo Agregar un Nuevo Anuncio

Editar `js/ads.js` y agregar al array `ADS`:

```javascript
{
    id: 'ad-N',
    url: 'https://URL_DEL_ANUNCIO',
    label: 'Publicidad',
    type: 'banner',
    size: 'horizontal'
},
```

El sistema automáticamente:
- En index: lo inserta después de la tarjeta correspondiente (cada 3 tarjetas)
- En detalle: lo inserta después del toolbar de favoritos

Para cambiar la posición, modificar las funciones `injectIndexAds()` y `injectDetailAds()`.

---

## 7. Categorías Disponibles

| data-category | Clase badge | Clase título | Color | Texto badge |
|---------------|-------------|--------------|-------|-------------|
| accion | badge-accion | detail-title-accion | #ef4444 | Acción / Thriller |
| romance | badge-romance | detail-title-romance | #f43f5e | Romance / Comedia |
| fantasia | badge-fantasia | detail-title-fantasia | #a855f7 | Fantasía / Romance |
| medico | badge-medico | detail-title-medico | #0d9488 | Médico / Romance |
| historico | badge-historico | detail-title-historico | #d97706 | Histórico / Romance |

**Nota:** Las clases `badge-tecnologia`, `badge-cultura`, `badge-kpop` y sus títulos correspondientes están definidos en CSS pero no se usan actualmente. Se pueden habilitar agregando tarjetas con esas categorías.

---

## 8. Servicios Externos

| Servicio | Uso | SDK |
|----------|-----|-----|
| Firebase Auth | Login/Registro de usuarios | v10.8.0 (compat) |
| Firebase Realtime DB | Comentarios, likes, perfiles | v10.8.0 (compat) |
| Firebase Storage | Upload de avatares | v10.8.0 (compat) |
| Google Fonts | Fuente Outfit (300-700) | CDN |
| DiceBear API | Avatares por defecto | API REST |
| effectivecpmnetwork | Anuncios | Links externos |

---

## 9. Datos en Firebase Realtime Database

```
/
├── users/
│   └── {uid}/
│       ├── displayName: "Nombre"
│       ├── email: "email@ejemplo.com"
│       ├── photoURL: "https://..."
│       └── updatedAt: timestamp
│
├── likes/
│   └── {pageId}/
│       ├── count: number
│       └── users/
│           └── {uid}: true
│
└── comments/
    └── {pageId}/
        └── {commentId}/
            ├── authorUid: "uid"
            ├── authorName: "Nombre"
            ├── authorPhoto: "https://..."
            ├── content: "texto del comentario"
            ├── timestamp: number
            └── parentId: "commentId" (opcional, para respuestas)
```

---

## 10. Datos en localStorage

| Key | Tipo | Contenido |
|-----|------|-----------|
| `dorama_favorites` | `string (JSON array)` | `["page_id_1", "page_id_2", ...]` |
| `dorama_episodes` | `string (JSON object)` | `{"page_id": [1, 3, 5], ...}` |

---

## 11. Notas Importantes

1. **No hay build system** - Todo es HTML/CSS/JS puro, sin bundlers ni compiladores
2. **Los scripts module** (`type="module"`) solo son: `index-menu.js`, `comments-likes.js`, `login.js`
3. **Los scripts regulares** (sin type) son: `script.js`, `detail-features.js`, `ads.js`
4. **Firebase config** está hardcodeada en `firebase-config.js` (no usar variables de entorno)
5. **Las imágenes** deben subirse manualmente a `images/`
6. **El dominio** en URLs (canonical, og:url, sitemap) es `tudominio.com` - debe cambiarse al dominio real
7. **El index** carga `script.js` primero (filtrado), luego `index-menu.js` (module), luego `ads.js`
8. **Las páginas de detalle** cargan `index-menu.js`, `comments-likes.js`, `detail-features.js`, `ads.js`
9. **El login** tiene `robots: noindex, nofollow` (correcto)
10. **El sitemap** excluye login.html (correcto)

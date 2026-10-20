# 🌈 Heladería y Frutería Arcoíris

Sitio web de **Heladería y Frutería Arcoíris**, ubicada en Tocaima, Cundinamarca (Colombia). Incluye catálogo de productos con carrito de compras (pedidos por WhatsApp) y un panel de administración para editar el catálogo.

## 📁 Estructura del proyecto

```
proyecto-sena-main/
├── index.html          # Página pública del sitio
├── admin.html           # Panel de administración de productos
├── css/
│   ├── styles.css       # Estilos del sitio público
│   └── admin.css        # Estilos del panel admin
├── js/
│   ├── products.js       # Catálogo de productos (fuente única de datos)
│   ├── main.js            # Lógica del sitio: nav, carrito, modal, filtros, slideshow
│   └── admin.js           # Lógica del panel de administración
├── img/                  # Todas las imágenes del sitio (productos, equipo, hero)
└── README.md
```

## 🚀 Cómo ejecutar el sitio

Es un sitio estático (HTML/CSS/JS), no necesita instalación ni backend:

1. Descarga o clona el repositorio.
2. Abre `index.html` directamente en el navegador, **o** levanta un servidor local simple (recomendado, evita restricciones del navegador al leer archivos):

   ```bash
   npx serve .
   # o
   python -m http.server 8080
   ```
3. Visita `http://localhost:8080` (o la URL que indique la herramienta).

## 🍨 Catálogo de productos (`js/products.js`)

Todos los productos (nombre, precio, categoría, descripción, imagen) viven en un solo lugar: `DEFAULT_PRODUCTS` dentro de `js/products.js`. Tanto `index.html` como `admin.html` leen de ahí. Para agregar/editar un producto de forma **permanente** (visible para todos los visitantes), edita ese archivo directamente y vuelve a subir los cambios a GitHub.

## 🔐 Panel de administración (`admin.html`)

Permite, desde el navegador:

- Editar nombre, precio, categoría, descripción y marcar un producto como "Popular".
- Subir una nueva imagen para un producto (arrastrando un archivo desde tu computador).
- Agregar o eliminar productos del catálogo.
- Exportar el catálogo actual como un archivo `products.json`.

**Acceso:** contraseña `arcoiris2026` (definida en `js/admin.js`, constante `ADMIN_PASSWORD`). Cámbiala ahí si vas a usar el panel en un sitio público.

### ⚠️ Limitación importante: los cambios son solo locales

Este panel guarda los cambios en **`localStorage`**, es decir, **solo en el navegador donde los hiciste**. Esto significa:

- Si editas un precio desde el panel y recargas `index.html` **en el mismo navegador**, sí verás el cambio.
- Si otra persona visita el sitio desde **otro computador, celular o navegador**, **no verá tus cambios** — seguirá viendo el catálogo original de `js/products.js`.
- Es útil para **probar** cómo quedaría un cambio antes de aplicarlo "de verdad".

**¿Cómo hacer que un cambio se vea para todos?**

1. Desde el panel, haz tus ediciones y pulsa **"⬇️ Exportar JSON"** para descargar `products.json` con el catálogo actualizado (incluye imágenes nuevas como texto base64).
2. Copia esos datos a `js/products.js` (reemplazando el contenido del array `DEFAULT_PRODUCTS`), o pide ayuda para automatizar ese paso.
3. Sube el cambio a GitHub. Ahora sí lo verán todos los visitantes.

**Para que el panel actualice el sitio en vivo automáticamente** (sin este paso manual), se necesita un backend real — por ejemplo Firebase o un servidor Node.js con base de datos. Es un cambio sencillo de agregar más adelante si el proyecto crece; por ahora se optó por esta versión 100% estática, ideal para alojar gratis en GitHub Pages.

## 📦 Publicar en GitHub Pages (opcional)

1. Sube el repositorio a GitHub.
2. En **Settings → Pages**, selecciona la rama principal (`main`) y carpeta raíz (`/`).
3. El sitio quedará disponible en `https://<tu-usuario>.github.io/<nombre-repo>/`.

## 📞 Contacto del negocio

- WhatsApp: +57 313 429 28 31
- Dirección: Calle 4 #8-76, Tocaima, Cundinamarca, Colombia

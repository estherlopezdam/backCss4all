CSS4All · Analizador visual de estilos web
Herramienta web que analiza cualquier URL y extrae de forma estructurada los estilos visuales que usa: fuentes, colores de texto y de fondo, tamaños, bloques de contenido, imágenes y vídeos. Pensada para agilizar rediseños y auditorías de estilo, porque evita inspeccionar página por página con las herramientas del navegador.

Proyecto de fin de ciclo (TFG) del Técnico Superior en Desarrollo de Aplicaciones Web. Calificación: 10.

Demo: https://back-css4all.vercel.app/

Añade aquí una captura o un GIF de la aplicación en uso (por ejemplo docs/demo.gif). Un README con imagen se entiende en cinco segundos.
Qué hace
Introduces la URL de una página.
El backend abre la página en un navegador real (Chromium controlado con Playwright), espera a que cargue y recorre el DOM.
Devuelve un análisis con:
Fuentes (font-family) detectadas en toda la página.
Bloques visibles clasificados por tipo (texto, botón, formulario, imagen, vídeo y bloque general), cada uno con su etiqueta, clases CSS, tamaño y familia de fuente, color de texto y de fondo (en rgb y en hexadecimal) y un selector CSS que lo localiza en la página.
Imágenes con su URL, texto alternativo y dimensiones, con enlace de descarga.
Vídeos con su URL y dimensiones.
Puedes exportar el resultado en JSON o en PDF.
Stack
Capa
Tecnologías
Frontend
Astro, React 19, Tailwind CSS 4, jsPDF
Backend
Node.js, Express 5, Playwright (Chromium headless), CORS
Despliegue
Vercel (frontend)

Estructura
backCss4all/

├── api/     # API REST con Express y Playwright

└── front/   # Aplicación Astro + React
API
POST /scrape
Cuerpo de la petición (JSON):

{ "url": "https://ejemplo.com" }

Respuesta 200 (resumida):

{

  "url": "https://ejemplo.com/",

  "title": "Título de la página",

  "fontsUsed": ["Inter, sans-serif"],

  "blocks": [

    {

      "selector": "body > main > h1.titulo",

      "tag": "h1",

      "classes": "titulo",

      "type": "texto",

      "text": "Bienvenido",

      "fontSize": "32px",

      "fontFamily": "Inter, sans-serif",

      "color": "rgb(17, 24, 39)",

      "colorHex": "#111827",

      "backgroundColor": "rgba(0, 0, 0, 0)",

      "backgroundColorHex": "#000000"

    }

  ],

  "images": [{ "src": "https://...", "alt": "Logo", "width": 120, "height": 40 }],

  "videos": []

}

Errores: 400 si falta la URL y 500 si la página no se puede cargar o analizar.
Ejecutar en local
Requisitos: Node.js 20 o superior.

1. Backend

cd api

npm install

npx playwright install chromium

npm start            # escucha en http://localhost:3001

El puerto se puede cambiar con la variable de entorno PORT.

2. Frontend

cd front

npm install

echo "PUBLIC_API_URL=http://localhost:3001" > .env

npm run dev          # http://localhost:4321

Para producción: npm run build y npm run preview.
Decisiones técnicas
Navegador real en lugar de solo HTML: con Playwright se obtienen los estilos computados (lo que el usuario ve de verdad), incluidos los que aplican hojas de estilo externas o JavaScript.
Solo elementos visibles: se descartan los nodos con display: none, visibility: hidden, opacidad 0 o tamaño cero para no llenar el resultado de ruido.
Conversión de colores: los rgb() que devuelve el navegador se convierten a hexadecimal para que se puedan copiar directamente a un diseño.
Selector por elemento: cada bloque incluye la ruta CSS completa, para poder localizarlo en la web original.
Limitaciones y próximos pasos
Validar y restringir las URLs aceptadas por /scrape (evitar direcciones internas o locales) y añadir límite de peticiones.
Reutilizar una única instancia del navegador en lugar de abrir una por petición.
Añadir tests y una plantilla .env.example.
Paleta de colores agrupada y exportación a tokens de diseño.
Autora
Esther López Pérez, desarrolladora full stack. LinkedIn · GitHub · estherlopezdev.com

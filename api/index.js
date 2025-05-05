const express = require("express");
const { chromium } = require("playwright");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post("/scrape", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Falta la URL" });

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    const result = await page.evaluate(() => {
      const rgbToHex = (rgb) => {
        const result = rgb.match(/\d+/g);
        if (!result || result.length < 3) return rgb;
        return (
          "#" +
          result
            .slice(0, 3)
            .map((n) => ("0" + parseInt(n).toString(16)).slice(-2))
            .join("")
        );
      };

      const getSelector = (el) => {
        const path = [];
        while (el && el.nodeType === Node.ELEMENT_NODE) {
          let selector = el.nodeName.toLowerCase();
          if (el.id) selector += `#${el.id}`;
          else if (typeof el.className === "string" && el.className.trim()) {
            const classes = el.className.trim().split(/\s+/).join(".");
            selector += `.${classes}`;
          }
          path.unshift(selector);
          el = el.parentElement;
        }
        return path.join(" > ");
      };
    
      const isVisible = (el) => {
        const style = window.getComputedStyle(el);
        const bbox = el.getBoundingClientRect();
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0" &&
          parseFloat(style.fontSize) > 0 &&
          bbox.width > 0 &&
          bbox.height > 0
        );
      };
    
      const getFontsUsed = () => {
        const fonts = new Set();
        document.querySelectorAll("*").forEach(el => {
          const font = window.getComputedStyle(el).fontFamily;
          if (font) fonts.add(font);
        });
        return Array.from(fonts);
      };
    
      const getWordPressBlocks = () => {
        const raw = Array.from(document.querySelectorAll("body *"));
        const visibles = raw.filter(el => isVisible(el));
        const blocks = [];
      
        for (const el of visibles) {
          const style = window.getComputedStyle(el);
          let text = el.innerText?.trim().replace(/\s+/g, " ") || "";
      
          // Capturar texto oculto en spans u otros nodos si el.innerText no lo pilla
          if (!text) {
            const spans = el.querySelectorAll("span");
            spans.forEach(span => {
              const spanText = span.innerText?.trim();
              if (spanText) text += " " + spanText;
            });
            text = text.trim();
          }
      
          const fontSize = style.fontSize;
          if (!text && parseFloat(fontSize) === 0) continue;
      
          const tag = el.tagName.toLowerCase();
          const classes = typeof el.className === "string" ? el.className.trim() : "";
          const role = el.getAttribute("role") || "";
      
          let type = "bloque";
      
          // Detectar formularios, imágenes y vídeos
          if (el.matches("form")) type = "formulario";
          else if (el.matches("img")) type = "imagen";
          else if (el.matches("video")) type = "video";
      
          // ✅ Mejora en detección de botones
          else if (
            el.tagName === "BUTTON" ||
            el.getAttribute("type") === "button" ||
            role === "button" ||
            el.matches("a[class*='button'], div[class*='button'], span[class*='button']")
          ) {
            type = "botón";
          }
      
          else if (text.length > 0) type = "texto";
      
          blocks.push({
            selector: getSelector(el),
            tag,
            classes,
            type,
            text: text.slice(0, 200),
            fontSize: style.fontSize,
            fontFamily: style.fontFamily,
            backgroundColor: style.backgroundColor,
            backgroundColorHex: rgbToHex(style.backgroundColor),
            color: style.color,
            colorHex: rgbToHex(style.color)
          });
        }
      
        return blocks;
      };
    
      const getImages = () => {
        const images = [];
        document.querySelectorAll("img").forEach(img => {
          const { src, alt } = img;
          const { width, height } = img.getBoundingClientRect();
          if (src && width > 0 && height > 0) {
            images.push({ src, alt: alt || null, width, height });
          }
        });
        return images;
      };
    
      const getVideos = () => {
        const videos = [];
        document.querySelectorAll("video").forEach(video => {
          const sources = Array.from(video.querySelectorAll("source")).map(s => s.src).filter(Boolean);
          const src = video.src || sources[0] || null;
          const { width, height } = video.getBoundingClientRect();
          if (src && width > 0 && height > 0) {
            videos.push({ src, width, height });
          }
        });
        return videos;
      };
    
      return {
        url: window.location.href,
        title: document.title,
        fontsUsed: getFontsUsed(),
        blocks: getWordPressBlocks(),
        images: getImages(),
        videos: getVideos()
      };
    });

    await browser.close();
    res.json(result);
  } catch (error) {
    console.error("Error al hacer scraping:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
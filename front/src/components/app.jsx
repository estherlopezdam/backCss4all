import { useState } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScrape = async () => {
    if (!url) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:3001/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (response.ok) setResult(data);
      else setError(data.error || "Error desconocido");
    } catch (err) {
      setError(err.message || "Error de red");
    } finally {
      setLoading(false);
    }
  };

  const groupBlocksByType = (blocks) => {
    const grouped = {
      texto: [],
      bloque: [],
      formulario: [],
      botón: [],
      imagen: [],
    };
    blocks.forEach((block) => {
      if (grouped[block.type]) {
        grouped[block.type].push(block);
      } else {
        grouped["bloque"].push(block);
      }
    });
    return grouped;
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "1000px", margin: "0 auto" }}>
      <h1>Analizador visual de estilos web</h1>
  
      <input
        type="text"
        placeholder="Ej: https://tusitio.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem", fontSize: "1rem" }}
      />
      <button onClick={handleScrape} disabled={loading} style={{ padding: "0.5rem 1rem", fontSize: "1rem" }}>
        {loading ? "Analizando..." : "Analizar"}
      </button>
  
      {error && <p style={{ color: "red", marginTop: "1rem" }}>⚠️ {error}</p>}
  
      {result && (
        <div style={{ marginTop: "2rem" }}>
          <h2>{result.title}</h2>
          <p><strong>URL:</strong> {result.url}</p>
  
          <h3>🎨 Fuentes detectadas en la web</h3>
          <ul>
            {result.fontsUsed.map((font, i) => (
              <li key={i} style={{ fontFamily: font }}>{font}</li>
            ))}
          </ul>
  
          <h3>📦 Bloques detectados</h3>
          {Object.entries(groupBlocksByType(result.blocks)).map(([type, items]) => (
            <div key={type} style={{ marginTop: "2rem" }}>
              <h4 style={{ borderBottom: "2px solid #eee", paddingBottom: "0.3rem" }}>
                {type === "texto" && "📝 Textos"}
                {type === "formulario" && "📄 Formularios"}
                {type === "imagen" && "🖼 Imágenes"}
                {type === "botón" && "🔘 Botones"}
                {type === "bloque" && "🧩 Bloques generales"} ({items.length})
              </h4>
              {items.map((block, i) => (
                <div key={i} style={{
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  border: "1px solid #ddd",
                  borderLeft: "4px solid #007acc",
                  backgroundColor: "#f9f9f9"
                }}>
                  {block.text && (
                    <div style={{
                      fontSize: block.fontSize,
                      fontFamily: block.fontFamily,
                      color: block.color,
                      backgroundColor: block.backgroundColor,
                      padding: "0.5rem",
                      border: "1px dashed #ccc",
                      marginBottom: "0.5rem"
                    }}>
                      {block.text}
                    </div>
                  )}
                    <div style={{ fontSize: "0.9rem", color: "#333" }}>cd <frame />
                        <strong>Etiqueta:</strong> {block.tag}<br />
                        <strong>Clases CSS:</strong> <code>{block.classes}</code><br />
                        <strong>Estilo:</strong> {block.fontFamily}, {block.fontSize}<br />
                        <strong>Color de texto:</strong> {block.color} ({block.colorHex})
                        <span style={{
                          display: "inline-block",
                          width: "16px",
                          height: "16px",
                          backgroundColor: block.colorHex,
                          border: "1px solid #ccc",
                          marginLeft: "0.5rem",
                          verticalAlign: "middle"
                        }}></span><br />
                        <strong>Color de fondo:</strong> {block.backgroundColor} ({block.backgroundColorHex})
                        <span style={{
                          display: "inline-block",
                          width: "16px",
                          height: "16px",
                          backgroundColor: block.backgroundColorHex,
                          border: "1px solid #ccc",
                          marginLeft: "0.5rem",
                          verticalAlign: "middle"
                        }}></span><br />
                        <strong>Ubicación (selector):</strong><br />
                        <code style={{ fontSize: "0.8rem", wordBreak: "break-all", color: "#888" }}>{block.selector}</code>
                      </div>
                </div>
              ))}
            </div>
          ))}
  
  {result.images?.length > 0 && (
  <>
    <h3>🖼 Imágenes encontradas ({result.images.length})</h3>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
      {result.images.map((img, i) => (
        <div key={i} style={{ textAlign: "center", border: "1px solid #ddd", padding: "1rem" }}>
          <img src={img.src} alt={img.alt || "Imagen sin alt"} style={{ maxWidth: "100%", maxHeight: "100px" }} />
          <div style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
            <div style={{ maxWidth: "100%", overflowX: "auto", whiteSpace: "nowrap", fontSize: "0.75rem" }}>
              <code>{img.src}</code>
            </div>
            <strong>{img.width}x{img.height}px</strong><br />
            {img.alt && <em>“{img.alt}”</em>}<br />
            <a href={img.src} download style={{ display: "inline-block", marginTop: "0.5rem", padding: "0.2rem 0.5rem", background: "#007acc", color: "#fff", textDecoration: "none", borderRadius: "4px" }}>
              Descargar
            </a>
          </div>
        </div>
      ))}
    </div>
  </>
)}
  
          {result.videos?.length > 0 && (
            <>
              <h3>🎥 Vídeos encontrados ({result.videos.length})</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                {result.videos.map((vid, i) => (
                  <div key={i} style={{ textAlign: "center", border: "1px solid #ddd", padding: "1rem" }}>
                    <video src={vid.src} controls style={{ maxWidth: "100%", maxHeight: "150px" }} />
                    <div style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
                      <code>{vid.src.slice(0, 60)}{vid.src.length > 60 && "..."}</code><br />
                      <strong>{vid.width}x{vid.height}px</strong>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      <div style={{ marginTop: "3rem" }}>
  <button
    onClick={() => {
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resultado.json";
      a.click();
      URL.revokeObjectURL(url);
    }}
    style={{ marginRight: "1rem", padding: "0.5rem 1rem" }}
  >
    Descargar JSON
  </button>

  <button
  onClick={async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(14);
    doc.text(`Resultado del análisis: ${result.title}`, 10, y); y += 10;
    doc.setFontSize(10);
    doc.text(`URL: ${result.url}`, 10, y); y += 10;

    doc.setFont(undefined, "bold");
    doc.text("Fuentes detectadas:", 10, y); y += 6;
    doc.setFont(undefined, "normal");
    result.fontsUsed.forEach((font) => {
      doc.text(`- ${font}`, 12, y);
      y += 6;
    });

    const grouped = {
      texto: [],
      bloque: [],
      formulario: [],
      botón: [],
      imagen: [],
    };
    result.blocks.forEach((block) => {
      if (grouped[block.type]) grouped[block.type].push(block);
      else grouped["bloque"].push(block);
    });

    for (const [type, blocks] of Object.entries(grouped)) {
      y += 10;
      if (y > 280) { doc.addPage(); y = 10; }

      const label = {
        texto: "📝 Textos",
        formulario: "📄 Formularios",
        imagen: "🖼 Imágenes",
        botón: "🔘 Botones",
        bloque: "🧩 Bloques generales"
      }[type] || type;

      doc.setFont(undefined, "bold");
      doc.text(`${label} (${blocks.length})`, 10, y); y += 6;
      doc.setFont(undefined, "normal");

      blocks.forEach((block) => {
        const textPreview = block.text ? block.text.slice(0, 60).replace(/\s+/g, " ") : "[sin texto]";
        const shortSelector = block.selector.length > 80 ? block.selector.slice(0, 77) + "..." : block.selector;
        doc.text(`- ${block.tag.toUpperCase()} | ${textPreview}`, 12, y); y += 6;
        doc.setFontSize(9);
        doc.text(`  ${block.fontFamily}, ${block.fontSize}, ${block.color}`, 12, y); y += 5;
        doc.text(`  Selector: ${shortSelector}`, 12, y); y += 6;
        doc.setFontSize(10);

        if (y > 280) { doc.addPage(); y = 10; }
      });
    }

    doc.save("resultado.pdf");
  }}
  style={{ padding: "0.5rem 1rem" }}
>
  Descargar PDF
</button>
</div>
    </div>
  );
  
}

export default App;
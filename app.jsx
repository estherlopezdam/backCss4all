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
          <p style={{ fontSize: "0.95rem", color: "#555" }}>
            A continuación ves los bloques que usa la web, agrupados por tipo. Esto te ayudará a entender cómo está construida, especialmente si fue hecha con WordPress o Elementor.
          </p>

          {Object.entries(groupBlocksByType(result.blocks)).map(([type, items]) => (
            <div key={type} style={{ marginTop: "2rem" }}>
              <h4 style={{ borderBottom: "2px solid #eee", paddingBottom: "0.3rem" }}>
                {type === "texto" && "📝 Textos"}
                {type === "formulario" && "📄 Formularios"}
                {type === "imagen" && "🖼 Imágenes"}
                {type === "botón" && "🔘 Botones"}
                {type === "bloque" && "🧩 Bloques generales"}

                {" "}({items.length})
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
                  <div style={{ fontSize: "0.9rem", color: "#333" }}>
                    <strong>Etiqueta:</strong> {block.tag}<br />
                    <strong>Clases CSS:</strong> <code>{block.classes}</code><br />
                    <strong>Estilo:</strong> {block.fontFamily}, {block.fontSize}, color: {block.color}<br />
                    <strong>Ubicación (selector):</strong><br />
                    <code style={{ fontSize: "0.8rem", wordBreak: "break-all", color: "#888" }}>{block.selector}</code>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
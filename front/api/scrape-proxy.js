export default async function handler(req, res) {
    const API_URL = process.env.PUBLIC_API_URL;
  
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Solo se permiten peticiones POST  ' });
    }
  
    try {
      const response = await fetch(`${API_URL}:3001/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
  
      const contentType = response.headers.get('content-type') || '';
  
      if (contentType.includes('application/json')) {
        const data = await response.json();
        res.status(response.status).json(data);
      } else {
        const text = await response.text();
        res.status(500).json({ error: 'La API no devolvió JSON', detalle: text });
      }
    } catch (error) {
      console.error('Error en el proxy:', error);
      res.status(500).json({ error: 'Error en el proxy', detalle: error.message });
    }
  }
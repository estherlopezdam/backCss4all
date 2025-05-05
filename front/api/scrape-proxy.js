export default async function handler(req, res) {
    const API_URL = import.meta.env.PUBLIC_API_URL;
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Solo se permiten peticiones POST' });
    }
  
    try {
      const response = await fetch(`${API_URL}:3001/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
  
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error('Error en el proxy:', error);
      res.status(500).json({ error: 'Error en el proxy' });
    }
  }
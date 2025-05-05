export async function POST({ request }) {
    const body = await request.json();
    const API_URL = import.meta.env.PUBLIC_API_URL;
  
    try {
      const response = await fetch(`${API_URL}/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
  
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        const text = await response.text();
        return new Response(JSON.stringify({ error: 'La API no devolvió JSON', detalle: text }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Error en el proxy', detalle: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
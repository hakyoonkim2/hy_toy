// api/markets.js
export default async function handler(req, res) {
  try {
    const apiUrl = 'https://api.upbit.com/v1/market/all?isDetails=true';

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      res.status(response.status).json({ error: 'API Error' });
      return;
    }

    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*'); // CORS 허용
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

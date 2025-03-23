// api/markets.js
// vercel 서버리스 function 용
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

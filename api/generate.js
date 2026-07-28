// Vercel Serverless Function for Gemini AI Route Guidance
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { binName, binAddress, distance, status } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ 
      text: `목적지 ${binName}까지 약 ${distance}m 거리입니다. 쾌적한 이동 경로를 이용하세요.` 
    });
  }

  const prompt = `당신은 스마트 도심 길안내 AI 도우미입니다. 
보행자가 현재 위치에서 쓰레기통 '${binName}'(주소: ${binAddress}, 거리: ${distance}m, 적재상태: ${status})까지 가는 가장 쾌적하고 쉬운 보행 경로를 2문장 이내로 친절하게 안내해주세요.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "길안내 정보를 생성하지 못했습니다.";
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: "Gemini API 오류 발생: " + err.message });
  }
}
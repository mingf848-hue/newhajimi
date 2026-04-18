// Zeabur Node.js Serverless Function
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 从 Zeabur 的环境变量中读取 Key（安全，前端不可见）
  const API_KEY = process.env.GEMINI_API_KEY;
  const { messages, model, temperature, stream } = req.body;

  // 根据请求类型决定请求哪个 Google API 节点
  // 如果你需要支持 Thinking 模型，可以根据前端传来的 model 参数判断
  const baseUrl = "https://generativelanguage.googleapis.com"; 

  try {
    const response = await fetch(
      `${baseUrl}/v1beta/models/${model}:${stream ? 'streamGenerateContent' : 'generateContent'}?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: messages.contents,
          systemInstruction: messages.systemInstruction,
          generationConfig: { 
            temperature: temperature || 0.4, 
            maxOutputTokens: 8000,
            ...(req.body.responseMimeType ? { responseMimeType: req.body.responseMimeType } : {})
          }
        })
      }
    );

    // 如果是流式传输，需要处理 SSE
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // 将 Google 的流直接导向前端
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } else {
      const data = await response.json();
      res.status(200).json(data);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

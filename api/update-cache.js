export default async function handler(req, res) {
  // 1. 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) return res.status(500).json({ error: "No API Key found" });

    const { systemPrompt, model } = req.body;
    const targetModel = model || 'gemini-3-flash-preview'; 

    console.log(`[Cache] 正在尝试创建缓存... 模型: ${targetModel}`);

    // 2. 缓存有效期 (设置为 30 天)
    const CACHE_TTL_SECONDS = 2592000; 

    // 3. 请求 Google API 创建缓存
    const createRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/cachedContents?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: `models/${targetModel}`,
            contents: [],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
            ttl: `${CACHE_TTL_SECONDS}s`
        })
    });

    const data = await createRes.json();

    // 4. 错误处理
    if (data.error) {
        console.error("[Cache] 创建失败:", data.error);
        // 如果内容太短，返回特定标记让前端知道
        if (data.error.message.includes("tokens") || data.error.code === 400) {
            return res.json({ success: true, mode: 'memory', message: "内容不足以创建缓存，使用内存模式" });
        }
        return res.status(500).json({ error: data.error.message });
    }

    // 5. 成功返回 ID 和直观的过期时间
    const expireDate = new Date(data.expireTime);
    console.log(`[Cache] 创建成功! ID: ${data.name}`);
    console.log(`[Cache] ✅ 缓存有效期至: ${expireDate.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
    
    res.status(200).json({ success: true, id: data.name, expireTime: data.expireTime });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: error.message });
  }
}

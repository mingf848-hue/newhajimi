// DISABLED: 本文件是裸代理（无 context cache），一旦被 Zeabur 的 /api/* 文件路由命中
// 会完全绕过 server.js 的缓存机制 → 每次请求全价计费。
// 真正的入口在 server.js 的 app.post('/api/gemini', ...)。
export default async function handler(req, res) {
  return res.status(410).json({
    error: 'This route is disabled. All Gemini traffic must go through server.js for context caching.'
  });
}

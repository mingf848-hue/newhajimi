import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// --- 配置区域 ---
const PORT = process.env.PORT || 8080;

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// --- 连接 MongoDB ---
// ==========================================
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.error('❌ 致命错误: 环境变量中缺少 MONGODB_URI，请在 Zeabur 控制台配置！');
    process.exit(1); 
}

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB 连接成功'))
    .catch(err => console.error('❌ MongoDB 连接失败:', err));

const getModel = (col) => mongoose.models[col] || mongoose.model(col, new mongoose.Schema({ _id: String }, { strict: false }), col);

// ==========================================
// --- 动态数据库 API ---
// ==========================================
app.get('/api/db/:collection', async (req, res) => {
    try {
        const col = req.params.collection;
        let filter = {};
        
        if (req.query.active) filter.active = req.query.active === 'true';

        if (col === 'scripts' && req.query.user) {
            if (req.query.user === 'aratakito') {
                filter.$or = [ { user: 'aratakito' }, { user: { $exists: false } }, { user: null }, { user: '' } ];
            } else {
                filter.user = req.query.user;
            }
        } else if (req.query.user) {
            filter.user = req.query.user;
        }

        let query = getModel(col).find(filter);
        if (['scripts', 'images', 'announcement_logs', 'training_data'].includes(col)) {
            query = query.sort({ time: -1 });
        }
        if (req.query.limit) query = query.limit(parseInt(req.query.limit));

        const docs = await query.lean();
        res.json(docs.map(d => ({ ...d, id: d._id })));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/db/:collection/:id', async (req, res) => {
    try {
        const doc = await getModel(req.params.collection).findById(req.params.id).lean();
        res.json(doc ? { ...doc, id: doc._id } : null);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/db/:collection', async (req, res) => {
    try {
        const Model = getModel(req.params.collection);
        const data = req.body;
        let id = data.id || data._id;

        const payload = { ...data };
        delete payload.id;
        delete payload._id;

        if (id && !id.startsWith('new_')) {
            await Model.findByIdAndUpdate(id, { $set: payload }, { upsert: true });
        } else {
            id = new mongoose.Types.ObjectId().toString();
            await Model.create({ _id: id, ...payload });
        }
        res.json({ success: true, id });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/db/:collection/:id', async (req, res) => {
    try {
        await getModel(req.params.collection).findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ==========================================
// --- 图片存储 API (MongoDB) ---
// ==========================================
app.post('/api/upload-image', async (req, res) => {
    try {
        const { imageData, mimeType, title, tags, time } = req.body;
        if (!imageData || !tags) return res.status(400).json({ error: '缺少图片数据或标签' });
        const ImageModel = getModel('images');
        const id = new mongoose.Types.ObjectId().toString();
        await ImageModel.create({
            _id: id,
            title: title || '',
            tags,
            url: `/api/images/${id}`,
            storagePath: null,
            imageData,
            mimeType: mimeType || 'image/jpeg',
            time: time || new Date().toISOString()
        });
        res.json({ success: true, id, url: `/api/images/${id}` });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/images/:id', async (req, res) => {
    try {
        const doc = await getModel('images').findById(req.params.id).lean();
        if (!doc || !doc.imageData) return res.status(404).json({ error: '图片不存在' });
        const buf = Buffer.from(doc.imageData, 'base64');
        res.set('Content-Type', doc.mimeType || 'image/jpeg');
        res.set('Cache-Control', 'public, max-age=31536000');
        res.send(buf);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/update-cache', async (req, res) => {
    try {
        const module = await import('./api/update-cache.js');
        const handler = module.default || module;
        if (typeof handler === 'function') await handler(req, res);
        else res.status(500).json({ error: "处理函数加载失败" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// --- 孤儿缓存清理 API (已修改为无差别清理) ---
// ==========================================
app.post('/api/cleanup-caches', async (req, res) => {
    try {
        const API_KEY = process.env.GEMINI_API_KEY;
        if (!API_KEY) return res.status(500).json({ error: 'No API Key' });

        // 列出 Google 侧全部缓存
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/cachedContents?key=${API_KEY}`);
        const listData = await listRes.json();
        const all = listData.cachedContents || [];

        let deleted = 0, failed = 0;
        // 无差别清理：删除云端找到的所有缓存
        await Promise.all(all.map(async (c) => {
            try {
                const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/${c.name}?key=${API_KEY}`, { method: 'DELETE' });
                if (r.ok || r.status === 404) deleted++;
                else { failed++; console.warn(`[Cleanup] 删除失败(${r.status}): ${c.name}`); }
            } catch (e) { failed++; }
        }));

        console.log(`[Cleanup] 彻底清理完成: 删除 ${deleted}, 失败 ${failed}`);
        res.json({ success: true, deleted, kept: 0, failed, activeId: null });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ==========================================
// --- Gemini Proxy API (已彻底关闭自动缓存) ---
// ==========================================
function extractJSON(buffer) {
    let results = [];
    let braceCount = 0;
    let inString = false;
    let escaped = false;
    let startIndex = -1;
    let lastIndex = 0;
    for (let i = 0; i < buffer.length; i++) {
        const char = buffer[i];
        if (inString) {
            if (escaped) escaped = false;
            else if (char === '\\') escaped = true;
            else if (char === '"') inString = false;
        } else {
            if (char === '"') inString = true;
            else if (char === '{') {
                if (braceCount === 0) startIndex = i;
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                if (braceCount === 0 && startIndex !== -1) {
                    results.push(buffer.substring(startIndex, i + 1));
                    startIndex = -1;
                    lastIndex = i + 1;
                }
            }
        }
    }
    return { results, remaining: buffer.substring(lastIndex) };
}

app.post('/api/gemini', async (req, res) => {
    try {
        const API_KEY = process.env.GEMINI_API_KEY;
        if (!API_KEY) return res.status(500).json({ error: "No API Key" });

        const { messages, stream, temperature, mode, maxOutputTokens } = req.body;

        const TARGET_MODEL = 'gemini-3.1-flash-lite-preview';
        const THINKING_LEVEL = mode === 'think' ? 'high' : 'low';

        // 直接走标准请求，不再创建或检索 cachedContent
        let url = `https://generativelanguage.googleapis.com/v1beta/models/${TARGET_MODEL}:${stream ? 'streamGenerateContent' : 'generateContent'}?key=${API_KEY}`;
        let body = {
            contents: messages.contents,
            systemInstruction: messages.systemInstruction, // 直接将全量系统设定放入请求体
            generationConfig: {
                temperature: temperature || 0.4,
                maxOutputTokens: maxOutputTokens || 8000,
                thinkingConfig: { thinkingLevel: THINKING_LEVEL }
            }
        };

        const googleResponse = await fetch(url, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(body) 
        });

        if (!googleResponse.ok) {
            const errText = await googleResponse.text();
            res.setHeader('X-Cache-Action', 'disabled');
            return res.status(googleResponse.status).json({ error: errText });
        }

        // 通知前端状态栏：缓存机制已彻底禁用
        res.setHeader('X-Cache-Action', 'disabled');
        res.setHeader('X-Cache-Model', TARGET_MODEL);
        res.setHeader('X-Cache-Thinking', THINKING_LEVEL);
        res.setHeader('Access-Control-Expose-Headers', 'X-Cache-Action, X-Cache-Model, X-Cache-Thinking');

        if (stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            
            let buffer = '';
            const decoder = new TextDecoder();
            for await (const chunk of googleResponse.body) {
                const str = decoder.decode(chunk, { stream: true });
                buffer += str;
                const { results, remaining } = extractJSON(buffer);
                buffer = remaining;
                for (const jsonStr of results) {
                    try { res.write(`data: ${JSON.stringify(JSON.parse(jsonStr))}\n\n`); } catch (e) {}
                }
            }
            res.end();
        } else {
            const data = await googleResponse.json();
            res.json(data);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

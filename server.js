import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// --- 配置区域 ---
const PORT = process.env.PORT || 8080;
// 移除全局的 TARGET_MODEL，改为动态获取

// 缓存状态池（全量统一走 flash-lite，单模型单条记录）
// 持久化到 Mongo，Zeabur 冷启/重启不丢失，避免每次重启都重建缓存。
const cachePool = {
    'gemini-3.1-flash-lite-preview': { id: null, hash: null, expireTime: null }
};

// 并发去重：同一模型同一 hash 并发创建请求共用一个 Promise
const inFlightCreation = {};

let cacheStore = null;
async function hydrateCachePool() {
    try {
        if (!cacheStore) cacheStore = getModel('gemini_cache_pool');
        const rows = await cacheStore.find({}).lean();
        for (const r of rows) {
            if (cachePool[r._id]) {
                cachePool[r._id] = { id: r.id || null, hash: r.hash ?? null, expireTime: r.expireTime || null };
            }
        }
        console.log('[Cache] 已从 Mongo 恢复缓存池:', JSON.stringify(cachePool));
    } catch (e) {
        console.warn('[Cache] 恢复缓存池失败（非致命）:', e.message);
    }
}
async function persistCachePool(model) {
    try {
        if (!cacheStore) cacheStore = getModel('gemini_cache_pool');
        const c = cachePool[model];
        await cacheStore.updateOne(
            { _id: model },
            { $set: { id: c.id, hash: c.hash, expireTime: c.expireTime, updatedAt: new Date() } },
            { upsert: true }
        );
    } catch (e) {
        console.warn('[Cache] 持久化失败（非致命）:', e.message);
    }
}
async function deleteRemoteCache(apiKey, cacheId) {
    if (!cacheId) return;
    try {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/${cacheId}?key=${apiKey}`, { method: 'DELETE' });
        if (r.ok) console.log(`[Cache] 🗑️  已删除孤儿缓存: ${cacheId}`);
        else console.warn(`[Cache] 删除孤儿缓存失败(${r.status}): ${cacheId}`);
    } catch (e) {
        console.warn('[Cache] 删除孤儿缓存异常:', e.message);
    }
}

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
    .then(async () => {
        console.log('✅ MongoDB 连接成功');
        await hydrateCachePool();
    })
    .catch(err => console.error('❌ MongoDB 连接失败:', err));

const getModel = (col) => mongoose.models[col] || mongoose.model(col, new mongoose.Schema({ _id: String }, { strict: false }), col);

// --- 动态数据库 API ---
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

// --- 大模型缓存更新 API ---
app.post('/api/update-cache', async (req, res) => {
    try {
        const module = await import('./api/update-cache.js');
        const handler = module.default || module;
        if (typeof handler === 'function') await handler(req, res);
        else res.status(500).json({ error: "处理函数加载失败" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// --- 孤儿缓存清理 API ---
app.post('/api/cleanup-caches', async (req, res) => {
    try {
        const API_KEY = process.env.GEMINI_API_KEY;
        if (!API_KEY) return res.status(500).json({ error: 'No API Key' });

        const activeId = cachePool['gemini-3.1-flash-lite-preview']?.id || null;

        // 列出 Google 侧全部缓存
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/cachedContents?key=${API_KEY}`);
        const listData = await listRes.json();
        const all = listData.cachedContents || [];

        let deleted = 0, kept = 0, failed = 0;
        await Promise.all(all.map(async (c) => {
            if (c.name === activeId) { kept++; return; }
            try {
                const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/${c.name}?key=${API_KEY}`, { method: 'DELETE' });
                if (r.ok || r.status === 404) deleted++;
                else { failed++; console.warn(`[Cleanup] 删除失败(${r.status}): ${c.name}`); }
            } catch (e) { failed++; }
        }));

        console.log(`[Cleanup] 完成: 删除 ${deleted}, 保留 ${kept}, 失败 ${failed}`);
        res.json({ success: true, deleted, kept, failed, activeId });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- Gemini Proxy 代码 ---
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

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }
    return hash;
}

app.post('/api/gemini', async (req, res) => {
    try {
        const API_KEY = process.env.GEMINI_API_KEY;
        if (!API_KEY) return res.status(500).json({ error: "No API Key" });

        const { messages, stream, temperature, mode, maxOutputTokens } = req.body;

        // 🌟 全量统一 flash-lite，用 thinking_level 区分档位（彻底不再用 Pro）
        // - MODE_FAST: thinking_level=low（客服/triage/公告，延迟低、最省）
        // - MODE_THINK: thinking_level=high（训练/OCR/进化，需要深度推理，依然是 flash-lite 价）
        const TARGET_MODEL = 'gemini-3.1-flash-lite-preview';
        const THINKING_LEVEL = mode === 'think' ? 'high' : 'low';
        const modelCache = cachePool[TARGET_MODEL];
        
        const currentSystemPrompt = messages.systemInstruction?.parts?.[0]?.text || "";
        const currentHash = simpleHash(currentSystemPrompt);

        // cacheAction 用于在响应头上告诉前端本次动作（hit/created/skipped/failed）
        // - skipped: prompt 太短（<2000 字），不启用缓存
        // - hit: 使用了既有 cacheId
        // - created: 本次刚创建了新缓存并使用
        // - failed: 创建失败或远端已失效，本次走全量
        let cacheAction = 'skipped';

        // 缓存创建改为 await：让**当前这次**请求就用上 cacheId，而不是白白多付一次全量。
        // 同时在 hash 变化时先 DELETE 老缓存，避免孤儿缓存按存储时间继续计费。
        // 并发去重：同一模型同一 hash 的并发请求共用一次创建。
        if (currentSystemPrompt.length > 2000 && (!modelCache.id || modelCache.hash !== currentHash)) {
            const flightKey = `${TARGET_MODEL}:${currentHash}`;
            if (!inFlightCreation[flightKey]) {
                const oldId = modelCache.id;
                inFlightCreation[flightKey] = (async () => {
                    try {
                        console.log(`[Auto-Cache] 触发自动长效缓存机制... 模型: ${TARGET_MODEL}`);
                        const createRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/cachedContents?key=${API_KEY}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                model: `models/${TARGET_MODEL}`,
                                contents: [],
                                systemInstruction: { parts: [{ text: currentSystemPrompt }] },
                                ttl: '2592000s'
                            })
                        });
                        const createData = await createRes.json();
                        if (createData.name) {
                            modelCache.id = createData.name;
                            modelCache.hash = currentHash;
                            modelCache.expireTime = createData.expireTime || null;
                            console.log(`[Auto-Cache] ✅ 缓存创建成功! 模型: ${TARGET_MODEL}, ID: ${modelCache.id}`);
                            persistCachePool(TARGET_MODEL);
                            if (oldId && oldId !== modelCache.id) deleteRemoteCache(API_KEY, oldId);
                            return 'created';
                        }
                        if (createData.error) {
                            console.error("[Auto-Cache] 创建失败，本次走全量:", createData.error.message);
                        }
                        return 'failed';
                    } catch (e) {
                        console.error("[Auto-Cache] 请求异常，本次走全量:", e.message);
                        return 'failed';
                    }
                })();
            } else {
                console.log(`[Auto-Cache] 复用正在创建的缓存 (并发去重): ${flightKey}`);
            }
            try {
                const result = await inFlightCreation[flightKey];
                cacheAction = result === 'created'
                    ? (modelCache.hash === currentHash ? 'created' : 'failed')
                    : 'failed';
            } finally {
                delete inFlightCreation[flightKey];
            }
        } else if (modelCache.id && modelCache.hash === currentHash) {
            cacheAction = 'hit';
        }

        const sendRequest = async (useCacheId) => {
            let url = `https://generativelanguage.googleapis.com/v1beta/models/${TARGET_MODEL}:${stream ? 'streamGenerateContent' : 'generateContent'}?key=${API_KEY}`;
            let body = {
                contents: messages.contents,
                generationConfig: {
                    temperature: temperature || 0.4,
                    maxOutputTokens: maxOutputTokens || 8000,
                    thinkingConfig: { thinkingLevel: THINKING_LEVEL }
                }
            };
            if (useCacheId) {
                body.cachedContent = useCacheId;
            } else {
                body.systemInstruction = messages.systemInstruction;
            }
            return await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        };

        let googleResponse;
        if (modelCache.id && modelCache.hash === currentHash) {
            googleResponse = await sendRequest(modelCache.id);
            if (googleResponse.status === 404 || googleResponse.status === 403) {
                console.warn(`[Cache] 远端缓存失效(${googleResponse.status})，清理并走全量: ${modelCache.id}`);
                modelCache.id = null;
                modelCache.hash = null;
                modelCache.expireTime = null;
                persistCachePool(TARGET_MODEL);
                googleResponse = await sendRequest(null);
                cacheAction = 'failed';
            }
        } else {
            googleResponse = await sendRequest(null);
        }

        if (!googleResponse.ok) {
            const errText = await googleResponse.text();
            res.setHeader('X-Cache-Action', cacheAction);
            return res.status(googleResponse.status).json({ error: errText });
        }

        // 在响应开始前设置诊断 header（对流式/非流式都有效）
        res.setHeader('X-Cache-Action', cacheAction);
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

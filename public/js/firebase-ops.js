// ==========================================
// Firebase 初始化与全局数据库操作 (fbOps)
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCFX_coAa6O_INyh_5uwkLtkfep2VehJxc",
    authDomain: "hajimi-assistant.firebaseapp.com",
    projectId: "hajimi-assistant",
    storageBucket: "hajimi-assistant.firebasestorage.app",
    messagingSenderId: "915974880846",
    appId: "1:915974880846:web:cf8b304605b1c892b68d1f",
    measurementId: "G-2H3YST6145"
};

window.safeStringify = (obj, indent = 2) => {
    const cache = new Set();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (cache.has(value)) return '[Circular]';
            cache.add(value);
        }
        return value;
    }, indent);
};

try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    signInAnonymously(auth).catch(() => {});
    window.storage = getStorage(app);

    window.fbOps = {
        apiCall: async (method, path, body = null) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); 
            try {
                // 1. 修复：防止浏览器 GET 缓存 (加上随机时间戳)
                if (method === 'GET') {
                    path += (path.includes('?') ? '&' : '?') + 't=' + Date.now();
                }

                // 2. 修复：强制 no-store
                const opts = { 
                    method, 
                    headers: { 'Content-Type': 'application/json' }, 
                    signal: controller.signal,
                    cache: 'no-store'
                };
                if (body) opts.body = JSON.stringify(body);
                
                const res = await fetch(path, opts);
                if (!res.ok) throw new Error(await res.text());
                return await res.json();
            } finally {
                clearTimeout(timeoutId);
            }
        },

        // 身份验证
        verifyLogin: async (code) => {
            return window.fbOps.apiCall('POST', '/api/db/verifyLogin', { code });
        },

        // 话术管理
        getScripts: async () => {
            const user = localStorage.getItem('hajimi_username') || 'Unknown';
            return window.fbOps.apiCall('GET', `/api/db/scripts?user=${encodeURIComponent(user)}`);
        },
        saveScript: async (script) => {
            // 3. 修复：补全 user 和 time 字段，保证 MongoDB 排序生效！
            const user = localStorage.getItem('hajimi_username') || 'Unknown';
            const payload = { ...script, user };
            if (!payload.time) payload.time = new Date().toLocaleString();
            
            return window.fbOps.apiCall('POST', '/api/db/scripts', payload);
        },
        deleteScript: async (id) => {
            // 4. 修复：统一修改所有 DELETE 路由格式为 /:collection/:id
            return window.fbOps.apiCall('DELETE', `/api/db/scripts/${id}`);
        },

        // 图片管理
        getImages: async () => {
            return window.fbOps.apiCall('GET', '/api/db/images');
        },
        uploadImage: async (file, title, tags) => {
            const storagePath = `images/${Date.now()}_${file.name}`;
            const storageRef = ref(window.storage, storagePath);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            return window.fbOps.apiCall('POST', '/api/db/images', { url, title, tags, storagePath, time: new Date().toLocaleString() });
        },
        deleteImage: async (id, storagePath) => {
            if (storagePath) {
                const storageRef = ref(window.storage, storagePath);
                await deleteObject(storageRef).catch(e => console.warn("Storage delete failed", e));
            }
            return window.fbOps.apiCall('DELETE', `/api/db/images/${id}`);
        },

        // AI 设定与知识库
        getCloudPrompts: async () => {
            return window.fbOps.apiCall('GET', '/api/db/settings');
        },
        saveCloudPrompts: async (settings) => {
            return window.fbOps.apiCall('POST', '/api/db/settings', settings);
        },
        getKnowledge: async () => {
            return window.fbOps.apiCall('GET', '/api/db/knowledge');
        },

        // 训练日志
        getTrainingDataAll: async () => {
            return window.fbOps.apiCall('GET', '/api/db/training');
        },
        saveFeedback: async (feedback) => {
            if (!feedback.time) feedback.time = new Date().toLocaleString();
            return window.fbOps.apiCall('POST', '/api/db/training', feedback);
        },
        deleteTrainingData: async (id) => {
            return window.fbOps.apiCall('DELETE', `/api/db/training/${id}`);
        },

        // 公告模板
        getTemplates: async () => {
            return window.fbOps.apiCall('GET', '/api/db/templates');
        },
        saveTemplate: async (template) => {
            return window.fbOps.apiCall('POST', '/api/db/templates', template);
        },
        deleteTemplate: async (id) => {
            return window.fbOps.apiCall('DELETE', `/api/db/templates/${id}`);
        },
        getAnnLogsAll: async () => {
            return window.fbOps.apiCall('GET', '/api/db/annLogs');
        },
        saveAnnFeedback: async (feedback) => {
            if (!feedback.time) feedback.time = new Date().toLocaleString();
            return window.fbOps.apiCall('POST', '/api/db/annLogs', feedback);
        },
        deleteAnnLog: async (id) => {
            return window.fbOps.apiCall('DELETE', `/api/db/annLogs/${id}`);
        },
        getRecentBadAnnouncements: async () => {
            const logs = await window.fbOps.getAnnLogsAll();
            return logs.filter(l => l.type === 'bad');
        },

        // 注单监控 (Tracker)
        getTrackedTickets: async (user) => {
            return window.fbOps.apiCall('GET', `/api/db/tracker?user=${encodeURIComponent(user)}`);
        },
        saveTrackedTicket: async (ticket) => {
            return window.fbOps.apiCall('POST', '/api/db/tracker', ticket);
        },
        deleteTrackedTicket: async (orderId) => {
            return window.fbOps.apiCall('DELETE', `/api/db/tracker/${orderId}`);
        },

        // 变量管理
        getCustomVars: async () => {
            return window.fbOps.apiCall('GET', '/api/db/vars');
        },
        addCustomVar: async (v) => {
            // 特殊处理变量添加
            return window.fbOps.apiCall('POST', '/api/db/vars', { _id: v, name: v });
        },
        deleteCustomVar: async (v) => {
            // 保持与 server.js 的删除路径一致
            return window.fbOps.apiCall('DELETE', `/api/db/vars/${encodeURIComponent(v)}`);
        },

        // 账号管理
        getAccounts: async () => {
            return window.fbOps.apiCall('GET', '/api/db/accounts');
        },
        saveAccount: async (acc) => {
            return window.fbOps.apiCall('POST', '/api/db/accounts', acc);
        },
        deleteAccount: async (id) => {
            return window.fbOps.apiCall('DELETE', `/api/db/accounts/${id}`);
        },

        // 备份
        getAllDataForBackup: async () => {
            return window.fbOps.apiCall('GET', '/api/db/backup');
        }
    };

    window.firebaseLoaded = true;
    if (window.onFirebaseReady) {
        window.onFirebaseReady();
    }

} catch (error) {
    console.error("Firebase 初始化失败:", error);
}

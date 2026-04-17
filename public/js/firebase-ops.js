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

// 全局安全序列化工具
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

    // ==========================================
    // 全局 fbOps 对象：所有的数据库 API 交互
    // ==========================================
    window.fbOps = {
        apiCall: async (method, path, body = null) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); 
            try {
                const opts = { method, headers: { 'Content-Type': 'application/json' }, signal: controller.signal };
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
            return window.fbOps.apiCall('POST', '/api/db/scripts', script);
        },
        deleteScript: async (id) => {
            return window.fbOps.apiCall('DELETE', `/api/db/scripts?id=${id}`);
        },

        // 图片管理 (含 Storage 操作)
        getImages: async () => {
            return window.fbOps.apiCall('GET', '/api/db/images');
        },
        uploadImage: async (file, title, tags) => {
            const storagePath = `images/${Date.now()}_${file.name}`;
            const storageRef = ref(window.storage, storagePath);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            return window.fbOps.apiCall('POST', '/api/db/images', { url, title, tags, storagePath });
        },
        deleteImage: async (id, storagePath) => {
            if (storagePath) {
                const storageRef = ref(window.storage, storagePath);
                await deleteObject(storageRef).catch(e => console.warn("Storage delete failed", e));
            }
            return window.fbOps.apiCall('DELETE', `/api/db/images?id=${id}`);
        },

        // AI 设定与训练
        getCloudPrompts: async () => {
            return window.fbOps.apiCall('GET', '/api/db/settings');
        },
        saveCloudPrompts: async (settings) => {
            return window.fbOps.apiCall('POST', '/api/db/settings', settings);
        },
        getKnowledge: async () => {
            return window.fbOps.apiCall('GET', '/api/db/knowledge');
        },

        // 训练日志管理
        getTrainingDataAll: async () => {
            return window.fbOps.apiCall('GET', '/api/db/training');
        },
        saveFeedback: async (feedback) => {
            return window.fbOps.apiCall('POST', '/api/db/training', feedback);
        },
        deleteTrainingData: async (id) => {
            return window.fbOps.apiCall('DELETE', `/api/db/training?id=${id}`);
        },

        // 公告管理
        getTemplates: async () => {
            return window.fbOps.apiCall('GET', '/api/db/templates');
        },
        saveTemplate: async (template) => {
            return window.fbOps.apiCall('POST', '/api/db/templates', template);
        },
        deleteTemplate: async (id) => {
            return window.fbOps.apiCall('DELETE', `/api/db/templates?id=${id}`);
        },
        getAnnLogsAll: async () => {
            return window.fbOps.apiCall('GET', '/api/db/annLogs');
        },
        saveAnnFeedback: async (feedback) => {
            return window.fbOps.apiCall('POST', '/api/db/annLogs', feedback);
        },
        deleteAnnLog: async (id) => {
            return window.fbOps.apiCall('DELETE', `/api/db/annLogs?id=${id}`);
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
            return window.fbOps.apiCall('DELETE', `/api/db/tracker?id=${orderId}`);
        },

        // 变量管理
        getCustomVars: async () => {
            return window.fbOps.apiCall('GET', '/api/db/vars');
        },
        addCustomVar: async (v) => {
            return window.fbOps.apiCall('POST', '/api/db/vars', { name: v });
        },
        deleteCustomVar: async (v) => {
            return window.fbOps.apiCall('DELETE', `/api/db/vars?name=${encodeURIComponent(v)}`);
        },

        // 账号管理 (仅管理员)
        getAccounts: async () => {
            return window.fbOps.apiCall('GET', '/api/db/accounts');
        },
        saveAccount: async (acc) => {
            return window.fbOps.apiCall('POST', '/api/db/accounts', acc);
        },
        deleteAccount: async (id) => {
            return window.fbOps.apiCall('DELETE', `/api/db/accounts?id=${id}`);
        },

        // 备份
        getAllDataForBackup: async () => {
            return window.fbOps.apiCall('GET', '/api/db/backup');
        }
    };

    // 通知核心 App 组件：Firebase 已就绪
    window.firebaseLoaded = true;
    if (window.onFirebaseReady) {
        window.onFirebaseReady();
    }

} catch (error) {
    console.error("Firebase 初始化失败:", error);
}

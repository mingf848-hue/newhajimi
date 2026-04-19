// ==========================================
// 工具函数和常量
// ==========================================

const UtilsLib = {
    // 注单结果映射逻辑
    mapTicketOutcome(rawItem) {
        let resultStr = "未结算";
        let status = 'pending';

        const isSettled = rawItem.outcome !== null && rawItem.outcome !== 0 && rawItem.outcome !== 1;

        if (isSettled) {
            if (rawItem.outcome === 4 || rawItem.outcome === 5) {
                resultStr = "赢 " + rawItem.localProfitAmount;
                status = 'win';
            } else if (rawItem.outcome === 3 || rawItem.outcome === 6) {
                resultStr = "输 " + rawItem.localProfitAmount;
                status = 'loss';
            } else if (rawItem.outcome === 2) {
                resultStr = "走水";
                status = 'draw';
            } else if (rawItem.remark && rawItem.remark.includes('取消')) {
                resultStr = "注单取消";
                status = 'cancelled';
            } else if (rawItem.remark && (rawItem.remark.includes('拒单') || rawItem.remark.includes('失败'))) {
                resultStr = "投注失败";
                status = 'cancelled';
            }
        }

        return { resultStr, status };
    },

    // 通知助手函数
    createNotification(title, message, type = 'error') {
        return { title, message, type };
    },

    // 分类颜色 —— 根据字符串哈希稳定映射到 8 种调色板
    categoryColor(name) {
        if (!name) return 6; // 默认 6 (蓝)
        let h = 0;
        for (let i = 0; i < name.length; i++) {
            h = (h * 31 + name.charCodeAt(i)) >>> 0;
        }
        return (h % 8) + 1;
    },

    // 安全加载异步数据
    async safeLoad(asyncFn, defaultValue = null) {
        try {
            return await asyncFn();
        } catch (e) {
            console.warn('Failed to load data:', e);
            return defaultValue;
        }
    },

    // 日期格式化
    getTimestamp() {
        return new Date().toLocaleString();
    },

    getDateOnly() {
        return new Date().toISOString().slice(0, 10);
    },

    // 训练日志过滤
    filterTrainingLogs(logs, feedbackField) {
        return logs.filter(l => (l.type === 'bad' && l[feedbackField]) || l.type === 'good');
    },

    // 并行加载多个数据源
    async loadDataInParallel(fbOps, user) {
        const results = await Promise.all([
            this.safeLoad(() => fbOps.getScripts(), []),
            this.safeLoad(() => fbOps.getImages(), []),
            this.safeLoad(() => fbOps.getCloudPrompts(), {}),
            this.safeLoad(() => fbOps.getTemplates(), []),
            this.safeLoad(() => fbOps.getCustomVars(), []),
            this.safeLoad(() => fbOps.getTrackedTickets(user), []),
            this.safeLoad(() => fbOps.getKnowledge(), []),
            this.safeLoad(() => fbOps.getVenueRules ? fbOps.getVenueRules() : [], [])
        ]);

        return {
            scripts: results[0],
            images: results[1],
            settings: results[2],
            templates: results[3],
            customVars: results[4],
            tracked: results[5],
            knowledge: results[6],
            venueRules: results[7]
        };
    },

    // 常用消息常量
    MESSAGES: {
        TICKET_ADDED: (orderId) => `✅ 注单 ${orderId} 已加入监控台`,
        TICKETS_SETTLED: (count) => `🎉 发现 ${count} 张注单已结算完成！`,
        FILL_NOTICE_CONTENT: '请先填入原始通知内容',
        FILL_AI_FEEDBACK: '请告诉AI哪里错了，需要怎么改',
        NO_TRAINING_DATA: '未发现有效的训练记录，无法优化。',
        FILL_USERNAME: '请填写用户名',
        DEFAULT_VAR_IMMUTABLE: '系统默认变量不可删除',
        TEMPLATE_NOT_FOUND: '所选模板不存在或已被删除',
        TITLE_TIP: '提示',
        TITLE_GENERATE_ERROR: '生成错误',
        TITLE_EVOLUTION_SUCCESS: '进化成功',
        TITLE_TRAINING_COMPLETE: '训练完成'
    },

    // API相关常量
    API_ENDPOINTS: {
        GEMINI: '/api/gemini',
        UPDATE_CACHE: '/api/update-cache',
        DB: '/api/db'
    },

    // 会话相关常量
    SESSION_KEY_TIME: 'session_time',
    SESSION_KEY_USER: 'session_user',
    SESSION_KEY_ROLE: 'session_role',
    SESSION_TIMEOUT: 86400000, // 24 hours
    CACHE_TTL_SECONDS: 2592000, // 30 days

    // 压缩图片 - 保留文字清晰度但大幅减小体积，默认最大宽度 1600px
    async compressImage(file, maxWidth = 1600, quality = 0.85) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onload = (ev) => {
                const img = new Image();
                img.onerror = reject;
                img.onload = () => {
                    const scale = img.width > maxWidth ? maxWidth / img.width : 1;
                    const w = Math.round(img.width * scale);
                    const h = Math.round(img.height * scale);
                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, w, h);
                    // 统一输出 JPEG 以最大化压缩率（文字截图 JPEG q=0.85 肉眼无差）
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    const base64 = dataUrl.split(',')[1];
                    resolve({
                        mimeType: 'image/jpeg',
                        data: base64,
                        name: file.name,
                        originalSize: file.size,
                        newSize: Math.round(base64.length * 0.75),
                        width: w,
                        height: h
                    });
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
    },

    // 字节级 SHA-256（用于"完全相同的文件"去重）
    async sha256Base64(b64) {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const hash = await crypto.subtle.digest('SHA-256', bytes);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
};

window.UtilsLib = UtilsLib;

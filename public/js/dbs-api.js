// ==========================================
// 业务后台 API (DBS)
// ==========================================

const DBS_API = {
    login: async () => {
        try {
            const res = await fetch(`https://api.dbsportxxxwo8.com/yewu17/admin/auth/login?rnd=${Date.now()}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "username": "ybbw03", "password": "2d09ad82e52c0e38c1f950b43367373f" })
            });
            const data = await res.json();
            if (data.code === "0000000" && data.data?.token) {
                localStorage.setItem('dbs_token_cache', data.data.token);
                localStorage.setItem('dbs_token_time', Date.now().toString());
                return data.data.token;
            }
        } catch (e) { console.error("AutoLogin Failed", e); }
        return null;
    },

    getToken: async () => {
        let token = localStorage.getItem('dbs_token_cache');
        const time = localStorage.getItem('dbs_token_time');
        if (token && time && (Date.now() - parseInt(time) < 3.5 * 3600 * 1000)) return token;
        return await DBS_API.login();
    },

    formatForAI: (item, details) => {
        if (!item || !details || details.length === 0) return "未找到该注单详细信息。";
        let summary = `【注单类型】: ${item.seriesValue || "单关"} (下注:${item.localBetAmount}, 输赢:${item.localProfitAmount})\n`;
        let detailsText = "";
        details.forEach((d, index) => {
            let legResult = "未知";
            if (d.betResult === 4) legResult = "全赢";
            else if (d.betResult === 5) legResult = "赢一半";
            else if (d.betResult === 3) legResult = "输 (Loss)";
            else if (d.betResult === 6) legResult = "输一半";
            else if (d.betResult === 2) legResult = "走水/退款";
            else if (d.betResult === 1) legResult = "未结算(Pending)";
            const killMark = (d.betResult === 3 || d.betResult === 6) ? "❌ [关键输单]" : "✅";
            const scoreStr = d.settleScore ? d.settleScore.replace("全场比分 ", "") : "未出比分";
            detailsText += `\n    ➤ 第${index + 1}关 ${killMark}:\n       - 比赛: ${d.matchInfo} (ID: ${d.matchId})\n       - 玩法: ${d.playName} - 【${d.playOptionName}】\n       - 赛果: 比分[${scoreStr}] -> 结果: ${legResult} ${d.remark ? `(${d.remark})` : ''}`;
        });
        let stateConclusion = item.remark || (item.profitAmount >= 0 ? '盈利' : '亏损');
        if (item.remark && (item.remark.includes('失效') || item.remark.includes('取消') || item.remark.includes('无效'))) {
            stateConclusion = `🚫 已失效/已取消 (${item.remark})`;
        }
        return summary + detailsText + `\n\n【系统总结】: 此单最终状态为 ${stateConclusion}。`;
    },

    queryAnnouncement: async (matchId) => {
        if (!matchId) return null;
        const token = await DBS_API.getToken();
        if (!token) return null;
        try {
            const payload = { "mid": matchId, "status": 1, "pgNum": 1, "pgSize": 20 };
            const res = await fetch(`https://api.dbsportxxxwo8.com/yewu17/admin/noticeNew/notice?mid=${matchId}&status=1&pgNum=1&pgSize=20&rnd_str_st=${Date.now()}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": token },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.code === "0000000" && json.data?.list?.length > 0) {
                const notice = json.data.list[0];
                return { hasNotice: true, content: notice.zhContext || notice.context || "赛事异常公告", matchName: notice.zhTitle || "赛事公告" };
            }
        } catch (e) { console.error("Notice Query Error", e); }
        return null;
    },

    queryTicket: async (orderId) => {
        const token = await DBS_API.getToken();
        if (!token) return { success: false, msg: "后台系统连接失败" };
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        const fmt = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        const payload = { "filter": "1", "orderNo": orderId, "databaseSwitch": 1, "userIdList": [], "startTime": fmt(new Date(now.getTime() - 90 * 86400000)), "endTime": fmt(now), "pageNum": 1, "pageSize": 10 };
        try {
            const res = await fetch(`https://api.dbsportxxxwo8.com/yewu17/admin/userReport/queryTicketList?rnd=${Date.now()}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": token, "user-id": "1261540827428163584" },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.data?.list?.length > 0) {
                const item = json.data.list[0];
                return { success: true, text: DBS_API.formatForAI(item, item.orderDetailList), rawDetails: item.orderDetailList, rawItem: item };
            }
            return { success: false, msg: "未查询到该注单号。" };
        } catch (e) { return { success: false, msg: "网络错误。" }; }
    }
};

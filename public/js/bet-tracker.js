// ==========================================
// 注单查询 & 实时监控组件
// ==========================================

function BetQuery() {
    const [orderId, setOrderId] = useState('5294113078041976');
    const [queryStatus, setQueryStatus] = useState('idle');
    const [statusMsg, setStatusMsg] = useState('');
    const [ticketData, setTicketData] = useState(null);
    const [ticketListRaw, setTicketListRaw] = useState(null);
    const [debugMode, setDebugMode] = useState(false);

    const formatDate = (date) => {
        const pad = (n) => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const safeFmt = (num) => {
        if (num === null || num === undefined || isNaN(num)) return "0";
        return Number(num).toLocaleString();
    };

    const handleQuery = async () => {
        if (!orderId) return setStatusMsg('请输入注单号');
        setQueryStatus('loading'); setStatusMsg('正在连接系统...'); setTicketData(null);
        try {
            const token = await DBS_API.getToken();
            if (!token) { setQueryStatus('error'); setStatusMsg('❌ 系统连接失败'); return; }

            const now = new Date();
            const payload = { "filter": "1", "orderNo": orderId, "databaseSwitch": 1, "userIdList": [], "startTime": formatDate(new Date(now.getTime() - 90 * 86400000)), "endTime": formatDate(now), "pageNum": 1, "pageSize": 10 };

            const res = await fetch(`https://api.dbsportxxxwo8.com/yewu17/admin/userReport/queryTicketList?rnd=${Date.now()}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": token, "user-id": "1261540827428163584" },
                body: JSON.stringify(payload)
            });

            if (res.status === 401) { localStorage.removeItem('dbs_token_cache'); setQueryStatus('error'); setStatusMsg('⚠️ 密钥过期，请重试'); return; }

            if (res.ok) {
                const json = await res.json();
                setTicketListRaw(json);
                if (json.data?.list?.length > 0) {
                    const item = json.data.list[0];
                    let ticketStatus = 'pending';
                    let statusText = '未结算';
                    const outcome = item.outcome;

                    if (outcome === 4 || outcome === 5) { ticketStatus = 'win'; statusText = '赢 (WIN)'; }
                    else if (outcome === 3 || outcome === 6) { ticketStatus = 'loss'; statusText = '输 (LOSS)'; }
                    else if (outcome === 2) { ticketStatus = 'draw'; statusText = '走水'; }
                    else if (item.remark && item.remark.includes('取消')) { ticketStatus = 'cancelled'; statusText = '注单取消'; }
                    else if (item.remark && (item.remark.includes('拒单') || item.remark.includes('失败'))) { ticketStatus = 'cancelled'; statusText = '投注失败'; }
                    else { ticketStatus = 'pending'; statusText = '未结算'; }

                    const profit = item.localProfitAmount || 0;
                    const profitStr = profit > 0 ? "+" + safeFmt(profit) : safeFmt(profit);
                    let displayRemark = item.remark || '';
                    if (['赛事秒接', '用户下注'].includes(displayRemark)) displayRemark = '';

                    setTicketData({
                        raw: item,
                        details: item.orderDetailList || [],
                        status: ticketStatus,
                        statusText: statusText,
                        profitStr: profitStr,
                        seriesText: item.seriesValue || "单关",
                        betCount: item.betCount || 1,
                        displayRemark: displayRemark
                    });
                    setQueryStatus('success'); setStatusMsg('');
                } else { setQueryStatus('empty'); setStatusMsg('❌ 未查询到该注单数据'); }
            } else { setQueryStatus('error'); setStatusMsg(`HTTP Error: ${res.status}`); }
        } catch (e) { setQueryStatus('error'); setStatusMsg(`网络错误: ${e.message}`); }
    };

    const getLegStatus = (res, remark) => {
        if (res === 4) return <span className="leg-result leg-win">全赢</span>;
        if (res === 5) return <span className="leg-result leg-win">赢半</span>;
        if (res === 3) return <span className="leg-result leg-loss">输</span>;
        if (res === 6) return <span className="leg-result leg-loss">输半</span>;
        if (res === 2) return <span className="leg-result leg-draw">走水</span>;
        return <span className="leg-result bg-slate-100 text-slate-500">{remark || '未结算'}</span>;
    };

    return (
        <div className="absolute inset-0 bg-slate-100 overflow-y-auto p-4 flex flex-col items-center custom-scrollbar">
            <div className="dbs-query-widget">
                <div className="widget-box flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2"><Icon d={PATHS.Search} className="w-5 h-5 text-blue-600" /> 业务后台注单查询</h3>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded">System Online</span>
                    </div>
                    <div className="flex gap-2">
                        <input value={orderId} onChange={e => setOrderId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleQuery()} className="main-input" placeholder="输入注单号 (Enter查询)" />
                        <button onClick={handleQuery} disabled={queryStatus === 'loading'} className="bg-blue-600 text-white px-5 rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition whitespace-nowrap shadow-sm">
                            {queryStatus === 'loading' ? <div className="spinner border-white/20 border-t-white w-4 h-4"></div> : '查询'}
                        </button>
                    </div>
                    {statusMsg && <div className={`text-center text-xs p-2 rounded ${queryStatus === 'error' ? 'text-red-500 bg-red-50' : 'text-slate-500 bg-slate-50'}`}>{statusMsg}</div>}
                </div>

                {ticketData && (
                    <div className={`ticket-card is-${ticketData.status}`}>
                        {ticketData.status === 'win' && <div className="stamp-win">WIN</div>}
                        <div className="ticket-status-bar">
                            <div>
                                <span>{ticketData.statusText}</span>
                                {ticketData.displayRemark && <span className="ml-2 text-xs bg-black/20 px-2 py-0.5 rounded">{ticketData.displayRemark}</span>}
                                <span className="series-tag">{ticketData.seriesText}</span>
                            </div>
                            <span>{ticketData.statusText}</span>
                        </div>
                        <div className="ticket-content">
                            {ticketData.details.map((detail, idx) => (
                                <div key={idx} className="match-item">
                                    <div className="match-seq">MATCH {idx + 1}</div>
                                    <div className="league-row">
                                        <span className="flex items-center gap-2 flex-wrap">{detail.sportName} / {detail.tournamentName}<span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-mono select-all cursor-pointer hover:bg-slate-200 transition" title="双击复制赛事ID">ID: {detail.matchId}</span></span>
                                        <span>{detail.beginTimeStr.substring(5, 16)}</span>
                                    </div>
                                    <div className="teams-row">
                                        <span className="flex-1 pr-2">{detail.matchInfo}</span>
                                        <div className="flex flex-col items-end">
                                            {detail.settleScore ? (<span className="live-score">{detail.settleScore.replace("全场比分 ", "")}</span>) : (<span className="text-xs text-slate-400 font-normal">进行中</span>)}
                                            {detail.scoreBenchmark && (<div className="mt-1 flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200"><span className="text-[9px] text-slate-400 font-bold">下注时:</span><span className="text-[10px] text-slate-600 font-mono font-bold">{detail.scoreBenchmark}</span></div>)}
                                        </div>
                                    </div>
                                    <div className="bet-info-row">
                                        <div className="bet-left"><span className="bet-name">{detail.playName} {detail.marketType ? `[${detail.marketType}]` : ''}</span><span className="bet-pick">{detail.playOptionName}</span></div>
                                        <div className="bet-right"><span className="bet-odds">@{detail.oddFinally}</span>{getLegStatus(detail.betResult, detail.remark)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="summary-section">
                            <div className="money-row"><span>注单编号</span><span className="money-val text-xs select-all">{ticketData.raw.orderNo}</span></div>
                            <div className="money-row"><span>投注详情</span><span className="money-val"><span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs mr-2">{ticketData.seriesText}</span>共 {ticketData.betCount} 注</span></div>
                            <div className="money-row"><span>总本金</span><span className="money-val">{safeFmt(ticketData.raw.localBetAmount)}</span></div>
                            <div className="money-row"><span>返还/输赢</span><span className="money-val profit-val">{ticketData.profitStr}</span></div>
                            <div className="ticket-footer-meta"><span>{ticketData.raw.merchantName} / {ticketData.raw.userName}</span><span>{ticketData.raw.createTimeStr}</span></div>
                        </div>
                    </div>
                )}

                <div className="mt-4 text-center">
                    <button onClick={() => setDebugMode(!debugMode)} className="text-[10px] text-slate-300 hover:text-slate-500">DEBUG JSON</button>
                    {debugMode && ticketListRaw && <pre className="mt-2 text-[10px] text-left bg-black text-green-500 p-2 rounded overflow-auto max-h-40 custom-scrollbar">{JSON.stringify(ticketListRaw, null, 2)}</pre>}
                </div>
            </div>
        </div>
    );
}

function TrackerModal({ isOpen, onClose, tickets, onDelete, isRefreshing, trackerMsg }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col transform transition-all scale-100 max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b bg-slate-50">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-800">注单实时监控</span>
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">{tickets.length}</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500"><Icon d={PATHS.Close} className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50 custom-scrollbar">
                    {tickets.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <Icon d={PATHS.Eye} className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-bold">暂无监控记录</p>
                            <p className="text-xs mt-1">在对话中发送注单号，AI 会自动添加监控</p>
                        </div>
                    ) : (
                        tickets.map(t => (
                            <div key={t.orderId} className={`tracker-modal-item status-${t.status}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-mono font-bold text-slate-700 select-all">{t.orderId}</span>
                                        <span className="text-[10px] text-slate-400 mt-0.5">{t.addTime.split(' ')[0]}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${t.status === 'win' ? 'text-green-700 bg-green-100' : t.status === 'loss' ? 'text-red-700 bg-red-100' : t.status === 'draw' ? 'text-blue-700 bg-blue-100' : t.status === 'cancelled' ? 'text-slate-600 bg-slate-200' : 'text-amber-600 bg-amber-100 animate-pulse'}`}>
                                            {t.resultStr}
                                        </span>
                                        <button onClick={() => onDelete(t.orderId)} className="text-slate-300 hover:text-red-500 p-1"><Icon d={PATHS.Trash} className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-600 bg-slate-100 p-2 rounded border border-slate-200">{t.matchInfo}</div>
                                <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400">
                                    <span>User: {t.user}</span>
                                    <span>更新于: {t.updateTime.split(' ')[1]}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-3 border-t bg-white flex justify-between items-center text-xs text-slate-500">
                    <span className="flex items-center gap-2">
                        {isRefreshing ? <div className="spinner w-3 h-3 border-slate-400 border-t-slate-600"></div> : <Icon d={PATHS.Refresh} className="w-3 h-3" />}
                        {isRefreshing ? '后台同步中...' : '系统每10分钟自动刷新'}
                    </span>
                    {trackerMsg && (
                        <span className="text-green-600 font-bold animate-pulse fade-in-up flex items-center gap-1">
                            <Icon d={PATHS.Check} className="w-3 h-3" /> {trackerMsg}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

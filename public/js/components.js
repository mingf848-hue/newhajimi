// ==========================================
// 共享 UI 组件
// ==========================================

function Icon({ d, className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d={d} />
        </svg>
    );
}

function LoginScreen({ onLogin }) {
    const [code, setCode] = useState('');
    const [status, setStatus] = useState('idle');
    const handleLogin = async () => {
        setStatus('checking');
        const result = await window.fbOps.verifyLogin(code);
        if (result.success) { onLogin(result.username, result.role); }
        else { setStatus('error'); setTimeout(() => setStatus('idle'), 1500); }
    };
    return (
        <div className="login-bg">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm flex flex-col items-center fade-in mx-4">
                <div className="w-16 h-16 mb-4 rounded-full bg-slate-50 flex items-center justify-center p-1 shadow-sm border border-slate-100">
                    <img src="https://lh3.googleusercontent.com/d/1Rri7vVK9YyhQEdqzvgmjQ4kzNZdbQuxV" className="w-full h-full object-contain rounded-full" onError={(e) => { e.target.src = "https://via.placeholder.com/64?text=Cat" }} />
                </div>
                <h2 className="text-xl font-bold text-slate-700">哈基米助手</h2>
                <div className="mb-6 mt-1">
                    <span className="text-xs px-2 py-1 rounded rainbow-text">Pro Max Ultra Plus+</span>
                </div>
                <div className="w-full relative mb-4">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Icon d={PATHS.Lock} />
                    </span>
                    <input type="text" placeholder="输入账号或6位动态码" className="w-full pl-10 pr-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-100 transition text-base" value={code} onChange={e => setCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                </div>
                <button onClick={handleLogin} disabled={status === 'checking'} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 disabled:opacity-70 transition active:scale-95 touch-target">{status === 'checking' ? '验证中...' : '进入系统'}</button>
                {status === 'error' && <p className="text-xs text-red-500 mt-3 font-medium">验证失败，请检查输入</p>}
            </div>
        </div>
    );
}

function StatusBar({ usage }) {
    return (
        <div className="status-bar">
            <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span>DB: OK</span>
                <span className="cloud-indicator bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Multi-Agent (Gemini 3.1 Pro 核心)</span>
                {usage && usage.cachedContentTokenCount > 0 ? (
                    <span className="cloud-indicator bg-purple-100 text-purple-600 px-2 py-0.5 rounded font-bold">⚡️ 缓存命中 (Cached)</span>
                ) : (
                    <span className="cloud-indicator bg-slate-100 text-slate-500 px-2 py-0.5 rounded">标准模式 (Standard)</span>
                )}
                {usage && (
                    <div className="flex items-center gap-2 ml-2 border-l pl-2 border-slate-200 font-mono">
                        <span className="text-slate-600" title="实际计费的输入Token">In: <span className="font-bold">{usage.promptTokenCount || 0}</span></span>
                        {usage.cachedContentTokenCount > 0 ? (
                            <span className="text-purple-600 bg-purple-50 px-1 rounded border border-purple-100" title="省下的缓存Token">Cache: <span className="font-bold">{usage.cachedContentTokenCount}</span></span>
                        ) : (
                            <span className="text-slate-300" title="本次未命中缓存">Cache: 0</span>
                        )}
                        <span className="text-slate-400">Out: {usage.candidatesTokenCount || 0}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-500" title="总处理量">Total: {usage.totalTokenCount || 0}</span>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">⚡️ 双层智能路由质检</span>
            </div>
        </div>
    );
}

function NotificationModal({ title, message, type = 'success', onClose }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs text-center flex flex-col items-center gap-4 transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${type === 'success' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                    <Icon d={type === 'success' ? PATHS.Check : PATHS.Close} className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{message}</p>
                </div>
                <button onClick={onClose} className="bg-slate-800 text-white w-full py-2.5 rounded-xl font-bold text-sm hover:bg-slate-900 transition">知道了</button>
            </div>
        </div>
    );
}

function DebugModal({ data, onClose }) {
    const jsonStr = window.safeStringify ? window.safeStringify(data, 2) : JSON.stringify(data, null, 2);
    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl flex flex-col gap-4 transform transition-all scale-100 h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b pb-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Icon d={PATHS.Bug} className="w-5 h-5 text-indigo-500" /> 调试信息 (最近一次请求)
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icon d={PATHS.Close} className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 overflow-auto bg-slate-900 rounded-xl p-4 custom-scrollbar">
                    <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">{jsonStr}</pre>
                </div>
                <div className="flex justify-end pt-2">
                    <button onClick={() => navigator.clipboard.writeText(jsonStr)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition">
                        <Icon d={PATHS.Copy} className="w-4 h-4" /> 复制 JSON
                    </button>
                </div>
            </div>
        </div>
    );
}

function HighlightedTextarea({ value, onChange, placeholder, className, onFocus, inputRef }) {
    const backdropRef = useRef(null);
    const handleScroll = (e) => {
        if (backdropRef.current) {
            backdropRef.current.scrollTop = e.target.scrollTop;
            backdropRef.current.scrollLeft = e.target.scrollLeft;
        }
    };
    const getHighlightedText = (text) => {
        if (!text) return '';
        let escaped = text.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
        return escaped.replace(/(\{\{.*?\}\})/g, '<span class="text-blue-600 font-bold bg-blue-50 rounded-sm">$1</span>');
    };
    const displayText = getHighlightedText(value) + (value.endsWith('\n') ? '<br> ' : '');
    return (
        <div className={`relative group ${className} !bg-white !text-transparent`}>
            <div ref={backdropRef} className="absolute inset-0 p-2 text-sm font-mono whitespace-pre-wrap break-words overflow-hidden text-slate-800 pointer-events-none" style={{ borderColor: 'transparent', lineHeight: '1.5' }} dangerouslySetInnerHTML={{ __html: displayText }} />
            <textarea ref={inputRef} value={value} onChange={onChange} onScroll={handleScroll} onFocus={onFocus} placeholder={placeholder} className="absolute inset-0 w-full h-full p-2 text-sm font-mono bg-transparent outline-none resize-none border-none text-transparent caret-slate-800 focus:ring-0" style={{ color: 'transparent', caretColor: '#334155', lineHeight: '1.5', fontFamily: 'Menlo, Monaco, Courier New, monospace' }} />
        </div>
    );
}

function SaveConfirmModal({ type, onClose, onConfirm }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center flex flex-col items-center gap-4 transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${type === 'ann' ? 'bg-purple-100 text-purple-500' : 'bg-blue-100 text-blue-500'}`}>
                    <Icon d={type === 'ann' ? PATHS.Brain : PATHS.Chat} className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">确认保存设定？</h3>
                    <p className="text-sm text-slate-500 mt-1">这将更新云端数据库中的<span className={`font-bold mx-1 ${type === 'ann' ? 'text-purple-600' : 'text-blue-600'}`}>{type === 'ann' ? '公告' : '客服'}</span>AI规则。</p>
                </div>
                <div className="flex gap-3 w-full">
                    <button onClick={onClose} className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 transition">取消</button>
                    <button onClick={onConfirm} className={`flex-1 text-white py-2.5 rounded-xl font-bold text-sm shadow-md transition ${type === 'ann' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}>确认保存</button>
                </div>
            </div>
        </div>
    );
}

function GeneralInputModal({ title, placeholder, value, onChange, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 fade-in" onClick={onCancel}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4 transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><Icon d={PATHS.Close} className="w-5 h-5" /></button>
                </div>
                <input autoFocus value={value} onChange={e => onChange(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder={placeholder} onKeyDown={e => e.key === 'Enter' && onConfirm()} />
                <div className="flex gap-3 mt-2">
                    <button onClick={onCancel} className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 transition">取消</button>
                    <button onClick={onConfirm} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-md">确定</button>
                </div>
            </div>
        </div>
    );
}

function GeneralConfirmModal({ title, message, onConfirm, onCancel, confirmText = "确认", cancelText = "取消", type = "danger" }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 fade-in" onClick={onCancel}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs text-center flex flex-col items-center gap-4 transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${type === 'danger' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                    <Icon d={type === 'danger' ? PATHS.Trash : PATHS.Check} className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{message}</p>
                </div>
                <div className="flex gap-3 w-full">
                    <button onClick={onCancel} className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 transition">{cancelText}</button>
                    <button onClick={onConfirm} className={`flex-1 text-white py-2.5 rounded-xl font-bold text-sm shadow-md transition ${type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
}

const ChatMessage = React.memo(({ msg, idx, activeMsgIndex, feedbackState, correctionText, setCorrectionText, submitCorrectionMsg, setActiveMsgIndex, setFeedbackState, handleLikeMsg, handleDislikeMsg, openSmartOptModal, handleCopy }) => {
    return (
        <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} fade-in group`}>
            <div className={`p-3 rounded-2xl max-w-[90%] text-sm leading-relaxed shadow-sm hover-lift ${msg.role === 'user' ? 'bg-blue-50 text-blue-900 border border-blue-100 rounded-tr-sm' : 'glass-panel border border-slate-200 text-slate-800 rounded-tl-sm'}`}>
                {msg.displayImages && msg.displayImages.length > 0 && (
                    <div className="flex gap-2 mb-2 flex-wrap">
                        {msg.displayImages.map((img, i) => <img key={i} src={img.previewUrl} className="max-h-40 rounded-lg border border-slate-200 shadow-sm" alt="Pasted" />)}
                    </div>
                )}
                <div className="whitespace-pre-wrap select-text font-medium">{msg.displayContent || msg.content}</div>
                {msg.role === 'assistant' && (
                    <div className="mt-2 flex items-center justify-end gap-3 border-t border-slate-200/60 pt-2 opacity-30 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleLikeMsg(idx)} title="完美" className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-green-600"><Icon d={PATHS.ThumbUp} className="w-3 h-3" />完美</button>
                        <button onClick={() => handleDislikeMsg(idx)} title="人工纠错" className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-red-600"><Icon d={PATHS.ThumbDown} className="w-3 h-3" />纠错</button>
                        <button onClick={() => openSmartOptModal(idx)} title="调教AI规则" className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-purple-600"><Icon d={PATHS.Sparkles} className="w-3 h-3" />调教</button>
                        <button onClick={() => handleCopy(msg.displayContent || msg.content)} title="复制话术" className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-blue-600"><Icon d={PATHS.Copy} className="w-3 h-3" />复制</button>
                    </div>
                )}
                {activeMsgIndex === idx && feedbackState === 'rating_bad' && (
                    <div className="mt-2 flex gap-2 w-full fade-in pt-1">
                        <input value={correctionText} onChange={e => setCorrectionText(e.target.value)} placeholder="输入正确的话术标准..." className="flex-1 text-xs border border-red-200 rounded px-2 py-1.5 outline-none focus:ring-1 ring-red-500 bg-white text-slate-700" />
                        <button onClick={submitCorrectionMsg} className="bg-red-500 hover:bg-red-600 text-white px-3 rounded text-xs font-bold transition whitespace-nowrap shadow-sm">提交学习</button>
                        <button onClick={() => { setActiveMsgIndex(-1); setFeedbackState('none'); }} className="text-slate-400 hover:text-slate-600 p-1"><Icon d={PATHS.Close} className="w-4 h-4" /></button>
                    </div>
                )}
            </div>
        </div>
    );
});

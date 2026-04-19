// ==========================================
// 主应用组件 App
// ==========================================
function App() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('scripts');
    const [loading, setLoading] = useState(false);
    const [showSmartOptModal, setShowSmartOptModal] = useState(false);
    const [smartOptReason, setSmartOptReason] = useState('');
    const [isSmartOptimizing, setIsSmartOptimizing] = useState(false);
    const [smartOptTarget, setSmartOptTarget] = useState('auto');
    const [scripts, setScripts] = useState([]);
    const [extraKnowledge, setExtraKnowledge] = useState([]);
    const [images, setImages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(''); 
    const [customerInput, setCustomerInput] = useState('');
    
    const [chatHistory, setChatHistory] = useState([]);
    const [pastedImages, setPastedImages] = useState([]);
    const chatEndRef = useRef(null);

    const [aiReply, setAiReply] = useState('');
    const [aiPhase, setAiPhase] = useState(''); // 'triage' | 'execution' | ''
    const [aiLoading, setAiLoading] = useState(false);
    const [scriptForm, setScriptForm] = useState({ id: '', category: '', keywords: '', content: '' });
    const [saveStatus, setSaveStatus] = useState('idle');
    const [feedbackState, setFeedbackState] = useState('none');
    const [correctionText, setCorrectionText] = useState('');
    const [activeMsgIndex, setActiveMsgIndex] = useState(-1);
    const [imageForm, setImageForm] = useState({ file: null, preview: null, title: '', tags: '' });
    const [uploading, setUploading] = useState(false);
    const [viewImage, setViewImage] = useState(null);
    const [copiedScriptId, setCopiedScriptId] = useState(null);
    const fileInputRef = useRef(null);
    const [rawNotice, setRawNotice] = useState('');
    const [genResult, setGenResult] = useState(null); 
    const [noticeLoading, setNoticeLoading] = useState(false);
    const [annCorrectReason, setAnnCorrectReason] = useState('');
    const [annSubmitStatus, setAnnSubmitStatus] = useState('idle');
    const [selectedGenTemplateId, setSelectedGenTemplateId] = useState('');
    const [isTemplateDropOpen, setIsTemplateDropOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState('');
    const [userRole, setUserRole] = useState('user'); 
    const [isTemplateMode, setIsTemplateMode] = useState(false);
    const [allTemplates, setAllTemplates] = useState([]);
    const [lastUsage, setLastUsage] = useState(null);
    const [viewTemplate, setViewTemplate] = useState(null); 
    const [isEditingTemplate, setIsEditingTemplate] = useState(false);
    const [templateForm, setTemplateForm] = useState({ id: null, type: '', front: '', inner: '', mail: '' });
    const [templateSaveStatus, setTemplateSaveStatus] = useState('idle');
    const [templateLoading, setTemplateLoading] = useState(false);
    const [dataMgmtTab, setDataMgmtTab] = useState('chat');
    const [chatLogs, setChatLogs] = useState([]);
    const [annLogs, setAnnLogs] = useState([]);
    const [lastFocusedTemplateField, setLastFocusedTemplateField] = useState('front'); 
    const [templateVars, setTemplateVars] = useState(INITIAL_VARS);
    const frontRef = useRef(null);
    const mailRef = useRef(null);
    const innerRef = useRef(null);
    const [chatBase, setChatBase] = useState(DEFAULT_CHAT_BASE);
    const [chatKnowledge, setChatKnowledge] = useState('');
    const [annBase, setAnnBase] = useState(DEFAULT_ANN_BASE);
    const [annKnowledge, setAnnKnowledge] = useState('');
    const [chatStaticContext, setChatStaticContext] = useState(''); 
    const [annStaticContext, setAnnStaticContext] = useState(''); 
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showScriptModal, setShowScriptModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(null); 
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isAnnTrainingLoading, setIsAnnTrainingLoading] = useState(false);
    const [isChatTrainingLoading, setIsChatTrainingLoading] = useState(false);
    const [saveConfirmType, setSaveConfirmType] = useState(null);
    const [notification, setNotification] = useState(null);
    const [showInputModal, setShowInputModal] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [showBackupConfirm, setShowBackupConfirm] = useState(false);
    const [lastDebugInfo, setLastDebugInfo] = useState(null);
    const [showDebugModal, setShowDebugModal] = useState(false);
    const [businessRules, setBusinessRules] = useState(DEFAULT_BIZ_RULES);
    const [trackedTickets, setTrackedTickets] = useState([]);
    const [isTrackerRefreshing, setIsTrackerRefreshing] = useState(false);
    const [showTrackerModal, setShowTrackerModal] = useState(false); 
    const [hasUnreadUpdates, setHasUnreadUpdates] = useState(false); 
    const [trackerMsg, setTrackerMsg] = useState(''); 
    const trackedTicketsRef = useRef([]);

    const [accounts, setAccounts] = useState([]);
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [accountForm, setAccountForm] = useState({ id: null, username: '', role: 'user', secret: '', active: true, note: '' });

    // 场馆规则库
    const [venueRules, setVenueRules] = useState([]);
    const [showVenueModal, setShowVenueModal] = useState(false);
    const [activeVenueId, setActiveVenueId] = useState(null);
    const [venueExtracting, setVenueExtracting] = useState(false);
    const [venueProgress, setVenueProgress] = useState({ done: 0, total: 0, current: '' });
    const [venueSaveStatus, setVenueSaveStatus] = useState('idle');
    const [venueDraft, setVenueDraft] = useState({ name: '', rules: '', imageCount: 0 });
    const [venueDragging, setVenueDragging] = useState(false);
    const venueFileInputRef = useRef(null);

    useEffect(() => { trackedTicketsRef.current = trackedTickets; }, [trackedTickets]);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory, aiReply, aiPhase]);

    const buildStaticCache = (scriptsData, templatesData, chatKB, annKB, venueData) => {
        const safeScripts = Array.isArray(scriptsData) ? scriptsData : [];
        const chatScriptLib = safeScripts.map(s => `[${s.keywords || '通用'}]: ${s.content}`).join("\n");
        const safeVenues = Array.isArray(venueData) ? venueData : venueRules;
        const venueLib = (safeVenues || []).filter(v => v.rules && v.rules.trim())
            .map(v => `【${v.name}】\n${v.rules}`).join("\n\n---\n\n");
        const venueSection = venueLib ? `\n\n### 场馆规则库 (Venue Rules — 用户问及对应场馆规则时严格引用)\n${venueLib}` : '';
        setChatStaticContext(`${chatBase}\n\n### 知识库 (Knowledge Base)\n${chatKB || "暂无训练规则"}\n\n### 话术库 (Script Library)\n${chatScriptLib}${venueSection}`);
        const annTemplateLib = JSON.stringify(templatesData || []);
        setAnnStaticContext(`${annBase}\n\n### 知识库/规则 (AI Knowledge Base)\n${annKB || "暂无训练规则"}\n\n### 模板库 (Template Library)\n${annTemplateLib}`);
    };

    const notify = (title, message, type = 'error') => {
        setNotification(window.UtilsLib.createNotification(title, message, type));
    };

    const checkSession = () => {
        const lastActive = localStorage.getItem(SESSION_KEY_TIME);
        if (!lastActive) return false;
        if (Date.now() - parseInt(lastActive) > SESSION_TIMEOUT) { handleLogout(); return false; }
        return true;
    };
    
    const updateActivity = () => { if (!isAuthorized) return; const now = Date.now(); const last = parseInt(localStorage.getItem(SESSION_KEY_TIME) || 0); if (now - last > 3600000) { localStorage.setItem(SESSION_KEY_TIME, now.toString()); } };
    const handleLogout = () => { localStorage.removeItem(SESSION_KEY_TIME); localStorage.removeItem(SESSION_KEY_USER); localStorage.removeItem(SESSION_KEY_ROLE); setIsAuthorized(false); setCurrentUser(''); setUserRole('user'); };
    
    const fetchAccounts = async () => {
        if (currentUser !== 'aratakito' && localStorage.getItem(SESSION_KEY_USER) !== 'aratakito') return;
        setLoading(true);
        try {
            const accs = await window.fbOps.getAccounts();
            setAccounts(accs || []);
        } catch (e) {
            console.error("获取账号失败:", e);
        }
        setLoading(false);
    };

    const loadData = async () => {
        try {
            if (!window.fbOps) throw new Error("Firebase Ops not loaded");
            const user = localStorage.getItem(SESSION_KEY_USER);
            const data = await window.UtilsLib.loadDataInParallel(window.fbOps, user);

            setScripts(data.scripts || []);
            setExtraKnowledge(data.knowledge || []);
            setImages(data.images || []);
            setAllTemplates(data.templates || []);
            setTrackedTickets(data.tracked || []);
            setVenueRules(data.venueRules || []);
            if(data.tracked && data.tracked.length > 0) setShowTrackerModal(false);

            if (data.customVars && data.customVars.length > 0) { setTemplateVars([...INITIAL_VARS, ...data.customVars]); }

            let cBase = data.settings?.chat_base;
            let cKnow = data.settings?.chat_knowledge || "";
            let bRules = data.settings?.business_rules;

            if (!cBase) { cBase = DEFAULT_CHAT_BASE; await window.fbOps.saveCloudPrompts({ chat_base: DEFAULT_CHAT_BASE }); }
            if (!bRules) { bRules = DEFAULT_BIZ_RULES; }

            setChatBase(cBase);
            setChatKnowledge(cKnow);
            setBusinessRules(bRules);

            let aBase = data.settings?.ann_base;
            let aKnow = data.settings?.ann_knowledge || "";
            if (!aBase) { aBase = DEFAULT_ANN_BASE; await window.fbOps.saveCloudPrompts({ ann_base: DEFAULT_ANN_BASE }); }
            setAnnBase(aBase);
            setAnnKnowledge(aKnow);

            buildStaticCache(data.scripts || [], data.templates || [], cKnow, aKnow, data.venueRules || []);

            if (user === 'aratakito') {
                fetchAccounts();
            }

        } catch (e) { console.error("Load Data Error:", e); } 
    };

    const fetchTrainingLogs = async () => {
        setLoading(true);
        try {
            if (dataMgmtTab === 'chat') { const logs = await window.fbOps.getTrainingDataAll(); setChatLogs(logs); } 
            else { const logs = await window.fbOps.getAnnLogsAll(); setAnnLogs(logs); }
        } catch(e) { console.error(e); }
        setLoading(false);
    };

    const addToTracker = async (ticketDetails, rawItem) => {
        if (!ticketDetails || ticketDetails.length === 0) return;
        const mainDetail = ticketDetails[0];
        const { resultStr, status } = window.UtilsLib.mapTicketOutcome(rawItem);

        const ticketObj = {
            orderId: rawItem.orderNo,
            status: status,
            resultStr: resultStr,
            matchInfo: `${mainDetail.sportName} | ${mainDetail.matchInfo}`,
            user: currentUser || 'Unknown',
            addTime: new Date().toLocaleString(),
            updateTime: new Date().toLocaleString()
        };
        await window.fbOps.saveTrackedTicket(ticketObj);
        setTrackedTickets(prev => {
            const exists = prev.find(t => t.orderId === ticketObj.orderId);
            if (!exists) return [ticketObj, ...prev];
            return prev.map(t => t.orderId === ticketObj.orderId ? ticketObj : t);
        });
        setShowTrackerModal(true);
        if (!isSettled) { 
            setTrackerMsg(`✅ 注单 ${rawItem.orderNo} 已加入监控台`);
            setTimeout(() => setTrackerMsg(''), 5000);
        }
    };

    const handleRefreshTracker = async () => {
        setIsTrackerRefreshing(true);
        const currentList = trackedTicketsRef.current;
        const pendings = currentList.filter(t => t.status === 'pending');
        if (pendings.length === 0) { setIsTrackerRefreshing(false); return; }
        let changesCount = 0;
        const newTickets = [...currentList];
        for (const t of pendings) {
            const res = await DBS_API.queryTicket(t.orderId);
            if (res.success && res.rawDetails) {
                const rawItem = res.rawItem; 
                const isPending = rawItem.outcome === null || rawItem.outcome === 0 || rawItem.outcome === 1;
                if (!isPending) {
                    changesCount++;
                    const { resultStr, status } = window.UtilsLib.mapTicketOutcome(rawItem);
                    const updatedT = { ...t, status: status, resultStr: resultStr, updateTime: new Date().toLocaleString() };
                    await window.fbOps.saveTrackedTicket(updatedT);
                    const idx = newTickets.findIndex(x => x.orderId === t.orderId);
                    if (idx !== -1) newTickets[idx] = updatedT;
                }
            }
        }
        setTrackedTickets(newTickets);
        setIsTrackerRefreshing(false);
        if (changesCount > 0) {
            setHasUnreadUpdates(true);
            setNotification({title: '状态更新', message: `🎉 发现 ${changesCount} 张注单已结算完成！`, type: 'success'});
        }
    };
    
    const handleDeleteTracked = async (id) => {
        if(!confirm('确定不再监控此注单吗？')) return;
        await window.fbOps.deleteTrackedTicket(id);
        setTrackedTickets(prev => prev.filter(t => t.orderId !== id));
    };

    useEffect(() => {
      if (!isAuthorized) return;
      const interval = setInterval(() => { handleRefreshTracker(); }, 600000); 
      return () => clearInterval(interval);
    }, [isAuthorized]);

    useEffect(() => { if (activeTab === 'data_management') { fetchTrainingLogs(); } }, [activeTab, dataMgmtTab]);
    
    useEffect(() => {
       let isMounted = true;
       const init = async () => {
           try {
               if (checkSession()) {
                    const user = localStorage.getItem(SESSION_KEY_USER);
                    const role = localStorage.getItem(SESSION_KEY_ROLE);
                    if(user) { setCurrentUser(user); setUserRole(role||'user'); }
                    setIsAuthorized(true);
                    await waitForFirebase();
                    await loadData();
               } else { 
                    setIsAuthorized(false); 
               }
           } catch(e) { 
               console.error("Init Error", e); 
           } finally {
               if (isMounted) setAuthLoading(false);
           }
      };
      init();
      return () => { isMounted = false; };
    }, []); 

    const fetchData = async () => { setLoading(true); await loadData(); setLoading(false); };
    const handleDownloadBackup = async () => { setShowBackupConfirm(true); };
    
    const confirmDownloadBackup = async () => {
        setShowBackupConfirm(false);
        const data = await window.fbOps.getAllDataForBackup(); 
        const jsonStr = window.safeStringify ? window.safeStringify(data, 2) : JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" }); 
        const url = URL.createObjectURL(blob); 
        const a = document.createElement('a'); 
        a.href = url; a.download = `哈基米备份_${new Date().toISOString().slice(0,10)}.json`; 
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    }
    
    const insertTemplateVar = (variable) => {
        if (!lastFocusedTemplateField) return;
        const refMap = { front: frontRef, mail: mailRef, inner: innerRef };
        const currentRef = refMap[lastFocusedTemplateField];
        if (currentRef && currentRef.current) {
            const textarea = currentRef.current;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const currentVal = templateForm[lastFocusedTemplateField] || '';
            const newVal = currentVal.substring(0, start) + variable + currentVal.substring(end);
            setTemplateForm({ ...templateForm, [lastFocusedTemplateField]: newVal });
            setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + variable.length, start + variable.length); }, 0);
        } else {
            const currentVal = templateForm[lastFocusedTemplateField] || '';
            setTemplateForm({ ...templateForm, [lastFocusedTemplateField]: currentVal + variable });
        }
    };

    const openAddCustomVarModal = () => { setInputValue(''); setShowInputModal(true); };
    const confirmAddCustomVar = async () => { if (inputValue.trim()) { const fullVar = `{{${inputValue.trim()}}}`; if (!templateVars.includes(fullVar)) { const newVars = [...templateVars, fullVar]; setTemplateVars(newVars); await window.fbOps.addCustomVar(fullVar); } insertTemplateVar(fullVar); } setShowInputModal(false); }
    const handleDeleteVar = async (e, v) => { e.stopPropagation(); if (INITIAL_VARS.includes(v)) { setNotification({ title: '提示', message: '系统默认变量不可删除', type: 'error' }); return; } if (confirm(`确定要删除变量 ${v} 吗？`)) { const newVars = await window.fbOps.deleteCustomVar(v); const combined = [...INITIAL_VARS, ...newVars]; setTemplateVars(combined); } };
    const extractVars = (text) => { if (!text) return []; const regex = /\{{1,2}\s*([\w\u4e00-\u9fa5]+)\s*\}{1,2}/g; const matches = text.match(regex); if (!matches) return []; return [...new Set(matches.map(m => m.replace(/[{}]/g, '').trim()))]; };
    const usedVariables = useMemo(() => { if (!isEditingTemplate && !templateForm.id) return []; const fullText = (templateForm.front || '') + (templateForm.mail || '') + (templateForm.inner || ''); return templateVars.filter(v => fullText.includes(v)); }, [templateForm, templateVars, isEditingTemplate]);

    const handleResetToDefault = async () => {
        if (!confirm("确定要重置AI设定为系统默认吗？这将覆盖当前的 Prompt。")) return;
        setAnnBase(DEFAULT_ANN_BASE);
        setChatBase(DEFAULT_CHAT_BASE);
        setBusinessRules(DEFAULT_BIZ_RULES);
        await window.fbOps.saveCloudPrompts({ 
            chat_base: DEFAULT_CHAT_BASE, chat_knowledge: chatKnowledge, business_rules: DEFAULT_BIZ_RULES,
            ann_base: DEFAULT_ANN_BASE, ann_knowledge: annKnowledge 
        });
        setNotification({title: '重置成功', message: '已恢复默认的最佳实践 Prompt。', type: 'success'});
    };

    const handleGenerateNotice = async () => {
      updateActivity();
      if (!rawNotice.trim()) { setNotification({title: '提示', message: '请先填入原始通知内容', type: 'error'}); return; }
      setNoticeLoading(true); setGenResult(null); setAnnSubmitStatus('idle'); setLastUsage(null);
      
      try {
          const now = new Date();
          const year = now.getFullYear();
          let recentCorrectionsContext = "";
          let fetchedBadLogs = [];
          try { fetchedBadLogs = await window.fbOps.getRecentBadAnnouncements(); if (fetchedBadLogs && fetchedBadLogs.length > 0) { const validReasons = fetchedBadLogs.filter(d => d.type === 'bad' && d.reason && d.reason.trim()).map(d => d.reason); const uniqueReasons = [...new Set(validReasons)].slice(0, 8); if (uniqueReasons.length > 0) { recentCorrectionsContext = "\n\n### ⚡️ 最近人工修正指引 (最高优先级 - RAG Injected)\n" + uniqueReasons.map((r, i) => `${i+1}. ${r}`).join("\n"); } } } catch (err) { console.warn("Failed to fetch recent corrections:", err); }

          let templateInstruction = "";
          let extractionVars = [];
          let targetTemplate = null;

          if (isEditingTemplate && templateForm.front) {
             const content = templateForm.front + templateForm.mail + templateForm.inner;
             extractionVars = extractVars(content);
             templateInstruction = `【强制单模板模式 (测试)】\n请忽略所有其他规则，必须基于以下唯一模板提取变量：\n- 前台: ${templateForm.front}\n- 站内信: ${templateForm.mail}\n- 对内: ${templateForm.inner}`;
             targetTemplate = templateForm;
          } else if (selectedGenTemplateId) {
              const t = allTemplates.find(tem => tem.id === selectedGenTemplateId);
              if (!t) throw new Error("所选模板不存在或已被删除");
              const content = t.front + t.mail + t.inner;
              extractionVars = extractVars(content);
              templateInstruction = `【强制指定模板模式】\n用户已手动指定使用模板 [${t.type}] (ID: ${t.id})。\n请忽略其他所有模板。\n\n该模板内容结构如下：\n- 前台: ${t.front}\n- 站内信: ${t.mail}\n- 对内: ${t.inner}\n\n任务：请分析原始通知，仅提取上述模板所需的变量值。`;
              targetTemplate = t;
          } else {
              if (allTemplates.length === 0) throw new Error("暂无可用模板，请先在右侧添加模板。");
              const templatesContext = allTemplates.map((t, idx) => { const content = t.front + t.mail + t.inner; const vars = extractVars(content); return `[ID: ${t.id}] [名称: ${t.type}] [变量: ${vars.join(', ')}]`; }).join('\n');
              templateInstruction = `【AI智能路由模式】\n现有模板库如下：\n${templatesContext}\n\n请分析原始通知，找出最匹配的模板ID，并提取该模板所需的变量。`;
          }

          const dynamicTimeContext = `【当前绝对时间参考】\n- 系统时间：${year}年${now.getMonth()+1}月${now.getDate()}日 ${now.getHours()}:${now.getMinutes()} (星期${"日一二三四五六".charAt(now.getDay())})`;
          let extractionInstruction = "";
          if (extractionVars.length > 0) { extractionInstruction = `\n【必需变量】: ${extractionVars.join(', ')}。`; }
          const arrayInstruction = `\n3. [智能多值模式]：如果模板中多次出现同一个变量（如 {{比赛日期}}），但原始通知包含多个对应值（例如多场比赛的日期不同），变量值必须返回为数组！例如：{ "比赛日期": ["2025年12月03日", "2025年12月04日"] }。单一值仍返回字符串。`;

          const userPrompt = `${templateInstruction}\n\n${dynamicTimeContext}\n${extractionInstruction}\n${arrayInstruction}\n\n【原始通知】:\n${rawNotice}\n\n要求：\n1. matchedTemplateId (如果是强制模式，请返回强制的ID)。\n2. variables (key需完全一致)。`;
          const fullSystemPrompt = `${annBase}\n\n### 动态规则库 (已归纳)\n${annKnowledge}${recentCorrectionsContext}`;

          const messages = [ 
              { role: 'system', content: fullSystemPrompt + '\n\n【JSON输出】: { "thought": "在此简述你的推理步骤：1.分析原文意图... 2.计算时间...", "matchedTemplateId": "...", "variables": { "变量名": "变量值" } }' }, 
              { role: 'user', content: userPrompt } 
          ];
          
          setLastDebugInfo({ type: "Notice Generation", messages: messages, rag_status: recentCorrectionsContext ? "Active" : "Empty", rag_content: recentCorrectionsContext });

          const res = await callGeminiJSON(messages, 0.2, MODE_FAST);
          
          if(res.error) throw new Error(res.error);
          if (res.usage) setLastUsage(res.usage);

          if (res.data) {
              if (res.data.thought) {
                  setNotification({
                      title: 'AI 思考完毕', 
                      message: res.data.thought, 
                      type: 'success'
                  });
              }

              if (!targetTemplate && res.data.matchedTemplateId) { targetTemplate = allTemplates.find(t => t.id === res.data.matchedTemplateId); }
              if (!targetTemplate && !isEditingTemplate) { throw new Error("AI 未能找到匹配的模板，请检查内容或模板库"); }
              
              if (targetTemplate) {
                  const vars = res.data.variables || {};
                  const requiredVars = extractVars(targetTemplate.front + targetTemplate.mail + targetTemplate.inner);
                  const replaceInString = (str, varList, dataObj) => {
                      if(!str) return "";
                      let res = str;
                      varList.forEach(key => { 
                           const val = dataObj[key]; 
                           const regex = new RegExp(`\\{{1,2}\\s*${key}\\s*\\}{1,2}`, 'gi');
                           if (Array.isArray(val)) { let idx = 0; res = res.replace(regex, () => { const v = val[idx] !== undefined ? val[idx] : val[val.length - 1]; idx++; return v; }); } else { const safeVal = (val === undefined || val === null) ? `[未提取:${key}]` : val; res = res.replace(regex, safeVal); }
                      });
                      return res;
                  };
                  const front = replaceInString(targetTemplate.front, requiredVars, vars);
                  const mail = replaceInString(targetTemplate.mail, requiredVars, vars);
                  const inner = replaceInString(targetTemplate.inner, requiredVars, vars);
                  setGenResult({ front, mail, inner });
                  if (!isEditingTemplate && !selectedGenTemplateId) { setViewTemplate(targetTemplate); setNotification({title: 'AI 自动匹配', message: `已匹配：${targetTemplate.type}`, type: 'success'}); }
              }
          }
      } catch (e) { 
          setNotification({title: '生成错误', message: e.message, type: 'error'}); 
      }
      setNoticeLoading(false);
    };

    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64Data = event.target.result.split(',')[1];
                    setPastedImages(prev => [...prev, {
                        mimeType: file.type,
                        data: base64Data,
                        previewUrl: event.target.result
                    }]);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleClearChat = () => {
        setChatHistory([]);
        setAiReply('');
        setCustomerInput('');
        setPastedImages([]);
        setFeedbackState('none');
        setActiveMsgIndex(-1);
    };

    const handleCallAI = async () => { 
        updateActivity(); 
        if (!customerInput.trim() && pastedImages.length === 0) return; 
        
        setAiLoading(true); 
        setAiReply(''); 
        setFeedbackState('none'); 
        setLastUsage(null);
        
        const currentUserMsg = customerInput;
        const currentImages = [...pastedImages];
        
        let currentUserContent = [];
        if (currentImages.length > 0) {
            currentImages.forEach(img => { currentUserContent.push({ inlineData: { mimeType: img.mimeType, data: img.data } }); });
        }
        currentUserContent.push({ text: currentUserMsg });
        
        const displayUserMsg = { role: 'user', content: currentUserContent, displayContent: currentUserMsg, displayImages: currentImages };
        
        const currentFullHistory = [...chatHistory, displayUserMsg];
        setChatHistory(currentFullHistory);
        setCustomerInput('');
        setPastedImages([]);

        try {
           setAiPhase('triage');
           
           const venueNames = venueRules.map(v => v.name).filter(Boolean);
           const venueListHint = venueNames.length > 0 ? `当前已收录的场馆有：${venueNames.join('、')}。若用户提到这些场馆，intent 可设为 CASINO_RULE。` : '';

           const triageSchema = `
           {
             "core_intent": "主要核心诉求(枚举: ACCOUNT_SECURITY/账号安全被盗, ACCOUNT_LOCK/风控封号, DEPOSIT_ISSUE/充值未到, PROMO_CLAIM/活动彩金, GAME_RESULT/注单结算疑问, SPORT_RULE/体育盘口规则咨询, CASINO_RULE/真人或电子场馆规则, COMPLAINT_AGENT/代理投诉或对接问题, COMPLAINT_HARASS/闹事谩骂骚扰, OTHER/其他)",
             "matched_venue": "若 intent 为 CASINO_RULE 或 SPORT_RULE 并能判定具体场馆/体育类别名称，在此填其名称，否则为null",
             "noise_detected": ["用户话术中用于干扰的次要或情绪词汇"],
             "extracted_order_id": "如果用户提供了5开头的纯数字注单号(15位以上)，在此提取，否则为null"
           }`;

           const triagePrompt = `你是一个冷酷的“后台风控分诊员”。
           任务：分析用户最新输入的工单，剥离一切噪音，只提取最核心的业务意图，并以纯 JSON 返回。
           ${venueListHint}
           【输出Schema】: ${triageSchema}
           【用户最新输入】: ${currentUserMsg}`;

           const triageMessages = [ { role: 'system', content: 'You are a JSON extractor for Risk Control.' }, { role: 'user', content: triagePrompt } ];
           
           let triageResult = { core_intent: "OTHER", matched_venue: null, noise_detected: [], extracted_order_id: null };

           if (currentImages.length === 0) {
               const tRes = await callGeminiJSON(triageMessages, 0.1, MODE_FAST);
               if (tRes.success && tRes.data) { triageResult = { ...triageResult, ...tRes.data }; }
           } else {
               triageResult.core_intent = "IMAGE_ANALYSIS";
           }

           let venueRuleContext = "";
           if (triageResult.matched_venue && venueRules.length > 0) {
               const mv = triageResult.matched_venue.toLowerCase();
               const matched = venueRules.find(v => (v.name || '').toLowerCase().includes(mv) || mv.includes((v.name || '').toLowerCase()));
               if (matched && matched.rules) {
                   venueRuleContext = `\n\n### 🎯 命中场馆规则 (${matched.name})\n${matched.rules}`;
               }
           }

           let betContext = "";
           let noticeContext = "";
           let currentTicketRes = null;

           const orderIdMatch = triageResult.extracted_order_id || currentUserMsg.match(/5\d{15,19}/)?.[0];
           if (orderIdMatch) {
               const ticketRes = await DBS_API.queryTicket(orderIdMatch);
               if (ticketRes.success) {
                   currentTicketRes = ticketRes;
                   betContext = ticketRes.text;
                   
                   const settledCodes = [4, 5, 3, 6, 2];
                   const targetMatches = ticketRes.rawDetails.filter(detail => {
                       const isUnsettled = !settledCodes.includes(detail.betResult);
                       const isAbnormal = detail.remark && (detail.remark.includes('取消') || detail.remark.includes('拒单'));
                       return isUnsettled || isAbnormal;
                   });

                   if (targetMatches.length > 0) {
                       const noticeResults = await Promise.all(targetMatches.map(async (detail) => {
                           const res = await DBS_API.queryAnnouncement(detail.matchId);
                           if (res && res.hasNotice) return `\n🚨【发现异常公告】\n>>> 赛事：${detail.matchInfo}\n>>> 公告：${res.content}\n---`;
                           return null;
                       }));
                       noticeContext = noticeResults.filter(n => n !== null).join("\n");
                   }
               }
           }

           let dynamicContext = `
           【系统情报 (Triage Intelligence)】：
           - AI 初步判定诉求为：${triageResult.core_intent}
           - 命中场馆：${triageResult.matched_venue || '无'}
           - 需注意过滤的用户噪音：${triageResult.noise_detected?.length > 0 ? triageResult.noise_detected.join(', ') : '无'}
           - 客观注单数据（如有）：${betContext || '无'}
           - 赛事异常公告（如有）：${noticeContext || '无'}${venueRuleContext}

           *注意：请结合你的【核心人设】和【处理紧急问题规则】，自行判断如何回复。不要暴露你的思考过程，直接给出回复。如果注单未结算，在结尾加入 <<<ACTION_TRACK>>> 触发监控。若命中了场馆规则，请严格按照规则回答，不要编造不存在的条款。*
           `;

           let redLinesContext = "";
           try {
               const allTraining = await window.fbOps.getTrainingDataAll();
               const recentBads = allTraining.filter(l => l.type === 'bad' && l.correction).slice(0, 3);
               if (recentBads.length > 0) {
                   redLinesContext = "### 🚨 绝对操作红线 (历史教训)\n" + recentBads.map((l, i) => `${i+1}. 曾犯错: ${l.answer}\n纠正: ${l.correction}`).join("\n");
               }
           } catch(err) {}

           setAiPhase('execution');

           const currentScriptLib = scripts.map(s => `[${s.keywords || '通用'}]: ${s.content}`).join("\n");
           const hiddenDocs = extraKnowledge.map(k => `[${k.keywords}]: ${k.content}`).join("\n");

           const staticSystemPrompt = `
           ${chatBase}
           
           ### 业务硬性逻辑 (Business Rules)
           ${businessRules}
           
           ### 话术库与知识库
           ${chatKnowledge}
           ${currentScriptLib}
           ${hiddenDocs}
           `;

           const executionUserPrompt = `
           ${redLinesContext}
           ${dynamicContext}
           
           【用户原始输入内容】：${currentUserMsg}
           `;

           const historyToSend = currentFullHistory.slice(0, -1).map(msg => {
               let txt = msg.displayContent;
               if (!txt && typeof msg.content === 'string') txt = msg.content;
               return { role: msg.role === 'assistant' ? 'assistant' : 'user', content: txt || " " };
           });

           let finalContent = [];
           if (currentImages.length > 0) {
               currentImages.forEach(img => { finalContent.push({ inlineData: { mimeType: img.mimeType, data: img.data } }); });
               finalContent.push({ text: `【临时控制指令】\n${executionUserPrompt}` });
           } else {
               finalContent.push({ text: executionUserPrompt });
           }

           const execMessages = [ 
               { role: 'system', content: staticSystemPrompt },
               ...historyToSend,
               { role: 'user', content: finalContent }
           ];

           let hasTriggeredTracker = false;
           
           const res = await callGeminiStream(execMessages, 0.4, (chunk, fullText) => { 
               if (fullText.includes("<<<ACTION_TRACK>>>")) {
                   const rawItem = currentTicketRes?.rawItem;
                   const isPending = rawItem && (rawItem.outcome === null || rawItem.outcome === 0 || rawItem.outcome === 1);
                   if (!hasTriggeredTracker && currentTicketRes && isPending && !noticeContext) {
                       hasTriggeredTracker = true; 
                       addToTracker(currentTicketRes.rawDetails, currentTicketRes.rawItem);
                   }
               }

               const cleanText = fullText.replace("<<<ACTION_TRACK>>>", "");
               setAiReply(cleanText); 
               
               setChatHistory(currHist => {
                   const hist = [...currHist];
                   if (hist.length > 0 && hist[hist.length - 1].role === 'user') {
                       hist.push({ role: 'assistant', content: cleanText, displayContent: cleanText, triageData: currentImages.length===0 ? triageResult : null });
                   } else if (hist.length > 0) {
                       hist[hist.length - 1].content = cleanText;
                       hist[hist.length - 1].displayContent = cleanText;
                       hist[hist.length - 1].triageData = currentImages.length===0 ? triageResult : null;
                   }
                   return hist;
               });
           }, MODE_THINK);

           if (res.error) setAiReply("AI Error: " + res.error);
           if (res.usage) setLastUsage(res.usage);
           
           setAiPhase('');
           setAiLoading(false);

         } catch (e) { 
             console.error(e); 
             setAiReply("处理过程出错: " + e.message); 
             setAiPhase('');
             setAiLoading(false);
         }
     };

    const executeSmartOptimization = async () => {
        if (!smartOptReason.trim()) return setNotification({title: '提示', message: '请告诉AI哪里错了，需要怎么改', type: 'error'});
        setIsSmartOptimizing(true);
        
        let targetInstruction = "";
        if (smartOptTarget === 'base') targetInstruction = "【强制指令】：你只能修改【System Prompt (基础人设)】。保持业务逻辑和知识库完全不变。";
        else if (smartOptTarget === 'rules') targetInstruction = "【强制指令】：你只能修改【业务硬性逻辑】。保持人设和知识库完全不变。";
        else if (smartOptTarget === 'knowledge') targetInstruction = "【强制指令】：你只能修改【智能知识库】。保持人设和业务逻辑完全不变。";
        else targetInstruction = "【指令】：请根据管理员的描述，自动判断应该修改人设、逻辑还是知识库。";

        const targetMsgContent = activeMsgIndex >= 0 && chatHistory[activeMsgIndex] ? (chatHistory[activeMsgIndex].displayContent || chatHistory[activeMsgIndex].content) : aiReply;
        const lastInteraction = `【AI曾做出的回复】: ${targetMsgContent}\n【您的修改建议】: ${smartOptReason}`;
        
        const metaPrompt = `你是一个高级AI指令架构师。请根据管理员的【修改建议】，优化后台配置。\n${targetInstruction}\n【当前配置快照】:\n1. System Prompt:\n${chatBase}\n2. 业务硬性逻辑:\n${businessRules}\n3. 智能知识库:\n${chatKnowledge}\n【交互上下文】:\n${lastInteraction}\n【输出格式 (JSON Only)】:\n{ "updatedChatBase": "...", "updatedBusinessRules": "...", "updatedKnowledge": "..." }`;
        const messages = [ { role: 'system', content: 'You are an expert prompt engineer. Output JSON only.' }, { role: 'user', content: metaPrompt } ];

        try {
            const res = await callGeminiJSON(messages, 1.0, MODE_THINK);
            if (res.success && res.data) {
                const newChatBase = res.data.updatedChatBase || chatBase;
                const newRules = res.data.updatedBusinessRules || businessRules;
                const newKnowledge = res.data.updatedKnowledge || chatKnowledge; 
                
                setChatBase(newChatBase);
                setBusinessRules(newRules);
                setChatKnowledge(newKnowledge);
                
                await window.fbOps.saveCloudPrompts({ chat_base: newChatBase, business_rules: newRules, chat_knowledge: newKnowledge });
                
                setShowSmartOptModal(false);
                setSmartOptReason('');
                setSmartOptTarget('auto'); 
                setActiveTab('training'); 
                setNotification({title: '进化成功', message: `已针对【${smartOptTarget === 'auto' ? '自动判断' : smartOptTarget}】完成专项修正！`, type: 'success'});
            } else { throw new Error("AI 生成格式异常，未应用。"); }
        } catch(e) { setNotification({title: '进化失败', message: e.message, type: 'error'}); }
        setIsSmartOptimizing(false);
    };

    const handleTrainChat = async () => {
        setIsChatTrainingLoading(true);
        try {
            const logs = await window.fbOps.getTrainingDataAll(); const relevantLogs = logs.filter(l => (l.type === 'bad' && l.correction) || l.type === 'good'); 
            if (relevantLogs.length === 0) { setNotification({title: '提示', message: '未发现有效的训练记录，无法优化。', type: 'error'}); return; }
            const feedbackContent = relevantLogs.map((c, i) => { if (c.type === 'good') return `[案例 ${i+1} - 正面反馈] Q: ${c.question}\nAI回答: ${c.answer}`; return `[案例 ${i+1} - 负面修正] Q: ${c.question}\nAI错误回答: ${c.answer}\n人工修正: ${c.correction}`; }).join("\n---\n");
            const metaMessages = [ { role: "system", content: "你是一位高级知识工程师和逻辑侦探。" }, { role: "user", content: `请分析以下训练日志，重写【AI知识库】。\n\n【基础设定】:\n${chatBase}\n\n【训练日志】:\n${feedbackContent}\n\n请直接输出最终的知识库内容。`} ];
            let newKnowledge = ''; const onChunk = (chunk, fullText) => { newKnowledge = fullText; setChatKnowledge(fullText); };
            const res = await callGeminiStream(metaMessages, 1.0, onChunk, MODE_THINK);
            
            if (res.success) { await window.fbOps.saveCloudPrompts({ chat_base: chatBase, chat_knowledge: newKnowledge || chatKnowledge, business_rules: businessRules }); setNotification({title: '训练完成', message: '客服知识库已更新', type: 'success'}); }
        } catch (e) { setNotification({title: '训练失败', message: e.message, type: 'error'}); } finally { setIsChatTrainingLoading(false); }
    };

    const handleTrainAnnouncement = async () => {
         setIsAnnTrainingLoading(true);
         try {
             const logs = await window.fbOps.getAnnLogsAll(); const relevantLogs = logs.filter(l => (l.type === 'bad' && l.reason) || l.type === 'good');
             if (relevantLogs.length === 0) { setNotification({title: '提示', message: '未发现有效的训练记录', type: 'error'}); return; }
             const feedbackContent = relevantLogs.map((c, i) => { if (c.type === 'good') return `[Case ${i+1} - 正面] Raw: ${c.raw}\nOutput: ${c.front}`; return `[Case ${i+1} - 负面] Raw: ${c.raw}\nWrong: ${c.wrong_front}\nReason: ${c.reason}`; }).join("\n---\n");
             const metaMessages = [ { role: "system", content: "You are a strict AI Trainer. Output ONLY the raw content." }, { role: "user", content: `请根据以下训练日志，构建【智能知识库】。\n【基础人设】:\n${annBase}\n【错题集】:\n${feedbackContent}\n只输出纠错补充规则，不输出已有规则和废话。` } ];
             let newKnowledge = ''; const onChunk = (chunk, fullText) => { newKnowledge = fullText; setAnnKnowledge(fullText); };
             const res = await callGeminiStream(metaMessages, 1.0, onChunk, MODE_THINK);
             
             if (res.success) { await window.fbOps.saveCloudPrompts({ ann_base: annBase, ann_knowledge: newKnowledge || annKnowledge }); setNotification({title: '训练完成', message: '公告知识库已更新', type: 'success'}); }
         } catch(e) { setNotification({title: '训练失败', message: e.message, type: 'error'}); } finally { setIsAnnTrainingLoading(false); }
     };

    const executeSaveCloudPrompts = async () => {
        if (!saveConfirmType) return;
        try {
            let newData = {}; let typeName = "";
            if (saveConfirmType === 'chat') { newData = { chat_base: chatBase, chat_knowledge: chatKnowledge, business_rules: businessRules }; typeName = "客服"; } 
            else if (saveConfirmType === 'ann') { newData = { ann_base: annBase, ann_knowledge: annKnowledge }; typeName = "公告"; }
            await window.fbOps.saveCloudPrompts(newData);
            setNotification({ title: "保存成功", message: `${typeName}AI设定已更新到云端。`, type: "success" }); await loadData();
         } catch(e) { setNotification({ title: "保存失败", message: e.message, type: "error" }); } finally { setSaveConfirmType(null); }
    };
    
    const handleSaveCloudPrompts = (type) => { setSaveConfirmType(type); };
    const handleSaveScript = async () => { updateActivity(); if (!scriptForm.content) return setNotification({title: '提示', message: '内容不能为空', type: 'error'}); setSaveStatus('saving'); try { await window.fbOps.saveScript(scriptForm); const s = await window.fbOps.getScripts(); setScripts(s); setShowScriptModal(false); setSaveStatus('success'); setTimeout(() => setSaveStatus('idle'), 2000); await loadData(); } catch (e) { setNotification({title: '保存失败', message: e.message, type: 'error'}); setSaveStatus('idle'); } };
    const openAddImage = () => { updateActivity(); setImageForm({ file: null, preview: null, title: '', tags: '' }); setShowImageModal(true); };
    const handleUploadImage = async () => { updateActivity(); if (!imageForm.file || !imageForm.tags) return setNotification({title: '提示', message: '请选择图片并填写标签', type: 'error'}); setUploading(true); try { await window.fbOps.uploadImage(imageForm.file, imageForm.title || 'img', imageForm.tags); const i = await window.fbOps.getImages(); setImages(i); setShowImageModal(false); } catch (e) { setNotification({title: '上传失败', message: e.message, type: 'error'}); } setUploading(false); };
    const handleDelete = async (type, item) => { updateActivity(); if (type === 'script' && userRole !== 'admin') { setShowPermissionModal(true); return; } setPendingDelete({ type, item }); setShowDeleteModal(true); };
    
    const handleLikeMsg = async (idx) => { 
        updateActivity(); 
        const ans = chatHistory[idx].displayContent || chatHistory[idx].content;
        const q = idx > 0 ? chatHistory[idx - 1].displayContent || chatHistory[idx - 1].content : "多轮对话";
        await window.fbOps.saveFeedback({ question: q, answer: ans, type: 'good' }); 
        setNotification({title:'反馈成功', message:'已记录完美评价', type:'success'});
    };

    const handleDislikeMsg = React.useCallback((idx) => { 
        updateActivity(); 
        setActiveMsgIndex(idx);
        setFeedbackState('rating_bad'); 
        setCorrectionText(chatHistory[idx].displayContent || chatHistory[idx].content); 
    }, [chatHistory]);

    const submitCorrectionMsg = React.useCallback(async () => { 
        updateActivity(); 
        if (!correctionText.trim()) return setNotification({title: '提示', message: '请修正内容', type: 'error'}); 
        const ans = chatHistory[activeMsgIndex].displayContent || chatHistory[activeMsgIndex].content;
        const q = activeMsgIndex > 0 ? chatHistory[activeMsgIndex - 1].displayContent || chatHistory[activeMsgIndex - 1].content : "多轮对话";
        const payload = { question: q, answer: ans, correction: correctionText, type: 'bad', time: new Date().toLocaleString() }; 
        await window.fbOps.saveFeedback(payload); 
        setActiveMsgIndex(-1);
        setFeedbackState('none');
        setNotification({title:'纠错成功', message:'已录入后台错题本', type:'success'});
    }, [activeMsgIndex, chatHistory, correctionText]);

    const openSmartOptModal = React.useCallback((idx) => {
        setActiveMsgIndex(idx);
        setSmartOptReason('');
        setSmartOptTarget('auto');
        setShowSmartOptModal(true);
    }, []);

    const handleCopy = React.useCallback((text) => { updateActivity(); navigator.clipboard.writeText(text); setNotification({title:'复制成功', message:'', type:'success'}); }, []);
    const handleCopyScript = (content, id) => { updateActivity(); navigator.clipboard.writeText(content); setCopiedScriptId(id); setSearchTerm(''); setTimeout(() => setCopiedScriptId(null), 1000); };
    const handleAnnFeedback = async (type) => { updateActivity(); if (type === 'bad' && !annCorrectReason.trim()) return setNotification({title: '提示', message: '请填写原因', type: 'error'}); setAnnSubmitStatus('sending'); try { await window.fbOps.saveAnnFeedback({ raw: rawNotice, ...genResult, type, reason: type==='good'?'Keep':annCorrectReason }); setAnnSubmitStatus(type === 'good' ? 'success_good' : 'success_bad'); if(type === 'bad') setAnnCorrectReason(''); setTimeout(() => setAnnSubmitStatus('idle'), 3000); } catch (e) { setNotification({title: '反馈失败', message: e.message, type: 'error'}); setAnnSubmitStatus('idle'); } };
    
    const fetchTemplates = async () => { setTemplateLoading(true); try { const templates = await window.fbOps.getTemplates(); setAllTemplates(templates); await loadData(); } catch (e) {} setTemplateLoading(false); };
    const handleSaveTemplate = async () => { if (!templateForm.type || !templateForm.front) return setNotification({title: '提示', message: '请填写前台公告模板', type: 'error'}); setTemplateSaveStatus('saving'); try { const updatedTemplates = await window.fbOps.saveTemplate(templateForm); setAllTemplates(updatedTemplates); await buildStaticCache(scripts, updatedTemplates); setTemplateSaveStatus('success'); setTimeout(() => setTemplateSaveStatus('idle'), 2000); } catch (e) { setNotification({title: '保存失败', message: e.message, type: 'error'}); setTemplateSaveStatus('idle'); } };
    const handleDeleteTemplate = async (id) => { if (userRole !== 'admin') { setShowPermissionModal(true); return; } setPendingDelete({ type: 'template', id }); setShowDeleteModal(true); };
    const startEdit = (s) => { updateActivity(); setScriptForm(s); setShowScriptModal(true); };
    const openAddScript = () => { updateActivity(); setScriptForm({ id: 'new_', category: '', keywords: '', content: '' }); setShowScriptModal(true); };
    const cancelEdit = () => { setShowScriptModal(false); setScriptForm({ id: '', category: '', keywords: '', content: '' }); };
    const executeDelete = async () => { if (!pendingDelete) return; const { type, id, item } = pendingDelete; setLoading(true); try { if (type === 'template') { const updatedTemplates = await window.fbOps.deleteTemplate(id); setAllTemplates(updatedTemplates); await buildStaticCache(scripts, updatedTemplates); if (templateForm.id === id) { setTemplateForm({ id: null, type: '', front: '', inner: '', mail: '' }); setViewTemplate(null); setIsEditingTemplate(false); } } else if (type === 'script') { await window.fbOps.deleteScript(item.id); setScripts(await window.fbOps.getScripts()); await loadData(); } else if (type === 'image') { await window.fbOps.deleteImage(item.id, item.storagePath); setImages(await window.fbOps.getImages()); } else if (type === 'chat_log') { setChatLogs(await window.fbOps.deleteTrainingData(id)); } else if (type === 'ann_log') { setAnnLogs(await window.fbOps.deleteAnnLog(id)); } setNotification({ title: "删除成功", message: "已永久删除。", type: "success" }); } catch(e) { setNotification({title: '删除失败', message: '操作未能完成', type: 'error'}); } setLoading(false); setShowDeleteModal(false); setPendingDelete(null); };

    const handleSaveAccount = async () => {
        if (!accountForm.username) return setNotification({title: '提示', message: '请填写用户名', type: 'error'});
        try {
            await window.fbOps.saveAccount(accountForm);
            setShowAccountModal(false);
            fetchAccounts();
            setNotification({title: '成功', message: '账号保存成功', type: 'success'});
        } catch(e) {
            setNotification({title: '失败', message: e.message, type: 'error'});
        }
    };

    const handleDeleteAccount = async (id) => {
        if(!confirm('确定要删除此账号吗？')) return;
        try {
            await window.fbOps.deleteAccount(id);
            fetchAccounts();
            setNotification({title: '成功', message: '已删除', type: 'success'});
        } catch(e) {
            setNotification({title: '失败', message: e.message, type: 'error'});
        }
    };

    // ===== 场馆规则库 Handlers =====
    const openVenueModal = () => {
        updateActivity();
        setShowVenueModal(true);
        if (!activeVenueId && venueRules.length > 0) {
            const first = venueRules[0];
            setActiveVenueId(first.id);
            setVenueDraft({ name: first.name || '', rules: first.rules || '', imageCount: first.imageCount || 0 });
        } else if (!activeVenueId) {
            setVenueDraft({ name: '', rules: '', imageCount: 0 });
        }
    };

    const handleCreateVenue = () => {
        const newId = 'venue_' + Date.now();
        setActiveVenueId(newId);
        setVenueDraft({ name: '', rules: '', imageCount: 0 });
    };

    const handleSelectVenue = (v) => {
        setActiveVenueId(v.id);
        setVenueDraft({ name: v.name || '', rules: v.rules || '', imageCount: v.imageCount || 0 });
        setVenueSaveStatus('idle');
    };

    const handleDeleteVenue = async (id, e) => {
        if (e) e.stopPropagation();
        if (!confirm('确定删除此场馆的所有规则吗？此操作不可撤销。')) return;
        try {
            const updated = await window.fbOps.deleteVenueRules(id);
            setVenueRules(updated || []);
            if (activeVenueId === id) {
                setActiveVenueId(null);
                setVenueDraft({ name: '', rules: '', imageCount: 0 });
            }
            buildStaticCache(scripts, allTemplates, chatKnowledge, annKnowledge, updated || []);
        } catch(err) {
            setNotification({ title: '删除失败', message: err.message, type: 'error' });
        }
    };

    const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const data = ev.target.result.split(',')[1];
            resolve({ mimeType: file.type, data, name: file.name });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const handleVenueImagesUpload = async (files) => {
        if (!files || files.length === 0) return;
        const imgFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (imgFiles.length === 0) {
            setNotification({ title: '提示', message: '请选择图片文件', type: 'error' });
            return;
        }
        if (!activeVenueId) {
            setNotification({ title: '提示', message: '请先选择或创建一个场馆', type: 'error' });
            return;
        }

        setVenueExtracting(true);
        setVenueProgress({ done: 0, total: imgFiles.length, current: imgFiles[0].name });

        const existingRules = venueDraft.rules || '';
        const venueName = venueDraft.name || '未命名场馆';
        let accumulated = existingRules;
        const batchSize = 4;

        try {
            for (let i = 0; i < imgFiles.length; i += batchSize) {
                const batch = imgFiles.slice(i, i + batchSize);
                setVenueProgress({ done: i, total: imgFiles.length, current: batch.map(f => f.name).join(', ') });

                const encoded = await Promise.all(batch.map(readFileAsBase64));

                const prompt = `你是一个专业的体育博彩场馆规则提取器。当前场馆名称：【${venueName}】。
任务：仔细阅读下面的多张截图(可能是盘口规则/返水/活动/常见问题/玩法说明等)，把其中与规则、条款、赔率限制、结算规则、投注类型定义等业务相关的条款提炼成结构化的纯文本规则文档，条目清晰可读。

【重要要求】：
1. 只输出纯规则文字，不要任何前言或客套话。
2. 使用简明的中文短句，按主题分段（如：结算规则 / 注单有效性 / 投注类型定义 / 异常情况处理 / 特殊玩法 等）。
3. 忽略图片中的广告、装饰、页眉页脚、客服二维码等非规则内容。
4. 如果一张图里有相同规则的重复片段，合并去重。
5. 不要输出"根据图片"、"以下是规则"等无意义开头。
6. 仅输出规则原文（允许用标题/列表）。

【已有规则(避免重复)】：
${accumulated ? accumulated.substring(0, 1500) : '(空)'}

请输出本批截图中新增或补充的规则内容（纯文本）：`;

                const parts = encoded.map(img => ({ inlineData: { mimeType: img.mimeType, data: img.data } }));
                parts.push({ text: prompt });

                const messages = [
                    { role: 'system', content: '你是精准的文档提取专家，只输出结构化的规则文本。' },
                    { role: 'user', content: parts }
                ];

                const res = await callGeminiStream(messages, 0.2, null, MODE_THINK);
                if (res.success && res.data) {
                    const newChunk = res.data.trim();
                    if (newChunk) {
                        accumulated = accumulated
                            ? `${accumulated}\n\n---【第 ${i + 1} - ${Math.min(i + batchSize, imgFiles.length)} 张】---\n${newChunk}`
                            : newChunk;
                        setVenueDraft(prev => ({ ...prev, rules: accumulated, imageCount: (prev.imageCount || 0) + batch.length }));
                    }
                } else if (res.error) {
                    console.warn('Venue extract batch error:', res.error);
                }

                setVenueProgress({ done: Math.min(i + batchSize, imgFiles.length), total: imgFiles.length, current: '' });
            }

            setNotification({ title: '提取完成', message: `已处理 ${imgFiles.length} 张截图，请检查规则内容并保存。`, type: 'success' });
        } catch (err) {
            console.error(err);
            setNotification({ title: '提取出错', message: err.message || '未知错误', type: 'error' });
        } finally {
            setVenueExtracting(false);
            setVenueProgress({ done: 0, total: 0, current: '' });
        }
    };

    const handleSaveVenue = async () => {
        if (!venueDraft.name.trim()) {
            setNotification({ title: '提示', message: '请填写场馆名称', type: 'error' });
            return;
        }
        if (!activeVenueId) return;
        setVenueSaveStatus('saving');
        try {
            const updated = await window.fbOps.saveVenueRules({
                id: activeVenueId,
                name: venueDraft.name.trim(),
                rules: venueDraft.rules || '',
                imageCount: venueDraft.imageCount || 0
            });
            setVenueRules(updated || []);
            buildStaticCache(scripts, allTemplates, chatKnowledge, annKnowledge, updated || []);
            setVenueSaveStatus('success');
            setTimeout(() => setVenueSaveStatus('idle'), 1600);
        } catch (err) {
            setNotification({ title: '保存失败', message: err.message, type: 'error' });
            setVenueSaveStatus('idle');
        }
    };


    const uniqueCategories = useMemo(() => [...new Set(scripts.map(s => String(s.category || '').trim()).filter(c => c))], [scripts]);
    const filteredScripts = useMemo(() => scripts.filter(s => { const term = searchTerm.toLowerCase(); const kw = String(s.keywords || '').toLowerCase(); const ct = String(s.content || '').toLowerCase(); const cat = String(s.category || '').toLowerCase(); const matchesSearch = !term || kw.includes(term) || ct.includes(term) || cat.includes(term); const matchesCategory = !selectedCategory || s.category === selectedCategory; return matchesSearch && matchesCategory; }), [searchTerm, scripts, selectedCategory]);
    const fuse = useMemo(() => { if (typeof Fuse === 'undefined') return null; return new Fuse(images, { keys: ['title', 'tags'], threshold: 0.4 }); }, [images]);
    const filteredImages = useMemo(() => { if (searchTerm && images.length && fuse) { return fuse.search(searchTerm).map(r => r.item); } return images; }, [searchTerm, images, fuse]);
    
    const wmText = `${currentUser || '内部系统'}  禁止外传`;
    const wmSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" transform="rotate(-45, 150, 150)" fill="rgba(100, 116, 139, 0.15)" font-size="16" font-weight="bold" font-family="sans-serif">${wmText}</text></svg>`;
    const wmBackground = `url("data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(wmSvg)))}")`;
    
    if (authLoading) return <div className="h-screen w-full flex items-center justify-center text-slate-400">正在启动助手...</div>;
    if (!isAuthorized) return <LoginScreen onLogin={(user, role) => { localStorage.setItem(SESSION_KEY_TIME, Date.now().toString()); localStorage.setItem(SESSION_KEY_USER, user); localStorage.setItem(SESSION_KEY_ROLE, role); setCurrentUser(user); setUserRole(role); setIsAuthorized(true); setLoading(true); loadData(); }} />;

    return (
      <div className="flex flex-col h-screen bg-slate-100 overflow-hidden fade-in pb-8">
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none', backgroundImage: wmBackground, backgroundRepeat: 'repeat' }} />
        
        {/* ======================= */}
        {/* 全局弹窗区 */}
        {/* ======================= */}

        {/* 新增/编辑话术弹窗 (悬浮居中) */}
        {showScriptModal && (
            <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 fade-in" onClick={cancelEdit}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col transform transition-all scale-100 overflow-hidden max-h-[90vh]" onClick={e => e.stopPropagation()}>
                    <div className="p-4 border-b flex justify-between items-center bg-zinc-50">
                        <span className="font-bold text-slate-700 flex items-center gap-2">
                            <Icon d={PATHS.Edit} className="w-5 h-5 text-zinc-700"/>
                            {scriptForm.id.startsWith('new_') ? '新增话术' : '编辑话术'}
                        </span>
                        <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600"><Icon d={PATHS.Close} className="w-5 h-5"/></button>
                    </div>
                    <div className="p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <label className="block text-xs font-bold text-slate-500 mb-1">分类 (必填)</label>
                                <div className="relative">
                                    <input list="category-options" value={scriptForm.category} onChange={e => setScriptForm({...scriptForm, category: e.target.value})} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200" placeholder="选择或输入"/>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Icon d={PATHS.ChevronDown} className="w-4 h-4"/></div>
                                </div>
                                <datalist id="category-options">{uniqueCategories.map(c => <option key={c} value={c} />)}</datalist>
                            </div>
                            <div className="flex-[2]">
                                <label className="block text-xs font-bold text-slate-500 mb-1">关键字 (用于搜索)</label>
                                <input value={scriptForm.keywords} onChange={e => setScriptForm({...scriptForm, keywords: e.target.value})} className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200" placeholder="多个关键词用空格隔开"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">话术内容</label>
                            <textarea value={scriptForm.content} onChange={e => setScriptForm({...scriptForm, content: e.target.value})} className="w-full h-40 border border-zinc-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200 resize-none custom-scrollbar" placeholder="输入具体的话术内容..."></textarea>
                        </div>
                    </div>
                    <div className="p-4 border-t bg-zinc-50 flex justify-end gap-2">
                        <button onClick={cancelEdit} className="px-4 py-2 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-200 transition">取消</button>
                        <button onClick={handleSaveScript} disabled={saveStatus === 'saving'} className="px-6 py-2 rounded-lg bg-zinc-800 text-white font-medium hover:bg-zinc-900 transition disabled:opacity-50">{saveStatus === 'saving' ? '保存中...' : '保存'}</button>
                    </div>
                </div>
            </div>
        )}

        {showSmartOptModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 fade-in" onClick={() => setShowSmartOptModal(false)}>
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md flex flex-col gap-4 transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center border-b pb-3">
                      <div className="flex items-center gap-2 text-purple-700">
                          <Icon d={PATHS.Brain} className="w-6 h-6"/>
                          <h3 className="text-lg font-bold">AI 逻辑修正 (自我进化)</h3>
                      </div>
                      <button onClick={() => setShowSmartOptModal(false)} className="text-slate-400 hover:text-slate-600"><Icon d={PATHS.Close} className="w-5 h-5"/></button>
                  </div>
                  
                  <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100 text-xs text-slate-500">
                      <span className="font-bold text-slate-700">当前追问内容：</span>
                      <div className="truncate text-red-500 mt-1">A: {(activeMsgIndex >= 0 && chatHistory[activeMsgIndex] ? (chatHistory[activeMsgIndex].displayContent || chatHistory[activeMsgIndex].content) : aiReply).substring(0, 50)}...</div>
                  </div>

                  <div>
                  <div className="mb-4">
                      <label className="block text-xs font-bold text-slate-700 mb-2">您希望 AI 修改哪里？</label>
                      <div className="grid grid-cols-4 gap-2">
                          {[
                              { id: 'auto', label: '🤖 自动判断', icon: PATHS.Sparkles },
                              { id: 'rules', label: '⚖️ 业务逻辑', icon: PATHS.Shield },
                              { id: 'base', label: '🎭 基础人设', icon: PATHS.User },
                              { id: 'knowledge', label: '🧠 知识库', icon: PATHS.Brain },
                          ].map(opt => (
                              <button
                                  key={opt.id}
                                  onClick={() => setSmartOptTarget(opt.id)}
                                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-[10px] font-bold gap-1 ${
                                      smartOptTarget === opt.id 
                                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                                      : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300'
                                  }`}
                              >
                                  <Icon d={opt.icon} className="w-4 h-4"/>
                                  {opt.label}
                              </button>
                          ))}
                      </div>
                  </div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">告诉 AI 哪里错了，应该遵守什么规则？</label>
                      <textarea 
                          autoFocus
                          value={smartOptReason}
                          onChange={e => setSmartOptReason(e.target.value)}
                          className="w-full border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-300 focus:border-transparent transition text-sm min-h-[100px] resize-none bg-zinc-50"
                          placeholder="例如：不要说'搞一下'，太不专业了。或者：串关输半公式不对，应该是0.5..."
                      />
                  </div>

                  <button 
                      onClick={executeSmartOptimization} 
                      disabled={isSmartOptimizing}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:shadow-lg disabled:opacity-70 transition flex items-center justify-center gap-2"
                  >
                      {isSmartOptimizing ? (
                          <>
                              <div className="spinner border-white/30 border-t-white"></div>
                               正在重写底层逻辑...
                          </>
                      ) : (
                          <>
                              <Icon d={PATHS.Magic} className="w-4 h-4"/>
                              立即修正规则
                          </>
                      )}
                  </button>
              </div>
          </div>
        )}
        {saveConfirmType && <SaveConfirmModal type={saveConfirmType} onClose={() => setSaveConfirmType(null)} onConfirm={executeSaveCloudPrompts} />}
        {notification && <NotificationModal {...notification} onClose={() => setNotification(null)} />}
        {showInputModal && <GeneralInputModal title="此网页显示" placeholder="请输入新增变量名 (无需大括号):" value={inputValue} onChange={setInputValue} onConfirm={confirmAddCustomVar} onCancel={() => setShowInputModal(false)} />}
        {showBackupConfirm && <GeneralConfirmModal title="确认备份" message="确定要下载所有数据库数据(JSON)到本地吗？" onConfirm={confirmDownloadBackup} onCancel={() => setShowBackupConfirm(false)} type="info" confirmText="确认下载" />}
        {showDebugModal && lastDebugInfo && <DebugModal data={lastDebugInfo} onClose={() => setShowDebugModal(false)} />}
        {showTrackerModal && <TrackerModal isOpen={showTrackerModal} onClose={() => { setShowTrackerModal(false); setHasUnreadUpdates(false); }} tickets={trackedTickets} onDelete={handleDeleteTracked} isRefreshing={isTrackerRefreshing} trackerMsg={trackerMsg} />}

        {/* ===== 场馆规则库 弹窗 ===== */}
        {showVenueModal && (
            <div className="venue-modal-overlay" onClick={() => setShowVenueModal(false)}>
                <div className="venue-modal" onClick={e => e.stopPropagation()}>
                    <div className="venue-modal-head">
                        <div className="venue-modal-title">
                            <Icon d={PATHS.Shield} className="w-5 h-5"/>
                            <span>场馆规则库</span>
                            <span className="ml-2 text-[10px] font-medium bg-white/20 px-2 py-0.5 rounded-full">AI 自动识图提取</span>
                        </div>
                        <button onClick={() => setShowVenueModal(false)} className="venue-modal-close">
                            <Icon d={PATHS.Close} className="w-4 h-4"/>
                        </button>
                    </div>
                    <div className="venue-modal-body">
                        <aside className="venue-sidebar">
                            <div className="venue-sidebar-head">
                                <span className="venue-sidebar-title">
                                    <Icon d={PATHS.Database} className="w-3.5 h-3.5"/>场馆 ({venueRules.length})
                                </span>
                                <button onClick={handleCreateVenue} className="venue-add-btn">
                                    <Icon d={PATHS.Plus} className="w-3 h-3"/>新建
                                </button>
                            </div>
                            <div className="venue-list custom-scrollbar">
                                {venueRules.length === 0 && !activeVenueId && (
                                    <div className="text-center text-[11px] text-slate-400 py-6 px-2">
                                        点击右上角"新建"创建第一个场馆
                                    </div>
                                )}
                                {activeVenueId && !venueRules.find(v => v.id === activeVenueId) && (
                                    <div className="venue-item active">
                                        <div className="venue-item-name">
                                            <span className="truncate">{venueDraft.name || '新场馆（未保存）'}</span>
                                        </div>
                                        <div className="venue-item-meta">
                                            <span>● 未保存</span>
                                        </div>
                                    </div>
                                )}
                                {venueRules.map(v => (
                                    <div key={v.id}
                                         onClick={() => handleSelectVenue(v)}
                                         className={`venue-item ${activeVenueId === v.id ? 'active' : ''}`}>
                                        <div className="venue-item-name">
                                            <span className="truncate">{v.name || '未命名'}</span>
                                            <span className="venue-item-del" onClick={(e) => handleDeleteVenue(v.id, e)}>
                                                <Icon d={PATHS.Trash} className="w-3.5 h-3.5"/>
                                            </span>
                                        </div>
                                        <div className="venue-item-meta">
                                            <span>{v.imageCount || 0} 张截图</span>
                                            <span>·</span>
                                            <span>{(v.rules || '').length} 字</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </aside>
                        <section className="venue-content">
                            {!activeVenueId ? (
                                <div className="venue-content-empty">
                                    <Icon d={PATHS.Shield} className="w-10 h-10 opacity-40"/>
                                    <div className="font-bold text-sm text-slate-500">选择左侧场馆开始编辑</div>
                                    <div className="text-xs text-slate-400">或点击「新建」创建新场馆</div>
                                </div>
                            ) : (
                                <>
                                    <div className="venue-content-head">
                                        <input
                                            value={venueDraft.name}
                                            onChange={(e) => setVenueDraft({...venueDraft, name: e.target.value})}
                                            placeholder="输入场馆名称，例如：沙巴体育 / BBIN真人 / PT电子..."
                                            className="venue-name-input"/>
                                        <div className="text-[11px] text-slate-400 shrink-0">
                                            已整理 {venueDraft.imageCount} 张 · {(venueDraft.rules || '').length} 字
                                        </div>
                                    </div>

                                    <div
                                        className={`venue-dropzone ${venueDragging ? 'dragging' : ''} ${venueExtracting ? 'pointer-events-none opacity-70' : ''}`}
                                        onClick={() => !venueExtracting && venueFileInputRef.current?.click()}
                                        onDragOver={(e) => { e.preventDefault(); setVenueDragging(true); }}
                                        onDragLeave={() => setVenueDragging(false)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setVenueDragging(false);
                                            if (!venueExtracting) handleVenueImagesUpload(e.dataTransfer.files);
                                        }}>
                                        <div className="venue-dropzone-icon">
                                            <Icon d={PATHS.Image} className="w-5 h-5"/>
                                        </div>
                                        <div className="venue-dropzone-text">
                                            {venueDragging ? '松开即可上传' : '点击或拖拽图片上传（支持批量）'}
                                        </div>
                                        <div className="venue-dropzone-hint">
                                            支持 JPG / PNG / WebP，可一次上传几十张，AI 会自动提取规则条款
                                        </div>
                                        <input
                                            ref={venueFileInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            style={{display: 'none'}}
                                            onChange={(e) => {
                                                handleVenueImagesUpload(e.target.files);
                                                e.target.value = '';
                                            }}/>
                                    </div>

                                    {venueExtracting && (
                                        <div className="venue-progress">
                                            <div className="spinner" style={{width: 18, height: 18, borderWidth: 2, borderColor: '#c4b5fd', borderTopColor: '#6366f1'}}></div>
                                            <div className="venue-progress-bar">
                                                <div
                                                    className="venue-progress-fill"
                                                    style={{width: `${venueProgress.total > 0 ? (venueProgress.done / venueProgress.total * 100) : 0}%`}}></div>
                                            </div>
                                            <div className="venue-progress-text">
                                                {venueProgress.done}/{venueProgress.total} 张
                                            </div>
                                        </div>
                                    )}

                                    <div className="venue-rules-wrap">
                                        <div className="venue-rules-label">
                                            <Icon d={PATHS.Edit} className="w-3 h-3"/>规则内容（可人工编辑）
                                        </div>
                                        <textarea
                                            value={venueDraft.rules}
                                            onChange={(e) => setVenueDraft({...venueDraft, rules: e.target.value})}
                                            placeholder="上传截图后，AI 提取的规则会累积在这里。你也可以直接手动编辑 / 补充。"
                                            className="venue-rules-textarea custom-scrollbar"/>
                                        <div className="venue-save-row">
                                            <button
                                                onClick={handleSaveVenue}
                                                disabled={venueSaveStatus === 'saving' || !venueDraft.name.trim()}
                                                className="venue-save-btn">
                                                {venueSaveStatus === 'saving' ? (
                                                    <>
                                                        <div className="spinner" style={{width: 14, height: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', borderTopColor: '#fff'}}></div>
                                                        保存中...
                                                    </>
                                                ) : venueSaveStatus === 'success' ? (
                                                    <><Icon d={PATHS.Check} className="w-4 h-4"/>已保存</>
                                                ) : (
                                                    <><Icon d={PATHS.Save} className="w-4 h-4"/>保存场馆规则</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        )}

        {/* 账号管理弹窗 */}
        {showAccountModal && (
            <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 fade-in" onClick={() => setShowAccountModal(false)}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col transform transition-all scale-100 overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="p-4 border-b flex justify-between items-center bg-zinc-50">
                        <span className="font-bold text-slate-700">{accountForm.id ? '编辑账号' : '新增账号'}</span>
                        <button onClick={() => setShowAccountModal(false)} className="text-slate-400 hover:text-slate-600"><Icon d={PATHS.Close} className="w-5 h-5"/></button>
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">用户名 (作为登录账号)</label>
                            <input value={accountForm.username} onChange={e => setAccountForm({...accountForm, username: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200" />
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 mb-1">角色</label>
                                <select value={accountForm.role} onChange={e => setAccountForm({...accountForm, role: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200">
                                    <option value="user">普通用户</option>
                                    <option value="admin">管理员 (admin)</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 mb-1">状态</label>
                                <select value={accountForm.active ? 'true' : 'false'} onChange={e => setAccountForm({...accountForm, active: e.target.value === 'true'})} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200">
                                    <option value="true">激活</option>
                                    <option value="false">禁用</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">OTP 密钥 (Base32, 选填)</label>
                            <input value={accountForm.secret || ''} onChange={e => setAccountForm({...accountForm, secret: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200 font-mono" placeholder="留空则仅用户名明文登录" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">备注</label>
                            <input value={accountForm.note || ''} onChange={e => setAccountForm({...accountForm, note: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200" />
                        </div>
                    </div>
                    <div className="p-4 border-t bg-zinc-50 flex justify-end gap-2">
                        <button onClick={() => setShowAccountModal(false)} className="px-4 py-2 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-200 transition">取消</button>
                        <button onClick={handleSaveAccount} className="px-6 py-2 rounded-lg bg-slate-800 text-white font-bold text-sm hover:bg-slate-900 transition shadow-md">保存</button>
                    </div>
                </div>
            </div>
        )}

        {/* 图片上传弹窗 */}
        {showImageModal && (
           <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 fade-in" onClick={() => setShowImageModal(false)}>
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4 transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center border-b pb-3">
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">上传图片</h3>
                      <button onClick={() => setShowImageModal(false)} className="text-slate-400 hover:text-slate-600"><Icon d={PATHS.Close} className="w-5 h-5"/></button>
                  </div>
                  <div className="flex flex-col gap-3">
                       <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 transition min-h-[120px]" onClick={() => fileInputRef.current?.click()}>
                           {imageForm.preview ? (
                               <img src={imageForm.preview} className="max-h-32 object-contain rounded" />
                           ) : (
                               <div className="text-slate-400 flex flex-col items-center"><Icon d={PATHS.Image} className="w-8 h-8 mb-2"/><span className="text-sm font-bold">点击选择图片</span></div>
                           )}
                           <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={e => {
                               const file = e.target.files[0];
                               if(file) {
                                   const reader = new FileReader();
                                   reader.onload = (ev) => setImageForm({...imageForm, file, preview: ev.target.result});
                                   reader.readAsDataURL(file);
                               }
                           }} />
                       </div>
                       <div><input value={imageForm.title} onChange={e => setImageForm({...imageForm, title: e.target.value})} className="w-full border rounded-xl px-3 py-2 text-sm outline-none" placeholder="图片标题 (可选)"/></div>
                       <div><input value={imageForm.tags} onChange={e => setImageForm({...imageForm, tags: e.target.value})} className="w-full border rounded-xl px-3 py-2 text-sm outline-none" placeholder="标签 (必填，以逗号分隔)"/></div>
                  </div>
                  <button onClick={handleUploadImage} disabled={uploading} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold mt-2">{uploading ? '上传中...' : '开始上传'}</button>
              </div>
          </div>
        )}

        {/* 图片预览及复制快捷按钮模态框 */}
        {viewImage && (
           <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 fade-in" onClick={() => setViewImage(null)}>
               <img src={viewImage.url} className="max-w-full max-h-[70vh] object-contain shadow-2xl rounded-lg" onClick={(e) => e.stopPropagation()} />
               <div className="mt-4 bg-white/10 border border-white/10 backdrop-blur text-white px-6 py-3 rounded-2xl text-sm flex flex-col items-center gap-2 shadow-2xl" onClick={e => e.stopPropagation()}>
                   <span className="font-bold text-blue-200 text-lg">{viewImage.title || '未命名图片'}</span>
                   <div className="flex gap-2">
                       <button onClick={() => { handleCopy(viewImage.title); }} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1">
                           <Icon d={PATHS.Copy} className="w-3 h-3" /> 复制快捷
                       </button>
                   </div>
               </div>
               <button className="absolute top-4 right-4 text-white/50 hover:text-white p-2 rounded-full bg-white/10 transition">
                   <Icon d={PATHS.Close} className="w-6 h-6"/>
               </button>
           </div>
        )}

        {/* 删除确认框 */}
        {showDeleteModal && pendingDelete && (
            <GeneralConfirmModal 
                title="确认删除" 
                message={`确定要永久删除该${pendingDelete.type === 'template' ? '模板' : pendingDelete.type === 'script' ? '话术' : pendingDelete.type === 'image' ? '图片' : '记录'}吗？此操作无法撤销。`} 
                onConfirm={executeDelete} 
                onCancel={() => {setShowDeleteModal(false); setPendingDelete(null);}} 
            />
        )}

        {/* 权限拦截提示框 */}
        {showPermissionModal && (
            <NotificationModal title="权限不足" message="您当前是普通用户，无权执行此修改/删除操作。请联系管理员。" type="error" onClose={() => setShowPermissionModal(false)} />
        )}

        <header className="app-header px-3 py-2 flex justify-between items-center z-20 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <h1 className="app-brand shrink-0">
              <img src="https://lh3.googleusercontent.com/d/1Rri7vVK9YyhQEdqzvgmjQ4kzNZdbQuxV" alt="Logo" className="w-7 h-7 object-contain rounded-lg" onError={(e)=>{e.target.src="https://via.placeholder.com/64?text=Cat"}} />
              <span className="hidden xs:inline">哈基米助手</span>
              <span className="dot-grad hidden md:inline-block" title="在线"></span>
            </h1>
            <div className="tab-pills overflow-x-auto no-scrollbar max-w-[240px] md:max-w-none">
              <button onClick={() => setActiveTab('scripts')} className={`tab-pill pill-scripts ${activeTab === 'scripts' ? 'active' : ''}`}>
                <Icon d={PATHS.Chat} className="w-3 h-3"/> 话术对话
              </button>
              <button onClick={() => setActiveTab('images')} className={`tab-pill pill-images ${activeTab === 'images' ? 'active' : ''}`}>
                <Icon d={PATHS.Image} className="w-3 h-3"/> 图片
              </button>
              <button onClick={() => setActiveTab('notice')} className={`tab-pill pill-notice ${activeTab === 'notice' ? 'active' : ''}`}>
                <Icon d={PATHS.Magic} className="w-3 h-3"/> 公告
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
              {currentUser && (
                <div className={`user-badge hidden md:flex ${userRole === 'admin' ? 'admin' : ''}`}>
                  <div className="user-avatar">
                    <Icon d={userRole === 'admin' ? PATHS.Shield : PATHS.User} className="w-3 h-3"/>
                  </div>
                  <span>{currentUser}</span>
                  {userRole === 'admin' && <span className="ml-1 text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-200 font-bold">管理员</span>}
                </div>
              )}

              {currentUser === 'aratakito' && userRole === 'admin' && (
                  <button onClick={() => { setActiveTab('accounts'); fetchAccounts(); }} className={`tool-btn accent-rose hidden md:inline-flex ${activeTab === 'accounts' ? 'active' : ''}`}>
                      <Icon d={PATHS.User} className="w-3 h-3"/> <span>账号</span>
                  </button>
              )}

              <button onClick={handleDownloadBackup} className="tool-btn accent-sky hidden md:inline-flex"><Icon d={PATHS.Download} className="w-3 h-3"/> <span>数据备份</span></button>
              {userRole === 'admin' && <button onClick={() => setActiveTab('data_management')} className={`tool-btn accent-emerald hidden md:inline-flex ${activeTab === 'data_management' ? 'active' : ''}`}><Icon d={PATHS.Database} className="w-3 h-3"/> <span>数据管理</span></button>}

              <button onClick={openVenueModal} className="tool-btn accent-violet hidden md:inline-flex relative">
                  <Icon d={PATHS.Shield} className="w-3 h-3"/> <span>场馆规则</span>
                  {venueRules.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-violet-500 text-white text-[9px] font-bold rounded-full border-2 border-white flex items-center justify-center">{venueRules.length}</span>
                  )}
              </button>

              <button onClick={() => { setShowTrackerModal(true); setHasUnreadUpdates(false); }} className="tool-btn accent-amber relative">
                  <Icon d={PATHS.Eye} className="w-3 h-3"/> <span>监控</span>
                  {hasUnreadUpdates && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>}
              </button>

              <button onClick={() => setActiveTab('training')} className={`tool-btn hidden md:inline-flex ${activeTab === 'training' ? 'active' : ''}`}><Icon d={PATHS.Brain} className="w-3 h-3"/> <span>更新AI</span></button>
              {userRole === 'admin' && (<button onClick={() => setActiveTab('bets')} className={`tool-btn accent-amber hidden md:inline-flex ${activeTab === 'bets' ? 'active' : ''}`}><Icon d={PATHS.Search} className="w-3 h-3"/> <span>注单</span></button>)}
              {userRole === 'admin' && lastDebugInfo && <button onClick={() => setShowDebugModal(true)} className="btn-icon-only" title="查看调试信息"><Icon d={PATHS.Bug} className="w-5 h-5"/></button>}
              <button onClick={handleLogout} className="btn-icon-only md:hidden"><Icon d={PATHS.Close} className="w-5 h-5"/></button>
              <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-red-500 underline hidden md:block">退出</button>
              <button onClick={fetchData} className="btn-icon-only rounded-full">{loading ? <div className="spinner" style={{width:18, height:18, borderWidth:2}}></div> : <Icon d={PATHS.Refresh} className="w-5 h-5"/>}</button>
          </div>
        </header>
        
         <main className="relative flex-1 overflow-hidden" style={{background:'#f6f8fc'}}>
           
           {/* ===== 账号管理模块 (仅 aratakito) ===== */}
           {activeTab === 'accounts' && currentUser === 'aratakito' && (
               <div className="absolute inset-0 flex flex-col bg-zinc-50 overflow-hidden z-30">
                   <div className="bg-white border-b border-zinc-200 px-4 py-2 flex items-center justify-between shrink-0 shadow-sm">
                       <span className="font-bold text-slate-700 flex items-center gap-2"><Icon d={PATHS.User} className="w-5 h-5 text-pink-500"/> 账号管理</span>
                       <div className="flex gap-2">
                           <button onClick={() => {setAccountForm({ id: null, username: '', role: 'user', secret: '', active: true, note: '' }); setShowAccountModal(true);}} className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-900 transition">新增账号</button>
                           <button onClick={fetchAccounts} className="btn-icon-only"><Icon d={PATHS.Refresh} className={`w-4 h-4 ${loading ? 'animate-spin':''}`}/></button>
                       </div>
                   </div>
                   <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                       <table className="w-full text-left border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
                           <thead className="bg-zinc-50 text-zinc-500 text-xs">
                               <tr>
                                   <th className="p-3 font-bold">用户名 (登录名)</th>
                                   <th className="p-3 font-bold">角色</th>
                                   <th className="p-3 font-bold">状态</th>
                                   <th className="p-3 font-bold">备注/OTP</th>
                                   <th className="p-3 font-bold text-right">操作</th>
                               </tr>
                           </thead>
                           <tbody>
                               {accounts.map(acc => (
                                   <tr key={acc.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                                       <td className="p-3 font-bold text-slate-700">{acc.username || '-'}</td>
                                       <td className="p-3">
                                           <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${acc.role === 'admin' ? 'bg-zinc-100 text-zinc-600' : 'bg-slate-100 text-slate-600'}`}>{acc.role}</span>
                                       </td>
                                       <td className="p-3">
                                           <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${acc.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{acc.active ? '激活' : '禁用'}</span>
                                       </td>
                                       <td className="p-3 text-xs text-slate-500">{acc.note || (acc.secret ? '已绑OTP' : '-')}</td>
                                       <td className="p-3 flex justify-end gap-2">
                                           <button onClick={() => {setAccountForm(acc); setShowAccountModal(true);}} className="text-blue-500 hover:text-blue-700 p-1"><Icon d={PATHS.Edit} className="w-4 h-4"/></button>
                                           <button onClick={() => handleDeleteAccount(acc.id)} className="text-red-400 hover:text-red-600 p-1"><Icon d={PATHS.Trash} className="w-4 h-4"/></button>
                                       </td>
                                   </tr>
                               ))}
                               {accounts.length === 0 && !loading && <tr><td colSpan="5" className="p-4 text-center text-slate-400 text-sm">暂无账号数据</td></tr>}
                           </tbody>
                       </table>
                   </div>
               </div>
           )}

           {/* ===== 公告管理模块 ===== */}
           {activeTab === 'notice' && (
            <div className="absolute inset-0 flex flex-col">
              <div className="tpl-toggle-bar shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold" style={{color:'var(--ink-700)'}}>
                  <span className="dot-grad" style={{width:8,height:8,borderRadius:'50%',background:'var(--brand-grad)'}}></span>
                  {isTemplateMode ? '模板管理' : '智能公告生成'}
                </div>
                <button onClick={() => setIsTemplateMode(!isTemplateMode)} className={`tpl-mode-pill ${isTemplateMode ? 'gen' : 'mng'}`}>
                  <Icon d={isTemplateMode ? PATHS.Magic : PATHS.Edit} className="w-3.5 h-3.5"/>
                  {isTemplateMode ? '返回生成模式' : '进入模板管理'}
                </button>
              </div>
              {!isTemplateMode ? (
                  <div className="w-full h-full flex flex-col md:flex-row p-3 md:p-6 gap-3 md:gap-6 notice-wrap overflow-y-auto md:overflow-hidden">
                      <div className="w-full md:w-1/4 flex flex-col gap-3 shrink-0">
                          <div className={`tpl-select-wrap ${selectedGenTemplateId ? 'is-active' : ''} ${isTemplateDropOpen ? 'is-open' : ''}`}>
                              <div className="tpl-select-icon">
                                <Icon d={PATHS.Magic} className="w-4 h-4"/>
                              </div>
                              <button type="button" onClick={() => setIsTemplateDropOpen(!isTemplateDropOpen)} className="tpl-select-btn">
                                <span className="truncate">{selectedGenTemplateId ? (allTemplates.find(t=>t.id===selectedGenTemplateId) ? `📄 ${allTemplates.find(t=>t.id===selectedGenTemplateId).type}` : '📄 未知模板') : '🤖 AI 自动匹配模板'}</span>
                                <Icon d={PATHS.ChevronDown} className={`w-3.5 h-3.5 tpl-select-chevron ${isTemplateDropOpen ? 'is-open' : ''}`}/>
                              </button>
                              {selectedGenTemplateId && (
                                <button onClick={() => { setSelectedGenTemplateId(''); setViewTemplate(null); }} className="tpl-select-clear" title="清除选择">
                                  <Icon d={PATHS.Close} className="w-3.5 h-3.5"/>
                                </button>
                              )}
                              {isTemplateDropOpen && (<>
                                <div className="fixed inset-0 z-30" onClick={() => setIsTemplateDropOpen(false)}></div>
                                <div className="tpl-dropdown custom-scrollbar">
                                  <button type="button" onClick={() => { setSelectedGenTemplateId(''); setViewTemplate(null); setIsTemplateDropOpen(false); }} className={`tpl-dropdown-item ${!selectedGenTemplateId ? 'is-selected' : ''}`}>
                                    <span className="tpl-dropdown-emoji">🤖</span>
                                    <span className="flex-1 truncate">AI 自动匹配模板</span>
                                    {!selectedGenTemplateId && <Icon d={PATHS.Check} className="w-3.5 h-3.5 tpl-dropdown-check"/>}
                                  </button>
                                  {allTemplates.length > 0 && <div className="tpl-dropdown-divider"></div>}
                                  {allTemplates.map(t => (
                                    <button type="button" key={t.id} onClick={() => { setSelectedGenTemplateId(t.id); setViewTemplate(t); setIsTemplateDropOpen(false); }} className={`tpl-dropdown-item ${selectedGenTemplateId === t.id ? 'is-selected' : ''}`}>
                                      <span className="tpl-dropdown-emoji">📄</span>
                                      <span className="flex-1 truncate">{t.type}</span>
                                      {selectedGenTemplateId === t.id && <Icon d={PATHS.Check} className="w-3.5 h-3.5 tpl-dropdown-check"/>}
                                    </button>
                                  ))}
                                </div>
                              </>)}
                          </div>
                          <div className="panel flex flex-col overflow-hidden min-h-[120px] md:h-2/3">
                              <div className="panel-head" style={{background:'linear-gradient(180deg,#fdf2f8,#fce7f3)'}}><span className="flex items-center gap-2"><Icon d={PATHS.Edit} className="text-pink-500"/> 原始通知</span></div>
                              <textarea className="flex-1 p-3 text-sm outline-none resize-none bg-white placeholder:text-slate-300 min-h-[100px]" placeholder="粘贴运营商通知..." value={rawNotice} onChange={e => setRawNotice(e.target.value)}></textarea>
                          </div>
                          <button onClick={handleGenerateNotice} disabled={noticeLoading} className="rounded-xl shadow-lg text-white font-bold flex flex-row md:flex-col items-center justify-center gap-2 hover:scale-[1.02] transition disabled:opacity-50 py-3 touch-target md:flex-1" style={{background:'linear-gradient(135deg,#8b5cf6 0%,#6366f1 50%,#ec4899 100%)', boxShadow:'0 10px 28px -8px rgba(139, 92, 246, 0.55)'}}>{noticeLoading ? <div className="spinner border-white/30 border-t-white" style={{width:20,height:20}}></div> : <><Icon d={PATHS.Magic} className="w-5 h-5 md:w-8 md:h-8"/> <span>{selectedGenTemplateId ? '按模板生成' : '智能生成公告'}</span></>}</button>
                      </div>
                      <div className="flex-1 flex flex-col gap-3">
                          <div className="flex items-center justify-between px-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 animate-pulse"></span>
                              当前模式: <span className="font-semibold text-indigo-700">{selectedGenTemplateId ? (allTemplates.find(t=>t.id===selectedGenTemplateId)?.type || '手动模式') : (viewTemplate ? `已选模板 [${viewTemplate.type}]` : '🤖 AI 自动匹配模板')}</span>
                            </span>
                            {viewTemplate && <button onClick={() => { setViewTemplate(null); setSelectedGenTemplateId(''); }} className="text-indigo-600 hover:underline">取消选择</button>}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">{[{ k: 'front', t: '前台公告', cls:'notice-card-front', ic:'text-pink-500' }, { k: 'mail', t: '站内信', cls:'notice-card-mail', ic:'text-blue-500' }, { k: 'inner', t: '对内公告', cls:'notice-card-inner', ic:'text-violet-500' }].map(item => (<div key={item.k} className={`panel ${item.cls} flex flex-col overflow-hidden min-h-[150px] ${genResult && genResult[item.k] && genResult[item.k].startsWith('❌') ? 'error-result' : ''}`}><div className="panel-head"><span className="flex items-center gap-2"><Icon d={PATHS.Edit} className={`w-3.5 h-3.5 ${item.ic}`}/>{item.t}</span><button onClick={() => genResult && handleCopy(genResult[item.k])} className="text-indigo-600 hover:text-indigo-800 text-xs px-2 py-1 rounded hover:bg-indigo-50">复制</button></div><textarea className="notice-textarea" value={genResult ? genResult[item.k] : ''} onChange={(e) => setGenResult({...genResult, [item.k]: e.target.value})} placeholder="等待生成..."></textarea></div>))}</div>
                          {genResult && (<div className="panel p-4 flex flex-col gap-3"><div className="text-sm font-bold text-slate-700 flex items-center gap-2"><Icon d={PATHS.Edit} className="text-orange-500"/> 结果评价</div><div className="flex flex-col md:flex-row gap-2"><button onClick={() => handleAnnFeedback('good')} disabled={annSubmitStatus.startsWith('success') || annSubmitStatus === 'sending'} className={`flex-1 py-2 rounded-lg text-xs font-bold text-white transition-all transform ${annSubmitStatus==='success_good' ? 'scale-105' : ''}`} style={{background: annSubmitStatus==='success_good' ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#10b981,#059669)', boxShadow:'0 6px 14px -4px rgba(16,185,129,0.45)'}}>{annSubmitStatus==='success_good' ? '✅ 已学习' : '完美 (Keep)'}</button><div className="flex-1 flex gap-2"><textarea className="flex-1 main-input text-xs resize-none" placeholder="如有问题，请填写修正原因..." value={annCorrectReason} onChange={e => setAnnCorrectReason(e.target.value)}></textarea><button onClick={() => handleAnnFeedback('bad')} disabled={annSubmitStatus.startsWith('success') || annSubmitStatus === 'sending'} className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition-all transform ${annSubmitStatus==='success_bad' ? 'scale-105' : ''}`} style={{background:'linear-gradient(135deg,#f43f5e,#e11d48)', boxShadow:'0 6px 14px -4px rgba(244,63,94,0.45)'}}>{annSubmitStatus==='success_bad' ? '✅ 已学习' : '提交修正'}</button></div></div></div>)}
                      </div>
                  </div>
              ) : (
                  <div className="flex flex-col md:flex-row p-3 md:p-6 gap-3 md:gap-6 flex-1 overflow-hidden notice-wrap">
                        <div className="w-full md:w-1/3 tpl-list-panel min-h-[200px] md:min-h-0">
                          <div className="tpl-list-head">
                            <span className="flex items-center gap-2"><Icon d={PATHS.Brain} className="w-4 h-4"/> 模板库 <span className="badge primary">{allTemplates.length}</span></span>
                            <button onClick={fetchTemplates} className="btn-icon-only" title="刷新"><Icon d={PATHS.Refresh} className={`w-4 h-4 ${templateLoading?'animate-spin':''}`}/></button>
                          </div>
                          <div className="tpl-list-body custom-scrollbar">
                            {allTemplates.length === 0 && (
                              <div className="tpl-empty">
                                <div className="tpl-empty-icon"><Icon d={PATHS.Plus} className="w-6 h-6"/></div>
                                还没有模板，点右侧 <strong>新增</strong> 创建第一个
                              </div>
                            )}
                            {allTemplates.map(t => (
                              <div key={t.id} onClick={() => { setViewTemplate(t); setIsEditingTemplate(false); }} className={`tpl-card ${viewTemplate?.id === t.id ? 'is-active' : ''}`}>
                                <div className="overflow-hidden flex-1">
                                  <div className="tpl-card-title">📄 <span className="truncate">{t.type}</span></div>
                                  <div className="tpl-card-meta truncate">{t.front ? t.front.substring(0, 28)+'...' : '(空)'}</div>
                                </div>
                                <div className="tpl-card-actions">
                                  <button onClick={(e) => { e.stopPropagation(); setTemplateForm(t); setIsEditingTemplate(true); setViewTemplate(t); }} className="tpl-card-action" title="编辑"><Icon d={PATHS.Edit} className="w-3.5 h-3.5"/></button>
                                  {userRole === 'admin' && <button onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(t.id); }} className="tpl-card-action danger" title="删除"><Icon d={PATHS.Trash} className="w-3.5 h-3.5"/></button>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      <div className="tpl-editor">
                        <div className="tpl-editor-head">
                          <div className="tpl-editor-title">
                            <span className="tpl-editor-title-icon"><Icon d={isEditingTemplate ? PATHS.Edit : (viewTemplate ? PATHS.Brain : PATHS.Plus)} className="w-4 h-4"/></span>
                            {isEditingTemplate ? '编辑模板' : (viewTemplate ? '查看模板' : '新增模板')}
                          </div>
                          <div className="flex items-center gap-2">
                            {(isEditingTemplate || viewTemplate) && (
                              <button onClick={() => { setTemplateForm({ id: null, type: '', front: '', inner: '', mail: '' }); setIsEditingTemplate(false); setViewTemplate(null); }} className="btn-secondary" style={{padding:'6px 12px', fontSize:'11px'}}>+ 新建</button>
                            )}
                            {(isEditingTemplate || !viewTemplate) && (
                              <button onClick={handleSaveTemplate} disabled={templateSaveStatus === 'saving'} className={`tpl-save-btn ${templateSaveStatus === 'success' ? 'success' : ''}`}>
                                <Icon d={PATHS.Save} className="w-3.5 h-3.5"/>
                                {templateSaveStatus === 'saving' ? '保存中...' : templateSaveStatus === 'success' ? '已保存' : '保存到云端'}
                              </button>
                            )}
                          </div>
                        </div>
                      <div className="tpl-editor-body custom-scrollbar">
                          {viewTemplate && !isEditingTemplate ? (
                              <div className="flex flex-col gap-4">
                                  <div>
                                    <div className="tpl-field-label">维护类型</div>
                                    <div className="tpl-input" style={{fontWeight:600, color:'var(--ink-900)', cursor:'default'}}>{viewTemplate.type}</div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="tpl-preview-card"><div className="tpl-preview-head front"><Icon d={PATHS.Edit} className="w-3 h-3"/>前台公告</div><div className="tpl-preview-body custom-scrollbar">{viewTemplate.front}</div></div>
                                      <div className="tpl-preview-card"><div className="tpl-preview-head mail"><Icon d={PATHS.Edit} className="w-3 h-3"/>站内信</div><div className="tpl-preview-body custom-scrollbar">{viewTemplate.mail}</div></div>
                                      <div className="tpl-preview-card"><div className="tpl-preview-head inner"><Icon d={PATHS.Edit} className="w-3 h-3"/>对内公告</div><div className="tpl-preview-body custom-scrollbar">{viewTemplate.inner}</div></div>
                                  </div>
                                  <div className="text-center text-xs mt-2" style={{color:'var(--ink-400)'}}>点击左侧列表的 <Icon d={PATHS.Edit} className="w-3 h-3 inline"/> 进入修改模式</div>
                              </div>
                          ) : (
                              <div className="flex flex-col gap-4 h-full">
                                  <div>
                                    <label className="tpl-field-label">维护类型 (Type)</label>
                                    <input value={templateForm.type} onChange={e => setTemplateForm({...templateForm, type: e.target.value})} className="tpl-input" placeholder="例如：全场馆维护" />
                                  </div>
                                  <div className="tpl-var-bar">
                                      <span className="tpl-var-bar-label"><Icon d={PATHS.Sparkles} className="w-3 h-3"/>插入变量</span>
                                      {templateVars.map(v => (
                                          <button key={v} onClick={() => insertTemplateVar(v)} className={`var-chip ${usedVariables.includes(v) ? 'used' : ''}`} title="点击插入">
                                              {v}
                                              {!INITIAL_VARS.includes(v) && ( <span className="delete-btn" onClick={(e) => handleDeleteVar(e, v)} title="删除变量">✕</span> )}
                                          </button>
                                      ))}
                                      <button onClick={openAddCustomVarModal} className="var-chip add" title="新增自定义变量"><Icon d={PATHS.Plus} className="w-3 h-3"/> 新增</button>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">
                                      <div className="tpl-edit-wrap"><label className="tpl-field-label">前台公告 (Front)</label><div className="tpl-edit-wrap-inner front"><HighlightedTextarea inputRef={frontRef} value={templateForm.front} onFocus={() => setLastFocusedTemplateField('front')} onChange={e => setTemplateForm({...templateForm, front: e.target.value})} className="w-full h-full border-0 outline-none transition" placeholder="输入前台模板..."/></div></div>
                                      <div className="tpl-edit-wrap"><label className="tpl-field-label">站内信 (Mail)</label><div className="tpl-edit-wrap-inner mail"><HighlightedTextarea inputRef={mailRef} value={templateForm.mail} onFocus={() => setLastFocusedTemplateField('mail')} onChange={e => setTemplateForm({...templateForm, mail: e.target.value})} className="w-full h-full border-0 outline-none transition" placeholder="输入站内信模板..."/></div></div>
                                      <div className="tpl-edit-wrap"><label className="tpl-field-label">对内公告 (Inner)</label><div className="tpl-edit-wrap-inner inner"><HighlightedTextarea inputRef={innerRef} value={templateForm.inner} onFocus={() => setLastFocusedTemplateField('inner')} onChange={e => setTemplateForm({...templateForm, inner: e.target.value})} className="w-full h-full border-0 outline-none transition" placeholder="输入内部公告模板..."/></div></div>
                                  </div>
                              </div>
                          )}
                      </div></div>
                  </div>
              )}
            </div>
          )}

          {/* ===== 话术/对话模块 (含多智能体) ===== */}
          {activeTab === 'scripts' && (
             <div className="absolute inset-0 flex flex-col md:flex-row">
              <section className="w-full md:w-1/3 md:min-w-[320px] bg-white border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col shadow-lg z-10 shrink-0 h-[40%] md:h-full overflow-hidden">
                  <div className="p-2 md:p-3 border-b border-zinc-100 flex gap-2">
                      <div className="relative w-1/3 max-w-[130px]">
                        <button onClick={() => setIsCategoryOpen(!isCategoryOpen)} className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 pr-7 outline-none text-left truncate flex items-center justify-between relative hover:border-indigo-300 transition">
                          {selectedCategory ? (<span className={`cat-chip cat-c${window.UtilsLib.categoryColor(selectedCategory)}`} style={{padding:'2px 6px', fontSize:'10px'}}>{selectedCategory}</span>) : (<span className="truncate text-slate-600 font-semibold">全部分类</span>)}
                          <div className={`absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}><Icon d={PATHS.ChevronDown} className="w-3 h-3"/></div>
                        </button>
                        {isCategoryOpen && (<>
                          <div className="fixed inset-0 z-20" onClick={() => setIsCategoryOpen(false)}></div>
                          <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl z-30 max-h-60 overflow-y-auto py-1 custom-scrollbar">
                            <div className={`px-3 py-2 text-xs cursor-pointer transition-colors flex items-center gap-2 ${!selectedCategory ? 'font-bold bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`} onClick={() => { setSelectedCategory(''); setIsCategoryOpen(false); }}>
                              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500"></span>全部分类
                            </div>
                            {uniqueCategories.map(c => {
                              const cn = window.UtilsLib.categoryColor(c);
                              return (
                                <div key={c} className={`px-3 py-2 text-xs cursor-pointer truncate transition-colors flex items-center gap-2 ${selectedCategory === c ? 'font-bold bg-slate-50' : 'text-slate-600 hover:bg-slate-50'}`} onClick={() => { setSelectedCategory(c); setIsCategoryOpen(false); }}>
                                  <span className={`cat-chip cat-c${cn}`} style={{padding:'1px 6px', fontSize:'10px'}}>{c}</span>
                                </div>
                              );
                            })}
                          </div>
                        </>)}
                      </div>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-indigo-400"><Icon d={PATHS.Search} /></span>
                        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="搜索话术..." className="main-input pl-9" />
                      </div>
                      <button onClick={openAddScript} className="hidden md:inline-flex btn-primary"><Icon d={PATHS.Plus} className="w-3 h-3"/>新增</button>
                  </div>
                  <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-2 bg-zinc-50/30 relative">
                      {scripts.length === 0 && !loading && (<div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-xs"><Icon d={PATHS.Chat} className="w-8 h-8 mb-2 opacity-50"/>暂无话术数据</div>)}
                      {filteredScripts.map(s => {
                          const catN = window.UtilsLib.categoryColor(s.category);
                          return (
                          <div key={s.id} className={`list-card group cursor-pointer cat-border-c${catN} ${scriptForm.id===s.id ? 'is-active' : ''}`} onClick={() => window.innerWidth < 768 ? handleCopyScript(s.content, s.id) : startEdit(s)}>
                              <div className="flex justify-between items-start mb-1.5">
                                <span className={`cat-chip cat-c${catN}`}>{s.category || '未分类'}</span>
                                <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition">
                                  <button onClick={(e) => { e.stopPropagation(); handleCopyScript(s.content, s.id); }} className={`p-1 ${copiedScriptId === s.id ? 'text-green-600' : 'text-slate-400 hover:text-indigo-600'}`}><Icon d={copiedScriptId === s.id ? PATHS.Check : PATHS.Copy}/></button>
                                  <button onClick={(e) => { e.stopPropagation(); startEdit(s); }} className="p-1 text-slate-400 hover:text-indigo-600"><Icon d={PATHS.Edit}/></button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDelete('script', s); }} className="p-1 text-slate-400 hover:text-red-500"><Icon d={PATHS.Trash}/></button>
                                </div>
                              </div>
                              <div className="text-xs text-slate-400 mb-1 truncate font-mono bg-slate-50 px-1.5 py-0.5 rounded inline-block">Kw: {s.keywords}</div>
                              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words line-clamp-2">{s.content}</div>
                          </div>
                          );
                      })}
                  </div>
              </section>

              <section className="flex-1 p-2 md:p-6 flex flex-col gap-2 md:gap-4 min-h-0 relative" style={{background:'radial-gradient(700px 400px at 100% 0%, rgba(99,102,241,0.05), transparent 60%), radial-gradient(600px 400px at 0% 100%, rgba(236,72,153,0.04), transparent 60%), #f6f8fc'}}>
                  <div className="flex-1 bg-white rounded-xl shadow-sm border border-zinc-200 flex flex-col overflow-hidden relative min-h-[30vh]">
                      <div className="flex-1 p-3 md:p-5 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                          {chatHistory.length === 0 ? (
                               <div className="h-full flex flex-col items-center justify-center fade-in text-slate-400">
                                   <Icon d={PATHS.Bot} className="w-10 h-10 mb-2 opacity-20"/>
                                   <span className="text-sm font-bold text-slate-500">智能对话助手</span>
                                   <span className="text-xs mt-1 text-center max-w-xs">开始对话来获得专业的建议和协助<br/>有任何疑问，尽管提问</span>
                               </div>
                          ) : (
                               chatHistory.map((msg, idx) => (
                                   <ChatMessage 
                                       key={idx} 
                                       msg={msg} 
                                       idx={idx} 
                                       activeMsgIndex={activeMsgIndex}
                                       feedbackState={feedbackState}
                                       correctionText={correctionText}
                                       setCorrectionText={setCorrectionText}
                                       submitCorrectionMsg={submitCorrectionMsg}
                                       setActiveMsgIndex={setActiveMsgIndex}
                                       setFeedbackState={setFeedbackState}
                                       handleLikeMsg={handleLikeMsg}
                                       handleDislikeMsg={handleDislikeMsg}
                                       openSmartOptModal={openSmartOptModal}
                                       handleCopy={handleCopy}
                                   />
                               ))
                          )}
                          
                          {/* 动态加载状态指示器 */}
                          {aiLoading && (
                               <div className="flex justify-start fade-in">
                                   <div className="p-3 rounded-2xl rounded-tl-sm bg-zinc-50 border border-zinc-200 text-slate-500 flex items-center gap-2 text-sm shadow-sm">
                                       <div className={`spinner border-slate-300 ${aiPhase === 'triage' ? 'border-t-purple-600' : 'border-t-blue-600'}`} style={{width:16, height:16, borderWidth:2}}></div>
                                       <span className={aiPhase === 'triage' ? 'text-purple-600 font-bold' : 'text-zinc-700 font-bold'}>
                                           {aiPhase === 'triage' ? '分析中...' : '思考中...'}
                                       </span>
                                   </div>
                               </div>
                          )}
                          <div ref={chatEndRef} />
                      </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-zinc-200 shrink-0 overflow-hidden focus-within:ring-2 ring-blue-100 flex flex-col md:h-auto transition-all">
                      <div className="px-3 py-2 border-b border-slate-50 bg-zinc-50/50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                              <Icon d={PATHS.Bot} className="text-slate-400 w-4 h-4"/>
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">双智能体输入区 (支持多模态粘贴)</span>
                          </div>
                          {chatHistory.length > 0 && (
                              <button onClick={handleClearChat} className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-1 rounded hover:bg-slate-300 transition flex items-center gap-1">
                                  <Icon d={PATHS.Trash} className="w-3 h-3"/> 新话题 (清空历史)
                              </button>
                          )}
                      </div>
                      
                      {pastedImages.length > 0 && (
                          <div className="flex gap-2 p-2 bg-zinc-50/50 border-b border-zinc-100 overflow-x-auto">
                              {pastedImages.map((img, idx) => (
                                  <div key={idx} className="relative w-14 h-14 shrink-0 group">
                                      <img src={img.previewUrl} className="w-full h-full object-cover rounded border border-zinc-200" />
                                      <button onClick={() => setPastedImages(prev => prev.filter((_, i) => i !== idx))} className="absolute -top-1.5 -right-1.5 bg-slate-800 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition shadow">
                                          <Icon d={PATHS.Close} className="w-3 h-3"/>
                                      </button>
                                  </div>
                              ))}
                          </div>
                      )}

                      <textarea 
                          value={customerInput} 
                          onChange={e => setCustomerInput(e.target.value)} 
                          onPaste={handlePaste}
                          onKeyDown={(e) => { if(e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { handleCallAI(); } }} 
                          className="w-full flex-1 p-3 text-sm md:text-base outline-none resize-none text-slate-700 placeholder:text-slate-300 min-h-[60px] md:min-h-[100px] custom-scrollbar" 
                          placeholder="在此粘贴会员消息、注单截图或直接提问 (支持图文)..."
                      ></textarea>
                      
                      <div className="px-3 py-2 border-t border-slate-50 flex justify-end bg-white">
                          <button onClick={handleCallAI} disabled={aiLoading} className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-zinc-900 disabled:opacity-50 transition-all transform active:scale-95 flex items-center gap-2 touch-target w-full md:w-auto justify-center" title="快捷键: Ctrl + Enter">
                              {aiLoading ? '分析中...' : <><Icon d={PATHS.Bot} className="w-4 h-4"/> 发送 <span className="text-[10px] opacity-80 font-normal ml-1">(Ctrl+Enter)</span></>}
                          </button>
                      </div>
                  </div>

                  {/* 恢复原位的话术面板覆盖层 */}
                  {showScriptModal && (
                      <div className="absolute inset-0 z-40 bg-white flex flex-col fade-in shadow-xl">
                          <div className="px-4 py-3 border-b flex justify-between items-center bg-zinc-50">
                              <span className="font-bold text-slate-700 flex items-center gap-2">
                                  <Icon d={PATHS.Edit} className="w-5 h-5 text-zinc-700"/>
                                  {scriptForm.id.startsWith('new_') ? '✨ 新增话术' : '✏️ 编辑话术'}
                              </span>
                              <div className="flex gap-2">
                                  <button onClick={cancelEdit} className="px-3 py-1.5 rounded-lg text-slate-500 font-bold text-sm hover:bg-slate-200 transition">取消</button>
                                  <button onClick={handleSaveScript} disabled={saveStatus === 'saving'} className="px-6 py-1.5 rounded-lg bg-zinc-800 text-white text-sm font-bold shadow-md hover:bg-zinc-900 transition disabled:opacity-50">{saveStatus === 'saving' ? '保存中...' : '保存'}</button>
                              </div>
                          </div>
                          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4 bg-zinc-50">
                              <div className="flex flex-col md:flex-row gap-4">
                                  <div className="flex-1 relative">
                                      <label className="block text-xs font-bold text-slate-500 mb-1">分类 (必填)</label>
                                      <div className="relative">
                                          <input list="category-options" value={scriptForm.category} onChange={e => setScriptForm({...scriptForm, category: e.target.value})} className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200 focus:border-blue-400 bg-white pr-8 transition shadow-sm" placeholder="选择或输入"/>
                                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Icon d={PATHS.ChevronDown} className="w-4 h-4"/></div>
                                      </div>
                                      <datalist id="category-options">{uniqueCategories.map(c => <option key={c} value={c} />)}</datalist>
                                  </div>
                                  <div className="flex-[2]">
                                      <label className="block text-xs font-bold text-slate-500 mb-1">关键字 (用于搜索)</label>
                                      <input value={scriptForm.keywords} onChange={e => setScriptForm({...scriptForm, keywords: e.target.value})} className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200 focus:border-blue-400 bg-white transition shadow-sm" placeholder="多个关键词用空格或逗号隔开"/>
                                  </div>
                              </div>
                              <div className="flex-1 flex flex-col">
                                  <label className="block text-xs font-bold text-slate-500 mb-1">话术内容</label>
                                  <textarea value={scriptForm.content} onChange={e => setScriptForm({...scriptForm, content: e.target.value})} className="flex-1 w-full border border-zinc-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-zinc-200 focus:border-blue-400 bg-white resize-none custom-scrollbar transition shadow-sm" placeholder="输入具体的话术内容..."></textarea>
                              </div>
                          </div>
                      </div>
                  )}
              </section>
            </div>
          )}

          {/* ===== 图片管理库 ===== */}
          {activeTab === 'images' && (
            <section className="absolute inset-0 flex flex-col bg-slate-100">
                <div className="bg-white p-3 md:p-4 border-b border-zinc-200 flex flex-col md:flex-row gap-3 items-center shadow-sm z-10 shrink-0">
                    <div className="relative w-full md:flex-1 md:max-w-xl"><span className="absolute left-3 top-2.5 text-slate-400"><Icon d={PATHS.Search}/></span><input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="搜索图片..." className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none" /></div>
                    <div className="flex w-full md:w-auto items-center gap-2 text-sm justify-between"><button onClick={openAddImage} className="hidden md:block px-3 bg-slate-800 text-white text-xs font-bold rounded-lg py-2">上传图片</button></div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 md:p-4 relative">
                    {images.length === 0 && !loading && (<div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-xs"><Icon d={PATHS.Image} className="w-8 h-8 mb-2 opacity-50"/>暂无图片数据</div>)}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 pb-20 md:pb-0">
                        {filteredImages.map(img => (
                            <div key={img.id} onClick={() => setViewImage(img)} className="group bg-white rounded-xl border border-zinc-200 cursor-pointer shadow-sm active:scale-95 transition-all duration-200 relative overflow-hidden">
                                <div className="aspect-video bg-slate-100 flex items-center justify-center relative overflow-hidden"><img src={img.url} className="w-full h-full object-cover"/><button onClick={(e) => { e.stopPropagation(); handleDelete('image', img); }} className="absolute top-1 right-1 bg-black/50 text-white p-1.5 rounded-full md:opacity-0 group-hover:opacity-100 transition backdrop-blur-sm"><Icon d={PATHS.Trash} className="w-4 h-4"/></button></div>
                                <div className="p-2"><div className="font-bold text-xs truncate text-slate-700">{img.title}</div><div className="text-[10px] text-slate-400 truncate">{img.tags}</div></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
          )}

          {/* ===== 数据管理模块 ===== */}
          {activeTab === 'data_management' && (
              <div className="absolute inset-0 flex flex-col bg-zinc-50 overflow-hidden z-30">
                  <div className="bg-white border-b border-zinc-200 px-4 py-2 flex items-center justify-between shrink-0 shadow-sm">
                      <div className="flex gap-2">
                          <button onClick={() => setDataMgmtTab('chat')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${dataMgmtTab==='chat' ? 'bg-zinc-800 text-white shadow' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>客服训练记录 ({chatLogs.length})</button>
                          <button onClick={() => setDataMgmtTab('ann')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${dataMgmtTab==='ann' ? 'bg-zinc-900 text-white shadow-sm' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>公告训练记录 ({annLogs.length})</button>
                      </div>
                      <div className="flex gap-2">
                          <button onClick={() => setActiveTab('scripts')} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition">关闭</button>
                          <button onClick={fetchTrainingLogs} className="btn-icon-only"><Icon d={PATHS.Refresh} className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/></button>
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 relative">
                      {loading && <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10"><div className="spinner"></div></div>}
                      {((dataMgmtTab === 'chat' && chatLogs.length === 0) || (dataMgmtTab === 'ann' && annLogs.length === 0)) && !loading && (<div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs"><Icon d={PATHS.Database} className="w-8 h-8 mb-2 opacity-50"/>暂无数据记录</div>)}
                      {dataMgmtTab === 'chat' ? (
                          <div className="grid grid-cols-1 gap-3">
                              {chatLogs.map(log => (
                                  <div key={log.id} className={`bg-white p-4 rounded-xl border shadow-sm relative group ${log.type==='good'?'border-l-4 border-l-green-500':'border-l-4 border-l-red-500'}`}>
                                      <div className="flex justify-between items-center mb-2">
                                          <div className="flex items-center gap-2"><span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${log.type==='good'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{log.type.toUpperCase()} CASE</span>{log.user && <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1 font-medium"><Icon d={PATHS.User} className="w-3 h-3"/> {log.user}</span>}</div>
                                          <div className="flex items-center gap-2"><span className="text-[10px] text-slate-400">{log.time}</span><button onClick={() => { setPendingDelete({ type: 'chat_log', id: log.id }); setShowDeleteModal(true); }} className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Icon d={PATHS.Trash} className="w-4 h-4"/></button></div>
                                      </div>
                                      <div className="space-y-2 text-sm"><div><span className="text-xs font-bold text-slate-400">Q:</span> {log.question}</div><div><span className="text-xs font-bold text-blue-400">A:</span> {log.answer}</div>{log.correction && <div className="bg-red-50 p-2 rounded text-red-800 text-xs mt-2"><span className="font-bold">修正:</span> {log.correction}</div>}</div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="grid grid-cols-1 gap-3">
                              {annLogs.map(log => (
                                  <div key={log.id} className={`bg-white p-4 rounded-xl border shadow-sm relative group ${log.type==='good'?'border-l-4 border-l-green-500':'border-l-4 border-l-red-500'}`}>
                                     <div className="flex justify-between items-center mb-2">
                                          <div className="flex items-center gap-2"><span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${log.type==='good'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{log.type.toUpperCase()} CASE</span>{log.user && <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1 font-medium"><Icon d={PATHS.User} className="w-3 h-3"/> {log.user}</span>}</div>
                                          <div className="flex items-center gap-2"><span className="text-[10px] text-slate-400">{log.time}</span><button onClick={() => { setPendingDelete({ type: 'ann_log', id: log.id }); setShowDeleteModal(true); }} className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Icon d={PATHS.Trash} className="w-4 h-4"/></button></div>
                                      </div>
                                      <div className="space-y-2 text-sm"><div className="text-xs text-slate-500 bg-zinc-50 p-2 rounded truncate">原始: {log.raw}</div>{log.type === 'good' ? (<div className="text-xs text-green-700">✅ 生成结果已采纳</div>) : (<><div className="text-xs text-red-600">❌ 错误生成: {log.wrong_front?.substring(0,50)}...</div><div className="bg-red-50 p-2 rounded text-red-800 text-xs mt-1"><span className="font-bold">否决原因:</span> {log.reason}</div></>)}</div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          )}
          
          {/* ===== 配置设定/AI训练 ===== */}
          {activeTab === 'training' && (
            <div className="absolute inset-0 flex flex-col bg-slate-100 overflow-hidden z-30">
              <div className="bg-white border-b border-zinc-200 px-4 py-2 flex items-center shrink-0 shadow-sm z-10"><button onClick={() => setActiveTab('scripts')} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-bold"><Icon d={PATHS.ArrowLeft} className="w-4 h-4"/> 返回主页</button></div>
              <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden min-h-0">
                  <div className="flex-1 bg-white rounded-xl shadow-sm border border-zinc-200 flex flex-col overflow-hidden">
                      <div className="p-3 border-b bg-zinc-50 font-semibold text-zinc-700 text-xs flex justify-between items-center"><span className="flex items-center gap-2"><Icon d={PATHS.Brain}/> 公告生成 AI 设定</span> <div className="flex gap-2"><button onClick={handleResetToDefault} className="bg-zinc-100 text-zinc-500 px-3 py-1 rounded text-[10px] font-bold hover:bg-slate-200 transition">🔄 重置推荐</button></div></div>
                      <div className="flex-1 flex flex-col p-3 overflow-y-auto gap-3">
                           <div><div className="prompt-label">基础人设 (Base Persona - Fixed)</div><textarea className="prompt-editor" style={{minHeight: '200px'}} value={annBase} onChange={e => setAnnBase(e.target.value)} placeholder="输入公告助手的基础设定..."></textarea></div>
                           <div className="flex-1 flex flex-col"><div className="prompt-label"><span>智能知识库 (Learned Rules - Dynamic)</span> <button onClick={handleTrainAnnouncement} disabled={isAnnTrainingLoading} className="text-purple-600 text-[10px] hover:underline flex items-center gap-1">{isAnnTrainingLoading ? 'AI思考中...' : '🔄 提取训练'}</button></div><textarea className={`prompt-editor flex-1 ${isAnnTrainingLoading ? 'loading' : ''}`} value={annKnowledge} onChange={e => setAnnKnowledge(e.target.value)} placeholder="点击上方“提取训练”按钮，AI将自动从纠错记录中总结规则..." readOnly={isAnnTrainingLoading}></textarea></div>
                      </div>
                      <div className="p-3 border-t"><button onClick={() => handleSaveCloudPrompts('ann')} disabled={isAnnTrainingLoading} className="w-full bg-zinc-800 text-white py-2 rounded font-medium text-xs hover:bg-zinc-900 disabled:opacity-50 flex items-center justify-center gap-2"><Icon d={PATHS.Save} className="w-4 h-4"/> 保存公告设定到云端</button></div>
                  </div>
                  <div className="flex-1 bg-white rounded-xl shadow-sm border border-zinc-200 flex flex-col overflow-hidden">
                      <div className="p-3 border-b bg-zinc-50 font-bold text-blue-700 text-xs flex justify-between items-center"><span className="flex items-center gap-2"><Icon d={PATHS.Chat}/> 客服回复 AI 设定</span></div>
                      <div className="flex-1 flex flex-col p-3 overflow-y-auto gap-3">
                           <div><div className="prompt-label">基础人设 (Base Persona - Fixed)</div><textarea className="prompt-editor" style={{minHeight: '200px'}} value={chatBase} onChange={e => setChatBase(e.target.value)} placeholder="输入客服专家的基础设定..."></textarea></div>
                           <div>
                              <div className="prompt-label"><span>智能知识库 (Learned Rules - Dynamic)</span> <button onClick={handleTrainChat} disabled={isChatTrainingLoading} className="text-zinc-700 text-[10px] hover:underline flex items-center gap-1">{isChatTrainingLoading ? 'AI思考中...' : '🔄 提取训练'}</button></div>
                              <textarea className={`prompt-editor ${isChatTrainingLoading ? 'loading' : ''}`} style={{minHeight: '120px'}} value={chatKnowledge} onChange={e => setChatKnowledge(e.target.value)} placeholder="点击上方“提取训练”按钮，AI将自动从纠错记录中总结规则..." readOnly={isChatTrainingLoading}></textarea>
                           </div>
                           
                           <div className="flex-1 flex flex-col mt-3 pt-3 border-t border-zinc-100">
                              <div className="prompt-label text-red-600">
                                  <span>⚖️ 业务硬性逻辑 (Business Hard Rules)</span> 
                                  <span className="text-[10px] font-normal ml-2 text-slate-400">含公告模板、计算公式、风控底线</span>
                              </div>
                              <textarea 
                                  className="prompt-editor flex-1 border-red-200 focus:border-red-400 bg-red-50/10" 
                                  style={{minHeight: '250px'}}
                                  value={businessRules} 
                                  onChange={e => setBusinessRules(e.target.value)} 
                                  placeholder="在此定义绝对不可违背的业务规则、话术模板..."
                              ></textarea>
                           </div>
                      </div>
                      <div className="p-3 border-t"><button onClick={() => handleSaveCloudPrompts('chat')} disabled={isChatTrainingLoading} className="w-full bg-zinc-800 text-white py-2 rounded font-bold text-xs hover:bg-zinc-900 disabled:opacity-50 flex items-center justify-center gap-2"><Icon d={PATHS.Save} className="w-4 h-4"/> 保存客服设定到云端</button></div>
                  </div>
              </div>
            </div>
          )}

          {/* ===== 业务后台注单查询模块 (BetQuery) ===== */}
          {activeTab === 'bets' && userRole === 'admin' && (
              <BetQuery />
          )}
         </main>
         <StatusBar usage={lastUsage} />
      </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ErrorBoundary><App /></ErrorBoundary>);

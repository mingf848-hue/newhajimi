// ==========================================
// Gemini API 工具函数
// ==========================================

const convertOpenAIToGemini = (messages) => {
    let systemInstruction = undefined;
    const contents = [];
    messages.forEach(msg => {
        if (msg.role === 'system') {
            if (!systemInstruction) systemInstruction = { parts: [] };
            systemInstruction.parts.push({ text: msg.content });
        } else {
            let parts = [];
            if (Array.isArray(msg.content)) {
                parts = msg.content;
            } else {
                parts = [{ text: msg.content }];
            }
            contents.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: parts
            });
        }
    });
    return { systemInstruction, contents };
};

const callGeminiStream = async (messages, temp = 0.4, onChunk, mode = MODE_FAST, maxOutputTokens) => {
    try {
        const { systemInstruction, contents } = convertOpenAIToGemini(messages);
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: { systemInstruction, contents },
                mode: mode,
                temperature: temp,
                stream: true,
                ...(maxOutputTokens ? { maxOutputTokens } : {})
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            return { error: `Server Error: ${response.status} - ${errText}` };
        }

        const cacheAction = response.headers.get('X-Cache-Action') || 'unknown';
        const cacheModel = response.headers.get('X-Cache-Model') || '';
        const thinkingLevel = response.headers.get('X-Cache-Thinking') || '';

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        let buffer = '';
        let finalUsage = null;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;

                let json = null;
                if (trimmedLine.startsWith('data:')) {
                    try {
                        const jsonStr = trimmedLine.substring(5).trim();
                        if (jsonStr) json = JSON.parse(jsonStr);
                    } catch (e) {}
                } else if (trimmedLine.startsWith('{') || trimmedLine.startsWith('[')) {
                    try {
                        const cleanJson = trimmedLine.startsWith(',') ? trimmedLine.substring(1) : trimmedLine;
                        json = JSON.parse(cleanJson);
                    } catch (e) {}
                }

                if (json) {
                    const items = Array.isArray(json) ? json : [json];
                    for (const item of items) {
                        const text = item.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (text) {
                            fullText += text;
                            if (onChunk) onChunk(text, fullText);
                        }
                        if (item.usageMetadata) {
                            finalUsage = item.usageMetadata;
                        }
                    }
                }
            }
        }
        return { success: true, data: fullText, usage: finalUsage, cacheAction, cacheModel, thinkingLevel };
    } catch (e) { return { error: "连接异常: " + e.message }; }
};

const callGeminiJSON = async (messages, temp = 0.3, mode = MODE_FAST) => {
    try {
        const { systemInstruction, contents } = convertOpenAIToGemini(messages);
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: { systemInstruction, contents },
                mode: mode,
                temperature: temp,
                stream: false,
                responseMimeType: "application/json"
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            return { error: `Server Error: ${response.status} - ${errText}` };
        }

        const cacheAction = response.headers.get('X-Cache-Action') || 'unknown';
        const cacheModel = response.headers.get('X-Cache-Model') || '';
        const thinkingLevel = response.headers.get('X-Cache-Thinking') || '';

        const data = await response.json();
        let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error("Empty response from backend");

        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            rawText = jsonMatch[0];
        } else {
            rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        }

        return { success: true, data: JSON.parse(rawText), usage: data.usageMetadata, cacheAction, cacheModel, thinkingLevel };
    } catch (e) { return { error: "JSON解析失败: " + e.message }; }
};

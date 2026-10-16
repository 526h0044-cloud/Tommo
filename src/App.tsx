import React, { useState, useRef, useEffect } from 'react';
import { Sidebar, ChatSession } from './components/Sidebar.tsx';
import { TopNav, TommoModelType } from './components/TopNav.tsx';
import { Hero } from './components/Hero.tsx';
import { ChatMessage } from './components/ChatMessage.tsx';
import { InputBar } from './components/InputBar.tsx';
import { SecurityGuardrailModal } from './components/SecurityGuardrailModal.tsx';
import { SystemInstructionModal } from './components/SystemInstructionModal.tsx';
import { ApiKeyModal } from './components/ApiKeyModal.tsx';
import { DomainMode, TommoMessage } from './types/tommo.ts';
import { generateTommoApiKey, validateTommoApiKey } from './utils/tommoApiKey.ts';

const STORAGE_KEY_SESSIONS = 'tommo_real_sessions_v3';
const STORAGE_KEY_MESSAGES = 'tommo_real_messages_v3';
const STORAGE_KEY_FLUFF = 'tommo_real_fluff_v3';
const STORAGE_KEY_API_KEY = 'tommo_api_key_v1';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState<TommoModelType>('tommo-ultra');
  const [isWebSearchActive, setIsWebSearchActive] = useState<boolean>(true);
  const [currentDomain, setCurrentDomain] = useState<DomainMode>('architecture');
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isSystemInstructionOpen, setIsSystemInstructionOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Active Tommo API Key (tmm-xxxxxxxxxxxxxxxxxxxx)
  const [tommoApiKey, setTommoApiKey] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_API_KEY);
      if (saved && validateTommoApiKey(saved)) return saved;
    } catch {}
    const initialKey = generateTommoApiKey();
    try {
      localStorage.setItem(STORAGE_KEY_API_KEY, initialKey);
    } catch {}
    return initialKey;
  });

  // Load real sessions from localStorage
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'session-main',
        title: 'Cuộc trò chuyện mới',
        timestamp: 'Vừa xong',
        domain: 'architecture',
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || 'session-main';
  });

  // Load real messages from localStorage
  const [messagesBySession, setMessagesBySession] = useState<Record<string, TommoMessage[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      'session-main': [],
    };
  });

  // Real Fluff tokens saved counter
  const [totalFluffSaved, setTotalFluffSaved] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FLUFF);
      if (saved) return parseInt(saved, 10);
    } catch {}
    return 0;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messagesBySession));
      localStorage.setItem(STORAGE_KEY_FLUFF, totalFluffSaved.toString());
      localStorage.setItem(STORAGE_KEY_API_KEY, tommoApiKey);
    } catch {}
  }, [sessions, messagesBySession, totalFluffSaved, tommoApiKey]);

  const activeMessages = messagesBySession[activeSessionId] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUpdateApiKey = (newKey: string) => {
    setTommoApiKey(newKey);
    try {
      localStorage.setItem(STORAGE_KEY_API_KEY, newKey);
    } catch {}
  };

  const handleSendMessage = async (customPrompt?: string, domainOverride?: DomainMode) => {
    const promptToSend = (customPrompt !== undefined ? customPrompt : inputValue).trim();
    if (!promptToSend || isProcessing) return;

    setApiError(null);
    const domain = domainOverride || currentDomain;
    const userMsgId = 'user-' + Date.now();
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMsg: TommoMessage = {
      id: userMsgId,
      role: 'user',
      content: promptToSend,
      timestamp: nowStr,
      domain,
    };

    // Update session title dynamically with first prompt
    setSessions(prev =>
      prev.map(s => {
        if (s.id === activeSessionId && (s.title === 'Cuộc trò chuyện mới' || !s.title)) {
          return {
            ...s,
            title: promptToSend.slice(0, 36) + (promptToSend.length > 36 ? '...' : ''),
            domain,
          };
        }
        return s;
      })
    );

    // Append user message immediately
    const updatedMessages = [...activeMessages, newUserMsg];
    setMessagesBySession(prev => ({
      ...prev,
      [activeSessionId]: updatedMessages,
    }));

    setInputValue('');
    setIsProcessing(true);

    try {
      // Call REAL server API with Tommo API Key header
      const response = await fetch('/api/tommo/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tommo-api-key': tommoApiKey,
        },
        body: JSON.stringify({
          prompt: promptToSend,
          domain,
          apiKey: tommoApiKey,
          model: selectedModel,
          webSearch: isWebSearchActive,
          processorMode: selectedModel === 'tommo-ultra' ? 'ultra_turbo' : 'quantum_deep',
          history: activeMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Máy chủ AI phản hồi mã lỗi ${response.status}`);
      }

      const data = await response.json();
      if (data && data.success) {
        const tommoMsg: TommoMessage = {
          id: 'tommo-' + Date.now(),
          role: 'tommo',
          content: data.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          domain,
          cognitiveStages: data.stages,
          tokenMetrics: data.metrics,
          deliverable: data.deliverable,
          securityResult: data.securityResult,
          webGrounding: data.webGrounding,
          processorMode: data.processorMode || (selectedModel === 'tommo-ultra' ? 'ultra_turbo' : 'quantum_deep'),
        };

        if (data.metrics?.fluffTokensSaved) {
          setTotalFluffSaved(prev => prev + data.metrics.fluffTokensSaved);
        }

        setMessagesBySession(prev => ({
          ...prev,
          [activeSessionId]: [...(prev[activeSessionId] || []), tommoMsg],
        }));
      } else {
        throw new Error(data?.error || 'Phản hồi không hợp lệ từ máy chủ AI.');
      }
    } catch (err: any) {
      console.error('Lỗi gọi Tommo Super Engine:', err);
      setApiError(err?.message || 'Đã xảy ra sự cố khi gọi Tommo Super Engine.');
    } finally {
      setIsProcessing(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleNewChat = () => {
    const newId = 'session-' + Date.now();
    const newSession: ChatSession = {
      id: newId,
      title: 'Cuộc trò chuyện mới',
      timestamp: 'Vừa xong',
      domain: currentDomain,
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setMessagesBySession(prev => ({
      ...prev,
      [newId]: [],
    }));
    setInputValue('');
    setApiError(null);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    setMessagesBySession(prev => {
      const copy = { ...prev };
      delete copy[sessionId];
      return copy;
    });

    if (activeSessionId === sessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId);
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  const isThreadEmpty = activeMessages.length === 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#131314] text-slate-100 font-sans antialiased">
      {/* Tommo Left Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(prev => !prev)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={id => {
          setActiveSessionId(id);
          setApiError(null);
        }}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        onOpenSystemInstruction={() => setIsSystemInstructionOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        totalFluffSaved={totalFluffSaved}
      />

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Top Navigation Bar */}
        <TopNav
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
          onOpenSystemInstruction={() => setIsSystemInstructionOpen(true)}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          activeApiKey={tommoApiKey}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          isWebSearchActive={isWebSearchActive}
          onToggleWebSearch={() => setIsWebSearchActive(prev => !prev)}
        />

        {/* Central Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative">
          {apiError && (
            <div className="max-w-2xl mx-auto my-3 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center justify-between">
              <span>{apiError}</span>
              <button
                onClick={() => setApiError(null)}
                className="px-2 py-0.5 rounded bg-red-900 text-white font-medium ml-3 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          )}

          {isThreadEmpty ? (
            /* Hero Empty State (Where should we start?) */
            <Hero
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSubmit={() => handleSendMessage()}
              domain={currentDomain}
              onSelectDomain={setCurrentDomain}
              onSelectSuggestion={(prompt, d) => {
                setCurrentDomain(d);
                handleSendMessage(prompt, d);
              }}
              isProcessing={isProcessing}
              isWebSearchActive={isWebSearchActive}
              onToggleWebSearch={() => setIsWebSearchActive(prev => !prev)}
              processorMode={selectedModel === 'tommo-ultra' ? 'ultra_turbo' : 'quantum_deep'}
              onToggleProcessorMode={() => setSelectedModel(m => m === 'tommo-ultra' ? 'tommo-quantum' : 'tommo-ultra')}
            />
          ) : (
            /* Active Live Chat Thread */
            <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 pb-36">
              {activeMessages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {isProcessing && (
                <div className="flex gap-4 my-6 text-slate-200 max-w-4xl mx-auto animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-500 flex items-center justify-center shrink-0 text-white animate-spin shadow-md">
                    <span className="text-xs font-bold font-mono">✦</span>
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-slate-300 font-sans">
                    <span className="font-medium text-slate-200">Tommo 2.0 đang thực thi qua Quantum Super Engine...</span>
                    <span className="text-xs text-cyan-400 font-mono">
                      {isWebSearchActive ? '⚡ Đang truy vấn mạng đa chiều & mô phỏng ma trận logic 5 tầng' : '⚡ Đang chạy bộ xử lý siêu tốc & tối ưu mật độ token'}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Floating Input Bar when conversation is active */}
        {!isThreadEmpty && (
          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-[#131314] via-[#131314]/90 to-transparent pointer-events-none">
            <div className="max-w-4xl mx-auto pointer-events-auto">
              <InputBar
                value={inputValue}
                onChange={setInputValue}
                onSubmit={() => handleSendMessage()}
                domain={currentDomain}
                onSelectDomain={setCurrentDomain}
                disabled={isProcessing}
                isProcessing={isProcessing}
                placeholder="Hỏi Tommo..."
                isWebSearchActive={isWebSearchActive}
                onToggleWebSearch={() => setIsWebSearchActive(prev => !prev)}
                processorMode={selectedModel === 'tommo-ultra' ? 'ultra_turbo' : 'quantum_deep'}
                onToggleProcessorMode={() => setSelectedModel(m => m === 'tommo-ultra' ? 'tommo-quantum' : 'tommo-ultra')}
              />
              <p className="text-center text-[11px] text-slate-500 mt-2 font-sans">
                Tommo 2.0 Quantum AI • Bộ xử lý Siêu Tốc • Tư duy Ma trận Đa chiều • Tra cứu Mạng Thời gian thực • Zero-Fluff
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Security Guardrail Protocol Modal */}
      <SecurityGuardrailModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        onRunTestPrompt={prompt => {
          handleSendMessage(prompt, 'security');
        }}
      />

      {/* System Instruction Architecture Modal */}
      <SystemInstructionModal
        isOpen={isSystemInstructionOpen}
        onClose={() => setIsSystemInstructionOpen(false)}
      />

      {/* Tommo API Key Manager Modal (tmm-xxxxxxxxxxxxxxxxxxxx) */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={tommoApiKey}
        onUpdateApiKey={handleUpdateApiKey}
      />
    </div>
  );
}

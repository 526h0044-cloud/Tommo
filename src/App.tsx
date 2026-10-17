import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { TopNav, TommoModelType } from './components/TopNav.tsx';
import { Hero } from './components/Hero.tsx';
import { ChatMessage } from './components/ChatMessage.tsx';
import { InputBar } from './components/InputBar.tsx';
import { SystemInstructionModal } from './components/SystemInstructionModal.tsx';
import { AccountModal } from './components/AccountModal.tsx';
import { DomainMode, TommoMessage, ChatSession } from './types/tommo.ts';
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
  type FirebaseUser,
} from './firebase.ts';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  setDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';

const STORAGE_KEY_SESSIONS = 'tommo_real_sessions_v5';
const STORAGE_KEY_MESSAGES = 'tommo_real_messages_v5';
const STORAGE_KEY_FLUFF = 'tommo_real_fluff_v5';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState<TommoModelType>('tommo-ultra');
  const [currentDomain, setCurrentDomain] = useState<DomainMode>('architecture');
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSystemInstructionOpen, setIsSystemInstructionOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Real Firebase User State (Live Google Auth)
  const [user, setUser] = useState<FirebaseUser | null>(null);

  // Sessions state (supports LocalStorage fallback + Cloud Firestore sync)
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
        pinned: false,
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || 'session-main';
  });

  // Messages state
  const [messagesBySession, setMessagesBySession] = useState<Record<string, TommoMessage[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      'session-main': [],
    };
  });

  // Fluff tokens saved counter
  const [totalFluffSaved, setTotalFluffSaved] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FLUFF);
      if (saved) return parseInt(saved, 10);
    } catch {}
    return 0;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Listen for Real Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await setDoc(
            userDocRef,
            {
              id: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              photoURL: currentUser.photoURL || '',
              role: 'pro',
              plan: 'Tommo Pro',
              lastLoginAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Listen for Real Firestore Sessions when authenticated
  useEffect(() => {
    if (!user) return;

    const path = `users/${user.uid}/sessions`;
    try {
      const sessionsRef = collection(db, 'users', user.uid, 'sessions');
      const q = query(sessionsRef, orderBy('updatedAt', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        snapshot => {
          const firestoreSessions: ChatSession[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            firestoreSessions.push({
              id: docSnap.id,
              title: data.title || 'Cuộc trò chuyện mới',
              timestamp: data.updatedAt
                ? new Date(data.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Vừa xong',
              domain: data.domain || 'architecture',
              pinned: Boolean(data.pinned),
            });
          });

          if (firestoreSessions.length > 0) {
            setSessions(firestoreSessions);
            if (!firestoreSessions.some(s => s.id === activeSessionId)) {
              setActiveSessionId(firestoreSessions[0].id);
            }
          }
        },
        error => {
          handleFirestoreError(error, OperationType.LIST, path);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }, [user]);

  // 3. Listen for Real Firestore Messages for active session
  useEffect(() => {
    if (!user || !activeSessionId) return;

    const path = `users/${user.uid}/sessions/${activeSessionId}/messages`;
    try {
      const messagesRef = collection(db, 'users', user.uid, 'sessions', activeSessionId, 'messages');
      const q = query(messagesRef, orderBy('timestampRaw', 'asc'));

      const unsubscribe = onSnapshot(
        q,
        snapshot => {
          const firestoreMsgs: TommoMessage[] = [];
          snapshot.forEach(docSnap => {
            firestoreMsgs.push(docSnap.data() as TommoMessage);
          });

          if (firestoreMsgs.length > 0) {
            setMessagesBySession(prev => ({
              ...prev,
              [activeSessionId]: firestoreMsgs,
            }));
          }
        },
        error => {
          handleFirestoreError(error, OperationType.LIST, path);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }, [user, activeSessionId]);

  // Sync state to localStorage for offline / guest resilience
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messagesBySession));
      localStorage.setItem(STORAGE_KEY_FLUFF, totalFluffSaved.toString());
    } catch {}
  }, [sessions, messagesBySession, totalFluffSaved]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+O or Cmd+Shift+O -> New chat
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'O' || e.key === 'o')) {
        e.preventDefault();
        handleNewChat();
      }
      // Esc -> Close modals
      if (e.key === 'Escape') {
        setIsSystemInstructionOpen(false);
        setIsAccountModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const activeMessages = messagesBySession[activeSessionId] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Toggle Pin on Session
  const handleTogglePinSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const sessionToToggle = sessions.find(s => s.id === sessionId);
    const newPinned = !sessionToToggle?.pinned;

    setSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, pinned: newPinned } : s))
    );

    if (user) {
      try {
        await setDoc(
          doc(db, 'users', user.uid, 'sessions', sessionId),
          { pinned: newPinned, updatedAt: new Date().toISOString() },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/sessions/${sessionId}`);
      }
    }
  };

  // Rename Session
  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    setSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, title: newTitle } : s))
    );

    if (user) {
      try {
        await setDoc(
          doc(db, 'users', user.uid, 'sessions', sessionId),
          { title: newTitle, updatedAt: new Date().toISOString() },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/sessions/${sessionId}`);
      }
    }
  };

  // Export Chat to Markdown
  const handleExportMarkdown = () => {
    const session = sessions.find(s => s.id === activeSessionId);
    const title = session?.title || 'Tommo_1.0_Chat';
    let md = `# ${title}\n*Thời gian: ${new Date().toLocaleString('vi-VN')}*\n*Động cơ: Tommo 1.0 Super Engine*\n\n---\n\n`;

    activeMessages.forEach((msg, idx) => {
      const sender = msg.role === 'user' ? '👤 Người dùng' : '🤖 Tommo 1.0';
      md += `### ${sender} (${msg.timestamp})\n\n${msg.content}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, '_')}_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export Chat to JSON
  const handleExportJson = () => {
    const session = sessions.find(s => s.id === activeSessionId);
    const title = session?.title || 'Tommo_1.0_Chat';
    const exportData = {
      app: 'Tommo 1.0 Autonomous Super AI Engine',
      sessionId: activeSessionId,
      sessionTitle: title,
      exportedAt: new Date().toISOString(),
      messages: activeMessages,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, '_')}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

    const sessionTitle = promptToSend.slice(0, 36) + (promptToSend.length > 36 ? '...' : '');

    // Update session title locally
    setSessions(prev =>
      prev.map(s => {
        if (s.id === activeSessionId && (s.title === 'Cuộc trò chuyện mới' || !s.title)) {
          return {
            ...s,
            title: sessionTitle,
            domain,
          };
        }
        return s;
      })
    );

    // Append user message locally
    const updatedMessages = [...activeMessages, newUserMsg];
    setMessagesBySession(prev => ({
      ...prev,
      [activeSessionId]: updatedMessages,
    }));

    // If authenticated, persist to Firestore
    if (user) {
      try {
        const sessionDocRef = doc(db, 'users', user.uid, 'sessions', activeSessionId);
        await setDoc(
          sessionDocRef,
          {
            id: activeSessionId,
            userId: user.uid,
            title:
              activeMessages.length === 0
                ? sessionTitle
                : sessions.find(s => s.id === activeSessionId)?.title || sessionTitle,
            domain,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        const msgDocRef = doc(db, 'users', user.uid, 'sessions', activeSessionId, 'messages', userMsgId);
        await setDoc(msgDocRef, {
          ...newUserMsg,
          sessionId: activeSessionId,
          userId: user.uid,
          timestampRaw: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.WRITE,
          `users/${user.uid}/sessions/${activeSessionId}/messages/${userMsgId}`
        );
      }
    }

    setInputValue('');
    setIsProcessing(true);

    try {
      // Call server API with webSearch ALWAYS active
      const response = await fetch('/api/tommo/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptToSend,
          domain,
          model: selectedModel,
          webSearch: true, // Always active
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

        // If authenticated, persist response to Firestore
        if (user) {
          try {
            const botMsgRef = doc(db, 'users', user.uid, 'sessions', activeSessionId, 'messages', tommoMsg.id);
            await setDoc(botMsgRef, {
              ...tommoMsg,
              sessionId: activeSessionId,
              userId: user.uid,
              timestampRaw: new Date().toISOString(),
            });

            // Update user total fluff saved
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(
              userDocRef,
              {
                totalFluffSaved: totalFluffSaved + (data.metrics?.fluffTokensSaved || 0),
              },
              { merge: true }
            );
          } catch (err) {
            handleFirestoreError(
              err,
              OperationType.WRITE,
              `users/${user.uid}/sessions/${activeSessionId}/messages/${tommoMsg.id}`
            );
          }
        }
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

  const handleNewChat = async () => {
    const newId = 'session-' + Date.now();
    const newSession: ChatSession = {
      id: newId,
      title: 'Cuộc trò chuyện mới',
      timestamp: 'Vừa xong',
      domain: currentDomain,
      pinned: false,
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setMessagesBySession(prev => ({
      ...prev,
      [newId]: [],
    }));
    setInputValue('');
    setApiError(null);

    if (user) {
      try {
        const sessionRef = doc(db, 'users', user.uid, 'sessions', newId);
        await setDoc(sessionRef, {
          id: newId,
          userId: user.uid,
          title: 'Cuộc trò chuyện mới',
          domain: currentDomain,
          pinned: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/sessions/${newId}`);
      }
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    setMessagesBySession(prev => {
      const copy = { ...prev };
      delete copy[sessionId];
      return copy;
    });

    if (user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'sessions', sessionId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/sessions/${sessionId}`);
      }
    }

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
        onTogglePinSession={handleTogglePinSession}
        onRenameSession={handleRenameSession}
        onOpenSystemInstruction={() => setIsSystemInstructionOpen(true)}
        totalFluffSaved={totalFluffSaved}
        user={user}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
      />

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Top Navigation Bar with Tommo 1.0, Export and Real Google User Profile */}
        <TopNav
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          onOpenSystemInstruction={() => setIsSystemInstructionOpen(true)}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          user={user}
          onOpenAccountModal={() => setIsAccountModalOpen(true)}
          onExportMarkdown={handleExportMarkdown}
          onExportJson={handleExportJson}
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
            /* Hero Empty State */
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
              processorMode={selectedModel === 'tommo-ultra' ? 'ultra_turbo' : 'quantum_deep'}
              onToggleProcessorMode={() =>
                setSelectedModel(m => (m === 'tommo-ultra' ? 'tommo-quantum' : 'tommo-ultra'))
              }
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
                    <span className="font-medium text-slate-200">Tommo 1.0 đang xử lý qua Super Engine...</span>
                    <span className="text-xs text-cyan-400 font-mono">
                      ⚡ Đang tự động đối chiếu ma trận tri thức đa chiều & tối ưu mật độ token
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
                placeholder="Hỏi Tommo 1.0..."
                processorMode={selectedModel === 'tommo-ultra' ? 'ultra_turbo' : 'quantum_deep'}
                onToggleProcessorMode={() =>
                  setSelectedModel(m => (m === 'tommo-ultra' ? 'tommo-quantum' : 'tommo-ultra'))
                }
              />
              <p className="text-center text-[11px] text-slate-500 mt-2 font-sans">
                Tommo 1.0 Super Engine • Tác giả Gia Bảo • Tra cứu Tri thức Tự động • Mật độ Token Tối đa • Zero-Fluff
              </p>
            </div>
          </div>
        )}
      </div>

      {/* System Instruction Architecture Modal */}
      <SystemInstructionModal
        isOpen={isSystemInstructionOpen}
        onClose={() => setIsSystemInstructionOpen(false)}
      />

      {/* Real Google Account & Firestore Synchronization Modal */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        user={user}
        totalFluffSaved={totalFluffSaved}
        recentMessages={messagesBySession[activeSessionId] || []}
      />
    </div>
  );
}

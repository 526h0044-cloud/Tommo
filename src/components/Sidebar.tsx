import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Sparkles,
  BookOpen,
  PanelLeftClose,
  PanelLeft,
  Settings,
  Trash2,
  Pin,
  PinOff,
  Edit2,
  Check,
  Search,
  Zap,
} from 'lucide-react';
import { DomainMode, ChatSession } from '../types/tommo.ts';
import type { FirebaseUser } from '../firebase.ts';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onTogglePinSession: (id: string, e: React.MouseEvent) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onOpenSystemInstruction: () => void;
  onOpenSkillsModal?: () => void;
  totalFluffSaved: number;
  user: FirebaseUser | null;
  onOpenAccountModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onTogglePinSession,
  onRenameSession,
  onOpenSystemInstruction,
  onOpenSkillsModal,
  totalFluffSaved,
  user,
  onOpenAccountModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const userInitials = user?.displayName
    ? user.displayName
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : null;

  const startRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const saveRename = (sessionId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editingTitle.trim()) {
      onRenameSession(sessionId, editingTitle.trim());
    }
    setEditingSessionId(null);
  };

  // Sort: pinned first, then by date/order
  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const pinnedSessions = filteredSessions.filter(s => s.pinned);
  const unpinnedSessions = filteredSessions.filter(s => !s.pinned);
  const sortedSessions = [...pinnedSessions, ...unpinnedSessions];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-68 bg-[#18191b] border-r border-[#26282b] transition-all duration-300 ease-in-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-16'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between h-14 px-3.5 border-b border-[#26282b]/60">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-500 text-white shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>

            {isOpen && (
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-semibold text-sm tracking-tight text-white font-sans">
                  Tommo
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/15 text-blue-400 font-mono font-medium border border-blue-500/20">
                  1.0
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#282a2d] transition cursor-pointer"
            title={isOpen ? 'Thu gọn thanh bên' : 'Mở rộng thanh bên'}
            aria-label={isOpen ? 'Thu gọn thanh bên' : 'Mở rộng thanh bên'}
          >
            {isOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={onNewChat}
            className={`flex items-center gap-2.5 w-full rounded-full transition-all duration-150 cursor-pointer ${
              isOpen
                ? 'px-4 py-2.5 bg-[#202124] hover:bg-[#282a2e] text-slate-200 hover:text-white text-xs font-medium border border-[#303236]'
                : 'p-2.5 justify-center bg-[#202124] text-slate-200 hover:text-white'
            }`}
            title="Đoạn chat mới (Ctrl+Shift+O)"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            {isOpen && (
              <div className="flex items-center justify-between flex-1">
                <span className="font-sans font-medium text-xs">Cuộc trò chuyện mới</span>
                <span className="text-[10px] text-slate-500 font-mono hidden xl:inline">⌘⇧O</span>
              </div>
            )}
          </button>
        </div>

        {/* Quick Search in Sessions (when open) */}
        {isOpen && (
          <div className="px-3 pb-2">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm đoạn chat... (Ctrl+K)"
                className="w-full bg-[#1e1f20] border border-[#2b2c2f] rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="px-2 space-y-1">
          {onOpenSkillsModal && (
            <button
              onClick={onOpenSkillsModal}
              className={`flex items-center gap-3 w-full rounded-lg px-2.5 py-2 text-xs text-slate-300 hover:bg-[#282a2d] hover:text-white transition cursor-pointer group ${
                !isOpen && 'justify-center px-0'
              }`}
              title="Khám phá Bộ Ma Trận 110 Siêu Kỹ Năng Toàn Năng (+50 Kỹ Năng Mới Nâng Cấp) của Tommo 1.0"
            >
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 group-hover:animate-pulse" />
              {isOpen && (
                <div className="flex items-center justify-between flex-1 truncate">
                  <span className="truncate font-medium text-cyan-200">110 Siêu Kỹ Năng</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                    +50 Mới
                  </span>
                </div>
              )}
            </button>
          )}

          <button
            onClick={onOpenSystemInstruction}
            className={`flex items-center gap-3 w-full rounded-lg px-2.5 py-2 text-xs text-slate-300 hover:bg-[#282a2d] hover:text-white transition cursor-pointer ${
              !isOpen && 'justify-center px-0'
            }`}
            title="Xem chỉ thị kiến trúc & nguồn gốc Tommo 1.0"
          >
            <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
            {isOpen && <span className="truncate">Chỉ thị & Nguồn gốc Tommo</span>}
          </button>
        </div>

        {/* Recent Chats Section */}
        {isOpen && (
          <div className="flex-1 overflow-y-auto px-2 mt-3 space-y-1">
            <div className="px-2.5 py-1 text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Đoạn chat</span>
              <span className="text-[10px] text-slate-500 font-mono">{sessions.length}</span>
            </div>

            {sortedSessions.map(session => {
              const isActive = activeSessionId === session.id;
              const isEditing = editingSessionId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`group flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs font-sans cursor-pointer transition ${
                    isActive
                      ? 'bg-[#282a2d] text-white font-medium'
                      : 'text-slate-400 hover:bg-[#222427] hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden mr-1.5 flex-1">
                    {session.pinned ? (
                      <Pin className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    ) : (
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-blue-400" />
                    )}

                    {isEditing ? (
                      <form
                        onSubmit={e => saveRename(session.id, e)}
                        onClick={e => e.stopPropagation()}
                        className="flex-1 flex items-center gap-1"
                      >
                        <input
                          type="text"
                          autoFocus
                          value={editingTitle}
                          onChange={e => setEditingTitle(e.target.value)}
                          onBlur={() => saveRename(session.id)}
                          className="w-full bg-[#141517] border border-blue-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </form>
                    ) : (
                      <span className="truncate">{session.title}</span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0">
                      {/* Pin button */}
                      <button
                        onClick={e => onTogglePinSession(session.id, e)}
                        className={`p-1 rounded hover:bg-[#34363a] transition ${
                          session.pinned ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                        }`}
                        title={session.pinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
                      >
                        {session.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                      </button>

                      {/* Rename button */}
                      <button
                        onClick={e => startRename(session, e)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#34363a] transition"
                        title="Đổi tên"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      {/* Delete button */}
                      {sessions.length > 1 && (
                        <button
                          onClick={e => onDeleteSession(session.id, e)}
                          className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-[#34363a] transition"
                          title="Xóa đoạn chat"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Fluff Savings Counter Badge */}
        {isOpen && (
          <div className="mx-3 my-2 p-2.5 rounded-xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/20 text-xs">
            <div className="flex items-center gap-1.5 text-yellow-400 font-mono text-[11px] font-semibold mb-0.5">
              <Zap className="w-3.5 h-3.5" />
              <span>ZERO-FLUFF POLICY</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Đã tiết kiệm <strong className="text-yellow-300">+{totalFluffSaved} tokens</strong> rườm rà.
            </p>
          </div>
        )}

        {/* Bottom Profile Bar - Real User Account */}
        <div className="p-2.5 border-t border-[#26282b] bg-[#141517]">
          {user ? (
            <div
              onClick={onOpenAccountModal}
              className="flex items-center justify-between p-1.5 rounded-xl hover:bg-[#202124] transition cursor-pointer group"
              title="Quản lý tài khoản"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="relative shrink-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Avatar'}
                      className="w-8 h-8 rounded-full ring-1 ring-blue-500/40 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs ring-1 ring-white/10">
                      {userInitials || 'TK'}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 px-1 py-0.2 rounded-full bg-emerald-600 text-[8px] font-mono font-bold text-white">
                    LIVE
                  </span>
                </div>

                {isOpen && (
                  <div className="overflow-hidden text-left">
                    <div className="text-xs font-medium text-slate-200 truncate group-hover:text-white transition">
                      {user.displayName || user.email?.split('@')[0] || 'Tài khoản Google'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {user.email || 'Tommo Pro'}
                    </div>
                  </div>
                )}
              </div>

              {isOpen && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onOpenAccountModal();
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#282a2d] transition"
                  title="Cài đặt tài khoản"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAccountModal}
              className={`w-full flex items-center gap-2.5 p-2 rounded-xl bg-[#202124] hover:bg-[#2b2d31] border border-[#303236] text-slate-200 transition cursor-pointer ${
                !isOpen && 'justify-center p-2'
              }`}
              title="Đăng nhập tài khoản Google"
            >
              <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              {isOpen && (
                <div className="overflow-hidden text-left flex-1">
                  <div className="text-xs font-semibold text-white">Đăng nhập tài khoản</div>
                  <div className="text-[10px] text-slate-400">Đồng bộ đám mây Firestore</div>
                </div>
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

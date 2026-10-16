import React from 'react';
import {
  Plus,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Zap,
  BookOpen,
  PanelLeftClose,
  PanelLeft,
  Settings,
  Trash2,
  Cpu,
  Search,
  ExternalLink,
  Key
} from 'lucide-react';
import { DomainMode } from '../types/tommo.ts';

export interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  domain: DomainMode;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onOpenSecurityModal: () => void;
  onOpenSystemInstruction: () => void;
  onOpenApiKeyModal: () => void;
  totalFluffSaved: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onOpenSecurityModal,
  onOpenSystemInstruction,
  onOpenApiKeyModal,
  totalFluffSaved,
}) => {
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
            {/* Tommo 4-color diamond/sparkle icon */}
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-500 text-white shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>

            {isOpen && (
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-semibold text-sm tracking-tight text-white font-sans">
                  Tommo
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/15 text-blue-400 font-mono font-medium border border-blue-500/20">
                  1.0 Super
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#282a2d] transition"
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
            className={`flex items-center gap-2.5 w-full rounded-full transition-all duration-150 ${
              isOpen
                ? 'px-4 py-2.5 bg-[#202124] hover:bg-[#282a2e] text-slate-200 hover:text-white text-xs font-medium border border-[#303236]'
                : 'p-2.5 justify-center bg-[#202124] text-slate-200 hover:text-white'
            }`}
            title="Đoạn chat mới"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            {isOpen && <span className="font-sans font-medium text-xs">Cuộc trò chuyện mới</span>}
          </button>
        </div>

        {/* Main Nav / Navigation Links */}
        <div className="px-2 space-y-1">
          <button
            onClick={onOpenSecurityModal}
            className={`flex items-center gap-3 w-full rounded-lg px-2.5 py-2 text-xs text-slate-300 hover:bg-[#282a2d] hover:text-white transition ${
              !isOpen && 'justify-center px-0'
            }`}
            title="Giao thức Bảo mật & Chống Jailbreak Mục 5"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            {isOpen && <span className="truncate">Lá chắn Bảo mật (Mục 5)</span>}
          </button>

          <button
            onClick={onOpenSystemInstruction}
            className={`flex items-center gap-3 w-full rounded-lg px-2.5 py-2 text-xs text-slate-300 hover:bg-[#282a2d] hover:text-white transition ${
              !isOpen && 'justify-center px-0'
            }`}
            title="Xem chỉ thị kiến trúc Tommo 1.0"
          >
            <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
            {isOpen && <span className="truncate">Chỉ thị Tommo 1.0</span>}
          </button>

          <button
            onClick={onOpenApiKeyModal}
            className={`flex items-center gap-3 w-full rounded-lg px-2.5 py-2 text-xs text-slate-300 hover:bg-[#282a2d] hover:text-white transition ${
              !isOpen && 'justify-center px-0'
            }`}
            title="Quản lý Tommo API Key (tmm-xxxxxxxxxxxxxxxxxxxx)"
          >
            <Key className="w-4 h-4 text-amber-400 shrink-0" />
            {isOpen && <span className="truncate">Tommo API Key</span>}
          </button>
        </div>

        {/* Recent Chats Section */}
        {isOpen && (
          <div className="flex-1 overflow-y-auto px-2 mt-4 space-y-1">
            <div className="px-2.5 py-1 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Gần đây
            </div>

            {sessions.map(session => (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs font-sans cursor-pointer transition ${
                  activeSessionId === session.id
                    ? 'bg-[#282a2d] text-white font-medium'
                    : 'text-slate-400 hover:bg-[#222427] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden mr-2">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-blue-400" />
                  <span className="truncate">{session.title}</span>
                </div>
                {sessions.length > 1 && (
                  <button
                    onClick={e => onDeleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition"
                    title="Xóa đoạn chat"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
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

        {/* Bottom Profile Bar */}
        <div className="p-3 border-t border-[#26282b] bg-[#141517]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-500 text-white font-bold text-xs shrink-0 shadow-sm">
                GB
                <span className="absolute -bottom-0.5 -right-0.5 px-1 py-0.2 rounded-full bg-blue-600 text-[8px] font-mono font-bold">
                  PRO
                </span>
              </div>

              {isOpen && (
                <div className="overflow-hidden">
                  <div className="text-xs font-medium text-slate-200 truncate">
                    Gia Bảo L8035 Lý Hoàng
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    Tommo Pro Plan
                  </div>
                </div>
              )}
            </div>

            {isOpen && (
              <button
                onClick={onOpenSystemInstruction}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#282a2d] transition"
                title="Cài đặt hệ thống"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

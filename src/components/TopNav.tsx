import React, { useState, useRef, useEffect } from 'react';
import {
  PanelLeft,
  ChevronDown,
  Check,
  Zap,
  Cpu,
  Download,
  FileText,
  FileJson,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { FirebaseUser } from '../firebase.ts';
import { TOMMO_ALL_SKILLS } from '../utils/tommoSkills.ts';

export type TommoModelType = 'tommo-ultra' | 'tommo-quantum';

interface TopNavProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSystemInstruction: () => void;
  onOpenSkillsModal?: () => void;
  selectedModel: TommoModelType;
  onSelectModel: (m: TommoModelType) => void;
  user: FirebaseUser | null;
  onOpenAccountModal: () => void;
  onExportMarkdown?: () => void;
  onExportJson?: () => void;
  showThinking?: boolean;
  onToggleThinking?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  onOpenSystemInstruction,
  onOpenSkillsModal,
  selectedModel,
  onSelectModel,
  user,
  onOpenAccountModal,
  onExportMarkdown,
  onExportJson,
  showThinking = false,
  onToggleThinking,
}) => {
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsModelDropdownOpen(false);
      }
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setIsExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const modelConfigs: Record<TommoModelType, { name: string; tag: string; desc: string; icon: any }> = {
    'tommo-ultra': {
      name: 'Tommo 1.0 Ultra-Turbo',
      tag: 'Siêu Tốc',
      desc: 'Bộ xử lý siêu tốc, phản hồi tức thì, mật độ token tối đa & zero-fluff',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
    },
    'tommo-quantum': {
      name: 'Tommo 1.0 Quantum Deep',
      tag: 'Logic Đa Chiều',
      desc: 'Tư duy ma trận 5 chiều chuyên sâu, giải mã kiến trúc và hệ thống siêu phức tạp',
      icon: <Cpu className="w-4 h-4 text-purple-400" />,
    },
  };

  return (
    <header className="flex items-center justify-between h-14 px-4 bg-[#131314]/90 backdrop-blur-md border-b border-[#202124] sticky top-0 z-30 select-none">
      {/* Left section: toggle button & model dropdown */}
      <div className="flex items-center gap-3">
        {!isSidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#202124] transition cursor-pointer"
            title="Mở thanh bên (Ctrl+B)"
            aria-label="Mở thanh bên"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}

        {/* Model Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsModelDropdownOpen(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-[#202124] transition text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base text-slate-100 tracking-tight font-sans">
                {modelConfigs[selectedModel].name}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  selectedModel === 'tommo-ultra'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                }`}
              >
                {modelConfigs[selectedModel].tag}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-transform duration-200" />
          </button>

          {isModelDropdownOpen && (
            <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-[#1e1f20] border border-[#303236] shadow-2xl py-2 z-50 animate-fade-in">
              <div className="px-3.5 py-1.5 text-[11px] font-mono uppercase text-slate-400 font-semibold">
                Động cơ xử lý Tommo 1.0
              </div>

              {(Object.keys(modelConfigs) as TommoModelType[]).map(key => {
                const config = modelConfigs[key];
                const isSelected = selectedModel === key;

                return (
                  <button
                    key={key}
                    onClick={() => {
                      onSelectModel(key);
                      setIsModelDropdownOpen(false);
                    }}
                    className={`flex items-start gap-3 w-full px-3.5 py-2.5 text-left transition hover:bg-[#282a2d] cursor-pointer ${
                      isSelected ? 'bg-[#282a2d]/80' : ''
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{config.icon}</div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200 font-sans">
                          {config.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-400 font-mono">
                          {config.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-sans">
                        {config.desc}
                      </p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right section: Export, API Key, Account */}
      <div className="flex items-center gap-2 text-xs">
        {/* Export Chat Dropdown */}
        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setIsExportDropdownOpen(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1e1f20] hover:bg-[#2b2c2f] border border-[#303236] text-slate-300 transition cursor-pointer"
            title="Xuất cuộc trò chuyện"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline font-sans text-[11px]">Xuất file</span>
          </button>

          {isExportDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#1e1f20] border border-[#303236] shadow-2xl py-1.5 z-50 animate-fade-in text-xs font-sans">
              <button
                onClick={() => {
                  onExportMarkdown?.();
                  setIsExportDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#282a2d] text-slate-200 text-left transition cursor-pointer"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Xuất Markdown (.md)</span>
              </button>
              <button
                onClick={() => {
                  onExportJson?.();
                  setIsExportDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-[#282a2d] text-slate-200 text-left transition cursor-pointer"
              >
                <FileJson className="w-4 h-4 text-amber-400" />
                <span>Xuất JSON (.json)</span>
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Super Skills Button */}
        {onOpenSkillsModal && (
          <button
            onClick={onOpenSkillsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 hover:from-blue-600/35 hover:to-cyan-600/35 border border-cyan-500/40 text-cyan-300 hover:text-white transition cursor-pointer shadow-xs"
            title={`Xem & Thực thi Bộ Ma Trận ${TOMMO_ALL_SKILLS.length} Siêu Kỹ Năng Toàn Năng của Tommo 1.0`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-sans font-medium text-[11px]">{TOMMO_ALL_SKILLS.length} Kỹ Năng</span>
            <span className="hidden md:inline text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
              Tier 5
            </span>
          </button>
        )}

        {/* Toggle AI Thinking Trace: Hidden by default (Trả lời câu chính thống) */}
        {onToggleThinking && (
          <button
            onClick={onToggleThinking}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition cursor-pointer font-mono text-[11px] shadow-xs ${
              showThinking
                ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/60'
            }`}
            title={
              showThinking
                ? 'Đang hiện chu trình tư duy AI (Bấm để ẩn suy nghĩ và chỉ nhận câu trả lời chính thống)'
                : 'Đang ẩn suy nghĩ AI: Phản hồi chuẩn mực câu trả lời chính thống (Bấm để xem chu trình tư duy)'
            }
          >
            {showThinking ? (
              <>
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Suy Nghĩ:</span>
                <span className="text-cyan-300 font-semibold">Hiện</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Câu Trả Lời:</span>
                <span className="text-emerald-400 font-semibold">Chính Thống</span>
              </>
            )}
          </button>
        )}

        {/* Tommo Standalone Engine Badge */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-[11px]"
          title="Tommo 1.0 là AI độc lập, tự chủ hoàn toàn, không cần API key"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">AI Độc Lập</span>
          <span className="text-[10px] text-emerald-300/80">• Zero API Key</span>
        </div>

        {/* User Profile Avatar / Sign-In Button */}
        {user ? (
          <button
            onClick={onOpenAccountModal}
            className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-blue-500/50 transition cursor-pointer ml-1"
            title={`Tài khoản: ${user.displayName || user.email}`}
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Avatar'}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-blue-500/50"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs ring-1 ring-white/10">
                {(user.displayName
                  ? user.displayName.split(' ').map(n => n[0]).slice(0, 2).join('')
                  : user.email?.slice(0, 2)
                )?.toUpperCase() || 'TK'}
              </div>
            )}
          </button>
        ) : (
          <button
            onClick={onOpenAccountModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition cursor-pointer shadow-sm ml-1"
            title="Đăng nhập tài khoản Google thật"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="hidden sm:inline">Đăng nhập</span>
          </button>
        )}
      </div>
    </header>
  );
};

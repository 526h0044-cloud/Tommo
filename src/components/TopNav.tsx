import React, { useState, useRef, useEffect } from 'react';
import { PanelLeft, Sparkles, Key, ShieldCheck, ChevronDown, Check, Zap, Cpu, Globe } from 'lucide-react';
import { maskTommoApiKey } from '../utils/tommoApiKey.ts';

export type TommoModelType = 'tommo-ultra' | 'tommo-quantum';

interface TopNavProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSecurityModal: () => void;
  onOpenSystemInstruction: () => void;
  onOpenApiKeyModal: () => void;
  activeApiKey?: string;
  selectedModel: TommoModelType;
  onSelectModel: (m: TommoModelType) => void;
  isWebSearchActive: boolean;
  onToggleWebSearch: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  onOpenSecurityModal,
  onOpenSystemInstruction,
  onOpenApiKeyModal,
  activeApiKey,
  selectedModel,
  onSelectModel,
  isWebSearchActive,
  onToggleWebSearch,
}) => {
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const modelConfigs: Record<TommoModelType, { name: string; tag: string; desc: string; icon: any }> = {
    'tommo-ultra': {
      name: 'Tommo 2.0 Ultra-Turbo',
      tag: 'Siêu Tốc',
      desc: 'Bộ xử lý siêu tốc, phản hồi tức thì, mật độ token tối đa & zero-fluff',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
    },
    'tommo-quantum': {
      name: 'Tommo 2.0 Quantum Deep',
      tag: 'Logic Đa Chiều',
      desc: 'Tư duy ma trận 5 tầng vượt trội, giải mã kiến trúc và hệ thống siêu phức tạp',
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
            title="Mở thanh bên"
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
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                selectedModel === 'tommo-ultra'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
              }`}>
                {modelConfigs[selectedModel].tag}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-transform duration-200" />
          </button>

          {isModelDropdownOpen && (
            <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-[#1e1f20] border border-[#303236] shadow-2xl py-2 z-50 animate-fade-in">
              <div className="px-3.5 py-1.5 text-[11px] font-mono uppercase text-slate-400 font-semibold">
                Động cơ xử lý Tommo
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

      {/* Right section: Web search, API Key, Security Shield, Upgrade, Profile badge */}
      <div className="flex items-center gap-2 text-xs">
        {/* Multi-Dimensional Web Search Toggle */}
        <button
          onClick={onToggleWebSearch}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition cursor-pointer ${
            isWebSearchActive
              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
              : 'bg-[#1e1f20] border-[#303236] text-slate-400 hover:text-slate-200'
          }`}
          title="Bật/Tắt tìm kiếm mạng đa chiều thời gian thực"
        >
          <Globe className={`w-3.5 h-3.5 ${isWebSearchActive ? 'text-cyan-400 animate-spin-slow' : 'text-slate-400'}`} />
          <span className="hidden md:inline font-sans font-medium text-[11px]">
            {isWebSearchActive ? 'Mạng đa chiều: BẬT' : 'Mạng đa chiều'}
          </span>
        </button>

        {/* Tommo Native API Key Pill Button */}
        <button
          onClick={onOpenApiKeyModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1e1f20] hover:bg-[#2b2c2f] border border-[#303236] text-amber-400 font-mono transition cursor-pointer"
          title="Xem và quản lý Tommo API Key"
        >
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline font-medium text-[11px]">
            {activeApiKey ? maskTommoApiKey(activeApiKey) : 'Tommo Key'}
          </span>
          <span className="lg:hidden">Key</span>
        </button>

        {/* Security Shield Action */}
        <button
          onClick={onOpenSecurityModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1e1f20] hover:bg-[#2b2c2f] border border-[#303236] text-emerald-400 font-medium transition cursor-pointer"
          title="Kiểm thử Giao thức Bảo mật Mục 5"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Lá chắn An ninh</span>
        </button>

        {/* Architecture Spec Button */}
        <button
          onClick={onOpenSystemInstruction}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-90 text-white font-medium shadow-sm transition cursor-pointer"
          title="Xem chuẩn kiến trúc Tommo 2.0"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>Tommo 2.0</span>
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-500 text-white font-bold text-xs ring-1 ring-white/10 ml-1">
          GB
        </div>
      </div>
    </header>
  );
};

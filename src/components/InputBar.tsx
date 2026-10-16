import React, { useRef, useEffect } from 'react';
import { Plus, Mic, ArrowUp, Globe, ChevronDown, Zap, Sparkles } from 'lucide-react';
import { DomainMode, ProcessorEngineMode } from '../types/tommo.ts';

interface InputBarProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isProcessing?: boolean;
  domain: DomainMode;
  onSelectDomain: (d: DomainMode) => void;
  placeholder?: string;
  isHero?: boolean;
  isWebSearchActive?: boolean;
  onToggleWebSearch?: () => void;
  processorMode?: ProcessorEngineMode;
  onToggleProcessorMode?: () => void;
}

export const InputBar: React.FC<InputBarProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  isProcessing = false,
  domain,
  onSelectDomain,
  placeholder = 'Hỏi Tommo...',
  isHero = false,
  isWebSearchActive = true,
  onToggleWebSearch,
  processorMode = 'ultra_turbo',
  onToggleProcessorMode,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div
      className={`relative w-full rounded-3xl bg-[#1e1f20] border border-[#3c4043]/60 shadow-xl transition-all duration-200 focus-within:border-[#8ab4f8] focus-within:shadow-[0_0_24px_rgba(138,180,248,0.18)] ${
        isHero ? 'max-w-2xl mx-auto' : 'max-w-4xl mx-auto'
      }`}
    >
      <div className="flex items-center px-4 py-2.5 gap-2.5">
        {/* Attachment icon */}
        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-[#2d2f31] transition shrink-0 cursor-pointer"
          title="Thêm tệp hoặc ngữ cảnh"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Input Text Area */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-0 text-slate-100 placeholder-slate-400 text-sm focus:outline-none resize-none font-sans py-1 leading-relaxed max-h-40 no-scrollbar"
        />

        {/* Multi-Dimensional Web Search Toggle */}
        <button
          type="button"
          onClick={onToggleWebSearch}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer shrink-0 border ${
            isWebSearchActive
              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
              : 'bg-[#2b2c2f] border-[#444746] text-slate-400 hover:text-slate-200'
          }`}
          title={isWebSearchActive ? 'Tìm kiếm mạng đa chiều đang BẬT' : 'Bật tìm kiếm mạng đa chiều'}
        >
          <Globe className={`w-3.5 h-3.5 ${isWebSearchActive ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
          <span className="hidden sm:inline text-[11px]">Mạng đa chiều</span>
          {isWebSearchActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          )}
        </button>

        {/* Processor Turbo/Quantum Toggle */}
        {onToggleProcessorMode && (
          <button
            type="button"
            onClick={onToggleProcessorMode}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-mono transition cursor-pointer shrink-0 border ${
              processorMode === 'ultra_turbo'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
            }`}
            title="Chuyển chế độ bộ xử lý Tommo"
          >
            {processorMode === 'ultra_turbo' ? (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline text-[11px]">Siêu Tốc</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden md:inline text-[11px]">Quantum</span>
              </>
            )}
          </button>
        )}

        {/* Domain / Model Selector Pill */}
        <div className="relative shrink-0 flex items-center hidden sm:flex">
          <select
            value={domain}
            onChange={e => onSelectDomain(e.target.value as DomainMode)}
            className="appearance-none bg-[#2b2c2f] hover:bg-[#34363a] text-slate-200 text-xs font-medium pl-3 pr-6 py-1.5 rounded-full border border-[#444746] cursor-pointer focus:outline-none transition"
            title="Chọn chế độ chuyên môn"
          >
            <option value="architecture">Kiến trúc (Arch)</option>
            <option value="software">Lập trình (Dev)</option>
            <option value="security">Bảo mật (OWASP)</option>
            <option value="science">Phân tích (Analytics)</option>
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
        </div>

        {/* Mic simulation */}
        <button
          type="button"
          onClick={() => onChange(value ? value + ' ' : 'Thiết kế kiến trúc hệ thống')}
          className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-[#2d2f31] transition shrink-0 hidden md:flex cursor-pointer"
          title="Nhập bằng giọng nói"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Submit / Execute button */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim() || disabled || isProcessing}
          className={`flex items-center justify-center w-8 h-8 rounded-full transition shrink-0 cursor-pointer ${
            value.trim() && !disabled && !isProcessing
              ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-md'
              : 'bg-[#2b2c2f] text-slate-500 cursor-not-allowed'
          }`}
          title="Gửi câu lệnh"
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};

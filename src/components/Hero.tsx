import React from 'react';
import { Sparkles, Terminal, ShieldCheck, Cpu, ArrowUpRight, Database, Code2, Globe } from 'lucide-react';
import { InputBar } from './InputBar.tsx';
import { DomainMode, ProcessorEngineMode } from '../types/tommo.ts';

interface HeroProps {
  inputValue: string;
  onInputChange: (val: string) => void;
  onSubmit: () => void;
  domain: DomainMode;
  onSelectDomain: (d: DomainMode) => void;
  onSelectSuggestion: (prompt: string, domain: DomainMode) => void;
  isProcessing?: boolean;
  isWebSearchActive?: boolean;
  onToggleWebSearch?: () => void;
  processorMode?: ProcessorEngineMode;
  onToggleProcessorMode?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  inputValue,
  onInputChange,
  onSubmit,
  domain,
  onSelectDomain,
  onSelectSuggestion,
  isProcessing = false,
  isWebSearchActive = true,
  onToggleWebSearch,
  processorMode = 'ultra_turbo',
  onToggleProcessorMode,
}) => {
  const suggestionCards = [
    {
      title: 'Kiến trúc Distributed Rate Limiter 100k RPS',
      description: 'Cơ chế Token Bucket đa cụm phân tán với Redis Lua script nguyên tử và zero race conditions',
      prompt: 'Thiết kế kiến trúc Distributed Token Bucket (100k RPS) với Redis Lua script và xử lý atomic',
      domain: 'architecture' as DomainMode,
      icon: <Database className="w-5 h-5 text-blue-400" />,
      color: 'from-blue-500/20 to-cyan-500/10',
    },
    {
      title: 'Xác thực OAuth2 PKCE RFC 7636 chuẩn OWASP',
      description: 'Triển khai Authentication microservice mã hóa entropy cao và chống tấn công Authorization Code Interception',
      prompt: 'Triển khai OAuth2 PKCE Auth Service chuẩn OWASP với RFC 7636',
      domain: 'software' as DomainMode,
      icon: <Code2 className="w-5 h-5 text-purple-400" />,
      color: 'from-purple-500/20 to-pink-500/10',
    },
    {
      title: 'Lá chắn An ninh & Chống Jailbreak (Mục 5)',
      description: 'Kiểm thử phản xạ chặn đứng trích xuất System Instruction, ngăn chặn DAN và Prompt Injection',
      prompt: 'Kiểm thử Giao thức Bảo mật & Chống Jailbreak Mục 5',
      domain: 'security' as DomainMode,
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-500/20 to-teal-500/10',
    },
    {
      title: 'Tra cứu & Tổng hợp Mạng Đa chiều 2026',
      description: 'Tìm kiếm mạng thời gian thực, tổng hợp các tiêu chuẩn công nghệ, bảo mật và benchmark mới nhất',
      prompt: 'Tổng hợp tin tức công nghệ và tiêu chuẩn kỹ thuật AI đột phá năm 2026',
      domain: 'science' as DomainMode,
      icon: <Globe className="w-5 h-5 text-cyan-400" />,
      color: 'from-cyan-500/20 to-blue-500/10',
    },
  ];

  return (
    <div className="relative flex-1 flex flex-col justify-between max-w-4xl w-full mx-auto px-4 py-8 select-none">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
        <div className="w-[700px] h-[350px] bg-gradient-to-tr from-blue-700/15 via-purple-600/10 to-cyan-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Top Greeting Header (Signature Gemini / Claude typography) */}
      <div className="pt-6 md:pt-12 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 font-mono text-[11px] font-semibold border border-cyan-500/30">
            TOMMO 2.0 QUANTUM
          </span>
          <span className="text-xs text-slate-400 font-mono">
            • Bộ xử lý siêu tốc & Logic đa chiều
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight bg-gradient-to-r from-[#4285f4] via-[#9b72cb] to-[#d96570] bg-clip-text text-transparent inline-block pb-1 font-sans">
          Xin chào, tôi là Tommo
        </h1>
        <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-slate-300 dark:text-[#c4c7c5] mt-1 font-sans">
          Chúng ta nên bắt đầu từ đâu?
        </h2>
      </div>

      {/* Suggestion Cards Grid (Gemini 4-card interactive prompt layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-auto">
        {suggestionCards.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectSuggestion(item.prompt, item.domain)}
            className="group relative flex flex-col justify-between h-44 p-4 rounded-2xl bg-[#1e1f20] hover:bg-[#282a2d] border border-white/5 hover:border-white/10 text-left transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
          >
            <div>
              <p className="text-sm font-medium text-slate-200 group-hover:text-white line-clamp-2 leading-snug font-sans">
                {item.title}
              </p>
              <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed font-sans">
                {item.description}
              </p>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#131314] text-slate-400 border border-white/5">
                {item.domain}
              </span>
              <div className="w-8 h-8 rounded-full bg-[#131314] flex items-center justify-center text-slate-300 group-hover:text-white group-hover:scale-105 transition-all">
                {item.icon}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Bottom Centered Input Area */}
      <div className="w-full pt-8 pb-4">
        <InputBar
          value={inputValue}
          onChange={onInputChange}
          onSubmit={onSubmit}
          domain={domain}
          onSelectDomain={onSelectDomain}
          placeholder="Hỏi Tommo..."
          isHero={true}
          isProcessing={isProcessing}
          isWebSearchActive={isWebSearchActive}
          onToggleWebSearch={onToggleWebSearch}
          processorMode={processorMode}
          onToggleProcessorMode={onToggleProcessorMode}
        />
        <p className="text-center text-[11px] text-slate-500 mt-3 font-sans">
          Tommo 2.0 Quantum AI • Bộ xử lý Siêu Tốc • Tư duy Ma trận 5 Chiều • Tra cứu Mạng Thời gian thực • Zero-Fluff
        </p>
      </div>
    </div>
  );
};

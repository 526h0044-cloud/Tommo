import React from 'react';
import { Database, Code2, Info, Sparkles, RefreshCw, Files, GraduationCap, Globe } from 'lucide-react';
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
  processorMode = 'ultra_turbo',
  onToggleProcessorMode,
}) => {
  const suggestionCards = [
    {
      title: 'Kiểm Thử Năng Lực Toàn Diện',
      description: 'Lập trình đa mã nguồn, tìm kiếm dữ liệu ngách, tóm tắt gom gọn đa tệp và tự phản biện sửa lỗi ngầm',
      prompt: 'Cho AI có khả năng code mạnh với nhiều mã nguồn khác nhau\nKhả năng tìm kiếm thông minh mạnh [đến cả các trang web công khai nhưng k có người xem]\nKhả năng search mạng mạnh\nKhả năng đọc hiểu được hàng chục file và tóm tắt gom gọn lại\nKhả năng viết báo cáo / bài luận / bài thuyết trình /... cho sinh viên đại học\n\n[Và các khả năng phải mạnh. bộ sử lí tối ưu thông minh]\n\nAI có khả năng tự hỏi lại bản thân rồi tự xử lí và sửa lỗi',
      domain: 'architecture' as DomainMode,
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
    },
    {
      title: 'Động Cơ Tự Vấn & Tự Sửa Lỗi Ngầm',
      description: 'Cơ chế tự chất vấn bản thân, bẫy lỗi logic, tự động sinh bản vá (Auto-Patching) và xác thực trước khi bàn giao',
      prompt: 'AI có khả năng tự hỏi lại bản thân rồi tự xử lý và sửa lỗi ngầm (Self-Reflection & Auto-Repair Loop)',
      domain: 'software' as DomainMode,
      icon: <RefreshCw className="w-5 h-5 text-cyan-400" />,
    },
    {
      title: 'Đọc Hiểu Hàng Chục File & Gom Gọn',
      description: 'Phân tích đồng thời 30+ tệp mã nguồn và tài liệu, lập bản đồ quan hệ chéo và nén 97.6% token thừa',
      prompt: 'Khả năng đọc hiểu được hàng chục file và tóm tắt gom gọn lại thành ma trận hành động',
      domain: 'architecture' as DomainMode,
      icon: <Files className="w-5 h-5 text-indigo-400" />,
    },
    {
      title: 'Viết Luận Văn & Slide Thuyết Trình ĐH',
      description: 'Báo cáo học thuật 5 chương, khung slide bảo vệ kèm speaker notes cho sinh viên và trích dẫn chuẩn APA/IEEE',
      prompt: 'Khả năng viết báo cáo / bài luận / bài thuyết trình kèm speaker notes cho sinh viên đại học',
      domain: 'academic' as DomainMode,
      icon: <GraduationCap className="w-5 h-5 text-purple-400" />,
    },
    {
      title: 'Deep Search: Web Công Khai Ngách',
      description: 'Khai phá các nguồn dữ liệu công khai tầng sâu ít người xem: IETF RFCs drafts, arXiv preprints, OpenDOAR',
      prompt: 'Khả năng tìm kiếm thông minh mạnh [đến cả các trang web công khai nhưng k có người xem, RFCs, arXiv preprints]',
      domain: 'deep_search' as DomainMode,
      icon: <Globe className="w-5 h-5 text-blue-400" />,
    },
    {
      title: 'Nguồn gốc, Model & Giới hạn Token',
      description: 'Công khai danh tính tác giả Gia Bảo, các động cơ model lõi và hạn mức token tối đa của Tommo 1.0',
      prompt: 'Cho tôi biết nguồn gốc, tác giả, model và hạn mức token tối đa của Tommo 1.0',
      domain: 'architecture' as DomainMode,
      icon: <Info className="w-5 h-5 text-amber-400" />,
    },
  ];

  return (
    <div className="relative flex-1 flex flex-col justify-between max-w-4xl w-full mx-auto px-4 py-8 select-none">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
        <div className="w-[700px] h-[350px] bg-gradient-to-tr from-blue-700/15 via-purple-600/10 to-cyan-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Top Greeting Header */}
      <div className="pt-6 md:pt-12 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 font-mono text-[11px] font-semibold border border-cyan-500/30">
            TOMMO 1.0
          </span>
          <span className="text-xs text-slate-400 font-mono">
            • Autonomous Super AI Engine & Universal Systems Architect
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight bg-gradient-to-r from-[#4285f4] via-[#9b72cb] to-[#d96570] bg-clip-text text-transparent inline-block pb-1 font-sans">
          Xin chào, tôi là Tommo 1.0
        </h1>
        <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-slate-300 dark:text-[#c4c7c5] mt-1 font-sans">
          Chúng ta nên bắt đầu từ đâu?
        </h2>
      </div>

      {/* Suggestion Cards Grid */}
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
          placeholder="Hỏi Tommo 1.0..."
          isHero={true}
          isProcessing={isProcessing}
          processorMode={processorMode}
          onToggleProcessorMode={onToggleProcessorMode}
        />
        <p className="text-center text-[11px] text-slate-500 mt-3 font-sans">
          Tommo 1.0 Super Engine • Bộ xử lý Siêu Tốc • Tư duy Ma trận Đa chiều • Tra cứu Mạng Tự động • Zero-Fluff
        </p>
      </div>
    </div>
  );
};

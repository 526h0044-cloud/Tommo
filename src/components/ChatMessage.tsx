import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Terminal,
  CheckCircle2,
  HelpCircle,
  Zap,
  Globe,
  ExternalLink,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Code,
  Download,
  GraduationCap,
  BookOpen,
  Presentation,
  Files,
  Code2,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Wrench,
} from 'lucide-react';
import { TommoMessage } from '../types/tommo.ts';
import { PresentationViewer } from './PresentationViewer.tsx';

interface ChatMessageProps {
  message: TommoMessage;
  showThinking?: boolean;
}

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlockView: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');

  const cleanLang = (language || 'typescript').toLowerCase();
  const canPreview =
    cleanLang === 'html' ||
    cleanLang === 'svg' ||
    cleanLang === 'css' ||
    code.includes('<!DOCTYPE html>') ||
    code.includes('<html') ||
    code.includes('<svg');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extMap: Record<string, string> = {
      typescript: 'ts',
      javascript: 'js',
      python: 'py',
      html: 'html',
      css: 'css',
      json: 'json',
      sql: 'sql',
      markdown: 'md',
    };
    const ext = extMap[cleanLang] || 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tommo_code_${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-3.5 rounded-2xl overflow-hidden border border-[#303236] bg-[#1a1b1d] shadow-md">
      {/* Code Header with Lang, Tabs & Action Buttons */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#222427] border-b border-[#303236] text-xs font-mono text-slate-300">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-blue-400 font-semibold uppercase tracking-wider text-[11px]">
            <Terminal className="w-3.5 h-3.5" />
            {cleanLang}
          </span>

          {canPreview && (
            <div className="flex items-center bg-[#18191b] rounded-lg p-0.5 border border-[#303236] text-[11px]">
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded transition ${
                  activeTab === 'code' ? 'bg-[#2b2c2f] text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code className="w-3 h-3" />
                <span>Mã nguồn</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded transition ${
                  activeTab === 'preview' ? 'bg-cyan-500/20 text-cyan-300 font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Xem trực tiếp</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Download button */}
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition px-2 py-1 rounded hover:bg-[#2e3034] cursor-pointer text-[11px]"
            title="Tải tệp mã nguồn về máy"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Tải tệp</span>
          </button>

          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition px-2 py-1 rounded hover:bg-[#2e3034] cursor-pointer text-[11px]"
            title="Sao chép toàn bộ mã nguồn"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
          </button>
        </div>
      </div>

      {/* Tab Body */}
      {activeTab === 'code' ? (
        <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed bg-[#141517] selection:bg-blue-600/30">
          <code>{code}</code>
        </pre>
      ) : (
        <div className="p-3 bg-white rounded-b-2xl">
          <iframe
            srcDoc={code}
            title="Live Sandbox Preview"
            sandbox="allow-scripts"
            className="w-full h-80 border border-slate-200 rounded-xl bg-white shadow-inner"
          />
        </div>
      )}
    </div>
  );
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, showThinking = false }) => {
  const [copied, setCopied] = useState(false);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
  const [isWebSourcesExpanded, setIsWebSourcesExpanded] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [academicTab, setAcademicTab] = useState<'paper' | 'slides'>('paper');
  const [activePolyglotTab, setActivePolyglotTab] = useState<number>(0);

  const isUser = message.role === 'user';
  const deliverable = message.deliverable;
  const metrics = message.tokenMetrics;
  const stages = message.cognitiveStages;
  const webGrounding = message.webGrounding;
  const processorMode = message.processorMode || 'ultra_turbo';

  // Strip any internal thought markers to ensure a clean, authoritative response
  const officialContent = (message.content || '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
    .trim();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt của bạn chưa hỗ trợ Web Speech API.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      // Remove code blocks and markdown symbols for natural reading
      const cleanText = officialContent
        .replace(/```[\s\S]*?```/g, ' [Có đoạn mã lập trình] ')
        .replace(/[#*`_~]/g, '')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'vi-VN';
      utterance.rate = 1.05;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-4 animate-fade-in">
        <div className="max-w-2xl rounded-3xl bg-[#282a2d] text-slate-100 px-5 py-3.5 text-sm font-sans leading-relaxed shadow-sm border border-white/5 whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  // Tommo 1.0 Super AI Engine response
  return (
    <div className="flex gap-4 my-6 text-slate-200 animate-fade-in max-w-4xl mx-auto">
      {/* Tommo Sparkle Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-500 flex items-center justify-center shrink-0 text-white mt-1 shadow-md ring-1 ring-cyan-500/30">
        <Sparkles className="w-4 h-4 text-white" />
      </div>

      <div className="flex-1 overflow-hidden space-y-4">
        {/* Thinking Accordion (Cognitive Simulation Trace) - ONLY rendered when showThinking is explicitly TRUE */}
        {showThinking && stages && stages.length > 0 && (
          <div className="rounded-2xl border border-[#303236] bg-[#1a1b1d]/90 overflow-hidden shadow-sm">
            <button
              onClick={() => setIsThinkingExpanded(prev => !prev)}
              className="flex items-center justify-between w-full px-4 py-2.5 text-xs text-slate-300 hover:text-white transition font-sans cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-semibold text-slate-200">
                  Chu trình tư duy nhận thức (Cognitive Reasoning Trace)
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  • {stages.reduce((acc, s) => acc + (s.durationMs || 0), 0)}ms
                </span>
                {webGrounding && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono">
                    +Dữ liệu mạng đa chiều
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <span>{isThinkingExpanded ? 'Thu gọn' : 'Xem chu trình logic'}</span>
                {isThinkingExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </div>
            </button>

            {isThinkingExpanded && (
              <div className="p-4 pt-1 border-t border-[#282a2d] grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-[#141517]">
                {stages.map(stage => (
                  <div
                    key={stage.id}
                    className="p-3 rounded-xl bg-[#1e1f20] border border-[#2b2c2f] space-y-1.5"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="font-semibold text-cyan-300">
                        {stage.vietnameseTitle}
                      </span>
                      <span className="text-slate-500">{stage.durationMs}ms</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                      {stage.summary}
                    </p>
                    {stage.details && (
                      <div className="pt-1.5 border-t border-[#26282b] space-y-1">
                        {stage.details.map((d, dIdx) => (
                          <div key={dIdx} className="flex items-start gap-1.5 text-[10.5px] text-slate-400 font-sans">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Live Multi-Dimensional Web Grounding Citations */}
        {webGrounding && webGrounding.sources && webGrounding.sources.length > 0 && (
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/15 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold font-sans">
                <Globe className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                <span>Dữ liệu mạng đa chiều thời gian thực (Live Web Grounding)</span>
                <span className="px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-200 font-mono text-[10px]">
                  {webGrounding.sources.length} nguồn kiểm chứng
                </span>
              </div>
              <button
                onClick={() => setIsWebSourcesExpanded(prev => !prev)}
                className="text-[11px] text-cyan-400 hover:text-cyan-200 transition font-sans cursor-pointer"
              >
                {isWebSourcesExpanded ? 'Thu gọn' : 'Chi tiết'}
              </button>
            </div>

            {/* Grounding sources cards */}
            {isWebSourcesExpanded && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1.5">
                {webGrounding.sources.map((src, sIdx) => (
                  <a
                    key={sIdx}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-[#1e1f20] hover:bg-[#282a2d] border border-[#2e3034] hover:border-cyan-500/40 transition flex flex-col justify-between group"
                  >
                    <span className="text-xs text-slate-200 font-medium line-clamp-2 group-hover:text-cyan-300">
                      {src.title}
                    </span>
                    {src.snippet && (
                      <p className="text-[10.5px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                        {src.snippet}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[10px] text-slate-400">
                      <span className="font-mono text-cyan-400 truncate max-w-[120px]">{src.domain}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Deliverable Body Content (Official Response) */}
        <div className="text-sm font-sans space-y-3 leading-relaxed text-slate-200">
          {officialContent.split(/\n\n+/).map((block, i) => {
            // Check for Code Block
            if (block.startsWith('```')) {
              const lines = block.split('\n');
              const lang = lines[0].replace(/```/, '').trim() || 'typescript';
              const codeClean = lines.slice(1, -1).join('\n') || lines.slice(1).join('\n').replace(/```$/, '');

              return <CodeBlockView key={i} language={lang} code={codeClean} />;
            }

            // Markdown table rendering
            if (block.startsWith('|')) {
              const rows = block.trim().split('\n');
              const headers = rows[0].split('|').map(c => c.trim()).filter(Boolean);
              const dataRows = rows.slice(2);

              return (
                <div key={i} className="my-3 overflow-x-auto rounded-xl border border-[#303236]">
                  <table className="min-w-full divide-y divide-[#303236] text-xs">
                    <thead className="bg-[#1e1f20] text-slate-200 font-sans font-semibold">
                      <tr>
                        {headers.map((h, hIdx) => (
                          <th key={hIdx} className="px-3.5 py-2.5 text-left">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#26282b] bg-[#161719]">
                      {dataRows.map((r, rIdx) => {
                        const cells = r.split('|').map(c => c.trim()).filter(Boolean);
                        return (
                          <tr key={rIdx} className="hover:bg-[#1e1f20]/60">
                            {cells.map((c, cIdx) => (
                              <td key={cIdx} className="px-3.5 py-2 text-slate-300">
                                {c.replace(/\*\*(.*?)\*\*/g, '$1')}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            }

            // Headings
            if (block.startsWith('###')) {
              return (
                <h3 key={i} className="text-base font-semibold text-white tracking-tight mt-4 mb-2">
                  {block.replace(/^###\s*/, '')}
                </h3>
              );
            }

            if (block.startsWith('####')) {
              return (
                <h4 key={i} className="text-sm font-semibold text-blue-300 mt-3 mb-1">
                  {block.replace(/^####\s*/, '')}
                </h4>
              );
            }

            // Bullet points
            if (block.startsWith('- ') || block.startsWith('* ') || block.match(/^\d+\.\s/)) {
              return (
                <div key={i} className="pl-1 space-y-1 text-slate-300">
                  {block.split('\n').map((line, lIdx) => (
                    <div key={lIdx} className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{line.replace(/^[-*]\s+|\d+\.\s+/, '')}</span>
                    </div>
                  ))}
                </div>
              );
            }

            // Default paragraph
            return (
              <p key={i} className="text-slate-300 leading-relaxed font-sans">
                {block}
              </p>
            );
          })}
        </div>

        {/* 1. Presentation Deck (PowerPoint, Canva, Nanobanana 2) */}
        {deliverable?.presentationDeck && (
          <div className="my-3">
            <PresentationViewer deck={deliverable.presentationDeck} />
          </div>
        )}

        {/* 2. University Academic Structure (Paper & Defense Slides) */}
        {deliverable?.academicStructure && (
          <div className="rounded-2xl border border-purple-500/40 bg-slate-950 p-4 shadow-xl my-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-400" />
                <span className="font-mono text-xs font-bold text-purple-300 uppercase tracking-wide">
                  Khung Luận Văn & Slide Thuyết Trình Sinh Viên Đại Học (Chuẩn TDTU & Độc Quyền Tommo)
                </span>
              </div>

              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setAcademicTab('paper')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded transition cursor-pointer ${
                    academicTab === 'paper'
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Toàn Văn Luận Văn</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAcademicTab('slides')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded transition cursor-pointer ${
                    academicTab === 'slides'
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Presentation className="w-3.5 h-3.5" />
                  <span>Slide Thuyết Trình Bảo Vệ</span>
                </button>
              </div>
            </div>

            {academicTab === 'paper' ? (
              <div className="mt-3 space-y-3 text-xs leading-relaxed">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-mono text-purple-400 uppercase font-semibold block mb-0.5">
                    Tóm Tắt Khoa Học (Abstract):
                  </span>
                  <p className="text-slate-200 italic">{deliverable.academicStructure.abstract}</p>
                </div>

                <div className="space-y-2">
                  {deliverable.academicStructure.sections.map((sec, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <h5 className="font-mono font-bold text-slate-200 mb-1">{sec.heading}</h5>
                      <p className="text-slate-300 text-xs whitespace-pre-line leading-relaxed">{sec.content}</p>
                    </div>
                  ))}
                </div>

                {deliverable.academicStructure.citations && (
                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px]">
                    <span className="font-mono text-purple-300 uppercase font-semibold block mb-1">
                      Tài Liệu Tham Khảo (APA 7th / MLA):
                    </span>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                      {deliverable.academicStructure.citations.map((cite, idx) => (
                        <li key={idx}>{cite}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {deliverable.academicStructure.slideDecks?.map((slide, idx) => (
                  <div key={idx} className="rounded-xl bg-slate-900 border border-slate-800 p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="font-mono text-purple-400 font-bold">SLIDE {slide.slideNumber}</span>
                      <span className="font-semibold text-slate-200">{slide.title}</span>
                    </div>
                    <ul className="space-y-1 text-slate-300 pl-3 list-disc">
                      {slide.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
                      <strong className="text-cyan-400 font-mono block mb-0.5">Lời thoại thuyết trình (Speaker Notes):</strong>
                      "{slide.speakerNotes}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Multi-File Codebase Audit Matrix Table */}
        {deliverable?.multiFileAnalysis && (
          <div className="rounded-2xl border border-cyan-500/40 bg-slate-950 p-4 shadow-xl my-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <Files className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs font-bold text-cyan-300 uppercase tracking-wide">
                  Ma Trận Thẩm Định Toàn Bộ Dự Án ({deliverable.multiFileAnalysis.totalFiles} Tệp • {deliverable.multiFileAnalysis.totalSize})
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                100% TYPE-SAFE • 0 LỖI CÚ PHÁP
              </span>
            </div>

            <div className="mt-3 overflow-x-auto rounded-xl border border-slate-800">
              <table className="min-w-full divide-y divide-slate-800 text-xs">
                <thead className="bg-slate-900 text-cyan-300 font-mono">
                  <tr>
                    <th className="px-3 py-2 text-left">Tệp Mã Nguồn</th>
                    <th className="px-3 py-2 text-left">Loại Tệp</th>
                    <th className="px-3 py-2 text-left">Dung Lượng</th>
                    <th className="px-3 py-2 text-left">Vai Trò Kiến Trúc</th>
                    <th className="px-3 py-2 text-left">Điểm Cốt Lõi Trích Xuất</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 bg-slate-950/60 font-sans">
                  {deliverable.multiFileAnalysis.fileMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="px-3 py-2 font-mono text-cyan-300 font-semibold">{item.name}</td>
                      <td className="px-3 py-2 text-slate-300">{item.type}</td>
                      <td className="px-3 py-2 font-mono text-slate-400">{item.size}</td>
                      <td className="px-3 py-2 text-slate-300">{item.role}</td>
                      <td className="px-3 py-2 text-slate-400">{item.keyPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {deliverable.multiFileAnalysis.crossDependencies && deliverable.multiFileAnalysis.crossDependencies.length > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px]">
                <span className="font-mono text-cyan-400 uppercase font-semibold block mb-1">
                  Liên kết phụ thuộc chéo (Cross-Dependencies):
                </span>
                <ul className="space-y-1 text-slate-300">
                  {deliverable.multiFileAnalysis.crossDependencies.map((dep, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-cyan-400">→</span>
                      <span>{dep}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {deliverable.multiFileAnalysis.finalSynthesis && (
              <div className="mt-3 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-slate-200">
                <strong className="text-cyan-300 block mb-0.5">Tổng kết thẩm định toàn bộ tệp:</strong>
                {deliverable.multiFileAnalysis.finalSynthesis}
              </div>
            )}
          </div>
        )}

        {/* 4. Polyglot Code Switcher */}
        {deliverable?.polyglotSnippets && deliverable.polyglotSnippets.length > 0 && (
          <div className="rounded-2xl border border-cyan-500/40 bg-slate-950 shadow-xl overflow-hidden my-4">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-semibold text-slate-200">
                  MÃ NGUỒN ĐA NGÔN NGỮ (POLYGLOT CODE PACKAGE):
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {deliverable.polyglotSnippets.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePolyglotTab(idx)}
                    className={`px-2.5 py-1 text-xs font-mono rounded-md transition cursor-pointer ${
                      activePolyglotTab === idx
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {item.language.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            {deliverable.polyglotSnippets[activePolyglotTab] && (
              <div>
                <div className="flex items-center justify-between px-4 py-1.5 bg-slate-850 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                  <span>Tệp: <strong className="text-cyan-300">{deliverable.polyglotSnippets[activePolyglotTab].filename}</strong></span>
                  <button
                    type="button"
                    onClick={() => handleCopy(deliverable.polyglotSnippets![activePolyglotTab].code)}
                    className="flex items-center gap-1 text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Sao chép</span>
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-cyan-200 overflow-x-auto leading-normal bg-slate-950 max-h-96">
                  <code>{deliverable.polyglotSnippets[activePolyglotTab].code}</code>
                </pre>
              </div>
            )}
          </div>
        )}

        {/* 5. Autonomous Self-Reflection & Auto-Repair Panel */}
        {deliverable?.selfCorrection && (
          <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-slate-900/90 to-cyan-950/30 p-4 shadow-xl my-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin-slow" />
                <span className="font-mono text-xs font-bold text-emerald-300 uppercase tracking-wide">
                  Động Cơ Tự Vấn Bản Thân & Tự Sửa Lỗi (Autonomous Self-Reflection Loop)
                </span>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% VERIFICATION PASSED
              </span>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold block mb-0.5">
                  ❓ Câu hỏi Tommo tự chất vấn chính mình:
                </span>
                <p className="text-slate-200 font-medium italic">
                  "{deliverable.selfCorrection.selfQuestion}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30">
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Điểm mù & Lỗi logic ngầm tự phát hiện:
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {deliverable.selfCorrection.critiquedFlaws.map((flaw, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{flaw}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold flex items-center gap-1 mb-1">
                    <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                    Bản vá tự động áp dụng (Auto-Patching):
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {deliverable.selfCorrection.appliedPatches.map((patch, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{patch}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Clarification Box */}
        {deliverable?.clarificationQuestion && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-3.5 flex items-start gap-3 text-xs">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-amber-300 font-sans">
                Làm rõ thông tin (Active Clarification):
              </span>
              <p className="text-slate-200 font-sans">
                {deliverable.clarificationQuestion}
              </p>
            </div>
          </div>
        )}

        {/* Action Toolbar (Copy, Voice TTS, Thumbs & Token metric) */}
        <div className="flex items-center justify-between pt-2 border-t border-[#26282b] text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            {/* Copy button */}
            <button
              onClick={() => handleCopy(message.content)}
              className="p-1.5 rounded-lg hover:text-white hover:bg-[#282a2d] transition cursor-pointer"
              title="Sao chép toàn bộ"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Voice TTS Reader */}
            <button
              onClick={handleToggleSpeech}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isSpeaking
                  ? 'bg-blue-600/30 text-blue-300 hover:bg-blue-600/40'
                  : 'hover:text-white hover:bg-[#282a2d]'
              }`}
              title={isSpeaking ? 'Dừng đọc giọng nói' : 'Đọc phản hồi bằng giọng nói'}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4 text-blue-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Thumbs Up / Down */}
            <button
              className="p-1.5 rounded-lg hover:text-white hover:bg-[#282a2d] transition cursor-pointer"
              title="Phản hồi tốt"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 rounded-lg hover:text-white hover:bg-[#282a2d] transition cursor-pointer"
              title="Phản hồi chưa tốt"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>

          {metrics && (
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                {processorMode === 'ultra_turbo' ? '⚡ SIÊU TỐC' : '✦ QUANTUM LOGIC'}
              </span>
              {metrics.tokensPerSecond ? (
                <span className="text-amber-300 font-semibold">
                  ~{metrics.tokensPerSecond} t/s
                </span>
              ) : null}
              <span>{metrics.promptTokens} in • {metrics.completionTokens} out</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{metrics.latencyMs}ms</span>
              <span className="text-slate-500">•</span>
              <span className="flex items-center gap-1 text-yellow-400/90">
                <Zap className="w-3 h-3" />
                <span>Tiết kiệm ~{metrics.fluffTokensSaved}t</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

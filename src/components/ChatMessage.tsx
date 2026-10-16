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
  Clock,
  CheckCircle2,
  HelpCircle,
  Zap,
  Globe,
  ExternalLink,
  Cpu,
  Layers,
  Search,
} from 'lucide-react';
import { TommoMessage } from '../types/tommo.ts';

interface ChatMessageProps {
  message: TommoMessage;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
  const [isWebSourcesExpanded, setIsWebSourcesExpanded] = useState(true);

  const isUser = message.role === 'user';
  const deliverable = message.deliverable;
  const metrics = message.tokenMetrics;
  const stages = message.cognitiveStages;
  const webGrounding = message.webGrounding;
  const processorMode = message.processorMode || 'ultra_turbo';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-4 animate-fade-in">
        <div className="max-w-2xl rounded-3xl bg-[#282a2d] text-slate-100 px-5 py-3.5 text-sm font-sans leading-relaxed shadow-sm border border-white/5">
          {message.content}
        </div>
      </div>
    );
  }

  // Tommo Quantum Super AI Engine response
  return (
    <div className="flex gap-4 my-6 text-slate-200 animate-fade-in max-w-4xl mx-auto">
      {/* Tommo Quantum Engine Sparkle Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-500 flex items-center justify-center shrink-0 text-white mt-1 shadow-md ring-1 ring-cyan-500/30">
        <Sparkles className="w-4 h-4 text-white" />
      </div>

      <div className="flex-1 overflow-hidden space-y-4">
        {/* Thinking Accordion (5-Stage Quantum Simulation Trace) */}
        {stages && stages.length > 0 && (
          <div className="rounded-2xl border border-[#303236] bg-[#1a1b1d]/90 overflow-hidden shadow-sm">
            <button
              onClick={() => setIsThinkingExpanded(prev => !prev)}
              className="flex items-center justify-between w-full px-4 py-2.5 text-xs text-slate-300 hover:text-white transition font-sans cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-semibold text-slate-200">
                  Ma trận tư duy logic 5 chiều (Quantum Cognitive Simulation)
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
                {stages.map((stage) => (
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

            {/* Queries executed */}
            {webGrounding.queries && webGrounding.queries.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                  <Search className="w-3 h-3 text-cyan-400" />
                  Truy vấn đa vector:
                </span>
                {webGrounding.queries.map((q, qIdx) => (
                  <span
                    key={qIdx}
                    className="px-2 py-0.5 rounded-md bg-[#1e1f20] text-slate-300 text-[10.5px] border border-white/5 font-sans"
                  >
                    {q}
                  </span>
                ))}
              </div>
            )}

            {/* Sources grid */}
            {isWebSourcesExpanded && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {webGrounding.sources.map((source, sIdx) => (
                  <a
                    key={sIdx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between p-2 rounded-xl bg-[#1e1f20]/90 hover:bg-[#282a2d] border border-cyan-500/20 text-xs text-slate-300 hover:text-white transition shadow-sm"
                  >
                    <div className="overflow-hidden mr-2">
                      <div className="font-medium text-slate-200 truncate group-hover:text-cyan-300 font-sans text-[11.5px]">
                        {source.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {source.domain}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Deliverable Body */}
        <div className="space-y-4 text-sm leading-relaxed font-sans text-slate-200">
          {message.content.split('\n\n').map((block, i) => {
            // Code block rendering
            if (block.startsWith('```') || block.includes('```')) {
              const codeClean = block.replace(/```[a-zA-Z0-9_\-]*\n?|```/g, '').trim();
              const langMatch = block.match(/```([a-zA-Z0-9_\-]+)?/);
              const lang = langMatch ? langMatch[1] : 'typescript';

              return (
                <div key={i} className="my-3 rounded-2xl overflow-hidden border border-[#303236] bg-[#1e1f20]">
                  <div className="flex items-center justify-between px-4 py-2 bg-[#282a2d] border-b border-[#303236] text-xs font-mono text-slate-300">
                    <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                      <Terminal className="w-3.5 h-3.5" />
                      {lang}
                    </span>
                    <button
                      onClick={() => handleCopy(codeClean)}
                      className="flex items-center gap-1.5 text-slate-400 hover:text-white transition px-2 py-1 rounded hover:bg-[#34363a] cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Đã sao chép' : 'Sao chép mã'}</span>
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed bg-[#161719]">
                    <code>{codeClean}</code>
                  </pre>
                </div>
              );
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

        {/* Active Clarification Box (Section 6) */}
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

        {/* Action Toolbar (Copy, Thumbs, Processor Mode & Token metric) */}
        <div className="flex items-center justify-between pt-2 border-t border-[#26282b] text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleCopy(message.content)}
              className="p-1.5 rounded-lg hover:text-white hover:bg-[#282a2d] transition cursor-pointer"
              title="Sao chép toàn bộ"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
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

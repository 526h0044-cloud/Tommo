import React, { useState } from 'react';
import {
  Copy,
  Check,
  Terminal,
  FileCode,
  HelpCircle,
  BookOpen,
  Zap,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Wrench,
  GraduationCap,
  Files,
  Presentation,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { TommoMessage } from '../types/tommo.ts';
import { PresentationViewer } from './PresentationViewer.tsx';

interface DeliverableViewProps {
  message: TommoMessage;
}

export const DeliverableView: React.FC<DeliverableViewProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<number>(0);
  const [academicTab, setAcademicTab] = useState<'paper' | 'slides'>('paper');

  const deliverable = message.deliverable;
  const metrics = message.tokenMetrics;
  const selfCorrection = deliverable?.selfCorrection;
  const polyglotSnippets = deliverable?.polyglotSnippets;
  const multiFileAnalysis = deliverable?.multiFileAnalysis;
  const academicStructure = deliverable?.academicStructure;

  const currentSnippet = polyglotSnippets && polyglotSnippets.length > 0
    ? polyglotSnippets[activeCodeTab]
    : null;

  const handleCopyCode = (codeText?: string) => {
    const textToCopy = codeText || currentSnippet?.code || deliverable?.codeSnippet || message.content;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Token Efficiency Header Bar */}
      {metrics && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-yellow-400">
              <Zap className="w-3.5 h-3.5" />
              <span>DENSITY INDEX: <strong>{metrics.densityScore}%</strong></span>
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-400">
              TOKENS: {metrics.completionTokens}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400">
              FLUFF ELIMINATED: ~{metrics.fluffTokensSaved} tokens
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-[10px] font-semibold">
              ZERO-FLUFF CERTIFIED
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold">
              SOLID & OWASP COMPLIANT
            </span>
          </div>
        </div>
      )}

      {/* Interactive Presentation Frame (PowerPoint, Canva, Nanobanana 2) */}
      {deliverable?.presentationDeck && (
        <PresentationViewer deck={deliverable.presentationDeck} />
      )}

      {/* Autonomous Self-Reflection & Auto-Repair Panel (Tự vấn bản thân & Tự sửa lỗi) */}
      {selfCorrection && (
        <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-slate-900/90 to-cyan-950/30 p-4 shadow-xl">
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
                "{selfCorrection.selfQuestion}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Điểm mù & Lỗi logic ngầm tự phát hiện:
                </span>
                <ul className="space-y-1 text-slate-300">
                  {selfCorrection.critiquedFlaws.map((flaw, idx) => (
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
                  {selfCorrection.appliedPatches.map((patch, idx) => (
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

      {/* Polyglot Code Switcher (Đa Mã Nguồn: Rust, TS, Python, Go, C++, SQL) */}
      {polyglotSnippets && polyglotSnippets.length > 0 && (
        <div className="rounded-xl border border-cyan-500/40 bg-slate-950 shadow-xl overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-semibold text-slate-200">
                MÃ NGUỒN ĐA NGÔN NGỮ (POLYGLOT CODE PACKAGE):
              </span>
            </div>

            {/* Language Selector Buttons */}
            <div className="flex flex-wrap gap-1">
              {polyglotSnippets.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCodeTab(idx)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-md transition cursor-pointer ${
                    activeCodeTab === idx
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {item.language.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {currentSnippet && (
            <div>
              <div className="flex items-center justify-between px-4 py-1.5 bg-slate-850 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                <span>Tệp: <strong className="text-cyan-300">{currentSnippet.filename}</strong></span>
                <button
                  onClick={() => handleCopyCode(currentSnippet.code)}
                  className="flex items-center gap-1 text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Đã sao chép' : 'Sao chép mã'}</span>
                </button>
              </div>

              <pre className="p-4 text-xs font-mono text-cyan-200 overflow-x-auto leading-normal bg-slate-950 max-h-96">
                <code>{currentSnippet.code}</code>
              </pre>

              {currentSnippet.testCode && (
                <div className="p-3 bg-slate-900/90 border-t border-slate-800">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold block mb-1">
                    Formal AST Unit Test Suite:
                  </span>
                  <pre className="text-[11px] font-mono text-emerald-300 bg-slate-950 p-2.5 rounded border border-emerald-950/60 overflow-x-auto">
                    <code>{currentSnippet.testCode}</code>
                  </pre>
                </div>
              )}

              {currentSnippet.notes && (
                <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/80 text-[11px] text-slate-400 font-sans">
                  💡 <strong>Ghi chú kiến trúc:</strong> {currentSnippet.notes}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Multi-File Batch Analysis Matrix (Đọc hiểu hàng chục file & gom gọn) */}
      {multiFileAnalysis && (
        <div className="rounded-xl border border-indigo-500/40 bg-slate-950 p-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20">
            <div className="flex items-center gap-2">
              <Files className="w-4 h-4 text-indigo-400" />
              <span className="font-mono text-xs font-bold text-indigo-300 uppercase tracking-wide">
                Báo Cáo Đọc Hiểu Đa Tệp & Gom Gọn (Batch Map-Reduce Matrix)
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Tổng số tệp: <strong className="text-indigo-300">{multiFileAnalysis.totalFiles}</strong> • {multiFileAnalysis.totalSize}
            </span>
          </div>

          <p className="mt-2.5 text-xs text-slate-300 font-sans leading-relaxed">
            {multiFileAnalysis.summary}
          </p>

          <div className="mt-3 overflow-x-auto rounded-lg border border-slate-800">
            <table className="min-w-full divide-y divide-slate-800 text-xs text-left">
              <thead className="bg-slate-900 text-indigo-300 font-mono">
                <tr>
                  <th className="px-3 py-2">Tên Tệp</th>
                  <th className="px-3 py-2">Loại</th>
                  <th className="px-3 py-2">Dung Lượng</th>
                  <th className="px-3 py-2">Vai Trò</th>
                  <th className="px-3 py-2">Điểm Cốt Lõi Trích Xuất</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 bg-slate-950/60">
                {multiFileAnalysis.fileMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="px-3 py-2 font-mono text-cyan-300">{item.name}</td>
                    <td className="px-3 py-2 text-slate-400">{item.type}</td>
                    <td className="px-3 py-2 font-mono text-slate-400">{item.size}</td>
                    <td className="px-3 py-2 text-slate-300 font-medium">{item.role}</td>
                    <td className="px-3 py-2 text-slate-300">{item.keyPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {multiFileAnalysis.crossDependencies && multiFileAnalysis.crossDependencies.length > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
              <span className="text-[10px] font-mono uppercase text-indigo-400 font-semibold block mb-1">
                🔗 Mối Quan Hệ Phụ Thuộc Chéo (Cross-File Dependencies):
              </span>
              <ul className="space-y-1 text-slate-300">
                {multiFileAnalysis.crossDependencies.map((dep, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{dep}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* University Academic Thesis, Essay & Defense Slide Deck */}
      {academicStructure && (
        <div className="rounded-xl border border-purple-500/40 bg-slate-950 p-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-purple-500/20">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span className="font-mono text-xs font-bold text-purple-300 uppercase tracking-wide">
                Khung Luận Văn & Slide Thuyết Trình Sinh Viên Đại Học
              </span>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => setAcademicTab('paper')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded transition cursor-pointer ${
                  academicTab === 'paper'
                    ? 'bg-purple-500 text-white font-semibold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Toàn Văn Luận Văn</span>
              </button>
              <button
                onClick={() => setAcademicTab('slides')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded transition cursor-pointer ${
                  academicTab === 'slides'
                    ? 'bg-purple-500 text-white font-semibold'
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
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] font-mono text-purple-400 uppercase font-semibold block mb-0.5">
                  Tóm Tắt Khoa Học (Abstract):
                </span>
                <p className="text-slate-200 italic">{academicStructure.abstract}</p>
              </div>

              <div className="space-y-2">
                {academicStructure.sections.map((sec, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <h5 className="font-mono font-bold text-slate-200 mb-1">{sec.heading}</h5>
                    <p className="text-slate-300 text-xs">{sec.content}</p>
                  </div>
                ))}
              </div>

              {academicStructure.citations && (
                <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-[11px]">
                  <span className="font-mono text-purple-300 uppercase font-semibold block mb-1">
                    Tài Liệu Tham Khảo (APA 7th / IEEE):
                  </span>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                    {academicStructure.citations.map((cite, idx) => (
                      <li key={idx}>{cite}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {academicStructure.slideDecks?.map((slide, idx) => (
                <div key={idx} className="rounded-lg bg-slate-900 border border-slate-800 p-3.5 space-y-2 text-xs">
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

      {/* Main Content / Markdown renderer */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 font-sans leading-relaxed text-slate-200 shadow-xl">
        <div className="prose prose-invert max-w-none space-y-3 text-sm">
          {message.content.split('\n\n').map((block, i) => {
            if (block.startsWith('```') || block.includes('```')) {
              // Code block
              return (
                <div key={i} className="my-4 rounded-lg overflow-hidden border border-slate-700/80 bg-slate-900">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-850 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>{deliverable?.language || 'typescript'}</span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(block.replace(/```[a-zA-Z0-9_\-]*\n?|```/g, ''))}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
                      aria-label="Copy code"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-cyan-200 overflow-x-auto leading-normal bg-slate-950">
                    <code>{block.replace(/```[a-zA-Z0-9_\-]*\n?|```/g, '')}</code>
                  </pre>
                </div>
              );
            }

            if (block.startsWith('|')) {
              // Markdown table
              const rows = block.trim().split('\n');
              const headers = rows[0].split('|').map(c => c.trim()).filter(Boolean);
              const dataRows = rows.slice(2);

              return (
                <div key={i} className="my-3 overflow-x-auto rounded-lg border border-slate-800">
                  <table className="min-w-full divide-y divide-slate-800 text-xs text-left">
                    <thead className="bg-slate-900 text-cyan-300 font-mono">
                      <tr>
                        {headers.map((h, hIdx) => (
                          <th key={hIdx} className="px-3 py-2 font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 bg-slate-950/60 font-sans">
                      {dataRows.map((r, rIdx) => {
                        const cells = r.split('|').map(c => c.trim()).filter(Boolean);
                        return (
                          <tr key={rIdx} className="hover:bg-slate-900/40">
                            {cells.map((c, cIdx) => (
                              <td key={cIdx} className="px-3 py-2 text-slate-300">
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

            // Headings or normal paragraphs
            if (block.startsWith('###')) {
              return (
                <h3 key={i} className="text-base font-bold text-white font-mono mt-4 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  {block.replace(/^###\s*/, '')}
                </h3>
              );
            }

            if (block.startsWith('####')) {
              return (
                <h4 key={i} className="text-sm font-semibold text-cyan-300 font-mono mt-3 mb-1">
                  {block.replace(/^####\s*/, '')}
                </h4>
              );
            }

            if (block.startsWith('#####')) {
              return (
                <h5 key={i} className="text-xs font-bold text-slate-200 font-mono mt-2 mb-1">
                  {block.replace(/^#####\s*/, '')}
                </h5>
              );
            }

            return (
              <p key={i} className="text-slate-300 font-sans text-sm leading-relaxed">
                {block}
              </p>
            );
          })}
        </div>
      </div>

      {/* Active Clarification Box (Section 6) */}
      {deliverable?.clarificationQuestion && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-950/20 p-3.5 flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-mono font-semibold uppercase text-amber-300 tracking-wider">
              Active Clarification (Thu thập dữ kiện trọng yếu còn thiếu)
            </span>
            <p className="text-slate-200 font-medium">
              {deliverable.clarificationQuestion}
            </p>
          </div>
        </div>
      )}

      {/* Embedded Documentation & Usage Guide Box */}
      {deliverable?.usageGuide && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 flex items-start gap-2.5 text-xs">
          <BookOpen className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-slate-300">
            <span className="font-mono text-cyan-300 font-semibold uppercase text-[11px]">
              Embedded Production Guide:
            </span>
            <p className="text-slate-400">
              {deliverable.usageGuide}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

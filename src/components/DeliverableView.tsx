import React, { useState } from 'react';
import { Copy, Check, Terminal, FileCode, HelpCircle, BookOpen, Zap, ShieldCheck } from 'lucide-react';
import { TommoMessage } from '../types/tommo.ts';

interface DeliverableViewProps {
  message: TommoMessage;
}

export const DeliverableView: React.FC<DeliverableViewProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const deliverable = message.deliverable;
  const metrics = message.tokenMetrics;

  const handleCopyCode = () => {
    if (deliverable?.codeSnippet) {
      navigator.clipboard.writeText(deliverable.codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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

      {/* Main Content / Markdown renderer */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 font-sans leading-relaxed text-slate-200 shadow-xl">
        {/* Render markdown text */}
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
                      onClick={handleCopyCode}
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

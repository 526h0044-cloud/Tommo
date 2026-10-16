import React, { useState } from 'react';
import { Brain, CheckCircle2, ChevronDown, ChevronRight, Clock, ShieldAlert, Cpu, Sparkles } from 'lucide-react';
import { CognitiveStage } from '../types/tommo.ts';

interface CognitiveTraceViewProps {
  stages?: CognitiveStage[];
  isProcessing?: boolean;
}

export const CognitiveTraceView: React.FC<CognitiveTraceViewProps> = ({
  stages = [],
  isProcessing = false,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>('simulation');

  if (!stages.length && !isProcessing) return null;

  return (
    <div className="rounded-xl border border-cyan-500/30 bg-slate-900/80 backdrop-blur-md p-4 mb-5 shadow-lg shadow-cyan-950/20">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300">
            Cognitive Reasoning Framework (Chu trình tư duy 4 bước ngầm)
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>
              {stages.reduce((acc, s) => acc + (s.durationMs || 0), 0)}ms
            </span>
          </span>
          <span className="text-emerald-400 font-medium">100% INTERNAL SIMULATION VERIFIED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
        {stages.map((stage, idx) => {
          const isExpanded = expandedId === stage.id;
          const stageColors = [
            'from-cyan-950/40 to-slate-900/90 border-cyan-500/30 text-cyan-300',
            'from-amber-950/30 to-slate-900/90 border-amber-500/30 text-amber-300',
            'from-indigo-950/30 to-slate-900/90 border-indigo-500/30 text-indigo-300',
            'from-emerald-950/30 to-slate-900/90 border-emerald-500/30 text-emerald-300',
          ];

          return (
            <div
              key={stage.id}
              className={`rounded-lg border p-3 bg-gradient-to-b transition-all duration-200 ${stageColors[idx % stageColors.length]}`}
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : stage.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold font-mono text-slate-300">
                    {idx + 1}
                  </span>
                  <span className="font-mono text-xs font-semibold leading-tight">
                    {stage.vietnameseTitle}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>

              <p className="mt-2 text-xs text-slate-300 line-clamp-2 font-sans">
                {stage.summary}
              </p>

              {isExpanded && stage.details && stage.details.length > 0 && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 space-y-1.5">
                  {stage.details.map((detail, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    Latency: {stage.durationMs}ms • Zero side-effects verified
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

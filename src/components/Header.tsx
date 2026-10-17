import React from 'react';
import { Cpu, ShieldCheck, Zap, Activity, Layers, Terminal, Sparkles, CheckCircle2 } from 'lucide-react';
import { DomainMode } from '../types/tommo.ts';

interface HeaderProps {
  currentDomain: DomainMode;
  onSelectDomain: (domain: DomainMode) => void;
  showCognitiveTrace: boolean;
  onToggleCognitiveTrace: () => void;
  onOpenSecurityModal: () => void;
  totalFluffSaved: number;
  engineSource?: string;
  isProcessing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentDomain,
  onSelectDomain,
  showCognitiveTrace,
  onToggleCognitiveTrace,
  onOpenSecurityModal,
  totalFluffSaved,
  engineSource = 'gemini-3.8-flash',
  isProcessing = false,
}) => {
  const domains: Array<{ id: DomainMode; label: string; icon: React.ReactNode }> = [
    { id: 'software', label: 'Software Engineering', icon: <Terminal className="w-3.5 h-3.5" /> },
    { id: 'architecture', label: 'Systems Architecture', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'security', label: 'Security & Audit', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'science', label: 'Analytics & Math', icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Cpu className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-1.5">
                  TOMMO <span className="text-cyan-400">1.0</span>
                </h1>
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded border border-cyan-500/40 bg-cyan-950/60 text-cyan-300 font-semibold">
                  AUTONOMOUS SUPER ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans hidden sm:block">
                Universal Systems Architect • Zero-Fluff Protocol • 4-Stage Cognitive Reasoning
              </p>
            </div>
          </div>

          {/* Engine Telemetry & Controls */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 text-xs">
            {/* Status indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
              <Activity className={`w-3.5 h-3.5 ${isProcessing ? 'text-amber-400 animate-spin' : 'text-emerald-400'}`} />
              <span className="text-slate-400 font-normal">ENGINE:</span>
              <span className="font-semibold text-emerald-400">
                {isProcessing ? 'SYNTHESIZING' : 'ONLINE'}
              </span>
            </div>

            {/* Fluff Reduction Economy Counter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-slate-400 hidden xs:inline">FLUFF:</span>
              <span className="font-semibold text-yellow-400">+{totalFluffSaved}t</span>
            </div>

            {/* Cognitive Trace Toggle */}
            <button
              onClick={onToggleCognitiveTrace}
              className={`flex items-center justify-between sm:justify-start gap-1.5 px-2.5 py-1 rounded border font-mono transition-colors ${
                showCognitiveTrace
                  ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Xem chu trình tư duy 4 bước ngầm"
            >
              <div className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>TRACE</span>
              </div>
              <span className="text-[10px] px-1 rounded bg-slate-800 font-bold">
                {showCognitiveTrace ? 'ON' : 'OFF'}
              </span>
            </button>

          </div>
        </div>

        {/* Domain Navigation Bar */}
        <div className="mt-3 pt-3 border-t border-slate-850 flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
              DOMAIN:
            </span>
            {domains.map(d => (
              <button
                key={d.id}
                onClick={() => onSelectDomain(d.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  currentDomain === d.id
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                {d.icon}
                <span>{d.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span className="hidden sm:inline">CORE PHILOSOPHY:</span>
            <span className="text-cyan-400 font-medium">Trực diện • Không rườm rà • Tối ưu token</span>
          </div>
        </div>
      </div>
    </header>
  );
};

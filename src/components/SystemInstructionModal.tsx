import React from 'react';
import { X, BookOpen, ShieldCheck, Zap, Copy, Check } from 'lucide-react';
import { TOMMO_SYSTEM_INSTRUCTION } from '../utils/tommoEngine.ts';

interface SystemInstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemInstructionModal: React.FC<SystemInstructionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(TOMMO_SYSTEM_INSTRUCTION);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in select-none">
      <div className="relative w-full max-w-3xl rounded-2xl border border-[#303236] bg-[#18191b] p-6 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-[#282a2d]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white font-sans">
                Chỉ thị Kiến trúc Tommo 1.0 (Autonomous Super AI Engine)
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                6 Tiêu chuẩn Cốt lõi: Nhận diện, 4 Chu trình Tư duy, Kỹ thuật, Zero-Fluff & Bảo mật
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#282a2d] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 max-h-[65vh] overflow-y-auto pr-2 space-y-4 text-xs font-sans text-slate-300">
          <div className="p-4 rounded-xl bg-[#1e1f20] border border-[#2b2c2f] font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap text-blue-200 overflow-x-auto">
            {TOMMO_SYSTEM_INSTRUCTION}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-[#282a2d] flex items-center justify-between text-xs">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#282a2d] hover:bg-[#34363a] text-slate-200 transition font-sans"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Đã sao chép' : 'Sao chép System Instruction'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

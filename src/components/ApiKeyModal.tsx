import React, { useState } from 'react';
import { X, Key, Copy, Check, RefreshCw, ShieldCheck, Terminal, AlertCircle } from 'lucide-react';
import { validateTommoApiKey, generateTommoApiKey, maskTommoApiKey } from '../utils/tommoApiKey.ts';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onUpdateApiKey: (newKey: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onUpdateApiKey,
}) => {
  const [copied, setCopied] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    const newKey = generateTommoApiKey();
    onUpdateApiKey(newKey);
    setSuccessMsg('Đã tạo mới Tommo API Key thành công!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSaveCustomKey = () => {
    const trimmed = customKeyInput.trim();
    if (!validateTommoApiKey(trimmed)) {
      setErrorMsg('Định dạng không hợp lệ! Key phải có dạng tmm-xxxxxxxxxxxxxxxxxxxx (20 ký tự chữ hoa, chữ thường, số).');
      return;
    }
    setErrorMsg(null);
    onUpdateApiKey(trimmed);
    setCustomKeyInput('');
    setSuccessMsg('Đã lưu Tommo API Key mới thành công!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in select-none">
      <div className="relative w-full max-w-xl rounded-2xl border border-[#303236] bg-[#18191b] p-6 shadow-2xl text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#282a2d]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white font-sans">
                Quản lý Tommo API Key
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Định dạng chuẩn: <code className="text-blue-400 font-mono">tmm-xxxxxxxxxxxxxxxxxxxx</code> (20 ký tự chữ hoa, thường, số)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#282a2d] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current API Key Display */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase font-mono">
              Active Tommo API Key
            </label>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#1e1f20] border border-[#2b2c2f]">
              <code className="flex-1 font-mono text-xs text-blue-300 px-1 truncate select-all">
                {isRevealed ? apiKey : maskTommoApiKey(apiKey)}
              </code>

              <button
                onClick={() => setIsRevealed(prev => !prev)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded hover:bg-[#282a2d] transition"
              >
                {isRevealed ? 'Ẩn' : 'Hiện'}
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-[#2b2c2f] hover:bg-[#34363a] text-slate-200 rounded-lg transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>
          </div>

          {/* Quick Regenerate */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#202124] border border-[#2e3034]">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-slate-200">Tạo mã mới ngẫu nhiên</span>
              <p className="text-[11px] text-slate-400">Tự động sinh key mới chuẩn tmm-xxxxxxxxxxxxxxxxxxxx</p>
            </div>
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tạo Key mới</span>
            </button>
          </div>

          {/* Custom Key Input */}
          <div className="pt-2">
            <label className="block text-xs font-medium text-slate-400 mb-1.5 font-mono">
              Hoặc nhập Tommo API Key của bạn
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customKeyInput}
                onChange={e => {
                  setCustomKeyInput(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="tmm-Ab1Cd2Ef3Gh4Ij5Kl6Mn"
                className="flex-1 bg-[#1e1f20] border border-[#2b2c2f] rounded-xl px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSaveCustomKey}
                disabled={!customKeyInput.trim()}
                className="px-4 py-2 rounded-xl bg-[#2b2c2f] hover:bg-[#34363a] text-white text-xs font-medium disabled:opacity-40 transition"
              >
                Lưu Key
              </button>
            </div>
            {errorMsg && (
              <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1 font-sans">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}
            {successMsg && (
              <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1 font-sans">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{successMsg}</span>
              </p>
            )}
          </div>

          {/* SDK / cURL integration snippet */}
          <div className="pt-2">
            <span className="text-[11px] font-mono uppercase text-slate-400 mb-1.5 block">
              Tích hợp REST API (cURL Example)
            </span>
            <div className="p-3 rounded-xl bg-[#141517] border border-[#26282b] font-mono text-[11px] text-blue-300 overflow-x-auto">
              curl -X POST https://api.tommo.ai/v1/chat \<br />
              &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
              &nbsp;&nbsp;-H "x-tommo-api-key: {apiKey}" \<br />
              &nbsp;&nbsp;-d '{'{"prompt": "Thiết kế kiến trúc hệ thống"}'}'
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-[#282a2d] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#282a2d] hover:bg-[#34363a] text-slate-200 text-xs font-medium transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

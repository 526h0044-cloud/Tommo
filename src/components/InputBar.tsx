import React, { useRef, useEffect, useState } from 'react';
import {
  Paperclip,
  Mic,
  MicOff,
  ArrowUp,
  ChevronDown,
  Zap,
  Sparkles,
  FileCode,
  X,
} from 'lucide-react';
import { DomainMode, ProcessorEngineMode } from '../types/tommo.ts';

interface AttachedFile {
  name: string;
  size: number;
  content: string;
}

interface InputBarProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isProcessing?: boolean;
  domain: DomainMode;
  onSelectDomain: (d: DomainMode) => void;
  placeholder?: string;
  isHero?: boolean;
  processorMode?: ProcessorEngineMode;
  onToggleProcessorMode?: () => void;
}

export const InputBar: React.FC<InputBarProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  isProcessing = false,
  domain,
  onSelectDomain,
  placeholder = 'Hỏi Tommo 1.0...',
  isHero = false,
  processorMode = 'ultra_turbo',
  onToggleProcessorMode,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [value]);

  // Speech Recognition setup (Voice Input)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'vi-VN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript || '';
        if (transcript) {
          onChange(value ? `${value} ${transcript}` : transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [value, onChange]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói Web Speech.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Max 500KB per text file
      if (file.size > 500 * 1024) {
        alert(`Tệp "${file.name}" quá lớn (>500KB). Vui lòng chọn tệp nhỏ hơn.`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = event => {
        const content = event.target?.result as string;
        if (content) {
          setAttachedFiles(prev => [...prev, { name: file.name, size: file.size, content }]);
        }
      };
      reader.readAsText(file);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleFormSubmit = () => {
    if ((!value.trim() && attachedFiles.length === 0) || disabled || isProcessing) return;

    let finalPrompt = value.trim();
    if (attachedFiles.length > 0) {
      const filesContext = attachedFiles
        .map(
          f =>
            `\n\n--- [ĐÍNH KÈM TỆP: ${f.name}] ---\n\`\`\`\n${f.content}\n\`\`\``
        )
        .join('');
      finalPrompt = `${finalPrompt}${filesContext}`.trim();
      setAttachedFiles([]);
    }

    onChange(finalPrompt);
    setTimeout(() => {
      onSubmit();
    }, 10);
  };

  const totalAttachedSize = attachedFiles.reduce((acc, f) => acc + f.size, 0);

  return (
    <div
      className={`relative w-full rounded-3xl bg-[#1e1f20] border border-[#3c4043]/60 shadow-xl transition-all duration-200 focus-within:border-[#8ab4f8] focus-within:shadow-[0_0_24px_rgba(138,180,248,0.18)] ${
        isHero ? 'max-w-2xl mx-auto' : 'max-w-4xl mx-auto'
      }`}
    >
      {/* Attached Files Preview Bar */}
      {attachedFiles.length > 0 && (
        <div className="px-4 pt-3 pb-2 border-b border-[#2b2c2f] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
            <span className="flex items-center gap-1.5 font-semibold">
                <FileCode className="w-4 h-4 text-cyan-400" />
                Đã nạp {attachedFiles.length} tệp ({Math.round(totalAttachedSize / 1024)} KB) — Sẵn sàng phân tích gom gọn
              </span>
              <button
                type="button"
                onClick={() => setAttachedFiles([])}
                className="text-slate-400 hover:text-red-400 text-[11px] transition"
              >
                Xóa tất cả
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
              {attachedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#282a2d] border border-blue-500/30 text-blue-300 text-xs font-mono"
                >
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  <span className="text-[10px] text-slate-400">({Math.round(file.size / 1024)}KB)</span>
                  <button
                    type="button"
                    onClick={() => removeAttachedFile(idx)}
                    className="p-0.5 hover:text-white rounded transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center px-4 py-2.5 gap-2.5">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.ts,.tsx,.js,.jsx,.py,.json,.sql,.md,.html,.css,.yaml,.yml,.rs,.go,.cpp,.c,.java,.sh,.dockerfile,.csv,.tsv,.docx,.doc,.tex,.xml"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Attachment icon */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-[#2d2f31] transition shrink-0 cursor-pointer"
            title="Đính kèm hàng chục tệp mã nguồn (.ts, .py, .rs, .go, .sql, .md, .docx...)"
          >
            <Paperclip className="w-4 h-4" />
          </button>

        {/* Input Text Area */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-0 text-slate-100 placeholder-slate-400 text-sm focus:outline-none resize-none font-sans py-1 leading-relaxed max-h-40 no-scrollbar"
        />

        {/* Processor Turbo/Quantum Toggle */}
        {onToggleProcessorMode && (
          <button
            type="button"
            onClick={onToggleProcessorMode}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-mono transition cursor-pointer shrink-0 border ${
              processorMode === 'ultra_turbo'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
            }`}
            title="Chuyển chế độ bộ xử lý Tommo 1.0"
          >
            {processorMode === 'ultra_turbo' ? (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline text-[11px]">Siêu Tốc</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden md:inline text-[11px]">Quantum Deep</span>
              </>
            )}
          </button>
        )}

        {/* Domain / Model Selector Pill */}
        <div className="relative shrink-0 flex items-center hidden sm:flex">
          <select
            value={domain}
            onChange={e => onSelectDomain(e.target.value as DomainMode)}
            className="appearance-none bg-[#2b2c2f] hover:bg-[#34363a] text-slate-200 text-xs font-medium pl-3 pr-6 py-1.5 rounded-full border border-[#444746] cursor-pointer focus:outline-none transition"
            title="Chọn miền chuyên môn"
          >
            <option value="architecture">Kiến trúc (Arch)</option>
            <option value="software">Lập trình (Dev)</option>
            <option value="security">Bảo mật (OWASP)</option>
            <option value="science">Phân tích (Analytics)</option>
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
        </div>

        {/* Speech Recognition Voice Input */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`flex items-center justify-center w-8 h-8 rounded-full transition shrink-0 cursor-pointer ${
            isListening
              ? 'bg-red-500 text-white animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]'
              : 'text-slate-400 hover:text-white hover:bg-[#2d2f31]'
          }`}
          title={isListening ? 'Đang lắng nghe... Bấm để dừng' : 'Nhập lệnh bằng giọng nói'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Submit / Execute button */}
        <button
          type="button"
          onClick={handleFormSubmit}
          disabled={(!value.trim() && attachedFiles.length === 0) || disabled || isProcessing}
          className={`flex items-center justify-center w-8 h-8 rounded-full transition shrink-0 cursor-pointer ${
            (value.trim() || attachedFiles.length > 0) && !disabled && !isProcessing
              ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-md'
              : 'bg-[#2b2c2f] text-slate-500 cursor-not-allowed'
          }`}
          title="Gửi câu lệnh cho Tommo 1.0"
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};



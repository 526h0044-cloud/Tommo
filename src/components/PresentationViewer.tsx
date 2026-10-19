import React, { useState, useEffect, useRef } from 'react';
import {
  Presentation,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Copy,
  Check,
  Sparkles,
  Layers,
  FileText,
  Volume2,
  Palette,
  Monitor,
  LayoutGrid,
  Zap,
} from 'lucide-react';
import type { PresentationDeck, SlideItem } from '../types/tommo.ts';
import { exportDeckToPptxFile } from '../utils/slideGenerator.ts';

interface PresentationViewerProps {
  deck: PresentationDeck;
}

type ActiveTool = 'powerpoint' | 'canva' | 'nanobanana2';

export const PresentationViewer: React.FC<PresentationViewerProps> = ({ deck }) => {
  const [activeTool, setActiveTool] = useState<ActiveTool>('powerpoint');
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isAutoplay, setIsAutoplay] = useState<boolean>(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const autoplayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentSlide: SlideItem = deck.slides[currentSlideIndex] || deck.slides[0];
  const totalSlides = deck.slides.length;

  // Handle Autoplay
  useEffect(() => {
    if (isAutoplay) {
      autoplayTimerRef.current = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
      }, 5000);
    } else {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
    }
    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, [isAutoplay, totalSlides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSlides, isFullscreen]);

  // Export to Real PowerPoint
  const handleExportPowerPoint = async () => {
    try {
      setIsExporting(true);
      await exportDeckToPptxFile(deck);
      setCopiedStatus('Đã tạo và tải file .pptx!');
      setTimeout(() => setCopiedStatus(null), 3000);
    } catch (err) {
      console.error('Failed to export PPTX:', err);
      setCopiedStatus('Lỗi khi xuất PPTX');
      setTimeout(() => setCopiedStatus(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  // Open in Canva
  const handleOpenCanva = () => {
    const searchUrl = deck.canvaTemplateUrl || `https://www.canva.com/templates/?query=${encodeURIComponent(deck.topic)}+presentation`;
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };

  // Copy structured slide deck for Canva / Nanobanana
  const handleCopyDeckContent = () => {
    const text = deck.slides
      .map(
        (s) =>
          `=== SLIDE ${s.slideNumber}: ${s.title.toUpperCase()} ===\n` +
          (s.subtitle ? `Phụ đề: ${s.subtitle}\n` : '') +
          `Chuyên mục: ${s.category || 'Chung'}\n` +
          `Các ý chính:\n${s.bullets.map((b) => `  • ${b}`).join('\n')}\n` +
          (s.highlightText ? `Điểm nhấn: "${s.highlightText}"\n` : '') +
          `Lời thoại diễn giả: "${s.speakerNotes}"\n`
      )
      .join('\n----------------------------------------\n\n');

    navigator.clipboard.writeText(text);
    setCopiedStatus('Đã sao chép toàn bộ Slide!');
    setTimeout(() => setCopiedStatus(null), 2500);
  };

  // Accent gradient classes based on tool & slide
  const getToolThemeHeader = () => {
    switch (activeTool) {
      case 'powerpoint':
        return 'border-orange-500/40 bg-gradient-to-r from-orange-950/40 via-slate-900 to-amber-950/30';
      case 'canva':
        return 'border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-purple-950/40';
      case 'nanobanana2':
        return 'border-yellow-500/40 bg-gradient-to-r from-yellow-950/40 via-slate-900 to-emerald-950/40';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl border transition-all duration-300 shadow-2xl overflow-hidden ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none bg-slate-950 p-4 md:p-8 flex flex-col justify-between'
          : 'bg-slate-950 border-slate-800'
      }`}
    >
      {/* Top Header & Tool Switcher */}
      <div className={`p-4 border-b border-slate-800/80 ${getToolThemeHeader()}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-700/60 shadow-inner">
              <Presentation className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
                  Khung Trình Chiếu Đa Năng
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {deck.totalSlides} SLIDES HOÀN HẢO
                </span>
              </div>
              <h4 className="text-sm md:text-base font-bold text-white tracking-tight line-clamp-1">
                {deck.deckTitle}
              </h4>
            </div>
          </div>

          {/* 3 Tool Switcher Tabs: PowerPoint, Canva, Nanobanana 2 */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTool('powerpoint')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTool === 'powerpoint'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold shadow-md shadow-orange-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Chế độ xem Microsoft PowerPoint chuẩn 16:9"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>PowerPoint</span>
            </button>

            <button
              onClick={() => setActiveTool('canva')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTool === 'canva'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold shadow-md shadow-cyan-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Chế độ thiết kế trực quan phong cách Canva"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Canva</span>
            </button>

            <button
              onClick={() => setActiveTool('nanobanana2')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTool === 'nanobanana2'
                  ? 'bg-gradient-to-r from-yellow-500 to-emerald-600 text-slate-950 font-bold shadow-md shadow-yellow-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Chế độ Nanobanana 2 AI Slide Engine cực nhanh"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Nanobanana 2</span>
            </button>
          </div>
        </div>

        {/* Tool Banner & Quick Actions */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            {activeTool === 'powerpoint' && (
              <span className="flex items-center gap-1.5 text-orange-300">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                <strong>PowerPoint Mode:</strong> Bố cục chuẩn mực 16:9, xuất file .PPTX thật, tích hợp lời thoại diễn giả.
              </span>
            )}
            {activeTool === 'canva' && (
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <strong>Canva Mode:</strong> Phong cách đồ họa nghệ thuật, phối màu chuẩn Canva, hỗ trợ mở trực tiếp trên Canva.
              </span>
            )}
            {activeTool === 'nanobanana2' && (
              <span className="flex items-center gap-1.5 text-yellow-300">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                <strong>Nanobanana 2 Mode:</strong> Động cơ layout AI thế hệ mới, tối ưu hóa mật độ từ ngữ, không lỗi phông/form.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Export PPTX button */}
            <button
              onClick={handleExportPowerPoint}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 font-mono font-medium transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Đang tạo .PPTX...' : 'Xuất PowerPoint (.pptx)'}</span>
            </button>

            {/* Canva link */}
            <button
              onClick={handleOpenCanva}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono font-medium transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Mở Mẫu Trên Canva</span>
            </button>

            {/* Copy full deck */}
            <button
              onClick={handleCopyDeckContent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono transition cursor-pointer"
              title="Sao chép toàn bộ nội dung slide"
            >
              {copiedStatus ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedStatus || 'Sao chép Slide'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Slide Stage (16:9 Canvas) */}
      <div className="relative p-4 md:p-6 flex-1 flex flex-col justify-center items-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div
          className={`w-full max-w-4xl aspect-[16/9] rounded-2xl border shadow-2xl relative overflow-hidden flex flex-col justify-between p-6 md:p-10 transition-all duration-300 ${
            activeTool === 'powerpoint'
              ? 'bg-gradient-to-br from-slate-900 via-slate-920 to-slate-950 border-orange-500/30 ring-1 ring-orange-500/20'
              : activeTool === 'canva'
              ? 'bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-950 border-cyan-500/30 ring-1 ring-cyan-500/20'
              : 'bg-gradient-to-br from-slate-900 via-yellow-950/30 to-slate-950 border-yellow-500/30 ring-1 ring-yellow-500/20'
          }`}
          style={{
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          }}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Slide Top Metadata */}
          <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  currentSlide.accentColor === 'rose'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : currentSlide.accentColor === 'purple'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : currentSlide.accentColor === 'emerald'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : currentSlide.accentColor === 'amber'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : currentSlide.accentColor === 'blue'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                {currentSlide.category || 'CHUYÊN ĐỀ'}
              </span>

              {currentSlide.badge && (
                <span className="text-[11px] font-mono text-slate-400 border-l border-slate-700 pl-2">
                  {currentSlide.badge}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span>Trang {currentSlide.slideNumber} / {totalSlides}</span>
              <span className="text-slate-600">|</span>
              <span className="uppercase text-[10px] tracking-widest text-slate-500">
                {activeTool.toUpperCase()} ENGINE
              </span>
            </div>
          </div>

          {/* Slide Content Area — Beautiful Typography & Zero Overflow */}
          <div className="relative z-10 my-auto py-2 space-y-3">
            {/* Slide Title */}
            <div>
              <h2 className="text-xl md:text-3xl font-black tracking-tight text-white leading-tight">
                {currentSlide.title}
              </h2>
              {currentSlide.subtitle && (
                <p className="mt-1 text-xs md:text-sm text-slate-300/90 font-medium italic">
                  {currentSlide.subtitle}
                </p>
              )}
            </div>

            {/* Layout Specific Rendering */}
            {currentSlide.layout === 'kpi_metrics' && currentSlide.metrics ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {currentSlide.metrics.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col justify-center items-center text-center group hover:border-emerald-500/40 transition"
                    >
                      <span className="text-xl md:text-2xl font-black font-mono text-emerald-400 tracking-tight">
                        {m.value}
                      </span>
                      <span className="text-[11px] font-medium text-slate-300 mt-1 line-clamp-2 leading-tight">
                        {m.label}
                      </span>
                      {m.trend && (
                        <span className="text-[9px] font-mono text-emerald-500/80 mt-1">
                          ✓ {m.trend}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {currentSlide.bullets.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <ul className="space-y-1.5 text-xs text-slate-200">
                      {currentSlide.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold mt-0.5">•</span>
                          <span className="leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : currentSlide.layout === 'grid_3' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {currentSlide.bullets.map((bullet, idx) => {
                  const parts = bullet.split(':');
                  const heading = parts.length > 1 ? parts[0] : `Luận Điểm ${idx + 1}`;
                  const body = parts.length > 1 ? parts.slice(1).join(':') : bullet;

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-900/90 border border-purple-500/30 shadow-md space-y-1.5 hover:border-purple-500/60 transition"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-300">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>{heading.trim()}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {body.trim()}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : currentSlide.layout === 'timeline' ? (
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {currentSlide.bullets.map((bullet, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-900/90 border border-blue-500/30 flex items-start gap-2.5"
                    >
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold shrink-0 mt-0.5">
                        BƯỚC {idx + 1}
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed">{bullet}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Standard / Split / Title Layout */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className={currentSlide.highlightText ? 'md:col-span-8' : 'md:col-span-12'}>
                  <ul className="space-y-2 text-xs md:text-sm text-slate-200">
                    {currentSlide.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                        <span
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            currentSlide.accentColor === 'rose'
                              ? 'bg-rose-400'
                              : currentSlide.accentColor === 'purple'
                              ? 'bg-purple-400'
                              : currentSlide.accentColor === 'emerald'
                              ? 'bg-emerald-400'
                              : 'bg-cyan-400'
                          }`}
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {currentSlide.highlightText && (
                  <div className="md:col-span-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-inner space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                      💡 Điểm Nhấn Chiến Lược
                    </span>
                    <p className="text-xs text-slate-200 italic font-medium leading-relaxed">
                      "{currentSlide.highlightText}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Slide Footer */}
          <div className="relative z-10 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">{deck.author}</span>
              <span className="text-slate-600">•</span>
              <span>{deck.dateStr}</span>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
              <span>Chuẩn Bố Cục 16:9</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400">Zero Typo Glitch</span>
            </div>
          </div>
        </div>

        {/* Slide Navigation & Playback Controls Bar */}
        <div className="w-full max-w-4xl mt-3 flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentSlideIndex === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              title="Slide trước (Phím Mũi Tên Trái)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 font-mono font-bold text-slate-200">
              {currentSlideIndex + 1} / {totalSlides}
            </span>

            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.min(totalSlides - 1, prev + 1))}
              disabled={currentSlideIndex === totalSlides - 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              title="Slide kế tiếp (Phím Mũi Tên Phải)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Autoplay & Notes Toggle & Fullscreen */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsAutoplay(!isAutoplay)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                isAutoplay
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Tự động chuyển slide sau 5 giây"
            >
              {isAutoplay ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAutoplay ? 'Tạm Dừng' : 'Tự Động'}</span>
            </button>

            <button
              onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                showSpeakerNotes
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Bật / Tắt lời thoại diễn giả"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Lời Thoại Diễn Giả</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình trình chiếu (F5)'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Thumbnail Filmstrip Selector */}
        <div className="w-full max-w-4xl mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {deck.slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`shrink-0 w-24 md:w-32 aspect-[16/9] rounded-lg p-1.5 border text-left transition-all cursor-pointer flex flex-col justify-between ${
                currentSlideIndex === idx
                  ? 'border-amber-400 bg-slate-850 ring-2 ring-amber-400/40 scale-105'
                  : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                <span className="font-bold">SLIDE {slide.slideNumber}</span>
                <span className="text-[8px] uppercase">{slide.layout}</span>
              </div>
              <p className="text-[10px] font-semibold text-slate-200 line-clamp-1">
                {slide.title}
              </p>
            </button>
          ))}
        </div>

        {/* Speaker Notes Drawer (Lời thoại diễn giả) */}
        {showSpeakerNotes && currentSlide.speakerNotes && (
          <div className="w-full max-w-4xl mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-1 text-xs">
            <div className="flex items-center justify-between text-cyan-400 font-mono text-[11px] font-bold">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                Lời Thoại Thuyết Trình Diễn Giả (Speaker Script — Slide {currentSlide.slideNumber}):
              </span>
              <span className="text-slate-500 font-normal">Đọc tự nhiên, tự tin, nhấn nhá</span>
            </div>
            <p className="text-slate-200 italic leading-relaxed pl-5 border-l-2 border-cyan-500/50">
              "{currentSlide.speakerNotes}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

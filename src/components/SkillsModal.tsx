import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Zap,
  Shield,
  Layers,
  Code2,
  Database,
  Globe,
  GraduationCap,
  RefreshCw,
  GitBranch,
  Search,
  CheckCircle2,
  ArrowRight,
  Cpu,
  Lock,
  Flame,
} from 'lucide-react';
import { TOMMO_ALL_SKILLS, TommoSkill, SkillCategory } from '../utils/tommoSkills.ts';
import { DomainMode } from '../types/tommo.ts';

interface SkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSkillPrompt: (prompt: string, domain: DomainMode) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  architecture: <Layers className="w-4 h-4 text-cyan-400" />,
  software: <Code2 className="w-4 h-4 text-emerald-400" />,
  security: <Shield className="w-4 h-4 text-red-400" />,
  intelligence: <Cpu className="w-4 h-4 text-purple-400" />,
  data: <Database className="w-4 h-4 text-teal-400" />,
  academic: <GraduationCap className="w-4 h-4 text-amber-400" />,
};

const skillIcons: Record<number, React.ReactNode> = {
  1: <Layers className="w-5 h-5 text-cyan-400" />,
  2: <Code2 className="w-5 h-5 text-emerald-400" />,
  3: <Zap className="w-5 h-5 text-amber-400" />,
  4: <Lock className="w-5 h-5 text-red-400" />,
  5: <Globe className="w-5 h-5 text-blue-400" />,
  6: <Database className="w-5 h-5 text-teal-400" />,
  7: <Flame className="w-5 h-5 text-indigo-400" />,
  8: <GraduationCap className="w-5 h-5 text-purple-400" />,
  9: <RefreshCw className="w-5 h-5 text-emerald-400" />,
  10: <GitBranch className="w-5 h-5 text-sky-400" />,
};

export const SkillsModal: React.FC<SkillsModalProps> = ({
  isOpen,
  onClose,
  onSelectSkillPrompt,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSkillId, setActiveSkillId] = useState<string>(TOMMO_ALL_SKILLS[0].id);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: TOMMO_ALL_SKILLS.length,
      architecture: 0,
      software: 0,
      security: 0,
      intelligence: 0,
      data: 0,
      academic: 0,
    };
    for (const skill of TOMMO_ALL_SKILLS) {
      if (counts[skill.category] !== undefined) {
        counts[skill.category]++;
      }
    }
    return counts;
  }, []);

  const filteredSkills = useMemo(() => {
    return TOMMO_ALL_SKILLS.filter(skill => {
      const matchesCategory =
        selectedCategory === 'all' || skill.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        skill.name.toLowerCase().includes(query) ||
        skill.vietnameseTitle.toLowerCase().includes(query) ||
        skill.summary.toLowerCase().includes(query) ||
        skill.badge.toLowerCase().includes(query) ||
        skill.protocols.some(p => p.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const activeSkill = useMemo(() => {
    return (
      TOMMO_ALL_SKILLS.find(s => s.id === activeSkillId) ||
      filteredSkills[0] ||
      TOMMO_ALL_SKILLS[0]
    );
  }, [activeSkillId, filteredSkills]);

  if (!isOpen) return null;

  const handleExecutePrompt = (skill: TommoSkill) => {
    onSelectSkillPrompt(skill.samplePrompt, skill.domain);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[850px] flex flex-col rounded-2xl border border-[#303236] bg-[#141517] shadow-2xl text-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#26282b] bg-[#17181b]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white font-sans">
                  Bộ Ma Trận 110 Siêu Kỹ Năng Toàn Năng
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 font-mono font-medium border border-emerald-500/30">
                  +50 Kỹ Năng Siêu Cấp Mới (Tier 5 Supreme)
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Tích hợp 110 khối năng lực kỹ thuật, mật mã lượng tử, kiến trúc phân tán, AI tự chủ, khoa học và giải thuật tối thượng
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#282a2d] transition cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3 border-b border-[#232427] bg-[#151619]">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar py-0.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium font-sans whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#202124]'
              }`}
            >
              Tất cả ({categoryCounts.all})
            </button>
            <button
              onClick={() => setSelectedCategory('architecture')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-sans whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'architecture'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#202124]'
              }`}
            >
              {categoryIcons.architecture}
              <span>Kiến Trúc & Đám Mây ({categoryCounts.architecture})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('software')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-sans whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'software'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#202124]'
              }`}
            >
              {categoryIcons.software}
              <span>Phần Mềm & Biên Dịch ({categoryCounts.software})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('security')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-sans whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'security'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#202124]'
              }`}
            >
              {categoryIcons.security}
              <span>An Ninh & Mật Mã ({categoryCounts.security})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('intelligence')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-sans whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'intelligence'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#202124]'
              }`}
            >
              {categoryIcons.intelligence}
              <span>Trí Tuệ & Multi-Agent ({categoryCounts.intelligence})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('data')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-sans whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'data'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#202124]'
              }`}
            >
              {categoryIcons.data}
              <span>Dữ Liệu & Phân Tích ({categoryCounts.data})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('academic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-sans whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'academic'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#202124]'
              }`}
            >
              {categoryIcons.academic}
              <span>Học Thuật & Đa Phương Tiện ({categoryCounts.academic})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm kỹ năng, giao thức..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#1a1b1e] border border-[#2e3034] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition font-sans"
            />
          </div>
        </div>

        {/* Modal Main Body (Split View: List & Deep Detail) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Column: Skill Cards List (5 cols) */}
          <div className="md:col-span-5 border-r border-[#242629] overflow-y-auto p-3 space-y-2 custom-scrollbar bg-[#121315]">
            {filteredSkills.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-sans">
                Không tìm thấy kỹ năng phù hợp với từ khóa "{searchQuery}"
              </div>
            ) : (
              filteredSkills.map(skill => {
                const isSelected = skill.id === activeSkill.id;
                return (
                  <div
                    key={skill.id}
                    onClick={() => setActiveSkillId(skill.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'border-blue-500/50 bg-[#1e2024] shadow-md'
                        : 'border-[#232528] bg-[#161719] hover:bg-[#1b1c1f] hover:border-[#323438]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-lg bg-[#141517] border border-[#282a2d] shrink-0 mt-0.5">
                        {skillIcons[skill.number] || categoryIcons[skill.category] || <Zap className="w-4 h-4 text-blue-400" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-100 font-sans truncate">
                            #{String(skill.number).padStart(2, '0')}. {skill.vietnameseTitle}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 font-sans line-clamp-2 leading-relaxed">
                          {skill.summary}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#131416] border border-[#2b2d31] text-cyan-400 font-mono">
                            {skill.badge}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {skill.masteryTier}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Active Skill Detailed Showcase (7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-between overflow-y-auto p-5 sm:p-6 custom-scrollbar bg-[#161719]">
            {activeSkill && (
              <div className="space-y-5">
                {/* Skill Header */}
                <div className="border-b border-[#282a2d] pb-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-mono font-medium border border-blue-500/30">
                      KỸ NĂNG #{String(activeSkill.number).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                      {activeSkill.categoryLabel}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/25 ml-auto">
                      {activeSkill.masteryTier}
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-white font-sans mt-1">
                    {activeSkill.vietnameseTitle}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {activeSkill.name}
                  </p>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-2">
                    Tổng Quan Năng Lực
                  </h4>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed bg-[#1b1c20] p-3.5 rounded-xl border border-[#2a2c30]">
                    {activeSkill.description}
                  </p>
                </div>

                {/* Core Protocols (4 items) */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Quy Chuẩn Kỹ Thuật Độc Quyền (Protocols)</span>
                  </h4>
                  <div className="space-y-2">
                    {activeSkill.protocols.map((protocol, pIdx) => (
                      <div
                        key={pIdx}
                        className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#18191c] border border-[#27292d] text-xs text-slate-200 font-sans"
                      >
                        <span className="text-cyan-400 font-mono font-bold text-[11px] shrink-0 mt-0.5">
                          0{pIdx + 1}.
                        </span>
                        <span>{protocol}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benchmark Specifications */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/20 via-blue-950/20 to-purple-950/20 border border-emerald-500/20 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-emerald-400 block font-semibold">
                      Chỉ Số Đảm Bảo (SLA Benchmark)
                    </span>
                    <span className="text-xs text-slate-200 font-sans">
                      {activeSkill.benchmarks}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 shrink-0">
                    PASSED 100%
                  </span>
                </div>

                {/* Sample Prompt Box */}
                <div className="pt-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-2">
                    Mẫu Truy Vấn Kỹ Thuật Khởi Động
                  </h4>
                  <div className="p-3 rounded-xl bg-[#121315] border border-[#25272a] text-xs font-mono text-slate-300 leading-relaxed break-words">
                    "{activeSkill.samplePrompt}"
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Action Footer */}
            {activeSkill && (
              <div className="pt-6 mt-6 border-t border-[#26282b] flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 font-sans">
                  Sử dụng động cơ nơ-ron Tommo 1.0 thực thi ngay
                </span>

                <button
                  onClick={() => handleExecutePrompt(activeSkill)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold transition cursor-pointer shadow-md hover:shadow-blue-500/20"
                >
                  <span>Thực thi kỹ năng này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

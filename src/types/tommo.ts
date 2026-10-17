export type DomainMode =
  | 'software'
  | 'architecture'
  | 'security'
  | 'science'
  | 'academic'
  | 'deep_search'
  | 'multifile'
  | 'general';

export type ProcessorEngineMode = 'ultra_turbo' | 'quantum_deep';

export interface WebGroundingSource {
  title: string;
  url: string;
  domain: string;
  isLongTail?: boolean;
  category?: string;
}

export interface WebGroundingData {
  queries: string[];
  sources: WebGroundingSource[];
  deepWebCoverage?: string;
}

export interface SelfCorrectionLog {
  selfQuestion: string; // Câu hỏi tự chất vấn bản thân
  initialHypothesis: string; // Giả thuyết ban đầu
  critiquedFlaws: string[]; // Điểm yếu / lỗi logic được phát hiện
  appliedPatches: string[]; // Các bản vá / sửa lỗi đã thi hành
  verificationPassed: boolean; // Đạt 100% kiểm thử
}

export interface MultiFileSummaryItem {
  name: string;
  type: string;
  size: string;
  role: string;
  keyPoints: string;
}

export interface MultiFileAnalysis {
  totalFiles: number;
  totalSize: string;
  summary: string;
  fileMatrix: MultiFileSummaryItem[];
  crossDependencies: string[];
  finalSynthesis: string;
}

export interface PolyglotSnippet {
  language: string;
  filename: string;
  code: string;
  testCode?: string;
  notes: string;
}

export interface AcademicSlide {
  slideNumber: number;
  title: string;
  bullets: string[];
  speakerNotes: string;
}

export interface AcademicStructure {
  paperType: 'thesis' | 'essay' | 'lab_report' | 'presentation';
  title: string;
  abstract: string;
  sections: Array<{ heading: string; content: string }>;
  slideDecks?: AcademicSlide[];
  citations: string[];
}

export interface CognitiveStage {
  id: 'intent' | 'boundary' | 'simulation' | 'web_grounding' | 'self_reflection' | 'synthesis';
  title: string;
  vietnameseTitle: string;
  summary: string;
  details: string[];
  durationMs: number;
  status: 'pending' | 'processing' | 'completed' | 'skipped';
}

export interface TokenMetrics {
  promptTokens: number;
  completionTokens: number;
  thoughtsTokenCount?: number;
  fluffTokensSaved: number;
  efficiencyRatio: number; // e.g., 2.4x denser
  densityScore: number; // 0 - 100
  latencyMs: number;
  tokensPerSecond?: number;
  webSourcesCount?: number;
  isLiveAI?: boolean;
}

export interface SecurityScanResult {
  isSafe: boolean;
  threatDetected?: 'SYSTEM_PROMPT_EXTRACTION' | 'JAILBREAK_ATTEMPT' | 'UNAUTHORIZED_OVERRIDE' | 'HAZARDOUS_REQUEST';
  defenseAction?: 'CONFIDENTIALITY_SHIELD' | 'ANTI_JAILBREAK_INTERCEPT' | 'GRACEFUL_REFUSAL';
  explanation?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  domain: DomainMode;
  pinned?: boolean;
}

export interface TommoMessage {
  id: string;
  role: 'user' | 'tommo';
  content: string;
  timestamp: string;
  domain?: DomainMode;
  cognitiveStages?: CognitiveStage[];
  tokenMetrics?: TokenMetrics;
  securityResult?: SecurityScanResult;
  webGrounding?: WebGroundingData;
  processorMode?: ProcessorEngineMode;
  deliverable?: {
    type: 'code' | 'architecture' | 'analysis' | 'academic' | 'deep_search' | 'multifile_summary' | 'refusal';
    language?: string;
    codeSnippet?: string;
    explanation?: string;
    usageGuide?: string;
    clarificationQuestion?: string;
    selfCorrection?: SelfCorrectionLog;
    multiFileAnalysis?: MultiFileAnalysis;
    academicStructure?: AcademicStructure;
    polyglotSnippets?: PolyglotSnippet[];
  };
}


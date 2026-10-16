export type DomainMode = 'software' | 'architecture' | 'security' | 'science' | 'general';

export type ProcessorEngineMode = 'ultra_turbo' | 'quantum_deep';

export interface WebGroundingSource {
  title: string;
  url: string;
  domain: string;
}

export interface WebGroundingData {
  queries: string[];
  sources: WebGroundingSource[];
}

export interface CognitiveStage {
  id: 'intent' | 'boundary' | 'simulation' | 'web_grounding' | 'synthesis';
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
    type: 'code' | 'architecture' | 'analysis' | 'refusal';
    language?: string;
    codeSnippet?: string;
    explanation?: string;
    usageGuide?: string;
    clarificationQuestion?: string;
  };
}

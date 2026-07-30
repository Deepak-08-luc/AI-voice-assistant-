export type ActiveTab = 'core' | 'live_display' | 'terminal' | 'diagnostics' | 'tree';

export interface LiveDisplayCard {
  id: string;
  query: string;
  response: string;
  timestamp: string;
  category?: 'general' | 'code' | 'weather' | 'system' | 'creative' | 'math' | 'screen';
  suggestedFollowUps?: string[];
  imagePreviewUrl?: string;
}

export interface ScreenMonitorState {
  isSharing: boolean;
  status: 'inactive' | 'permission_granted' | 'capturing' | 'analyzing' | 'error';
  lastFrameSnapshotUrl: string | null;
  autoAnalyzeIntervalSec: number;
  errorMessage?: string;
  autoAnalyzeEnabled: boolean;
}

export interface SystemMetrics {
  cpuLoad: number;
  memoryUsage: number;
  tempCelsius: number;
  firewallStatus: string;
  satelliteSignal: string;
  uplinkLatencyMs: number;
  gpuUsage: number;
  activeThreads: number;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  time: string;
  location: string;
  type: 'synthesis' | 'meeting' | 'sync' | 'protocol';
  priority: 'HIGH' | 'NOMINAL' | 'CRITICAL';
}

export interface FirewallLog {
  id: string;
  timestamp: string;
  sourceIp: string;
  action: 'BLOCKED' | 'ALLOWED' | 'INSPECTED';
  threatLevel: 'LOW' | 'MED' | 'HIGH';
  protocol: string;
}

export interface TerminalEntry {
  id: string;
  timestamp: string;
  type: 'input' | 'output' | 'system' | 'error' | 'ai';
  text: string;
}

export interface NeuralNode {
  id: string;
  label: string;
  category: 'core' | 'perception' | 'telemetry' | 'security' | 'exec';
  status: 'OPTIMAL' | 'BUSY' | 'SYNCING' | 'IDLE';
  loadPercent: number;
  subModules: string[];
  description: string;
}

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  activePrompt: string;
  interimTranscript: string;
  lastResponse: string;
  voiceRate: number;
  voicePitch: number;
  voiceVolume: number;
  synthesisStatusText: string;
  micPermissionState: 'prompt' | 'granted' | 'denied' | 'unsupported';
  micErrorMessage?: string;
  speechEngineType: 'web_speech' | 'media_recorder' | 'manual';
  isCasualSpeakerMode?: boolean;
  handsFreeContinuous?: boolean;
  autoTriggerEnabled?: boolean;
  voiceGender: 'male' | 'female';
  language?: 'en-US' | 'te-IN';
}

export interface GPSLocation {
  lat: number;
  lng: number;
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  status: 'IDLE' | 'REQUESTING' | 'LOCKED' | 'DENIED' | 'ERROR';
  addressName: string;
  timestamp: string | null;
  errorMessage?: string;
  source?: 'BUILT_IN_DEVICE_GPS' | 'NETWORK';
}

export interface SessionState {
  sessionId: string;
  isResuming: boolean;
  tier: 'PRO_ENTERPRISE_HIGH_THROUGHPUT';
  maxOutputTokens: number; // 65536
  compressionEnabled: boolean;
  compressionRatio: string;
  compressedContextSummary: string;
  slidingWindowSize?: number;
  sessionStartedAt: string;
  lastActiveAt: string;
}


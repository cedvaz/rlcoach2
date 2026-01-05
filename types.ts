export enum ViewState {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  TRACKER = 'TRACKER',
  CHAT = 'CHAT',
  ANALYSIS = 'ANALYSIS',
  SETTINGS = 'SETTINGS'
}

export enum EnergyLevel {
  DRAINED = -1,
  NEUTRAL = 0,
  CHARGED = 1
}

export enum LogSource {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL'
}

export interface DailyLog {
  id: string;
  date: string;
  timestamp: number;
  rating: number;
  source: LogSource;
  energy: EnergyLevel;
  redFlag: boolean;
  vision: boolean;
  note: string;
  calculatedScore: number;
}

export interface ToxicAnalysis {
  gaslighting_score: number;
  control_score: number;
  volatility_score: number;
  summary_text: string;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
}

export interface UserProfile {
  name: string;
  partnerName: string;
  relationshipDuration: string;
  isOnboarded: boolean;
  isPremium: boolean;
  clarityPoints: number;
  level: number;
  toxicAnalysis?: ToxicAnalysis;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ClarityMetrics {
  currentScore: number;
  trend: 'up' | 'down' | 'stable';
  avgMood: number;
  redFlagCount: number;
  internalExternalSplit: number;
}
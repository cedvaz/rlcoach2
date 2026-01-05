import { DailyLog, UserProfile, ChatMessage, ToxicAnalysis } from '../types';

const KEYS = {
  USER: 'mara_user_v1',
  LOGS: 'mara_logs_v1',
  CHAT: 'mara_chat_v1'
};

export const getLogs = (): DailyLog[] => {
  const data = localStorage.getItem(KEYS.LOGS);
  if (!data) return [];
  try {
    return JSON.parse(data).sort((a: DailyLog, b: DailyLog) => b.timestamp - a.timestamp);
  } catch (e) {
    return [];
  }
};

export const saveLog = (log: DailyLog): DailyLog[] => {
  const logs = getLogs();
  // Filter existing log for the same date to allow updates
  const filtered = logs.filter(l => l.date !== log.date);
  const updated = [log, ...filtered].sort((a, b) => b.timestamp - a.timestamp);
  localStorage.setItem(KEYS.LOGS, JSON.stringify(updated));
  return updated;
};

export const getUser = (): UserProfile | null => {
  const data = localStorage.getItem(KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const saveUser = (user: UserProfile): void => {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
};

export const saveToxicAnalysis = (analysis: ToxicAnalysis): void => {
  const user = getUser();
  if (user) {
    const updatedUser = { ...user, toxicAnalysis: analysis, clarityPoints: user.clarityPoints + 200 };
    saveUser(updatedUser);
  }
};

export const getChatHistory = (): ChatMessage[] => {
  const data = localStorage.getItem(KEYS.CHAT);
  return data ? JSON.parse(data) : [];
};

export const saveChatHistory = (messages: ChatMessage[]): void => {
  localStorage.setItem(KEYS.CHAT, JSON.stringify(messages));
};

export const calculateDailyScore = (
  rating: number,
  energy: number,
  vision: boolean,
  redFlag: boolean,
  sourceIsExternal: boolean
): number => {
  // Base Score Calculation according to PRD
  let score = 30 + (rating * 4) + (energy * 10) + (vision ? 20 : 0);
  
  // Red Flag Penalty (-30%)
  if (redFlag) score = score * 0.7;
  
  // Attribution Filter: If mood is low but caused by external factors, 
  // we reduce the impact on the relationship score
  if (rating < 5 && sourceIsExternal && !redFlag) {
    score = score * 1.2; // Mitigation
  }
  
  return Math.min(100, Math.max(0, Math.round(score)));
};
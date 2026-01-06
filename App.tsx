import React, { useState, useEffect } from 'react';
import { ViewState, UserProfile, DailyLog, ChatMessage, ChatSession } from './types';
import { getUser, getLogs, getChatSessions, getActiveSessionId, setActiveSessionId } from './services/storageService';
import { Onboarding } from './views/Onboarding';
import { Dashboard } from './views/Dashboard';
import { Tracker } from './views/Tracker';
import { Chat } from './views/Chat';
import { Analysis } from './views/Analysis';
import { Navigation } from './components/Navigation';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.ONBOARDING);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(null);
  const [targetDate, setTargetDate] = useState<string | undefined>(undefined);

  const refreshUser = () => {
    const existingUser = getUser();
    setUser(existingUser);
  };

  useEffect(() => {
    const existingUser = getUser();
    const existingLogs = getLogs();
    const existingSessions = getChatSessions();
    const lastActiveId = getActiveSessionId();

    if (existingUser && existingUser.isOnboarded) {
      setUser(existingUser);
      setLogs(existingLogs);
      setChatSessions(existingSessions);
      setActiveSessionIdState(lastActiveId);
      setView(ViewState.DASHBOARD);
    } else {
      setView(ViewState.ONBOARDING);
    }
  }, []);

  const handleUpdateActiveSessionId = (id: string | null) => {
    setActiveSessionIdState(id);
    setActiveSessionId(id);
  };

  const handleUpdateSessions = (updatedSessions: ChatSession[]) => {
    setChatSessions(updatedSessions);
  };

  const handleOnboardingComplete = (newUser: UserProfile) => {
    setUser(newUser);
    setView(ViewState.DASHBOARD);
  };

  const refreshLogs = () => {
    const updatedLogs = getLogs();
    setLogs(updatedLogs);
    if (user) {
      const updatedUser = { ...user, clarityPoints: user.clarityPoints + 10 };
      setUser(updatedUser);
      localStorage.setItem('mara_user_v1', JSON.stringify(updatedUser));
    }
  };

  const handleNavigateToTracker = (date?: string) => {
    setTargetDate(date);
    setView(ViewState.TRACKER);
  };

  const calculateMetrics = () => {
    if (logs.length === 0) return { currentScore: 0, trend: 'stable' };
    const recentLogs = logs.slice(0, 14);
    const avgScore = Math.round(recentLogs.reduce((acc, log) => acc + log.calculatedScore, 0) / recentLogs.length);
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (recentLogs.length > 3) {
      const recentAvg = logs.slice(0, 3).reduce((acc, l) => acc + l.calculatedScore, 0) / 3;
      const olderAvg = logs.slice(3, 6).reduce((acc, l) => acc + l.calculatedScore, 0) / 3;
      if (recentAvg > olderAvg + 5) trend = 'up';
      if (recentAvg < olderAvg - 5) trend = 'down';
    }
    return { currentScore: avgScore, trend };
  };

  const renderView = () => {
    switch (view) {
      case ViewState.ONBOARDING:
        return <Onboarding onComplete={handleOnboardingComplete} />;
      case ViewState.TRACKER:
        return (
          <Tracker
            initialDate={targetDate}
            onComplete={() => { refreshLogs(); setView(ViewState.DASHBOARD); setTargetDate(undefined); }}
            onCancel={() => { setView(ViewState.DASHBOARD); setTargetDate(undefined); }}
          />
        );
      case ViewState.CHAT:
        return (
          <Chat
            logs={logs}
            sessions={chatSessions}
            activeSessionId={activeSessionId}
            onUpdateSessions={handleUpdateSessions}
            onActiveSessionChange={handleUpdateActiveSessionId}
            onRefreshUser={refreshUser}
          />
        );
      case ViewState.ANALYSIS:
        return <Analysis logs={logs} toxicAnalysis={user?.toxicAnalysis} onEditLog={handleNavigateToTracker} />;
      case ViewState.DASHBOARD:
      default:
        return user ? (
          <Dashboard
            user={user}
            logs={logs}
            metrics={calculateMetrics()}
            onNavigate={(v) => v === ViewState.TRACKER ? handleNavigateToTracker() : setView(v)}
          />
        ) : null;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative shadow-2xl overflow-hidden">
      {renderView()}
      {user && <Navigation currentView={view} setView={setView} />}
    </div>
  );
};

export default App;
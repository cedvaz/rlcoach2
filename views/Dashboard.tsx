import React from 'react';
import { UserProfile, DailyLog, ViewState } from '../types';
import { ClarityGauge } from '../components/ClarityGauge';
import { Button } from '../components/Button';
import { LEVEL_THRESHOLDS } from '../constants';
import { PlusCircle, Target, TrendingUp, Zap, ChevronRight, History } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from 'recharts';

interface DashboardProps {
  user: UserProfile;
  logs: DailyLog[];
  metrics: { currentScore: number; trend: string };
  onNavigate: (view: ViewState) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, logs, metrics, onNavigate }) => {
  const currentLevel = LEVEL_THRESHOLDS.find(l => l.level === user.level) || LEVEL_THRESHOLDS[0];
  const nextLevel = LEVEL_THRESHOLDS.find(l => l.level === user.level + 1);
  const progressPercent = nextLevel 
    ? ((user.clarityPoints - currentLevel.points) / (nextLevel.points - currentLevel.points)) * 100 
    : 100;

  // Prepare chart data (Last 7 logs)
  const chartData = logs.slice(0, 7).reverse().map(log => ({
    day: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
    score: log.calculatedScore
  }));

  const hasLoggedToday = logs.length > 0 && logs[0].date === new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 animate-fade-in">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-8 rounded-b-[3rem] shadow-sm border-b border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hi, {user.name}</h1>
            <p className="text-slate-500 text-sm font-medium italic">Your clarity is waiting.</p>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold shadow-sm border border-purple-200">
              <Target size={14} /> Level {user.level}
            </div>
            <div className="w-24 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center w-full overflow-visible">
          <ClarityGauge score={metrics.currentScore} />
        </div>
        
        {!hasLoggedToday ? (
          <Button fullWidth onClick={() => onNavigate(ViewState.TRACKER)} className="mt-2 flex items-center justify-center gap-2 transform hover:scale-[1.02] transition-transform">
            <PlusCircle size={20} /> Log Today's Status
          </Button>
        ) : (
          <div className="mt-2 p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-center text-sm font-bold border border-emerald-100 shadow-sm animate-pulse-slow">
             Today logged! +10 Clarity Points ✨
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="px-6 mt-8 space-y-6">
        
        {/* Daily Mission */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-500 rounded-[2rem] p-6 text-white shadow-xl shadow-purple-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
            <Zap size={80} />
          </div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner">
              <Zap size={24} className="text-yellow-300" />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tight">Daily Mission</h3>
              <p className="text-purple-50 text-sm mt-1 leading-relaxed font-medium opacity-90">
                Notice if your body feels tense or relaxed when you think about {user.partnerName} today. Your body knows the truth first.
              </p>
            </div>
          </div>
        </div>

        {/* Mini Chart */}
        {chartData.length > 1 && (
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 tracking-tight">Your Clarity Path</h3>
              {metrics.trend === 'up' && (
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <TrendingUp size={12}/> Improving
                </span>
              )}
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}}
                    interval={0}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                    itemStyle={{color: '#6366f1', fontSize: '14px', fontWeight: '800'}}
                    labelStyle={{display: 'none'}}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8b5cf6" 
                    strokeWidth={4} 
                    dot={{r: 4, fill:'#8b5cf6', strokeWidth:2, stroke: '#fff'}} 
                    activeDot={{r: 6, strokeWidth: 0}}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* History List */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <History size={18} className="text-slate-400" /> Recent History
            </h3>
          </div>
          
          <div className="space-y-3">
            {logs.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-sm italic font-medium">No logs yet. Start your journey today.</p>
            ) : (
              logs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white ${
                      log.calculatedScore >= 80 ? 'bg-emerald-500 shadow-emerald-100' : 
                      log.calculatedScore >= 50 ? 'bg-amber-500 shadow-amber-100' : 'bg-rose-500 shadow-rose-100'
                    } shadow-lg`}>
                      {log.calculatedScore}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {new Date(log.date).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'short' })}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Mood: {log.rating}/10
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              ))
            )}
            
            {logs.length > 0 && (
              <button 
                onClick={() => onNavigate(ViewState.TRACKER)}
                className="w-full text-center py-2 text-xs font-black uppercase tracking-widest text-purple-600 hover:text-purple-700 transition-colors"
              >
                + Add Missing Day
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
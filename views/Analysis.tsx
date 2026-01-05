import React, { useState } from 'react';
import { DailyLog, LogSource, ToxicAnalysis, ViewState } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Flag, ShieldAlert, AlertTriangle, Calendar as CalendarIcon, ChevronDown, ChevronUp, Activity, Plus } from 'lucide-react';

interface AnalysisProps {
  logs: DailyLog[];
  toxicAnalysis?: ToxicAnalysis;
  onEditLog: (date: string) => void;
}

const ScoreBar = ({ label, score, color }: { label: string, score: number, color: string }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-500">
      <span>{label}</span>
      <span>{score}%</span>
    </div>
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div 
        className={`h-full transition-all duration-1000 ${color}`} 
        style={{ width: `${score}%` }}
      />
    </div>
  </div>
);

export const Analysis: React.FC<AnalysisProps> = ({ logs, toxicAnalysis, onEditLog }) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // --- CALENDAR GRID LOGIC ---
  const calendarDays = [];
  const today = new Date();
  
  // Create last 30 days grid (Today is last)
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = logs.find(l => l.date === dateStr);
    calendarDays.push({ date: dateStr, log });
  }

  const greenDays = logs.filter(l => l.calculatedScore >= 80).length;
  const yellowDays = logs.filter(l => l.calculatedScore >= 50 && l.calculatedScore < 80).length;
  const redDays = logs.filter(l => l.calculatedScore < 50).length;
  
  const energyData = logs.slice(0, 7).reverse().map(l => ({
    date: new Date(l.date).toLocaleDateString('de-DE', { weekday: 'short' }),
    val: l.energy
  }));

  const urgencyColors = {
    low: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    medium: 'bg-amber-50 text-amber-700 border-amber-100',
    high: 'bg-orange-50 text-orange-700 border-orange-100',
    critical: 'bg-rose-50 text-rose-700 border-rose-100'
  };

  const getStatusColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 p-6 animate-fade-in pt-12">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clarity Insights</h1>
        <p className="text-slate-500 text-sm font-medium">Monthly patterns & visual truth.</p>
      </header>

      <div className="grid gap-6">
        
        {/* 1. CLARITY CALENDAR (Real 30-Day Grid) */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-sm uppercase tracking-widest text-slate-900 flex items-center gap-2">
              <CalendarIcon size={16} className="text-purple-500" /> 30-Day Path
            </h3>
            <div className="flex gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-200"></div> Missing</span>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, i) => (
              <button 
                key={i}
                onClick={() => onEditLog(day.date)}
                className={`aspect-square rounded-lg border-2 relative group transition-all duration-300 active:scale-90 ${
                  day.log 
                    ? `${getStatusColor(day.log.calculatedScore)} border-transparent shadow-sm hover:brightness-110` 
                    : 'bg-slate-50 border-slate-100 border-dashed hover:border-purple-300 hover:bg-purple-50'
                }`}
                title={day.log ? `${day.date}: ${day.log.calculatedScore}%` : `${day.date}: Missing`}
              >
                {!day.log && <Plus size={10} className="absolute inset-0 m-auto text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-6">
             <div className="bg-emerald-50 p-3 rounded-2xl text-center">
                <div className="text-lg font-black text-emerald-700">{greenDays}</div>
                <div className="text-[9px] font-black text-emerald-600/70 uppercase tracking-tighter">Healthy</div>
             </div>
             <div className="bg-amber-50 p-3 rounded-2xl text-center">
                <div className="text-lg font-black text-amber-700">{yellowDays}</div>
                <div className="text-[9px] font-black text-amber-600/70 uppercase tracking-tighter">Warning</div>
             </div>
             <div className="bg-rose-50 p-3 rounded-2xl text-center">
                <div className="text-lg font-black text-rose-700">{redDays}</div>
                <div className="text-[9px] font-black text-rose-600/70 uppercase tracking-tighter">Critical</div>
             </div>
          </div>
        </div>

        {/* 2. TOXIC REPORT */}
        {toxicAnalysis ? (
          <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-rose-100 border-2 border-rose-50 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-rose-500 text-white rounded-2xl">
                <ShieldAlert size={24} />
              </div>
              <h3 className="font-black text-xl text-slate-900 tracking-tight">Toxic Pattern Analysis</h3>
            </div>

            <div className={`p-4 rounded-2xl border mb-6 ${urgencyColors[toxicAnalysis.urgency_level]}`}>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Urgency: {toxicAnalysis.urgency_level}</span>
              </div>
              <p className="text-sm font-bold leading-relaxed">{toxicAnalysis.summary_text}</p>
            </div>

            <div className="space-y-5">
              <ScoreBar label="Gaslighting Pattern" score={toxicAnalysis.gaslighting_score} color="bg-rose-500" />
              <ScoreBar label="Control & Isolation" score={toxicAnalysis.control_score} color="bg-orange-500" />
              <ScoreBar label="Emotional Volatility" score={toxicAnalysis.volatility_score} color="bg-amber-500" />
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="px-2 py-0.5 bg-rose-500 text-[10px] font-black uppercase rounded-full tracking-wider">Premium</div>
                <h3 className="font-black text-xl tracking-tight">Toxic Pattern Check</h3>
              </div>
              <p className="text-slate-300 text-sm mb-4 font-medium leading-relaxed">
                Analyze hidden patterns of control or gaslighting from your logged history.
              </p>
              <button className="bg-white text-slate-900 px-6 py-3 rounded-2xl text-sm font-black hover:scale-105 transition-transform">
                Unlock Clarity Pass
              </button>
            </div>
          </div>
        )}

        {/* 3. DETAILED DAILY HISTORY */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-sm uppercase tracking-widest text-slate-900 flex items-center gap-2">
              <Activity size={16} className="text-blue-500" /> All Logs
            </h3>
            <span className="text-[10px] font-bold text-slate-400">{logs.length} Total</span>
          </div>

          <div className="space-y-3">
            {logs.length === 0 ? (
              <p className="text-center py-10 text-slate-400 text-sm italic">No entries yet.</p>
            ) : (
              logs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <div key={log.id} className={`border rounded-2xl transition-all overflow-hidden ${isExpanded ? 'border-purple-200 bg-purple-50/20' : 'border-slate-100 bg-slate-50/50'}`}>
                    <button onClick={() => setExpandedLogId(isExpanded ? null : log.id)} className="w-full flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs ${getStatusColor(log.calculatedScore)}`}>
                          {log.calculatedScore}
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-slate-900">
                            {new Date(log.date).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'short' })}
                          </div>
                        </div>
                      </div>
                      <ChevronDown size={16} className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 animate-fade-in text-xs space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                           <div className="p-2 bg-white rounded-lg border border-purple-50">
                              <span className="block opacity-50 mb-1">Energy</span>
                              <span className="font-bold">{log.energy === 1 ? '🔋 High' : log.energy === -1 ? '🪫 Low' : '😐 Mid'}</span>
                           </div>
                           <div className="p-2 bg-white rounded-lg border border-purple-50">
                              <span className="block opacity-50 mb-1">Respect</span>
                              <span className={`font-bold ${log.redFlag ? 'text-rose-600' : 'text-emerald-600'}`}>{log.redFlag ? '🚩 Issue' : '✅ Okay'}</span>
                           </div>
                        </div>
                        <button 
                          onClick={() => onEditLog(log.date)}
                          className="w-full py-2 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest"
                        >
                          Edit this Day
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 4. WEEKLY ENERGY CHART */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h3 className="font-black text-sm uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2">
            <Activity size={16} className="text-indigo-500" /> Energy Flow
          </h3>
          <div className="h-40">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={energyData}>
                 <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                 <Bar dataKey="val" radius={[6, 6, 6, 6]}>
                   {energyData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.val === 1 ? '#10b981' : entry.val === -1 ? '#f43f5e' : '#cbd5e1'} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
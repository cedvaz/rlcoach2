import React, { useState, useEffect, useRef } from 'react';
import { ViewState, LogSource, EnergyLevel, DailyLog } from '../types';
import { Button } from '../components/Button';
import { ChevronLeft, Flag, Battery, BatteryCharging, BatteryWarning, Check, Calendar, Edit3 } from 'lucide-react';
import { calculateDailyScore, saveLog, getLogs } from '../services/storageService';

interface TrackerProps {
  initialDate?: string;
  onComplete: () => void;
  onCancel: () => void;
}

export const Tracker: React.FC<TrackerProps> = ({ initialDate, onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || new Date().toISOString().split('T')[0]);
  const [rating, setRating] = useState<number>(5);
  const [source, setSource] = useState<LogSource | null>(null);
  const [energy, setEnergy] = useState<EnergyLevel | null>(null);
  const [redFlag, setRedFlag] = useState<boolean | null>(null);
  const [vision, setVision] = useState<boolean | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Sync state with existing logs when date changes
  useEffect(() => {
    const logs = getLogs();
    const existingLog = logs.find(l => l.date === selectedDate);
    if (existingLog) {
      setRating(existingLog.rating);
      setSource(existingLog.source);
      setEnergy(existingLog.energy);
      setRedFlag(existingLog.redFlag);
      setVision(existingLog.vision);
      setIsEditing(true);
    } else {
      setRating(5);
      setSource(null);
      setEnergy(null);
      setRedFlag(null);
      setVision(null);
      setIsEditing(false);
    }
  }, [selectedDate]);

  const handleSubmit = () => {
    if (rating === null || source === null || energy === null || redFlag === null || vision === null) return;

    const calculatedScore = calculateDailyScore(rating, energy, vision, redFlag, source === LogSource.EXTERNAL);

    const newLog: DailyLog = {
      id: Date.now().toString(),
      date: selectedDate,
      timestamp: new Date(selectedDate + "T12:00:00").getTime(),
      rating,
      source,
      energy,
      redFlag,
      vision,
      note: '',
      calculatedScore
    };

    saveLog(newLog);
    onComplete();
  };

  const openCalendar = () => {
    if (dateInputRef.current) {
      // Modern browsers support showPicker() on input[type="date"]
      if ('showPicker' in HTMLInputElement.prototype) {
        try {
          dateInputRef.current.showPicker();
        } catch (e) {
          dateInputRef.current.click();
        }
      } else {
        dateInputRef.current.click();
      }
    }
  };

  const StepIndicator = () => (
    <div className="flex gap-2 mb-10 mt-2 px-1">
      {[1, 2, 3, 4, 5].map(s => (
        <div 
          key={s} 
          className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
            s <= step ? 'bg-purple-600 shadow-sm shadow-purple-100' : 'bg-slate-200'
          }`} 
        />
      ))}
    </div>
  );

  const displayDate = new Date(selectedDate + "T12:00:00");

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 animate-fade-in relative z-10">
      <div className="flex items-center justify-between mb-4 pt-4">
        <div className="flex items-center gap-1">
          <button onClick={onCancel} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-900 leading-tight">
              {isEditing ? 'Update Log' : 'Daily Log'}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
               <span className="text-purple-600">
                  {isEditing ? <Edit3 size={10} /> : <div className="w-2.5 h-2.5 bg-purple-600 rounded-full animate-pulse" />}
               </span>
               <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">
                {isEditing ? 'Changing patterns' : 'Step into clarity'}
              </span>
            </div>
          </div>
        </div>
        
        {/* IMPROVED DATE PICKER TRIGGER */}
        <div className="relative group">
          <button 
            onClick={openCalendar}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl text-[13px] font-black text-slate-800 shadow-sm hover:border-purple-400 hover:bg-purple-50 transition-all active:scale-95 z-20"
          >
            <Calendar size={14} className="text-purple-600" />
            {displayDate.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: '2-digit' })}
          </button>
          {/* Transparent Input overlaid on the button for better mobile behavior */}
          <input 
            ref={dateInputRef}
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="absolute top-0 right-0 w-full h-full opacity-0 cursor-pointer pointer-events-none"
            aria-label="Select Log Date"
          />
        </div>
      </div>

      <StepIndicator />

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full pb-10">
        {step === 1 && (
          <div className="space-y-12 text-center animate-slide-up flex flex-col items-center">
            <h2 className="text-[26px] font-black text-slate-900 tracking-tight leading-tight max-w-[280px]">
              How did you feel on this day?
            </h2>
            <div className="relative w-52 h-52 flex items-center justify-center">
                <div className="absolute inset-0 bg-purple-50/70 rounded-full animate-pulse-slow"></div>
                <div className="relative text-[100px] font-black text-purple-600 drop-shadow-sm select-none">
                  {rating}
                </div>
            </div>
            <div className="w-full px-2">
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={rating} 
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 mt-5 px-1">
                  <span>Cloudy</span>
                  <span>Radiant</span>
                </div>
            </div>
            <Button fullWidth onClick={() => setStep(2)} className="mt-6 py-4 text-lg bg-slate-900">
              Next
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-slide-up">
            <h2 className="text-2xl font-black text-slate-900 text-center tracking-tight leading-tight">
              What influenced this feeling most?
            </h2>
            <div className="grid grid-cols-1 gap-5">
              <button onClick={() => { setSource(LogSource.INTERNAL); setStep(3); }} className={`p-7 rounded-[2rem] border-2 transition-all text-left flex items-start justify-between shadow-sm ${source === LogSource.INTERNAL ? 'border-purple-600 bg-purple-50' : 'border-slate-100 bg-white hover:border-purple-200'}`}>
                <div>
                  <span className={`block font-black text-2xl tracking-tight mb-2 ${source === LogSource.INTERNAL ? 'text-purple-700' : 'text-slate-900'}`}>My Partner / Us</span>
                  <span className={`text-sm font-medium leading-relaxed ${source === LogSource.INTERNAL ? 'text-purple-600' : 'text-slate-500'}`}>Direct interactions or thoughts about us.</span>
                </div>
                {source === LogSource.INTERNAL && <Check className="text-purple-600 mt-1 shrink-0" size={24} />}
              </button>
              <button onClick={() => { setSource(LogSource.EXTERNAL); setStep(3); }} className={`p-7 rounded-[2rem] border-2 transition-all text-left flex items-start justify-between shadow-sm ${source === LogSource.EXTERNAL ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                <div>
                  <span className={`block font-black text-2xl tracking-tight mb-2 ${source === LogSource.EXTERNAL ? 'text-white' : 'text-slate-900'}`}>External Factors</span>
                  <span className={`text-sm font-medium leading-relaxed ${source === LogSource.EXTERNAL ? 'text-slate-300' : 'text-slate-500'}`}>Work, stress, or other people.</span>
                </div>
                {source === LogSource.EXTERNAL && <Check className="text-white mt-1 shrink-0" size={24} />}
              </button>
            </div>
            <div className="flex justify-center pt-2">
                <button onClick={() => setStep(1)} className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Go Back</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10 animate-slide-up">
            <h2 className="text-2xl font-black text-slate-900 text-center tracking-tight">How was your energy?</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { type: EnergyLevel.DRAINED, icon: BatteryWarning, label: 'Drained', color: 'rose' },
                { type: EnergyLevel.NEUTRAL, icon: Battery, label: 'Neutral', color: 'slate' },
                { type: EnergyLevel.CHARGED, icon: BatteryCharging, label: 'Charged', color: 'emerald' }
              ].map((item) => (
                <button key={item.label} onClick={() => { setEnergy(item.type); setStep(4); }} className={`flex flex-col items-center p-7 rounded-[2rem] border-2 transition-all shadow-sm ${energy === item.type ? `border-${item.color}-500 bg-${item.color}-50` : 'border-slate-100 bg-white hover:bg-slate-50'}`}>
                  <item.icon className={`mb-4 ${energy === item.type ? `text-${item.color}-600` : 'text-slate-400'}`} size={40} />
                  <span className={`text-[11px] font-black uppercase tracking-widest ${energy === item.type ? `text-${item.color}-700` : 'text-slate-500'}`}>{item.label}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-center pt-2">
                <button onClick={() => setStep(2)} className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Go Back</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-slide-up px-2">
            <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Respect Check</h2>
                <p className="text-slate-500 text-sm font-medium px-6 leading-relaxed">Boundary crossed or unsafe feeling?</p>
            </div>
            <div className="space-y-4">
              <button onClick={() => { setRedFlag(true); setStep(5); }} className={`w-full p-7 rounded-[2rem] border-2 transition-all font-black flex items-center justify-between shadow-sm ${redFlag === true ? 'border-rose-500 bg-rose-500 text-white' : 'border-rose-100 bg-rose-50/50 text-rose-800'}`}>
                <span className="text-lg">Yes, boundary crossed</span>
                <Flag size={24} />
              </button>
              <button onClick={() => { setRedFlag(false); setStep(5); }} className={`w-full p-7 rounded-[2rem] border-2 transition-all font-black flex items-center justify-between shadow-sm ${redFlag === false ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-emerald-100 bg-emerald-50/50 text-emerald-800'}`}>
                <span className="text-lg">No, all respectful</span>
                <Check size={24} />
              </button>
            </div>
            <div className="flex justify-center pt-2">
                <button onClick={() => setStep(3)} className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Go Back</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-10 animate-slide-up px-2">
            <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">The 5-Year Vision</h2>
                <p className="text-slate-500 text-sm font-medium px-6 leading-relaxed">Could you happily be here in 5 years?</p>
            </div>
            <div className="grid grid-cols-2 gap-5 mt-4">
              <button onClick={() => setVision(false)} className={`p-10 rounded-[2.5rem] border-2 text-center transition-all shadow-md ${vision === false ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 bg-white text-slate-900'}`}>
                <span className="block text-5xl mb-4">☁️</span>
                <span className="font-black text-[11px] uppercase tracking-[0.2em]">No</span>
              </button>
              <button onClick={() => setVision(true)} className={`p-10 rounded-[2.5rem] border-2 text-center transition-all shadow-md ${vision === true ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-100 bg-white text-slate-900'}`}>
                <span className="block text-5xl mb-4">☀️</span>
                <span className="font-black text-[11px] uppercase tracking-[0.2em]">Yes</span>
              </button>
            </div>
            <div className="pt-4">
                <Button fullWidth onClick={handleSubmit} disabled={vision === null} className="py-5 text-lg shadow-xl uppercase font-black tracking-widest bg-slate-900">
                  {isEditing ? 'Update Clarity Log' : 'Save To My Path'}
                </Button>
            </div>
            <div className="flex justify-center">
                <button onClick={() => setStep(4)} className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Go Back</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
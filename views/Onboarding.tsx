import React, { useState } from 'react';
import { UserProfile, ViewState } from '../types';
import { Button } from '../components/Button';
import { ArrowRight, Heart, ShieldCheck } from 'lucide-react';
import { saveUser } from '../services/storageService';

interface OnboardingProps {
  onComplete: (user: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [duration, setDuration] = useState('');

  const handleFinish = () => {
    const newUser: UserProfile = {
      name,
      partnerName,
      relationshipDuration: duration,
      isOnboarded: true,
      isPremium: false,
      clarityPoints: 0,
      level: 1
    };
    saveUser(newUser);
    onComplete(newUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 max-w-md mx-auto w-full">
        {step === 1 && (
          <div className="animate-fade-in space-y-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-tr from-purple-500 to-rose-400 rounded-2xl shadow-xl flex items-center justify-center transform rotate-3">
                <Heart className="text-white" size={40} fill="currentColor" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Welcome to Mara</h1>
            <p className="text-slate-600 text-lg leading-relaxed">
              The path to clarity starts here. I'm your AI companion to help you understand your relationship patterns.
            </p>
            <Button fullWidth onClick={() => setStep(2)}>
              Start Journey <ArrowRight className="ml-2 inline" size={18} />
            </Button>
            <p className="text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
              <ShieldCheck size={12} /> Your data is private & encrypted
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900">What should I call you?</h2>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full text-2xl border-b-2 border-slate-300 py-2 focus:outline-none focus:border-purple-500 bg-transparent placeholder-slate-400 transition-colors text-slate-900"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <Button 
              fullWidth 
              onClick={() => name && setStep(3)} 
              disabled={!name}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900">Who is your partner?</h2>
            <p className="text-slate-600">I'll use this name when we analyze patterns.</p>
            <input
              type="text"
              placeholder="Partner's Name"
              className="w-full text-2xl border-b-2 border-slate-300 py-2 focus:outline-none focus:border-purple-500 bg-transparent placeholder-slate-400 transition-colors text-slate-900"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              autoFocus
            />
            <Button 
              fullWidth 
              onClick={() => partnerName && setStep(4)} 
              disabled={!partnerName}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900">How long have you been together?</h2>
            <div className="space-y-3">
              {['Less than 6 months', '6 months - 1 year', '1 - 3 years', '3 - 7 years', '7+ years'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setDuration(opt)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    duration === opt 
                    ? 'border-purple-500 bg-purple-50 text-purple-900 shadow-sm' 
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <Button 
              fullWidth 
              onClick={handleFinish} 
              disabled={!duration}
              className="mt-6"
            >
              Enter Mara
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
import React from 'react';
import { ViewState } from '../types';
import { NAV_ITEMS } from '../constants';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  if (currentView === ViewState.ONBOARDING) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 pb-safe pt-2 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] z-50">
      <div className="flex justify-between items-center max-w-md mx-auto h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`flex flex-col items-center justify-center w-16 transition-all duration-300 ${
                isActive ? 'text-purple-600' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <div className={`p-2.5 rounded-full transition-all ${isActive ? 'bg-purple-100 scale-110' : ''}`}>
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={isActive ? 'text-purple-600' : 'text-slate-500'} 
                />
              </div>
              <span className={`text-[10px] font-bold mt-1 tracking-tight ${isActive ? 'text-purple-600' : 'text-slate-600'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
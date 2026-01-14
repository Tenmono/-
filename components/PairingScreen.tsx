
import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Heart, Sparkles } from 'lucide-react';
import { FamilyConfig } from '../types';

interface Props {
  onPairSuccess: (config: FamilyConfig) => void;
}

const PairingScreen: React.FC<Props> = ({ onPairSuccess }) => {
  const handleStart = () => {
    onPairSuccess({
      familyId: `local_${Date.now()}`,
      pairedUserId: null
    });
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-900 flex flex-col px-10 py-16 animate-in fade-in duration-1000">
      <div className="flex-1 flex flex-col justify-center items-center text-center">
        <div className="relative w-56 h-56 mb-16">
          <div className="absolute inset-0 border-2 border-white/5 rounded-full animate-[spin_20s_linear_infinite]" />
          <div className="absolute inset-6 border-2 border-rose-500/20 rounded-full animate-[spin_10s_linear_infinite_reverse]" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-24 h-24 bg-rose-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(225,29,72,0.4)] animate-pulse">
               <Heart className="w-10 h-10 text-white fill-current" />
             </div>
          </div>
          <ShieldCheck className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 text-blue-400" />
        </div>

        <h2 className="text-4xl font-black text-white tracking-tighter mb-6 leading-tight">
          私密且纯净的<br/>财富空间
        </h2>
        <p className="text-slate-400 text-sm font-medium mb-12 leading-relaxed">
          不依赖云端，不记录隐私。<br/>
          通过端对端扫码，随时与 TA 同步愿景。
        </p>

        <div className="w-full space-y-4">
          <button 
            onClick={handleStart}
            className="group w-full bg-white text-slate-900 py-6 rounded-[2rem] font-black flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl shadow-white/10"
          >
            开启旅程 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="flex items-center justify-center gap-2 pt-4">
            <Sparkles className="w-3.5 h-3.5 text-rose-500/60" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Zero Cloud Dependency</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PairingScreen;

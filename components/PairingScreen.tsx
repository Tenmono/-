
import React, { useState } from 'react';
import { Link2, Sparkles, ChevronRight, Copy, Users, Heart } from 'lucide-react';
import { UserID, UserProfile, FamilyConfig } from '../types';

interface Props {
  onPairSuccess: (config: FamilyConfig) => void;
  currentUser: UserID;
  onSwitchUser: (user: UserID) => void;
  profiles: { husband: UserProfile; wife: UserProfile };
}

const PairingScreen: React.FC<Props> = ({ onPairSuccess, currentUser, onSwitchUser, profiles }) => {
  const [step, setStep] = useState<'start' | 'create' | 'join'>('start');
  const [inputCode, setInputCode] = useState('');
  const [generatedCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());

  const handleJoin = () => {
    if (inputCode.length === 6) {
      onPairSuccess({
        familyId: `fam_${inputCode}`,
        pairedUserId: currentUser === 'wife' ? 'husband' : 'wife'
      });
    }
  };

  const handleCreateComplete = () => {
    onPairSuccess({
      familyId: `fam_${generatedCode}`,
      pairedUserId: currentUser === 'wife' ? 'husband' : 'wife'
    });
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col px-8 py-12 animate-in fade-in duration-700">
      <div className="flex-1 flex flex-col justify-center items-center text-center">
        {/* 动态连接动画 */}
        <div className="relative w-48 h-48 mb-12">
          <div className="absolute inset-0 border-4 border-rose-200 rounded-full animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-4 border-4 border-rose-400 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-rose-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-rose-500/40">
              <Link2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <Heart className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 text-rose-500 fill-current animate-bounce" />
        </div>

        <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">
          开启共享财富之旅
        </h2>
        <p className="text-slate-400 text-sm font-medium mb-12 max-w-[240px]">
          配对后，你们将共同管理收益，并一起为未来的愿景添砖加瓦。
        </p>

        {step === 'start' && (
          <div className="w-full space-y-4">
            <button 
              onClick={() => setStep('create')}
              className="w-full bg-rose-600 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-3 shadow-xl shadow-rose-500/20 active:scale-[0.98] transition-transform"
            >
              创建新家庭 <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setStep('join')}
              className="w-full bg-white text-slate-800 py-5 rounded-3xl font-black border-2 border-slate-100 active:scale-[0.98] transition-transform"
            >
              加入已有家庭
            </button>
          </div>
        )}

        {step === 'create' && (
          <div className="w-full space-y-8 animate-in slide-in-from-bottom-4">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">您的家庭配对码</p>
              <div className="text-5xl font-black text-rose-600 tracking-[0.2em] mb-6">{generatedCode}</div>
              <button 
                className="flex items-center gap-2 mx-auto text-rose-500 font-bold text-xs bg-rose-50 px-4 py-2 rounded-full"
                onClick={() => navigator.clipboard.writeText(generatedCode)}
              >
                <Copy className="w-3.5 h-3.5" /> 复制发送给 TA
              </button>
            </div>
            <button 
              onClick={handleCreateComplete}
              className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black active:scale-[0.98] transition-transform"
            >
              已发送，进入应用
            </button>
          </div>
        )}

        {step === 'join' && (
          <div className="w-full space-y-8 animate-in slide-in-from-bottom-4">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">输入 6 位配对码</p>
              <input 
                autoFocus
                type="number"
                maxLength={6}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.slice(0, 6))}
                className="w-full text-center text-4xl font-black text-slate-800 border-none bg-slate-50 rounded-2xl py-6 tracking-[0.3em] focus:ring-0"
                placeholder="000000"
              />
            </div>
            <button 
              onClick={handleJoin}
              disabled={inputCode.length !== 6}
              className="w-full bg-rose-600 text-white py-5 rounded-3xl font-black shadow-xl shadow-rose-500/20 disabled:opacity-30 active:scale-[0.98] transition-transform"
            >
              建立连接
            </button>
            <button onClick={() => setStep('start')} className="text-xs font-bold text-slate-300 uppercase tracking-widest">返回</button>
          </div>
        )}
      </div>

      {/* 底部切换身份 */}
      <div className="mt-auto pt-10 text-center">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-4">您当前的身份是</p>
        <div className="inline-flex bg-white p-1.5 rounded-3xl shadow-sm border border-slate-100">
          {(['wife', 'husband'] as const).map(user => (
            <button 
              key={user}
              onClick={() => onSwitchUser(user)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl transition-all ${currentUser === user ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400'}`}
            >
              <img src={profiles[user].avatar} className="w-5 h-5 rounded-full" />
              <span className="text-xs font-black">{profiles[user].name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PairingScreen;

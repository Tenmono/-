
import React from 'react';
import { X, Camera, Link2Off, Share2 } from 'lucide-react';
import { UserProfile, FamilyConfig } from '../types';

interface Props {
  profiles: { husband: UserProfile; wife: UserProfile };
  familyConfig: FamilyConfig;
  onUnpair: () => void;
  onUpdate: (userId: 'husband' | 'wife', updates: Partial<UserProfile>) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<Props> = ({ profiles, familyConfig, onUnpair, onUpdate, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-slate-800">家庭成员设置</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-8">
          {(['wife', 'husband'] as const).map(user => (
            <div key={user} className="flex items-center gap-4">
              <div className="relative group">
                <img 
                  src={profiles[user].avatar} 
                  className="w-16 h-16 rounded-3xl object-cover ring-4 ring-slate-50"
                  alt={user}
                />
                <button 
                  onClick={() => onUpdate(user, { avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}` })}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-rose-500 text-white rounded-xl shadow-lg"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  {user === 'wife' ? '老婆' : '老公'} 的称呼
                </p>
                <input 
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 font-bold text-slate-700 focus:ring-2 focus:ring-rose-500/20"
                  value={profiles[user].name}
                  onChange={e => onUpdate(user, { name: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">家庭状态</p>
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                已同步配对 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              </h4>
            </div>
            <button 
              onClick={() => { if(confirm('确定要解除配对吗？历史数据将保留在本地。')) onUnpair(); }}
              className="p-3 bg-rose-50 text-rose-500 rounded-2xl active:scale-90 transition-all"
            >
              <Link2Off className="w-5 h-5" />
            </button>
          </div>
          
          <button 
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black tracking-widest uppercase text-xs flex items-center justify-center gap-2"
          >
            保存并返回
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

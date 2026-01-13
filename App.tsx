
import React, { useState, useEffect, useMemo } from 'react';
import { Wallet, Heart, Coins, Link2, Users, Loader2, CloudDone } from 'lucide-react';
import IncomeTracker from './components/IncomeTracker';
import Wishlist from './components/Wishlist';
import Celebration from './components/Celebration';
import SettingsModal from './components/SettingsModal';
import PairingScreen from './components/PairingScreen';
import { IncomeRecord, Wish, UserID, Tab, UserProfile, FamilyConfig } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('income');
  const [currentUser, setCurrentUser] = useState<UserID>('wife');
  const [showCelebration, setShowCelebration] = useState<{ show: boolean; name: string }>({ show: false, name: '' });
  const [showSettings, setShowSettings] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // 家庭配对状态
  const [familyConfig, setFamilyConfig] = useState<FamilyConfig>(() => {
    const saved = localStorage.getItem('earn_family_config');
    return saved ? JSON.parse(saved) : { familyId: null, pairedUserId: null };
  });

  const [profiles, setProfiles] = useState<{ husband: UserProfile; wife: UserProfile }>({
    husband: { name: '老公', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=husband' },
    wife: { name: '老婆', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wife' }
  });

  const [yearlyGoal, setYearlyGoal] = useState<number>(() => {
    const saved = localStorage.getItem('earn_yearly_goal');
    return saved ? parseFloat(saved) : 200000;
  });

  const [records, setRecords] = useState<IncomeRecord[]>(() => {
    const saved = localStorage.getItem('earn_records');
    return saved ? JSON.parse(saved) : [
      { id: '1', amount: 15000, source: '1月工资', category: '工作', timestamp: new Date(2026, 0, 5).getTime(), userId: 'wife' },
      { id: '3', amount: 18000, source: '1月工资', category: '工作', timestamp: new Date(2026, 0, 5).getTime(), userId: 'husband' },
    ];
  });
  
  const [wishes, setWishes] = useState<Wish[]>(() => {
    const saved = localStorage.getItem('earn_wishes');
    return saved ? JSON.parse(saved) : [
      { id: 'p1', title: '日本双人5日游', targetAmount: 25000, currentSavedAmount: 8500, status: 'ongoing', userId: 'wife', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=200&h=200&fit=crop' },
      { id: 'p2', title: '更换 iPhone 17 Pro', targetAmount: 9000, currentSavedAmount: 0, status: 'pending', userId: 'husband', imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=200&h=200&fit=crop' }
    ];
  });

  const [coins, setCoins] = useState<{ id: number; left: string }[]>([]);

  // 模拟同步逻辑
  const triggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 800);
  };

  useEffect(() => {
    localStorage.setItem('earn_records', JSON.stringify(records));
    if (familyConfig.familyId) triggerSync();
  }, [records, familyConfig.familyId]);

  useEffect(() => {
    localStorage.setItem('earn_wishes', JSON.stringify(wishes));
    if (familyConfig.familyId) triggerSync();
  }, [wishes, familyConfig.familyId]);

  useEffect(() => {
    localStorage.setItem('earn_yearly_goal', yearlyGoal.toString());
  }, [yearlyGoal]);

  useEffect(() => {
    localStorage.setItem('earn_family_config', JSON.stringify(familyConfig));
  }, [familyConfig]);

  const addIncomeRecord = (record: Omit<IncomeRecord, 'id' | 'timestamp'>) => {
    const newRecord: IncomeRecord = { ...record, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() };
    setRecords(prev => [...prev, newRecord]);
    
    if (newRecord.amount >= 1000) {
      setShowCelebration({ show: true, name: profiles[newRecord.userId].name });
    }

    const newCoins = Array.from({ length: 8 }).map((_, i) => ({ id: Date.now() + i, left: `${Math.random() * 80 + 10}%` }));
    setCoins(prev => [...prev, ...newCoins]);
    if (window.navigator.vibrate) window.navigator.vibrate([10, 30, 50]);
    setTimeout(() => setCoins(prev => prev.filter(c => !newCoins.some(nc => nc.id === c.id))), 1200);
  };

  const handlePairSuccess = (config: FamilyConfig) => {
    setFamilyConfig(config);
    // 配对成功时的特效
    const newCoins = Array.from({ length: 15 }).map((_, i) => ({ id: Date.now() + i, left: `${Math.random() * 90 + 5}%` }));
    setCoins(prev => [...prev, ...newCoins]);
  };

  // 如果未配对，显示配对屏幕
  if (!familyConfig.familyId) {
    return <PairingScreen onPairSuccess={handlePairSuccess} currentUser={currentUser} onSwitchUser={setCurrentUser} profiles={profiles} />;
  }

  return (
    <div className="max-w-md mx-auto min-h-screen relative font-sans bg-slate-50 selection:bg-rose-100 pb-10">
      {showCelebration.show && <Celebration userName={showCelebration.name} onComplete={() => setShowCelebration({ show: false, name: '' })} />}
      {showSettings && (
        <SettingsModal 
          profiles={profiles} 
          familyConfig={familyConfig}
          onUnpair={() => setFamilyConfig({ familyId: null, pairedUserId: null })}
          onUpdate={(u, up) => setProfiles(p => ({...p, [u]: {...p[u], ...up}}))} 
          onClose={() => setShowSettings(false)} 
        />
      )}
      
      {/* 同步状态指示器 */}
      <div className={`fixed top-4 right-4 z-[80] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-lg border border-slate-100 transition-all duration-300 ${isSyncing ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
        <Loader2 className="w-3 h-3 text-rose-500 animate-spin" />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Shared Syncing</span>
      </div>

      <div className="px-6 pt-12 pb-32">
        <header className="flex items-center justify-between mb-12 px-2">
          <div onClick={() => setShowSettings(true)} className="cursor-pointer group">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter group-hover:text-rose-600 transition-colors">
              赚了吗 <span className="text-rose-600 italic">?</span>
            </h1>
            <div className="flex items-center gap-1 mt-0.5">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Wealth Vision 2026</p>
              <Users className="w-2.5 h-2.5 text-rose-500/50" />
            </div>
          </div>
          <div className="flex -space-x-3">
            <div onClick={() => setCurrentUser('wife')} className={`w-14 h-14 rounded-[1.25rem] border-4 border-white shadow-lg overflow-hidden transition-all cursor-pointer ${currentUser === 'wife' ? 'ring-4 ring-rose-500/20 scale-110 z-10' : 'opacity-40 grayscale'}`}>
               <img src={profiles.wife.avatar} alt="老婆" />
            </div>
            <div onClick={() => setCurrentUser('husband')} className={`w-14 h-14 rounded-[1.25rem] border-4 border-white shadow-lg overflow-hidden transition-all cursor-pointer ${currentUser === 'husband' ? 'ring-4 ring-rose-500/20 scale-110 z-10' : 'opacity-40 grayscale'}`}>
               <img src={profiles.husband.avatar} alt="老公" />
            </div>
          </div>
        </header>

        <main className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {activeTab === 'income' ? (
            <IncomeTracker 
              records={records} 
              profiles={profiles} 
              onAddRecord={addIncomeRecord} 
              onDeleteRecord={id => setRecords(r => r.filter(x => x.id !== id))} 
              currentUser={currentUser} 
              onSwitchUser={setCurrentUser}
              yearlyGoal={yearlyGoal}
              onUpdateGoal={setYearlyGoal}
            />
          ) : (
            <Wishlist 
              wishes={wishes} 
              profiles={profiles}
              currentUser={currentUser}
              onAddWish={(w) => {
                setWishes(prev => [...prev, { ...w, id: Math.random().toString(36).substr(2, 9) }]);
              }} 
              onUpdateWish={(id, updates) => {
                setWishes(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
              }} 
              onDeleteWish={id => setWishes(prev => prev.filter(w => w.id !== id))} 
              onReorderWishes={setWishes}
              incomeRecords={records} 
            />
          )}
        </main>
      </div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[60]">
        {coins.map(coin => (
          <div key={coin.id} className="absolute bottom-24 coin-animation" style={{ left: coin.left }}>
            <Coins className="w-12 h-12 text-rose-500 drop-shadow-2xl" />
          </div>
        ))}
      </div>

      <nav className="fixed bottom-6 left-6 right-6 z-50">
        <div className="max-w-md mx-auto bg-white/90 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl shadow-slate-900/10 border border-white/40 flex justify-around items-center h-20 px-8">
          <button 
            onClick={() => setActiveTab('income')} 
            className={`flex-1 flex flex-col items-center gap-1.5 transition-all ${activeTab === 'income' ? 'text-rose-600 scale-105' : 'text-slate-300 hover:text-slate-400'}`}
          >
            <Wallet className={`w-7 h-7 transition-transform ${activeTab === 'income' ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">收益</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('wishlist')} 
            className={`flex-1 flex flex-col items-center gap-1.5 transition-all ${activeTab === 'wishlist' ? 'text-rose-600 scale-105' : 'text-slate-300 hover:text-slate-400'}`}
          >
            <Heart className={`w-7 h-7 transition-transform ${activeTab === 'wishlist' ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">心愿单</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;

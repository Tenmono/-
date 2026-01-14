
import React, { useState, useEffect } from 'react';
import { Wallet, Heart, Coins, Users, ShieldCheck } from 'lucide-react';
import IncomeTracker from './components/IncomeTracker.tsx';
import Wishlist from './components/Wishlist.tsx';
import Celebration from './components/Celebration.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import PairingScreen from './components/PairingScreen.tsx';
import { IncomeRecord, Wish, UserID, Tab, UserProfile, FamilyConfig } from './types.ts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('income');
  const [currentUser, setCurrentUser] = useState<UserID>('wife');
  const [showCelebration, setShowCelebration] = useState<{ show: boolean; name: string }>({ show: false, name: '' });
  const [showSettings, setShowSettings] = useState(false);
  const [isLocalSaved, setIsLocalSaved] = useState(false);

  const [familyConfig, setFamilyConfig] = useState<FamilyConfig>(() => {
    const saved = localStorage.getItem('earn_family_config');
    return saved ? JSON.parse(saved) : { familyId: null, pairedUserId: null };
  });

  const [profiles, setProfiles] = useState<{ husband: UserProfile; wife: UserProfile }>(() => {
    const saved = localStorage.getItem('earn_profiles');
    return saved ? JSON.parse(saved) : {
      husband: { name: '老公', avatar: '👨🏻‍💻' },
      wife: { name: '老婆', avatar: '👩🏻‍🎨' }
    };
  });

  const [yearlyGoal, setYearlyGoal] = useState<number>(() => {
    const saved = localStorage.getItem('earn_yearly_goal');
    return saved ? parseFloat(saved) : 200000;
  });

  const [records, setRecords] = useState<IncomeRecord[]>(() => {
    const saved = localStorage.getItem('earn_records');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [wishes, setWishes] = useState<Wish[]>(() => {
    const saved = localStorage.getItem('earn_wishes');
    return saved ? JSON.parse(saved) : [];
  });

  const [coins, setCoins] = useState<{ id: number; left: string }[]>([]);

  useEffect(() => {
    localStorage.setItem('earn_records', JSON.stringify(records));
    localStorage.setItem('earn_wishes', JSON.stringify(wishes));
    localStorage.setItem('earn_yearly_goal', yearlyGoal.toString());
    localStorage.setItem('earn_family_config', JSON.stringify(familyConfig));
    localStorage.setItem('earn_profiles', JSON.stringify(profiles));
    
    setIsLocalSaved(true);
    const timer = setTimeout(() => setIsLocalSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [records, wishes, yearlyGoal, familyConfig, profiles]);

  const addIncomeRecord = (record: Omit<IncomeRecord, 'id' | 'timestamp'>) => {
    const newRecord: IncomeRecord = { ...record, id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, timestamp: Date.now() };
    setRecords(prev => [...prev, newRecord]);
    
    if (newRecord.amount >= 1000) {
      setShowCelebration({ show: true, name: profiles[newRecord.userId].name });
      const newCoins = Array.from({ length: 8 }).map((_, i) => ({ id: Date.now() + i, left: `${Math.random() * 80 + 10}%` }));
      setCoins(prev => [...prev, ...newCoins]);
      setTimeout(() => setCoins(prev => prev.filter(c => !newCoins.some(nc => nc.id === c.id))), 1200);
    }
  };

  const updateIncomeRecord = (id: string, updates: Partial<IncomeRecord>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleMergeData = (importedData: { records: IncomeRecord[], wishes: Wish[] }) => {
    setRecords(prev => {
      const existingIds = new Set(prev.map(r => r.id));
      const newRecords = importedData.records.filter(r => !existingIds.has(r.id));
      return [...prev, ...newRecords].sort((a, b) => a.timestamp - b.timestamp);
    });
    setWishes(prev => {
      const existingIds = new Set(prev.map(w => w.id));
      const newWishes = importedData.wishes.filter(w => !existingIds.has(w.id));
      return [...prev, ...newWishes];
    });
  };

  if (!familyConfig.familyId) {
    return <PairingScreen onPairSuccess={(config) => setFamilyConfig(config)} />;
  }

  return (
    <div className="max-w-md mx-auto min-h-screen relative font-sans bg-slate-50 selection:bg-rose-100 pb-10">
      {showCelebration.show && <Celebration userName={showCelebration.name} onComplete={() => setShowCelebration({ show: false, name: '' })} />}
      {showSettings && (
        <SettingsModal 
          profiles={profiles} 
          familyConfig={familyConfig}
          records={records}
          wishes={wishes}
          onImportData={handleMergeData}
          onUnpair={() => setFamilyConfig({ familyId: null, pairedUserId: null })}
          onUpdate={(u, up) => setProfiles(p => ({...p, [u]: {...p[u], ...up}}))} 
          onClose={() => setShowSettings(false)} 
        />
      )}
      
      <div className={`fixed top-4 right-4 z-[80] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-lg border border-slate-100 transition-all duration-300 ${isLocalSaved ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Local Encrypted</span>
      </div>

      <div className="px-6 pt-12 pb-32">
        <header className="flex items-center justify-between mb-12 px-2">
          <div onClick={() => setShowSettings(true)} className="cursor-pointer group">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter group-hover:text-rose-600 transition-colors">
              赚了吗 <span className="text-rose-600 italic">?</span>
            </h1>
            <div className="flex items-center gap-1 mt-0.5">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Purely Local 2026</p>
              <Users className="w-2.5 h-2.5 text-blue-500/50" />
            </div>
          </div>
          <div className="flex -space-x-2">
            <div onClick={() => setCurrentUser('wife')} className={`w-12 h-12 rounded-2xl bg-white border-2 border-slate-100 shadow-md flex items-center justify-center text-2xl transition-all cursor-pointer ${currentUser === 'wife' ? 'ring-4 ring-rose-500/20 scale-110 z-10' : 'opacity-40 grayscale'}`}>
               {profiles.wife.avatar}
            </div>
            <div onClick={() => setCurrentUser('husband')} className={`w-12 h-12 rounded-2xl bg-white border-2 border-slate-100 shadow-md flex items-center justify-center text-2xl transition-all cursor-pointer ${currentUser === 'husband' ? 'ring-4 ring-rose-500/20 scale-110 z-10' : 'opacity-40 grayscale'}`}>
               {profiles.husband.avatar}
            </div>
          </div>
        </header>

        <main className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {activeTab === 'income' ? (
            <IncomeTracker 
              records={records} 
              profiles={profiles} 
              onAddRecord={addIncomeRecord} 
              onUpdateRecord={updateIncomeRecord}
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
                setWishes(prev => [...prev, { ...w, id: `wish_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, savingsHistory: [] }]);
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


import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Briefcase, 
  ShoppingBag, 
  CircleDollarSign, 
  X,
  Sparkles,
  ArrowRight,
  Edit2,
  ChevronRight,
  History,
  Calendar
} from 'lucide-react';
import { IncomeRecord, UserID, UserProfile } from '../types';
import { parseIncomeText } from '../services/geminiService';

interface Props {
  records: IncomeRecord[];
  profiles: { husband: UserProfile; wife: UserProfile };
  onAddRecord: (record: Omit<IncomeRecord, 'id' | 'timestamp'>) => void;
  onDeleteRecord: (id: string) => void;
  currentUser: UserID;
  onSwitchUser: (user: UserID) => void;
  yearlyGoal: number;
  onUpdateGoal: (goal: number) => void;
}

const IncomeTracker: React.FC<Props> = ({ 
  records, 
  profiles,
  onAddRecord, 
  onDeleteRecord, 
  currentUser,
  onSwitchUser,
  yearlyGoal,
  onUpdateGoal
}) => {
  const [inputText, setInputText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(yearlyGoal.toString());
  const [showHistory, setShowHistory] = useState(false);
  
  const yearlyTotal = useMemo(() => records.reduce((sum, r) => sum + r.amount, 0), [records]);
  const progressPercent = Math.min((yearlyTotal / yearlyGoal) * 100, 100);

  // 格式化金额辅助函数
  const formatShorthand = (num: number) => {
    if (num >= 10000) return (num / 10000).toFixed(1).replace(/\.0$/, '') + 'W';
    return num.toLocaleString();
  };

  const formatFull = (num: number) => num.toLocaleString('zh-CN');

  // 处理流水历史分组
  const historyData = useMemo(() => {
    const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp);
    const groups: Record<string, { total: number; days: Record<string, { total: number; items: IncomeRecord[] }> }> = {};

    sorted.forEach(record => {
      const date = new Date(record.timestamp);
      const monthKey = `${date.getFullYear()}年${date.getMonth() + 1}月`;
      const dayKey = `${date.getDate()}日`;

      if (!groups[monthKey]) groups[monthKey] = { total: 0, days: {} };
      if (!groups[monthKey].days[dayKey]) groups[monthKey].days[dayKey] = { total: 0, items: [] };

      groups[monthKey].total += record.amount;
      groups[monthKey].days[dayKey].total += record.amount;
      groups[monthKey].days[dayKey].items.push(record);
    });

    return groups;
  }, [records]);

  const handleQuickInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isParsing) return;
    setIsParsing(true);
    try {
      const result = await parseIncomeText(inputText);
      if (result) {
        onAddRecord({ amount: result.amount, source: result.source, category: result.category, userId: currentUser });
        setInputText('');
      }
    } finally { setIsParsing(false); }
  };

  const saveGoal = () => {
    const val = parseFloat(tempGoal);
    if (!isNaN(val) && val > 0) {
      onUpdateGoal(val);
      setIsEditingGoal(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-24 animate-in fade-in duration-700">
      {/* 顶部总览卡片 */}
      <div 
        onClick={() => !isEditingGoal && setShowHistory(true)}
        className="bg-gradient-to-br from-rose-600 to-red-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-rose-500/20 relative overflow-hidden group active:scale-[0.98] transition-transform cursor-pointer"
      >
        <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
          <TrendingUp className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-1">
            <p className="text-rose-100/60 font-bold tracking-[0.2em] uppercase text-[9px]">Total Revenue 2026</p>
            <History className="w-4 h-4 text-rose-100/40" />
          </div>
          <h2 className="text-4xl font-black mb-6 tracking-tighter">
            ¥{formatFull(yearlyTotal)}
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div 
                className="flex items-center gap-1.5 group/goal"
                onClick={(e) => { e.stopPropagation(); setIsEditingGoal(true); }}
              >
                <span className="text-[10px] font-bold text-rose-100/80 uppercase">Target ¥{formatShorthand(yearlyGoal)}</span>
                <Edit2 className="w-3 h-3 text-rose-100/40 opacity-0 group-hover/goal:opacity-100 transition-opacity" />
              </div>
              <span className="text-xl font-black">{progressPercent.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 修改目标对话框 */}
      {isEditingGoal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-xs animate-in zoom-in-95">
            <h4 className="text-lg font-black mb-6 text-center text-slate-800">设定年度目标 🎯</h4>
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">¥</span>
              <input 
                autoFocus
                className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-8 text-xl font-black text-rose-600 focus:ring-0"
                type="number"
                value={tempGoal}
                onChange={e => setTempGoal(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsEditingGoal(false)} className="flex-1 bg-slate-100 py-4 rounded-xl font-bold text-slate-400">取消</button>
              <button 
                onClick={saveGoal} 
                className="flex-[2] bg-rose-600 text-white py-4 rounded-xl font-black"
              >
                保存目标
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 历史流水回顾面板 */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] bg-slate-50 overflow-y-auto animate-in slide-in-from-bottom-full duration-500">
          <div className="sticky top-0 bg-white/80 backdrop-blur-xl z-20 px-6 py-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900">财富足迹</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Wealth History Review</p>
            </div>
            <button 
              onClick={() => setShowHistory(false)}
              className="p-3 bg-slate-100 rounded-2xl text-slate-400 active:scale-90 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-10 pb-20">
            {/* Fix: Added type assertion to monthData to resolve 'unknown' type errors */}
            {Object.entries(historyData).map(([month, monthData]) => {
              const mData = monthData as { total: number; days: Record<string, { total: number; items: IncomeRecord[] }> };
              return (
                <div key={month} className="space-y-4">
                  <div className="flex justify-between items-end border-b-2 border-slate-200 pb-2">
                    <h4 className="text-2xl font-black text-slate-800 tracking-tighter">{month}</h4>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">月度累计</p>
                      <p className="text-lg font-black text-rose-600">+¥{formatFull(mData.total)}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Fix: Added type assertion to dayData to resolve 'unknown' type errors */}
                    {Object.entries(mData.days).map(([day, dayData]) => {
                      const dData = dayData as { total: number; items: IncomeRecord[] };
                      return (
                        <div key={day} className="flex gap-4">
                          <div className="w-12 pt-1">
                            <div className="bg-white rounded-xl p-2 shadow-sm border border-slate-100 text-center">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">{day.replace('日', '')}</p>
                              <p className="text-xs font-black text-slate-800">DAY</p>
                            </div>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-center px-1">
                              <span className="text-[10px] font-black text-slate-300">当日共 ¥{formatFull(dData.total)}</span>
                            </div>
                            <div className="space-y-2">
                              {dData.items.map(record => (
                                <div key={record.id} className="bg-white px-4 py-3 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                                      {record.category.includes('工作') ? <Briefcase className="w-4 h-4 text-rose-500" /> : <ShoppingBag className="w-4 h-4 text-amber-500" />}
                                    </div>
                                    <div>
                                      <p className="text-xs font-black text-slate-700">{record.source}</p>
                                      <p className="text-[8px] font-bold text-slate-300 uppercase">{profiles[record.userId].name}</p>
                                    </div>
                                  </div>
                                  <span className="text-sm font-black text-rose-600">+¥{formatFull(record.amount)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 快捷输入 */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <form onSubmit={handleQuickInput} className="relative">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isParsing}
            placeholder='“今天副业赚了1000”'
            className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-6 pr-14 focus:ring-0 text-slate-800 font-bold placeholder:text-slate-300"
          />
          <button 
            type="submit"
            disabled={isParsing || !inputText}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-md active:scale-90 transition-all disabled:opacity-30"
          >
            {isParsing ? <Sparkles className="w-5 h-5 animate-spin text-rose-400" /> : <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex bg-slate-50 p-1 rounded-full">
            {(['wife', 'husband'] as const).map(user => (
              <button 
                key={user}
                onClick={() => onSwitchUser(user)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${currentUser === user ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-300'}`}
              >
                {profiles[user].name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 收益列表 - 主界面展示最近记录 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            每日流水
            <span className="text-[10px] text-slate-300 font-bold">RECENT</span>
          </h3>
          <button 
            onClick={() => setShowHistory(true)}
            className="text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-1"
          >
            查看历史 <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-[2rem] border-2 border-dashed border-slate-50">
            <p className="text-slate-300 text-xs font-bold">暂无流水</p>
          </div>
        ) : (
          records.slice().reverse().slice(0, 5).map((record) => (
            <div key={record.id} className="bg-white p-5 rounded-[2rem] border border-slate-50 flex items-center justify-between group relative hover:border-rose-100 transition-all">
              <button 
                onClick={() => onDeleteRecord(record.id)}
                className="absolute top-2 right-2 p-1.5 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-rose-50">
                  {record.category.includes('工作') ? <Briefcase className="w-5 h-5 text-rose-600" /> : <ShoppingBag className="w-5 h-5 text-amber-600" />}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm leading-tight">{record.source}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black text-rose-500/60 uppercase">{profiles[record.userId].name}</span>
                    <span className="text-[9px] font-bold text-slate-300">{new Date(record.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <span className="text-xl font-black text-rose-600 tracking-tight">+¥{formatShorthand(record.amount)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IncomeTracker;

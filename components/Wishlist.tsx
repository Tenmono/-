
import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus,
  Trash2,
  X,
  Trophy,
  Pin,
  RotateCcw,
  Clock,
  ChevronDown,
  History,
  PencilLine,
  GripVertical,
  MoreVertical,
  Camera,
  PinOff
} from 'lucide-react';
import { Wish, IncomeRecord, UserID, UserProfile } from '../types';
import { calculateEstimatedDays } from '../services/localParserService.ts';

interface Props {
  wishes: Wish[];
  profiles: { husband: UserProfile; wife: UserProfile };
  currentUser: UserID;
  onAddWish: (wish: Omit<Wish, 'id'>) => void;
  onUpdateWish: (id: string, updates: Partial<Wish>) => void;
  onDeleteWish: (id: string) => void;
  onReorderWishes: (newWishes: Wish[]) => void;
  incomeRecords: IncomeRecord[];
}

const Wishlist: React.FC<Props> = ({ 
  wishes, 
  profiles, 
  currentUser, 
  onAddWish, 
  onUpdateWish, 
  onDeleteWish, 
  onReorderWishes,
  incomeRecords 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newWish, setNewWish] = useState({ title: '', target: '', imageUrl: '' });
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [undoWish, setUndoWish] = useState<Wish | null>(null);
  const [activeInjectId, setActiveInjectId] = useState<string | null>(null);
  const [injectAmount, setInjectAmount] = useState('');
  
  const [showHistoryId, setShowHistoryId] = useState<string | null>(null);
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [editTargetForm, setEditTargetForm] = useState('');
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleForm, setEditTitleForm] = useState('');

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeImageWishId = useRef<string | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sortedWishes = useMemo(() => {
    const pinned = wishes.filter(w => w.isPinned);
    const others = wishes.filter(w => !w.isPinned);
    return [...pinned, ...others];
  }, [wishes]);

  const handleCreateWish = () => {
    if (!newWish.title || !newWish.target) return;
    onAddWish({
      title: newWish.title,
      targetAmount: parseFloat(newWish.target),
      currentSavedAmount: 0,
      status: 'pending',
      userId: currentUser,
      imageUrl: newWish.imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${Math.random()}`
    });
    setNewWish({ title: '', target: '', imageUrl: '' });
    setIsAdding(false);
  };

  const handleDelete = (wish: Wish) => {
    if (window.confirm(`确认要移除心愿“${wish.title}”吗？`)) {
      setUndoWish(wish);
      onDeleteWish(wish.id);
      if (undoTimer.current) clearTimeout(undoTimer.current);
      undoTimer.current = setTimeout(() => setUndoWish(null), 6000);
      setOpenMenuId(null);
    }
  };

  const handleUndo = () => {
    if (undoWish) {
      onAddWish(undoWish);
      setUndoWish(null);
      if (undoTimer.current) clearTimeout(undoTimer.current);
    }
  };

  const handleInject = (wish: Wish) => {
    const amount = parseFloat(injectAmount);
    if (isNaN(amount) || amount <= 0) return;
    const newSaved = wish.currentSavedAmount + amount;
    const newHistory = [...(wish.savingsHistory || []), { amount, timestamp: Date.now() }];
    onUpdateWish(wish.id, { 
      currentSavedAmount: Math.min(newSaved, wish.targetAmount),
      status: newSaved >= wish.targetAmount ? 'completed' : 'ongoing',
      savingsHistory: newHistory
    });
    setActiveInjectId(null);
    setInjectAmount('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeImageWishId.current) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateWish(activeImageWishId.current!, { imageUrl: reader.result as string });
        activeImageWishId.current = null;
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragStart = (id: string) => {
    setDraggedId(id);
    setOpenMenuId(null);
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedId === null) return;
    const fromIndex = wishes.findIndex(w => w.id === draggedId);
    if (fromIndex !== index) {
      const newWishes = [...wishes];
      const [moved] = newWishes.splice(fromIndex, 1);
      newWishes.splice(index, 0, moved);
      onReorderWishes(newWishes);
    }
  };

  return (
    <div className="pb-24 flex flex-col gap-5 animate-in fade-in duration-500">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleImageUpload} 
      />

      <div className="flex items-center justify-between px-2">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">愿景蓝图</h3>
        <button onClick={() => setIsAdding(true)} className="bg-rose-600 text-white p-3 rounded-2xl shadow-lg active:scale-90 transition-all">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-50 animate-in slide-in-from-top-4 relative z-50">
          <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 p-2 text-slate-300"><X className="w-4 h-4" /></button>
          <div className="space-y-4 pt-2">
            <input className="w-full bg-slate-50 rounded-xl p-4 font-bold border-none" placeholder="想要实现什么？" value={newWish.title} onChange={e => setNewWish({...newWish, title: e.target.value})} />
            <input className="w-full bg-slate-50 rounded-xl p-4 font-bold border-none" placeholder="所需金额 (¥)" type="number" value={newWish.target} onChange={e => setNewWish({...newWish, target: e.target.value})} />
            <button onClick={handleCreateWish} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest">设定目标</button>
          </div>
        </div>
      )}

      {/* 修改标题 Modal */}
      {editingTitleId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-xs text-center animate-in zoom-in-95">
            <h4 className="text-xl font-black mb-4">修改心愿名称</h4>
            <input autoFocus className="w-full bg-slate-50 rounded-2xl p-4 text-center font-bold text-slate-800 border-none mb-6" value={editTitleForm} onChange={e => setEditTitleForm(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setEditingTitleId(null)} className="flex-1 font-bold text-slate-300">取消</button>
              <button onClick={() => { onUpdateWish(editingTitleId, { title: editTitleForm }); setEditingTitleId(null); }} className="flex-[2] bg-slate-900 text-white py-4 rounded-xl font-black">保存</button>
            </div>
          </div>
        </div>
      )}

      {/* 修改金额 Modal */}
      {editingTargetId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-xs text-center animate-in zoom-in-95">
            <h4 className="text-xl font-black mb-4">修改目标金额</h4>
            <input autoFocus className="w-full bg-slate-50 rounded-2xl p-4 text-center text-2xl font-black text-slate-800 border-none mb-6" type="number" value={editTargetForm} onChange={e => setEditTargetForm(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setEditingTargetId(null)} className="flex-1 font-bold text-slate-300">取消</button>
              <button onClick={() => { const val = parseFloat(editTargetForm); if(val>0) { onUpdateWish(editingTargetId, { targetAmount: val }); setEditingTargetId(null); } }} className="flex-[2] bg-slate-900 text-white py-4 rounded-xl font-black">保存</button>
            </div>
          </div>
        </div>
      )}

      {undoWish && (
        <div className="fixed bottom-28 left-6 right-6 z-[60] animate-in slide-in-from-bottom-10">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl flex items-center justify-between shadow-2xl border border-white/10">
            <span className="text-xs font-bold flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-500" /> 已移除“{undoWish.title}”
            </span>
            <button onClick={handleUndo} className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-lg active:scale-95 transition-all">
              <RotateCcw className="w-4 h-4" /> 撤销
            </button>
          </div>
        </div>
      )}

      {activeInjectId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-xs text-center">
            <h4 className="text-xl font-black mb-4">存入梦想金 ✨</h4>
            <input autoFocus className="w-full bg-slate-50 rounded-2xl p-4 text-center text-3xl font-black text-rose-600 border-none mb-6" type="number" value={injectAmount} onChange={e => setInjectAmount(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setActiveInjectId(null)} className="flex-1 font-bold text-slate-300">取消</button>
              <button onClick={() => { const w = wishes.find(x => x.id === activeInjectId); if(w) handleInject(w); }} className="flex-[2] bg-rose-600 text-white py-4 rounded-xl font-black">存入</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {sortedWishes.map((wish, index) => {
          const progress = Math.min((wish.currentSavedAmount / wish.targetAmount) * 100, 100);
          const isDragging = draggedId === wish.id;
          const isHistoryOpen = showHistoryId === wish.id;
          const isMenuOpen = openMenuId === wish.id;
          const estimatedDays = calculateEstimatedDays(wish.targetAmount, wish.currentSavedAmount, incomeRecords);

          return (
            <div 
              key={wish.id} 
              draggable 
              onDragStart={() => onDragStart(wish.id)}
              onDragOver={(e) => onDragOver(e, index)} 
              onDragEnd={() => setDraggedId(null)} 
              className={`bg-white rounded-[2rem] transition-all duration-300 border border-slate-100 shadow-sm relative group ${isDragging ? 'opacity-30 scale-95' : 'opacity-100'}`}
            >
              {/* More Menu Dropdown */}
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-[90]" onClick={() => setOpenMenuId(null)} />
                  <div className="absolute right-4 top-12 w-48 bg-white border border-slate-100 rounded-3xl shadow-2xl z-[100] p-2 animate-in zoom-in-95 origin-top-right">
                    <button 
                      onClick={() => { onUpdateWish(wish.id, { isPinned: !wish.isPinned }); setOpenMenuId(null); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-2xl text-xs font-bold text-slate-700 transition-colors"
                    >
                      {wish.isPinned ? <PinOff className="w-4 h-4 text-slate-400" /> : <Pin className="w-4 h-4 text-rose-500" />}
                      {wish.isPinned ? '取消置顶' : '置顶展示'}
                    </button>
                    <button 
                      onClick={() => { setEditingTitleId(wish.id); setEditTitleForm(wish.title); setOpenMenuId(null); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-2xl text-xs font-bold text-slate-700 transition-colors"
                    >
                      <PencilLine className="w-4 h-4 text-slate-400" /> 重命名心愿
                    </button>
                    <button 
                      onClick={() => { setEditingTargetId(wish.id); setEditTargetForm(wish.targetAmount.toString()); setOpenMenuId(null); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-2xl text-xs font-bold text-slate-700 transition-colors"
                    >
                      <History className="w-4 h-4 text-slate-400" /> 更改目标金额
                    </button>
                    <div className="h-px bg-slate-100 my-1 mx-2" />
                    <button 
                      onClick={() => handleDelete(wish)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-50 rounded-2xl text-xs font-bold text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> 移除心愿
                    </button>
                  </div>
                </>
              )}

              <div className="p-4 flex gap-4 relative">
                {/* Drag Handle */}
                <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1">
                   <GripVertical className="w-4 h-4 text-slate-300" />
                </div>

                {/* Main Content */}
                <div className="flex gap-4 flex-1 ml-4 overflow-hidden">
                  <div 
                    className="relative flex-shrink-0 cursor-pointer group/img"
                    onClick={() => { activeImageWishId.current = wish.id; fileInputRef.current?.click(); }}
                  >
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm bg-slate-50 border border-slate-100">
                      <img src={wish.imageUrl} className="w-full h-full object-cover opacity-80" alt="" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="absolute top-1 left-1 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-lg flex items-center gap-1">
                      <span className="text-[10px] leading-none">{profiles[wish.userId].avatar}</span>
                      <span className="text-[7px] font-black text-white">{profiles[wish.userId].name}</span>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1" onClick={() => wish.status !== 'completed' && setActiveInjectId(wish.id)}>
                         <h4 className={`font-black text-sm leading-tight truncate ${wish.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{wish.title}</h4>
                         {wish.status !== 'completed' && (
                           <div className="flex items-center gap-1 mt-1 text-slate-400">
                             <Clock className="w-2.5 h-2.5" />
                             <span className="text-[8px] font-bold">
                               {estimatedDays === null ? '需更多收益数据' : `预计 ${estimatedDays} 天实现`}
                             </span>
                           </div>
                         )}
                      </div>
                      <div className="flex gap-1 items-center flex-shrink-0">
                        {wish.status === 'completed' ? <Trophy className="w-3.5 h-3.5 text-amber-500" /> : wish.isPinned && <Pin className="w-3.5 h-3.5 text-rose-500 fill-current" />}
                        <button 
                          onClick={() => setOpenMenuId(isMenuOpen ? null : wish.id)}
                          className={`p-1.5 rounded-xl transition-all ${isMenuOpen ? 'bg-slate-100 text-slate-800' : 'text-slate-300 hover:text-slate-500 active:bg-slate-50'}`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 mt-2">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-1 group/history cursor-pointer" onClick={() => setShowHistoryId(isHistoryOpen ? null : wish.id)}>
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{Math.round(progress)}% SAVED</span>
                           <History className={`w-2.5 h-2.5 text-slate-300 group-hover/history:text-rose-400 transition-colors ${isHistoryOpen ? 'text-rose-400' : ''}`} />
                        </div>
                        <div className="text-right" onClick={() => wish.status !== 'completed' && setActiveInjectId(wish.id)}>
                          <span className="text-xs font-black text-rose-600 block leading-none">¥{wish.currentSavedAmount.toLocaleString()}</span>
                          <span className="text-[8px] font-bold text-slate-300">/ ¥{wish.targetAmount.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-700 ${wish.status === 'completed' ? 'bg-amber-400' : 'bg-rose-500'}`} style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/*注资历史展示*/}
              {isHistoryOpen && (
                <div className="bg-slate-50 border-t border-slate-100 p-4 animate-in slide-in-from-top-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <History className="w-2.5 h-2.5" /> 注入记录
                  </p>
                  <div className="space-y-2">
                    {(!wish.savingsHistory || wish.savingsHistory.length === 0) ? (
                      <p className="text-[10px] font-bold text-slate-300 text-center py-2 italic">暂无注入记录</p>
                    ) : (
                      wish.savingsHistory.slice().reverse().map((h, i) => (
                        <div key={i} className="flex justify-between items-center bg-white px-3 py-2 rounded-xl text-[10px] border border-slate-100 shadow-sm">
                          <span className="font-bold text-slate-400">{new Date(h.timestamp).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="font-black text-rose-600">+¥{h.amount.toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <button onClick={() => setShowHistoryId(null)} className="w-full flex justify-center py-2 mt-2 text-slate-300 active:scale-95 transition-transform">
                    <ChevronDown className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;

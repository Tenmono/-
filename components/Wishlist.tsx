
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus,
  Trash2,
  Image as ImageIcon,
  X,
  Trophy,
  Pin,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { Wish, WishStatus, IncomeRecord, UserID, UserProfile } from '../types';

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
  const [swipeData, setSwipeData] = useState<{ id: string, x: number } | null>(null);
  const [undoWish, setUndoWish] = useState<Wish | null>(null);
  const [activeInjectId, setActiveInjectId] = useState<string | null>(null);
  const [injectAmount, setInjectAmount] = useState('');

  // Fix: Use ReturnType<typeof setTimeout> instead of NodeJS.Timeout to avoid namespace errors in browser environment
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 排序逻辑
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
      imageUrl: newWish.imageUrl || `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1501785888041-af3ef285b470' : '1464822759023-fed622ff2c3b'}?w=200&h=200&fit=crop`
    });
    setNewWish({ title: '', target: '', imageUrl: '' });
    setIsAdding(false);
  };

  const handleDelete = (wish: Wish) => {
    setUndoWish(wish);
    onDeleteWish(wish.id);
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndoWish(null), 5000);
  };

  const handleUndo = () => {
    if (undoWish) {
      onAddWish(undoWish);
      setUndoWish(null);
      if (undoTimer.current) clearTimeout(undoTimer.current);
    }
  };

  // 拖拽排序逻辑 (模拟)
  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    const timer = setTimeout(() => setDraggedId(id), 500);
    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener('pointerup', cleanup);
    };
    window.addEventListener('pointerup', cleanup);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
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

  // 滑动移除逻辑
  const touchStart = useRef<number>(0);
  const onTouchStart = (e: React.TouchEvent, id: string) => {
    touchStart.current = e.touches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent, id: string) => {
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - touchStart.current;
    if (Math.abs(deltaX) > 10) {
      setSwipeData({ id, x: deltaX });
    }
  };

  const onTouchEnd = (e: React.TouchEvent, wish: Wish) => {
    if (swipeData && swipeData.id === wish.id) {
      if (Math.abs(swipeData.x) > 150) {
        handleDelete(wish);
      }
    }
    setSwipeData(null);
  };

  const handleInject = (wish: Wish) => {
    const amount = parseFloat(injectAmount);
    if (isNaN(amount) || amount <= 0) return;
    const newSaved = wish.currentSavedAmount + amount;
    onUpdateWish(wish.id, { 
      currentSavedAmount: Math.min(newSaved, wish.targetAmount),
      status: newSaved >= wish.targetAmount ? 'completed' : 'ongoing'
    });
    setActiveInjectId(null);
    setInjectAmount('');
  };

  return (
    <div className="pb-24 flex flex-col gap-5 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">心愿单</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-rose-600 text-white p-3 rounded-2xl shadow-lg active:scale-90 transition-all"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-50 animate-in slide-in-from-top-4 relative z-50">
          <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 p-2 text-slate-300"><X className="w-4 h-4" /></button>
          <div className="space-y-4 pt-2">
            <input className="w-full bg-slate-50 rounded-xl p-4 font-bold border-none" placeholder="心愿名称" value={newWish.title} onChange={e => setNewWish({...newWish, title: e.target.value})} />
            <input className="w-full bg-slate-50 rounded-xl p-4 font-bold border-none" placeholder="目标金额 (¥)" type="number" value={newWish.target} onChange={e => setNewWish({...newWish, target: e.target.value})} />
            <button onClick={handleCreateWish} className="w-full bg-rose-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest">立下心愿</button>
          </div>
        </div>
      )}

      {/* 撤销提示 */}
      {undoWish && (
        <div className="fixed bottom-28 left-6 right-6 z-[60] animate-in slide-in-from-bottom-10">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl flex items-center justify-between shadow-2xl">
            <span className="text-xs font-bold">已移除“{undoWish.title}”</span>
            <button onClick={handleUndo} className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-widest">
              <RotateCcw className="w-4 h-4" /> 撤销
            </button>
          </div>
        </div>
      )}

      {/* 注入面板 */}
      {activeInjectId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-xs text-center">
            <h4 className="text-xl font-black mb-4">助力梦想 ✨</h4>
            <input autoFocus className="w-full bg-slate-50 rounded-2xl p-4 text-center text-3xl font-black text-rose-600 border-none mb-6" type="number" value={injectAmount} onChange={e => setInjectAmount(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setActiveInjectId(null)} className="flex-1 font-bold text-slate-300">取消</button>
              <button onClick={() => { const w = wishes.find(x => x.id === activeInjectId); if(w) handleInject(w); }} className="flex-[2] bg-rose-600 text-white py-4 rounded-xl font-black">注入</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {sortedWishes.map((wish, index) => {
          const progress = Math.min((wish.currentSavedAmount / wish.targetAmount) * 100, 100);
          const isSwiping = swipeData && swipeData.id === wish.id;
          const isDragging = draggedId === wish.id;

          return (
            <div 
              key={wish.id}
              draggable
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={() => setDraggedId(null)}
              className={`relative overflow-hidden rounded-[2rem] transition-all duration-300 ${isDragging ? 'opacity-30 scale-95' : 'opacity-100'}`}
            >
              {/* 背景删除指示器 */}
              <div className="absolute inset-0 bg-rose-600 flex items-center justify-between px-10">
                <Trash2 className="w-6 h-6 text-white" />
                <Trash2 className="w-6 h-6 text-white" />
              </div>

              {/* 卡片主体 */}
              <div 
                onPointerDown={(e) => handlePointerDown(e, wish.id)}
                onTouchStart={(e) => onTouchStart(e, wish.id)}
                onTouchMove={(e) => onTouchMove(e, wish.id)}
                onTouchEnd={(e) => onTouchEnd(e, wish)}
                onClick={() => wish.status !== 'completed' && setActiveInjectId(wish.id)}
                style={{ transform: `translateX(${isSwiping ? swipeData!.x : 0}px)` }}
                className="bg-white p-3 flex gap-4 relative z-10 transition-transform duration-100 ease-out cursor-pointer active:scale-[0.98]"
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden relative flex-shrink-0 shadow-sm">
                  <img src={wish.imageUrl} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute top-1 left-1 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-lg flex items-center gap-1">
                    <img src={profiles[wish.userId].avatar} className="w-2.5 h-2.5 rounded-full" alt="" />
                    <span className="text-[7px] font-black text-white">{profiles[wish.userId].name}</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`font-black text-sm leading-tight ${wish.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      {wish.title}
                    </h4>
                    {wish.status === 'completed' ? <Trophy className="w-3.5 h-3.5 text-amber-500" /> : wish.isPinned && <Pin className="w-3.5 h-3.5 text-rose-500 fill-current" />}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-end">
                      <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{Math.round(progress)}% PROGRESS</span>
                      <span className="text-xs font-black text-rose-600">¥{wish.currentSavedAmount.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-700 ${wish.status === 'completed' ? 'bg-amber-400' : 'bg-rose-600'}`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;

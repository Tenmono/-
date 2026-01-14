
import React, { useState, useEffect } from 'react';
import { X, Camera, Link2Off, QrCode, ScanLine, Copy, CheckCircle2, ChevronRight } from 'lucide-react';
import { UserProfile, FamilyConfig, IncomeRecord, Wish } from '../types';
import QRCode from 'qrcode';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface Props {
  profiles: { husband: UserProfile; wife: UserProfile };
  familyConfig: FamilyConfig;
  records: IncomeRecord[];
  wishes: Wish[];
  onImportData: (data: { records: IncomeRecord[], wishes: Wish[] }) => void;
  onUnpair: () => void;
  onUpdate: (userId: 'husband' | 'wife', updates: Partial<UserProfile>) => void;
  onClose: () => void;
}

const EMOJIS = ['👨🏻‍💻', '👩🏻‍🎨', '🦁', '🐯', '🐷', '🐻', '🐼', '🦁', '🐱', '🐶', '🦊', '🐨', '🐰', '🐭', '🐣', '🌈', '💎', '🔥', '✨', '🍀'];

const SettingsModal: React.FC<Props> = ({ profiles, familyConfig, records, wishes, onImportData, onUnpair, onUpdate, onClose }) => {
  const [syncMode, setSyncMode] = useState<'none' | 'export' | 'import'>('none');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success'>('idle');
  const [editingAvatarId, setEditingAvatarId] = useState<'husband' | 'wife' | null>(null);

  // 生成导出二维码
  useEffect(() => {
    if (syncMode === 'export') {
      const dataToExport = JSON.stringify({ records, wishes });
      QRCode.toDataURL(dataToExport, { margin: 2, width: 300 })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error(err));
    }
  }, [syncMode, records, wishes]);

  // 初始化扫描器
  useEffect(() => {
    if (syncMode === 'import') {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render((decodedText) => {
        try {
          const data = JSON.parse(decodedText);
          if (data.records && data.wishes) {
            onImportData(data);
            scanner.clear();
            setImportStatus('success');
            setTimeout(() => setSyncMode('none'), 1500);
          }
        } catch (e) {
          alert("无效的同步码");
        }
      }, (err) => {});
      return () => { scanner.clear(); };
    }
  }, [syncMode]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-slate-800">本地设置</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {editingAvatarId ? (
          <div className="animate-in zoom-in-95">
            <h4 className="text-center font-black text-slate-800 mb-6">选择新头像</h4>
            <div className="grid grid-cols-5 gap-3 mb-8">
              {EMOJIS.map(emoji => (
                <button 
                  key={emoji} 
                  onClick={() => { onUpdate(editingAvatarId, { avatar: emoji }); setEditingAvatarId(null); }}
                  className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl hover:bg-rose-50 transition-colors border border-slate-100"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <button onClick={() => setEditingAvatarId(null)} className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-black">返回</button>
          </div>
        ) : syncMode === 'none' ? (
          <div className="space-y-8">
            <div className="flex items-center justify-around bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
               <button onClick={() => setSyncMode('export')} className="flex flex-col items-center gap-2 group">
                 <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-active:scale-95 transition-all">
                    <QrCode className="w-6 h-6 text-blue-600" />
                 </div>
                 <span className="text-[10px] font-black text-slate-500">导出数据</span>
               </button>
               <div className="w-px h-10 bg-slate-200" />
               <button onClick={() => setSyncMode('import')} className="flex flex-col items-center gap-2 group">
                 <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-active:scale-95 transition-all">
                    <ScanLine className="w-6 h-6 text-blue-600" />
                 </div>
                 <span className="text-[10px] font-black text-slate-500">扫码同步</span>
               </button>
            </div>

            {(['wife', 'husband'] as const).map(user => (
              <div key={user} className="flex items-center gap-4">
                <div onClick={() => setEditingAvatarId(user)} className="cursor-pointer relative group">
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl shadow-sm group-active:scale-95 transition-all">
                    {profiles[user].avatar}
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1.5 bg-rose-500 text-white rounded-xl shadow-lg">
                    <Camera className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">昵称</p>
                  <input className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 font-bold text-slate-700 focus:ring-2 focus:ring-rose-500/20" value={profiles[user].name} onChange={e => onUpdate(user, { name: e.target.value })} />
                </div>
              </div>
            ))}

            <div className="pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">隐私状态</p>
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-1">本地端对端安全</h4>
                </div>
                <button onClick={() => { if(confirm('解除配对将清空连接状态，本地数据仍会保留。')) onUnpair(); }} className="p-3 bg-slate-100 text-slate-400 rounded-2xl active:scale-90 transition-all">
                  <Link2Off className="w-5 h-5" />
                </button>
              </div>
              <button onClick={onClose} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-xs">保存并返回</button>
            </div>
          </div>
        ) : syncMode === 'export' ? (
          <div className="text-center animate-in zoom-in-95">
             <p className="text-sm font-bold text-slate-600 mb-6">让 TA 扫描此码即可同步数据</p>
             <div className="bg-slate-50 p-4 rounded-3xl mb-8">
               {qrDataUrl && <img src={qrDataUrl} className="w-full h-auto rounded-xl" alt="Sync QR" />}
             </div>
             <button onClick={() => setSyncMode('none')} className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-black">返回</button>
          </div>
        ) : (
          <div className="text-center animate-in zoom-in-95">
             {importStatus === 'idle' ? (
               <>
                 <p className="text-sm font-bold text-slate-600 mb-6">扫描 TA 屏幕上的二维码</p>
                 <div id="reader" className="w-full bg-slate-100 rounded-3xl overflow-hidden mb-8"></div>
               </>
             ) : (
               <div className="py-12 space-y-4">
                 <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                 <h4 className="text-xl font-black text-slate-800">同步成功！</h4>
               </div>
             )}
             <button onClick={() => setSyncMode('none')} className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-black">返回</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;

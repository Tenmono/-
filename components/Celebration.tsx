
import React, { useEffect, useState } from 'react';
import { PartyPopper, Heart } from 'lucide-react';

interface Props {
  userName: string;
  onComplete: () => void;
}

const Celebration: React.FC<Props> = ({ userName, onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-rose-600/95 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="text-center p-8 scale-in-center">
        <div className="flex justify-center gap-4 mb-6 animate-bounce">
          <PartyPopper className="w-20 h-20 text-white" />
          <Heart className="w-20 h-20 text-white fill-current" />
        </div>
        <h2 className="text-5xl font-black text-white mb-4 tracking-tighter drop-shadow-2xl">
          {userName}太棒了！
        </h2>
        <p className="text-rose-50 text-2xl font-medium animate-pulse">
          一笔巨款已带回家！🏮
        </p>
        
        {/* Simple CSS Fireworks Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(24)].map((_, i) => (
            <div 
              key={i}
              className="absolute bg-white rounded-full animate-ping opacity-40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 15 + 5}px`,
                height: `${Math.random() * 15 + 5}px`,
                animationDuration: `${Math.random() * 1 + 1}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Celebration;

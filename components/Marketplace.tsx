
import React from 'react';
import { GlassCard } from './ui/GlassCard';
import { MARKET_ITEMS } from '../constants';
import { ShoppingBag, Music, Layout, Battery, Lock, Check } from 'lucide-react';
import { MarketItem } from '../types';

interface MarketplaceProps {
  credits: number;
  ownedItemIds: string[];
  onPurchase: (item: MarketItem) => boolean;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ credits, ownedItemIds, onPurchase }) => {
  
  const handleBuy = (item: MarketItem) => {
    const success = onPurchase(item);
    if (success) {
      // Optional: Add sound effect or confetti here
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold neon-text">Black Market</h2>
          <p className="text-gray-400 text-sm">Trade credits for neural enhancements.</p>
        </div>
        <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/50 rounded-lg text-yellow-400 font-mono font-bold shadow-[0_0_15px_rgba(234,179,8,0.2)]">
          {credits} CR
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MARKET_ITEMS.map((item) => {
          const isOwned = ownedItemIds.includes(item.id);
          const canAfford = credits >= item.cost;
          
          return (
            <GlassCard key={item.id} className="flex justify-between items-center group relative overflow-hidden">
              {/* Background Glow for Powerups */}
              {item.type === 'powerup' && <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />}

              <div className="flex items-center gap-4 relative z-10">
                <div className={`p-3 rounded-lg border border-white/5 ${
                  item.type === 'skin' ? 'bg-purple-500/20 text-purple-400' : 
                  item.type === 'music' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {item.type === 'skin' && <Layout size={24} />}
                  {item.type === 'music' && <Music size={24} />}
                  {item.type === 'powerup' && <Battery size={24} />}
                </div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-cyber-neonBlue transition-colors">{item.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400 uppercase">{item.type}</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => !isOwned && handleBuy(item)}
                disabled={isOwned || !canAfford}
                className={`px-4 py-2 rounded font-mono text-xs font-bold border transition-all flex items-center gap-2 ${
                  isOwned 
                    ? 'bg-gray-800 text-green-500 border-green-500/50 cursor-default' 
                    : canAfford 
                      ? 'bg-cyber-neonBlue/10 text-cyber-neonBlue border-cyber-neonBlue hover:bg-cyber-neonBlue hover:text-black shadow-[0_0_10px_rgba(0,243,255,0.2)]'
                      : 'bg-transparent text-gray-600 border-gray-800 cursor-not-allowed'
                }`}
              >
                {isOwned ? (
                  <>OWNED <Check size={14} /></>
                ) : (
                  <>{item.cost} CR {!canAfford && <Lock size={12} />}</>
                )}
              </button>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

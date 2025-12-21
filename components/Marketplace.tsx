
import React, { useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { MARKET_ITEMS } from '../constants';
import { Music, Layout, Battery, Lock, Check, Filter, Loader2 } from 'lucide-react';
import { MarketItem } from '../types';

interface MarketplaceProps {
  credits: number;
  ownedItemIds: string[];
  onPurchase: (item: MarketItem) => Promise<boolean>;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ credits, ownedItemIds, onPurchase }) => {
  const [filterType, setFilterType] = useState<'all' | 'music' | 'skin' | 'powerup'>('all');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  
  const filteredItems = MARKET_ITEMS.filter(item => 
    filterType === 'all' ? true : item.type === filterType
  );

  const handleBuy = async (item: MarketItem) => {
    setPurchasingId(item.id);
    await onPurchase(item);
    setPurchasingId(null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 space-y-6 pb-24">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Market</h2>
          <p className="text-ios-gray text-[10px] font-black uppercase tracking-widest">Neural Gear</p>
        </div>
        <div className="px-4 py-2.5 glass-ios rounded-2xl border border-yellow-500/20 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_#eab308]" />
          <span className="text-yellow-500 font-black text-sm">{credits} CR</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
        {[
          { id: 'all', label: 'All', icon: Filter },
          { id: 'music', label: 'Audio', icon: Music },
          { id: 'skin', label: 'Skins', icon: Layout },
          { id: 'powerup', label: 'Gear', icon: Battery },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterType(cat.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ios-tap ${
              filterType === cat.id ? 'bg-white text-black shadow-lg shadow-white/20' : 'glass-ios text-white/40'
            }`}
          >
            <cat.icon size={14} />
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 px-1">
        {filteredItems.map((item) => {
          const isOwned = ownedItemIds.includes(item.id);
          const canAfford = credits >= item.cost;
          const isPurchasing = purchasingId === item.id;
          
          return (
            <GlassCard key={item.id} className="flex justify-between items-center p-5 border-white/5">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  item.type === 'skin' ? 'bg-ios-purple/10 text-ios-purple' : 
                  item.type === 'music' ? 'bg-ios-blue/10 text-ios-blue' : 'bg-ios-green/10 text-ios-green'
                }`}>
                  {item.type === 'skin' && <Layout size={20} />}
                  {item.type === 'music' && <Music size={20} />}
                  {item.type === 'powerup' && <Battery size={20} />}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-white text-sm truncate max-w-[160px]">{item.name}</h3>
                  <span className="text-[9px] font-black text-ios-gray uppercase tracking-widest">{item.type}</span>
                </div>
              </div>
              
              <button 
                onClick={() => !isOwned && !isPurchasing && handleBuy(item)}
                disabled={isOwned || !canAfford || isPurchasing}
                className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ios-tap ${
                  isOwned 
                    ? 'bg-ios-green/10 text-ios-green border border-ios-green/20' 
                    : canAfford 
                      ? 'bg-white text-black hover:bg-white/90'
                      : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                }`}
              >
                {isPurchasing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : isOwned ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  <>
                    {item.cost}
                    {!canAfford && <Lock size={12} />}
                  </>
                )}
              </button>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

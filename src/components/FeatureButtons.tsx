import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Gift, Headphones, Shield } from 'lucide-react';

const FeatureButtons: React.FC = () => {
  const handleLiveAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Handle live betting action
    console.log('Live In-Play Action clicked');
  };

  const handleBonusAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Handle bonus offers action
    console.log('Bonus Offers & Rewards clicked');
  };

  const handleSupportAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Handle 24/7 support action
    console.log('24/7 Support clicked');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {/* Live In-Play Button */}
      <button
        type="button"
        onClick={handleLiveAction}
        className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-orange-600 p-6 text-white transition-all hover:scale-105 hover:shadow-lg"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-3">
            <Play className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold mb-2">Live In-Play</h3>
          <p className="text-sm opacity-90">Bet as match unfolds with real-time odds updates</p>
        </div>
        <div className="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-10"></div>
      </button>

      {/* Bonus Offers Button */}
      <button
        type="button"
        onClick={handleBonusAction}
        className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white transition-all hover:scale-105 hover:shadow-lg"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-3">
            <Gift className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold mb-2">Bonus Offers</h3>
          <p className="text-sm opacity-90">Daily boosts, free bets and weekly cashback</p>
        </div>
        <div className="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-10"></div>
      </button>

      {/* 24/7 Support Button */}
      <button
        type="button"
        onClick={handleSupportAction}
        className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white transition-all hover:scale-105 hover:shadow-lg"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-3">
            <Headphones className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold mb-2">24/7 Support</h3>
          <p className="text-sm opacity-90">Our Nairobi-based team is always one tap away</p>
        </div>
        <div className="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-10"></div>
      </button>
    </div>
  );
};

export default FeatureButtons;

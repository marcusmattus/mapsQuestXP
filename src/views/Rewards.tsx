import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { Gift, Star, ShoppingBag, Clock, Lock } from 'lucide-react';

const RewardCard = ({ title, cost, icon: Icon, color, locked }: any) => (
  <div className={`bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden ${locked ? 'opacity-60' : ''}`}>
    {locked && (
      <div className="absolute inset-0 bg-gray-900/5 backdrop-blur-[1px] flex items-center justify-center z-10">
        <div className="bg-white p-3 rounded-full shadow-lg">
          <Lock size={24} className="text-gray-400" />
        </div>
      </div>
    )}
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white mb-4 shadow-lg`}>
      <Icon size={24} />
    </div>
    <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
    <div className="flex items-center gap-1 text-yellow-600 font-bold text-sm">
      <Star size={14} fill="currentColor" />
      <span>{cost} Points</span>
    </div>
    <button 
      disabled={locked}
      className={`w-full mt-4 py-2 rounded-xl font-bold text-sm transition-all ${
        locked ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
      }`}
    >
      Redeem
    </button>
  </div>
);

const Rewards = () => {
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 max-w-2xl mx-auto"
    >
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rewards Shop</h1>
          <p className="text-gray-500 text-sm">Spend your hard-earned points</p>
        </div>
        <div className="bg-yellow-50 px-4 py-2 rounded-2xl border border-yellow-100 flex items-center gap-2">
          <Star size={20} className="text-yellow-600" fill="currentColor" />
          <span className="text-xl font-black text-yellow-700">{profile.points}</span>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <RewardCard title="Coffee Coupon" cost={500} icon={ShoppingBag} color="bg-orange-500" />
        <RewardCard title="Premium Badge" cost={1000} icon={Award} color="bg-purple-500" />
        <RewardCard title="XP Booster" cost={2500} icon={Star} color="bg-blue-500" />
        <RewardCard title="Mystery Box" cost={5000} icon={Gift} color="bg-pink-500" />
        <RewardCard title="Exclusive Avatar" cost={7500} icon={User} color="bg-indigo-500" locked />
        <RewardCard title="Real World Reward" cost={15000} icon={ShoppingBag} color="bg-green-500" locked />
      </div>

      <section className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={20} className="text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Redemption History</h2>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={32} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No rewards redeemed yet. Keep exploring!</p>
        </div>
      </section>
    </motion.div>
  );
};

const Award = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const User = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default Rewards;

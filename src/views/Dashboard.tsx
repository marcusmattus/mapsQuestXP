import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { Trophy, Zap, Footprints, MapPin, TrendingUp } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
      <Icon className={color.replace('bg-', 'text-')} size={24} />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { profile } = useAuth();

  if (!profile) return null;

  const xpProgress = (profile.xp % 1000) / 10; // Percentage to next level (assuming 1000 XP per level)
  const nextLevelXP = 1000 - (profile.xp % 1000);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 max-w-2xl mx-auto"
    >
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {profile.displayName}!</h1>
          <p className="text-gray-500 text-sm">Level {profile.level} Explorer</p>
        </div>
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-600">
          <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
        </div>
      </header>

      {/* XP Progress Section */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-sm font-semibold text-blue-600 mb-1">Level {profile.level}</p>
            <p className="text-3xl font-black text-gray-900">{profile.xp} <span className="text-lg font-medium text-gray-400">XP</span></p>
          </div>
          <p className="text-sm text-gray-500 font-medium">{nextLevelXP} XP to Level {profile.level + 1}</p>
        </div>
        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-blue-500 to-blue-700"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard icon={Zap} label="Points" value={profile.points} color="bg-yellow-500" />
        <StatCard icon={Footprints} label="Total Steps" value={profile.totalSteps.toLocaleString()} color="bg-green-500" />
        <StatCard icon={Trophy} label="Streak" value={`${profile.streak} Days`} color="bg-orange-500" />
        <StatCard icon={MapPin} label="Check-ins" value="12" color="bg-purple-500" />
      </div>

      {/* Daily Challenges */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Daily Challenges</h2>
        </div>
        <div className="space-y-4">
          {[
            { title: "Morning Walk", desc: "Walk 2,000 steps before noon", progress: 65, reward: 250 },
            { title: "Local Explorer", desc: "Visit 2 new locations", progress: 50, reward: 500 },
            { title: "Navigation Pro", desc: "Complete a route over 1km", progress: 0, reward: 400 },
          ].map((challenge, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-900">{challenge.title}</h3>
                  <p className="text-xs text-gray-500">{challenge.desc}</p>
                </div>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full">+{challenge.reward} XP</span>
              </div>
              <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden mt-3">
                <div className="h-full bg-blue-600" style={{ width: `${challenge.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default Dashboard;

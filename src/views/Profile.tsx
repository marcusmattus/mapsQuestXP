import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { LogOut, Settings, Shield, History, Award, ChevronRight } from 'lucide-react';

const Profile = () => {
  const { profile, logout } = useAuth();

  if (!profile) return null;

  const menuItems = [
    { icon: Award, label: 'My Badges', count: 5 },
    { icon: History, label: 'Activity History', count: 12 },
    { icon: Shield, label: 'Privacy & Security' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-6 max-w-2xl mx-auto"
    >
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-600 shadow-xl">
            <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full border-4 border-white">
            <Award size={16} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{profile.displayName}</h1>
        <p className="text-gray-500 font-medium">Level {profile.level} Explorer</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        {menuItems.map((item, i) => (
          <button
            key={i}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gray-100 rounded-xl text-gray-600">
                <item.icon size={20} />
              </div>
              <span className="font-semibold text-gray-700">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.count && (
                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
                  {item.count}
                </span>
              )}
              <ChevronRight size={20} className="text-gray-300" />
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-600 font-bold py-4 rounded-2xl hover:bg-red-100 transition-colors"
      >
        <LogOut size={20} />
        Sign Out
      </button>
    </motion.div>
  );
};

export default Profile;

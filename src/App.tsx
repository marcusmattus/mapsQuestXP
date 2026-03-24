import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Dashboard from './views/Dashboard';
import MapView from './views/Map';
import Profile from './views/Profile';
import Rewards from './views/Rewards';
import Chat from './views/Chat';
import { Home, Map as MapIcon, User, Gift, MessageSquare, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Navbar = () => {
  const location = useLocation();
  const { user, login } = useAuth();

  if (!user) return null;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/map', icon: MapIcon, label: 'Map' },
    { path: '/rewards', icon: Gift, label: 'Rewards' },
    { path: '/chat', icon: MessageSquare, label: 'Assistant' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around items-center z-50">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-400'
            }`}
          >
            <item.icon size={24} />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute bottom-0 w-8 h-1 bg-blue-600 rounded-t-full"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
};

const AppContent = () => {
  const { user, login, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MapIcon size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MapQuest XP</h1>
          <p className="text-gray-600 mb-8">
            Gamify your world. Walk, explore, and earn rewards while you navigate.
          </p>
          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <LogIn size={20} />
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </AnimatePresence>
      <Navbar />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

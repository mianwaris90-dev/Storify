import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, User, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useState } from 'react';
import NewOrderModal from './NewOrderModal';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Content Area */}
      <main className="flex-1 overflow-y-auto pb-32">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="container mx-auto max-w-lg px-6 pt-8"
        >
          {children}
        </motion.div>
      </main>

      {/* Floating Action Button (New Order) */}
      <div className="fixed bottom-28 right-6 z-50">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-90"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-8 py-4 pb-8 z-40">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center space-y-1 transition-all",
                  isActive ? "text-indigo-600 scale-105" : "text-slate-400 hover:text-slate-500"
                )}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* New Order Modal */}
      <NewOrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

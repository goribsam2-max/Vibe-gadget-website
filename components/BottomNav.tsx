
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from './Icon';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const links = [
    { to: '/', icon: 'home', label: 'Home' },
    { to: '/wishlist', icon: 'heart', label: 'Saved' },
    { to: '/cart', icon: 'shopping-bag', label: 'Cart' },
    { to: '/profile', icon: 'user', label: 'Profile' }
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 w-full flex justify-center z-[100] pointer-events-none px-4 md:hidden">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl px-4 py-3 flex justify-between items-center rounded-2xl shadow-lg shadow-black/5 pointer-events-auto w-full max-w-sm border border-zinc-200/50 dark:border-zinc-800/50"
      >
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <NavLink 
              key={link.to} 
              to={link.to} 
              className={`relative flex flex-col items-center justify-center flex-1 h-10 transition-all duration-300 ${isActive ? 'text-emerald-500' : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'}`}
            >
              <Icon name={link.icon} className={`text-xl relative z-10 transition-transform ${isActive ? 'scale-110 mb-1' : 'hover:scale-105'}`} />
              {isActive && (
                <motion.div 
                  layoutId="active-nav-dot"
                  className="absolute bottom-[-2px] w-1.5 h-1.5 bg-emerald-500 rounded-full "
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
            </NavLink>
          );
        })}
      </motion.div>
    </div>
  );
};

export default BottomNav;

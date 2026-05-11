import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import Icon from './Icon';

import { useTheme } from './ThemeContext';
import { Header } from './ui/header-3';

const DesktopLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem('f_cart') || '[]');
      const count = cart.reduce((acc: number, item: any) => acc + item.quantity, 0);
      const total = cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
      setCartCount(count);
      setCartTotal(total);
    };
    updateCart();
    window.addEventListener('storage', updateCart);
    const interval = setInterval(updateCart, 1000); // Polling for fast local updates
    return () => {
      window.removeEventListener('storage', updateCart);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('f_cart');
    navigate('/auth-selector');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-800 flex flex-col">
      <Header />
      <div className="flex-1 flex w-full">
        {/* Main Content Area */}
        <div className="flex-1 w-full max-w-full lg:max-w-[calc(100vw-80px)] xl:max-w-none bg-zinc-50 dark:bg-zinc-800 md:bg-zinc-50 dark:bg-zinc-800/50">
          <div className="w-full max-w-[1920px] mx-auto pb-24 md:pb-0">
            {children}
          </div>
        </div>
      </div>

      {/* Desktop Right Cart Sidebar */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="hidden xl:flex flex-col w-80 bg-zinc-50 dark:bg-zinc-800 border-l border-zinc-200 dark:border-zinc-700 h-screen sticky top-0 shrink-0 p-6 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-40"
          >
            <div className="mb-8 pt-4">
               <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Your Cart</h2>
               <p className="text-[10px] font-medium text-zinc-500 tracking-tight mt-1">{cartCount} items</p>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-1">
               {JSON.parse(localStorage.getItem('f_cart') || '[]').map((item: any) => (
                 <div key={item.id} className="flex items-center space-x-4 bg-zinc-50 dark:bg-zinc-800 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 transition-colors">
                    <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-full p-1 shrink-0 border border-zinc-50 shadow-sm flex items-center justify-center">
                       <img src={item.image} className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal" alt=""/>
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 truncate  tracking-tight" title={item.name}>{item.name}</h4>
                       <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">৳{item.price * item.quantity}</p>
                    </div>
                    <div className="text-[10px] font-semibold text-zinc-400 px-2 bg-zinc-100 dark:bg-zinc-800 rounded-md py-1">x{item.quantity}</div>
                 </div>
               ))}
            </div>

            <div className="mt-6 border-t border-zinc-100 dark:border-zinc-800 pt-6">
               <div className="flex justify-between items-end mb-6">
                  <span className="text-[10px] font-medium text-zinc-500 tracking-tight mb-1.5">Grand Total</span>
                  <span className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">৳{cartTotal}</span>
               </div>
               <button onClick={() => navigate('/checkout')} className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-semibold text-sm hover:scale-[1.02] transition-all active:scale-[0.98] ">
                 Proceed to Checkout
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DesktopLayout;

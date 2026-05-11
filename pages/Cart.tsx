import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "../components/Icon";
import { CustomSectionEmbed } from "../components/CustomSectionEmbed";
import { useTheme } from "../components/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";

const Cart: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("f_cart") || "[]");
    setItems(cart);
  }, []);

  const total = items.reduce(
    (acc, curr) => acc + curr.price * curr.quantity,
    0,
  );

  const updateQuantity = (index: number, delta: number) => {
    const newItems = [...items];
    newItems[index].quantity = Math.max(1, newItems[index].quantity + delta);
    setItems(newItems);
    localStorage.setItem("f_cart", JSON.stringify(newItems));
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    localStorage.setItem("f_cart", JSON.stringify(newItems));
  };

  return (
    <div className="bg-zinc-50 dark:bg-[#000000] min-h-screen pb-32 animate-fade-in relative transition-colors font-inter">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-900 dark:text-zinc-100"
            >
              <Icon name="arrow-left" className="text-sm" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Shopping Cart
            </h1>
          </div>

        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center relative z-10">
            <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 border border-zinc-100 dark:border-zinc-700">
              <Icon
                name="shopping-cart"
                className="text-2xl text-zinc-400 dark:text-zinc-500"
              />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
              Your cart is empty
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm">
              Looks like you haven't added anything to your cart yet. Let's change that!
            </p>
            <Button size="lg" onClick={() => navigate("/")} className="rounded-full shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 border-none text-white dark:text-white dark:bg-emerald-500 font-bold">
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
            <div className="lg:col-span-8 flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {items.map((item, idx) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={idx}
                  >
                    <Card className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 group shadow-sm transition-all hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700">
                      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        <div className="w-full sm:w-28 h-40 sm:h-28 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center shrink-0 border border-zinc-100 dark:border-zinc-800 overflow-hidden relative p-2">
                          <img
                            src={item.image}
                            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-500"
                            alt={item.name}
                          />
                        </div>
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex justify-between items-start mb-2 gap-4">
                            <h4 className="font-bold text-base sm:text-lg tracking-tight text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-tight">
                              {item.name}
                            </h4>
                            <button
                              onClick={() => removeItem(idx)}
                              className="text-zinc-400 hover:text-red-500 bg-zinc-50 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-900/20 w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0"
                            >
                              <Icon name="trash" className="text-xs" />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="font-bold text-lg sm:text-xl text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
                              ৳{item.price * item.quantity}
                            </div>
                            
                            <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800/50 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                              <button
                                onClick={() => updateQuantity(idx, -1)}
                                className="w-8 h-8 bg-white dark:bg-zinc-700 rounded-xl flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shadow-sm transition-colors"
                              >
                                −
                              </button>
                              <span className="w-8 text-center text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(idx, 1)}
                                className="w-8 h-8 bg-white dark:bg-zinc-700 rounded-xl flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shadow-sm transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <Card className="rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
                  <CardHeader className="bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-100 dark:border-zinc-800 pb-5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="receipt" className="text-zinc-400" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between items-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      <span>Subtotal</span>
                      <span className="text-zinc-900 dark:text-zinc-100">৳{total}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      <span>Shipping Estimate</span>
                      <span className="text-zinc-900 dark:text-zinc-100">৳150</span>
                    </div>
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-end">
                      <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Total</span>
                      <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono">
                        ৳{total + 150}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 pb-6">
                    <Button
                      size="xl"
                      className="w-full relative overflow-hidden group rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all font-bold tracking-wide border-none shadow-xl hover:shadow-2xl"
                      onClick={() => navigate("/checkout")}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Proceed to Checkout
                        <Icon name="arrow-right" className="text-sm transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        )}
        <CustomSectionEmbed location="cart_bottom" />
      </div>
    </div>
  );
};

export default Cart;

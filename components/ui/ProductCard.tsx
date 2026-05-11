import React from "react";
import { motion } from "framer-motion";
import { Clock, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Product } from "../../types";

export const ProductCard = ({ product }: { product: Product }) => {
  const navigate = useNavigate();
  const hasDiscount = product.isOffer && product.offerPrice && product.offerPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.offerPrice || product.price)) / product.price) * 100)
    : 0;

  const displayPrice = product.isOffer && product.offerPrice ? product.offerPrice : product.price;
  const productSlug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Simplified add to cart, usually this would call a context/store
    // For now we navigate to the product
    navigate(`/product/${productSlug}/${product.id}`);
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className="group relative w-full"
    >
      <Link 
        to={`/product/${productSlug}/${product.id}`}
        className="flex flex-col h-full overflow-hidden rounded-[15px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 transition-all duration-300 hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-700/50 block group"
      >
        {/* Image and Discount Badge */}
        <div className="relative h-40 overflow-hidden bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center p-4">
          <img
            src={product.image}
            alt={product.name}
            className="md:h-full md:w-full h-28 w-28 object-contain transition-transform duration-500 group-hover:scale-110 mix-blend-multiply dark:mix-blend-normal"
          />
          {hasDiscount && (
            <div className="absolute left-2 top-2 rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              {discountPercent}% OFF
            </div>
          )}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
              <span className="bg-zinc-900 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col flex-1 p-3.5 space-y-2 relative">
          <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            <Clock className="h-3 w-3" />
            <span>Fast Delivery</span>
          </div>
          
          <h3 className="h-10 text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2">
            {product.name}
          </h3>
          
          <div className="flex-1" />

          {/* Pricing and Add Button */}
          <div className="flex items-end justify-between mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-bold text-emerald-600 dark:text-emerald-400">
                ৳{displayPrice}
              </span>
              {hasDiscount && (
                <span className="text-[10px] text-zinc-400 font-semibold line-through">
                  ৳{product.price}
                </span>
              )}
              {!hasDiscount && (
                <div className="h-3.5" />
              )}
            </div>
            
            <button
              onClick={handleAdd}
              disabled={product.stock <= 0}
              className="rounded-lg border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/20 px-4 md:px-5 py-1.5 text-[11px] md:text-xs font-bold text-emerald-700 dark:text-emerald-400 transition-all hover:bg-emerald-500 hover:text-white hover:border-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-50 disabled:hover:text-emerald-700 dark:disabled:hover:bg-emerald-900/20 shadow-sm active:scale-95 flex items-center space-x-1"
            >
              <span>ADD</span>
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

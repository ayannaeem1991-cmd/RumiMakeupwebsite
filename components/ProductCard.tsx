import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onClick }) => {
  const hasDiscount = product.original_price && product.original_price > product.discounted_price;
  
  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(`Hi, I am interested in buying ${product.name} for Rs. ${product.discounted_price.toLocaleString()}`);
    window.open(`https://wa.me/923315976504?text=${text}`, '_blank');
  };

  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-stone-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer relative" onClick={() => onClick(product)}>
      {hasDiscount && (
        <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-rumi-600 text-white text-[10px] font-bold rounded uppercase tracking-wider shadow-sm">
          Sale
        </div>
      )}
      
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <span className="text-[10px] font-semibold text-rumi-600 uppercase tracking-wide">
            {product.category}
          </span>
          <div className="flex items-center text-amber-400 text-[10px]">
            <i className="fa-solid fa-star"></i>
            <span className="ml-1 text-stone-500">{product.rating}</span>
          </div>
        </div>
        
        <h3 className="font-serif text-base font-bold text-stone-900 mb-1 group-hover:text-rumi-700 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-stone-500 text-xs mb-3 line-clamp-2 flex-grow">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-auto">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-[10px] text-stone-400 line-through">
                Rs. {product.original_price?.toLocaleString()}
              </span>
            )}
            <span className="text-base font-semibold text-stone-900">
              Rs. {product.discounted_price.toLocaleString()}
            </span>
          </div>
          <button 
            onClick={handleBuyNow}
            className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-green-600 transition-colors flex items-center gap-1 shadow-sm"
          >
            Buy Now <i className="fa-brands fa-whatsapp"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
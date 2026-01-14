import React from 'react';

interface HeroProps {
  onShopNow: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopNow }) => {
  return (
    <div className="relative w-full h-[600px] overflow-hidden bg-stone-100">
      {/* Background Image Placeholder */}
      <div className="absolute inset-0">
        <img 
          src="https://picsum.photos/1920/1080?grayscale" 
          alt="Elegant Makeup" 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-50 via-white/40 to-transparent"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
        <div className="max-w-xl space-y-8 animate-fade-in-up">
          <span className="inline-block py-1 px-3 rounded-full bg-rumi-100 text-rumi-800 text-sm font-semibold tracking-wider uppercase">
            New Collection
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-stone-900 leading-tight">
            Unleash Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rumi-600 to-purple-600">Inner Radiance</span>
          </h1>
          <p className="text-lg text-stone-600 leading-relaxed">
            Discover the new era of beauty with Rumi Makeup. Clean ingredients, 
            luxurious textures, and shades designed for every skin tone.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={onShopNow}
              className="px-10 py-5 text-lg bg-stone-900 text-white rounded-full font-semibold hover:bg-rumi-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Shop Collection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
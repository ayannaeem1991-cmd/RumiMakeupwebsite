import React from 'react';
import { ViewState } from '../types';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  currentView: ViewState;
  setView: (view: ViewState) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  cartCount, 
  onCartClick, 
  currentView, 
  setView,
  searchQuery = '',
  setSearchQuery 
}) => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-28">
          
          {/* Logo Section */}
          <div 
            className="flex-shrink-0 cursor-pointer flex items-center" 
            onClick={() => setView('HOME')}
          >
            <img 
              src="https://i.ibb.co/v4rT2bzk/roi.jpg" 
              alt="Rumi Makeup" 
              className="h-24 w-auto object-contain mix-blend-multiply" 
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            <button 
              onClick={() => setView('HOME')}
              className={`text-sm font-medium transition-colors ${currentView === 'HOME' ? 'text-rumi-600' : 'text-stone-600 hover:text-rumi-600'}`}
            >
              Home
            </button>
            <button 
              onClick={() => setView('SHOP')}
              className={`text-sm font-medium transition-colors ${currentView === 'SHOP' ? 'text-rumi-600' : 'text-stone-600 hover:text-rumi-600'}`}
            >
              Shop All
            </button>
            <button 
              onClick={() => setView('ADVISOR')}
              className={`text-sm font-medium flex items-center gap-2 transition-colors ${currentView === 'ADVISOR' ? 'text-rumi-600' : 'text-stone-600 hover:text-rumi-600'}`}
            >
              <i className="fa-solid fa-sparkles"></i>
              AI Advisor
            </button>
          </div>

          {/* Icons & Search */}
          <div className="flex items-center space-x-4">
            
            {/* Search Bar */}
            <div className="relative group hidden sm:block">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-9 pr-4 py-2 bg-stone-100 rounded-full border border-transparent focus:bg-white focus:border-rumi-300 focus:outline-none focus:ring-1 focus:ring-rumi-300 text-sm transition-all w-32 focus:w-48 placeholder-stone-400 text-stone-800"
              />
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 pointer-events-none"></i>
            </div>
            
            {/* Mobile Search Icon (optional fallback if needed, but keeping search visible is better UX) */}
            <button className="sm:hidden text-stone-600 hover:text-rumi-600 transition-colors" onClick={() => setView('SHOP')}>
               <i className="fa-solid fa-magnifying-glass text-lg"></i>
            </button>

            <button 
              className="text-stone-600 hover:text-rumi-600 transition-colors relative"
              onClick={onCartClick}
            >
              <i className="fa-solid fa-shopping-bag text-xl"></i>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rumi-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
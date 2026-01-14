import React, { useState, useRef, useEffect } from 'react';
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      // Small timeout ensures the element is visible/transitioning before focus is attempted,
      // which improves keyboard reliability on mobile devices.
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-28 relative">
          
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
            
            {/* Expandable Search Bar */}
            <div className={`
                transition-all duration-300 ease-in-out flex items-center
                ${isSearchOpen 
                    ? 'absolute inset-0 bg-white z-50 px-4 md:static md:w-64 md:bg-transparent md:px-0 md:z-auto md:justify-end' 
                    : 'relative w-8 justify-end'
                }
            `}>
               <input 
                  ref={inputRef}
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className={`
                      bg-stone-100 rounded-full border border-transparent focus:bg-white focus:border-rumi-300 focus:outline-none focus:ring-1 focus:ring-rumi-300 text-sm text-stone-800 placeholder-stone-400 transition-all duration-300 shadow-sm
                      ${isSearchOpen 
                        ? 'w-full py-2 pl-4 pr-10 opacity-100 pointer-events-auto' 
                        : 'w-0 p-0 opacity-0 pointer-events-none absolute right-0'
                      }
                  `}
               />
               <button 
                 type="button"
                 onMouseDown={(e) => e.preventDefault()} // Prevent blur on input when clicking button
                 onClick={() => {
                     if (isSearchOpen) {
                         setIsSearchOpen(false);
                         if (!searchQuery && setSearchQuery) setSearchQuery('');
                     } else {
                         setIsSearchOpen(true);
                     }
                 }}
                 className={`
                     z-10 w-8 h-8 flex items-center justify-center transition-colors
                     ${isSearchOpen 
                        ? 'absolute right-4 md:right-0 text-stone-400 hover:text-stone-600' 
                        : 'relative text-stone-600 hover:text-rumi-600'
                     }
                 `}
               >
                  <i className={`fa-solid ${isSearchOpen ? 'fa-xmark' : 'fa-magnifying-glass'} text-lg`}></i>
               </button>
            </div>

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
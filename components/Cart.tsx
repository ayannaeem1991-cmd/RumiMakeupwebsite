import React from 'react';
import { CartItem } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity?: (id: string, delta: number) => void;
}

export const Cart: React.FC<CartProps> = ({ isOpen, onClose, items, onRemove, onUpdateQuantity }) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-stone-900">Your Bag</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-400 space-y-4">
              <i className="fa-solid fa-basket-shopping text-4xl"></i>
              <p>Your bag is empty.</p>
              <button onClick={onClose} className="text-rumi-600 font-medium hover:underline">Start Shopping</button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-stone-900">{item.name}</h3>
                    <p className="text-sm text-stone-500">{item.category}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    {onUpdateQuantity ? (
                      <div className="flex items-center border border-stone-200 rounded-md">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          className="px-2 py-1 text-stone-500 hover:text-rumi-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <i className="fa-solid fa-minus text-xs"></i>
                        </button>
                        <span className="text-sm font-medium px-2 min-w-[20px] text-center">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="px-2 py-1 text-stone-500 hover:text-rumi-600"
                        >
                          <i className="fa-solid fa-plus text-xs"></i>
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm font-medium">Qty: {item.quantity}</span>
                    )}
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  onClick={() => onRemove(item.id)}
                  className="text-stone-400 hover:text-red-500 self-start p-1"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-stone-100 bg-stone-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-stone-600">Subtotal</span>
              <span className="font-serif text-xl font-bold text-stone-900">${total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-stone-500 mb-6 text-center">Shipping & taxes calculated at checkout</p>
            <button 
                onClick={() => {
                    const event = new CustomEvent('checkout-complete');
                    window.dispatchEvent(event);
                }}
                className="w-full py-4 bg-stone-900 text-white rounded-full font-medium hover:bg-rumi-600 transition-colors shadow-lg"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { AIAdvisor } from './components/AIAdvisor';
import { Cart } from './components/Cart';
import { ProductDetails } from './components/ProductDetails';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { Product, CartItem, ViewState } from './types';
import { INITIAL_PRODUCTS } from './constants';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track purchased items to simulate "Verified Purchaser" reviews
  const [purchasedItemIds, setPurchasedItemIds] = useState<string[]>([]);

  // Fetch Products from Supabase
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        // Sanitize data to ensure arrays are not null
        const sanitizedProducts = data.map((p: any) => ({
            ...p,
            reviews: p.reviews || [],
            benefits: p.benefits || []
        })) as Product[];
        setProducts(sanitizedProducts);
      } else {
        // If database is empty, seed it with INITIAL_PRODUCTS for demo purposes
        await seedDatabase();
      }
    } catch (error: any) {
      // Check for "relation does not exist" error (code 42P01) which means table is missing
      if (error.code === '42P01') {
          console.warn('Supabase table "products" not found. Falling back to local demo data. Please run the SQL setup script in your Supabase dashboard.');
      } else {
          console.error('Error fetching products:', error.message || error);
      }
      // Fallback to initial products if offline or error
      setProducts(INITIAL_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  };

  const seedDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(INITIAL_PRODUCTS)
        .select();
      
      if (!error && data) {
         const sanitizedProducts = data.map((p: any) => ({
            ...p,
            reviews: p.reviews || [],
            benefits: p.benefits || []
        })) as Product[];
        setProducts(sanitizedProducts);
      } else {
        setProducts(INITIAL_PRODUCTS);
      }
    } catch (e) {
      setProducts(INITIAL_PRODUCTS);
    }
  };

  // Product CRUD Handlers
  const handleAddProduct = async (newProductData: Omit<Product, 'id' | 'sales' | 'reviews'>) => {
    const newProduct = {
      ...newProductData,
      id: `p${Date.now()}`,
      sales: 0,
      reviews: [],
      rating: 0
    };

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select();

      if (error) throw error;
      if (data) {
        const addedProduct = {
            ...data[0],
            reviews: data[0].reviews || [],
            benefits: data[0].benefits || []
        } as Product;
        setProducts(prev => [addedProduct, ...prev]);
      }
    } catch (error: any) {
      console.error('Error adding product:', error.message || error);
      // Fallback update local state for demo feel even if DB fails
      setProducts(prev => [newProduct as Product, ...prev]);
      alert('Note: Database update failed (Table may be missing). Updated local view only.');
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(updatedProduct)
        .eq('id', updatedProduct.id);

      if (error) throw error;

      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    } catch (error: any) {
      console.error('Error updating product:', error.message || error);
      // Fallback
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      alert('Note: Database update failed. Updated local view only.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error: any) {
      console.error('Error deleting product:', error.message || error);
      // Fallback
      setProducts(prev => prev.filter(p => p.id !== id));
      alert('Note: Database delete failed. Updated local view only.');
    }
  };

  const handleBulkAddProducts = async (newProductsData: Omit<Product, 'id' | 'sales' | 'reviews'>[]) => {
    const newProducts = newProductsData.map((data, idx) => ({
      ...data,
      id: `p${Date.now()}-${idx}`,
      sales: 0,
      reviews: [],
      rating: 0
    }));

    try {
      const { data, error } = await supabase
        .from('products')
        .insert(newProducts)
        .select();

      if (error) throw error;
      if (data) {
        const addedProducts = data.map((p: any) => ({
            ...p,
            reviews: p.reviews || [],
            benefits: p.benefits || []
        })) as Product[];
        setProducts(prev => [...addedProducts, ...prev]);
      }
    } catch (error: any) {
      console.error('Error bulk adding products:', error.message || error);
      // Fallback
      setProducts(prev => [...(newProducts as Product[]), ...prev]);
      alert('Note: Database import failed. Updated local view only.');
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Simulate checkout to enable "Verified Review"
  const handleCheckout = () => {
    const ids = cart.map(item => item.id);
    setPurchasedItemIds(prev => [...new Set([...prev, ...ids])]);
    setCart([]);
    setIsCartOpen(false);
    alert("Thank you for your purchase! You can now leave verified reviews for these items.");
  };

  // Listen for the checkout event from Cart component
  useEffect(() => {
    const onCheckout = () => handleCheckout();
    window.addEventListener('checkout-complete', onCheckout);
    return () => window.removeEventListener('checkout-complete', onCheckout);
  }, [cart]); 

  const handleProductClick = (product: Product) => {
    // When clicking from a list, ensure we get the latest version from state
    const currentProduct = products.find(p => p.id === product.id) || product;
    setSelectedProduct(currentProduct);
    setView('PRODUCT_DETAILS');
    window.scrollTo(0, 0);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Sorting for Best Sellers
  const bestSellers = [...products].sort((a, b) => b.sales - a.sales).slice(0, 4);

  // Filtering Logic
  const filteredProducts = categoryFilter === 'All' 
    ? products 
    : products.filter(p => p.category === categoryFilter);

  // Derive subcategories for the current main filter
  const availableSubcategories = categoryFilter === 'All'
    ? []
    : Array.from(new Set(products.filter(p => p.category === categoryFilter).map(p => p.subcategory)));

  
  const renderHome = () => (
    <>
      <Hero onShopNow={() => setView('SHOP')} />
      
      {/* Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <span className="text-rumi-600 font-bold tracking-wider uppercase text-sm">Customer Favorites</span>
          <h2 className="text-4xl font-serif font-bold text-stone-900 mt-2 mb-4">Best Sellers</h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
             Our most coveted beauty essentials, loved by our community.
          </p>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <i className="fa-solid fa-circle-notch fa-spin text-rumi-600 text-3xl"></i>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {bestSellers.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart} 
                onClick={handleProductClick}
              />
            ))}
          </div>
        )}
      </section>

      {/* AI Teaser Banner */}
      <section className="bg-rumi-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl font-serif font-bold text-stone-900">
              Not sure what suits you?
            </h2>
            <p className="text-lg text-stone-600">
              Chat with Rumi, our AI Beauty Advisor. Get personalized recommendations based on your skin tone, style, and occasion.
            </p>
            <button 
              onClick={() => setView('ADVISOR')}
              className="px-8 py-3 bg-white border-2 border-rumi-600 text-rumi-600 font-semibold rounded-full hover:bg-rumi-600 hover:text-white transition-all duration-300"
            >
              Ask Rumi
            </button>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-md aspect-video bg-white rounded-2xl shadow-xl overflow-hidden p-6 flex items-center justify-center">
               <div className="text-center">
                 <div className="inline-block p-4 rounded-full bg-rumi-100 mb-4">
                    <i className="fa-solid fa-sparkles text-3xl text-rumi-600"></i>
                 </div>
                 <p className="font-serif italic text-xl text-stone-800">"I recommend the Velvet Rose Lipstick for your evening look!"</p>
               </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );

  const renderShop = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col gap-8 mb-12">
        <h1 className="text-4xl font-serif font-bold text-stone-900">Shop All</h1>
        
        {/* Filter Buttons */}
        <div className="flex flex-col gap-4">
           {/* Main Categories */}
           <div className="flex flex-wrap gap-2">
            {['All', 'Lips', 'Face', 'Eyes', 'Skincare'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  categoryFilter === cat 
                    ? 'bg-stone-900 text-white' 
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          {/* Subcategories Display (Visual only for now) */}
          {availableSubcategories.length > 0 && (
             <div className="flex flex-wrap gap-4 items-center text-sm text-stone-500">
                <span className="font-semibold">Categories:</span>
                {availableSubcategories.map(sub => (
                   <span key={sub} className="bg-white border border-stone-200 px-3 py-1 rounded-md">{sub}</span>
                ))}
             </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
           <i className="fa-solid fa-circle-notch fa-spin text-rumi-600 text-3xl"></i>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={addToCart} 
              onClick={handleProductClick}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar 
        cartCount={totalItems} 
        onCartClick={() => setIsCartOpen(true)}
        currentView={view}
        setView={setView}
      />
      
      <main className="flex-grow">
        {view === 'HOME' && renderHome()}
        {view === 'SHOP' && renderShop()}
        {view === 'ADVISOR' && <div className="py-8 bg-stone-50 min-h-full"><AIAdvisor products={products} /></div>}
        {view === 'PRODUCT_DETAILS' && selectedProduct && (
            <ProductDetails 
                product={selectedProduct} 
                onAddToCart={addToCart} 
                onBack={() => setView('SHOP')}
                isPurchased={purchasedItemIds.includes(selectedProduct.id)}
            />
        )}
        {view === 'ADMIN_LOGIN' && (
            <AdminLogin 
                onLogin={() => setView('ADMIN_DASHBOARD')} 
                onCancel={() => setView('HOME')}
            />
        )}
        {view === 'ADMIN_DASHBOARD' && (
            <AdminDashboard 
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onBulkAddProducts={handleBulkAddProducts}
            />
        )}
      </main>

      <footer className="bg-stone-900 text-white py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <span className="font-sans text-2xl font-bold tracking-tight mb-4 block">
                Rumi <span className="text-rumi-400">Makeup</span>
              </span>
              <p className="text-stone-400 text-sm">
                Redefining beauty with clean ingredients and inclusive shades.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Shop</h3>
              <ul className="space-y-2 text-stone-400 text-sm">
                <li><button onClick={() => { setView('SHOP'); setCategoryFilter('Lips'); }} className="hover:text-white">Lips</button></li>
                <li><button onClick={() => { setView('SHOP'); setCategoryFilter('Face'); }} className="hover:text-white">Face</button></li>
                <li><button onClick={() => { setView('SHOP'); setCategoryFilter('Eyes'); }} className="hover:text-white">Eyes</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">About</h3>
              <ul className="space-y-2 text-stone-400 text-sm">
                <li><a href="#" className="hover:text-white">Our Story</a></li>
                <li><a href="#" className="hover:text-white">Ingredients</a></li>
                <li><a href="#" className="hover:text-white">Sustainability</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Stay Connected</h3>
              <div className="flex space-x-4">
                <a 
                  href="https://www.instagram.com/rumimakeup_" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-rumi-600 transition-colors"
                >
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-rumi-600 transition-colors">
                  <i className="fa-brands fa-tiktok"></i>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-rumi-600 transition-colors">
                  <i className="fa-brands fa-twitter"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-stone-800 flex justify-between items-center text-stone-500 text-sm">
            <p>© 2024 Rumi Makeup. All rights reserved.</p>
            <button onClick={() => setView('ADMIN_LOGIN')} className="hover:text-white transition-colors text-xs uppercase tracking-wider">
               Staff Login
            </button>
          </div>
        </div>
      </footer>

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart}
        onRemove={removeFromCart}
      />
    </div>
  );
}
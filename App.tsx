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

const ABOUT_CONTENT = {
  story: {
    title: "Our Story",
    content: "Rumi Makeup was born from a singular vision: to treat the face as a canvas for the soul’s deepest expression. Inspired by the timeless harmony of artistry and nature, our founder sought to bridge the gap between high-fashion craftsmanship and the effortless beauty of everyday wear. We believe that true confidence is mindful, rooted in the quiet wonder of self-discovery rather than the noise of perfection. Every pigment and texture we create is an invitation to celebrate your unique light, designed for every skin tone and every walk of life. By prioritizing ethical sourcing and inclusive design, we ensure that our brand remains a testament to both human connection and the art of living beautifully."
  },
  ingredients: {
    title: "Ingredients",
    content: "Our formulations are a careful dance between high-performance color and the gentle touch of skin-friendly care. We believe in being clean where it matters, utilizing a blend of soothing botanical extracts and skin-nourishing oils to ensure every application feels as good as it looks. By marrying medical-grade pigments with moisture-rich ceramides, we create textures that melt into the skin, providing vibrant finishes that never compromise your natural barrier. Transparency is our foundation, which is why we conduct rigorous safety testing to ensure our products are suitable for even the most sensitive complexions. Whether you are seeking a sheer wash of radiance or a bold statement, our ingredients are chosen to honor and protect the diversity of your skin."
  },
  sustainability: {
    title: "Sustainability",
    content: "Sustainability at Rumi Makeup is a journey of continuous refinement and respect for the world that provides our inspiration. We favor responsible packaging, utilizing recycled and recyclable materials to ensure our footprint is as light as our loose powders. From reducing waste in our production cycles to maintaining a strict cruelty-free testing standard, we believe that beauty should never come at the cost of a living being. We embrace lifecycle thinking by focusing on long-wear formulas that encourage mindful consumption and exploring refill options that extend the life of our cherished components. By sourcing our raw materials through ethical partnerships, we aim to protect the delicate ecosystems that gift us our vibrant colors."
  }
};

export default function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAboutSection, setActiveAboutSection] = useState<'story' | 'ingredients' | 'sustainability' | null>(null);
  const [purchasedItemIds, setPurchasedItemIds] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const sanitizeProductData = (p: any): Product => {
    // Mapping both 'price' and 'discounted_price' for backward/forward compatibility
    const finalPrice = p.discounted_price ?? p.price ?? 0;
    return {
      ...p,
      id: p.id,
      name: p.name || 'Unnamed Product',
      category: p.category || 'Lips',
      subcategory: p.subcategory || '',
      description: p.description || '',
      image: p.image || 'https://picsum.photos/400/400',
      sales: p.sales || 0,
      benefits: Array.isArray(p.benefits) ? p.benefits : [],
      reviews: Array.isArray(p.reviews) ? p.reviews : [],
      discounted_price: finalPrice,
      original_price: p.original_price ?? undefined,
    };
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      // Removed the order('created_at') call to fix the schema error
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        setProducts(data.map(sanitizeProductData));
      } else {
        await seedDatabase();
      }
    } catch (error: any) {
      console.error('Fetch error:', error.message);
      setProducts(INITIAL_PRODUCTS.map(sanitizeProductData));
    } finally {
      setIsLoading(false);
    }
  };

  const seedDatabase = async () => {
    try {
      // Only seed if local constant products are not already in DB
      const { data, error } = await supabase
        .from('products')
        .insert(INITIAL_PRODUCTS.map(p => ({
          ...p,
          price: p.discounted_price // Support dual naming in seed
        })))
        .select();
      
      if (!error && data) {
         setProducts(data.map(sanitizeProductData));
      }
    } catch (e) {
      console.warn('Seeding skipped or failed.');
    }
  };

  const handleAddProduct = async (newProductData: Omit<Product, 'id' | 'sales' | 'reviews'>) => {
    // Prepare payload with both naming conventions to ensure sync success
    const payload = {
      ...newProductData,
      price: newProductData.discounted_price, // Fallback for 'price' column
      sales: 0,
      reviews: []
    };

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select();

      if (error) {
        // Log detailed error for the user to help debug Supabase RLS or Schema issues
        alert(`Supabase Sync Error: ${error.message}\n\nCheck if your 'products' table has Row Level Security (RLS) enabled or if column names match.`);
        throw error;
      }
      
      if (data) {
        setProducts(prev => [sanitizeProductData(data[0]), ...prev]);
        alert('Product added successfully to Supabase!');
      }
    } catch (error: any) {
      console.error('Error adding product:', error.message);
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    const payload = {
      ...updatedProduct,
      price: updatedProduct.discounted_price // Ensure consistency on update
    };

    try {
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', updatedProduct.id);

      if (error) {
        alert(`Update Error: ${error.message}`);
        throw error;
      }
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? sanitizeProductData(updatedProduct) : p));
      alert('Product updated successfully!');
    } catch (error: any) {
      console.error('Error updating product:', error.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        alert(`Delete Error: ${error.message}`);
        throw error;
      }
      setProducts(prev => prev.filter(p => p.id !== id));
      alert('Product deleted from Supabase.');
    } catch (error: any) {
      console.error('Error deleting product:', error.message);
    }
  };

  const handleBulkAddProducts = async (newProductsData: Omit<Product, 'id' | 'sales' | 'reviews'>[]) => {
    const payloads = newProductsData.map(p => ({
      ...p,
      price: p.discounted_price,
      sales: 0,
      reviews: []
    }));

    try {
      const { data, error } = await supabase
        .from('products')
        .insert(payloads)
        .select();

      if (error) {
        alert(`Bulk Import Error: ${error.message}`);
        throw error;
      }
      if (data) {
        setProducts(prev => [...data.map(sanitizeProductData), ...prev]);
        alert(`Successfully imported ${data.length} products.`);
      }
    } catch (error: any) {
      console.error('Error bulk adding products:', error.message);
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

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    const ids = cart.map(item => item.id);
    setPurchasedItemIds(prev => [...new Set([...prev, ...ids])]);
    setCart([]);
    setIsCartOpen(false);
    alert("Thank you for your purchase!");
  };

  useEffect(() => {
    const onCheckout = () => handleCheckout();
    window.addEventListener('checkout-complete', onCheckout);
    return () => window.removeEventListener('checkout-complete', onCheckout);
  }, [cart]); 

  const handleProductClick = (product: Product) => {
    const currentProduct = products.find(p => p.id === product.id) || product;
    setSelectedProduct(currentProduct);
    setView('PRODUCT_DETAILS');
    window.scrollTo(0, 0);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query && view !== 'SHOP') {
      setView('SHOP');
      setCategoryFilter('All');
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const bestSellers = [...products].sort((a, b) => b.sales - a.sales).slice(0, 4);
  const filteredProducts = products.filter(p => {
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchLower) || 
        p.category.toLowerCase().includes(searchLower) ||
        p.subcategory.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  const availableSubcategories = categoryFilter === 'All'
    ? []
    : Array.from(new Set(products.filter(p => p.category === categoryFilter).map(p => p.subcategory)));

  const renderHome = () => (
    <>
      <Hero onShopNow={() => setView('SHOP')} />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <span className="text-rumi-600 font-bold tracking-wider uppercase text-sm">Customer Favorites</span>
          <h2 className="text-4xl font-serif font-bold text-stone-900 mt-2 mb-4">Best Sellers</h2>
          <p className="text-stone-600 max-w-2xl mx-auto">Our most coveted beauty essentials, loved by our community.</p>
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

      <section className="bg-rumi-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl font-serif font-bold text-stone-900">Not sure what suits you?</h2>
            <p className="text-lg text-stone-600">Chat with Rumi, our AI Beauty Advisor. Get personalized recommendations based on your skin tone, style, and occasion.</p>
            <button onClick={() => setView('ADVISOR')} className="px-8 py-3 bg-white border-2 border-rumi-600 text-rumi-600 font-semibold rounded-full hover:bg-rumi-600 hover:text-white transition-all duration-300">Ask Rumi</button>
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
        <div className="flex flex-col gap-4">
           <div className="flex flex-wrap gap-2">
            {['All', 'Lips', 'Face', 'Eyes', 'Skincare'].map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${categoryFilter === cat ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>{cat}</button>
            ))}
          </div>
          {availableSubcategories.length > 0 && (
             <div className="flex flex-wrap gap-4 items-center text-sm text-stone-500">
                <span className="font-semibold">Categories:</span>
                {availableSubcategories.map(sub => (<span key={sub} className="bg-white border border-stone-200 px-3 py-1 rounded-md">{sub}</span>))}
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
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-stone-500">
              <p className="text-lg">No products found matching your criteria.</p>
              <button onClick={() => {setCategoryFilter('All'); setSearchQuery('');}} className="mt-4 text-rumi-600 hover:underline">Clear Filters</button>
            </div>
          ) : (
            filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} onClick={handleProductClick} />
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderAboutModal = () => {
    if (!activeAboutSection) return null;
    const data = ABOUT_CONTENT[activeAboutSection];
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setActiveAboutSection(null)}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative animate-fade-in-up" onClick={e => e.stopPropagation()}>
          <button onClick={() => setActiveAboutSection(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors text-stone-500">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
          <div className="text-center mb-6">
             <span className="text-rumi-600 font-bold tracking-wider uppercase text-xs">About Us</span>
             <h2 className="text-3xl font-serif font-bold text-stone-900 mt-2">{data.title}</h2>
          </div>
          <div className="prose prose-stone mx-auto text-stone-600 leading-relaxed text-justify"><p>{data.content}</p></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar cartCount={totalItems} onCartClick={() => setIsCartOpen(true)} currentView={view} setView={setView} searchQuery={searchQuery} setSearchQuery={handleSearchChange} />
      <main className="flex-grow">
        {view === 'HOME' && renderHome()}
        {view === 'SHOP' && renderShop()}
        {view === 'ADVISOR' && <div className="py-8 bg-stone-50 min-h-full"><AIAdvisor products={products} /></div>}
        {view === 'PRODUCT_DETAILS' && selectedProduct && <ProductDetails product={selectedProduct} onAddToCart={addToCart} onBack={() => setView('SHOP')} isPurchased={purchasedItemIds.includes(selectedProduct.id)} />}
        {view === 'ADMIN_LOGIN' && <AdminLogin onLogin={() => setView('ADMIN_DASHBOARD')} onCancel={() => setView('HOME')} />}
        {view === 'ADMIN_DASHBOARD' && <AdminDashboard products={products} onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} onBulkAddProducts={handleBulkAddProducts} />}
      </main>
      <footer className="bg-stone-900 text-white py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <span className="font-sans text-2xl font-bold tracking-tight mb-4 block">Rumi <span className="text-rumi-400">Makeup</span></span>
              <p className="text-stone-400 text-sm">Redefining beauty with clean ingredients and inclusive shades.</p>
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
                <li><button onClick={() => setActiveAboutSection('story')} className="hover:text-white">Our Story</button></li>
                <li><button onClick={() => setActiveAboutSection('ingredients')} className="hover:text-white">Ingredients</button></li>
                <li><button onClick={() => setActiveAboutSection('sustainability')} className="hover:text-white">Sustainability</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Stay Connected</h3>
              <div className="flex space-x-4">
                <a href="https://www.instagram.com/rumimakeup_" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-rumi-600 transition-colors"><i className="fa-brands fa-instagram"></i></a>
                <a href="https://www.tiktok.com/@rumi.makeup.onlin4?_r=1&_t=ZS-933cFCr32u4" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-rumi-600 transition-colors"><i className="fa-brands fa-tiktok"></i></a>
                <a href="https://www.youtube.com/@Rumimakeup" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-rumi-600 transition-colors"><i className="fa-brands fa-youtube"></i></a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-stone-800 flex justify-between items-center text-stone-500 text-sm">
            <p>© 2026 Rumi Makeup. All rights reserved.</p>
            <button onClick={() => setView('ADMIN_LOGIN')} className="hover:text-white transition-colors text-xs uppercase tracking-wider">Staff Login</button>
          </div>
        </div>
      </footer>
      {renderAboutModal()}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onRemove={removeFromCart} onUpdateQuantity={updateCartQuantity} />
    </div>
  );
}
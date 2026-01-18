import React, { useState } from 'react';
import { Product, Review } from '../types';

interface ProductDetailsProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBack: () => void;
  isPurchased: boolean;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onAddToCart, onBack, isPurchased }) => {
  const [reviews, setReviews] = useState<Review[]>(product.reviews);
  const [sortBy, setSortBy] = useState<'date' | 'helpful'>('helpful');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', userName: '' });

  const hasDiscount = product.original_price && product.original_price > product.discounted_price;
  const savings = hasDiscount ? product.original_price! - product.discounted_price : 0;
  const savingsPercentage = hasDiscount ? Math.round((savings / product.original_price!) * 100) : 0;

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
    return b.helpfulCount - a.helpfulCount;
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment.trim() || !newReview.userName.trim()) return;

    const review: Review = {
      id: Date.now().toString(),
      userName: newReview.userName,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0],
      helpfulCount: 0,
      verified: true // Because we only allow this if isPurchased is true
    };

    setReviews([review, ...reviews]);
    setShowReviewForm(false);
    setNewReview({ rating: 5, comment: '', userName: '' });
  };

  const handleBuyNow = () => {
    const text = encodeURIComponent(`Hi, I am interested in buying ${product.name} for Rs. ${product.discounted_price.toLocaleString()}`);
    window.open(`https://wa.me/923315976504?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center text-stone-500 hover:text-rumi-600 transition-colors"
      >
        <i className="fa-solid fa-arrow-left mr-2"></i> Back to Shop
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        {/* Product Image */}
        <div className="bg-stone-50 rounded-2xl overflow-hidden aspect-square relative">
          {hasDiscount && (
            <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-rumi-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-md">
              Save {savingsPercentage}%
            </div>
          )}
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="px-3 py-1 bg-rumi-100 text-rumi-800 rounded-full text-xs font-semibold uppercase tracking-wide">{product.category}</span>
               <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-semibold uppercase tracking-wide">{product.subcategory}</span>
            </div>
            <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                {hasDiscount && (
                  <span className="text-sm text-stone-400 line-through">
                    Rs. {product.original_price?.toLocaleString()}
                  </span>
                )}
                <span className="text-3xl font-bold text-stone-900">Rs. {product.discounted_price.toLocaleString()}</span>
              </div>
              <div className="flex items-center text-amber-400 text-sm h-full mt-auto pb-1">
                {[...Array(5)].map((_, i) => (
                   <i key={i} className={`fa-solid fa-star ${i < Math.floor(product.rating) ? '' : 'text-stone-300'}`}></i>
                ))}
                <span className="ml-2 text-stone-500">({reviews.length} reviews)</span>
              </div>
            </div>
          </div>

          <p className="text-lg text-stone-600 leading-relaxed">{product.description}</p>

          <div className="space-y-2">
            <h3 className="font-semibold text-stone-900">Key Benefits:</h3>
            <ul className="list-disc list-inside text-stone-600">
              {product.benefits.map((benefit, idx) => (
                <li key={idx}>{benefit}</li>
              ))}
            </ul>
          </div>

          <div className="flex gap-4 flex-col md:flex-row">
            <button 
              onClick={() => onAddToCart(product)}
              className="flex-1 px-8 py-4 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors shadow-lg text-lg"
            >
              Add to Bag - Rs. {product.discounted_price.toLocaleString()}
            </button>
             <button 
              onClick={handleBuyNow}
              className="flex-1 px-8 py-4 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition-colors shadow-lg text-lg flex items-center justify-center gap-2"
            >
              Buy on WhatsApp <i className="fa-brands fa-whatsapp"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-stone-200 pt-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2">Customer Reviews</h2>
            <p className="text-stone-500">See what others are saying about this product.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'helpful')}
              className="px-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-rumi-500"
            >
              <option value="helpful">Most Helpful</option>
              <option value="date">Newest First</option>
            </select>
            
            <button 
              onClick={() => {
                if (!isPurchased) {
                    alert("Only verified purchasers can leave a review. Please purchase this item first.");
                    return;
                }
                setShowReviewForm(!showReviewForm);
              }}
              className="px-6 py-2 bg-white border border-rumi-600 text-rumi-600 rounded-lg font-medium hover:bg-rumi-50 transition-colors"
            >
              Write a Review
            </button>
          </div>
        </div>

        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="mb-12 bg-stone-50 p-6 rounded-xl animate-fade-in-down">
            <h3 className="text-lg font-semibold mb-4">Write your review</h3>
            <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-stone-700 mb-1">Your Name</label>
                 <input 
                    type="text" 
                    value={newReview.userName}
                    onChange={(e) => setNewReview({...newReview, userName: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-rumi-500"
                    placeholder="Jane Doe"
                    required
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-stone-700 mb-1">Rating</label>
                 <div className="flex gap-2">
                   {[1, 2, 3, 4, 5].map(star => (
                     <button
                       key={star}
                       type="button"
                       onClick={() => setNewReview({...newReview, rating: star})}
                       className={`text-2xl ${newReview.rating >= star ? 'text-amber-400' : 'text-stone-300'}`}
                     >
                       <i className="fa-solid fa-star"></i>
                     </button>
                   ))}
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-medium text-stone-700 mb-1">Review</label>
                 <textarea 
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-rumi-500 min-h-[100px]"
                    placeholder="Tell us what you liked or didn't like..."
                    required
                 />
               </div>
               <div className="flex gap-3">
                 <button type="submit" className="px-6 py-2 bg-rumi-600 text-white rounded-lg hover:bg-rumi-700">Submit Review</button>
                 <button type="button" onClick={() => setShowReviewForm(false)} className="px-6 py-2 text-stone-500 hover:text-stone-700">Cancel</button>
               </div>
            </div>
          </form>
        )}

        <div className="space-y-8">
          {sortedReviews.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <i className="fa-regular fa-comment-dots text-4xl mb-3"></i>
              <p>No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            sortedReviews.map(review => (
              <div key={review.id} className="border-b border-stone-100 pb-8">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900">{review.userName}</span>
                    {review.verified && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                        <i className="fa-solid fa-check-circle"></i> Verified Buyer
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-stone-400">{review.date}</span>
                </div>
                <div className="flex text-amber-400 text-xs mb-3">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`fa-solid fa-star ${i < review.rating ? '' : 'text-stone-300'}`}></i>
                  ))}
                </div>
                <p className="text-stone-600 mb-4">{review.comment}</p>
                <div className="flex items-center gap-4 text-sm text-stone-400">
                  <button className="hover:text-rumi-600 transition-colors">
                    Helpful ({review.helpfulCount})
                  </button>
                  <button className="hover:text-stone-600 transition-colors">Report</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
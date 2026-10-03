import { useState } from 'react';
import { Star, X, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function ReviewModal({ isOpen, onClose, order, onReviewSubmitted }) {
  const [foodRating, setFoodRating] = useState(5);
  const [restaurantRating, setRestaurantRating] = useState(5);
  const [tasteRating, setTasteRating] = useState(5);
  const [packagingRating, setPackagingRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        orderId: order.id || order.rawId,
        restaurantId: order.restaurantId || 1,
        restaurantName: order.restaurantName || 'BistroByte Kitchen',
        customerEmail: order.customerEmail || 'customer@bistrobyte.com',
        customerName: order.customerName || 'Alice Customer',
        foodRating: Number(foodRating),
        restaurantRating: Number(restaurantRating),
        tasteRating: Number(tasteRating),
        packagingRating: Number(packagingRating),
        comment: comment.trim() || 'Delicious meal, fast and hot delivery!'
      };

      const res = await api.post('/reviews', payload);
      if (res.data && res.data.status === 'SUCCESS') {
        setSuccess(true);
        setTimeout(() => {
          if (onReviewSubmitted) onReviewSubmitted(res.data.review);
          onClose();
        }, 1200);
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Could not submit review.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (value, onChange) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform focus:outline-none"
          >
            <Star
              size={24}
              className={`${
                star <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-600'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-dark-card border border-dark-border rounded-3xl max-w-lg w-full p-8 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-dark-bg text-gray-400 hover:text-white border border-dark-border transition-colors"
        >
          <X size={20} />
        </button>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle2 size={56} className="text-green-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-cream mb-2">Review Submitted!</h3>
            <p className="text-soft text-sm">Thank you for rating your BistroByte experience.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                <Star size={26} className="fill-amber-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-cream">Rate Your Meal</h2>
                <p className="text-sm text-soft">Order #{order.orderNumber || order.id}</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-dark-border">
                <span className="text-sm font-semibold text-gray-300">Food Quality</span>
                {renderStars(foodRating, setFoodRating)}
              </div>

              <div className="flex justify-between items-center py-2 border-b border-dark-border">
                <span className="text-sm font-semibold text-gray-300">Taste & Flavor</span>
                {renderStars(tasteRating, setTasteRating)}
              </div>

              <div className="flex justify-between items-center py-2 border-b border-dark-border">
                <span className="text-sm font-semibold text-gray-300">Packaging & Delivery</span>
                {renderStars(packagingRating, setPackagingRating)}
              </div>

              <div className="flex justify-between items-center py-2 border-b border-dark-border">
                <span className="text-sm font-semibold text-gray-300">Overall Restaurant Experience</span>
                {renderStars(restaurantRating, setRestaurantRating)}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Comments & Feedback</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Share details of your experience (taste, portion size, warmth)..."
                  className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Submit Verified Review'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

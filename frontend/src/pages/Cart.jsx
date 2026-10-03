import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Tag, ChefHat } from 'lucide-react';

const PROMO_CODES = {
  BISTRO10: 0.10,
  NEWUSER: 0.20,
  BYTE50: 0.50,
};

export default function Cart() {
  const { cart, removeFromCart, clearCart, addToCart } = useCart();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cart.items.length > 0 ? 2.99 : 0;
  const discount = appliedPromo ? subtotal * PROMO_CODES[appliedPromo] : 0;
  const taxes = (subtotal - discount) * 0.05;
  const total = subtotal - discount + deliveryFee + taxes;

  const handleQuantityChange = (index, delta) => {
    const item = cart.items[index];
    if (item.quantity + delta <= 0) {
      removeFromCart(index);
    } else {
      const updatedItem = { ...item, quantity: item.quantity + delta };
      // Direct state manipulation via remove + add
      removeFromCart(index);
      setTimeout(() => addToCart(updatedItem, cart.restaurantId, cart.restaurantName, updatedItem.quantity), 0);
    }
  };

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      setPromoSuccess(`🎉 ${Math.round(PROMO_CODES[code] * 100)}% discount applied!`);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Try BISTRO10, NEWUSER, or BYTE50.');
      setPromoSuccess('');
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center text-center p-8">
        <div className="w-32 h-32 mb-6 rounded-full bg-dark-card border border-dark-border flex items-center justify-center animate-pulse">
          <ShoppingCart size={56} className="text-primary opacity-60" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Your cart is empty</h2>
        <p className="text-gray-400 mb-8 max-w-sm">Looks like you haven't added anything yet. Explore restaurants and build your perfect meal!</p>
        <Link
          to="/"
          className="flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-dark-bg font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
        >
          <ChefHat size={20} />
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Your Cart</h1>
        <p className="text-gray-400 mb-8">
          Ordering from <span className="text-primary font-semibold">{cart.restaurantName}</span>
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item, index) => (
              <div
                key={index}
                className="bg-dark-card border border-dark-border rounded-2xl p-5 flex gap-4 items-center hover:border-primary/30 transition-all"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-dark-bg flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${item.veg ? 'border-green-500 bg-green-500' : 'border-red-500 bg-red-500'}`} />
                    <h3 className="font-semibold text-white truncate">{item.name}</h3>
                  </div>
                  {item.customizations && Object.keys(item.customizations).length > 0 && (
                    <p className="text-xs text-gray-500 mb-2">
                      {Object.entries(item.customizations).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                    </p>
                  )}
                  <p className="text-primary font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-2 bg-dark-bg rounded-full px-1 py-1 border border-dark-border">
                    <button
                      onClick={() => handleQuantityChange(index, -1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-white font-bold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(index, 1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-green-500/20 hover:text-green-400 transition-all"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(index)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {/* Promo Code */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Tag size={18} className="text-primary" />
                <h3 className="font-semibold text-white">Promo Code</h3>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter code (e.g. BISTRO10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50"
                />
                <button
                  onClick={applyPromo}
                  disabled={!!appliedPromo}
                  className="px-5 py-2.5 rounded-xl bg-primary text-dark-bg font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
              {promoError && <p className="text-red-400 text-sm mt-2">{promoError}</p>}
              {promoSuccess && <p className="text-green-400 text-sm mt-2">{promoSuccess}</p>}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal ({cart.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="text-white">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({appliedPromo})</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400">
                  <span>Delivery Fee</span>
                  <span className="text-white">₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Taxes & Charges</span>
                  <span className="text-white">₹{taxes.toFixed(2)}</span>
                </div>
                <div className="border-t border-dark-border pt-3 flex justify-between text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout', { state: { total, subtotal, discount, deliveryFee, taxes, appliedPromo } })}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-primary text-dark-bg font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 group"
              >
                Proceed to Checkout
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={clearCart}
                className="w-full mt-3 py-2 rounded-full text-gray-500 hover:text-red-400 text-sm font-medium transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Calendar, Check, Clock, Utensils, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import api from '../services/api';

const TIFFIN_PLANS = [
  {
    id: 'WEEKLY_LUNCH',
    title: 'Weekly Lunch Thali Plan',
    duration: '7 Days',
    mealType: 'Lunch',
    price: 49.99,
    description: 'Hot authentic Andhra & South Indian lunch delivered fresh every day by 12:30 PM.',
    features: ['Different chef special daily', 'Includes Rice, 2 Curries, Sambar & Curd', 'Free delivery included', 'Pause anytime']
  },
  {
    id: 'WEEKLY_DINNER',
    title: 'Weekly Healthy Dinner Plan',
    duration: '7 Days',
    mealType: 'Dinner',
    price: 54.99,
    description: 'Light, wholesome dinner rotation with rotis, dal makhani, paneer/chicken and salad.',
    features: ['Delivered hot by 7:30 PM', 'High protein & fiber balanced', 'Weekend dessert treat', 'Pause anytime']
  },
  {
    id: 'MONTHLY_LUNCH',
    title: 'Monthly Executive Feast Plan',
    duration: '30 Days',
    mealType: 'Lunch',
    price: 189.99,
    description: 'Our most popular full month corporate & student package with maximum variety and zero repetition.',
    features: ['30 Days of gourmet meals', 'Save over 25% compared to daily orders', 'Priority doorstep delivery', 'Customizable weekend menu']
  }
];

export default function TiffinPlans() {
  const [selectedPlan, setSelectedPlan] = useState(TIFFIN_PLANS[0]);
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [mySubscriptions, setMySubscriptions] = useState([]);
  const [subscribedSuccess, setSubscribedSuccess] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      setCustomerEmail(u.email || '');
      setDeliveryAddress('12 Main Campus Rd, Vaddeswaram');
      fetchMySubscriptions(u.email);
    }
  }, []);

  const fetchMySubscriptions = async (email) => {
    if (!email) return;
    try {
      const res = await api.get(`/tiffins/customer/${email}`);
      setMySubscriptions(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubscribe = async (plan) => {
    try {
      const payload = {
        customerEmail: customerEmail || 'customer@bistrobyte.com',
        restaurantId: 1,
        planType: plan.id,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        deliveryAddress: deliveryAddress || '12 Main Campus Road',
        totalAmount: plan.price
      };

      const res = await api.post('/tiffins/subscribe', payload);
      if (res.data) {
        setSubscribedSuccess(true);
        fetchMySubscriptions(customerEmail || 'customer@bistrobyte.com');
        setTimeout(() => setSubscribedSuccess(false), 4000);
      }
    } catch (err) {
      alert('Failed to activate subscription: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
          <Sparkles size={14} /> Automated Daily Dining
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-cream tracking-tight mb-4">
          BistroByte Tiffin Subscriptions
        </h1>
        <p className="text-soft text-lg">
          Zero daily ordering friction. Fresh, homestyle meals delivered hot to your doorstep right on schedule.
        </p>
      </div>

      {subscribedSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-2xl mb-8 text-center font-bold text-base max-w-xl mx-auto">
          🎉 Tiffin plan activated successfully! Deliveries begin tomorrow at your selected meal time.
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {TIFFIN_PLANS.map(plan => {
          const isSelected = selectedPlan.id === plan.id;
          return (
            <div
              key={plan.id}
              className={`bg-dark-card border rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                isSelected 
                  ? 'border-primary shadow-2xl shadow-primary/20 scale-105' 
                  : 'border-dark-border hover:border-gray-600'
              }`}
            >
              {plan.id === 'MONTHLY_LUNCH' && (
                <span className="absolute -top-3.5 right-6 bg-gradient-to-r from-primary to-orange-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest shadow-md">
                  BEST VALUE
                </span>
              )}

              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {plan.duration} • {plan.mealType}
                </span>
                <h3 className="text-2xl font-bold text-cream mt-4 mb-2">{plan.title}</h3>
                <p className="text-soft text-sm mb-6">{plan.description}</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-black text-cream">₹{plan.price}</span>
                  <span className="text-soft text-sm">/ period</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-xs text-gray-300 font-medium">
                      <Check size={16} className="text-primary flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSubscribe(plan)}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                  isSelected 
                    ? 'bg-primary hover:bg-primary-hover text-white shadow-primary/30' 
                    : 'bg-dark-bg hover:bg-dark-border border border-dark-border text-cream'
                }`}
              >
                Subscribe Now <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Active Subscriptions */}
      {mySubscriptions.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-cream mb-6 flex items-center gap-2">
            <Utensils className="text-primary" /> My Active Tiffin Subscriptions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mySubscriptions.map(sub => (
              <div key={sub.id} className="bg-dark-bg border border-dark-border p-5 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2.5 py-0.5 rounded uppercase">
                    {sub.status}
                  </span>
                  <h4 className="text-base font-bold text-cream mt-2">{sub.planType?.replace('_', ' ')}</h4>
                  <p className="text-xs text-soft mt-0.5">Delivery to: {sub.deliveryAddress}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-primary">₹{sub.totalAmount}</p>
                  <button className="text-xs text-gray-500 hover:text-red-400 mt-2 block transition-colors">
                    Pause Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

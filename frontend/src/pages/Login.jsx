import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ShieldCheck, ChefHat, Bike, KeyRound, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function Login({ setIsAdvancedMode }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [foodPreference, setFoodPreference] = useState('Any');
  const [spiceLevel, setSpiceLevel] = useState('Medium');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        const res = await api.post('/auth/forgot-password', { email });
        setSuccessMsg(res.data.message || 'Password reset link sent.');
        return;
      }

      if (isLogin) {
        const res = await api.post('/auth/login', { email, password });
        handleAuthSuccess(res.data);
      } else {
        const res = await api.post('/auth/register', {
          name,
          email,
          password,
          phone,
          foodPreference,
          spiceLevel
        });
        handleAuthSuccess(res.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefault = async () => {
    try {
      setLoading(true);
      await api.post('/auth/reset-password', { email: email.trim(), newPassword: 'password' });
      setPassword('password');
      setError('');
      setSuccessMsg("Password set to 'password'! Click 'Sign In' now.");
    } catch (err) {
      setError("Reset failed: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    window.dispatchEvent(new Event('auth-change'));

    setSuccessMsg(`Welcome, ${data.name || 'User'}! Logging you in...`);

    setTimeout(() => {
      if (data.role?.includes('ADMIN') || data.role?.includes('KITCHEN') || data.role?.includes('OWNER') || data.role?.includes('CHEF') || data.role?.includes('DELIVERY')) {
        setIsAdvancedMode?.(true);
        navigate('/staff-portal');
      } else {
        setIsAdvancedMode?.(false);
        navigate('/');
      }
    }, 600);
  };

  const handleQuickLogin = async (roleKey) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.get(`/auth/quick-login?role=${roleKey}`);
      handleAuthSuccess(res.data);
    } catch (err) {
      setError('Quick login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-lg">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-orange-600 rounded-3xl flex items-center justify-center font-black text-3xl text-white shadow-xl shadow-primary/30 mx-auto mb-4">
            B
          </div>
          <h1 className="text-3xl font-black text-cream tracking-tight mb-1">
            {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome back' : 'Create Customer Account'}
          </h1>
          <p className="text-soft text-sm">
            {isForgotPassword 
              ? 'Enter your email to receive recovery instructions.' 
              : isLogin 
                ? 'Sign in to access your orders, taste profile and favorites.' 
                : 'Join BistroByte to discover food personalized for your palate.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-dark-card border border-dark-border rounded-3xl p-8 shadow-2xl">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 text-xs text-center font-semibold space-y-2">
              <p>{error}</p>
              {isLogin && email && (
                <div className="pt-2 border-t border-red-500/20 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg text-[11px] font-bold underline"
                  >
                    Reset password for this email to "password"
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPassword('123654'); setError(''); }}
                    className="px-3 py-1 bg-primary/20 hover:bg-primary/30 text-cream rounded-lg text-[11px] font-bold"
                  >
                    Try "123654"
                  </button>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3.5 rounded-2xl mb-6 text-xs text-center font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 size={16} /> {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Registration Fields */}
            {!isLogin && !isForgotPassword && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-3.5 text-gray-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Sai Nikhil"
                      className="w-full bg-dark-bg border border-dark-border rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Phone Number</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-3.5 text-gray-500" />
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91-9876543210"
                      className="w-full bg-dark-bg border border-dark-border rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Food Type</label>
                    <select
                      value={foodPreference}
                      onChange={e => setFoodPreference(e.target.value)}
                      className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    >
                      <option value="Any">Any / Both</option>
                      <option value="Veg">Vegetarian</option>
                      <option value="Non-Veg">Non-Veg</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Spice Preference</label>
                    <select
                      value={spiceLevel}
                      onChange={e => setSpiceLevel(e.target.value)}
                      className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    >
                      <option value="Mild">Mild 🍃</option>
                      <option value="Medium">Medium 🌶️</option>
                      <option value="Spicy">Spicy 🔥</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-3.5 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@bistrobyte.com"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-400 uppercase">Password</label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-3.5 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-dark-bg border border-dark-border rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 mt-2 flex items-center justify-center gap-2 text-sm shadow-xl shadow-primary/25 font-bold"
            >
              {loading ? 'Please wait...' : isForgotPassword ? 'Send Reset Pin' : isLogin ? 'Sign In to BistroByte' : 'Create Account'}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Toggle Login / Register / Forgot */}
          <div className="mt-6 text-center text-xs text-gray-400 border-t border-dark-border pt-4">
            {isForgotPassword ? (
              <button onClick={() => setIsForgotPassword(false)} className="text-primary font-bold hover:underline">
                Back to Sign In
              </button>
            ) : isLogin ? (
              <span>
                Don't have an account?{' '}
                <button onClick={() => setIsLogin(false)} className="text-primary font-bold hover:underline">
                  Sign up now
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button onClick={() => setIsLogin(true)} className="text-primary font-bold hover:underline">
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>

        {/* DEMO QUICK LOGIN BAR */}
        <div className="mt-8 bg-dark-card border border-dark-border rounded-3xl p-6 shadow-xl text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-primary mb-3">
            <Sparkles size={14} /> Academic Presentation Quick-Logins
          </div>
          <p className="text-xs text-soft mb-4">Click any role to log in with pre-seeded demo accounts instantly:</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <button
              onClick={() => handleQuickLogin('SAINIKHIL')}
              className="p-2.5 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/50 text-white font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <User size={14} className="text-primary" /> Sai Nikhil
            </button>
            <button
              onClick={() => handleQuickLogin('CUSTOMER')}
              className="p-2.5 rounded-xl bg-dark-bg hover:bg-dark-border border border-dark-border text-gray-200 hover:text-white font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <User size={14} className="text-primary" /> Alice (Customer)
            </button>
            <button
              onClick={() => handleQuickLogin('KITCHEN_STAFF')}
              className="p-2.5 rounded-xl bg-dark-bg hover:bg-dark-border border border-dark-border text-gray-200 hover:text-white font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <ChefHat size={14} className="text-orange-400" /> Kitchen Staff
            </button>
            <button
              onClick={() => handleQuickLogin('DELIVERY_STAFF')}
              className="p-2.5 rounded-xl bg-dark-bg hover:bg-dark-border border border-dark-border text-gray-200 hover:text-white font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Bike size={14} className="text-green-400" /> Delivery Rider
            </button>
            <button
              onClick={() => handleQuickLogin('CHEF')}
              className="p-2.5 rounded-xl bg-dark-bg hover:bg-dark-border border border-dark-border text-gray-200 hover:text-white font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <ChefHat size={14} className="text-amber-400" /> Head Chef
            </button>
            <button
              onClick={() => handleQuickLogin('RESTAURANT_OWNER')}
              className="p-2.5 rounded-xl bg-dark-bg hover:bg-dark-border border border-dark-border text-gray-200 hover:text-white font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck size={14} className="text-blue-400" /> Owner
            </button>
            <button
              onClick={() => handleQuickLogin('ADMIN')}
              className="p-2.5 rounded-xl bg-dark-bg hover:bg-dark-border border border-dark-border text-gray-200 hover:text-white font-semibold transition-colors flex items-center justify-center gap-1.5 col-span-2 sm:col-span-3"
            >
              <KeyRound size={14} className="text-purple-400" /> Platform Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

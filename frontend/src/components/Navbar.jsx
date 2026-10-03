import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, User, ShoppingCart, Bot, Globe, LogOut, ShieldCheck, ChevronDown, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { SUPPORTED_LANGUAGES, getTranslation } from '../services/i18n';
import LocationModal from './LocationModal';
import { getActiveLocation, setActiveLocation, formatLocationLabel } from '../utils/locationService';

export default function Navbar({ isAdvancedMode, setIsAdvancedMode, currentLang = 'en', setCurrentLang }) {
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationLabel, setLocationLabel] = useState(() => formatLocationLabel(getActiveLocation()));

  const t = (key) => getTranslation(currentLang, key);

  const syncLocation = () => {
    const loc = getActiveLocation();
    setLocationLabel(formatLocationLabel(loc));
  };

  useEffect(() => {
    checkUser();
    syncLocation();
    window.addEventListener('storage', checkUser);
    window.addEventListener('auth-change', checkUser);
    window.addEventListener('auth-change', syncLocation);
    window.addEventListener('location-change', syncLocation);
    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('auth-change', checkUser);
      window.removeEventListener('auth-change', syncLocation);
      window.removeEventListener('location-change', syncLocation);
    };
  }, []);

  // Update immediately whenever route changes (e.g. from /login to /)
  useEffect(() => {
    checkUser();
    syncLocation();
  }, [location.pathname]);

  const checkUser = () => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    setUser(null);
    setShowUserMenu(false);
    navigate('/');
  };

  const isStaffOrAdmin = user?.role && !user.role.includes('CUSTOMER');

  return (
    <>
      <nav className="glass-nav py-3 px-6 lg:px-12 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-600 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-primary/30">
              B
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-cream leading-none">BistroByte</span>
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">Hospitality Platform</span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 text-cream font-semibold text-sm">
            <Link to="/" className="hover:text-primary transition-colors">{t('home')}</Link>
            <Link to="/build-meal" className="hover:text-primary transition-colors">{t('meals')}</Link>
            <Link to="/tiffin" className="hover:text-primary transition-colors">{t('tiffin')}</Link>
            <Link to="/meal-planner" className="hover:text-primary transition-colors">{t('mealPlanner')}</Link>
            <Link to="/orders" className="hover:text-primary transition-colors">{t('orders')}</Link>
            {isStaffOrAdmin && (
              <Link to="/staff-portal" className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 font-bold">
                <ShieldCheck size={16} /> Operations
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            
            {/* Location Button */}
            <button
              onClick={() => setShowLocationModal(true)}
              className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-200 bg-dark-card hover:bg-dark-border px-3.5 py-2 rounded-full border border-dark-border hover:border-primary/50 transition-all cursor-pointer shadow-sm group"
              title="Click to change delivery location"
            >
              <MapPin size={15} className="text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate max-w-[140px]">{locationLabel}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" title="Location Active"></span>
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 p-2 rounded-xl bg-dark-card border border-dark-border text-xs text-gray-300 hover:text-white transition-colors"
                title="Select Language"
              >
                <Globe size={16} className="text-primary" />
                <span className="uppercase font-bold">{currentLang}</span>
                <ChevronDown size={14} />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-dark-card border border-dark-border rounded-2xl shadow-2xl py-2 z-50">
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setCurrentLang(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors flex justify-between items-center ${
                        currentLang === lang.code ? 'bg-primary/20 text-primary font-bold' : 'text-gray-300 hover:bg-dark-border'
                      }`}
                    >
                      <span>{lang.native}</span>
                      <span className="text-[10px] text-gray-500 uppercase">{lang.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Advanced Mode Toggle */}
            <button 
              onClick={() => setIsAdvancedMode(!isAdvancedMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                isAdvancedMode 
                  ? 'bg-amber-500/20 text-amber-500 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                  : 'bg-dark-bg text-gray-500 border-dark-border hover:border-gray-600'
              }`}
            >
              <span className={isAdvancedMode ? 'animate-pulse' : ''}>⚡</span>
              <span>{t('advancedMode')}</span>
            </button>

            {/* User Account / Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-dark-card border border-dark-border hover:border-primary transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-dark-card border border-dark-border rounded-2xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-dark-border">
                      <p className="text-xs font-bold text-cream truncate">{user.name}</p>
                      <p className="text-[11px] text-soft truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] bg-primary/20 text-primary font-bold px-2 py-0.5 rounded">
                        {user.role?.replace('ROLE_', '')}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2.5 text-xs text-gray-300 hover:bg-dark-border hover:text-white font-medium"
                    >
                      {t('profile')} & Taste Settings
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2.5 text-xs text-gray-300 hover:bg-dark-border hover:text-white font-medium"
                    >
                      {t('orders')}
                    </Link>

                    {isStaffOrAdmin && (
                      <Link
                        to="/staff-portal"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2.5 text-xs text-amber-400 hover:bg-dark-border font-bold"
                      >
                        Kitchen & Staff Portal
                      </Link>
                    )}

                    <div className="border-t border-dark-border my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-dark-border font-semibold flex items-center gap-2"
                    >
                      <LogOut size={14} /> {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-xs py-2 px-4">
                {t('login')}
              </Link>
            )}

            {/* Cart Icon with Counter */}
            <Link to="/cart" className="relative text-gray-300 hover:text-white transition-colors p-2 rounded-xl bg-dark-card border border-dark-border">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg shadow-primary/40 animate-pulse">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Location Modal */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSelected={(loc) => {
          setActiveLocation(loc);
        }}
        onUseCurrentLocation={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
              const coords = {
                lat: pos.coords.latitude,
                lon: pos.coords.longitude,
                displayName: `GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
                city: 'Live GPS',
                isManual: false
              };
              setActiveLocation(coords);
            });
          }
        }}
      />
    </>
  );
}

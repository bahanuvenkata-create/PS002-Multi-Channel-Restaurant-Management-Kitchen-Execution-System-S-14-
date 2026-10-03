import { useState, useEffect } from 'react';
import { Search, MapPin, Compass, AlertCircle, RefreshCw, Sparkles, Filter, SlidersHorizontal, Mic, CheckCircle2 } from 'lucide-react';
import RestaurantCard from '../components/RestaurantCard';
import MealTimeBanner from '../components/MealTimeBanner';
import CuisineExplorer from '../components/CuisineExplorer';
import LocationModal from '../components/LocationModal';
import { getRestaurants, getNearbyRestaurants, searchRestaurants, calculateDistance } from '../services/api';
import { getTranslation } from '../services/i18n';
import { getActiveLocation, setActiveLocation } from '../utils/locationService';

// The 5 Required Location States
const LOCATION_STATES = {
  NOT_SELECTED: 'LOCATION_NOT_SELECTED',
  LOADING: 'LOCATION_LOADING',
  SUCCESS: 'LOCATION_SUCCESS',
  PERMISSION_DENIED: 'LOCATION_PERMISSION_DENIED',
  UNAVAILABLE: 'LOCATION_UNAVAILABLE'
};

export default function Home({ isAdvancedMode, currentLang = 'en' }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationState, setLocationState] = useState(LOCATION_STATES.NOT_SELECTED);
  const [locationAddressName, setLocationAddressName] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Nearest');
  const [activeCuisine, setActiveCuisine] = useState(null);
  const [activeMealTime, setActiveMealTime] = useState('Any');
  const [healthyOnly, setHealthyOnly] = useState(false);
  const [vegOnly, setVegOnly] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const t = (key) => getTranslation(currentLang, key);

  useEffect(() => {
    const readUser = () => {
      try {
        const u = localStorage.getItem('user');
        setCurrentUser(u ? JSON.parse(u) : null);
      } catch (e) {
        setCurrentUser(null);
      }
    };
    readUser();
    window.addEventListener('storage', readUser);
    window.addEventListener('auth-change', readUser);
    return () => {
      window.removeEventListener('storage', readUser);
      window.removeEventListener('auth-change', readUser);
    };
  }, []);

  // Initial load: fetch persistent location & partner restaurants
  useEffect(() => {
    const loc = getActiveLocation();
    if (loc && (loc.lat || loc.displayName)) {
      setUserLocation(loc);
      setLocationAddressName(loc.displayName || loc.city || 'Active Location');
      setLocationState(LOCATION_STATES.SUCCESS);
      if (loc.lat && loc.lon) {
        getNearbyRestaurants(loc.lat, loc.lon, 15.0).then(nearby => {
          if (nearby && nearby.length > 0) {
            setRestaurants(nearby);
          } else {
            fetchInitialPartners();
          }
        }).catch(err => {
          console.warn("Could not fetch nearby on init:", err);
          fetchInitialPartners();
        });
        return;
      }
    }
    fetchInitialPartners();
  }, []);

  // Listen for external location changes (e.g. from Navbar or LocationModal)
  useEffect(() => {
    const handleLocationChange = (e) => {
      const loc = e.detail || getActiveLocation();
      if (loc) {
        setUserLocation(loc);
        setLocationAddressName(loc.displayName || loc.city || 'Active Location');
        setLocationState(LOCATION_STATES.SUCCESS);
        if (loc.lat && loc.lon) {
          getNearbyRestaurants(loc.lat, loc.lon, 15.0).then(data => {
            if (data && data.length > 0) setRestaurants(data);
          }).catch(console.error);
        }
      }
    };
    window.addEventListener('location-change', handleLocationChange);
    return () => window.removeEventListener('location-change', handleLocationChange);
  }, []);

  const fetchInitialPartners = async () => {
    try {
      const data = await getRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
    }
  };

  // Real Live GPS Location Request
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationState(LOCATION_STATES.UNAVAILABLE);
      return;
    }

    setLocationState(LOCATION_STATES.LOADING);
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          displayName: `GPS (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`,
          city: 'Live GPS',
          isManual: false
        };

        setActiveLocation(coords);
        setUserLocation(coords);
        setLocationAddressName(coords.displayName);
        setLocationState(LOCATION_STATES.SUCCESS);

        try {
          // Fetch real nearby discovery & partner restaurants from backend
          const nearbyData = await getNearbyRestaurants(coords.lat, coords.lon, 15.0);
          setRestaurants(nearbyData);
        } catch (err) {
          console.error("Failed to fetch nearby:", err);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        if (err.code === 1) { // PERMISSION_DENIED
          setLocationState(LOCATION_STATES.PERMISSION_DENIED);
        } else {
          setLocationState(LOCATION_STATES.UNAVAILABLE);
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Callback when user selects location manually via LocationModal
  const handleManualLocationSelected = async (loc) => {
    setActiveLocation(loc);
    setUserLocation(loc);
    setLocationAddressName(loc.displayName || `${loc.city || 'Selected Location'}`);
    setLocationState(LOCATION_STATES.SUCCESS);
    setLoading(true);

    try {
      const nearbyData = await getNearbyRestaurants(loc.lat, loc.lon, 15.0);
      setRestaurants(nearbyData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Real Search Execution
  const handleSearchSubmit = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      if (userLocation) {
        const data = await getNearbyRestaurants(userLocation.lat, userLocation.lon);
        setRestaurants(data);
      } else {
        fetchInitialPartners();
      }
      return;
    }

    setLoading(true);
    try {
      const lat = userLocation?.lat;
      const lon = userLocation?.lon;
      const results = await searchRestaurants(searchQuery, lat, lon);
      setRestaurants(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter & Sort logic
  const displayedRestaurants = restaurants
    .filter(rest => {
      // Cuisine filter
      if (activeCuisine && (!rest.cuisine || !rest.cuisine.toLowerCase().includes(activeCuisine.toLowerCase()))) {
        return false;
      }
      // Veg only filter
      if (vegOnly && !rest.isVegOnly) {
        return false;
      }
      // Healthy filter
      if (healthyOnly && rest.isVegOnly !== true && !(rest.cuisine && rest.cuisine.toLowerCase().includes('healthy'))) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'Nearest') {
        return (a.distance || Infinity) - (b.distance || Infinity);
      } else if (sortBy === 'Top Rated') {
        return (b.rating || 0) - (a.rating || 0);
      } else if (sortBy === 'Fastest') {
        const timeA = parseInt(a.deliveryTimeMins?.split('-')[0] || '999');
        const timeB = parseInt(b.deliveryTimeMins?.split('-')[0] || '999');
        return timeA - timeB;
      } else if (sortBy === 'Lowest Price') {
        return (a.deliveryFee || 0) - (b.deliveryFee || 0);
      }
      return 0;
    });

  return (
    <div className="flex flex-col items-center pb-24">
      
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-6 pt-16 pb-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-black tracking-widest uppercase mb-4 shadow-inner">
          <Sparkles size={14} className="animate-spin" /> {t('brand')} Platform
        </div>

        {currentUser && (
          <div className="mb-4 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-lg animate-fade-in">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Welcome back, <strong className="text-white">{currentUser.name}</strong>! Exploring restaurants in your area.</span>
          </div>
        )}
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-4 text-cream leading-tight">
          WHAT'S YOUR
          <span className="block text-primary mt-1">MEAL TODAY?</span>
        </h1>
        
        <p className="text-lg md:text-xl text-soft max-w-2xl mb-10 font-light">
          {t('discoverSub')}
        </p>
        
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl bg-dark-card border border-dark-border rounded-full p-2 flex items-center shadow-2xl focus-within:border-primary focus-within:shadow-primary/20 transition-all mb-8">
          <div className="pl-4 pr-2 text-gray-400">
            <Search size={22} />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')} 
            className="flex-1 bg-transparent border-none outline-none text-base text-white placeholder-gray-500 px-2"
          />
          <button type="submit" className="btn-primary">
            {t('explore')}
          </button>
        </form>
        
        {/* LOCATION STATUS & STATE HANDLER */}
        <div className="w-full max-w-xl bg-dark-card border border-dark-border rounded-3xl p-6 shadow-xl flex flex-col items-center text-center transition-all">
          
          {/* STATE 1: LOCATION NOT SELECTED */}
          {locationState === LOCATION_STATES.NOT_SELECTED && (
            <div className="space-y-4">
              <p className="text-sm text-soft font-medium">{t('locNotSelected')}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={handleUseCurrentLocation}
                  className="btn-primary flex items-center gap-2 text-sm shadow-md"
                >
                  <Compass size={18} /> {t('useCurrentLocation')}
                </button>
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="px-5 py-2.5 rounded-full bg-dark-bg hover:bg-dark-border border border-dark-border text-cream text-sm font-semibold transition-colors"
                >
                  {t('enterLocationManually')}
                </button>
              </div>
            </div>
          )}

          {/* STATE 2: LOCATION LOADING */}
          {locationState === LOCATION_STATES.LOADING && (
            <div className="flex items-center gap-3 py-2 text-primary font-bold text-base animate-pulse">
              <Compass size={24} className="animate-spin" />
              <span>{t('locLoading')}</span>
            </div>
          )}

          {/* STATE 3: LOCATION SUCCESS */}
          {locationState === LOCATION_STATES.SUCCESS && (
            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 flex-shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                      {userLocation?.isManual ? 'MANUALLY SELECTED LOCATION' : 'CURRENT LOCATION'}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-cream mt-0.5 truncate max-w-sm">
                    {locationAddressName}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleUseCurrentLocation}
                  className="p-2.5 rounded-xl bg-dark-bg hover:bg-dark-border border border-dark-border text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Refresh GPS"
                >
                  <RefreshCw size={14} /> Refresh
                </button>
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-dark-bg hover:bg-dark-border border border-dark-border text-xs text-primary font-bold transition-colors"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          {/* STATE 4: LOCATION PERMISSION DENIED */}
          {locationState === LOCATION_STATES.PERMISSION_DENIED && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-sm">
                <AlertCircle size={18} /> {t('locDenied')}
              </div>
              <p className="text-xs text-soft max-w-md">
                Your browser blocked geolocation. You can grant permission in your URL bar and try again, or enter your area manually.
              </p>
              <div className="flex justify-center gap-3 pt-1">
                <button
                  onClick={handleUseCurrentLocation}
                  className="btn-primary text-xs py-2 px-4"
                >
                  {t('tryAgain')}
                </button>
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="px-4 py-2 rounded-full bg-dark-bg hover:bg-dark-border border border-dark-border text-xs text-white transition-colors"
                >
                  {t('enterLocationManually')}
                </button>
              </div>
            </div>
          )}

          {/* STATE 5: LOCATION UNAVAILABLE */}
          {locationState === LOCATION_STATES.UNAVAILABLE && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-red-400 font-bold text-sm">
                <AlertCircle size={18} /> {t('locUnavailable')}
              </div>
              <p className="text-xs text-soft">
                Could not retrieve GPS signal. Please enter your location manually.
              </p>
              <div className="flex justify-center gap-3 pt-1">
                <button
                  onClick={handleUseCurrentLocation}
                  className="btn-primary text-xs py-2 px-4"
                >
                  {t('tryAgain')}
                </button>
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="px-4 py-2 rounded-full bg-dark-bg hover:bg-dark-border border border-dark-border text-xs text-white transition-colors"
                >
                  {t('enterLocationManually')}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Meal Time Intelligence Banner */}
      <MealTimeBanner onMealTypeChange={setActiveMealTime} />
      
      {/* Regional & Global Cuisines Discovery */}
      <CuisineExplorer 
        activeCuisine={activeCuisine} 
        onCuisineSelect={setActiveCuisine} 
      />

      {/* Restaurants Discovery Section */}
      <section className="w-full bg-dark-card/60 border-t border-dark-border py-16 mt-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-cream tracking-tight">
                  {locationState === LOCATION_STATES.SUCCESS ? t('restaurantsNearYou') : 'Featured Dining Establishments'}
                </h2>
                <span className="text-xs font-bold bg-primary/20 text-primary px-3 py-1 rounded-full">
                  {displayedRestaurants.length} Places Found
                </span>
              </div>
              <p className="text-soft text-sm mt-1">
                Real-time hybrid discovery: verified BistroByte partners and discovered local culinary spots.
              </p>
            </div>

            {/* Filters and Sorting Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Veg Only Toggle */}
              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  vegOnly 
                    ? 'bg-green-600 text-white border-green-500' 
                    : 'bg-dark-bg text-gray-400 border-dark-border hover:text-white'
                }`}
              >
                🌱 Veg Only
              </button>

              {/* Healthy Mode Toggle */}
              <button
                onClick={() => setHealthyOnly(!healthyOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  healthyOnly 
                    ? 'bg-emerald-600 text-white border-emerald-500' 
                    : 'bg-dark-bg text-gray-400 border-dark-border hover:text-white'
                }`}
              >
                🥗 Healthy Mode
              </button>

              {/* Sorting Selector */}
              <div className="flex items-center gap-2 bg-dark-bg border border-dark-border rounded-xl px-3 py-1.5 text-xs">
                <SlidersHorizontal size={14} className="text-primary" />
                <span className="text-soft">{t('sortBy')}:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-white font-bold outline-none cursor-pointer"
                >
                  <option value="Nearest" className="bg-dark-card">{t('nearest')}</option>
                  <option value="Top Rated" className="bg-dark-card">{t('topRated')}</option>
                  <option value="Fastest" className="bg-dark-card">{t('fastest')}</option>
                  <option value="Lowest Price" className="bg-dark-card">{t('lowestPrice')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="bg-dark-card border border-dark-border rounded-2xl h-80 animate-pulse p-4">
                  <div className="bg-zinc-800 h-48 rounded-xl mb-4"></div>
                  <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : displayedRestaurants.length === 0 ? (
            <div className="text-center py-16 bg-dark-bg rounded-3xl border border-dark-border p-8">
              <p className="text-lg font-bold text-gray-400 mb-2">No restaurants match your current filters.</p>
              <p className="text-xs text-soft mb-6">Try clearing active cuisine filters or expanding your radius.</p>
              <button
                onClick={() => {
                  setActiveCuisine(null);
                  setVegOnly(false);
                  setHealthyOnly(false);
                  setSearchQuery('');
                  if (userLocation) {
                    getNearbyRestaurants(userLocation.lat, userLocation.lon).then(setRestaurants);
                  } else {
                    fetchInitialPartners();
                  }
                }}
                className="btn-primary text-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedRestaurants.map(rest => (
                <RestaurantCard key={rest.id || rest.externalPlaceId} restaurant={rest} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Manual Location Modal */}
      <LocationModal 
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSelected={handleManualLocationSelected}
        onUseCurrentLocation={handleUseCurrentLocation}
      />
    </div>
  );
}

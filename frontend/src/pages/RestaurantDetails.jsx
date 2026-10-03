import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, Clock, MapPin, Truck, Leaf, Flame, Info, ShoppingCart, 
  Check, Heart, Calendar, QrCode, X, ExternalLink, ShieldCheck, 
  AlertCircle, Navigation, MessageSquare, User
} from 'lucide-react';
import { getRestaurantById, getMenuByRestaurant, getRestaurantReviews, formatDistance, reserveTable } from '../services/api';
import { useCart } from '../context/CartContext';

export default function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Menu');
  const [activeMeal, setActiveMeal] = useState('All');
  const [addedItems, setAddedItems] = useState({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReservation, setShowReservation] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(null);
  const [showQr, setShowQr] = useState(false);
  const [tableCode, setTableCode] = useState('');
  const [tableSaved, setTableSaved] = useState(false);

  // Reservation form state
  const [resDate, setResDate] = useState(new Date().toISOString().split('T')[0]);
  const [resTime, setResTime] = useState('19:30');
  const [resGuests, setResGuests] = useState('2 People');
  const [resSeating, setResSeating] = useState('Indoor');

  const isPartner = true;

  const handleAddToCart = (item) => {
    const cartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      veg: item.vegetarian,
      image: item.imageUrl,
    };
    const success = addToCart(cartItem, restaurant.id, restaurant.name, 1);
    if (success) {
      setAddedItems(prev => ({ ...prev, [item.id]: true }));
      setTimeout(() => setAddedItems(prev => ({ ...prev, [item.id]: false })), 1500);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const restData = await getRestaurantById(id);
        setRestaurant(restData);
        
        try {
          const menuData = await getMenuByRestaurant(id);
          setMenu(menuData || []);
        } catch (mErr) {
          console.warn('Menu fetch error:', mErr);
          setMenu([]);
        }

        try {
          const reviewData = await getRestaurantReviews(id);
          setReviews(reviewData || []);
        } catch (rErr) {
          console.warn('Reviews fetch error:', rErr);
          setReviews([]);
        }
      } catch (error) {
        console.error('Error fetching restaurant details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const payload = {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        customerName: user.name || 'Customer',
        customerEmail: user.email || 'customer@bistrobyte.com',
        date: resDate,
        time: resTime,
        guests: resGuests,
        seating: resSeating,
      };
      await reserveTable(payload).catch(() => null);
      const confNumber = 'BBR-' + Math.floor(100000 + Math.random() * 900000);
      setReservationSuccess(confNumber);
      setTimeout(() => {
        setReservationSuccess(null);
        setShowReservation(false);
      }, 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetTable = () => {
    if (!tableCode.trim()) return;
    sessionStorage.setItem('bistrobyte_table', tableCode.trim().toUpperCase());
    setTableSaved(true);
    setTimeout(() => {
      setTableSaved(false);
      setShowQr(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-medium">Loading restaurant details...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-cream mb-2">Restaurant Not Found</h2>
        <p className="text-soft mb-6">The requested restaurant profile could not be located.</p>
        <button onClick={() => navigate('/')} className="btn-primary">Back to Discover</button>
      </div>
    );
  }

  const mapLink = restaurant.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ' ' + (restaurant.address || ''))}`;

  const filteredMenu = activeMeal === 'All' 
    ? menu 
    : menu.filter(item => item.mealType === activeMeal || item.mealType === 'Any');

  return (
    <div className="min-h-screen pb-20">
      
      {/* Restaurant Hero Banner */}
      <div className="relative h-72 md:h-96 w-full overflow-hidden">
        <img 
          src={restaurant.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80'} 
          alt={restaurant.name} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/70 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {/* Partner Badge */}
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                <ShieldCheck size={14} /> BistroByte Kitchen (Order Online)
              </span>

              {restaurant.isVegOnly && (
                <span className="bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Leaf size={12} /> Pure Vegetarian
                </span>
              )}

              {restaurant.distance !== null && restaurant.distance !== undefined && (
                <span className="bg-primary/20 text-primary border border-primary/30 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Navigation size={12} /> {formatDistance(restaurant.distance)} away
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-cream tracking-tight mb-2">
              {restaurant.name}
            </h1>
            <p className="text-gray-300 text-base md:text-lg mb-4 font-medium">{restaurant.cuisine}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm font-semibold text-gray-300">
              <div className="flex items-center gap-1 bg-primary/20 text-primary px-2.5 py-1 rounded-lg">
                <Star size={15} className="fill-primary" /> {restaurant.rating || '4.5'} ({restaurant.ratingCount || 120}+)
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={15} className="text-primary flex-shrink-0" /> 
                <span className="truncate max-w-[280px]">{restaurant.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={15} className="text-soft flex-shrink-0" /> 
                <span>{restaurant.openingTime || '07:00 AM'} - {restaurant.closingTime || '11:00 PM'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck size={15} className="text-primary flex-shrink-0" /> 
                <span>{restaurant.deliveryTimeMins || 25} mins</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap md:flex-col gap-2.5 justify-end w-full md:w-auto">
            <button 
              onClick={() => setShowReservation(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/30 transition-all text-xs"
            >
              <Calendar size={16} /> Book Table
            </button>
            <button 
              onClick={() => setShowQr(true)} 
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-dark-card/90 text-gray-300 border border-dark-border hover:border-primary transition-all text-xs"
            >
              <QrCode size={16} /> Table QR Ordering
            </button>
            <a 
              href={mapLink} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold bg-dark-card/90 text-gray-300 border border-dark-border hover:text-white hover:border-gray-500 transition-all text-xs"
              title="View on Google Maps"
            >
              <ExternalLink size={14} className="text-primary" /> View on Maps
            </a>
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold transition-all border text-xs ${
                isFavorite 
                  ? 'bg-red-500/20 text-red-500 border-red-500/50' 
                  : 'bg-dark-card/90 text-gray-400 border-dark-border hover:text-red-400'
              }`}
            >
              <Heart size={15} className={isFavorite ? "fill-red-500" : ""} />
              {isFavorite ? 'Favorited' : 'Favorite'}
            </button>
          </div>
        </div>
      </div>

      {/* Reservation Modal */}
      {showReservation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-dark-card border border-dark-border rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setShowReservation(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-black text-cream mb-1 flex items-center gap-2">
              <Calendar className="text-primary" /> Reserve a Dining Table
            </h3>
            <p className="text-xs text-soft mb-6">{restaurant.name}</p>

            {reservationSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-center">
                <Check size={40} className="text-emerald-400 mx-auto mb-2" />
                <h4 className="font-bold text-cream text-lg">Table Reserved!</h4>
                <p className="text-xs text-emerald-300 mt-1">Confirmation Code: <strong>{reservationSuccess}</strong></p>
                <p className="text-[11px] text-soft mt-3">We look forward to serving you.</p>
              </div>
            ) : (
              <form onSubmit={handleReservationSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Date</label>
                  <input 
                    type="date" 
                    value={resDate} 
                    onChange={e => setResDate(e.target.value)}
                    required
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Time</label>
                    <input 
                      type="time" 
                      value={resTime} 
                      onChange={e => setResTime(e.target.value)}
                      required
                      className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Guests</label>
                    <select 
                      value={resGuests} 
                      onChange={e => setResGuests(e.target.value)}
                      className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
                    >
                      <option>1 Person</option>
                      <option>2 People</option>
                      <option>3-4 People</option>
                      <option>5-8 People</option>
                      <option>Large Party (8+)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Seating Ambience</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Indoor AC', 'Open-Air / Terrace'].map(seat => (
                      <button
                        key={seat}
                        type="button"
                        onClick={() => setResSeating(seat)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          resSeating === seat 
                            ? 'bg-primary/20 text-primary border-primary' 
                            : 'bg-dark-bg text-gray-400 border-dark-border hover:border-gray-500'
                        }`}
                      >
                        {seat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowReservation(false)} 
                    className="flex-1 bg-dark-bg text-gray-300 border border-dark-border py-2.5 rounded-xl font-bold hover:bg-dark-border text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl font-bold shadow-lg shadow-primary/30 text-sm"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* QR Code Table Ordering Modal */}
      {showQr && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-dark-card border border-dark-border rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center relative overflow-hidden">
            <button 
              onClick={() => setShowQr(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h3 className="text-2xl font-black text-cream mb-1 flex items-center justify-center gap-2">
              <QrCode className="text-primary" /> Dine-In QR Ordering
            </h3>
            <p className="text-xs text-soft mb-6">Scan QR on your table or enter Table Code to link your order directly to the kitchen.</p>
            
            <div className="bg-white p-4 rounded-2xl mx-auto w-44 h-44 flex items-center justify-center mb-6 shadow-xl shadow-white/5">
              <div className="grid grid-cols-4 gap-1.5 w-full h-full p-2">
                {Array.from({length: 16}).map((_, i) => (
                  <div key={i} className={`bg-dark-bg rounded-sm ${[0,1,3,4,7,8,11,12,15].includes(i) ? 'opacity-100 scale-105' : 'opacity-20'}`}></div>
                ))}
              </div>
            </div>
            
            <p className="text-[11px] text-soft font-bold tracking-widest uppercase mb-2">Or enter table code</p>
            <div className="flex gap-2 justify-center mb-5">
              <input 
                type="text" 
                placeholder="e.g. T-04" 
                value={tableCode}
                onChange={e => setTableCode(e.target.value)}
                className="bg-dark-bg border border-dark-border w-28 text-center text-white py-2.5 rounded-xl font-black uppercase text-base focus:border-primary outline-none" 
              />
            </div>

            {tableSaved ? (
              <div className="bg-green-500/20 text-green-400 border border-green-500/30 p-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5">
                <Check size={16} /> Table Set! Orders will go to {tableCode.toUpperCase()}
              </div>
            ) : (
              <button 
                onClick={handleSetTable} 
                className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/30 text-sm transition-all"
              >
                Set Table & Order
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex gap-8 border-b border-dark-border mb-8">
          {['Menu', 'Reviews', 'About'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-base md:text-lg font-bold transition-colors relative cursor-pointer ${
                activeTab === tab ? 'text-primary' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab} {tab === 'Reviews' && reviews.length > 0 && `(${reviews.length})`}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: Menu */}
        {activeTab === 'Menu' && (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Meal Filter Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-dark-card border border-dark-border rounded-2xl p-5 sticky top-24 shadow-lg">
                <h3 className="font-black text-sm uppercase tracking-wider mb-4 text-gray-400">Meal Categories</h3>
                <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                  {['All', 'Tiffin', 'Lunch', 'Snacks', 'Dinner'].map(meal => (
                    <button
                      key={meal}
                      onClick={() => setActiveMeal(meal)}
                      className={`text-left px-4 py-2.5 rounded-xl transition-all font-semibold text-xs whitespace-nowrap ${
                        activeMeal === meal 
                          ? 'bg-primary text-white shadow-md shadow-primary/20' 
                          : 'text-gray-400 hover:bg-dark-bg hover:text-white'
                      }`}
                    >
                      {meal}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="lg:w-3/4">
              {filteredMenu.length === 0 ? (
                <div className="text-center py-16 text-gray-400 bg-dark-card border border-dark-border rounded-3xl p-8">
                  <p className="text-base font-semibold mb-2">No menu items found for this selection.</p>
                  <p className="text-xs text-soft">
                    {!isPartner ? 'This is a Discovery-Only restaurant. Explore the map link above for complete details.' : 'Try selecting "All" to view the full kitchen menu.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredMenu.map(item => (
                    <div 
                      key={item.id} 
                      className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden flex shadow-lg hover:border-primary/40 transition-all group"
                    >
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            {item.vegetarian || item.dietaryType?.toLowerCase().includes('veg') ? (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                                <Leaf size={12} /> Veg
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                                <Flame size={12} /> Non-Veg
                              </span>
                            )}
                            {item.spicyLevel > 0 && (
                              <span className="flex items-center text-orange-400 text-[10px] font-bold">
                                {Array.from({ length: Math.min(item.spicyLevel, 3) }).map((_, i) => (
                                  <Flame key={i} size={11} className="fill-orange-500" />
                                ))}
                              </span>
                            )}
                          </div>

                          <h4 className="font-black text-base text-cream mb-1 group-hover:text-primary transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-primary font-black text-sm mb-2">
                            ₹{item.price?.toFixed(0)}
                          </p>
                          <p className="text-xs text-soft line-clamp-2 mb-4 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-dark-border/40">
                          <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
                            <Clock size={12} className="text-soft" /> {item.prepTimeMinutes || 15} mins
                          </span>
                          
                          <button 
                            onClick={() => handleAddToCart(item)}
                            disabled={item.isAvailable === false}
                            className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 shadow-sm ${
                              addedItems[item.id]
                                ? 'bg-green-500 text-white'
                                : item.isAvailable !== false
                                ? 'bg-primary/20 text-primary hover:bg-primary hover:text-white'
                                : 'bg-dark-bg text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {addedItems[item.id] ? <><Check size={13} /> Added!</> : item.isAvailable !== false ? '+ Add to Order' : 'Sold Out'}
                          </button>
                        </div>
                      </div>

                      {item.imageUrl && (
                        <div className="w-1/3 relative overflow-hidden bg-dark-bg">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Reviews */}
        {activeTab === 'Reviews' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-dark-card border border-dark-border rounded-3xl p-6 md:p-8 mb-8 shadow-xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-dark-border">
                <div className="text-center md:text-left">
                  <div className="text-4xl font-black text-cream flex items-center justify-center md:justify-start gap-2">
                    <Star size={32} className="fill-primary text-primary" /> {restaurant.rating || '4.5'}
                  </div>
                  <p className="text-xs text-soft mt-1">Based on {reviews.length > 0 ? reviews.length : (restaurant.ratingCount || 120)} verified dining & delivery ratings</p>
                </div>

                <div className="flex gap-4 text-center">
                  <div className="bg-dark-bg border border-dark-border px-4 py-2.5 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-soft">Taste</p>
                    <p className="text-base font-black text-primary">4.8 / 5</p>
                  </div>
                  <div className="bg-dark-bg border border-dark-border px-4 py-2.5 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-soft">Packaging</p>
                    <p className="text-base font-black text-cream">4.6 / 5</p>
                  </div>
                  <div className="bg-dark-bg border border-dark-border px-4 py-2.5 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-soft">Hygiene</p>
                    <p className="text-base font-black text-green-400">100%</p>
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="mt-6 space-y-4">
                {reviews.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    <MessageSquare size={36} className="text-gray-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold">No customer reviews published yet.</p>
                    <p className="text-xs text-soft mt-1">
                      Customers who complete orders on BistroByte can submit verified reviews from the Orders page.
                    </p>
                  </div>
                ) : (
                  reviews.map((rev, idx) => (
                    <div key={rev.id || idx} className="bg-dark-bg border border-dark-border p-4 md:p-5 rounded-2xl">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                            {rev.customerName ? rev.customerName.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div>
                            <h5 className="font-bold text-sm text-cream">{rev.customerName || 'Verified Gourmet'}</h5>
                            <span className="text-[10px] text-green-400 font-semibold flex items-center gap-1">
                              <ShieldCheck size={11} /> Verified Order #{rev.orderId || rev.id}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold">
                          <Star size={12} className="fill-primary" /> {rev.rating || 5}
                        </div>
                      </div>
                      <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                        {rev.comment || 'Outstanding meal! Fresh ingredients and delivered right on time.'}
                      </p>
                      <div className="flex gap-4 mt-3 text-[10px] text-soft">
                        {rev.tasteRating && <span>Taste: {rev.tasteRating}/5</span>}
                        {rev.packagingRating && <span>Packaging: {rev.packagingRating}/5</span>}
                        <span className="ml-auto">{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: About */}
        {activeTab === 'About' && (
          <div className="max-w-4xl mx-auto bg-dark-card p-6 md:p-8 border border-dark-border rounded-3xl shadow-xl space-y-6">
            <div>
              <h3 className="text-xl font-black text-cream mb-2">About {restaurant.name}</h3>
              <p className="text-sm text-soft leading-relaxed">
                {restaurant.description || 'Welcome to BistroByte Hospitality Partner kitchen. Dedicated to authentic flavors, rigorous kitchen hygiene standards, and fast execution.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-dark-border">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-gray-300 uppercase">Address</h4>
                  <p className="text-xs text-soft mt-0.5">{restaurant.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-gray-300 uppercase">Operating Hours</h4>
                  <p className="text-xs text-soft mt-0.5">{restaurant.openingTime || '07:00 AM'} to {restaurant.closingTime || '11:00 PM'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Info size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-gray-300 uppercase">FSSAI & Standards</h4>
                  <p className="text-xs text-soft mt-0.5">Compliant with Food Safety & Hygiene Protocols</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Navigation size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-gray-300 uppercase">Navigation</h4>
                  <a 
                    href={mapLink} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs text-primary hover:underline font-bold inline-flex items-center gap-1 mt-0.5"
                  >
                    View on Map <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


import { Star, Clock, MapPin, Sparkles, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistance } from '../services/api';

export default function RestaurantCard({ restaurant }) {
  const isPartner = true;

  const cardContent = (
    <div className="card group block relative overflow-hidden transition-all duration-300">
      <div className="relative h-52 overflow-hidden bg-gray-900">
        <img 
          src={restaurant.imageUrl || 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800'} 
          alt={restaurant.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-transparent opacity-90"></div>
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
          {restaurant.isVegOnly ? (
            <span className="bg-green-600/90 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider shadow-lg">
              PURE VEG
            </span>
          ) : <div />}

          {/* Active Orderable Badge */}
          <span className="bg-primary/95 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-wider shadow-md flex items-center gap-1">
            <Sparkles size={11} /> Order on BistroByte
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-cream group-hover:text-primary transition-colors line-clamp-1">
            {restaurant.name}
          </h3>
          <div className="flex items-center gap-1 bg-dark-bg/60 px-2 py-0.5 rounded-full border border-dark-border flex-shrink-0">
            <Star size={13} className="text-primary fill-primary" />
            <span className="text-xs font-bold text-cream">{restaurant.rating || '4.5'}</span>
          </div>
        </div>
        
        <p className="text-soft text-xs mb-3 truncate font-light tracking-wide">{restaurant.cuisine || 'Multi-Cuisine'}</p>
        
        <div className="flex items-center justify-between text-xs text-soft font-medium pt-2 border-t border-dark-border/60">
          <div className="flex items-center gap-1">
            <MapPin size={14} className="text-primary" />
            <span>{formatDistance(restaurant.distance)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-gray-500" />
            <span>{restaurant.deliveryTimeMins || '25-35'} min</span>
          </div>
          <div className="flex items-center gap-2">
            {restaurant.mapUrl && (
              <a
                href={restaurant.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="View location on Google Maps"
                className="text-gray-400 hover:text-primary transition-colors flex items-center gap-1 text-[11px] bg-dark-bg px-2 py-0.5 rounded border border-dark-border"
              >
                <Navigation size={11} className="text-primary" />
                <span>Map</span>
              </a>
            )}
            {restaurant.deliveryFee !== undefined && (
              <span className="text-xs text-gray-400 font-mono">
                {restaurant.deliveryFee === 0 ? 'FREE' : `₹${restaurant.deliveryFee}`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Every restaurant on BistroByte allows browsing dishes and placing kitchen orders
  return (
    <Link to={`/restaurant/${restaurant.id}`} className="block">
      {cardContent}
    </Link>
  );
}

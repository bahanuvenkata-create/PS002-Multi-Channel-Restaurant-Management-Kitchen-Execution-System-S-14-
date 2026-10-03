import { useState, useEffect } from 'react';

export default function MealTimeBanner({ onMealTypeChange }) {
  const [mealTime, setMealTime] = useState({
    title: 'Loading...',
    subtitle: '',
    icon: '🍱',
    color: 'from-primary to-orange-600',
    type: 'Any'
  });

  useEffect(() => {
    const hour = new Date().getHours();
    
    let currentType = 'Any';
    if (hour >= 5 && hour < 11) {
      currentType = 'Tiffin';
      setMealTime({
        title: 'Tiffin Time is Live',
        subtitle: 'Start your morning with fresh & hot tiffins.',
        icon: '🌅',
        color: 'from-amber-400 to-orange-500',
        type: currentType
      });
    } else if (hour >= 11 && hour < 16) {
      currentType = 'Lunch';
      setMealTime({
        title: 'Lunch Time is Live',
        subtitle: 'Explore our hand-picked selection of lunch specials.',
        icon: '🍛',
        color: 'from-primary to-orange-600',
        type: currentType
      });
    } else if (hour >= 16 && hour < 19) {
      currentType = 'Snacks';
      setMealTime({
        title: 'Snack Time is Live',
        subtitle: 'Perfect bites for your evening cravings.',
        icon: '☕',
        color: 'from-orange-500 to-red-500',
        type: currentType
      });
    } else if (hour >= 19 && hour < 23) {
      currentType = 'Dinner';
      setMealTime({
        title: 'Dinner Time is Live',
        subtitle: 'Unwind with our premium dinner collection.',
        icon: '🌙',
        color: 'from-indigo-500 to-purple-600',
        type: currentType
      });
    } else {
      currentType = 'Late Night';
      setMealTime({
        title: 'Late Night Cravings',
        subtitle: 'Midnight hunger? We got you covered.',
        icon: '🌃',
        color: 'from-slate-700 to-slate-900',
        type: currentType
      });
    }
    
    if (onMealTypeChange) {
      onMealTypeChange(currentType);
    }
  }, []);

  return (
    <div className={`w-full max-w-7xl mx-auto mt-8 mb-4 px-6`}>
      <div className={`bg-gradient-to-r ${mealTime.color} p-6 md:p-8 rounded-2xl flex items-center justify-between shadow-2xl text-white transform transition-transform hover:scale-[1.01]`}>
        <div>
          <h2 className="text-3xl md:text-4xl font-black mb-2 tracking-tighter flex items-center gap-3">
            {mealTime.icon} {mealTime.title}
          </h2>
          <p className="text-white/90 text-lg font-medium tracking-wide">{mealTime.subtitle}</p>
        </div>
        <div className="text-6xl hidden md:block opacity-90 drop-shadow-lg">
          {mealTime.icon}
        </div>
      </div>
    </div>
  );
}

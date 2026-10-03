import { useState } from 'react';
import { Calendar, Plus, ChevronRight, Clock, Trash2 } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function MealPlanner() {
  const [activeDay, setActiveDay] = useState('Monday');

  // Mock data for the meal plan
  const [mealPlan, setMealPlan] = useState({
    Monday: {
      Breakfast: { name: 'Idli Sambar', restaurant: 'A2B', time: '08:00 AM', status: 'Scheduled' },
      Lunch: { name: 'South Indian Meals', restaurant: 'Andhra Spice', time: '01:00 PM', status: 'Scheduled' },
      Dinner: null,
    },
    Tuesday: {
      Breakfast: { name: 'Poha & Jalebi', restaurant: 'Bikanerwala', time: '08:30 AM', status: 'Scheduled' },
      Lunch: null,
      Dinner: { name: 'Butter Chicken & Naan', restaurant: 'Punjabi Dhaba', time: '08:00 PM', status: 'Scheduled' },
    },
    Wednesday: { Breakfast: null, Lunch: null, Dinner: null },
    Thursday: { Breakfast: null, Lunch: null, Dinner: null },
    Friday: { Breakfast: null, Lunch: null, Dinner: null },
    Saturday: { Breakfast: null, Lunch: null, Dinner: null },
    Sunday: { Breakfast: null, Lunch: null, Dinner: null },
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-cream tracking-tight mb-4 flex items-center gap-4">
            <Calendar className="text-primary" size={40} />
            7-Day Meal Planner
          </h1>
          <p className="text-soft text-lg max-w-2xl">
            Automate your week with our premium Tiffin subscriptions. Set it once, and let BistroByte deliver your favorite meals on autopilot.
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Subscribe to New Plan
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Days Sidebar */}
        <div className="lg:w-1/4 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-shrink-0 text-left px-6 py-4 rounded-xl font-semibold text-lg transition-all flex justify-between items-center ${
                activeDay === day 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105 lg:scale-100 lg:translate-x-2' 
                  : 'bg-dark-card text-gray-400 hover:bg-dark-border border border-transparent hover:border-gray-600'
              }`}
            >
              {day}
              {activeDay === day && <ChevronRight size={20} className="hidden lg:block" />}
            </button>
          ))}
        </div>

        {/* Plan Details */}
        <div className="lg:w-3/4 bg-dark-card border border-dark-border rounded-3xl p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-cream mb-8 border-b border-dark-border pb-4">
            {activeDay}'s Schedule
          </h2>

          <div className="space-y-6">
            {['Breakfast', 'Lunch', 'Dinner'].map(mealType => {
              const meal = mealPlan[activeDay][mealType];
              
              return (
                <div key={mealType} className="bg-dark-bg border border-dark-border rounded-2xl p-6 transition-all hover:border-primary/50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                      {mealType === 'Breakfast' ? '🌅' : mealType === 'Lunch' ? '🍛' : '🌙'} {mealType}
                    </h3>
                    {meal && (
                      <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">
                        {meal.status}
                      </span>
                    )}
                  </div>
                  
                  {meal ? (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold text-cream mb-1">{meal.name}</p>
                        <p className="text-soft text-sm">From <span className="text-gray-300 font-semibold">{meal.restaurant}</span></p>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2 text-gray-400 bg-dark-card px-3 py-1.5 rounded-lg border border-dark-border text-sm">
                          <Clock size={16} />
                          {meal.time}
                        </div>
                        <button className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-400/10">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center border-2 border-dashed border-dark-border rounded-xl bg-dark-card/50">
                      <p className="text-soft mb-3">No meal scheduled</p>
                      <button className="text-primary hover:text-primary-hover font-semibold text-sm flex items-center gap-1 transition-colors">
                        <Plus size={16} /> Add to {mealType}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

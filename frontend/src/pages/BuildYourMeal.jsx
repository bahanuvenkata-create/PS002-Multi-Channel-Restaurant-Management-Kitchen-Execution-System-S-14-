import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Check, Utensils } from 'lucide-react';
import { useCart } from '../context/CartContext';

const MEAL_STEPS = [
  {
    id: 'base',
    title: 'Choose Base',
    options: [
      { name: 'Steamed Rice', price: 2.0, veg: true },
      { name: 'Jeera Rice', price: 3.5, veg: true },
      { name: 'Pulihora (Tamarind Rice)', price: 3.0, veg: true },
      { name: 'Butter Naan', price: 1.5, veg: true },
      { name: 'Tandoori Roti', price: 1.0, veg: true },
    ]
  },
  {
    id: 'main',
    title: 'Choose Main Dish',
    options: [
      { name: 'Dal Makhani', price: 6.0, veg: true },
      { name: 'Paneer Butter Masala', price: 8.5, veg: true },
      { name: 'Andhra Chicken Curry', price: 9.5, veg: false },
      { name: 'Mixed Vegetable Curry', price: 7.0, veg: true },
      { name: 'Kerala Fish Curry', price: 11.0, veg: false },
    ]
  },
  {
    id: 'side',
    title: 'Choose Side',
    options: [
      { name: 'Gobi 65 (Cauliflower Fry)', price: 4.5, veg: true },
      { name: 'Chicken 65', price: 6.5, veg: false },
      { name: 'Masala Papad', price: 1.5, veg: true },
      { name: 'Onion Salad', price: 1.0, veg: true },
      { name: 'Spicy Mango Pickle', price: 0.5, veg: true },
    ]
  },
  {
    id: 'dessert',
    title: 'Choose Dessert',
    options: [
      { name: 'Gulab Jamun', price: 3.0, veg: true },
      { name: 'Semiya Payasam', price: 3.5, veg: true },
      { name: 'Vanilla Ice Cream', price: 2.5, veg: true },
      { name: 'No Dessert', price: 0, veg: true },
    ]
  }
];

export default function BuildYourMeal() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({
    base: null,
    main: null,
    side: null,
    dessert: null
  });

  const handleSelect = (option) => {
    const stepId = MEAL_STEPS[currentStep].id;
    setSelections(prev => ({ ...prev, [stepId]: option }));
  };

  const handleNext = () => {
    if (currentStep < MEAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const calculateTotal = () => {
    return Object.values(selections).reduce((total, item) => total + (item?.price || 0), 0);
  };

  const handleAddMealToCart = () => {
    const mealName = Object.values(selections).map(s => s.name).join(' + ');
    const mealPrice = calculateTotal();
    const mealItem = {
      id: `custom-meal-${Date.now()}`,
      name: `Custom Meal: ${mealName}`,
      price: mealPrice,
      veg: Object.values(selections).every(s => s?.veg),
      customizations: Object.fromEntries(
        MEAL_STEPS.map(step => [step.title, selections[step.id]?.name])
      ),
    };
    addToCart(mealItem, 'bistrobyte-meals', 'BistroByte Custom Meals', 1);
    navigate('/cart');
  };

  const canProceed = selections[MEAL_STEPS[currentStep].id] !== null;

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-4">
          <Utensils className="text-primary" size={40} />
          Build Your Custom Meal
        </h1>
        <p className="text-gray-400 text-lg">Mix and match to create your perfect platter.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Wizard Progress Sidebar */}
        <div className="lg:w-1/3">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 sticky top-24">
            <h3 className="font-bold text-xl mb-6 text-white border-b border-dark-border pb-4">Your Plate</h3>
            <div className="flex flex-col gap-6 relative">
              {MEAL_STEPS.map((step, index) => {
                const isCompleted = selections[step.id] !== null;
                const isActive = currentStep === index;
                
                return (
                  <div key={step.id} className="flex gap-4 relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300
                      ${isCompleted ? 'bg-primary text-white' : isActive ? 'bg-primary/20 text-primary ring-2 ring-primary' : 'bg-dark-bg text-gray-500'}`}
                    >
                      {isCompleted && !isActive ? <Check size={16} /> : (index + 1)}
                    </div>
                    <div>
                      <p className={`font-semibold ${isActive ? 'text-white' : 'text-gray-400'}`}>{step.title}</p>
                      {selections[step.id] && (
                        <p className="text-sm text-primary mt-1">{selections[step.id].name} (+${selections[step.id].price.toFixed(2)})</p>
                      )}
                    </div>
                  </div>
                );
              })}
              {/* Connecting Line */}
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-dark-border -z-10"></div>
            </div>

            <div className="mt-8 pt-6 border-t border-dark-border">
              <div className="flex justify-between items-end mb-4">
                <span className="text-gray-400 font-medium">Live Total:</span>
                <span className="text-3xl font-extrabold text-white">${calculateTotal().toFixed(2)}</span>
              </div>
                <button 
                onClick={handleAddMealToCart}
                  disabled={Object.values(selections).some(s => s === null)}
                  className={`w-full py-3 rounded-full font-bold text-lg transition-all shadow-lg
                    ${Object.values(selections).every(s => s !== null) ? 'bg-primary text-white shadow-primary/30 hover:scale-105' : 'bg-dark-border text-gray-500 cursor-not-allowed'}`}
                >
                  Add Meal to Cart
                </button>
            </div>
          </div>
        </div>

        {/* Selection Area */}
        <div className="lg:w-2/3">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8 min-h-[400px] flex flex-col justify-between shadow-xl">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-white border-b border-dark-border pb-4">
                {MEAL_STEPS[currentStep].title}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MEAL_STEPS[currentStep].options.map(option => {
                  const isSelected = selections[MEAL_STEPS[currentStep].id]?.name === option.name;
                  return (
                    <button
                      key={option.name}
                      onClick={() => handleSelect(option)}
                      className={`flex flex-col text-left p-4 rounded-xl border-2 transition-all duration-200 group
                        ${isSelected ? 'border-primary bg-primary/10' : 'border-dark-border bg-dark-bg hover:border-gray-500'}`}
                    >
                      <div className="flex justify-between items-start w-full mb-2">
                        <span className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                          {option.name}
                        </span>
                        <div className={`w-3 h-3 rounded-full mt-1.5 ${option.veg ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      </div>
                      <span className="text-primary font-bold">+${option.price.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between mt-12 pt-6 border-t border-dark-border">
              <button 
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`px-6 py-2 rounded-full font-semibold transition-colors
                  ${currentStep === 0 ? 'opacity-0 cursor-default' : 'bg-dark-bg text-gray-300 hover:text-white border border-dark-border'}`}
              >
                Back
              </button>
              
              {currentStep < MEAL_STEPS.length - 1 && (
                <button 
                  onClick={handleNext}
                  disabled={!canProceed}
                  className={`flex items-center gap-2 px-8 py-2 rounded-full font-bold transition-all shadow-lg
                    ${canProceed ? 'bg-primary text-white shadow-primary/30 hover:bg-primary-hover hover:scale-105' : 'bg-dark-bg text-gray-600 border border-dark-border cursor-not-allowed'}`}
                >
                  Next <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RestaurantDetails from './pages/RestaurantDetails';
import BuildYourMeal from './pages/BuildYourMeal';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MealPlanner from './pages/MealPlanner';
import KitchenDashboard from './pages/KitchenDashboard';
import Login from './pages/Login';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import TiffinPlans from './pages/TiffinPlans';
import StaffPortal from './pages/StaffPortal';
import BistroBot from './components/BistroBot';

function App() {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-dark-bg text-cream selection:bg-primary selection:text-white">
        <Navbar 
          isAdvancedMode={isAdvancedMode} 
          setIsAdvancedMode={setIsAdvancedMode}
          currentLang={currentLang}
          setCurrentLang={setCurrentLang}
        />

        {/* Advanced Mode Banner */}
        {isAdvancedMode && (
          <div className="bg-gradient-to-r from-amber-950/80 via-dark-card to-amber-950/80 border-b border-amber-500/30 px-6 py-2.5 flex flex-wrap justify-between items-center text-xs shadow-md">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>⚡ Advanced Operations & Kitchen Execution Mode Active</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <Link to="/kitchen" className="text-amber-400 hover:text-amber-300 transition-colors">
                🍳 Kitchen KDS
              </Link>
              <Link to="/staff-portal" className="text-amber-400 hover:text-amber-300 transition-colors">
                👥 Staff & Deliveries
              </Link>
              <Link to="/admin" className="text-amber-400 hover:text-amber-300 transition-colors">
                📊 Admin Console
              </Link>
              <button 
                onClick={() => setIsAdvancedMode(false)} 
                className="text-gray-400 hover:text-cream ml-2 underline cursor-pointer"
              >
                Exit Operator Mode
              </button>
            </div>
          </div>
        )}

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home currentLang={currentLang} />} />
            <Route path="/restaurant/:id" element={<RestaurantDetails currentLang={currentLang} />} />
            <Route path="/build-meal" element={<BuildYourMeal currentLang={currentLang} />} />
            <Route path="/cart" element={<Cart currentLang={currentLang} />} />
            <Route path="/checkout" element={<Checkout currentLang={currentLang} />} />
            <Route path="/meal-planner" element={<MealPlanner currentLang={currentLang} />} />
            <Route path="/orders" element={<Orders currentLang={currentLang} />} />
            <Route path="/profile" element={<Profile currentLang={currentLang} />} />
            <Route path="/tiffin" element={<TiffinPlans currentLang={currentLang} />} />
            <Route path="/staff-portal" element={<StaffPortal currentLang={currentLang} />} />
            <Route path="/kitchen" element={<KitchenDashboard />} />
            <Route path="/login" element={<Login setIsAdvancedMode={setIsAdvancedMode} />} />
            <Route path="/admin" element={<AdminDashboard />} />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Multilingual AI BistroBot */}
        <BistroBot currentLang={currentLang} setCurrentLang={setCurrentLang} />
      </div>
    </Router>
  );
}

export default App;


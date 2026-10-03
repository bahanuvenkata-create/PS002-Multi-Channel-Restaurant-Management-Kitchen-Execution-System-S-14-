import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, User, ChevronDown, Sparkles, Mic, MicOff, Globe, ShoppingCart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { SUPPORTED_LANGUAGES } from '../services/i18n';

export default function BistroBot({ isAdvancedMode = false }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [messages, setMessages] = useState([
    { 
      type: 'bot', 
      text: 'Hello! I am BistroBot, your AI food assistant 🍽️ Ask me for nearby restaurants, spicy dishes, or breakfast tiffins!' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Voice Search using Web Speech API
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = currentLang === 'te' ? 'te-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };

    recognition.start();
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const q = input.trim();
    setInput('');
    sendMessage(q);
  };

  const sendMessage = async (userQuery) => {
    setMessages(prev => [...prev, { type: 'user', text: userQuery }]);
    setLoading(true);

    try {
      // Gather customer taste settings from localStorage if available
      const stored = localStorage.getItem('user');
      const u = stored ? JSON.parse(stored) : {};

      const response = await api.post('/chatbot/query', {
        query: userQuery,
        language: currentLang,
        spiceLevel: u.spiceLevel || 'Medium',
        foodPreference: u.foodPreference || 'Any',
        tastePreference: u.budget || 'Medium'
      });

      const { type, message, items, restaurants, action, item: actionItem } = response.data;

      // Handle automatic bot actions
      if (action === 'ADD_TO_CART' && actionItem) {
        addToCart({
          id: actionItem.id,
          name: actionItem.name,
          price: actionItem.price,
          veg: actionItem.dietaryType === 'Veg',
          image: actionItem.imageUrl
        }, actionItem.restaurantId || 1, 'BistroByte Kitchen', 1);
      } else if (action === 'NAVIGATE_ORDERS') {
        setTimeout(() => navigate('/orders'), 1200);
      }

      setMessages(prev => [...prev, {
        type: 'bot',
        text: message,
        isFoodCards: type === 'food_cards' || Boolean(items),
        items: items || [],
        isRestaurants: type === 'restaurants' || Boolean(restaurants),
        restaurants: restaurants || []
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'I could not connect to BistroByte kitchen service right now. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCardToCart = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      veg: item.dietaryType === 'Veg',
      image: item.imageUrl
    }, item.restaurantId || 1, 'BistroByte Kitchen', 1);
  };

  return (
    <>
      {/* Floating Bot Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-primary to-orange-600 text-white shadow-2xl hover:scale-110 transition-all z-50 flex items-center justify-center ${isOpen ? 'hidden' : 'block'}`}
      >
        <Sparkles className="absolute top-1 right-1 text-yellow-300 w-4 h-4 animate-pulse" />
        <Bot size={28} />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 w-84 md:w-96 bg-dark-card border border-dark-border rounded-3xl shadow-2xl z-50 flex flex-col transition-all duration-300 transform origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
        style={{ height: '560px', maxHeight: '82vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-border bg-gradient-to-r from-dark-bg to-dark-card rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 text-primary rounded-xl relative">
              <Sparkles className="absolute -top-1 -right-1 text-yellow-300 w-3 h-3 animate-pulse" />
              <Bot size={24} />
            </div>
            <div>
              <h3 className="font-bold text-cream text-base flex items-center gap-2">
                BistroBot <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              </h3>
              <p className="text-[11px] text-soft">AI Food & Dining Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector in Bot */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="p-1.5 rounded-lg bg-dark-bg text-gray-300 hover:text-white border border-dark-border text-xs flex items-center gap-1"
                title="Change Bot Language"
              >
                <Globe size={14} className="text-primary" />
                <span className="uppercase text-[10px] font-bold">{currentLang}</span>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-dark-card border border-dark-border rounded-xl shadow-2xl py-1 z-50">
                  {SUPPORTED_LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setCurrentLang(l.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs ${
                        currentLang === l.code ? 'text-primary font-bold' : 'text-gray-300 hover:bg-dark-border'
                      }`}
                    >
                      {l.native}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-gray-400 hover:text-white bg-dark-bg rounded-lg border border-dark-border transition-colors"
            >
              <ChevronDown size={18} />
            </button>
          </div>
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-3 py-2 bg-dark-bg/60 border-b border-dark-border flex gap-1.5 overflow-x-auto text-[11px] scrollbar-hide">
          <button onClick={() => sendMessage('Find biryani near me')} className="whitespace-nowrap px-2.5 py-1 bg-dark-card hover:bg-dark-border border border-dark-border rounded-lg text-gray-300">
            🍛 Biryani near me
          </button>
          <button onClick={() => sendMessage('Show vegetarian tiffin')} className="whitespace-nowrap px-2.5 py-1 bg-dark-card hover:bg-dark-border border border-dark-border rounded-lg text-gray-300">
            🌅 Veg Tiffins
          </button>
          <button onClick={() => sendMessage('Track my order')} className="whitespace-nowrap px-2.5 py-1 bg-dark-card hover:bg-dark-border border border-dark-border rounded-lg text-gray-300">
            📦 Track Order
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark-bg">
          {messages.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] p-3.5 rounded-2xl ${
                msg.type === 'user' 
                  ? 'bg-primary text-white rounded-tr-none shadow-md' 
                  : 'bg-dark-card border border-dark-border text-gray-200 rounded-tl-none shadow-md'
              }`}>
                <p className="text-xs md:text-sm font-medium leading-relaxed">{msg.text}</p>
              </div>

              {/* Render Dish Cards returned by BistroBot */}
              {msg.isFoodCards && msg.items && msg.items.length > 0 && (
                <div className="mt-3 flex gap-3 overflow-x-auto w-full pb-2 scrollbar-hide snap-x">
                  {msg.items.map(item => (
                    <div key={item.id} className="min-w-[150px] max-w-[150px] bg-dark-card border border-dark-border rounded-2xl overflow-hidden snap-center flex flex-col justify-between">
                      <div className="h-20 bg-gray-800 relative">
                        <img 
                          src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                        />
                        {item.dietaryType === 'Veg' && (
                          <span className="absolute top-1.5 left-1.5 bg-green-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded">VEG</span>
                        )}
                      </div>
                      <div className="p-2.5 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-bold text-cream line-clamp-1">{item.name}</p>
                          <p className="text-primary font-black text-xs mt-0.5">₹{item.price}</p>
                        </div>
                        <button 
                          onClick={() => handleAddCardToCart(item)}
                          className="w-full mt-2 bg-primary/20 hover:bg-primary border border-primary/40 text-white text-[10px] py-1.5 rounded-lg transition-colors font-bold flex items-center justify-center gap-1"
                        >
                          <ShoppingCart size={11} /> Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Render Discovered Restaurants */}
              {msg.isRestaurants && msg.restaurants && msg.restaurants.length > 0 && (
                <div className="mt-3 space-y-2 w-full">
                  {msg.restaurants.map(rest => (
                    <div key={rest.id || rest.name} className="bg-dark-card border border-dark-border p-2.5 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-cream">{rest.name}</p>
                        <p className="text-[10px] text-soft">{rest.cuisine}</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          navigate(`/restaurant/${rest.id || 1}`);
                        }}
                        className="p-1.5 bg-primary/20 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors text-xs font-bold"
                      >
                        View Menu
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-1 items-center p-3 bg-dark-card border border-dark-border rounded-2xl rounded-tl-none w-16 justify-center">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-200"></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-dark-border bg-dark-card rounded-b-3xl flex items-center gap-2">
          {/* Optional Voice Search Mic */}
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-2.5 rounded-xl border transition-colors ${
              isListening 
                ? 'bg-red-500 text-white border-red-400 animate-pulse' 
                : 'bg-dark-bg text-gray-400 hover:text-primary border-dark-border'
            }`}
            title="Voice Search (Speak your craving)"
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? 'Listening...' : currentLang === 'te' ? 'బిర్యానీ లేదా టిఫిన్ అడగండి...' : 'Ask for spicy Andhra lunch...'}
            className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2 text-xs md:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />

          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-md flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </>
  );
}

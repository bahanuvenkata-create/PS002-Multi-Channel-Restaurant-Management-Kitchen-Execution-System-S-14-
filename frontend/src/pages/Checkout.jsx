import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  MapPin, CreditCard, Wallet, Smartphone, CheckCircle,
  ChevronRight, Loader2, Lock, ArrowLeft, Sparkles, ShieldCheck,
  Plus, Check, Home as HomeIcon, Building2, Phone, User as UserIcon,
  Navigation, AlertCircle, Clock
} from 'lucide-react';
import api from '../services/api';
import {
  getActiveLocation,
  setActiveLocation,
  getSavedDeliveryAddresses,
  saveCustomDeliveryAddress,
  formatLocationLabel
} from '../utils/locationService';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI / QR Pay (Instant)', icon: Smartphone, color: 'text-green-400' },
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, color: 'text-blue-400' },
  { id: 'wallet', label: 'BistroByte Wallet', icon: Wallet, color: 'text-primary' },
  { id: 'cod', label: 'Cash on Delivery', icon: MapPin, color: 'text-amber-400' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, clearCart } = useCart();

  const { total = 0, subtotal = 0, discount = 0, deliveryFee = 2.99, taxes = 0 } = location.state || {};

  const [step, setStep] = useState(1); // 1=Address, 2=Payment, 3=Review & Confirm, 4=Success
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Payment fields
  const [upiId, setUpiId] = useState('sainikhil@okaxis');
  const [cardNum, setCardNum] = useState('4532 •••• •••• 8892');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Custom address entry state
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customLabel, setCustomLabel] = useState('Campus / Hostel');
  const [customRoom, setCustomRoom] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customRecipient, setCustomRecipient] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [saveToAccount, setSaveToAccount] = useState(true);

  // Current logged in user info
  const [currentUser, setCurrentUser] = useState(null);

  // Load addresses on mount and configure initial selection
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        setCurrentUser(u);
        setCustomRecipient(u.name || 'Sai Nikhil');
        setCustomPhone(u.phone || '+91-9848012345');
      }
    } catch (e) {}

    const savedAddrs = getSavedDeliveryAddresses();
    const activeLoc = getActiveLocation();

    // Check if active GPS or custom location is present
    let combined = [...savedAddrs];
    if (activeLoc && activeLoc.displayName) {
      const alreadyHas = combined.some(a => a.address.toLowerCase() === activeLoc.displayName.toLowerCase());
      if (!alreadyHas) {
        combined.unshift({
          id: 'addr-active-gps',
          label: activeLoc.city || 'Active Location',
          address: activeLoc.displayName,
          room: 'Current Location Pin',
          phone: '',
          isGps: true
        });
      }
    }

    setAddresses(combined);
    if (combined.length > 0) {
      setSelectedAddressId(combined[0].id);
    }
  }, []);

  const handleAddNewAddressSubmit = (e) => {
    e.preventDefault();
    if (!customAddress.trim()) {
      setErrorMsg('Please enter a street or campus delivery address.');
      return;
    }

    const newAddrObj = {
      id: `custom-${Date.now()}`,
      label: customLabel,
      room: customRoom.trim(),
      address: customAddress.trim(),
      phone: customPhone.trim(),
      instructions: customInstructions.trim(),
      recipient: customRecipient.trim()
    };

    saveCustomDeliveryAddress(newAddrObj);

    // If saveToAccount requested and user is logged in, optionally sync to backend profile
    if (saveToAccount && currentUser?.email) {
      try {
        api.get(`/auth/profile?email=${currentUser.email}`).then(res => {
          if (res.data) {
            let currentList = [];
            try {
              currentList = JSON.parse(res.data.addresses || '[]');
            } catch (err) {}
            currentList.push({
              id: Date.now(),
              label: newAddrObj.label,
              address: `${newAddrObj.room ? newAddrObj.room + ', ' : ''}${newAddrObj.address}`
            });
            api.put('/auth/profile', { ...res.data, addresses: JSON.stringify(currentList) }).catch(console.warn);
          }
        }).catch(console.warn);
      } catch (err) {}
    }

    const updated = [newAddrObj, ...addresses];
    setAddresses(updated);
    setSelectedAddressId(newAddrObj.id);
    setShowAddCustom(false);
    setErrorMsg('');
  };

  // Currently selected address object
  const selectedAddressObj = addresses.find(a => a.id === selectedAddressId) || addresses[0];

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : { name: 'Sai Nikhil', email: 'sainikhil@bistrobyte.com' };

      const chosenAddr = selectedAddressObj || {
        label: 'Campus / Hostel',
        address: 'KL University Main Campus Gate 2, Vaddeswaram, Guntur 522502',
        room: '',
        instructions: ''
      };

      const fullAddressStr = [
        chosenAddr.room,
        chosenAddr.address,
        chosenAddr.instructions ? `(Note: ${chosenAddr.instructions})` : null
      ].filter(Boolean).join(', ');

      const recipientPhone = customPhone || chosenAddr.phone || user.phone || '+91-9848012345';
      const recipientName = customRecipient || user.name || 'Sai Nikhil';

      // 1. Create Order in Backend
      const orderPayload = {
        channel: 'APP',
        customerName: recipientName,
        customerEmail: user.email || 'customer@bistrobyte.com',
        deliveryAddress: fullAddressStr,
        customerPhone: recipientPhone,
        restaurantId: cart.restaurantId || 1,
        restaurantName: cart.restaurantName || 'BistroByte Kitchen',
        status: 'PLACED',
        deliveryFee: deliveryFee,
        discountAmount: discount,
        mealType: 'Lunch',
        items: cart.items.map(item => ({
          menuItemId: item.id && typeof item.id === 'number' ? item.id : 1,
          itemName: item.name,
          category: 'Mains',
          price: item.price,
          quantity: item.quantity
        }))
      };

      const placedOrderRes = await api.post('/orders', orderPayload);
      const placedOrder = placedOrderRes.data;

      if (!placedOrder || !placedOrder.id) {
        throw new Error('Failed to create order in backend');
      }

      // 2. Real Backend Payment State Execution
      const paymentPayload = {
        orderId: placedOrder.id,
        amount: placedOrder.totalAmount,
        method: selectedPayment.toUpperCase(),
        upiVpa: selectedPayment === 'upi' ? upiId : null,
        cardLast4: selectedPayment === 'card' ? '8892' : null
      };

      const paymentRes = await api.post('/payments/process', paymentPayload);
      if (paymentRes.data && paymentRes.data.status === 'SUCCESS') {
        // Keep active location ON permanently
        setActiveLocation({
          displayName: chosenAddr.address,
          city: chosenAddr.label || 'Delivery Location',
          isManual: true,
          source: 'order_placement'
        });

        setConfirmedOrder({
          orderId: placedOrder.id,
          orderNumber: placedOrder.orderNumber,
          invoiceNumber: paymentRes.data.invoiceNumber || 'INV-BB-' + placedOrder.orderNumber,
          transactionRef: paymentRes.data.transactionRef,
          totalAmount: placedOrder.totalAmount,
          restaurantName: cart.restaurantName || 'BistroByte Kitchen',
          deliveryAddress: fullAddressStr,
          customerName: recipientName,
          customerPhone: recipientPhone,
          paymentMethod: selectedPayment.toUpperCase()
        });

        clearCart();
        setStep(4);
      } else {
        throw new Error('Payment processing was rejected by payment provider');
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      setErrorMsg(error.response?.data?.message || error.message || 'Payment execution failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  // SUCCESS STATE (Step 4)
  if (step === 4 && confirmedOrder) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 md:p-8">
        <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-6 animate-bounce shadow-2xl shadow-green-500/20">
          <CheckCircle size={52} className="text-green-500" />
        </div>
        
        <div className="inline-block px-4 py-1.5 rounded-full bg-green-500/20 text-green-400 text-xs font-black uppercase tracking-widest mb-3 border border-green-500/30">
          Verified Payment & Order Confirmed
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-cream mb-2">Order Confirmed! 🎉</h2>
        <p className="text-gray-300 max-w-md mb-2 text-sm">
          Your order <strong className="text-primary font-mono text-base">#{confirmedOrder.orderNumber}</strong> from <span className="text-white font-bold">{confirmedOrder.restaurantName}</span> has been paid and sent to the kitchen.
        </p>

        {/* Delivery Destination Badge */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-4 my-4 text-xs text-soft max-w-md w-full text-left space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-[11px]">
            <MapPin size={14} /> Delivering To Destination
          </div>
          <p className="text-cream font-medium text-sm">{confirmedOrder.deliveryAddress}</p>
          <div className="flex justify-between text-gray-400 text-[11px] pt-1 border-t border-dark-border">
            <span>Recipient: <strong className="text-gray-200">{confirmedOrder.customerName}</strong></span>
            <span>Contact: <strong className="text-gray-200">{confirmedOrder.customerPhone}</strong></span>
          </div>
        </div>

        {/* Payment Confirmation Pill */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-4 my-2 text-xs text-soft max-w-md w-full space-y-1.5 text-left font-mono">
          <div className="flex justify-between"><span>Invoice:</span><strong className="text-white">{confirmedOrder.invoiceNumber}</strong></div>
          <div className="flex justify-between"><span>Txn Ref:</span><strong className="text-green-400">{confirmedOrder.transactionRef}</strong></div>
          <div className="flex justify-between"><span>Payment Mode:</span><strong className="text-amber-400">{confirmedOrder.paymentMethod}</strong></div>
          <div className="flex justify-between"><span>Amount Paid:</span><strong className="text-primary text-sm font-bold">₹{confirmedOrder.totalAmount?.toFixed(2)}</strong></div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mt-6">
          <button
            onClick={() => navigate('/orders')}
            className="btn-primary flex items-center gap-2 shadow-xl shadow-primary/30 py-3 px-6"
          >
            Track Order Live <ChevronRight size={18} />
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-full border border-dark-border text-gray-300 hover:text-white hover:border-gray-500 transition-colors text-sm font-semibold"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/cart')}
              className="w-10 h-10 rounded-full border border-dark-border flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-cream">Secure Checkout</h1>
              <p className="text-soft text-xs mt-0.5">
                {step === 1 && 'Step 1 of 3 • Select or Enter Delivery Address'}
                {step === 2 && 'Step 2 of 3 • Choose Payment Method'}
                {step === 3 && 'Step 3 of 3 • Review Order Details & Authorize Payment'}
              </p>
            </div>
          </div>

          {/* Stepper Dots */}
          <div className="hidden sm:flex items-center gap-2">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' 
                    : step > s 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-dark-card border border-dark-border text-gray-500'
                }`}
              >
                {step > s ? <Check size={14} /> : s}
              </div>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl mb-6 text-sm flex items-center gap-3">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Wizard Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* STEP 1: DELIVERY ADDRESS SELECTION & CUSTOM ADDRESS */}
            {step === 1 && (
              <div className="bg-dark-card border border-dark-border rounded-3xl p-6 md:p-8 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-cream flex items-center gap-2">
                      <MapPin className="text-primary" /> Delivery Address
                    </h2>
                    <p className="text-xs text-soft mt-0.5">Choose your delivery destination or type a custom address</p>
                  </div>

                  <button
                    onClick={() => setShowAddCustom(!showAddCustom)}
                    className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3.5 py-2 rounded-xl border border-primary/30 transition-all cursor-pointer"
                  >
                    <Plus size={15} />
                    {showAddCustom ? 'Cancel New' : '+ Add Custom Address'}
                  </button>
                </div>

                {/* Inline Custom Address Form */}
                {showAddCustom && (
                  <form onSubmit={handleAddNewAddressSubmit} className="bg-dark-bg/80 border border-primary/40 rounded-2xl p-5 mb-6 space-y-4 animate-fade-in shadow-inner">
                    <div className="flex items-center justify-between pb-2 border-b border-dark-border">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <Sparkles size={14} /> Custom Delivery Address Form
                      </span>
                      <span className="text-[11px] text-gray-400">All fields customizable</span>
                    </div>

                    {/* Address Type Chips */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Address Type</label>
                      <div className="flex flex-wrap gap-2">
                        {['Campus / Hostel', 'Home', 'PG / Flat', 'Work', 'Other'].map(type => (
                          <button
                            type="button"
                            key={type}
                            onClick={() => setCustomLabel(type)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              customLabel === type
                                ? 'bg-primary text-white border-primary shadow-md'
                                : 'bg-dark-card border-dark-border text-gray-300 hover:border-gray-500'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">
                          Flat / Room / Block No.
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Room 304, Kaveri Hostel / Flat 4B"
                          value={customRoom}
                          onChange={e => setCustomRoom(e.target.value)}
                          className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">
                          Recipient Phone Number
                        </label>
                        <input
                          type="text"
                          placeholder="+91-9848012345"
                          value={customPhone}
                          onChange={e => setCustomPhone(e.target.value)}
                          className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">
                        Street Address / Campus / Area <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. KL University Main Campus Gate 2, Vaddeswaram, Guntur 522502"
                        value={customAddress}
                        onChange={e => setCustomAddress(e.target.value)}
                        className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">
                        Delivery Instructions (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Leave at security desk, Call upon reaching gate, etc."
                        value={customInstructions}
                        onChange={e => setCustomInstructions(e.target.value)}
                        className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="saveToAccount"
                        checked={saveToAccount}
                        onChange={e => setSaveToAccount(e.target.checked)}
                        className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer accent-primary"
                      />
                      <label htmlFor="saveToAccount" className="text-xs text-gray-300 cursor-pointer">
                        Save this address to my account profile for future orders
                      </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-2"
                      >
                        <Check size={16} /> Save & Use This Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddCustom(false)}
                        className="px-4 py-2.5 rounded-xl border border-dark-border text-gray-400 hover:text-white text-xs font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Available Addresses List */}
                <div className="space-y-3 mb-6">
                  {addresses.map(addr => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                          isSelected 
                            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10 ring-1 ring-primary/40' 
                            : 'border-dark-border bg-dark-bg hover:border-gray-600'
                        }`}
                      >
                        <div className="space-y-1 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase text-primary tracking-wide">
                              {addr.label}
                            </span>
                            {addr.isGps && (
                              <span className="text-[10px] bg-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Navigation size={10} /> Active GPS
                              </span>
                            )}
                            {addr.source === 'account' && (
                              <span className="text-[10px] bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded-full">
                                Account
                              </span>
                            )}
                          </div>

                          {addr.room && (
                            <p className="text-xs font-bold text-cream">{addr.room}</p>
                          )}
                          <p className="text-sm font-medium text-gray-300 leading-relaxed">{addr.address}</p>

                          {addr.instructions && (
                            <p className="text-xs text-amber-400/90 font-mono mt-1">
                              Note: {addr.instructions}
                            </p>
                          )}
                        </div>

                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-1 ${
                          isSelected ? 'border-primary bg-primary' : 'border-gray-600'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer"
                >
                  Proceed to Payment <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* STEP 2: PAYMENT METHOD */}
            {step === 2 && (
              <div className="bg-dark-card border border-dark-border rounded-3xl p-6 md:p-8 shadow-xl">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-cream flex items-center gap-2">
                    <Smartphone className="text-primary" /> Choose Payment Method
                  </h2>
                  <p className="text-xs text-soft mt-0.5">Select your preferred payment gateway</p>
                </div>

                <div className="space-y-3 mb-6">
                  {PAYMENT_METHODS.map(m => {
                    const Icon = m.icon;
                    const isSelected = selectedPayment === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedPayment(m.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected 
                            ? 'border-primary bg-primary/10 shadow-lg' 
                            : 'border-dark-border bg-dark-bg hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={22} className={m.color} />
                          <span className="text-sm font-bold text-cream">{m.label}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-primary bg-primary' : 'border-gray-600'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sub-inputs based on payment method */}
                {selectedPayment === 'upi' && (
                  <div className="bg-dark-bg p-4 rounded-2xl border border-dark-border mb-6">
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Enter UPI Virtual ID (VPA)</label>
                    <input 
                      type="text"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="e.g. user@okaxis, mobile@upi"
                      className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                    <p className="text-[11px] text-green-400 font-semibold mt-1.5">⚡ Instant auto-verification enabled for presentation demo</p>
                  </div>
                )}

                {selectedPayment === 'card' && (
                  <div className="bg-dark-bg p-4 rounded-2xl border border-dark-border mb-6 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Card Number</label>
                      <input 
                        type="text"
                        value={cardNum}
                        onChange={e => setCardNum(e.target.value)}
                        className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2 text-sm text-white"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setStep(3)}
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer"
                >
                  Review Order Details <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* STEP 3: REVIEW ORDER & AUTHORIZE PAYMENT */}
            {step === 3 && (
              <div className="bg-dark-card border border-dark-border rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-cream flex items-center gap-2">
                    <ShieldCheck className="text-primary" size={24} /> Review Order & Authorize Payment
                  </h2>
                  <p className="text-xs text-soft mt-0.5">
                    Please verify your delivery address, contact, and item list before confirming payment.
                  </p>
                </div>

                {/* 1. Delivery Destination Review Card */}
                <div className="bg-dark-bg rounded-2xl p-5 border border-dark-border relative">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                        <MapPin size={16} />
                      </div>
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block">Delivery Address</span>
                        <span className="text-xs font-bold text-primary uppercase">
                          {selectedAddressObj?.label || 'CAMPUS / HOSTEL'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="text-xs text-primary hover:underline font-bold px-2 py-1 rounded bg-primary/10"
                    >
                      Change Address
                    </button>
                  </div>

                  <div className="mt-2 text-sm text-gray-200 space-y-1">
                    {selectedAddressObj?.room && (
                      <p className="font-bold text-cream">{selectedAddressObj.room}</p>
                    )}
                    <p className="leading-relaxed">{selectedAddressObj?.address || 'KL University Main Campus Gate 2, Vaddeswaram'}</p>
                    {selectedAddressObj?.instructions && (
                      <p className="text-xs text-amber-400 font-mono">
                        Note: {selectedAddressObj.instructions}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-dark-border flex flex-wrap justify-between items-center text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <UserIcon size={14} className="text-gray-500" />
                      <span>Recipient: <strong className="text-white">{customRecipient || currentUser?.name || 'Sai Nikhil'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-500" />
                      <span>Contact: <strong className="text-white">{customPhone || selectedAddressObj?.phone || currentUser?.phone || '+91-9848012345'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-green-400 font-semibold w-full mt-2">
                      <Clock size={14} />
                      <span>⚡ Estimated Delivery: 25–35 Mins (Express Kitchen Dispatch)</span>
                    </div>
                  </div>
                </div>

                {/* 2. Payment Method Review Card */}
                <div className="bg-dark-bg rounded-2xl p-5 border border-dark-border flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center font-bold">
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block">Payment Method</span>
                      <p className="text-sm font-bold text-cream capitalize">
                        {selectedPayment === 'upi' ? `UPI Instant Pay (${upiId})` : selectedPayment === 'card' ? `Card (${cardNum})` : selectedPayment.toUpperCase()}
                      </p>
                      <span className="text-[10px] text-green-400 font-medium flex items-center gap-1">
                        <Lock size={10} /> 256-Bit SSL Encrypted & Verified
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs text-primary hover:underline font-bold px-2 py-1 rounded bg-primary/10"
                  >
                    Change Payment
                  </button>
                </div>

                {/* 3. Order Items Preview Box */}
                <div className="bg-dark-bg rounded-2xl p-5 border border-dark-border space-y-3">
                  <div className="flex justify-between items-center text-xs text-gray-400 border-b border-dark-border pb-2">
                    <span className="uppercase font-bold tracking-wider">Restaurant: <strong className="text-cream">{cart.restaurantName || 'BistroByte Kitchen'}</strong></span>
                    <span className="text-primary font-bold">{cart.items.length} items</span>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {cart.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-cream">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-dark-card border border-dark-border flex items-center justify-center text-[10px] font-bold text-primary">
                            {item.quantity}x
                          </span>
                          <span>{item.name}</span>
                        </div>
                        <span className="font-mono text-soft">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-dark-border flex justify-between items-center text-xs text-soft">
                    <span>Payable Total:</span>
                    <strong className="text-primary text-base font-black font-mono">₹{(total || 0).toFixed(2)}</strong>
                  </div>
                </div>

                {/* Confirm & Authorize Payment CTA */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="btn-primary w-full py-4 text-base font-black tracking-wide flex items-center justify-center gap-2 shadow-2xl shadow-primary/40 disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Contacting Payment Gateway & Kitchen...
                    </>
                  ) : (
                    <>
                      <Lock size={18} /> Authorize & Pay ₹{(total || 0).toFixed(2)}
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-gray-500">
                  By confirming, your order will be instantly verified and sent to the live kitchen queue.
                </p>
              </div>
            )}
          </div>

          {/* Right Summary Column */}
          <div className="bg-dark-card border border-dark-border rounded-3xl p-6 shadow-xl h-fit space-y-4">
            <h3 className="font-bold text-base text-cream border-b border-dark-border pb-3">Cart Summary</h3>
            <div className="space-y-2 text-xs text-soft max-h-48 overflow-y-auto">
              {cart.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-mono text-cream">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dark-border pt-3 space-y-2 text-xs text-soft">
              <div className="flex justify-between"><span>Subtotal:</span><span className="text-cream">₹{(subtotal || 0).toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Taxes (5%):</span><span className="text-cream">₹{(taxes || 0).toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Delivery:</span><span className="text-cream">₹{(deliveryFee || 0).toFixed(2)}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-green-400 font-semibold"><span>Promo:</span><span>-₹{discount.toFixed(2)}</span></div>
              )}
            </div>

            <div className="border-t border-dark-border pt-3 flex justify-between items-center text-lg font-black text-white">
              <span>Total:</span>
              <span className="text-primary font-mono">₹{(total || 0).toFixed(2)}</span>
            </div>

            {/* Selected Address Mini Preview */}
            <div className="bg-dark-bg p-3 rounded-2xl border border-dark-border text-[11px] text-soft space-y-1">
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <MapPin size={12} /> Delivery Destination:
              </div>
              <p className="text-cream font-medium truncate">
                {selectedAddressObj?.room ? `${selectedAddressObj.room}, ` : ''}{selectedAddressObj?.address || 'KL University Main Campus Gate 2'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Package, Clock, MapPin, CheckCircle, ChefHat, Bike, ChevronRight, FileText, Star, RotateCcw, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import InvoiceModal from '../components/InvoiceModal';
import ReviewModal from '../components/ReviewModal';
import { useCart } from '../context/CartContext';

const TRACKING_STEPS = [
  { id: 'PLACED', label: 'Order Placed', icon: Package },
  { id: 'CONFIRMED', label: 'Restaurant Accepted', icon: CheckCircle },
  { id: 'PREPARING', label: 'Preparing', icon: ChefHat },
  { id: 'READY', label: 'Ready for Pickup', icon: CheckCircle },
  { id: 'ON_THE_WAY', label: 'Out for Delivery', icon: Bike },
  { id: 'DELIVERED', label: 'Delivered', icon: MapPin },
];

export default function Orders() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // active, completed

  // Modals
  const [invoiceData, setInvoiceData] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const stored = localStorage.getItem('user');
      const email = stored ? JSON.parse(stored).email : 'customer@bistrobyte.com';
      const response = await api.get(`/orders/my?email=${encodeURIComponent(email)}`);
      if (response.data) {
        const sorted = response.data.sort((a, b) => b.id - a.id);
        setOrders(sorted);
        if (!selectedOrder && sorted.length > 0) {
          setSelectedOrder(sorted[0]);
        } else if (selectedOrder) {
          // Keep active selected order updated
          const updatedSelected = sorted.find(o => o.id === selectedOrder.id);
          if (updatedSelected) setSelectedOrder(updatedSelected);
        }
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInvoice = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}/invoice`);
      setInvoiceData(res.data);
    } catch (e) {
      console.error(e);
      // Fallback from order state
      if (selectedOrder) {
        setInvoiceData({
          invoiceNumber: selectedOrder.invoiceNumber || 'INV-BB-' + selectedOrder.orderNumber,
          orderNumber: selectedOrder.orderNumber,
          orderDate: selectedOrder.createdAt,
          customerName: selectedOrder.customerName,
          deliveryAddress: selectedOrder.deliveryAddress,
          restaurantName: selectedOrder.restaurantName || 'BistroByte Kitchen',
          paymentMethod: selectedOrder.paymentMethod || 'UPI',
          paymentStatus: selectedOrder.paymentStatus || 'SUCCESS',
          totalAmount: selectedOrder.totalAmount,
          subtotal: selectedOrder.subtotalAmount || (selectedOrder.totalAmount * 0.9),
          tax: selectedOrder.taxAmount || (selectedOrder.totalAmount * 0.05),
          deliveryFee: selectedOrder.deliveryFee || 2.99,
          items: selectedOrder.items
        });
      }
    }
  };

  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;
    for (const item of order.items) {
      addToCart({
        id: item.menuItemId || item.id,
        name: item.itemName,
        price: item.price,
        veg: true
      }, order.restaurantId || 1, order.restaurantName || 'BistroByte Kitchen', item.quantity || 1);
    }
    navigate('/cart');
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading your orders...</div>;

  const activeOrders = orders.filter(o => !['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(o.status));
  const completedOrders = orders.filter(o => ['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(o.status));
  const currentDisplayedOrder = selectedOrder || (orders.length > 0 ? orders[0] : null);

  const getStepIndex = (status) => {
    if (!status) return 0;
    const s = status.toUpperCase();
    if (s === 'PLACED') return 0;
    if (s === 'CONFIRMED' || s === 'ACCEPTED') return 1;
    if (s === 'PREPARING') return 2;
    if (s === 'READY' || s === 'READY_FOR_PICKUP') return 3;
    if (s === 'ON_THE_WAY' || s === 'PICKED_UP') return 4;
    if (s === 'DELIVERED' || s === 'COMPLETED') return 5;
    return 0;
  };

  const currentStepIdx = currentDisplayedOrder ? getStepIndex(currentDisplayedOrder.status) : 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      
      {/* Title & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-cream tracking-tight">Order Execution & History</h1>
          <p className="text-soft text-sm mt-1">Live real-time kitchen tracking, digital invoices, and verified food reviews.</p>
        </div>

        <div className="flex bg-dark-card border border-dark-border p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'active' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Active Orders ({activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'completed' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Past Orders ({completedOrders.length})
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-dark-card border border-dark-border rounded-3xl p-8">
          <Package size={48} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-cream mb-2">No Orders Found</h2>
          <p className="text-soft text-sm mb-6">You haven't placed any orders yet. Discover delicious dishes near you!</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Explore Restaurants
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Order Selector List */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-2">
              {activeTab === 'active' ? 'IN-PROGRESS ORDERS' : 'PAST ORDERS'}
            </h3>

            {(activeTab === 'active' ? activeOrders : completedOrders).map(o => (
              <div
                key={o.id}
                onClick={() => setSelectedOrder(o)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  selectedOrder?.id === o.id 
                    ? 'bg-dark-card border-primary shadow-xl shadow-primary/10' 
                    : 'bg-dark-card/60 border-dark-border hover:border-gray-600'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono font-bold text-cream text-sm">#{o.orderNumber}</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    o.status === 'COMPLETED' || o.status === 'DELIVERED' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-primary/20 text-primary'
                  }`}>
                    {o.status}
                  </span>
                </div>
                <p className="text-sm font-bold text-white line-clamp-1">{o.restaurantName || 'BistroByte Kitchen'}</p>
                <div className="flex justify-between items-center text-xs text-soft mt-3 pt-2 border-t border-dark-border/50">
                  <span>{o.items?.length || 1} items</span>
                  <span className="font-bold text-cream">₹{(o.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Columns: Active Order Details & Live Stepper */}
          {currentDisplayedOrder && (
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-dark-card border border-dark-border rounded-3xl p-6 md:p-8 shadow-2xl">
                
                {/* Header with Invoice & Review Triggers */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-dark-border pb-6 mb-8 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-mono font-black text-sm">ORDER #{currentDisplayedOrder.orderNumber}</span>
                      <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded font-semibold">
                        Payment: {currentDisplayedOrder.paymentStatus || 'SUCCESS'} ({currentDisplayedOrder.paymentMethod || 'UPI'})
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-cream mt-1">{currentDisplayedOrder.restaurantName || 'BistroByte Partner'}</h2>
                    <p className="text-xs text-soft mt-0.5">Channel: {currentDisplayedOrder.channel}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenInvoice(currentDisplayedOrder.id)}
                      className="px-4 py-2 rounded-xl bg-dark-bg hover:bg-dark-border border border-dark-border text-xs text-cream font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <FileText size={15} className="text-primary" /> Invoice
                    </button>
                    {(currentDisplayedOrder.status === 'DELIVERED' || currentDisplayedOrder.status === 'COMPLETED') && (
                      <button
                        onClick={() => setReviewOrder(currentDisplayedOrder)}
                        className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Star size={15} /> Rate & Review
                      </button>
                    )}
                    <button
                      onClick={() => handleReorder(currentDisplayedOrder)}
                      className="px-4 py-2 rounded-xl bg-dark-bg hover:bg-dark-border border border-dark-border text-xs text-cream font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw size={15} /> Reorder
                    </button>
                  </div>
                </div>

                {/* 6-Stage Tracking Timeline */}
                <div className="relative mb-10 pl-2">
                  <div className="absolute left-7 top-4 bottom-4 w-0.5 bg-dark-border"></div>
                  <div 
                    className="absolute left-7 top-4 w-0.5 bg-gradient-to-b from-primary to-orange-500 transition-all duration-700"
                    style={{ height: `${(currentStepIdx / (TRACKING_STEPS.length - 1)) * 100}%` }}
                  ></div>

                  <div className="space-y-6 relative z-10">
                    {TRACKING_STEPS.map((step, index) => {
                      const Icon = step.icon;
                      const isCompleted = index <= currentStepIdx;
                      const isCurrent = index === currentStepIdx;

                      return (
                        <div key={step.id} className={`flex items-center gap-5 ${isCompleted ? 'opacity-100' : 'opacity-35'}`}>
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                            isCurrent 
                              ? 'bg-gradient-to-br from-primary to-orange-600 text-white shadow-lg shadow-primary/30 scale-110' 
                              : isCompleted 
                                ? 'bg-primary/20 text-primary border border-primary/40' 
                                : 'bg-dark-bg text-gray-500 border border-dark-border'
                          }`}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <p className={`font-bold text-sm md:text-base ${isCurrent ? 'text-white' : isCompleted ? 'text-gray-200' : 'text-gray-500'}`}>
                              {step.label}
                            </p>
                            {isCurrent && (
                              <p className="text-primary text-xs font-semibold mt-0.5 animate-pulse">In Progress...</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Summary & Address Box */}
                <div className="bg-dark-bg border border-dark-border rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold text-soft">
                    <span>Delivery Address</span>
                    <span className="text-white">{currentDisplayedOrder.deliveryAddress || '12 Main Campus Rd, Vaddeswaram'}</span>
                  </div>

                  <div className="border-t border-dark-border/60 pt-3">
                    <p className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Items Ordered</p>
                    <div className="space-y-1.5 text-xs text-gray-300">
                      {currentDisplayedOrder.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.quantity}x {item.itemName}</span>
                          <span className="font-mono text-soft">₹{(item.subtotal || item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-dark-border/60 pt-3 flex justify-between items-center text-base font-black text-white">
                    <span>Total Paid:</span>
                    <span className="text-primary font-mono">₹{(currentDisplayedOrder.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={Boolean(invoiceData)}
        onClose={() => setInvoiceData(null)}
        invoice={invoiceData}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={Boolean(reviewOrder)}
        onClose={() => setReviewOrder(null)}
        order={reviewOrder}
        onReviewSubmitted={() => {
          fetchOrders();
        }}
      />
    </div>
  );
}

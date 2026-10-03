import { useState, useEffect } from 'react';
import { ChefHat, Bike, Users, Calendar, Clock, CheckCircle2, AlertCircle, ArrowRight, Plus, RefreshCw, X, ShieldCheck, MapPin } from 'lucide-react';
import api from '../services/api';

export default function StaffPortal() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('kitchen');
  const [orders, setOrders] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Staff Modal State
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'KITCHEN_STAFF',
    shift: 'Morning (06:00 - 15:00)',
    assignedArea: 'Main Kitchen'
  });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      if (u.role?.includes('DELIVERY')) {
        setActiveTab('delivery');
      } else if (u.role?.includes('OWNER') || u.role?.includes('ADMIN')) {
        setActiveTab('staff');
      }
    }
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [ordersRes, staffRes, tableRes] = await Promise.all([
        api.get('/orders/all').catch(() => ({ data: [] })),
        api.get('/auth/staff/restaurant/1').catch(() => ({ data: [] })),
        api.get('/tables/restaurant/1').catch(() => ({ data: [] }))
      ]);

      setOrders(ordersRes.data || []);
      setStaffList(staffRes.data || []);
      setReservations(tableRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status?status=${newStatus}`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/staff', {
        ...newStaff,
        restaurantId: 1
      });
      setShowAddStaff(false);
      setNewStaff({
        name: '',
        email: '',
        phone: '',
        role: 'KITCHEN_STAFF',
        shift: 'Morning (06:00 - 15:00)',
        assignedArea: 'Main Kitchen'
      });
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add staff member');
    }
  };

  const handleDeactivateStaff = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this staff member?')) {
      try {
        await api.delete(`/auth/staff/${id}`);
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const activeKitchenOrders = orders.filter(o => !['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(o.status));
  const activeDeliveryOrders = orders.filter(o => ['READY_FOR_PICKUP', 'READY', 'ON_THE_WAY', 'PICKED_UP', 'CONFIRMED'].includes(o.status));

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Top Banner */}
      <div className="bg-dark-card border border-dark-border p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <ShieldCheck size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-cream">Restaurant Operations Portal</h1>
              <span className="bg-primary/20 text-primary text-xs font-bold px-2.5 py-1 rounded-md uppercase">
                {user?.role?.replace('ROLE_', '') || 'STAFF'}
              </span>
            </div>
            <p className="text-soft text-sm mt-0.5">
              Logged in as <span className="text-cream font-bold">{user?.name || 'Staff Member'}</span> ({user?.email})
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-dark-bg p-1.5 rounded-2xl border border-dark-border">
          <button
            onClick={() => setActiveTab('kitchen')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'kitchen' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ChefHat size={16} /> Kitchen Execution ({activeKitchenOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'delivery' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bike size={16} /> Deliveries ({activeDeliveryOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'staff' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users size={16} /> Staff Team ({staffList.length})
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'tables' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Calendar size={16} /> Tables ({reservations.length})
          </button>
        </div>
      </div>

      {/* TAB 1: KITCHEN EXECUTION */}
      {activeTab === 'kitchen' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-cream flex items-center gap-2">
              <ChefHat className="text-primary" /> Active Kitchen Orders Queue
            </h2>
            <button onClick={loadData} className="flex items-center gap-1.5 text-xs text-soft hover:text-primary transition-colors">
              <RefreshCw size={14} /> Refresh Live
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* New / Placed Orders */}
            <div className="bg-dark-card border border-dark-border rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between border-b border-dark-border pb-3 mb-4">
                <span className="font-bold text-red-400 flex items-center gap-2 text-sm uppercase">
                  <AlertCircle size={16} /> 1. New Orders ({orders.filter(o => ['PLACED', 'CONFIRMED'].includes(o.status)).length})
                </span>
              </div>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {orders.filter(o => ['PLACED', 'CONFIRMED'].includes(o.status)).map(order => (
                  <div key={order.id} className="bg-dark-bg border border-dark-border p-4 rounded-2xl relative">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-cream text-base">#{order.orderNumber}</span>
                      <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {order.channel}
                      </span>
                    </div>
                    <p className="text-xs text-soft mb-2 font-medium">Customer: {order.customerName}</p>
                    <ul className="text-sm space-y-1 mb-4 text-gray-300">
                      {order.items?.map((item, i) => (
                        <li key={i} className="flex justify-between text-xs">
                          <span>{item.quantity}x {item.itemName}</span>
                          <span className="text-soft font-mono">₹{item.subtotal || item.price * item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}
                      className="w-full py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors"
                    >
                      Start Preparing 👨‍🍳
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* In Preparation */}
            <div className="bg-dark-card border border-dark-border rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between border-b border-dark-border pb-3 mb-4">
                <span className="font-bold text-amber-400 flex items-center gap-2 text-sm uppercase">
                  <Clock size={16} /> 2. In Preparation ({orders.filter(o => o.status === 'PREPARING').length})
                </span>
              </div>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {orders.filter(o => o.status === 'PREPARING').map(order => (
                  <div key={order.id} className="bg-dark-bg border border-dark-border p-4 rounded-2xl relative">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-cream text-base">#{order.orderNumber}</span>
                      <span className="text-xs font-semibold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded animate-pulse">
                        Cooking
                      </span>
                    </div>
                    <p className="text-xs text-soft mb-2 font-medium">Customer: {order.customerName}</p>
                    <ul className="text-sm space-y-1 mb-4 text-gray-300">
                      {order.items?.map((item, i) => (
                        <li key={i} className="flex justify-between text-xs">
                          <span>{item.quantity}x {item.itemName}</span>
                          <span className="text-soft font-mono">₹{item.subtotal || item.price * item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleUpdateOrderStatus(order.id, 'READY_FOR_PICKUP')}
                      className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-dark-bg text-xs font-bold transition-colors"
                    >
                      Mark Food Ready 🛎️
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Ready for Pickup / Delivery */}
            <div className="bg-dark-card border border-dark-border rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between border-b border-dark-border pb-3 mb-4">
                <span className="font-bold text-green-400 flex items-center gap-2 text-sm uppercase">
                  <CheckCircle2 size={16} /> 3. Ready For Pickup ({orders.filter(o => ['READY', 'READY_FOR_PICKUP'].includes(o.status)).length})
                </span>
              </div>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {orders.filter(o => ['READY', 'READY_FOR_PICKUP'].includes(o.status)).map(order => (
                  <div key={order.id} className="bg-dark-bg border border-dark-border p-4 rounded-2xl relative">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-cream text-base">#{order.orderNumber}</span>
                      <span className="text-xs font-semibold bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                        Ready
                      </span>
                    </div>
                    <p className="text-xs text-soft mb-2 font-medium">Customer: {order.customerName}</p>
                    <button
                      onClick={() => handleUpdateOrderStatus(order.id, 'COMPLETED')}
                      className="w-full py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-colors"
                    >
                      Complete & Handover ✅
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DELIVERIES */}
      {activeTab === 'delivery' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-cream flex items-center gap-2">
            <Bike className="text-primary" /> Active Delivery Assignments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeDeliveryOrders.map(order => (
              <div key={order.id} className="bg-dark-card border border-dark-border p-6 rounded-3xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-black text-lg text-cream">ORDER #{order.orderNumber}</span>
                    <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full">
                      {order.status}
                    </span>
                  </div>
                  <div className="text-xs text-soft space-y-1 mb-4">
                    <p className="flex items-center gap-1.5"><Users size={14} /> <strong className="text-cream">{order.customerName}</strong> ({order.customerPhone || 'N/A'})</p>
                    <p className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> {order.deliveryAddress || 'Campus Gate 2, Vaddeswaram'}</p>
                    <p className="text-green-400 font-semibold">Payment: {order.paymentStatus || 'SUCCESS'} ({order.paymentMethod || 'UPI'}) - ₹{order.totalAmount}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-dark-border">
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, 'ON_THE_WAY')}
                    className="flex-1 py-2.5 rounded-xl bg-dark-bg hover:bg-primary border border-dark-border text-xs font-bold transition-colors"
                  >
                    🛵 Out for Delivery
                  </button>
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                    className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-colors"
                  >
                    📦 Mark Delivered
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STAFF MANAGEMENT */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-cream flex items-center gap-2">
                <Users className="text-primary" /> Restaurant Staff Directory
              </h2>
              <p className="text-xs text-soft">Manage roles, shifts, and individual logins for restaurant crew.</p>
            </div>
            <button
              onClick={() => setShowAddStaff(true)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus size={16} /> Onboard New Staff
            </button>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-3xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-dark-bg border-b border-dark-border text-xs text-soft uppercase font-bold">
                <tr>
                  <th className="py-4 px-6">Name / Contact</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Shift</th>
                  <th className="py-4 px-6">Area</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border text-gray-300">
                {staffList.map(s => (
                  <tr key={s.id} className="hover:bg-dark-bg/40">
                    <td className="py-4 px-6">
                      <p className="font-bold text-cream">{s.name}</p>
                      <p className="text-xs text-soft">{s.email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-dark-bg px-2.5 py-1 rounded-md text-xs font-semibold text-primary border border-dark-border">
                        {s.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs">{s.shift}</td>
                    <td className="py-4 px-6 text-xs">{s.assignedArea || 'Kitchen Floor'}</td>
                    <td className="py-4 px-6">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        s.employmentStatus === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {s.employmentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeactivateStaff(s.id)}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: TABLE RESERVATIONS */}
      {activeTab === 'tables' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-cream flex items-center gap-2">
            <Calendar className="text-primary" /> Table Reservations & Dining Seating
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.map(res => (
              <div key={res.id} className="bg-dark-card border border-dark-border p-6 rounded-3xl shadow-xl">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-cream">Table #{res.tableNumber}</h3>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full font-bold">
                    {res.status}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-1">Guest: <strong className="text-white">{res.customerName}</strong></p>
                <p className="text-xs text-soft mb-1">Phone: {res.customerPhone || 'N/A'}</p>
                <p className="text-xs text-soft mb-4">Party Size: {res.partySize} Guests</p>
                <div className="flex gap-2 border-t border-dark-border pt-4">
                  <button className="flex-1 py-2 rounded-xl bg-dark-bg hover:bg-primary border border-dark-border text-xs font-bold transition-colors">
                    Seat Guests
                  </button>
                  <button className="flex-1 py-2 rounded-xl bg-dark-bg hover:bg-dark-border border border-dark-border text-xs font-bold text-gray-400 transition-colors">
                    Free Table
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaff && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setShowAddStaff(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-cream mb-6">Onboard Staff Member</h3>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Work Email</label>
                <input
                  type="email"
                  required
                  value={newStaff.email}
                  onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
                  placeholder="e.g. rahul@bistrobyte.com"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Role</label>
                <select
                  value={newStaff.role}
                  onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                >
                  <option value="RESTAURANT_MANAGER">Restaurant Manager</option>
                  <option value="CHEF">Head Chef</option>
                  <option value="KITCHEN_STAFF">Kitchen Staff</option>
                  <option value="DELIVERY_STAFF">Delivery Rider</option>
                  <option value="CASHIER">Cashier / Billing</option>
                  <option value="SERVICE_STAFF">Service Crew</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Assigned Shift</label>
                <select
                  value={newStaff.shift}
                  onChange={e => setNewStaff({ ...newStaff, shift: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                >
                  <option value="Morning (06:00 - 15:00)">Morning (06:00 - 15:00)</option>
                  <option value="Evening (15:00 - 23:00)">Evening (15:00 - 23:00)</option>
                  <option value="Night (23:00 - 07:00)">Night (23:00 - 07:00)</option>
                  <option value="Full Day Flexible">Full Day Flexible</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm transition-all shadow-md mt-4"
              >
                Create Staff Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

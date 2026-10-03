import { useState, useEffect } from 'react';
import { ChefHat, CheckCircle2, Clock, AlertCircle, X, ChevronRight } from 'lucide-react';
import api from '../services/api';

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders/all', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          const data = await response.json();
          const formatted = data.map(o => ({
            id: o.orderNumber || o.id,
            rawId: o.id,
            items: (o.items || []).map(i => `${i.quantity}x ${i.itemName || i.name || 'Item'}`),
            time: 'Just now',
            status: o.status === 'PLACED' ? 'NEW' : o.status,
            type: o.channel || 'App Order'
          }));
          setOrders(formatted);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (displayId, newStatus) => {
    const order = orders.find(o => o.id === displayId);
    if (!order) return;
    try {
      await fetch(`/api/orders/${order.rawId}/status?status=${newStatus}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      // Optimistic update
      setOrders(prev => prev.map(o => o.id === displayId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-dark-card border border-dark-border p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <ChefHat size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-cream tracking-tight">Kitchen Control Center</h1>
            <p className="text-soft font-medium flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
              Accepting Orders
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 mt-6 md:mt-0">
          <div className="bg-dark-bg border border-dark-border px-6 py-3 rounded-2xl text-center">
            <p className="text-soft text-sm font-semibold uppercase tracking-wider">Active</p>
            <p className="text-2xl font-black text-primary">{orders.filter(o => o.status !== 'COMPLETED').length}</p>
          </div>
          <div className="bg-dark-bg border border-dark-border px-6 py-3 rounded-2xl text-center">
            <p className="text-soft text-sm font-semibold uppercase tracking-wider">Avg Prep</p>
            <p className="text-2xl font-black text-cream">14m</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* NEW ORDERS */}
        <div className="flex flex-col h-[70vh] bg-dark-card border border-dark-border rounded-3xl overflow-hidden">
          <div className="bg-red-500/10 border-b border-red-500/20 p-5 flex justify-between items-center">
            <h3 className="font-bold text-red-500 flex items-center gap-2 text-lg">
              <AlertCircle size={20} /> NEW ORDERS
            </h3>
            <span className="bg-red-500 text-white font-bold px-3 py-1 rounded-full text-xs">
              {orders.filter(o => o.status === 'NEW').length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {orders.filter(o => o.status === 'NEW').map(order => (
              <div key={order.id} className="bg-dark-bg border border-dark-border p-5 rounded-2xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-black text-lg text-cream">{order.id}</h4>
                  <span className="text-xs font-bold bg-dark-card px-2 py-1 rounded-lg text-gray-400">{order.time}</span>
                </div>
                <div className="text-sm text-soft font-medium mb-2">{order.type}</div>
                <ul className="text-gray-300 font-medium mb-6 space-y-1">
                  {order.items.map((item, i) => (
                    <li key={i} className="flex gap-2 items-start"><span className="text-primary">•</span>{item}</li>
                  ))}
                </ul>
                <div className="flex gap-2 mt-auto">
                  <button onClick={() => updateStatus(order.id, 'PREPARING')} className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-xl transition-colors">
                    Accept & Prepare
                  </button>
                  <button className="px-4 bg-dark-card hover:bg-red-500/20 text-gray-400 hover:text-red-500 border border-dark-border rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PREPARING */}
        <div className="flex flex-col h-[70vh] bg-dark-card border border-dark-border rounded-3xl overflow-hidden">
          <div className="bg-amber-500/10 border-b border-amber-500/20 p-5 flex justify-between items-center">
            <h3 className="font-bold text-amber-500 flex items-center gap-2 text-lg">
              <Clock size={20} /> PREPARING
            </h3>
            <span className="bg-amber-500 text-white font-bold px-3 py-1 rounded-full text-xs">
              {orders.filter(o => o.status === 'PREPARING').length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {orders.filter(o => o.status === 'PREPARING').map(order => (
              <div key={order.id} className="bg-dark-bg border border-dark-border p-5 rounded-2xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-black text-lg text-cream">{order.id}</h4>
                  <span className="text-xs font-bold bg-dark-card px-2 py-1 rounded-lg text-gray-400">{order.time}</span>
                </div>
                <div className="text-sm text-soft font-medium mb-2">{order.type}</div>
                <ul className="text-gray-300 font-medium mb-6 space-y-1">
                  {order.items.map((item, i) => (
                    <li key={i} className="flex gap-2 items-start"><span className="text-primary">•</span>{item}</li>
                  ))}
                </ul>
                <button onClick={() => updateStatus(order.id, 'READY')} className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 border border-amber-500/50 font-bold py-2.5 rounded-xl transition-colors">
                  Mark as Ready
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* READY */}
        <div className="flex flex-col h-[70vh] bg-dark-card border border-dark-border rounded-3xl overflow-hidden">
          <div className="bg-green-500/10 border-b border-green-500/20 p-5 flex justify-between items-center">
            <h3 className="font-bold text-green-500 flex items-center gap-2 text-lg">
              <CheckCircle2 size={20} /> READY
            </h3>
            <span className="bg-green-500 text-white font-bold px-3 py-1 rounded-full text-xs">
              {orders.filter(o => o.status === 'READY').length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {orders.filter(o => o.status === 'READY').map(order => (
              <div key={order.id} className="bg-dark-bg border border-dark-border p-5 rounded-2xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-black text-lg text-cream">{order.id}</h4>
                  <span className="text-xs font-bold bg-dark-card px-2 py-1 rounded-lg text-gray-400">{order.time}</span>
                </div>
                <div className="text-sm text-soft font-medium mb-2">{order.type}</div>
                <button onClick={() => updateStatus(order.id, 'COMPLETED')} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl transition-colors">
                  Complete / Dispatch
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

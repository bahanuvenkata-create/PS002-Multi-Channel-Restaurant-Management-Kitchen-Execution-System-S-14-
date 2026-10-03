import { useState } from 'react';
import { Package, Users, Truck, DollarSign, Plus, Edit2, Trash2, Calendar, FileText, Search, Bell, Settings, LogOut, ChevronRight, TrendingUp, AlertCircle, CheckCircle, BarChart3, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // MOCK DATA 
  const kpis = [
    { title: "Today's Revenue", value: "₹24,500", increase: "+14.5%", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Active Orders", value: "32", increase: "+5.2%", icon: Package, color: "text-primary", bg: "bg-primary/10" },
    { title: "Low Stock Items", value: "8", increase: "-2.1%", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
    { title: "Staff on Duty", value: "12", increase: "100%", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  const inventory = [
    { id: 'ITM-001', name: 'Premium Basmati Rice', category: 'Raw Material', quantity: '50 kg', status: 'In Stock' },
    { id: 'ITM-002', name: 'Fresh Chicken Breast', category: 'Meat', quantity: '10 kg', status: 'Low Stock' },
    { id: 'ITM-003', name: 'Organic Tomatoes', category: 'Vegetables', quantity: '5 kg', status: 'Critical' },
    { id: 'ITM-004', name: 'Refined Sunflower Oil', category: 'Grocery', quantity: '120 L', status: 'In Stock' },
  ];

  const employees = [
    { id: 'EMP-101', name: 'Rahul Sharma', role: 'Head Chef', shift: 'Morning (06:00 - 15:00)', attendance: 'Present' },
    { id: 'EMP-102', name: 'Priya Patel', role: 'Server', shift: 'Evening (15:00 - 23:00)', attendance: 'Leave' },
    { id: 'EMP-103', name: 'Amit Kumar', role: 'Delivery Agent', shift: 'Morning (08:00 - 17:00)', attendance: 'Present' },
  ];

  const suppliers = [
    { id: 'SUP-01', name: 'Fresh Farms Organics', supply: 'Vegetables & Fruits', contact: '+91 9876543210', status: 'Active', nextDelivery: 'Tomorrow, 06:00 AM' },
    { id: 'SUP-02', name: 'Premium Meats Co.', supply: 'Chicken & Mutton', contact: '+91 8765432109', status: 'Pending', nextDelivery: 'Not Scheduled' },
  ];

  const finances = [
    { id: 'INV-1024', type: 'Income', description: 'Daily Zomato Settlement', amount: '₹15,400', date: '25 Sep 2026', status: 'Cleared' },
    { id: 'INV-1025', type: 'Expense', description: 'Supplier Payment - Fresh Farms', amount: '₹3,200', date: '24 Sep 2026', status: 'Pending' },
    { id: 'INV-1026', type: 'Expense', description: 'Electricity Bill - September', amount: '₹12,500', date: '20 Sep 2026', status: 'Cleared' },
  ];

  const sidebarLinks = [
    { id: 'dashboard', label: 'Overview', icon: BarChart3 },
    { id: 'inventory', label: 'Inventory & Stock', icon: Package },
    { id: 'employees', label: 'Staff Management', icon: Users },
    { id: 'suppliers', label: 'Supplier Network', icon: Truck },
    { id: 'finance', label: 'Finance & Billing', icon: DollarSign },
  ];

  const renderBadge = (text) => {
    let color = 'bg-gray-500/20 text-gray-400';
    if (text === 'In Stock' || text === 'Present' || text === 'Active' || text === 'Income' || text === 'Cleared') color = 'bg-green-500/20 text-green-500 border border-green-500/30';
    if (text === 'Low Stock' || text === 'Leave' || text === 'Pending' || text === 'Expense') color = 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30';
    if (text === 'Critical') color = 'bg-red-500/20 text-red-500 border border-red-500/30';
    
    return <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${color}`}>{text}</span>;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex overflow-hidden">
      
      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#111111] border-r border-[#222] transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between border-b border-[#222]">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">B</div>
              <div>
                <h1 className="text-xl font-black text-white leading-none">BistroByte</h1>
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Admin Portal</p>
              </div>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white"><X size={24} /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">Management</div>
            {sidebarLinks.map(link => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all group ${
                    isActive 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white border border-transparent'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-primary' : 'text-gray-500 group-hover:text-white transition-colors'} />
                  {link.label}
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>

          <div className="p-6 border-t border-[#222]">
            <button className="flex items-center gap-3 text-gray-400 hover:text-red-500 font-bold transition-colors px-2">
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-20 bg-[#111111]/80 backdrop-blur-md border-b border-[#222] flex items-center justify-between px-6 lg:px-10 z-40 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white"><Menu size={24} /></button>
            <div className="relative hidden md:block">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" placeholder="Search orders, staff, inventory..." className="bg-[#1a1a1a] border border-[#333] text-sm text-white rounded-full pl-12 pr-6 py-2.5 w-80 focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-[#111111]"></span>
            </button>
            <div className="h-8 w-px bg-[#333]"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">Admin User</p>
                <p className="text-xs text-gray-500">General Manager</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-500 border-2 border-[#333] overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Admin+User&background=333&color=fff" alt="Admin" />
              </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-hide">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* PAGE TITLE */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-white capitalize">{sidebarLinks.find(l => l.id === activeTab)?.label}</h2>
                <p className="text-gray-400 mt-1">Manage and monitor your restaurant operations.</p>
              </div>
              {activeTab !== 'dashboard' && (
                <button className="bg-primary hover:bg-primary-hover text-dark-bg font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all transform hover:scale-105">
                  <Plus size={18} /> Add New Entry
                </button>
              )}
            </div>

            {/* DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {kpis.map((kpi, i) => {
                    const Icon = kpi.icon;
                    return (
                      <div key={i} className="bg-[#111] border border-[#222] rounded-2xl p-6 relative overflow-hidden group hover:border-[#444] transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div className={`p-3 rounded-xl ${kpi.bg}`}>
                            <Icon size={24} className={kpi.color} />
                          </div>
                          <span className={`text-sm font-bold bg-[#1a1a1a] px-2 py-1 rounded-lg ${kpi.color}`}>{kpi.increase}</span>
                        </div>
                        <h3 className="text-gray-400 text-sm font-semibold mb-1">{kpi.title}</h3>
                        <p className="text-3xl font-black text-white">{kpi.value}</p>
                        <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                          <Icon size={100} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-[#111] border border-[#222] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><TrendingUp className="text-primary" size={20} /> Revenue Overview</h3>
                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                      {/* Fake Chart Bars */}
                      {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                        <div key={i} className="w-full bg-[#1a1a1a] rounded-t-lg relative group">
                          <div className="absolute bottom-0 w-full bg-primary/20 rounded-t-lg transition-all duration-500 group-hover:bg-primary" style={{ height: `${h}%` }}></div>
                          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500">Day {i+1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><AlertCircle className="text-red-500" size={20} /> Action Required</h3>
                    <div className="space-y-4">
                      <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                        <p className="text-sm font-bold text-white">Approve Supplier Invoice</p>
                        <p className="text-xs text-gray-400 mt-1">Fresh Farms - ₹3,200 pending</p>
                      </div>
                      <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                        <p className="text-sm font-bold text-white">Tomatoes Out of Stock</p>
                        <p className="text-xs text-gray-400 mt-1">Kitchen requested 5kg urgent</p>
                      </div>
                      <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                        <p className="text-sm font-bold text-white">Shift Swap Request</p>
                        <p className="text-xs text-gray-400 mt-1">Priya Patel requested leave tomorrow</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TABULAR DATA (Inventory, Employees, Finance) */}
            {['inventory', 'employees', 'finance'].includes(activeTab) && (
              <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-[#222] flex justify-between items-center bg-[#151515]">
                  <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm font-bold bg-[#222] text-white rounded-lg">All Records</button>
                    <button className="px-4 py-2 text-sm font-bold text-gray-400 hover:bg-[#222] hover:text-white rounded-lg transition-colors">Recent</button>
                  </div>
                  <button className="text-gray-400 hover:text-white"><Settings size={20} /></button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#0a0a0a] text-gray-400 border-b border-[#222]">
                      <tr>
                        {activeTab === 'inventory' && ['ID', 'Item Name', 'Category', 'Quantity', 'Status', ''].map((h, i) => <th key={i} className="p-5 font-bold uppercase tracking-wider text-xs">{h}</th>)}
                        {activeTab === 'employees' && ['ID', 'Name', 'Role', 'Shift', 'Status', ''].map((h, i) => <th key={i} className="p-5 font-bold uppercase tracking-wider text-xs">{h}</th>)}
                        {activeTab === 'finance' && ['ID', 'Type', 'Description', 'Amount', 'Date', 'Status'].map((h, i) => <th key={i} className="p-5 font-bold uppercase tracking-wider text-xs">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222]">
                      {activeTab === 'inventory' && inventory.map((item, i) => (
                        <tr key={i} className="hover:bg-[#151515] transition-colors group">
                          <td className="p-5 text-gray-500 font-mono">{item.id}</td>
                          <td className="p-5 font-bold text-white">{item.name}</td>
                          <td className="p-5 text-gray-400">{item.category}</td>
                          <td className="p-5 font-medium text-gray-300">{item.quantity}</td>
                          <td className="p-5">{renderBadge(item.status)}</td>
                          <td className="p-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-gray-400 hover:text-primary mr-3"><Edit2 size={16} /></button>
                            <button className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                      {activeTab === 'employees' && employees.map((emp, i) => (
                        <tr key={i} className="hover:bg-[#151515] transition-colors group">
                          <td className="p-5 text-gray-500 font-mono">{emp.id}</td>
                          <td className="p-5 font-bold text-white flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-xs">{emp.name.charAt(0)}</div>
                            {emp.name}
                          </td>
                          <td className="p-5 text-gray-400">{emp.role}</td>
                          <td className="p-5 text-gray-400">{emp.shift}</td>
                          <td className="p-5">{renderBadge(emp.attendance)}</td>
                          <td className="p-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-gray-400 hover:text-primary"><Edit2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                      {activeTab === 'finance' && finances.map((fin, i) => (
                        <tr key={i} className="hover:bg-[#151515] transition-colors group">
                          <td className="p-5 text-gray-500 font-mono">{fin.id}</td>
                          <td className="p-5">{renderBadge(fin.type)}</td>
                          <td className="p-5 text-gray-300">{fin.description}</td>
                          <td className="p-5 font-black text-white">{fin.amount}</td>
                          <td className="p-5 text-gray-400">{fin.date}</td>
                          <td className="p-5">{renderBadge(fin.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-[#222] flex justify-between items-center text-xs text-gray-500 bg-[#0a0a0a]">
                  <span>Showing 1 to 4 of 4 entries</span>
                  <div className="flex gap-1">
                    <button className="px-3 py-1 bg-[#1a1a1a] rounded hover:bg-[#222] text-white">Prev</button>
                    <button className="px-3 py-1 bg-primary text-dark-bg rounded font-bold">1</button>
                    <button className="px-3 py-1 bg-[#1a1a1a] rounded hover:bg-[#222] text-white">Next</button>
                  </div>
                </div>
              </div>
            )}

            {/* SUPPLIERS CARDS */}
            {activeTab === 'suppliers' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {suppliers.map((sup, i) => (
                  <div key={i} className="bg-[#111] border border-[#222] p-6 rounded-2xl flex flex-col gap-4 relative group hover:border-[#444] transition-colors">
                    <div className="absolute top-6 right-6">
                      {renderBadge(sup.status)}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-gray-400">
                        <Truck size={24} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-mono mb-1">{sup.id}</p>
                        <h3 className="text-xl font-bold text-white">{sup.name}</h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#222]">
                        <p className="text-xs text-gray-500 mb-1">Supplies</p>
                        <p className="text-sm font-bold text-white">{sup.supply}</p>
                      </div>
                      <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#222]">
                        <p className="text-xs text-gray-500 mb-1">Contact</p>
                        <p className="text-sm font-bold text-white">{sup.contact}</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-4 border-t border-[#222] flex justify-between items-center">
                      <p className="text-sm text-gray-400">Next Delivery: <span className="font-bold text-white">{sup.nextDelivery}</span></p>
                      <button className="text-primary font-bold text-sm hover:underline">View History</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

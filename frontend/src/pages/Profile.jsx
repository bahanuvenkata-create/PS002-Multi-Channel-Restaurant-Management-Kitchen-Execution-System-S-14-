import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Globe, Flame, Utensils, DollarSign, Heart, ShieldAlert, Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { SUPPORTED_LANGUAGES } from '../services/i18n';
import { setActiveLocation } from '../utils/locationService';

export default function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    profilePhoto: '',
    preferredLanguage: 'en',
    foodPreference: 'Any',
    cuisinePreference: 'Andhra, South Indian',
    spiceLevel: 'Medium',
    budget: 'Medium',
    addresses: '[]',
    favoriteFoods: '',
    allergies: ''
  });

  const [addressList, setAddressList] = useState([]);
  const [newLabel, setNewLabel] = useState('Home');
  const [newAddressText, setNewAddressText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const stored = localStorage.getItem('user');
      const email = stored ? JSON.parse(stored).email : 'customer@bistrobyte.com';
      const res = await api.get(`/auth/profile?email=${email}`);
      if (res.data) {
        setProfile(res.data);
        try {
          const parsed = JSON.parse(res.data.addresses || '[]');
          const addrs = Array.isArray(parsed) ? parsed : [];
          setAddressList(addrs);
          if (addrs.length > 0 && !localStorage.getItem('bistrobyte_location')) {
            setActiveLocation({
              displayName: addrs[0].address,
              city: addrs[0].label || 'Home',
              isManual: true,
              source: 'account'
            });
          }
        } catch (e) {
          setAddressList([{ id: 1, label: 'Home', address: res.data.addresses || 'Main Campus Road' }]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const updated = {
        ...profile,
        addresses: JSON.stringify(addressList)
      };
      await api.put('/auth/profile', updated);
      if (addressList.length > 0 && addressList[0].address) {
        setActiveLocation({
          displayName: addressList[0].address,
          city: addressList[0].label || 'Home',
          isManual: true,
          source: 'account'
        });
      }
      setSuccessMsg('Profile and taste preferences saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = () => {
    if (!newAddressText.trim()) return;
    const item = {
      id: Date.now(),
      label: newLabel,
      address: newAddressText.trim()
    };
    const next = [...addressList, item];
    setAddressList(next);
    setNewAddressText('');
  };

  const handleRemoveAddress = (id) => {
    setAddressList(addressList.filter(a => a.id !== id));
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-cream tracking-tight">My Profile & Taste Settings</h1>
          <p className="text-soft text-sm mt-1">Manage your identity, delivery addresses, and personalized AI food taste preferences.</p>
        </div>
        {successMsg && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2 rounded-xl text-sm font-semibold animate-fade-in">
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Information Card */}
        <div className="bg-dark-card border border-dark-border rounded-3xl p-6 md:p-8 shadow-xl">
          <h2 className="text-xl font-bold text-cream mb-6 flex items-center gap-2">
            <User className="text-primary" size={22} /> Account Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Full Name</label>
              <input 
                type="text" 
                value={profile.name || ''} 
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Email Address</label>
              <input 
                type="email" 
                disabled 
                value={profile.email || ''} 
                className="w-full bg-dark-bg/50 border border-dark-border rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Phone Number</label>
              <input 
                type="text" 
                value={profile.phone || ''} 
                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+91-9876543210"
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Preferred Language</label>
              <select
                value={profile.preferredLanguage || 'en'}
                onChange={e => setProfile({ ...profile, preferredLanguage: e.target.value })}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.native} ({lang.label})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Food Taste Profile Card */}
        <div className="bg-dark-card border border-dark-border rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="text-orange-500" size={24} />
            <h2 className="text-xl font-bold text-cream">My Taste & Food Profile</h2>
          </div>
          <p className="text-xs text-soft mb-6">BistroByte AI and recommendations use this to curate your meal discovery.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Dietary Type</label>
              <select
                value={profile.foodPreference || 'Any'}
                onChange={e => setProfile({ ...profile, foodPreference: e.target.value })}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary font-medium"
              >
                <option value="Any">Any / Mixed</option>
                <option value="Veg">Vegetarian Only</option>
                <option value="Non-Veg">Non-Vegetarian</option>
                <option value="Vegan">Strict Vegan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Spice Level Preference</label>
              <select
                value={profile.spiceLevel || 'Medium'}
                onChange={e => setProfile({ ...profile, spiceLevel: e.target.value })}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary font-medium"
              >
                <option value="Mild">Mild 🍃</option>
                <option value="Medium">Medium 🌶️</option>
                <option value="Spicy">Spicy / Authentic Karam 🔥</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Budget Orientation</label>
              <select
                value={profile.budget || 'Medium'}
                onChange={e => setProfile({ ...profile, budget: e.target.value })}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary font-medium"
              >
                <option value="Low">Budget Friendly</option>
                <option value="Medium">Regular / Balanced</option>
                <option value="Premium">Premium Fine Dining</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Preferred Regional Cuisines</label>
              <input 
                type="text"
                value={profile.cuisinePreference || ''}
                onChange={e => setProfile({ ...profile, cuisinePreference: e.target.value })}
                placeholder="e.g. Andhra, South Indian, Punjabi, Italian"
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Favorite Foods</label>
              <input 
                type="text"
                value={profile.favoriteFoods || ''}
                onChange={e => setProfile({ ...profile, favoriteFoods: e.target.value })}
                placeholder="e.g. Hyderabadi Dum Biryani, Ghee Roast Dosa, Dal Makhani"
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase">Food Exclusions / Allergies (Optional)</label>
              <input 
                type="text"
                value={profile.allergies || ''}
                onChange={e => setProfile({ ...profile, allergies: e.target.value })}
                placeholder="e.g. No Peanuts, Gluten-Free, Low Oil"
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary text-sm"
              />
            </div>
          </div>
        </div>

        {/* Addresses Management */}
        <div className="bg-dark-card border border-dark-border rounded-3xl p-6 md:p-8 shadow-xl">
          <h2 className="text-xl font-bold text-cream mb-4 flex items-center gap-2">
            <MapPin className="text-primary" size={22} /> Delivery Addresses
          </h2>

          <div className="space-y-3 mb-6">
            {addressList.map(addr => (
              <div key={addr.id} className="flex justify-between items-center bg-dark-bg border border-dark-border p-4 rounded-2xl">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md inline-block mb-1">
                    {addr.label}
                  </span>
                  <p className="text-sm font-medium text-gray-200">{addr.address}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAddress(addr.id)}
                  className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Address Form */}
          <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-dark-border">
            <select
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              className="bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="College">College</option>
              <option value="Other">Other</option>
            </select>
            <input 
              type="text" 
              placeholder="Enter full address, street, landmark..."
              value={newAddressText}
              onChange={e => setNewAddressText(e.target.value)}
              className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={handleAddAddress}
              className="px-5 py-2.5 rounded-xl bg-dark-bg hover:bg-dark-border border border-dark-border text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={16} /> Add Address
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2 px-8 py-3.5 text-base shadow-xl shadow-primary/30"
          >
            <Save size={18} />
            {saving ? 'Saving Changes...' : 'Save Profile & Taste Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

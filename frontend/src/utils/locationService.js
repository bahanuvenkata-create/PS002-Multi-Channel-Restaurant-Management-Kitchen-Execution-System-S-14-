// Centralized Location & Delivery Address Service for BistroByte

export const DEFAULT_CAMPUS_LOCATION = {
  lat: 16.4450,
  lon: 80.6250,
  displayName: 'KL University, Vaddeswaram',
  city: 'Vaddeswaram',
  isManual: true,
  isDefault: true
};

export const DEFAULT_PRESET_ADDRESSES = [
  {
    id: 'addr-default-1',
    label: 'Campus / Hostel',
    address: 'KL University Main Campus Gate 2, Vaddeswaram, Guntur 522502',
    room: 'Gate 2 / Delivery Point',
    phone: '+91-9848012345',
    isPrimary: true
  },
  {
    id: 'addr-default-2',
    label: 'Home',
    address: '14/2 Benz Circle, MG Road, Vijayawada, AP 520008',
    room: 'Flat 302, Sri Sai Residency',
    phone: '+91-9848012345',
    isPrimary: false
  }
];

/**
 * Get active location.
 * Priority:
 * 1. Saved localStorage 'bistrobyte_location'
 * 2. Logged-in user account location / address
 * 3. Default campus location
 */
export const getActiveLocation = () => {
  try {
    const stored = localStorage.getItem('bistrobyte_location');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && (parsed.displayName || parsed.lat)) {
        return parsed;
      }
    }

    // Check account location if logged in
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.addresses) {
        let addrs = [];
        try {
          addrs = typeof user.addresses === 'string' ? JSON.parse(user.addresses) : user.addresses;
        } catch (e) {
          // ignore parsing error
        }
        if (Array.isArray(addrs) && addrs.length > 0 && addrs[0].address) {
          const accountLoc = {
            lat: 16.4450,
            lon: 80.6250,
            displayName: addrs[0].address,
            city: addrs[0].label || 'Account Address',
            isManual: true,
            source: 'account'
          };
          localStorage.setItem('bistrobyte_location', JSON.stringify(accountLoc));
          return accountLoc;
        }
      }
    }
  } catch (err) {
    console.warn('Failed to retrieve active location:', err);
  }

  // Fallback to default university campus
  return DEFAULT_CAMPUS_LOCATION;
};

/**
 * Save active location and broadcast event to all listeners
 */
export const setActiveLocation = (locationObj) => {
  if (!locationObj) return;
  try {
    const dataToSave = {
      ...locationObj,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('bistrobyte_location', JSON.stringify(dataToSave));
    window.dispatchEvent(new CustomEvent('location-change', { detail: dataToSave }));
  } catch (err) {
    console.error('Failed to save active location:', err);
  }
};

/**
 * Format compact label for Navbar or header
 */
export const formatLocationLabel = (loc) => {
  if (!loc) return '📍 Select Location';
  if (loc.displayName) {
    // If long, strip extra commas or return first two parts
    const parts = loc.displayName.split(',');
    if (parts.length > 2) {
      return `📍 ${parts[0].trim()}, ${parts[1].trim()}`;
    }
    return `📍 ${loc.displayName}`;
  }
  if (loc.city) return `📍 ${loc.city}`;
  if (loc.lat && loc.lon) return `📍 GPS (${loc.lat.toFixed(2)}, ${loc.lon.toFixed(2)})`;
  return '📍 KL University, Vaddeswaram';
};

/**
 * Retrieve saved delivery addresses from:
 * 1. Logged in user profile (addresses field)
 * 2. Locally saved addresses in localStorage 'bistrobyte_saved_addresses'
 * 3. Default preset addresses
 */
export const getSavedDeliveryAddresses = () => {
  const result = [];
  const addedIds = new Set();

  // 1. Account addresses
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.addresses) {
        let addrs = [];
        try {
          addrs = typeof user.addresses === 'string' ? JSON.parse(user.addresses) : user.addresses;
        } catch (e) {}
        if (Array.isArray(addrs)) {
          addrs.forEach((a, idx) => {
            const id = a.id ? `acc-${a.id}` : `acc-${idx}`;
            if (!addedIds.has(id) && a.address) {
              addedIds.add(id);
              result.push({
                id,
                label: a.label || `Account Address ${idx + 1}`,
                address: a.address,
                room: a.room || '',
                phone: user.phone || '',
                source: 'account'
              });
            }
          });
        }
      }
    }
  } catch (e) {
    console.warn('Error reading account addresses', e);
  }

  // 2. Custom local saved addresses
  try {
    const localAddrsStr = localStorage.getItem('bistrobyte_saved_addresses');
    if (localAddrsStr) {
      const localAddrs = JSON.parse(localAddrsStr);
      if (Array.isArray(localAddrs)) {
        localAddrs.forEach(a => {
          if (a && a.id && !addedIds.has(a.id) && a.address) {
            addedIds.add(a.id);
            result.push(a);
          }
        });
      }
    }
  } catch (e) {}

  // 3. Fallback defaults if none or minimal
  DEFAULT_PRESET_ADDRESSES.forEach(def => {
    if (!addedIds.has(def.id)) {
      result.push(def);
      addedIds.add(def.id);
    }
  });

  return result;
};

/**
 * Save a new custom address to local storage
 */
export const saveCustomDeliveryAddress = (newAddr) => {
  try {
    const existing = getSavedDeliveryAddresses();
    const item = {
      id: newAddr.id || `custom-${Date.now()}`,
      label: newAddr.label || 'Custom Address',
      address: newAddr.address,
      room: newAddr.room || '',
      phone: newAddr.phone || '',
      instructions: newAddr.instructions || '',
      createdAt: new Date().toISOString()
    };

    const nextList = [item, ...existing.filter(a => a.id !== item.id)];
    localStorage.setItem('bistrobyte_saved_addresses', JSON.stringify(nextList));

    // Also update active location to this address
    setActiveLocation({
      displayName: item.address,
      city: item.label,
      isManual: true,
      source: 'custom_address'
    });

    return item;
  } catch (err) {
    console.error('Failed to save custom delivery address:', err);
    return null;
  }
};

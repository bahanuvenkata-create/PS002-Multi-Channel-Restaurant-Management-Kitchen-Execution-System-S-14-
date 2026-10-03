import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to calculate distance in km using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c; 
  return parseFloat(d.toFixed(1));
};

// Format distance for user display: "650 m" or "1.2 km"
export const formatDistance = (distKm) => {
  if (distKm === null || distKm === undefined) return 'Calculating...';
  if (distKm < 1.0) {
    return `${Math.round(distKm * 1000)} m`;
  }
  return `${distKm.toFixed(1)} km`;
};

// Restaurants & Real Places
export const getRestaurants = async () => {
  const response = await api.get('/restaurants/all');
  return response.data;
};

export const getNearbyRestaurants = async (lat, lon, radius = 15.0) => {
  const response = await api.get(`/restaurants/nearby?lat=${lat}&lon=${lon}&radius=${radius}`);
  return response.data;
};

export const searchRestaurants = async (query, lat, lon) => {
  let url = `/restaurants/search?query=${encodeURIComponent(query)}`;
  if (lat && lon) {
    url += `&lat=${lat}&lon=${lon}`;
  }
  const response = await api.get(url);
  return response.data;
};

export const geocodeLocation = async (address) => {
  const response = await api.post('/restaurants/geocode', { address });
  return response.data;
};

export const getRestaurantById = async (id) => {
  const response = await api.get(`/restaurants/${id}`);
  return response.data;
};

export const getMenuByRestaurant = async (id) => {
  const response = await api.get(`/menu/restaurant/${id}`);
  return response.data;
};

// Orders, Invoicing & Payments
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getMyOrders = async (email) => {
  const url = email ? `/orders/my?email=${encodeURIComponent(email)}` : '/orders/my';
  const response = await api.get(url);
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const getLiveTracking = async (orderNumber) => {
  const response = await api.get(`/orders/track?orderNumber=${encodeURIComponent(orderNumber)}`);
  return response.data;
};

export const getOrderInvoice = async (id) => {
  const response = await api.get(`/orders/${id}/invoice`);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/orders/${id}/status?status=${encodeURIComponent(status)}`);
  return response.data;
};

export const processPayment = async (paymentData) => {
  const response = await api.post('/payments/process', paymentData);
  return response.data;
};

// Customer Reviews
export const submitReview = async (reviewData) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

export const getRestaurantReviews = async (restaurantId) => {
  const response = await api.get(`/reviews/restaurant/${restaurantId}`);
  return response.data;
};

// User Profile & Preferences
export const getProfile = async (email) => {
  const url = email ? `/auth/profile?email=${encodeURIComponent(email)}` : '/auth/profile';
  const response = await api.get(url);
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};

// Staff & Operations
export const staffLogin = async (credentials) => {
  const response = await api.post('/auth/staff/login', credentials);
  return response.data;
};

export const getStaffByRestaurant = async (restaurantId) => {
  const response = await api.get(`/auth/staff/restaurant/${restaurantId}`);
  return response.data;
};

export const addStaff = async (staffData) => {
  const response = await api.post('/auth/staff', staffData);
  return response.data;
};

export const deactivateStaff = async (staffId) => {
  const response = await api.delete(`/auth/staff/${staffId}`);
  return response.data;
};

// Tables & Reservations
export const reserveTable = async (data) => {
  const response = await api.post('/tables/reserve', data);
  return response.data;
};

// Tiffin Subscriptions
export const subscribeTiffin = async (data) => {
  const response = await api.post('/tiffins/subscribe', data);
  return response.data;
};

export default api;

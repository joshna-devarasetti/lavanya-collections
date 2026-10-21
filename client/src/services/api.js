const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('lavanya_token');

  const headers = {
    ...(!options.isFormData && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  if (options.body && !options.isFormData) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.message || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err.message);
    throw err;
  }
};

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  adminLogin: (body) => request('/auth/admin-login', { method: 'POST', body }),
  getMe: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/profile', { method: 'PUT', body }),
  updateCredentials: (body) => request('/auth/update-credentials', { method: 'PUT', body }),
  addAddress: (body) => request('/auth/addresses', { method: 'POST', body }),

  // Categories
  getCategories: () => request('/categories'),
  getAdminCategories: () => request('/categories/admin/all'),
  createCategory: (body) => request('/categories', { method: 'POST', body }),
  updateCategory: (id, body) => request(`/categories/${id}`, { method: 'PUT', body }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  // Products
  getProducts: (params = '') => request(`/products${params ? `?${params}` : ''}`),
  getProduct: (slugOrId) => request(`/products/${slugOrId}`),
  checkRentalAvailability: (id, start, end) =>
    request(`/products/${id}/rental-availability?startDate=${start}&endDate=${end}`),
  getAdminProducts: () => request('/products/admin/all'),
  createProduct: (body) => request('/products', { method: 'POST', body }),
  updateProduct: (id, body) => request(`/products/${id}`, { method: 'PUT', body }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  uploadProductImage: (formData) =>
    request('/products/upload-image', { method: 'POST', body: formData, isFormData: true }),

  // Orders
  calculateOrder: (body) => request('/orders/calculate', { method: 'POST', body }),
  createOrder: (body) => request('/orders', { method: 'POST', body }),
  getMyOrders: () => request('/orders/my-orders'),
  getMyOrderDetail: (id) => request(`/orders/my-orders/${id}`),
  getAdminOrders: (params = '') => request(`/orders/admin/all${params ? `?${params}` : ''}`),
  getAdminOrderDetail: (id) => request(`/orders/admin/${id}`),
  updateOrderStatus: (id, body) => request(`/orders/admin/${id}/status`, { method: 'PUT', body }),
  updateTracking: (id, body) => request(`/orders/admin/${id}/tracking`, { method: 'PUT', body }),

  // Payments
  initiatePayment: (body) => request('/payments/create-order', { method: 'POST', body }),
  verifyPayment: (body) => request('/payments/verify', { method: 'POST', body }),
  getAdminPayments: (params = '') => request(`/payments/admin/all${params ? `?${params}` : ''}`),

  // Rentals
  getAdminRentals: (params = '') => request(`/rentals/admin/all${params ? `?${params}` : ''}`),
  updateRentalStatus: (id, body) => request(`/rentals/admin/${id}/status`, { method: 'PUT', body }),
  recordRentalReturn: (id, body) => request(`/rentals/admin/${id}/return`, { method: 'PUT', body }),

  // Custom Requests
  submitCustomRequest: (body) => request('/custom-requests', { method: 'POST', body }),
  uploadReferenceImage: (formData) =>
    request('/custom-requests/upload-reference', { method: 'POST', body: formData, isFormData: true }),
  getMyCustomRequests: () => request('/custom-requests/my-requests'),
  getMyCustomRequestDetail: (id) => request(`/custom-requests/my-requests/${id}`),
  respondToQuotation: (id, body) => request(`/custom-requests/${id}/respond-quotation`, { method: 'POST', body }),
  getAdminCustomRequests: (params = '') => request(`/custom-requests/admin/all${params ? `?${params}` : ''}`),
  issueQuotation: (id, body) => request(`/custom-requests/admin/${id}/quotation`, { method: 'POST', body }),
  updateCustomRequestStatus: (id, body) => request(`/custom-requests/admin/${id}/status`, { method: 'PUT', body }),

  // Dashboard & Settings
  getDashboardMetrics: () => request('/dashboard/metrics'),
  getSettings: () => request('/settings'),
  updateSettings: (body) => request('/settings', { method: 'PUT', body }),

  // Notifications
  getAdminNotifications: () => request('/notifications/admin'),
  getCustomerNotifications: () => request('/notifications/customer'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/mark-all-read', { method: 'PUT' })
};

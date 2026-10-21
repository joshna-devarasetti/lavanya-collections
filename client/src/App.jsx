import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { ShopPage } from './pages/customer/ShopPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { CartPage } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { CustomDesignPage } from './pages/customer/CustomDesignPage';
import { AccountPage } from './pages/customer/AccountPage';
import { RentalCatalogPage } from './pages/customer/RentalCatalogPage';
import { ContactPage } from './pages/customer/ContactPage';
import { PoliciesPage } from './pages/customer/PoliciesPage';
import { LoginPage } from './pages/customer/LoginPage';
import { RegisterPage } from './pages/customer/RegisterPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminProductEditPage } from './pages/admin/AdminProductEditPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminRentalsPage } from './pages/admin/AdminRentalsPage';
import { AdminCustomRequestsPage } from './pages/admin/AdminCustomRequestsPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminDeliveryPage } from './pages/admin/AdminDeliveryPage';
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export const App = () => {
  return (
    <Routes>
      {/* Customer Storefront Routes */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="product/:slugOrId" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="rentals" element={<RentalCatalogPage />} />
        <Route path="custom-orders" element={<CustomDesignPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="account/orders" element={<AccountPage />} />
        <Route path="account/custom-requests" element={<AccountPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="policies" element={<PoliciesPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      {/* Admin Portal Authentication */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin Dashboard Protected Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductEditPage />} />
        <Route path="products/edit/:id" element={<AdminProductEditPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="rentals" element={<AdminRentalsPage />} />
        <Route path="custom-requests" element={<AdminCustomRequestsPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="delivery" element={<AdminDeliveryPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CustomerOrderProvider } from './context/CustomerOrderContext.tsx';
import { AdminAuthProvider } from './context/AdminAuthContext.tsx';
import { CustomerLayout } from './layouts/CustomerLayout.tsx';
import { AdminLayout } from './layouts/AdminLayout.tsx';
import { ProtectedAdminRoute } from './components/admin/ProtectedAdminRoute.tsx';
import { CustomerMenuPage } from './pages/customer/CustomerMenuPage.tsx';
import { OrderTrackingPage } from './pages/customer/OrderTrackingPage.tsx';
import { AdminLoginPage } from './pages/admin/AdminLoginPage.tsx';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.tsx';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage.tsx';
import { AdminMenuPage } from './pages/admin/AdminMenuPage.tsx';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage.tsx';
import { AdminTablesPage } from './pages/admin/AdminTablesPage.tsx';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage.tsx';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===================================================================
            CUSTOMER ROUTES
            Strictly customer-facing: No admin links, owner toggles, or controls.
            Automatic table detection via :tableToken URL param.
            =================================================================== */}
        <Route
          element={
            <CustomerOrderProvider>
              <CustomerLayout />
            </CustomerOrderProvider>
          }
        >
          {/* Default entry redirects to Table 06 demo */}
          <Route
            path="/"
            element={<Navigate to="/menu/cozybite-cafe/table/tok-tbl-06-8d1a" replace />}
          />
          <Route path="/menu/:restaurantSlug" element={<CustomerMenuPage />} />
          <Route path="/menu/:restaurantSlug/table/:tableToken" element={<CustomerMenuPage />} />
          <Route path="/order/:orderId" element={<OrderTrackingPage />} />
          <Route path="/track/:orderId" element={<OrderTrackingPage />} />
        </Route>

        {/* ===================================================================
            ADMIN AUTHENTICATION ROUTE
            Independent login screen for kitchen staff and owners.
            =================================================================== */}
        <Route
          path="/admin/login"
          element={
            <AdminAuthProvider>
              <AdminLoginPage />
            </AdminAuthProvider>
          }
        />

        {/* ===================================================================
            PROTECTED ADMIN DASHBOARD ROUTES
            Enforces real HTTP-only cookie authentication via ProtectedAdminRoute.
            Completely separate layout (AdminLayout) with dedicated sidebar & KOT.
            =================================================================== */}
        <Route
          element={
            <AdminAuthProvider>
              <ProtectedAdminRoute />
            </AdminAuthProvider>
          }
        >
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/menu" element={<AdminMenuPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/tables" element={<AdminTablesPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        {/* Catch-all Fallback */}
        <Route
          path="*"
          element={<Navigate to="/menu/cozybite-cafe/table/tok-tbl-06-8d1a" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

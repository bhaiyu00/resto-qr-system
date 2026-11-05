import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface AdminUser {
  id: string;
  restaurantId: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'chef';
}

export interface RestaurantInfo {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  address: string;
  contact: string;
  settings: {
    gstRate: number;
    defaultPrepTime: number;
    isAcceptingOrders: boolean;
  };
}

interface AdminAuthContextType {
  user: AdminUser | null;
  restaurant: RestaurantInfo | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  setAuthSession: (token: string, user: AdminUser, restaurant?: RestaurantInfo) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const checkAuth = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('cozybite_admin_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/admin/me', {
        headers,
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setRestaurant(data.restaurant);
        return true;
      } else {
        if (res.status === 401) {
          localStorage.removeItem('cozybite_admin_token');
        }
        setUser(null);
        setRestaurant(null);
        return false;
      }
    } catch {
      setUser(null);
      setRestaurant(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const setAuthSession = (token: string, newUser: AdminUser, newRestaurant?: RestaurantInfo) => {
    localStorage.setItem('cozybite_admin_token', token);
    setUser(newUser);
    if (newRestaurant) {
      setRestaurant(newRestaurant);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = async () => {
    try {
      const token = localStorage.getItem('cozybite_admin_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/admin/logout', {
        method: 'POST',
        headers,
        credentials: 'include',
      });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('cozybite_admin_token');
      setUser(null);
      setRestaurant(null);
      navigate('/admin/login', { replace: true });
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        restaurant,
        isLoading,
        logout,
        refreshAuth: checkAuth,
        setAuthSession,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

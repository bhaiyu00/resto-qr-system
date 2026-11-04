import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext.tsx';
import { ChefHat } from 'lucide-react';

export const ProtectedAdminRoute: React.FC = () => {
  const { user, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1C1613] flex flex-col items-center justify-center text-[#F2ECE6] p-4">
        <div className="relative mb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#C85A32] flex items-center justify-center text-white shadow-lg animate-pulse">
            <ChefHat className="w-7 h-7" />
          </div>
        </div>
        <p className="text-sm font-medium text-[#C5B5A5]">Verifying Kitchen Staff Credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

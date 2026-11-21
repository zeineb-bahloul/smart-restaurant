import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';

const AdminRoute = () => {
  const user = useAuthStore((state) => state.user);
  
  return user && user.role === 'ADMIN' ? <Outlet /> : <Navigate to="/menu" replace />;
};

export default AdminRoute;

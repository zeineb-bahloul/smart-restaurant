import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.js';
import PrivateRoute from './components/PrivateRoute.js';
import AdminRoute from './components/AdminRoute.js';
import ChatWidget from './components/chat/ChatWidget.js';

// Pages
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import Menu from './pages/Menu.js';
import Orders from './pages/Orders.js';
import Reservations from './pages/Reservations.js';
import Dashboard from './pages/Dashboard.js';

// Global Authentication State
import useAuthStore from './store/authStore.js';

function App() {
  const token = useAuthStore((state) => state.token);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col font-sans select-none">
        
        {/* Render navigation bar on all pages if authenticated */}
        {token && <Navbar />}

        {/* Content routing system */}
        <main className="flex-1">
          <Routes>
            {/* Public Access */}
            <Route path="/login" element={!token ? <Login /> : <Navigate to="/menu" replace />} />
            <Route path="/register" element={!token ? <Register /> : <Navigate to="/menu" replace />} />

            {/* Authenticated Client/Staff Guard */}
            <Route element={<PrivateRoute />}>
              <Route path="/menu" element={<Menu />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/reservations" element={<Reservations />} />
            </Route>

            {/* Authenticated Admin Guard */}
            <Route element={<AdminRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            {/* Wildcard redirects */}
            <Route path="/" element={<Navigate to="/menu" replace />} />
            <Route path="*" element={<Navigate to="/menu" replace />} />
          </Routes>
        </main>

        {/* Floating AI Chat Assistant - Appears on all pages if logged in */}
        {token && <ChatWidget />}

      </div>
    </BrowserRouter>
  );
}

export default App;

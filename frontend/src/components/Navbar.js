import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-effect sticky top-0 z-50 px-6 py-4 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-3xl group-hover:scale-110 transition-transform duration-300">🍽️</span>
          <span className="text-xl font-bold tracking-tight text-white">
            Le Gourmet <span className="text-amber-500">Smart</span>
          </span>
        </Link>

        {/* Links */}
        {user && (
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/menu"
              className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                isActive('/menu')
                  ? 'text-amber-500 bg-amber-500/10 shadow-sm border border-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Menu
            </Link>
            
            <Link
              to="/orders"
              className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                isActive('/orders')
                  ? 'text-amber-500 bg-amber-500/10 shadow-sm border border-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {user.role === 'ADMIN' || user.role === 'STAFF' ? 'Gérer les Commandes' : 'Mes Commandes'}
            </Link>

            <Link
              to="/reservations"
              className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                isActive('/reservations')
                  ? 'text-amber-500 bg-amber-500/10 shadow-sm border border-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {user.role === 'ADMIN' ? 'Gérer les Réservations' : 'Réservations'}
            </Link>

            {user.role === 'ADMIN' && (
              <Link
                to="/dashboard"
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  isActive('/dashboard')
                    ? 'text-amber-500 bg-amber-500/10 shadow-sm border border-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>
        )}

        {/* User profile / Logout */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Profile Badge */}
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold text-slate-100">{user.name}</span>
                <span className="text-xs font-medium text-amber-500/80 px-2 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/10 mt-0.5">
                  {user.role}
                </span>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center font-bold text-white shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              
              <button
                onClick={handleLogout}
                className="ml-2 px-4 py-2 text-sm font-semibold text-white bg-red-600/80 hover:bg-red-600 border border-red-500/10 rounded-lg shadow transition-all duration-300 hover:scale-[1.02]"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition"
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow transition-all duration-300 hover:scale-[1.02]"
              >
                Créer un compte
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import api from '../api/axios.js';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const loginStore = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, id, name, role } = response.data;
      
      // Save credentials in Zustand + LocalStorage
      loginStore({ id, name, email, role }, token);
      
      // Redirect according to user role
      if (role === 'ADMIN') {
        navigate('/dashboard');
      } else if (role === 'STAFF') {
        navigate('/orders');
      } else {
        navigate('/menu');
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Impossible de s'authentifier. Vérifiez vos identifiants ou votre connexion.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-dark-950 via-slate-900 to-dark-950 px-4">
      <div className="w-full max-w-md p-8 rounded-3xl glass-effect shadow-2xl border border-white/10 animate-fade-in">
        
        {/* Brand/Header */}
        <div className="text-center mb-8">
          <span className="text-5xl block mb-2">🍽️</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-1">
            Le Gourmet <span className="text-gradient font-black">Smart</span>
          </h2>
          <p className="text-slate-400 text-sm">Bienvenue ! Connectez-vous à votre espace.</p>
        </div>

        {/* Errors alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 mb-6 text-sm flex items-start gap-2 animate-shake">
            <span className="text-lg">⚠️</span>
            <div>{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2" htmlFor="email">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="votre.email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-slate-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-slate-500"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/10 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center text-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Connexion en cours...
              </span>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Redirect Footer */}
        <div className="mt-8 text-center text-sm text-slate-400">
          Nouveau chez nous ?{' '}
          <Link to="/register" className="text-amber-500 font-semibold hover:underline">
            Créer un compte
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;

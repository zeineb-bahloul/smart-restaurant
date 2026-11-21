import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/auth/register', { name, email, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("L'inscription a échoué. Cet e-mail est peut-être déjà utilisé.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-dark-950 via-slate-900 to-dark-950 px-4">
      <div className="w-full max-w-md p-8 rounded-3xl glass-effect shadow-2xl border border-white/10 animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-5xl block mb-2">✍️</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-1">
            Créer un <span className="text-gradient font-black">Compte</span>
          </h2>
          <p className="text-slate-400 text-sm">Rejoignez-nous et savourez vos plats favoris.</p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-4 mb-6 text-sm flex items-start gap-2">
            <span className="text-lg">🎉</span>
            <div>Inscription réussie ! Redirection vers la page de connexion...</div>
          </div>
        )}

        {/* Errors Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 mb-6 text-sm flex items-start gap-2 animate-shake">
            <span className="text-lg">⚠️</span>
            <div>{error}</div>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-1" htmlFor="name">
              Nom complet
            </label>
            <input
              id="name"
              type="text"
              placeholder="Ex: Sophie Martin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-500"
              disabled={loading || success}
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-1" htmlFor="email">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="votre.email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-500"
              disabled={loading || success}
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-1" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              placeholder="Au moins 6 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-500"
              disabled={loading || success}
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-1" htmlFor="confirmPassword">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Répétez le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-500"
              disabled={loading || success}
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center text-sm mt-6"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Création en cours...
              </span>
            ) : (
              'Créer un compte'
            )}
          </button>
        </form>

        {/* Redirect Footer */}
        <div className="mt-6 text-center text-sm text-slate-400">
          Vous avez déjà un compte ?{' '}
          <Link to="/login" className="text-amber-500 font-semibold hover:underline">
            Se connecter
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;

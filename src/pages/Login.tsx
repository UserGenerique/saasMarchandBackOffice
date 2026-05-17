import { useState, type FormEvent } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(phone, password);
      navigate('/');
    } catch {
      setError('Identifiants incorrects ou accès non autorisé');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center text-2xl font-bold mx-auto">T</div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">TissuGest Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Connectez-vous à votre espace d'administration</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          {error && <div className="text-sm text-danger-600 bg-danger-50 rounded-lg px-3 py-2">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required
              className="w-full rounded-lg border-gray-300 text-sm" placeholder="Ex: 77 000 00 00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full rounded-lg border-gray-300 text-sm" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}

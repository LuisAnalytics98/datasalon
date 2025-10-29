import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import BackToHomeButton from '../components/BackToHomeButton';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [flowType, setFlowType] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const token = params.get('access_token');
    const type = params.get('type');
    setHasToken(!!token);
    setFlowType(type);
    setReady(true);
  }, []);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut();
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err: any) {
      setError(err?.message || 'Error actualizando la contraseña');
    } finally {
      setSaving(false);
    }
  };

  if (!ready) return null;
  if (!hasToken) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-gray-900/90 border border-gray-700 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white">Enlace inválido o expirado</h2>
          <p className="mt-2 text-gray-400">Solicita un nuevo enlace desde "Olvidé mi contraseña".</p>
          <div className="mt-6">
            <BackToHomeButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-sm z-50 border-b border-yellow-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-yellow-400">DataSalon</h1>
            </div>
            <div className="flex items-center space-x-4">
              <BackToHomeButton variant="minimal" />
            </div>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center justify-center">
        <div className="relative z-10 max-w-md w-full space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold text-white">{flowType === 'recovery' ? 'Restablecer contraseña' : 'Crear contraseña'}</h2>
            <p className="mt-2 text-gray-400">
              {flowType === 'recovery' ? 'Ingresa una nueva contraseña para tu cuenta.' : 'Completa tu registro creando una contraseña.'}
            </p>
          </div>

          <div className="bg-gray-900/90 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 shadow-2xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">{error}</div>
              )}
              {success && (
                <div className="bg-emerald-900/40 border border-emerald-500 text-emerald-100 px-4 py-3 rounded-lg">Contraseña actualizada. Redirigiendo…</div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nueva contraseña</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar contraseña</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-3 px-4 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50"
              >
                {saving ? 'Guardando…' : 'Guardar contraseña'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AuthCallback;



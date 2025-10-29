import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

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
    // Supabase sends tokens in URL hash: #access_token=...&type=recovery|signup
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
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err: any) {
      setError(err?.message || 'Error updating password');
    } finally {
      setSaving(false);
    }
  };

  if (!ready) return null;
  if (!hasToken) return <div style={{ maxWidth: 420, margin: '64px auto' }}>Invalid or expired link.</div>;

  return (
    <div style={{ maxWidth: 420, margin: '64px auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2 style={{ margin: 0 }}>Set your password</h2>
      <p style={{ color: '#666' }}>{flowType === 'recovery' ? 'Reset your password to continue.' : 'Complete your signup by creating a password.'}</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginTop: 12 }}>
          <label style={{ display: 'block', fontSize: 13, color: '#444' }}>New password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a strong password"
            style={{ width: '100%', padding: '10px 12px', marginTop: 6 }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ display: 'block', fontSize: 13, color: '#444' }}>Confirm password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter your password"
            style={{ width: '100%', padding: '10px 12px', marginTop: 6 }}
          />
        </div>

        {error && <div style={{ color: '#b00020', marginTop: 10 }}>{error}</div>}
        {success && <div style={{ color: '#0a7f2e', marginTop: 10 }}>Password updated. Redirecting…</div>}

        <button
          type="submit"
          disabled={saving}
          style={{ marginTop: 16, padding: '10px 14px', background: '#e91e63', color: '#fff', border: 'none', borderRadius: 6 }}
        >
          {saving ? 'Saving…' : 'Save password'}
        </button>
      </form>
    </div>
  );
};

export default AuthCallback;



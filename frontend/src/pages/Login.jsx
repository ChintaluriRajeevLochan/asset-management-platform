import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      setAuth(data.user, data.token);
      toast.success('Welcome back!');
      navigate(data.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'system-ui, sans-serif' }}>
      {/* Left Panel */}
      <div style={{
        width: '45%', background: '#1c1c1e', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '3rem', color: '#fff'
      }} className="hidden-mobile">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, background: '#d97706', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
            </svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 18, letterSpacing: '-0.3px' }}>AssetFlow</span>
        </div>

        {/* Center content */}
        <div>
          <div style={{
            display: 'inline-block', background: '#292929', color: '#d97706',
            fontSize: 12, fontWeight: 600, letterSpacing: '0.08em',
            padding: '4px 10px', borderRadius: 4, marginBottom: '1.5rem',
            textTransform: 'uppercase'
          }}>
            Asset Management Platform
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2, margin: '0 0 1rem', color: '#fff' }}>
            Track every asset.<br />
            <span style={{ color: '#d97706' }}>Zero guesswork.</span>
          </h2>
          <p style={{ color: '#888', fontSize: 15, lineHeight: 1.6 }}>
            From cameras to stage props — manage inventory, approvals, and returns all in one place.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem' }}>
            {[['Inventory', 'Tracked'], ['Bookings', 'Managed'], ['Returns', 'Logged']].map(([n, l]) => (
              <div key={n}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{n}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: '#444', fontSize: 12 }}>© 2024 AssetFlow · IIT Roorkee</p>
      </div>

      {/* Right Panel - Login Form */}
      <div style={{
        flex: 1, background: '#f5f4f0', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '2rem'
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111', margin: '0 0 0.5rem' }}>
              Sign in
            </h1>
            <p style={{ color: '#888', fontSize: 14, margin: 0 }}>
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                style={{
                  width: '100%', padding: '10px 14px', fontSize: 14,
                  border: '1.5px solid #ddd', borderRadius: 8, background: '#fff',
                  outline: 'none', boxSizing: 'border-box', color: '#111',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#d97706'}
                onBlur={e => e.target.style.borderColor = '#ddd'}
              />
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                style={{
                  width: '100%', padding: '10px 14px', fontSize: 14,
                  border: '1.5px solid #ddd', borderRadius: 8, background: '#fff',
                  outline: 'none', boxSizing: 'border-box', color: '#111',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#d97706'}
                onBlur={e => e.target.style.borderColor = '#ddd'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '11px', background: loading ? '#aaa' : '#1c1c1e',
                color: '#fff', border: 'none', borderRadius: 8, fontSize: 15,
                fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => { if (!loading) e.target.style.background = '#d97706'; }}
              onMouseLeave={e => { if (!loading) e.target.style.background = '#1c1c1e'; }}
            >
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#888', marginTop: '1.5rem' }}>
            No account?{' '}
            <Link to="/register" style={{ color: '#d97706', fontWeight: 600, textDecoration: 'none' }}>
              Register here
            </Link>
          </p>

          {/* Demo hint */}
          <div style={{
            marginTop: '2rem', padding: '12px 16px', background: '#ede9d8',
            borderRadius: 8, borderLeft: '3px solid #d97706'
          }}>
            <p style={{ fontSize: 12, color: '#666', margin: '0 0 4px', fontWeight: 600 }}>Demo admin</p>
            <p style={{ fontSize: 12, color: '#888', margin: 0 }}>admin@iitroorkee.ac.in · Admin@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
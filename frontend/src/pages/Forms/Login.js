import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import Logo from '../../components/Logo';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const goAfterLogin = (user) => {
    const dest = location.state?.from?.pathname || (user.role === 'admin' ? '/admin' : '/profile');
    navigate(dest, { replace: true });
  };

  const handleGoogle = async (credential) => {
    setError('');
    try {
      goAfterLogin(await loginWithGoogle(credential));
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      goAfterLogin(await login(formData.email.trim(), formData.password));
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 relative flex items-center justify-center px-5 py-12">
      <div className="aurora" />

      <div className="relative w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center mb-8">
          <Logo className="text-xl" />
        </Link>

        <div className="panel p-7">
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-sm text-slate-400 mt-1 mb-6">Sign in to continue your practice.</p>

          {error && (
            <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-2.5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input id="email" type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="you@example.com" className="field" required />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input id="password" type={showPw ? 'text' : 'password'} name="password" value={formData.password}
                  onChange={handleChange} placeholder="••••••••" className="field pr-10" required />
                <button type="button" onClick={() => setShowPw((s) => !s)} tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                    {showPw
                      ? <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A9.1 9.1 0 0112 4c5 0 9 4.5 9 8a11 11 0 01-2.2 3.3M6.1 6.1A11 11 0 003 12c0 3.5 4 8 9 8a9 9 0 003.9-.9" />
                      : <><path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>}
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-[11px] uppercase tracking-wide text-slate-500">or</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <GoogleSignInButton onCredential={handleGoogle} onError={setError} />

          <p className="mt-6 text-sm text-slate-400 text-center">
            Don't have an account? <Link to="/signup" className="text-glow-300 font-medium hover:text-glow-200">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

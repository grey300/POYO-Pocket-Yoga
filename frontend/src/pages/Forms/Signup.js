import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import Logo from '../../components/Logo';

const SignUp = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogle = async (credential) => {
    setError('');
    try {
      await loginWithGoogle(credential);
      navigate('/profile', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-up failed.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please enter your first and last name.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    const strong = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    if (!strong.test(formData.password)) {
      setError('Password needs 8+ characters with upper, lower, a number, and a special character (!@#$%^&*).');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      navigate('/profile', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 relative flex items-center justify-center px-5 py-12">
      <div className="aurora" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center mb-8">
          <Logo className="text-xl" />
        </Link>

        <div className="panel p-7">
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-sm text-slate-400 mt-1 mb-6">Start tracking your practice in minutes.</p>

          {error && (
            <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-2.5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="label">First name</label>
                <input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className="field" required />
              </div>
              <div>
                <label htmlFor="lastName" className="label">Last name</label>
                <input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className="field" required />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input id="email" type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="you@example.com" className="field" required />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <input id="password" type="password" name="password" value={formData.password} onChange={handleChange}
                placeholder="••••••••" className="field" required />
              <p className="text-[11px] text-slate-500 mt-1.5">
                8+ characters, with upper &amp; lowercase, a number, and a symbol.
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">Confirm password</label>
              <input id="confirmPassword" type="password" name="confirmPassword" value={formData.confirmPassword}
                onChange={handleChange} placeholder="••••••••" className="field" required />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-[11px] uppercase tracking-wide text-slate-500">or</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <GoogleSignInButton onCredential={handleGoogle} onError={setError} />

          <p className="mt-6 text-sm text-slate-400 text-center">
            Already have an account? <Link to="/login" className="text-glow-300 font-medium hover:text-glow-200">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

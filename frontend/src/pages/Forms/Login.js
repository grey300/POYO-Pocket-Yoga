import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/NavBar';
import image1 from '../../utils/images/pg1.png';
import { useAuth } from '../../context/AuthContext';
import GoogleSignInButton from '../../components/GoogleSignInButton';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();

  const goAfterLogin = (user) => {
    const dest = location.state?.from?.pathname || (user.role === 'admin' ? '/admin' : '/profile');
    navigate(dest, { replace: true });
  };

  const handleGoogle = async (credential) => {
    setError('');
    try {
      const user = await loginWithGoogle(credential);
      goAfterLogin(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed.');
    }
  };

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const user = await login(formData.email.trim(), formData.password);
      goAfterLogin(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex flex-col md:flex-row justify-center items-center min-h-[80vh] pt-16">
        <div className="md:w-1/2 p-6 order-1">
          <img src={image1} alt="img" className="h-auto" />
        </div>
        <div className="md:w-1/2 p-6 order-1 max-w-md">
          <p className="mb-2 font-bold text-2xl text-[#3A5A40]">Welcome back</p>
          <p className="mb-6 text-gray-600">Please sign in to your account.</p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#3A5A40]"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#3A5A40]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3A5A40] text-white py-2.5 px-4 rounded-lg hover:bg-[#242F2A] disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          <GoogleSignInButton onCredential={handleGoogle} onError={setError} />

          <p className="mt-4 text-gray-600">
            Don't have an account? <Link to="/signup" className="text-[#3A5A40] font-semibold">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

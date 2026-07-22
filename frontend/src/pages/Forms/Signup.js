import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/NavBar';
import image1 from '../../utils/images/pg.png';
import { useAuth } from '../../context/AuthContext';
import GoogleSignInButton from '../../components/GoogleSignInButton';

const SignUp = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();

  const handleGoogle = async (credential) => {
    setError('');
    try {
      await loginWithGoogle(credential);
      navigate('/profile', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-up failed.');
    }
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character (!@#$%^&*).');
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

  const inputClass = 'w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#3A5A40]';

  return (
    <div>
      <Navbar />
      <div className="flex flex-col md:flex-row justify-center items-center min-h-[80vh] pt-16">
        <div className="md:w-1/2 p-6 order-1">
          <img src={image1} alt="img" className="h-auto" />
        </div>
        <div className="md:w-1/2 p-6 order-1 max-w-md">
          <p className="mb-2 font-bold text-2xl text-[#3A5A40]">Create your account</p>
          <p className="mb-6 text-gray-600">Welcome! Please enter your details.</p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block mb-1 text-sm font-medium text-gray-700">First Name</label>
                <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label htmlFor="lastName" className="block mb-1 text-sm font-medium text-gray-700">Last Name</label>
                <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className={inputClass} required />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">Password</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block mb-1 text-sm font-medium text-gray-700">Confirm Password</label>
              <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={inputClass} required />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3A5A40] text-white py-2.5 px-4 rounded-lg hover:bg-[#242F2A] disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Sign Up'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          <GoogleSignInButton onCredential={handleGoogle} onError={setError} />

          <p className="mt-4 text-gray-600">
            Have an account? <Link to="/login" className="text-[#3A5A40] font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

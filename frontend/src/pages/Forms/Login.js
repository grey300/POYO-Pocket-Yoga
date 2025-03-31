import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/NavBar';
import image1 from '../../utils/images/pg1.png';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.email.trim() === '') {
      alert('Please enter your email address');
      return;
    }
  
    if (formData.password.trim() === '') {
      alert('Please enter your password');
      return;
    }
    
    console.log(formData);
  };

  return (
    <div>
      <Navbar />
      <div className="flex flex-col md:flex-row justify-center items-center">
        <div className="md:w-1/2 p-6 order-1">
          <img src={image1} alt="img" className="h-auto " />
        </div>
        <div className="md:w-1/2 p-6 order-1 mr-8">
          <p className="mb-5 font-bold text-xl">Welcome</p>
          <p className="mb-9">Welcome back! Please sign in to your account</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-2/4 border border-gray-300 rounded py-2 px-3 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-1">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-2/4 border border-gray-300 rounded py-2 px-3 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <button type="submit" className="w-2/4 bg-green-800 text-white py-2 px-4 rounded hover:bg-green-900 focus:outline-none focus:bg-blue-600">
              Sign In
            </button>
          </form>
          <p className="mt-4">Don't have an account? <Link to="/signup" className="text-red-500">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;

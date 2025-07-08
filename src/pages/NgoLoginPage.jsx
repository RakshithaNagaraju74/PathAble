// File: NgoLoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineLock, AiOutlineLoading3Quarters } from 'react-icons/ai'; // Import icons
import { MdOutlineMailOutline } from 'react-icons/md'; // Import icons

const NgoLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State for error messages
  const [loading, setLoading] = useState(false); // State for loading indicator
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Corrected URL: Ensure this matches your backend's NGO login route and port
      const res = await axios.post('http://localhost:5000/api/ngo-login', { email, password });
      
      if (res.data.success) {
        // Store NGO ID received from the backend
        // Your backend (ngoAuth.js) returns { success: true, ngo: { _id: '...', ... } }
        localStorage.setItem('ngoId', res.data.ngo._id); 
        // alert('Login successful!'); // Consider replacing with a more subtle notification
        navigate('/ngo-dashboard');
      } else {
        // Use message from backend if available, otherwise a generic error
        setError(res.data.message || 'Invalid credentials. Please try again.'); 
      }
    } catch (error) {
      console.error('NGO Login Error:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error); // Use 'error' field if provided by backend
      } else {
        setError('Login failed. Please check your network connection or try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-4xl">
        {/* Login Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-center text-[#00A896] mb-6">NGO Login</h1> {/* Changed to Teal */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <MdOutlineMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="NGO Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A896]" // Changed to Teal
                required
              />
            </div>
            <div className="relative">
              <AiOutlineLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                placeholder="NGO Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A896]" // Changed to Teal
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00A896] hover:bg-[#008F7F] text-white py-3 rounded-md font-medium transition" // Changed to Teal
            >
              {loading ? (
                <span className="flex justify-center items-center">
                  <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                  Logging In...
                </span>
              ) : 'Login'}
            </button>
          </form>
        </div>

        {/* Side Info Panel (You can customize this for NGO specific info) */}
        <div className="hidden md:flex w-1/2 bg-[#00A896] text-white p-8 flex-col justify-center items-center"> {/* Changed to Teal */}
          <h2 className="text-3xl font-bold mb-4">For NGOs</h2>
          <p className="mb-6 text-center">
            Access your dashboard to manage your accessible place contributions and outreach.
          </p>
          {/* You could add a "Contact Admin" button or similar here */}
          <button
            onClick={() => navigate('/')} // Navigate to home page
            className="mt-4 px-6 py-2 bg-white text-[#00A896] rounded-md font-semibold hover:bg-gray-100 transition" // Changed to Teal
          >
            Back to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default NgoLogin;
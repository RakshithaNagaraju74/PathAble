// KeyFeaturesPage.jsx
import React from 'react';
import { Accessibility, Toilet, MapPin, Camera, Route, ArrowLeft, ShieldCheck, MessageSquare, Heart, Users, TrendingUp } from 'lucide-react'; // Removed Brain icon import
import { useNavigate } from 'react-router-dom';

const KeyFeaturesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-100 to-green-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 font-inter">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-850 rounded-2xl shadow-xl p-8 sm:p-10 lg:p-12 border border-gray-200 dark:border-gray-700 relative">
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700 transition-all duration-300 flex items-center justify-center shadow-md"
          aria-label="Back to Homepage"
        >
          <ArrowLeft size={24} />
        </button>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-10 text-blue-800 dark:text-blue-400 leading-tight">
          Uncompromising Accessibility Details, Demystified.
        </h1>

        <p className="text-lg text-center mb-12 max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
          AccessMap provides a rich set of features designed to give you precise, actionable information for every journey.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="feature-card-lg">
            <div className="p-4 bg-purple-200 dark:bg-purple-600 rounded-full mb-4 shadow-inner">
              <MapPin size={48} className="text-purple-700 dark:text-purple-200" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-purple-700 dark:text-purple-300">Detailed Location Profiles</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Access comprehensive accessibility data for thousands of locations, including entrance types, interior layouts, and specific amenity details.
            </p>
          </div>

          <div className="feature-card-lg">
            <div className="p-4 bg-green-200 dark:bg-green-600 rounded-full mb-4 shadow-inner">
              <Accessibility size={48} className="text-green-700 dark:text-green-200" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-green-700 dark:text-green-300">Precise Entrance Details</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Get exact measurements for ramp slopes, door widths, and information on automatic entry systems, ensuring smooth entry and exit.
            </p>
          </div>

          <div className="feature-card-lg">
            <div className="p-4 bg-yellow-200 dark:bg-yellow-600 rounded-full mb-4 shadow-inner">
              <Toilet size={48} className="text-yellow-700 dark:text-yellow-200" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-yellow-700 dark:text-yellow-300">Accessible Restroom Verification</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Find verified information on restroom accessibility, including turning radius, grab bars, and other inclusive amenities.
            </p>
          </div>

          {/* Removed AI-Powered Accessibility Rating card */}
          <div className="feature-card-lg">
            <div className="p-4 bg-indigo-200 dark:bg-indigo-600 rounded-full mb-4 shadow-inner">
              <Route size={48} className="text-indigo-700 dark:text-indigo-200" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-indigo-700 dark:text-indigo-300">Personalized Accessible Routing</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Generate routes that consider your specific mobility needs, avoiding obstacles and prioritizing accessible pathways.
            </p>
          </div>

          <div className="feature-card-lg">
            <div className="p-4 bg-teal-200 dark:bg-teal-600 rounded-full mb-4 shadow-inner">
              <ShieldCheck size={48} className="text-teal-700 dark:text-teal-200" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-teal-700 dark:text-teal-300">Community Verification System</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Our community-driven verification ensures the accuracy and reliability of accessibility data, building trust and confidence.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-6 text-blue-800 dark:text-blue-400">Explore All Features</h2>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transform transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-700"
          >
            View Live Map
          </button>
        </div>
      </div>
      <style jsx>{`
        .feature-card-lg {
          @apply flex flex-col items-center text-center p-6 rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl border;
          background: linear-gradient(145deg, #f0f9ff, #e0f2fe); /* Light blue gradient for light mode */
          border-color: #bfdbfe; /* Blue-200 */
        }
        .dark .feature-card-lg {
          background: linear-gradient(145deg, #2a2a2a, #1a1a1a); /* Dark gradient for dark mode */
          border-color: #3a3a3a; /* Gray-700 */
        }
      `}</style>
    </div>
  );
};

export default KeyFeaturesPage;

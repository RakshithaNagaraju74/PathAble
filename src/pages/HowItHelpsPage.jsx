// HowItHelpsPage.jsx
import React from 'react';
import { MapPin, Camera, Route, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HowItHelpsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 font-inter">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-850 rounded-2xl shadow-xl p-8 sm:p-10 lg:p-12 border border-gray-200 dark:border-gray-700 relative">
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 p-2 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-800 dark:text-purple-200 dark:hover:bg-purple-700 transition-all duration-300 flex items-center justify-center shadow-md"
          aria-label="Back to Homepage"
        >
          <ArrowLeft size={24} />
        </button>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-10 text-purple-800 dark:text-purple-400 leading-tight">
          How AccessMap Empowers You
        </h1>

        <p className="text-lg text-center mb-12 max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
          AccessMap is designed to break down barriers and foster independence for disabled individuals. Here's how we help you navigate your world with confidence.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 bg-purple-50 dark:bg-gray-700 rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl border border-purple-200 dark:border-gray-600">
            <div className="p-4 bg-purple-200 dark:bg-purple-600 rounded-full mb-4 shadow-inner">
              <MapPin size={48} className="text-purple-700 dark:text-purple-200" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-purple-700 dark:text-purple-300">Discover Barrier-Free Venues</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Easily locate businesses, public spaces, and attractions with comprehensive, verified accessibility information. Our detailed listings help you find places that truly meet your needs.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-blue-50 dark:bg-gray-700 rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl border border-blue-200 dark:border-gray-600">
            <div className="p-4 bg-blue-200 dark:bg-blue-600 rounded-full mb-4 shadow-inner">
              <Camera size={48} className="text-blue-700 dark:text-blue-200" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-blue-700 dark:text-blue-300">Share Your Accessibility Insights</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Become a vital part of our community by contributing your own accessibility reports. Share photos, details, and experiences to help fellow users make informed decisions.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-green-50 dark:bg-gray-700 rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl border border-green-200 dark:border-gray-600">
            <div className="p-4 bg-green-200 dark:bg-green-600 rounded-full mb-4 shadow-inner">
              <Route size={48} className="text-green-700 dark:text-green-200" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-green-700 dark:text-green-300">Plan Your Accessible Journey</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Utilize our intelligent routing features to plan your travels. Get real-time updates and predictive routes that prioritize accessibility, ensuring a smooth and confident journey.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-6 text-purple-800 dark:text-purple-400">Ready to Explore?</h2>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-purple-600 text-white font-semibold rounded-full shadow-lg hover:bg-purple-700 transform transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-700"
          >
            Start Navigating Now!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItHelpsPage;

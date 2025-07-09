// NGORegistrationPage.jsx
import React from 'react';
import { Mail, ArrowLeft, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NGORegistrationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 font-inter">
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-850 rounded-2xl shadow-xl p-8 sm:p-10 lg:p-12 border border-gray-200 dark:border-gray-700 relative text-center">
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700 transition-all duration-300 flex items-center justify-center shadow-md"
          aria-label="Back to Homepage"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="p-4 bg-indigo-200 dark:bg-indigo-600 rounded-full inline-flex mb-6 shadow-inner">
          <Users size={64} className="text-indigo-700 dark:text-indigo-200" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-indigo-800 dark:text-indigo-400 leading-tight">
          Join Our Contributor Community (for NGOs)
        </h1>

        <p className="text-lg mb-8 text-gray-700 dark:text-gray-300">
          If your NGO is passionate about enhancing accessibility and wishes to partner with AccessMap to contribute verified data, please reach out to us.
        </p>

        <p className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200 flex items-center justify-center">
          <Mail size={28} className="mr-3 text-indigo-600 dark:text-indigo-300" />
          Mail us your NGO details at:
        </p>
        <a
          href="mailto:accessmap@org.in"
          className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 hover:underline transition-colors duration-300"
        >
          accessmap@org.in
        </a>

        <p className="text-base mt-8 text-gray-600 dark:text-gray-400">
          Our team will review your application and get in touch with you shortly to complete the registration process.
        </p>

        <div className="mt-10">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transform transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-700"
          >
            Back to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default NGORegistrationPage;

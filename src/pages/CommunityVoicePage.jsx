// CommunityVoicePage.jsx
import React from 'react';
import { Users, MessageSquare, Heart, Trophy, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommunityVoicePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-100 to-teal-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 font-inter">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-850 rounded-2xl shadow-xl p-8 sm:p-10 lg:p-12 border border-gray-200 dark:border-gray-700 relative">
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-800 dark:text-green-200 dark:hover:bg-green-700 transition-all duration-300 flex items-center justify-center shadow-md"
          aria-label="Back to Homepage"
        >
          <ArrowLeft size={24} />
        </button>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-10 text-green-800 dark:text-green-400 leading-tight">
          Empowering Our Disability Community, Together.
        </h1>

        <p className="text-lg text-center mb-12 max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
          AccessMap thrives on the collective power of its community. Every contribution, every comment, and every verification strengthens our mission.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="community-card">
            <div className="p-4 bg-blue-200 dark:bg-blue-600 rounded-full mb-4 shadow-inner">
              <Users size={48} className="text-blue-700 dark:text-blue-200" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-blue-700 dark:text-blue-300">Support Accessibility Initiatives</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Collaborate with local communities, NGOs, and fellow users to identify accessibility gaps and drive positive change. Your voice makes a difference.
            </p>
          </div>

          <div className="community-card">
            <div className="p-4 bg-purple-200 dark:bg-purple-600 rounded-full mb-4 shadow-inner">
              <MessageSquare size={48} className="text-purple-700 dark:text-purple-200" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-purple-700 dark:text-purple-300">Engage and Verify</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Leave comments, provide feedback, and help verify existing reports. Your active participation ensures the accuracy and reliability of our data for everyone.
            </p>
          </div>

          <div className="community-card">
            <div className="p-4 bg-red-200 dark:bg-red-600 rounded-full mb-4 shadow-inner">
              <Heart size={48} className="text-red-700 dark:text-red-200" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-red-700 dark:text-red-300">Share Your Stories</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Connect with a global network of users. Share your experiences, challenges, and successes to inspire and support others in their accessibility journeys.
            </p>
          </div>

          <div className="community-card">
            <div className="p-4 bg-yellow-200 dark:bg-yellow-600 rounded-full mb-4 shadow-inner">
              <Trophy size={48} className="text-yellow-700 dark:text-yellow-200" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-yellow-700 dark:text-yellow-300">Earn Badges and Recognition</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Your contributions don't go unnoticed! Earn badges for your active participation and become a recognized leader in the accessibility mapping community.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-6 text-green-800 dark:text-green-400">Join the Movement!</h2>
          <button
            onClick={() => navigate('/ngo-login')}
            className="px-8 py-4 bg-green-600 text-white font-semibold rounded-full shadow-lg hover:bg-green-700 transform transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-700"
          >
            Start Your Contribution Today
          </button>
        </div>
      </div>
      <style jsx>{`
        .community-card {
          @apply flex flex-col items-center text-center p-6 rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl border;
          background: linear-gradient(145deg, #e0ffe0, #c0ffc0); /* Light green gradient for light mode */
          border-color: #a7f3d0; /* Teal-200 */
        }
        .dark .community-card {
          background: linear-gradient(145deg, #2a2a2a, #1a1a1a); /* Dark gradient for dark mode */
          border-color: #3a3a3a; /* Gray-700 */
        }
      `}</style>
    </div>
  );
};

export default CommunityVoicePage;

// OurImpactPage.jsx
import React from 'react';
import { Globe, Users, TrendingUp, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OurImpactPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 font-inter">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-850 rounded-2xl shadow-xl p-8 sm:p-10 lg:p-12 border border-gray-200 dark:border-gray-700 relative">
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 p-2 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-800 dark:text-yellow-200 dark:hover:bg-yellow-700 transition-all duration-300 flex items-center justify-center shadow-md"
          aria-label="Back to Homepage"
        >
          <ArrowLeft size={24} />
        </button>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-10 text-orange-800 dark:text-orange-400 leading-tight">
          Driving Real Accessibility for Disabled Lives.
        </h1>

        <p className="text-lg text-center mb-12 max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
          Our mission is to create a more inclusive world. See the tangible impact AccessMap is making, fueled by our dedicated community.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="impact-metric-card">
            <div className="p-4 bg-purple-200 dark:bg-purple-600 rounded-full mb-4 shadow-inner">
              <Globe size={48} className="text-purple-700 dark:text-purple-200" />
            </div>
            <span className="text-5xl font-bold text-purple-700 dark:text-purple-300 block mb-2">0K+</span>
            <p className="text-lg text-gray-700 dark:text-gray-300">Verified Accessible Locations</p>
          </div>

          <div className="impact-metric-card">
            <div className="p-4 bg-blue-200 dark:bg-blue-600 rounded-full mb-4 shadow-inner">
              <Users size={48} className="text-blue-700 dark:text-blue-200" />
            </div>
            <span className="text-5xl font-bold text-blue-700 dark:text-blue-300 block mb-2">0K+</span>
            <p className="text-lg text-gray-700 dark:text-gray-300">Disabled Lives Empowered</p>
          </div>

          <div className="impact-metric-card">
            <div className="p-4 bg-green-200 dark:bg-green-600 rounded-full mb-4 shadow-inner">
              <TrendingUp size={48} className="text-green-700 dark:text-green-200" />
            </div>
            <span className="text-5xl font-bold text-green-700 dark:text-green-300 block mb-2">0K+</span>
            <p className="text-lg text-gray-700 dark:text-gray-300">Dedicated Contributors</p>
          </div>
        </div>

        <blockquote className="text-xl italic text-center mb-12 p-6 rounded-lg bg-gray-50 dark:bg-gray-700 border-l-4 border-purple-500 dark:border-purple-400 shadow-md">
          "AccessMap changed how I explore my city. It’s an essential accessibility tool, giving me the freedom to go where I want, when I want."
          <footer className="mt-4 text-lg font-semibold text-purple-700 dark:text-purple-300">- Rohan P., AccessMap User</footer>
        </blockquote>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-6 text-orange-800 dark:text-orange-400">Our Vision for the Future</h2>
          <p className="text-lg max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
            We are continuously innovating, building real-time updates, predictive routing, and personalized profiles to drive full inclusion and redefine independent living for disabled individuals worldwide.
          </p>
        </div>
      </div>
      <style jsx>{`
        .impact-metric-card {
          @apply flex flex-col items-center text-center p-6 rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl border;
          background: linear-gradient(145deg, #fffbe0, #fff0c0); /* Light yellow gradient for light mode */
          border-color: #fde68a; /* Yellow-200 */
        }
        .dark .impact-metric-card {
          background: linear-gradient(145deg, #2a2a2a, #1a1a1a); /* Dark gradient for dark mode */
          border-color: #3a3a3a; /* Gray-700 */
        }
      `}</style>
    </div>
  );
};

export default OurImpactPage;

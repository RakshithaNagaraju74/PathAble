// SpamAccountPage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase'; // Adjust path as needed
import { CircleAlert } from 'lucide-react'; // Added icon

const SpamAccountPage = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('ngoId'); // Clear any NGO ID if present
      navigate('/'); // Go back to homepage
    } catch (error) {
      console.error("Error logging out from spam page:", error);
      // Use a custom message display instead of alert
      // For now, will log to console as custom modal is out of scope.
      console.error("Failed to log out.");
    }
  };

  // Automatically sign out if on this page (ensures user can't just close and re-open)
  useEffect(() => {
    // A small delay to ensure the message is seen before immediate logout
    const logoutTimer = setTimeout(() => {
        handleLogout();
    }, 5000); // Automatically logs out after 5 seconds

    return () => clearTimeout(logoutTimer); // Cleanup the timer
  }, []); // Run once on mount

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-lg shadow-lg text-center border border-red-300">
        <CircleAlert size={64} className="mx-auto text-red-500 mb-4 animate-bounce-custom" />
        <h2 className="mt-6 text-3xl font-extrabold text-red-600">
          Account Inactive
        </h2>
        <p className="mt-2 text-lg text-red-800">
          Your account has been marked as spam by multiple NGOs due to suspicious activity.
        </p>
        <p className="mt-2 text-base text-gray-600">
          You will not be able to log in or contribute further. If you believe this is an error, please contact support. You will be automatically logged out.
        </p>
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 transform hover:scale-105"
          >
            Sign Out Now
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes bounce-custom {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-custom {
          animation: bounce-custom 1s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default SpamAccountPage;

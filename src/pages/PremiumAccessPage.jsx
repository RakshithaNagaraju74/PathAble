// File: src/pages/PremiumAccessPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, CheckCircle, XCircle, ArrowLeft, Sun, Moon, Loader2 } from 'lucide-react';

const colors = {
  light: {
    primaryBrand: '#6A0DAD', // Deep Purple
    secondaryAccent: '#FFD700', // Gold
    backgroundBase: '#E8ECF6', // Lighter bluish-gray
    cardBackground: '#FFFFFF', // White
    textPrimary: '#333333', // Dark Gray
    textSecondary: '#666666', // Medium Gray
    borderSubtle: '#D1D5DB', // Light Gray
    premiumBg: 'linear-gradient(to right, #8B5CF6, #6D28D9)', // Purple to Darker Purple
    premiumText: '#FFFFFF',
    successBg: '#D4EDDA', // Light green
    successText: '#155724', // Dark green
    errorBg: '#FEE2E2', // Red-100
    errorText: '#EF4444', // Red-700
    buttonBg: 'linear-gradient(to right, #6A0DAD, #A855F7)',
    buttonHoverBg: 'linear-gradient(to right, #A855F7, #6A0DAD)',
  },
  dark: {
    primaryBrand: '#BB86FC', // Lighter Purple
    secondaryAccent: '#FFE000', // Brighter Gold
    backgroundBase: '#121212', // Very dark
    cardBackground: '#1E1E1E', // Darker gray
    textPrimary: '#E0E0E0', // Light Gray
    textSecondary: '#B0B0B0', // Muted light text
    borderSubtle: '#3A3A3A', // Darker Gray
    premiumBg: 'linear-gradient(to right, #6200EE, #3700B3)', // Darker premium background
    premiumText: '#FFFFFF',
    successBg: '#0A3F1F', // Dark green
    successText: '#6CFF9D', // Light green
    errorBg: '#620000', // Darker red
    errorText: '#CF6679', // Lighter red
    buttonBg: 'linear-gradient(to right, #BB86FC, #6A0DAD)',
    buttonHoverBg: 'linear-gradient(to right, #6A0DAD, #BB86FC)',
  }
};

const PremiumAccessPage = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [userId, setUserId] = useState(null); // State to hold the current user's Firebase UID

  const currentColors = isDarkMode ? colors.dark : colors.light;

  // Effect to load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    setIsDarkMode(savedTheme === 'true');
    document.documentElement.setAttribute('data-theme', savedTheme === 'true' ? 'dark' : 'light');

    // In a real app, you'd get the authenticated user's UID from Firebase Auth context
    // For this mock, we'll use a placeholder or assume it's passed via route state if coming from MapView
    // For demonstration, let's use a mock UID. In a real app, replace with actual auth context.
    const mockUserId = "mock_firebase_uid_123"; // Replace with actual Firebase UID
    setUserId(mockUserId);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', newMode.toString());
      document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  const handleUpgrade = async () => {
    if (!userId) {
      setMessage('Error: User ID not found. Please log in.');
      setMessageType('error');
      return;
    }

    // Mock payment confirmation
    const confirmed = window.confirm("Confirm payment of ₹99 to upgrade to Premium?");
    if (!confirmed) {
      setMessage('Payment cancelled.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upgrade to premium.');
      }

      const result = await response.json();
      setMessage(result.message);
      setMessageType('success');
      // Optionally, navigate back to MapView or a success page after a delay
      setTimeout(() => {
        navigate('/map'); // Go back to MapView, which will now show unlimited reports
      }, 2000);

    } catch (err) {
      console.error("Error upgrading to premium:", err);
      setMessage(`Upgrade failed: ${err.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-inter p-4" style={{ backgroundColor: currentColors.backgroundBase, color: currentColors.textPrimary }}>
      <style jsx>{`
        .premium-page-container {
          background: ${currentColors.cardBackground};
          border: 1px solid ${currentColors.borderSubtle};
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          border-radius: 1.5rem;
          padding: 3rem;
          max-width: 600px;
          width: 100%;
          text-align: center;
          position: relative;
          transition: all 0.5s ease;
        }
        .message-box {
          padding: 1rem;
          border-radius: 0.75rem;
          margin-top: 1.5rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .message-box.success {
          background-color: ${currentColors.successBg};
          color: ${currentColors.successText};
          border: 1px solid ${currentColors.successText};
        }
        .message-box.error {
          background-color: ${currentColors.errorBg};
          color: ${currentColors.errorText};
          border: 1px solid ${currentColors.errorText};
        }
        .back-button {
            position: absolute;
            top: 1.5rem;
            left: 1.5rem;
            padding: 0.6rem;
            border-radius: 9999px;
            background-color: ${currentColors.borderSubtle};
            color: ${currentColors.primaryBrand};
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            z-index: 20;
        }
        .back-button:hover {
            background-color: ${currentColors.primaryBrand};
            color: ${currentColors.cardBackground};
            transform: scale(1.05);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .theme-toggle-wrapper {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 30px;
            background-color: ${currentColors.borderSubtle};
            border-radius: 25px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            cursor: pointer;
            transition: background-color 0.5s ease;
            z-index: 20;
        }
        .theme-toggle-wrapper input[type="checkbox"] {
            height: 0;
            width: 0;
            visibility: hidden;
        }
        .theme-toggle-label {
            cursor: pointer;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 5px;
            position: relative;
        }
        .theme-toggle-label::after {
            content: '';
            position: absolute;
            top: 3px;
            left: 3px;
            width: 24px;
            height: 24px;
            background-color: ${currentColors.textPrimary};
            border-radius: 50%;
            transition: transform 0.3s ease, background-color 0.5s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        [data-theme='dark'] .theme-toggle-label::after {
            transform: translateX(30px);
            background-color: ${currentColors.textPrimary};
        }
        .theme-toggle-label svg {
            z-index: 1;
            color: ${currentColors.textSecondary};
        }
      `}</style>

      <div className="premium-page-container">
        <button
          onClick={() => navigate('/map')}
          className="back-button"
          aria-label="Back to Map"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Theme Toggle Button */}
        <div className="theme-toggle-wrapper">
          <input
            type="checkbox"
            id="theme-switcher"
            onChange={toggleDarkMode}
            checked={isDarkMode}
            aria-label="Toggle dark/light mode"
          />
          <label htmlFor="theme-switcher" className="theme-toggle-label">
            {isDarkMode ? <Moon size={20} color="#f8f8f8" /> : <Sun size={20} color="#333" />}
          </label>
        </div>

        <Award size={80} className="mb-6" style={{ color: currentColors.primaryBrand }} />
        <h1 className="text-4xl font-bold mb-4" style={{ color: currentColors.primaryBrand }}>Unlock Premium Access</h1>
        <p className="text-lg mb-6" style={{ color: currentColors.textSecondary }}>
          Go beyond the limits and experience AccessMap with unlimited report viewing, advanced analytics, and priority support.
        </p>

        <div className="flex flex-col items-center space-y-4 mb-8">
          <div className="flex items-center text-left w-full max-w-sm">
            <CheckCircle size={24} className="mr-3" style={{ color: currentColors.successText }} />
            <span className="text-lg" style={{ color: currentColors.textPrimary }}>Unlimited Report Viewing</span>
          </div>
          <div className="flex items-center text-left w-full max-w-sm">
            <CheckCircle size={24} className="mr-3" style={{ color: currentColors.successText }} />
            <span className="text-lg" style={{ color: currentColors.textPrimary }}>Advanced User Analytics</span>
          </div>
          <div className="flex items-center text-left w-full max-w-sm">
            <CheckCircle size={24} className="mr-3" style={{ color: currentColors.successText }} />
            <span className="text-lg" style={{ color: currentColors.textPrimary }}>Priority Customer Support</span>
          </div>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-4 px-6 rounded-full text-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          style={{
            background: currentColors.buttonBg,
            color: currentColors.premiumText,
          }}
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2" size={24} />
          ) : (
            `Upgrade Now for ₹99`
          )}
        </button>

        {message && (
          <div className={`message-box ${messageType}`}>
            {messageType === 'success' ? <CheckCircle size={20} className="mr-2" /> : <XCircle size={20} className="mr-2" />}
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumAccessPage;

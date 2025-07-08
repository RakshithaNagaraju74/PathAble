import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase'; // Assuming your firebase.js exports 'auth'
import { User, Mail, Save, XCircle, Loader2, Home, Moon, Sun, CheckCircle } from 'lucide-react'; // Added CheckCircle

// Re-using the color palette from MapView.jsx for consistency
const colors = {
  light: {
    primaryBrand: '#6A0DAD', // Deep Purple - for main branding, strong accents
    secondaryAccent: '#FFD700', // Gold - for highlights, badges, active states
    backgroundBase: '#E8ECF6', // Lighter bluish-gray for overall background
    cardBackground: '#FFFFFF', // White - card backgrounds
    textPrimary: '#333333', // Dark Gray - primary text
    textSecondary: '#666666', // Medium Gray - secondary/muted text
    borderSubtle: '#D1D5DB', // Light Gray - borders
    shadowBase: 'rgba(0, 0, 0, 0.08)', // Soft, diffused shadow
    commentBg: 'rgba(106, 13, 173, 0.08)', // Light purple for comments
    notificationUnreadBg: 'rgba(255, 215, 0, 0.18)', // Light gold for unread notifications
    notificationReadBg: '#E9ECEF', // Slightly darker light gray for read notifications
    notificationUnreadText: '#6A0DAD', // Primary brand for unread notif text
    errorBg: '#FEE2E2', // Red-100
    errorBorder: '#EF4444', // Red-500
    errorText: '#EF4444', // Red-700
    premiumBg: 'linear-gradient(to right, #8B5CF6, #6D28D9)', // Purple to Darker Purple
    likeColor: '#FF6347', // Tomato color for likes
    sidebarActiveBg: 'linear-gradient(to right, #A855F7, #D8B4FE)', // Brighter, more distinct purple gradient for active
    sidebarActiveText: '#FFFFFF', // White text for active sidebar item
    sidebarBg: 'linear-gradient(to bottom right, #F8F8FF, #E0E7FF)', // Subtle, light blueish gradient for sidebar background
    sidebarHoverBg: 'rgba(170, 0, 255, 0.08)', // Light translucent purple on hover
    iconMuted: '#787878', // Muted icon color for inactive
    avatarBg: '#A78BFA', // Light purple for avatar background in light mode
    cardBorder: '#D1D5DB', // A clearer, slightly darker gray for card borders
    reportCardGradient: 'linear-gradient(to bottom right, #FDFDFD, #F0F2F5)', // Very subtle, clean gradient
    reportCardBorder: '#E0E7FF', // Soft bluish border
    reportCardShadow: 'rgba(0, 0, 0, 0.1)', // Subtle shadow for report cards
    headerBg: 'linear-gradient(to right, #F8F8FF, #FFFFFF)', // Light blueish gradient for header
    headerBorder: '#D1D5DB', // A clearer border for the header
  },
  dark: {
    primaryBrand: '#BB86FC', // Lighter Purple - for main branding, strong accents (Material Design-like)
    secondaryAccent: '#FFE000', // Brighter Gold - for highlights, badges, active states
    backgroundBase: '#121212', // Very dark for true dark mode
    cardBackground: '#1E1E1E', // Darker gray for card backgrounds
    textPrimary: '#E0E0E0', // Light Gray - primary text
    textSecondary: '#B0B0B0', // Muted light text
    borderSubtle: '#3A3A3A', // Darker Gray - borders
    shadowBase: 'rgba(0, 0, 0, 0.25)', // Darker, diffused shadow
    commentBg: 'rgba(187, 134, 252, 0.1)', // Light purple for comments
    notificationUnreadBg: 'rgba(255, 224, 0, 0.25)', // Darker light gold for unread notifications
    notificationReadBg: '#3A3A3A', // Darker gray for read notifications
    notificationUnreadText: '#FFE000', // Bright gold for unread notif text
    errorBg: '#620000', // Darker red
    errorBorder: '#CF6679', // Lighter red
    errorText: '#CF6679', // Lighter red
    premiumBg: 'linear-gradient(to right, #6200EE, #3700B3)', // Darker premium background
    likeColor: '#FF6347', // Tomato color for likes
    sidebarActiveBg: 'linear-gradient(to right, #BB86FC, #6A0DAD)', // Darker, more saturated purple for active
    sidebarActiveText: '#FFFFFF', // White text for active sidebar item
    sidebarBg: 'linear-gradient(to bottom right, #1E1E1E, #252525)', // Darker, more pronounced gradient for sidebar background
    sidebarHoverBg: 'rgba(187, 134, 252, 0.08)', // Light translucent purple on hover for dark mode
    iconMuted: '#B0B0B0', // Muted light icon color
    avatarBg: '#6200EE', // Darker purple for avatar background in dark mode
    cardBorder: '#3A3A3A', // A slightly lighter dark gray for card borders
    reportCardGradient: 'linear-gradient(to bottom right, #252525, #1E1E1E)', // Dark gradient for report cards
    reportCardBorder: '#3A3A3A', // Darker border for report cards
    reportCardShadow: 'rgba(0, 0, 0, 0.3)', // More pronounced shadow for report cards
    headerBg: 'linear-gradient(to right, #1E1E1E, #252525)', // Dark gradient for header
    headerBorder: '#3A3A3A', // A clearer border for the header
  }
};

const SettingsPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' ? true : false;
  });

  const navigate = useNavigate();
  const currentColors = darkMode ? colors.dark : colors.light;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          // Fetch user data from your backend
          const response = await fetch(`http://localhost:5000/api/users/${user.uid}`);
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to fetch user data:', errorText);
            throw new Error(`Failed to fetch user data: ${response.status}`);
          }
          const data = await response.json();
          setUserData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || user.email || '', // Fallback to Firebase email
          });
        } catch (err) {
          console.error("Error fetching user data:", err);
          setMessage("Failed to load user profile. Please try again.");
          setIsError(true);
        } finally {
          setLoading(false);
        }
      } else {
        // No user logged in, redirect to login or home
        navigate('/map'); // Or '/login' if you have a dedicated login page
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setMessage("You must be logged in to update your profile.");
      setIsError(true);
      return;
    }

    setSubmitting(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: currentUser.uid,
          firstName: userData.firstName,
          lastName: userData.lastName,
          // Exclude email from the update payload as it's managed by Firebase and unique in MongoDB
          // email: userData.email, // <--- This line is commented out / removed
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile.');
      }

      setMessage("Profile updated successfully!");
      setIsError(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage(`Error: ${err.message}`);
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', newMode); // Save user preference
      return newMode;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: currentColors.backgroundBase }}>
        <Loader2 size={48} className="animate-spin" style={{ color: currentColors.primaryBrand }} />
        <p className="ml-4 text-lg" style={{ color: currentColors.textPrimary }}>Loading user data...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: currentColors.backgroundBase, color: currentColors.textPrimary }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: currentColors.primaryBrand }}>Access Denied</h2>
        <p className="text-lg mb-6">Please log in to view your settings.</p>
        <button
          onClick={() => navigate('/map')}
          className="px-6 py-3 rounded-lg text-white font-semibold transition duration-200"
          style={{ backgroundColor: currentColors.primaryBrand }}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4" style={{ backgroundColor: currentColors.backgroundBase, color: currentColors.textPrimary }}>
      <header className="w-full max-w-4xl flex justify-between items-center py-4 px-6 rounded-lg shadow-lg mb-6" style={{ background: currentColors.headerBg, borderColor: currentColors.headerBorder, borderBottomWidth: '1px' }}>
        <h1 className="text-3xl font-bold" style={{ color: currentColors.primaryBrand }}>Account Settings</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full transition-colors duration-200"
            style={{ backgroundColor: currentColors.cardBackground, color: currentColors.textSecondary }}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => navigate('/map')}
            className="px-4 py-2 rounded-lg text-white font-semibold transition duration-200"
            style={{ backgroundColor: currentColors.primaryBrand }}
          >
            <Home size={20} className="inline mr-2" /> Back to Dashboard
          </button>
        </div>
      </header>

      <main className="w-full max-w-4xl p-8 rounded-lg shadow-xl" style={{ backgroundColor: currentColors.cardBackground, border: `1px solid ${currentColors.cardBorder}` }}>
        <h2 className="text-2xl font-semibold mb-6" style={{ color: currentColors.textPrimary }}>Personal Information</h2>

        {message && (
          <div className={`p-3 mb-4 rounded-md flex items-center ${isError ? 'bg-red-100 border-red-500 text-red-700' : 'bg-green-100 border-green-500 text-green-700'}`}
               style={{
                 backgroundColor: isError ? currentColors.errorBg : colors.light.notificationUnreadBg, // Using light.notificationUnreadBg for success
                 borderColor: isError ? currentColors.errorBorder : colors.light.secondaryAccent,
                 color: isError ? currentColors.errorText : currentColors.primaryBrand // Using primaryBrand for success text
               }}>
            {isError ? <XCircle size={20} className="mr-2" /> : <CheckCircle size={20} className="mr-2" />}
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-2" style={{ color: currentColors.textPrimary }}>First Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: currentColors.textSecondary }} />
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={userData.firstName}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: currentColors.borderSubtle, color: currentColors.textPrimary, backgroundColor: currentColors.backgroundBase, '--tw-ring-color': currentColors.primaryBrand }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-2" style={{ color: currentColors.textPrimary }}>Last Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: currentColors.textSecondary }} />
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={userData.lastName}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: currentColors.borderSubtle, color: currentColors.textPrimary, backgroundColor: currentColors.backgroundBase, '--tw-ring-color': currentColors.primaryBrand }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: currentColors.textPrimary }}>Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: currentColors.textSecondary }} />
              <input
                type="email"
                id="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: currentColors.borderSubtle, color: currentColors.textPrimary, backgroundColor: currentColors.backgroundBase, '--tw-ring-color': currentColors.primaryBrand }}
                readOnly // Email often comes from authentication and might not be directly editable here.
                         // If you allow email changes, you'd need Firebase re-authentication.
              />
            </div>
            <p className="text-xs mt-1" style={{ color: currentColors.textSecondary }}>
              (Email is usually managed through your authentication provider.)
            </p>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white transition duration-200"
            style={{ backgroundColor: currentColors.primaryBrand, opacity: submitting ? 0.7 : 1 }}
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 size={20} className="animate-spin mr-2" />
            ) : (
              <Save size={20} className="mr-2" />
            )}
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default SettingsPage;
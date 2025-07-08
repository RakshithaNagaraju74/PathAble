// src/components/Login.jsx (AuthSlider)

import React, { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { FcGoogle } from 'react-icons/fc';
import { AiOutlineLock, AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdOutlineMailOutline } from 'react-icons/md';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Define a Teal & Orange color palette
const colors = {
  // Light Mode Teal & Orange Theme
  primary: '#007B8C', // Deep Teal - Main accent color
  primaryDark: '#005F6B', // Darker Teal - For headings and stronger accents
  secondary: '#FF8C00', // Warm Orange - For key actions, highlights, active states
  accent: '#8FD85B', // Soft Green - For positive affirmations, subtle accents
  backgroundLight: '#F9FAFC', // Very light off-white - Overall background
  backgroundMid: '#EBF2F6', // Slightly darker light gray - Subtle contrast sections, form card background
  backgroundDark: '#2C3E50', // Deep Charcoal Blue - Footer, dark sections
  textPrimary: '#333333', // Dark Gray - Primary text
  textSecondary: '#666666', // Medium Gray - Secondary/placeholder text
  textLight: '#ffffff', // Pure white - Text on dark backgrounds
  borderLight: '#DDE5ED', // Light gray - For subtle separation and input borders
  inputBg: '#FFFFFF', // Pure white - Input field background
  buttonGradient: 'linear-gradient(to right, #007B8C, #00A693)', // Teal gradient for buttons
  buttonHover: 'linear-gradient(to right, #005F6B, #007B8C)', // Darker teal on hover
  shadowBase: 'rgba(0, 0, 0, 0.08)', // Soft, diffused shadow
  successBg: '#D4EDDA',
  successText: '#155724',
  errorBg: '#FEE2E2',
  errorText: '#DC2626',
  googleButtonBorder: '#DDE5ED', // Specific border for Google button in light mode
  googleButtonHoverBg: '#EBF2F6', // Light gray hover for Google button in light mode

  // Dark Mode Teal & Orange Theme
  dark: {
    primary: '#00BCD4', // Bright Cyan/Teal - Main interactive elements
    primaryDark: '#00838F', // Darker Teal - For headings and stronger accents
    secondary: '#FFAB40', // Bright Orange - For secondary actions, highlights
    accent: '#A5D6A7', // Soft Green for dark mode accents
    backgroundLight: '#121212', // Very Dark Gray - Overall background
    backgroundMid: '#1E1E1E', // Slightly Lighter Dark Gray - Cards/sections
    backgroundDark: '#0A0A0A', // Deepest black-gray - Footer, deepest sections
    textPrimary: '#E0E0E0', // Light Gray - Primary text
    textSecondary: '#B0B0B0', // Medium Light Gray - Muted text
    textLight: '#FFFFFF', // Pure white - Highlights
    borderLight: '#303030', // Dark Gray - Borders
    inputBg: '#1E1E1E', // Darker background for inputs
    buttonGradient: 'linear-gradient(to right, #00BCD4, #4DD0E1)', // Cyan/Teal gradient
    buttonHover: 'linear-gradient(to right, #00838F, #00BCD4)',
    shadowBase: 'rgba(0, 200, 200, 0.15)', // Subtle Cyan/Teal glow shadow
    glowPrimary: 'rgba(0, 220, 220, 0.6)', // Strong Teal/Cyan glow
    successBg: '#2E7D32',
    successText: '#A5D6A7',
    errorBg: '#C62828',
    errorText: '#EF9A9A',
    googleButtonBorder: '#303030',
    googleButtonHoverBg: '#282828',
  }
};

export default function AuthSlider() {
  const [isSignup, setIsSignup] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Basic dark mode toggle for this page, for consistent look
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDarkMode);
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Consolidate currentColors based on darkMode state
  const currentColors = darkMode ? colors.dark : colors;

  const toggleForm = () => {
    setIsSignup(!isSignup);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setError('');
  };

  // Function to save user data to MongoDB
  const saveUserToMongoDB = async (uid, email, firstName, lastName) => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid, firstName, lastName, email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save user to MongoDB');
      }
      console.log('User saved to MongoDB successfully!');
    } catch (mongoError) {
      console.error('MongoDB User Save Error:', mongoError);
      setError(`Authentication successful, but failed to save user data: ${mongoError.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let userCredential;
      let userName = '';

      if (isSignup) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        userName = firstName && lastName ? `${firstName} ${lastName}` : email.split('@')[0];
        await updateProfile(userCredential.user, { displayName: userName });
        // Save user to MongoDB after successful Firebase signup
        await saveUserToMongoDB(userCredential.user.uid, email, firstName, lastName);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        userName = userCredential.user.displayName || email.split('@')[0];
      }

      // Store additional user data in Firestore (if needed, alongside MongoDB)
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email,
        firstName: firstName || '',
        lastName: lastName || '',
        displayName: userName,
        createdAt: serverTimestamp(),
      }, { merge: true });

      navigate('/map'); // Redirect to MapView on successful login/signup
    } catch (err) {
      console.error('Firebase Auth Error:', err);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use. Please sign in or use a different email.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // Determine first and last name from Google profile, or use defaults
      const displayNameParts = user.displayName ? user.displayName.split(' ') : [];
      const userFirstName = displayNameParts.length > 0 ? displayNameParts[0] : '';
      const userLastName = displayNameParts.length > 1 ? displayNameParts.slice(1).join(' ') : '';
      const userEmail = user.email || '';

      // Save Google user data to MongoDB
      await saveUserToMongoDB(user.uid, userEmail, userFirstName, userLastName);

      // Also store/update in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: userEmail,
        firstName: userFirstName,
        lastName: userLastName,
        displayName: user.displayName,
        createdAt: serverTimestamp(),
      }, { merge: true });

      navigate('/map'); // Redirect to MapView on successful Google login
    } catch (err) {
      console.error('Google Auth Error:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: currentColors.backgroundLight }} // Updated to backgroundLight
    >
      <div
        className="flex flex-col md:flex-row rounded-lg shadow-xl overflow-hidden max-w-4xl w-full transition-all duration-500"
        style={{
          backgroundColor: currentColors.cardBackground,
          boxShadow: `0 20px 50px ${currentColors.shadowBase}`
        }}
      >
        {/* Login/Signup Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h2
            className="text-3xl font-bold text-center mb-6"
            style={{ color: currentColors.primaryDark, textShadow: darkMode ? `0 0 10px ${currentColors.glowPrimary}` : 'none' }}
          >
            {isSignup ? 'Create Account' : 'Welcome Back!'}
          </h2>
          <p className="text-center mb-6" style={{ color: currentColors.textSecondary }}>
            {isSignup
              ? 'Join us to explore and contribute to accessible places.'
              : 'Sign in to continue your journey.'}
          </p>

          {error && (
            <div
              className="px-4 py-3 rounded-md mb-4 text-sm animate-fade-in-down"
              role="alert"
              style={{ backgroundColor: currentColors.errorBg, color: currentColors.errorText, border: `1px solid ${currentColors.errorText}` }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2" size={20} style={{ color: currentColors.textSecondary }} />
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-md focus:outline-none focus:ring-2"
                    style={{
                      borderColor: currentColors.borderLight,
                      backgroundColor: currentColors.inputBg,
                      color: currentColors.textPrimary,
                      '--tw-ring-color': currentColors.primary,
                      boxShadow: darkMode ? `0 0 8px ${currentColors.glowPrimary}` : 'none'
                    }}
                    required={isSignup}
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2" size={20} style={{ color: currentColors.textSecondary }} />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-md focus:outline-none focus:ring-2"
                    style={{
                      borderColor: currentColors.borderLight,
                      backgroundColor: currentColors.inputBg,
                      color: currentColors.textPrimary,
                      '--tw-ring-color': currentColors.primary,
                      boxShadow: darkMode ? `0 0 8px ${currentColors.glowPrimary}` : 'none'
                    }}
                    required={isSignup}
                  />
                </div>
              </>
            )}
            <div className="relative">
              <MdOutlineMailOutline className="absolute left-3 top-1/2 -translate-y-1/2" size={20} style={{ color: currentColors.textSecondary }} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-md focus:outline-none focus:ring-2"
                style={{
                  borderColor: currentColors.borderLight,
                  backgroundColor: currentColors.inputBg,
                  color: currentColors.textPrimary,
                  '--tw-ring-color': currentColors.primary,
                  boxShadow: darkMode ? `0 0 8px ${currentColors.glowPrimary}` : 'none'
                }}
                required
              />
            </div>
            <div className="relative">
              <AiOutlineLock className="absolute left-3 top-1/2 -translate-y-1/2" size={20} style={{ color: currentColors.textSecondary }} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-md focus:outline-none focus:ring-2"
                style={{
                  borderColor: currentColors.borderLight,
                  backgroundColor: currentColors.inputBg,
                  color: currentColors.textPrimary,
                  '--tw-ring-color': currentColors.primary,
                  boxShadow: darkMode ? `0 0 8px ${currentColors.glowPrimary}` : 'none'
                }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 rounded-md font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: currentColors.buttonGradient,
                boxShadow: darkMode ? `0 0 20px ${currentColors.glowPrimary}` : `0 5px 15px rgba(0, 123, 140, 0.3)`,
              }}
            >
              {loading ? (
                <span className="flex justify-center items-center">
                  <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                  Processing...
                </span>
              ) : isSignup ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <button
            onClick={handleGoogleLogin}
            className="flex w-full justify-center items-center py-3 mt-4 border rounded-md transition-all duration-300 hover:scale-105"
            style={{
              borderColor: currentColors.googleButtonBorder,
              backgroundColor: currentColors.inputBg, // Changed to inputBg for consistency
              color: currentColors.textPrimary,
              boxShadow: darkMode ? `0 0 15px ${currentColors.shadowBase}` : `0 5px 15px rgba(0,0,0,0.1)`,
              '--tw-hover-bg': darkMode ? colors.dark.backgroundMid : colors.googleButtonHoverBg
            }}
          >
            <FcGoogle className="text-xl mr-2" />
            Continue with Google
          </button>
        </div>

        {/* Side Toggle Panel */}
        <div
          className="hidden md:flex w-1/2 p-8 flex-col justify-center items-center rounded-r-lg transition-all duration-500"
          style={{
            background: currentColors.buttonGradient, // Use button gradient for side panel
            color: currentColors.textLight,
            textShadow: darkMode ? `0 0 10px ${currentColors.glowPrimary}` : 'none',
            boxShadow: darkMode ? `0 0 30px ${currentColors.shadowBase}` : 'none',
          }}
        >
          <h2 className="text-3xl font-bold mb-4">{isSignup ? 'Already a Member?' : 'New Here?'}</h2>
          <p className="mb-6 text-center">
            {isSignup
              ? 'Sign in to explore accessible paths.'
              : 'Join AccessMap and make your city more inclusive.'}
          </p>
          <button
            onClick={toggleForm}
            className="py-2 px-6 rounded-full shadow-md transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: currentColors.textLight,
              color: currentColors.primary,
              boxShadow: darkMode ? `0 0 15px rgba(255,255,255,0.4)` : `0 2px 10px rgba(0,0,0,0.15)`
            }}
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
      {/* Custom CSS for fade-in animation, copied here for self-containment */}
      <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// File: src/pages/BadgesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth'; // Import for Firebase Auth
import { auth } from '../firebase'; // Import your Firebase auth instance

import {
  Sun, Moon, XCircle, // Basic Lucide icons for UI elements
} from 'lucide-react';

// Re-using the color palette from MapView.jsx for consistency
const colors = {
  light: {
    primaryBrand: '#6A0DAD', // Deep Purple - for main branding, strong accents
    secondaryAccent: '#FFD700', // Gold - for highlights, badges, active states
    backgroundBase: '#F0F2F5', // Lighter bluish-gray for overall background
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
    avatarBg: '#A78BFA', // Light purple for avatar background in light mode - ensuring it's a string
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
    avatarBg: '#6200EE', // Darker purple for avatar background in dark mode - ensuring it's a string
    cardBorder: '#3A3A3A', // A slightly lighter dark gray for card borders
    reportCardGradient: 'linear-gradient(to bottom right, #252525, #1E1E1E)', // Dark gradient for report cards
    reportCardBorder: '#3A3A3A', // Darker border for report cards
    reportCardShadow: 'rgba(0, 0, 0, 0.3)', // More pronounced shadow for report cards
    headerBg: 'linear-gradient(to right, #1E1E1E, #252525)', // Dark gradient for header
    headerBorder: '#3A3A3A', // A clearer border for the header
  }
};

// All defined badges with their criteria and image file names
const allBadges = [
  {
    id: 'first_report',
    name: 'First Report Pioneer',
    description: 'Awarded for submitting your very first accessibility report. Every journey begins with a single step!',
    image: 'first_report.png', // Image file name
    criteria: { minReports: 1 },
    category: 'Contribution'
  },
  {
    id: 'active_reporter_bronze',
    name: 'Active Reporter (Bronze)',
    description: 'You\'ve started making a significant difference with 5 valuable contributions!',
    image: 'active_reporter_bronze.png',
    criteria: { minReports: 5 },
    category: 'Contribution'
  },
  {
    id: 'active_reporter_silver',
    name: 'Active Reporter (Silver)',
    description: 'A dedicated contributor with 25 reports under your belt!',
    image: 'active_reporter_silver.png',
    criteria: { minReports: 25 },
    category: 'Contribution'
  },
  {
    id: 'active_reporter_gold',
    name: 'Active Reporter (Gold)',
    description: 'A true accessibility mapping champion with 100 or more reports!',
    image: 'active_reporter_gold.png',
    criteria: { minReports: 100 },
    category: 'Contribution'
  },
  {
    id: 'comment_contributor',
    name: 'Engaged Commenter',
    description: 'Awarded for actively engaging with reports by leaving 10 or more comments.',
    image: 'comment_contributor.png',
    criteria: { minComments: 10 },
    category: 'Engagement'
  },
  {
    id: 'trust_builder',
    name: 'Trust Builder',
    description: 'Your reports are consistently accurate! Awarded when 5 of your reports are verified as correct.',
    image: 'trust_builder.png',
    criteria: { minVerifiedReports: 5 },
    category: 'Quality'
  },
  {
    id: 'ramp_champion',
    name: 'Ramp Champion',
    description: 'You\'ve put a spotlight on ramps! Awarded for submitting 5 reports specifically about ramps.',
    image: 'ramp_champion.png',
    criteria: { minReportsByType: { ramp: 5 } },
    category: 'Specific Impact'
  },
  {
    id: 'restroom_reviewer',
    name: 'Restroom Reviewer',
    description: 'Helping everyone find accessible restrooms! Awarded for submitting 5 reports about restrooms.',
    image: 'restroom_reviewer.png',
    criteria: { minReportsByType: { restroom: 5 } },
    category: 'Specific Impact'
  },
  {
    id: 'elevator_enthusiast',
    name: 'Elevator Enthusiast',
    description: 'Making vertical mobility easier! Awarded for submitting 5 reports about elevators.',
    image: 'elevator_enthusiast.png',
    criteria: { minReportsByType: { elevator: 5 } },
    category: 'Specific Impact'
  },
  {
    id: 'pathway_pioneer',
    name: 'Pathway Pioneer',
    description: 'Clearing the way for everyone! Awarded for submitting 5 reports about pathways.',
    image: 'pathway_pioneer.png',
    criteria: { minReportsByType: { pathway: 5 } },
    category: 'Specific Impact'
  },
  {
    id: 'global_explorer',
    name: 'Global Explorer',
    description: 'You\'ve contributed from multiple distinct geographic locations (e.g., 3 cities or countries).',
    image: 'global_explorer.png',
    criteria: { minDistinctLocations: 3 },
    category: 'Exploration'
  },
  {
    id: 'community_leader',
    name: 'Community Leader',
    description: 'Highly engaged and respected! Awarded for reaching "Trusted Reporter (Level 3)" and "Active Reporter (Gold)".',
    image: 'community_leader.png',
    criteria: { requiresBadges: ['active_reporter_gold', 'trust_builder'] },
    category: 'Leadership'
  }
];


const BadgesPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Initialize darkMode from localStorage or default to false
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' ? true : false;
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);

  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // User stats fetched from backend/derived
  const [userReportsCount, setUserReportsCount] = useState(0);
  const [userCommentsCount, setUserCommentsCount] = useState(0);
  const [userDistinctLocations, setUserDistinctLocations] = useState(0);
  const [userVerifiedReportsCount, setUserVerifiedReportsCount] = useState(0);

  // Client-side determined earned badges
  const [earnedBadgesMap, setEarnedBadgesMap] = useState({});

  const navigate = useNavigate();
  const currentColors = darkMode ? colors.dark : colors.light;

  // 1. Authenticate and set userId
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        // Do NOT navigate to '/' here directly.
        // The main routing logic (e.g., in App.js) should handle unauthenticated redirects.
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, [navigate]);

  // 2. Fetch User Stats and calculate earned badges
  // This effect runs once when auth is ready and userId is available
  useEffect(() => {
    if (isAuthReady && userId) {
      const fetchUserAchievements = async () => {
        setLoading(true); // Only set loading true once at the start of fetch
        try {
          // --- Fetching User's Total Reports ---
          const totalReportsRes = await fetch(`http://localhost:5000/api/reports/user/${userId}/contributions`);
          let fetchedUserReportsCount = 0;
          if (totalReportsRes.ok) {
            const data = await totalReportsRes.json();
            fetchedUserReportsCount = data.totalContributions || 0;
            setUserReportsCount(fetchedUserReportsCount);
          } else {
            console.error(`Failed to fetch total reports for user ${userId}:`, await totalReportsRes.text());
            setError("Failed to fetch reports count.");
          }

          // --- Fetching User's Comments Count ---
          const userReportsWithCommentsRes = await fetch(`http://localhost:5000/api/reports/user/${userId}`);
          let fetchedUserCommentsCount = 0;
          if (userReportsWithCommentsRes.ok) {
            const userReports = await userReportsWithCommentsRes.json();
            userReports.forEach(report => {
              report.userComments.forEach(comment => {
                if (comment.userId === userId) {
                  fetchedUserCommentsCount++;
                }
              });
            });
            setUserCommentsCount(fetchedUserCommentsCount);
          } else {
            console.error(`Failed to fetch user reports for comment count for user ${userId}:`, await userReportsWithCommentsRes.text());
            setError("Failed to fetch comment count.");
          }

          // --- SIMULATED: User Distinct Locations ---
          // This needs backend support to aggregate distinct lat/lng or address for a user.
          let simulatedDistinctLocations = 0;
          if (fetchedUserReportsCount >= 3) {
            simulatedDistinctLocations = Math.min(3, fetchedUserReportsCount); // Simple simulation
          }
          setUserDistinctLocations(simulatedDistinctLocations);


          // --- SIMULATED: User Verified Reports Count ---
          // This needs specific backend logic to track which of a user's reports have been 'verified' by an NGO.
          let simulatedVerifiedReportsCount = 0;
          if (fetchedUserReportsCount >= 5) {
            simulatedVerifiedReportsCount = Math.min(5, Math.floor(fetchedUserReportsCount / 2)); // Simulate 50% verification
          }
          setUserVerifiedReportsCount(simulatedVerifiedReportsCount);


          // --- Calculate Earned Badges Client-Side ---
          // This calculation depends on the fetched stats, so it's done after fetching
          const calculatedEarnedBadges = {};
          allBadges.forEach(badge => {
            let criteriaMet = false;

            if (badge.criteria.minReports && fetchedUserReportsCount >= badge.criteria.minReports) {
              criteriaMet = true;
            } else if (badge.criteria.minComments && fetchedUserCommentsCount >= badge.criteria.minComments) {
              criteriaMet = true;
            } else if (badge.criteria.minDistinctLocations && simulatedDistinctLocations >= badge.criteria.minDistinctLocations) {
                criteriaMet = true;
            } else if (badge.criteria.minVerifiedReports && simulatedVerifiedReportsCount >= badge.criteria.minVerifiedReports) {
                criteriaMet = true;
            } else if (badge.criteria.minReportsByType) {
                const type = Object.keys(badge.criteria.minReportsByType)[0];
                const requiredCount = badge.criteria.minReportsByType[type];
                const simulatedActualTypeCount = (type === 'ramp' && fetchedUserReportsCount > 3) ? 4 : 0; // Example
                if (simulatedActualTypeCount >= requiredCount) {
                    criteriaMet = true;
                }
            } else if (badge.criteria.requiresBadges) {
                // For dependent badges, check against already calculated badges in this batch
                criteriaMet = badge.criteria.requiresBadges.every(reqBadgeId => calculatedEarnedBadges[reqBadgeId]);
            }

            if (criteriaMet) {
                // If the badge was already earned (from previous state), keep its original date.
                // Otherwise, mark it as earned with the current date.
                calculatedEarnedBadges[badge.id] = earnedBadgesMap[badge.id] || new Date().toISOString();
            }
          });
          setEarnedBadgesMap(calculatedEarnedBadges); // Update earnedBadgesMap here

        } catch (err) {
          console.error("Error fetching user achievements:", err);
          setError("Failed to load your achievements. Please check backend connection.");
        } finally {
          setLoading(false); // Set loading to false only after all fetches/calculations
        }
      };

      fetchUserAchievements();
    } else if (isAuthReady && !userId) {
      setLoading(false);
    }
  // Removed earnedBadgesMap from dependencies to prevent re-render loop
  }, [isAuthReady, userId]);

  // This useCallback is fine as its dependencies are stable (user counts, earnedBadgesMap)
  const calculateProgress = useCallback((badge) => {
    let progress = 0;
    let target = 1;
    let progressText = '';

    if (badge.criteria.minReports) {
      target = badge.criteria.minReports;
      progress = Math.min(userReportsCount, target);
      progressText = `${progress}/${target} reports`;
    } else if (badge.criteria.minComments) {
      target = badge.criteria.minComments;
      progress = Math.min(userCommentsCount, target);
      progressText = `${progress}/${target} comments`;
    } else if (badge.criteria.minDistinctLocations) {
      target = badge.criteria.minDistinctLocations;
      progress = Math.min(userDistinctLocations, target);
      progressText = `${progress}/${target} locations`;
    } else if (badge.criteria.minVerifiedReports) {
      target = badge.criteria.minVerifiedReports;
      progress = Math.min(userVerifiedReportsCount, target);
      progressText = `${progress}/${target} verified reports`;
    } else if (badge.criteria.minReportsByType) {
      const type = Object.keys(badge.criteria.minReportsByType)[0];
      target = badge.criteria.minReportsByType[type];
      const simulatedTypeCount = (type === 'ramp' && userReportsCount >= 5) ? 5 : 0; // Example
      progress = Math.min(simulatedTypeCount, target);
      progressText = `${progress}/${target} ${type} reports`;
    } else if (badge.criteria.requiresBadges) {
      const requiredEarned = badge.criteria.requiresBadges.filter(reqBadgeId => earnedBadgesMap[reqBadgeId]).length;
      target = badge.criteria.requiresBadges.length;
      progress = requiredEarned;
      progressText = `${progress}/${target} prerequisite badges`;
    }

    const percentage = target > 0 ? (progress / target) * 100 : 0;
    const isEarned = earnedBadgesMap[badge.id] !== undefined;

    return { progress, target, percentage, progressText, isEarned };
  }, [userReportsCount, userCommentsCount, userDistinctLocations, userVerifiedReportsCount, earnedBadgesMap]);


  const openBadgeDetails = (badge) => {
    setSelectedBadge({ ...badge, ...calculateProgress(badge) });
    setShowDetailsModal(true);
  };

  const closeBadgeDetails = () => {
    setShowDetailsModal(false);
    setSelectedBadge(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', newMode.toString()); // Save to localStorage
      return newMode;
    });
  };

  // Sort earned badges by most recent earned date
  const earnedBadges = allBadges
    .filter(badge => earnedBadgesMap[badge.id])
    .map(badge => ({ ...badge, earnedDate: new Date(earnedBadgesMap[badge.id]).toLocaleDateString() }))
    .sort((a, b) => new Date(b.earnedDate) - new Date(a.earnedDate));

  // Filter unearned badges and calculate their progress
  const unearnedBadges = allBadges
    .filter(badge => !earnedBadgesMap[badge.id])
    .map(badge => ({ ...badge, ...calculateProgress(badge) }));


  if (!isAuthReady || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: currentColors.backgroundBase, color: currentColors.textPrimary }}>
        <p className="text-xl">Loading your badges and achievements...</p>
      </div>
    );
  }

  // If not authenticated, display a message
  if (!userId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center" style={{ backgroundColor: currentColors.backgroundBase, color: currentColors.textPrimary }}>
        <h2 className="text-3xl font-bold mb-4">Access Denied</h2>
        <p className="text-lg mb-6">Please log in to view your badges and achievements.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-full text-white font-bold text-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
          style={{ background: `linear-gradient(to right, ${currentColors.primaryBrand}, ${currentColors.secondaryAccent})`, border: 'none' }}
        >
          Go to Login / Homepage
        </button>
      </div>
    );
  }

  // --- Circular Progress Bar Component (internal to BadgesPage) ---
  const CircularProgressBar = ({ percentage, strokeWidth, radius, color, bgColor, textColor }) => {
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center" style={{ width: `${(radius * 2) + (strokeWidth * 2)}px`, height: `${(radius * 2) + (strokeWidth * 2)}px` }}>
        <svg
          className="transform -rotate-90"
          width={radius * 2 + strokeWidth}
          height={radius * 2 + strokeWidth}
          viewBox={`0 0 ${radius * 2 + strokeWidth} ${radius * 2 + strokeWidth}`}
        >
          {/* Background circle */}
          <circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            stroke={bgColor}
          />
          {/* Progress circle */}
          <circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            stroke={percentage === 100 ? currentColors.secondaryAccent : color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out, stroke 0.3s ease-in-out' }}
          />
        </svg>
        <span className="absolute text-sm font-bold" style={{ color: textColor }}>
          {`${Math.round(percentage)}%`}
        </span>
      </div>
    );
  };
  // --- End Circular Progress Bar Component ---


  return (
    <div className="min-h-screen font-sans p-8" style={{ backgroundColor: currentColors.backgroundBase, color: currentColors.textPrimary }}>
      <header className="flex justify-between items-center p-4 rounded-xl mb-6 shadow-xl border transition-all duration-300" style={{ background: currentColors.headerBg, borderColor: currentColors.headerBorder }}>
        <h1 className="text-3xl font-bold" style={{ color: currentColors.textPrimary }}>Your Achievements</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-opacity-10"
            style={{ backgroundColor: currentColors.notificationUnreadBg, color: currentColors.primaryBrand }}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => navigate('/map')}
            className="px-4 py-2 rounded-full font-bold text-white transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
            style={{
              background: `linear-gradient(to right, ${currentColors.primaryBrand}, ${currentColors.secondaryAccent})`,
              border: 'none',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      {error && (
        <div className="px-4 py-3 rounded-lg mb-4 text-center animate-fade-in-down" style={{ borderColor: currentColors.errorBorder, backgroundColor: currentColors.errorBg, color: currentColors.errorText }}>
          <strong>Error: </strong>{error}
        </div>
      )}

      {/* User Progress Summary */}
      <section className="p-7 rounded-xl shadow-md border mb-8 text-center bg-gradient-to-br from-purple-100 to-yellow-50 dark:from-gray-800 dark:to-gray-900" style={{ backgroundColor: currentColors.cardBackground, borderColor: currentColors.cardBorder }}>
        <h2 className="text-3xl font-extrabold mb-3" style={{ color: currentColors.primaryBrand }}>
          You've earned <span className="text-4xl">{earnedBadges.length}</span> out of {allBadges.length} badges!
        </h2>
        <p className="text-xl" style={{ color: currentColors.textSecondary }}>Keep contributing to unlock more amazing achievements.</p>
      </section>

      {/* Earned Badges Section */}
      <section className="p-7 rounded-xl shadow-md border mb-8" style={{ backgroundColor: currentColors.cardBackground, borderColor: currentColors.cardBorder }}>
        <h2 className="text-2xl font-bold mb-5 border-b pb-3" style={{ color: currentColors.textPrimary, borderColor: currentColors.borderSubtle }}>
          🏆 Earned Badges
        </h2>
        {earnedBadges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="p-4 rounded-xl shadow-md flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.05] hover:shadow-lg cursor-pointer bg-gradient-to-t from-yellow-50 to-white dark:from-gray-700 dark:to-gray-800"
                style={{
                  background: currentColors.reportCardGradient,
                  border: `1px solid ${currentColors.reportCardBorder}`,
                  boxShadow: `0 4px 12px ${currentColors.reportCardShadow}`
                }}
                onClick={() => openBadgeDetails(badge)}
              >
                {/* Earned Badge Image */}
                <div className="mb-3 w-20 h-20 flex items-center justify-center rounded-full overflow-hidden border-2 p-1" style={{ borderColor: currentColors.primaryBrand, background: currentColors.secondaryAccent }}>
                   <img
                     src={`${process.env.PUBLIC_URL}/assets/badges/${badge.image}`}
                     alt={badge.name}
                     className="w-full h-full object-contain filter drop-shadow-md" // Added filter for subtle shadow on image
                     onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/80x80/${currentColors.primaryBrand.substring(1)}/ffffff?text=Badge`; }} // Fallback
                   />
                </div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: currentColors.textPrimary }}>{badge.name}</h3>
                <p className="text-sm font-light italic" style={{ color: currentColors.textSecondary }}>Earned: {badge.earnedDate}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-xl font-medium" style={{ color: currentColors.textSecondary }}>You haven't earned any badges yet. Start contributing!</p>
        )}
      </section>

      {/* Available Badges / Challenges Section */}
      <section className="p-7 rounded-xl shadow-md border" style={{ backgroundColor: currentColors.cardBackground, borderColor: currentColors.cardBorder }}>
        <h2 className="text-2xl font-bold mb-5 border-b pb-3" style={{ color: currentColors.textPrimary, borderColor: currentColors.borderSubtle }}>
          🌟 Available Badges & Challenges
        </h2>
        {unearnedBadges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {unearnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="p-4 rounded-xl shadow-md flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.05] hover:shadow-lg cursor-pointer bg-gradient-to-t from-gray-50 to-white dark:from-gray-800 dark:to-gray-900"
                style={{
                  background: currentColors.reportCardGradient,
                  border: `1px solid ${currentColors.reportCardBorder}`,
                  boxShadow: `0 4px 12px ${currentColors.reportCardShadow}`
                }}
                onClick={() => openBadgeDetails(badge)}
              >
                {/* Unearned Badge Image (faded) */}
                <div className="mb-3 w-20 h-20 flex items-center justify-center rounded-full overflow-hidden border-2 p-1 opacity-70" style={{ borderColor: currentColors.textSecondary, background: currentColors.borderSubtle }}>
                   <img
                     src={`${process.env.PUBLIC_URL}/assets/badges/${badge.image}`}
                     alt={badge.name}
                     className="w-full h-full object-contain filter grayscale" // Added grayscale for unearned
                     onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/80x80/${currentColors.textSecondary.substring(1)}/ffffff?text=Badge`; }} // Fallback
                   />
                </div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: currentColors.textPrimary }}>{badge.name}</h3>
                <p className="text-sm mb-2 flex-grow" style={{ color: currentColors.textSecondary }}>{badge.description}</p>

                {/* Circular Progress Bar */}
                <div className="mt-4">
                  <CircularProgressBar
                    percentage={badge.percentage}
                    strokeWidth={8}
                    radius={30}
                    color={currentColors.primaryBrand}
                    bgColor={currentColors.borderSubtle}
                    textColor={currentColors.textPrimary}
                  />
                </div>
                <p className="text-xs mt-3 font-medium" style={{ color: currentColors.textSecondary }}>
                  {badge.progressText}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-xl font-medium" style={{ color: currentColors.textSecondary }}>You've earned all available badges! Great job!</p>
        )}
      </section>

      {/* Badge Details Modal */}
      {showDetailsModal && selectedBadge && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg shadow-xl w-full max-w-lg p-6 relative flex flex-col animate-scale-in" style={{ backgroundColor: currentColors.cardBackground, color: currentColors.textPrimary }}>
            <button
              onClick={closeBadgeDetails}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <XCircle size={24} style={{ color: currentColors.iconMuted }} />
            </button>
            <div className="flex flex-col items-center mb-4">
              {/* Modal Badge Image */}
              <div className="mb-4 w-32 h-32 flex items-center justify-center rounded-full overflow-hidden border-4 p-2" style={{ borderColor: selectedBadge.isEarned ? currentColors.primaryBrand : currentColors.textSecondary, opacity: selectedBadge.isEarned ? 1 : 0.6, background: selectedBadge.isEarned ? currentColors.secondaryAccent : currentColors.borderSubtle }}>
                 <img
                   src={`${process.env.PUBLIC_URL}/assets/badges/${selectedBadge.image}`}
                   alt={selectedBadge.name}
                   className="w-full h-full object-contain filter drop-shadow-lg"
                   onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/100x100/${currentColors.primaryBrand.substring(1)}/ffffff?text=Badge`; }} // Fallback
                   />
              </div>
              <h3 className="text-3xl font-bold mb-2" style={{ color: currentColors.textPrimary }}>{selectedBadge.name}</h3>
              <p className="text-lg text-center" style={{ color: currentColors.textSecondary }}>{selectedBadge.description}</p>
            </div>

            <div className="border-t pt-4 mt-4" style={{ borderColor: currentColors.borderSubtle }}>
              {selectedBadge.isEarned ? (
                <p className="text-center text-xl font-semibold" style={{ color: currentColors.primaryBrand }}>
                  Earned on: {selectedBadge.earnedDate} 🎉
                </p>
              ) : (
                <>
                  <p className="text-xl font-semibold mb-2" style={{ color: currentColors.textPrimary }}>How to Earn:</p>
                  <ul className="text-md mb-3 text-left w-full pl-5 list-disc space-y-2" style={{ color: currentColors.textSecondary }}>
                    {Object.entries(selectedBadge.criteria).map(([key, value]) => {
                      let criterionText = '';
                      switch (key) {
                        case 'minReports':
                          criterionText = `Submit ${value} reports.`;
                          break;
                        case 'minComments':
                          criterionText = `Leave ${value} comments.`;
                          break;
                        case 'minDistinctLocations':
                          criterionText = `Report from ${value} distinct locations.`;
                          break;
                        case 'minVerifiedReports':
                          criterionText = `Have ${value} of your reports verified as correct.`;
                          break;
                        case 'minReportsByType':
                          const type = Object.keys(value)[0];
                          const count = value[type];
                          criterionText = `Submit ${count} reports specifically about ${type}s.`;
                          break;
                        case 'requiresBadges':
                          const requiredBadgeNames = value.map(id => allBadges.find(b => b.id === id)?.name || id);
                          criterionText = `Earn the following badges: ${requiredBadgeNames.join(', ')}.`;
                          break;
                        default:
                          criterionText = `Meet a custom criterion: ${JSON.stringify(value)}.`;
                      }
                      return <li key={key}>{criterionText}</li>;
                    })}
                  </ul>
                  {/* Circular progress in modal for current badge progress */}
                  <div className="flex justify-center mt-6 mb-4">
                    <CircularProgressBar
                      percentage={selectedBadge.percentage}
                      strokeWidth={12}
                      radius={50}
                      color={currentColors.primaryBrand}
                      bgColor={currentColors.borderSubtle}
                      textColor={currentColors.textPrimary}
                    />
                  </div>
                  <p className="text-md mt-2 text-center font-medium" style={{ color: currentColors.textSecondary }}>
                    Current Progress: {selectedBadge.progressText}
                  </p>
                </>
              )}
            </div>
            <button
              onClick={closeBadgeDetails}
              className="mt-6 px-8 py-3 rounded-full text-white font-bold text-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
              style={{
                background: `linear-gradient(to right, ${currentColors.primaryBrand}, ${currentColors.secondaryAccent})`,
                border: 'none',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Custom CSS for scrollbar and animation */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${darkMode ? '#3A445C' : '#F0F2F5'}; /* Track color */
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#6A0DAD' : '#A855F7'}; /* Thumb color */
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#7B24C0' : '#D8B4FE'}; /* Hover thumb color */
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default BadgesPage;

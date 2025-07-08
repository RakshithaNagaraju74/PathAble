// File: MapView.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth';
import { collection, onSnapshot, query, where, orderBy, limit, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  Loader2, Search, PlusCircle, MapPin, Award, Gauge, User, Clock, CheckCircle, LogOut, FileText, BadgeInfo,
  Compass, Star, Trophy, MessageSquare, Bell, Send, XCircle, ChevronRight, Home, Settings, MoreHorizontal, Sun, Moon,
  Heart, ThumbsUp, Globe, Users, TrendingUp, Ruler, Toilet, ArrowUpSquare, Car, DoorOpen, Footprints, ShieldCheck, Ban, Building, BarChart // Added BarChart icon
} from 'lucide-react';

import { auth, db } from '../firebase'; // Ensure your firebase.js correctly exports 'auth'
// AddReportModal is now assumed to be AddReportPage and handled by router
// import AddReportModal from './AddReportPage'; 
import { useNavigate } from 'react-router-dom';
import { searchPlace } from '../utils/locationUtils'; // Import searchPlace from new utilities

// Leaflet imports for the map functionality
import { MapContainer, TileLayer, Marker, Popup, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix for Leaflet's default icon issue with Webpack/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Application Brand Name (Centralized)
const APP_BRAND_NAME = "ACCESSIBILITY MAP";

// Default map center (Bengaluru)
const MAP_CENTER = [12.9716, 77.5946];

// Color Palette for a more vibrant and professional look
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
    avatarBg: '#A78BFA', // Light purple for avatar background in light mode - ensuring it's a string
    cardBorder: '#D1D5DB', // A clearer, slightly darker gray for card borders
    reportCardGradient: 'linear-gradient(to bottom right, #FDFDFD, #F0F2F5)', // Very subtle, clean gradient
    reportCardBorder: '#E0E7FF', // Soft bluish border
    reportCardShadow: 'rgba(0, 0, 0, 0.1)', // Subtle shadow for report cards
    headerBg: 'linear-gradient(to right, #F8F8FF, #FFFFFF)', // Light blueish gradient for header
    headerBorder: '#D1D5DB', // A clearer border for the header
    verifiedBg: '#D4EDDA', // Light green for verified status
    verifiedText: '#155724', // Dark green for verified text
    spamBg: '#FDECEF', // Light pink for spam status
    spamText: '#B30000', // Dark red for spam text
    ngoAccountBg: '#BBF7D0', // Light green for NGO account badge
    ngoAccountText: '#16A34A', // Darker green for NGO account badge text
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
    verifiedBg: '#0A3F1F', // Dark green for verified status
    verifiedText: '#6CFF9D', // Light green for verified text
    spamBg: '#5A0000', // Dark red for spam status
    spamText: '#FF8A8A', // Light red for spam text
    ngoAccountBg: '#1C743E', // Dark green for NGO account badge
    ngoAccountText: '#6CFF9D', // Light green for NGO account badge text
  }
};


// All defined badges with their criteria and image file names (copied from BadgesPage.jsx)
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


// Map report types to Lucide icons for visual representation
const FileTextIcon = {
  ramp: <Ruler size={18} className="text-purple-500" />,
  restroom: <Toilet size={18} className="text-pink-500" />,
  elevator: <ArrowUpSquare size={18} className="text-blue-500" />,
  parking: <Car size={18} className="text-gray-500" />,
  entrance: <DoorOpen size={18} className="text-green-500" />,
  pathway: <Footprints size={18} className="text-brown-500" />,
  other: <FileText size={18} className="text-yellow-500" />,
};


// Mock Notifications Structure (to simulate notifications)
const initialNotifications = [
  { id: 'notif1', type: 'comment', message: 'UserX commented on your report "Ramp at Park".', read: false, timestamp: new Date(Date.now() - 3600000) }, // 1 hour ago
  { id: 'notif2', type: 'badge', message: 'You\'ve unlocked the Contributor badge!', read: false, timestamp: new Date(Date.now() - 7200000) }, // 2 hours ago
  { id: 'notif3', type: 'system', message: 'Welcome to the Accessibility Map!', read: true, timestamp: new Date(Date.now() - 86400000) }, // 1 day ago
];

const MapView = () => {
  const [accessibilityReports, setAccessibilityReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('Guest');
  const [userEmail, setUserEmail] = useState('guest@example.com');
  const [memberSince, setMemberSince] = useState('N/A'); // New state for registration date
  const [totalUserReports, setTotalUserReports] = useState(0);
  const [lastContribution, setLastContribution] = useState(null);
  const [currentBadge, setCurrentBadge] = useState(allBadges[0]); // Default to First Report Pioneer
  const [isNgoAccount, setIsNgoAccount] = useState(false); // NEW: State to track if user is an NGO account
  const [loggedInNgoId, setLoggedInNgoId] = useState(null); // NEW: Store NGO ID if logged in as NGO
  const [isGloballySpammed, setIsGloballySpammed] = useState(false); // NEW: User's global spam status


  const [isAuthReady, setIsAuthReady] = useState(false); // New state to track Firebase auth readiness

  // New states for Global Insights
  const [totalGlobalReports, setTotalGlobalReports] = useState(0);
  const [activeContributorsCount, setActiveContributorsCount] = useState(0);
  const [newReportsTodayCount, setNewReportsTodayCount] = useState(0);


  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest'); // Now directly controls the sorting for 'filteredReports'

  // Removed showAddReportModal and selectedLocation as they are no longer needed for map interaction
  // The AddReportPage will be navigated to directly.
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [currentReportForComments, setCurrentReportForComments] = useState(null);

  const [notifications, setNotifications] = useState(initialNotifications);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [error, setError] = useState(null); // Moved error state here for global management

  // Initialize darkMode from localStorage or default to false
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' ? true : false;
  });

  const navigate = useNavigate();


  // Get current color scheme
  const currentColors = darkMode ? colors.dark : colors.light;

  // Calculate unreadNotificationsCount here, after 'notifications' state is declared
  const unreadNotificationsCount = notifications.filter(notif => !notif.read).length;

  // Determine if any search/filter is active
  const isSearchOrFilterActive = searchTerm !== '' || filterType !== 'all' || sortOrder !== 'newest';


  // Sidebar navigation items now aligned with project content (English)
  const sidebarNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} />, path: '/map' },
    {
      id: 'addReport', label: 'Submit New Report', icon: <PlusCircle size={20} />, action: () => {
        if (userId) {
          // This button navigates to the AddReportPage without pre-filled coords
          navigate('/add-report', {
            state: {
              userId: userId,
              initialLat: null,
              initialLng: null,
              isNgo: isNgoAccount,
              loggedInNgoId: loggedInNgoId
            }
          });
        } else {
          setError("Please authenticate to add a report.");
        }
      }
    },
    { id: 'myContributions', label: 'My Contributions', icon: <FileText size={20} />, path: '/my-contributions' },
    { id: 'badges', label: 'My Badges', icon: <Award size={20} />, path: '/badges' },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} />, action: () => setShowNotificationsModal(true), count: unreadNotificationsCount },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} />, path: '/settings' },
    { id: 'userAnalytics', label: 'Analytics', icon: <BarChart size={20} />, path: '/user-analytics' }, // NEW: Analytics Link // Existing NGO Dashboard link
  ];

  // Function to handle new marker creation from the map
  const handleMarkerAdd = useCallback((lat, lng) => {
    if (userId) {
      // Navigate to the AddReportPage, passing coordinates as state
      navigate('/add-report', {
        state: {
          userId: userId,
          initialLat: lat,
          initialLng: lng,
          isNgo: isNgoAccount,
          loggedInNgoId: loggedInNgoId
        }
      });
    } else {
      setError("Please log in to add a report via the map.");
    }
  }, [userId, isNgoAccount, loggedInNgoId, navigate]);


  // 1. Authenticate and fetch user data (no anonymous sign-in)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('onAuthStateChanged fired. User:', user);
      if (user) {
        setUserId(user.uid);
        setUserEmail(user.email || 'N/A');

        try {
          const mongoRes = await fetch(`http://localhost:5000/api/users/${user.uid}`);
          let mongoData = null;
          if (mongoRes.ok && mongoRes.headers.get('content-type')?.includes('application/json')) {
            mongoData = await mongoRes.json();
          }

          if (!mongoRes.ok || !mongoData) {
            console.warn("User not found in MongoDB or data is empty. Attempting to create new user record.");
            try {
              const createRes = await fetch('http://localhost:5000/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  uid: user.uid,
                  firstName: user.displayName ? user.displayName.split(' ')[0] : 'Unnamed',
                  lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : 'User',
                  email: user.email || 'no-email@example.com' // Fallback for email if not present
                }),
              });
              if (createRes.ok) {
                console.log("New user record created in MongoDB.");
                const reFetchRes = await fetch(`http://localhost:5000/api/users/${user.uid}`);
                if (reFetchRes.ok && reFetchRes.headers.get('content-type')?.includes('application/json')) {
                  mongoData = await reFetchRes.json();
                } else {
                  console.error("Failed to re-fetch user after creation:", await reFetchRes.text());
                  setError("Failed to confirm user creation. Data might not persist across sessions.");
                }
              } else {
                const createErrorText = await createRes.text();
                if (createRes.status === 409) {
                  console.warn("User already exists in MongoDB, likely a race condition or previous creation. Attempting to fetch existing data.");
                  const reFetchExistingRes = await fetch(`http://localhost:5000/api/users/${user.uid}`);
                  if (reFetchExistingRes.ok && reFetchExistingRes.headers.get('content-type')?.includes('application/json')) {
                    mongoData = await reFetchExistingRes.json();
                  } else {
                    console.error("Failed to re-fetch existing user after 409 conflict:", await reFetchExistingRes.text());
                    setError("Could not retrieve existing user data after a create conflict.");
                  }
                } else {
                  console.error("Failed to create new user record in MongoDB:", createErrorText);
                  setError(`Failed to create user record: ${createErrorText}. Please check backend logs.`);
                }
              }
            } catch (createError) {
              console.error("Error during user creation attempt in MongoDB:", createError);
              setError("Error creating user in MongoDB: " + createError.message);
            }
          }

          setUserName(mongoData?.firstName ? `${mongoData.firstName} ${mongoData.lastName || ''}`.trim() : user.displayName || 'Authenticated User');
          if (mongoData?.createdAt) {
            setMemberSince(new Date(mongoData.createdAt).toLocaleDateString());
          } else if (user.metadata?.creationTime) {
            setMemberSince(new Date(user.metadata.creationTime).toLocaleDateString());
          } else {
            setMemberSince('N/A');
          }
          // NEW: Set NGO account status and loggedInNgoId if applicable
          setIsNgoAccount(mongoData?.isNgoAccount || false);
          if (mongoData?.isNgoAccount) {
            // Assuming NGO's UID is their mongoId for simplicity or stored elsewhere
            setLoggedInNgoId(mongoData?._id); // Assuming _id from Mongo user is the NGO ID
          } else {
            setLoggedInNgoId(null);
          }
          // NEW: Set global spam status
          setIsGloballySpammed(mongoData?.isGloballySpammed || false);

        } catch (error) {
          console.error("Error during initial user data fetching/processing:", error);
          setError("Failed to load user profile due to an unexpected error. Please check backend connection and console for details.");
        }
      } else {
        // If no user is authenticated, redirect to login/home page
        console.log('No authenticated user. Redirecting to /');
        setUserId(null); // Clear userId state
        setUserName('Guest'); // Reset user name
        setUserEmail('guest@example.com');
        setMemberSince('N/A');
        setTotalUserReports(0);
        setLastContribution(null);
        setCurrentBadge(allBadges[0]); // Reset to default badge
        setIsNgoAccount(false); // Reset NGO status
        setLoggedInNgoId(null); // Clear NGO ID
        setIsGloballySpammed(false); // Reset global spam status
        navigate('/'); // Redirect to home/login page
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs once on component mount


  // 4. Fetch Accessibility Reports from MongoDB
  useEffect(() => {
    if (isAuthReady) {
      const fetchReports = async () => {
        try {
          console.log('Fetching all accessibility reports...');
          // Fetch reports for regular user view (not marked as spam by any NGO)
          const response = await fetch('http://localhost:5000/api/reports');
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`HTTP error fetching reports! Status: ${response.status}, Response: ${errorText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log('All accessibility reports fetched:', data);
          setAccessibilityReports(Array.isArray(data) ? data : []);
          setLoading(false);
        } catch (err) {
          console.error("Failed to fetch reports:", err);
          setError("Failed to load accessibility reports. Make sure your backend server is running on http://localhost:5000.");
          setAccessibilityReports([]);
          setLoading(false);
        }
      };

      fetchReports();
      const intervalId = setInterval(fetchReports, 30000);

      return () => clearInterval(intervalId);
    }
  }, [isAuthReady]);

  // NEW: Fetch Global Accessibility Insights
  useEffect(() => {
    if (isAuthReady) {
      const fetchGlobalInsights = async () => {
        try {
          // Fetch total reports count
          console.log('Fetching total reports count...');
          const totalReportsRes = await fetch('http://localhost:5000/api/reports/count');
          if (totalReportsRes.ok) {
            const data = await totalReportsRes.json();
            console.log('Total reports count:', data.totalReports);
            setTotalGlobalReports(data.totalReports);
          } else {
            const errorText = await totalReportsRes.text();
            console.error(`Failed to fetch total global reports count! Status: ${totalReportsRes.status}, Response: ${errorText}`);
            setTotalGlobalReports(0); // Fallback
          }

          // Fetch active contributors count
          console.log('Fetching active contributors count...');
          const activeContributorsRes = await fetch('http://localhost:5000/api/reports/active-contributors');
          if (activeContributorsRes.ok) {
            const data = await activeContributorsRes.json();
            console.log('Active contributors count:', data.activeContributorsCount);
            setActiveContributorsCount(data.activeContributorsCount);
          } else {
            const errorText = await activeContributorsRes.text(); // Corrected variable name here
            console.error(`Failed to fetch active contributors count! Status: ${activeContributorsRes.status}, Response: ${errorText}`);
            setActiveContributorsCount(0); // Fallback
          }

          // Fetch new reports today count
          console.log('Fetching new reports today count...');
          const newReportsTodayRes = await fetch('http://localhost:5000/api/reports/today-count');
          if (newReportsTodayRes.ok) {
            const data = await newReportsTodayRes.json();
            console.log('New reports today count:', data.newReportsToday);
            setNewReportsTodayCount(data.newReportsToday);
          } else {
            const errorText = await newReportsTodayRes.text();
            console.error(`Failed to fetch new reports today count! Status: ${newReportsTodayRes.status}, Response: ${errorText}`);
            setNewReportsTodayCount(0); // Fallback
          }

        } catch (err) {
          console.error("Error fetching global insights:", err);
          setError("Failed to load global insights. Check backend server and console for details.");
        }
      };
      fetchGlobalInsights();
      const intervalId = setInterval(fetchGlobalInsights, 60000); // Poll every minute
      return () => clearInterval(intervalId);
    }
  }, [isAuthReady]); // Depends on auth readiness

  // 5. Filter and Sort Reports
  useEffect(() => {
    let currentReports = [...accessibilityReports];

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentReports = currentReports.filter(report =>
        report.placeName?.toLowerCase().includes(lowerCaseSearchTerm) ||
        report.address?.toLowerCase().includes(lowerCaseSearchTerm) ||
        report.comment?.toLowerCase().includes(lowerCaseSearchTerm) ||
        report.type?.toLowerCase().includes(lowerCaseSearchTerm) ||
        report.city?.toLowerCase().includes(lowerCaseSearchTerm) || // Include city in search
        report.district?.toLowerCase().includes(lowerCaseSearchTerm) || // Include district in search
        report.postalCode?.toLowerCase().includes(lowerCaseSearchTerm) // Include postalCode in search
      );
    }

    if (filterType !== 'all') {
      currentReports = currentReports.filter(report => report.type === filterType);
    }

    currentReports.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredReports(currentReports);
  }, [accessibilityReports, searchTerm, filterType, sortOrder]);


  // 7. Geocode search term and recenter map (No longer used without map)
  const handleSearchSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!searchTerm) {
      setError('Please enter a search term.');
      return;
    }

    // Using searchPlace from locationUtils, but not for map re-centering
    // as the map component itself is not rendered here.
    // The search term will be used for client-side filtering of reports.
    try {
      const geoResults = await searchPlace(searchTerm);
      if (geoResults.length > 0) {
        // If we get coordinates, we could theoretically use them for more advanced filtering
        // (e.g., proximity search), but for now, the filtering remains string-based.
        console.log("Geocoded search term:", geoResults[0].lat, geoResults[0].lon);
        // No direct map action here. The useEffect for filtering will handle the searchTerm.
      } else {
        setError("Location not found via geocoding. Filtering will proceed based on text match only.");
      }
    } catch (err) {
      console.error("Geocoding search term failed:", err);
      setError("Geocoding search failed. Filtering will proceed based on text match only.");
    }
  }, [searchTerm]);


  // 8. Fetch user's total contributions and last contribution
  useEffect(() => {
    if (isAuthReady && userId) {
      const fetchUserContributions = async () => {
        try {
          console.log(`Fetching user contributions for ${userId}...`);
          const totalRes = await fetch(`http://localhost:5000/api/reports/user/${userId}/contributions`);
          if (totalRes.ok) {
            const data = await totalRes.json();
            console.log('Total user contributions:', data.totalContributions);
            setTotalUserReports(data.totalContributions);

            // Update currentBadge based on total contributions using the new allBadges structure
            const newBadge = allBadges.find(badge =>
              badge.criteria.minReports && data.totalContributions >= badge.criteria.minReports
            ) || allBadges[0]; // Fallback to 'First Report Pioneer' or appropriate default
            setCurrentBadge(newBadge);
          } else {
            const errorText = await totalRes.text();
            console.error(`Failed to fetch total user contributions! Status: ${totalRes.status}, Response: ${errorText}`);
            setTotalUserReports(0);
          }

          console.log(`Fetching recent reports for user ${userId}...`);
          const recentReportsRes = await fetch(`http://localhost:5000/api/reports/user/${userId}`);
          if (recentReportsRes.ok) {
            const data = await recentReportsRes.json();
            console.log('Recent user reports:', data);
            if (data.length > 0) {
              setLastContribution(new Date(data[0].timestamp).toLocaleDateString());
            } else {
              setLastContribution('N/A');
            }
          } else {
            const errorText = await recentReportsRes.text();
            console.error(`Failed to fetch user's recent reports! Status: ${recentReportsRes.status}, Response: ${errorText}`);
            setLastContribution('N/A');
          }

        } catch (err) {
          console.error("Error fetching user contributions:", err);
          setTotalUserReports(0);
          setLastContribution('N/A');
        }
      };
      fetchUserContributions();
      const intervalId = setInterval(fetchUserContributions, 60000);
      return () => clearInterval(intervalId);
    }
  }, [userId, accessibilityReports, isAuthReady]);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserId(null);
      setUserName('Guest');
      setUserEmail('guest@example.com');
      setMemberSince('N/A');
      setTotalUserReports(0);
      setLastContribution(null);
      setCurrentBadge(allBadges[0]); // Reset to default badge
      setIsNgoAccount(false); // Reset NGO status
      setLoggedInNgoId(null); // Clear NGO ID
      setIsGloballySpammed(false); // Reset global spam status
      navigate('/');
    } catch (error) {
      console.error("Error logging out:", error);
      setError("Failed to log out.");
    }
  };

  const handleLikeComment = async (reportId, commentIndex) => {
    if (!userId) {
      setError("Please log in to like comments.");
      return;
    }

    try {
      // Optimistically update UI
      setAccessibilityReports(prevReports => {
        return prevReports.map(report => {
          if (report._id === reportId) {
            const updatedComments = report.userComments.map((comment, idx) => {
              if (idx === commentIndex) {
                const likedBy = comment.likedBy || [];
                const isLiked = likedBy.includes(userId);
                const newLikedBy = isLiked
                  ? likedBy.filter(id => id !== userId)
                  : [...likedBy, userId];
                return { ...comment, likedBy: newLikedBy };
              }
              return comment;
            });
            return { ...report, userComments: updatedComments };
          }
          return report;
        });
      });

      if (currentReportForComments && currentReportForComments._id === reportId) {
        setCurrentReportForComments(prev => {
          const updatedComments = prev.userComments.map((comment, idx) => {
            if (idx === commentIndex) {
              const likedBy = comment.likedBy || [];
              const isLiked = likedBy.includes(userId);
              const newLikedBy = isLiked
                ? likedBy.filter(id => id !== userId)
                : [...likedBy, userId];
              return { ...comment, likedBy: newLikedBy };
            }
            return comment;
          });
          return { ...prev, userComments: updatedComments };
        });
      }

      // Persist like/unlike to backend
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}/comments/${commentIndex}/like`, {
        method: 'POST', // Or PATCH, depending on your backend implementation
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to toggle like on backend! Status: ${response.status}, Response: ${errorText}`);
        // Revert optimistic update if backend call fails (optional, but good practice)
        setError("Failed to update like. Please try again.");
      } else {
        console.log("Like/unlike updated on backend successfully.");
        // If necessary, you could re-fetch reports here to ensure full data consistency if needed, or rely on optimistic update
        // (For a real-time app, websocket or snapshot listeners would handle this)
      }

    } catch (err) {
      console.error("Error liking comment:", err);
      setError("Failed to like comment: " + err.message);
    }
  };

  const handleCommentSubmit = async (reportId, commentText) => {
    if (!commentText.trim() || !userId || !userName) {
      setError("Comment cannot be empty and you must be logged in.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          userName: userName,
          commentText: commentText,
        }),
      });

      if (!response.ok) {
        const responseText = await response.text();
        let errorMessage = `Failed to add comment: HTTP ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          errorMessage = `${errorMessage}. Server response was not JSON. Response: ${responseText.substring(0, 100)}...`;
          console.error("Backend response was not JSON:", responseText);
        }
        throw new Error(errorMessage);
      }

      const updatedReport = await response.json();
      setAccessibilityReports(prevReports =>
        prevReports.map(report =>
          report._id === reportId ? { ...report, userComments: updatedReport.userComments } : report
        )
      );
      if (currentReportForComments && currentReportForComments._id === reportId) {
        setCurrentReportForComments(prev => ({ ...prev, userComments: updatedReport.userComments }));
      }


      const commentedReport = accessibilityReports.find(r => r._id === reportId);
      if (commentedReport && commentedReport.reportedBy !== userId) {
        setNotifications(prevNotifs => [
          {
            id: `comment-${reportId}-${Date.now()}`,
            type: 'comment',
            message: `${userName} commented on your report: "${commentedReport.type}".`,
            read: false,
            timestamp: new Date(),
          },
          ...prevNotifs,
        ]);
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      setError(err.message);
    }
  };

  // NEW: handleTrustReport function
  const handleTrustReport = async (reportId) => {
    if (!userId) {
      setError("Please log in to trust reports.");
      return;
    }

    try {
      // Optimistic update
      setAccessibilityReports(prevReports => {
        return prevReports.map(report => {
          if (report._id === reportId) {
            const trustedBy = report.trustedBy || [];
            const isTrusted = trustedBy.includes(userId);
            const newTrustedBy = isTrusted
              ? trustedBy.filter(id => id !== userId)
              : [...trustedBy, userId];
            return { ...report, trustedBy: newTrustedBy };
          }
          return report;
        });
      });

      // Persist trust/untrust to backend
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}/trust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to toggle trust on backend! Status: ${response.status}, Response: ${errorText}`);
        setError("Failed to update trust reaction. Please try again.");
      } else {
        console.log("Trust reaction updated on backend successfully.");
        // If necessary, you could re-fetch reports here to ensure full data consistency if needed, or rely on optimistic update
        // (For a real-time app, websocket or snapshot listeners would handle this)
      }
    } catch (err) {
      console.error("Error toggling trust:", err);
      setError("Failed to toggle trust: " + err.message);
    }
  };


  const markNotificationAsRead = (id) => {
    setNotifications(prevNotifs =>
      prevNotifs.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };


  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', newMode.toString()); // Save to localStorage
      return newMode;
    });
  };

  // Display loading screen until authentication is ready AND initial data is fetched
  if (!isAuthReady || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col font-inter" style={{ backgroundColor: currentColors.backgroundBase }}>
        <Loader2 className="animate-spin mb-4" size={64} style={{ color: currentColors.primaryBrand }} />
        <span className="text-3xl font-semibold" style={{ color: currentColors.textPrimary }}>
          {isAuthReady ? "Loading Accessibility Reports..." : "Initializing Authentication..."}
        </span>
        <p className="text-lg mt-2" style={{ color: currentColors.textSecondary }}>Please wait a moment...</p>
      </div>
    );
  }

  // If user is globally spammed, redirect them to the SpamAccountPage
  if (isGloballySpammed) {
      navigate('/spam-account'); // Redirect to SpamAccountPage
      return null; // Don't render anything from MapView
  }


  return (
    <div className="flex min-h-screen font-inter transition-colors duration-500" style={{ backgroundColor: currentColors.backgroundBase, color: currentColors.textPrimary }}>
      {/* Left Sidebar */}
      <aside className="w-64 flex-shrink-0 p-6 flex flex-col rounded-2xl m-4 shadow-lg transition-colors duration-500" style={{ background: currentColors.sidebarBg }}>
        {/* Brand Name */}
        <div className="flex items-center mb-10 mt-2">
          <span className="text-xl font-bold" style={{ color: currentColors.primaryBrand }}>{APP_BRAND_NAME}</span>
        </div>

        {/* Profile Snapshot */}
        <div className="flex flex-col items-center mb-8">
          <img
            // Added defensive checks for currentColors.avatarBg and userName
            src={`https://placehold.co/100x100/${currentColors.avatarBg ? currentColors.avatarBg.substring(1) : 'A78BFA'}/ffffff?text=${userName ? userName.charAt(0).toUpperCase() : '?'}`}
            alt="User Avatar"
            className="w-20 h-20 rounded-full mb-3 object-cover shadow-md border-4"
            style={{ borderColor: currentColors.secondaryAccent }}
          />
          <p className="font-semibold text-lg" style={{ color: currentColors.textPrimary }}>
            {userName}
            {isNgoAccount && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: currentColors.ngoAccountBg, color: currentColors.ngoAccountText }}>
                NGO
              </span>
            )}
          </p>
          <p className="text-sm" style={{ color: currentColors.textSecondary }}>{userEmail}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-grow">
          <ul className="space-y-3">
            {sidebarNavItems.map((item) => {
              const isActive = item.id === 'dashboard'; // Determine active state based on current page/component
              return (
                <li key={item.id}>
                  <button
                    onClick={item.action ? item.action : () => navigate(item.path)}
                    className={`flex items-center w-full py-3 px-4 rounded-xl transition-all duration-300 relative overflow-hidden group
                      ${isActive
                        ? 'font-semibold text-white shadow-xl'
                        : 'hover:scale-[1.02] hover:shadow-md' // Enhanced hover effect
                      }`}
                    style={{
                      background: isActive ? currentColors.sidebarActiveBg : 'transparent',
                      color: isActive ? currentColors.sidebarActiveText : currentColors.textSecondary,
                      backgroundColor: isActive ? undefined : currentColors.sidebarHoverBg // Apply hover color
                    }}
                  >
                    {/* Background glow for active item */}
                    {isActive && (
                      <span className="absolute inset-0 bg-white opacity-10 blur-xl scale-150 rounded-full group-hover:scale-100 transition-transform duration-500"></span>
                    )}
                    {React.cloneElement(item.icon, { className: `mr-3 z-10 ${isActive ? 'text-white' : currentColors.iconMuted}` })}
                    <span className="z-10">{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-red-500 text-white z-10">
                        {item.count}
                      </span>
                    )}
                    <ChevronRight size={16} className={`ml-auto z-10 transition-transform duration-200 ${isActive ? 'translate-x-1' : ''}`} style={{ color: isActive ? currentColors.sidebarActiveText : currentColors.iconMuted }} />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Graphic (placeholder matching image aesthetic) */}
        <div className="mt-auto pt-6 flex items-center justify-center relative h-32 overflow-hidden rounded-xl" style={{ background: currentColors.premiumBg }}>
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full object-cover opacity-70">
            <path fill="#ffffff" d="M37.9,-54.6C51.6,-50.2,65.6,-40.7,71.7,-27.1C77.9,-13.4,76.2,4.4,70.5,19.3C64.8,34.2,55.1,46.2,42.5,54.7C29.9,63.2,14.9,68.2,0,68.2C-14.9,68.2,-29.9,63.2,-42.5,54.7C-55.1,46.2,-64.8,34.2,-70.5,19.3C-76.2,4.4,-77.9,-13.4,-71.7,-27.1C-65.6,-40.7,-51.6,-50.2,-37.9,-54.6C-24.1,-59,-12.1,-58,-0.1,-58C11.9,-58,23.8,-59,37.9,-54.6Z" transform="translate(100 100)" />
          </svg>
          <div className="relative z-10 text-white text-center">
            <p className="font-bold text-lg">Go Premium!</p>
            <p className="text-sm">Unlock more features</p>
          </div>
        </div>

        {/* Dark/Light Mode Toggle */}
        <div className="mt-4 pt-4 border-t" style={{ borderColor: currentColors.borderSubtle }}>
          <button
            onClick={toggleDarkMode}
            className="w-full py-3 px-5 rounded-xl font-semibold transition duration-200 flex items-center justify-center hover:scale-[1.02] hover:shadow-md"
            style={{ backgroundColor: currentColors.backgroundBase, color: currentColors.textPrimary }}
          >
            {darkMode ? <Sun size={20} className="mr-2" /> : <Moon size={20} className="mr-2" />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>


        {/* Logout Button (moved to sidebar bottom) */}
        <div className="mt-4 pt-4 border-t" style={{ borderColor: currentColors.borderSubtle }}>
          <button
            onClick={handleLogout}
            className="w-full py-3 px-5 rounded-xl font-semibold transition duration-200 flex items-center justify-center text-red-600 hover:bg-red-100 hover:text-red-700 hover:scale-[1.02] hover:shadow-md" // More distinct hover
          >
            <LogOut size={20} className="mr-2" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-4 overflow-y-auto">
        {/* Main Header (Profile Title, Search, Icons) */}
        <header className="flex justify-between items-center p-4 rounded-xl mb-6 shadow-xl border transition-all duration-300" style={{ background: currentColors.headerBg, borderColor: currentColors.headerBorder }}>
          <h1 className="text-2xl font-bold" style={{ color: currentColors.textPrimary }}>Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Search by location, type, or comment..."
                className="w-full pl-10 pr-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-opacity-75 shadow-sm"
                style={{ borderColor: currentColors.borderSubtle, color: currentColors.textPrimary, backgroundColor: currentColors.backgroundBase, '--tw-ring-color': currentColors.primaryBrand }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(e); }} // Allow search on Enter
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: currentColors.iconMuted }} />
            </div>
            <button className="p-2 rounded-full hover:bg-opacity-10" style={{ backgroundColor: currentColors.notificationUnreadBg, color: currentColors.primaryBrand }}>
              <MessageSquare size={20} />
            </button>
            <button onClick={() => setShowNotificationsModal(true)} className="relative p-2 rounded-full hover:bg-opacity-10" style={{ backgroundColor: currentColors.notificationUnreadBg, color: currentColors.primaryBrand }}>
              <Bell size={20} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce-custom">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            <button
                onClick={() => alert("More actions coming soon!")}
                className="p-2 rounded-full hover:bg-opacity-10"
                style={{ backgroundColor: currentColors.notificationUnreadBg, color: currentColors.primaryBrand }}
            >
                <MoreHorizontal size={20} />
            </button>
          </div>
        </header>

        {error && (
          <div className="px-4 py-3 rounded-lg mb-4 text-center animate-fade-in-down" style={{ borderColor: currentColors.errorBorder, backgroundColor: currentColors.errorBg, color: currentColors.errorText }}>
            <strong>Error: </strong>{error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* User Profile Details Card */}
          <div className="lg:col-span-2 p-7 rounded-xl shadow-md border transition-all duration-300 hover:scale-[1.005] hover:shadow-lg hover:translate-y-[-2px]" style={{ backgroundColor: currentColors.cardBackground, borderColor: currentColors.cardBorder }}>
            <div className="flex flex-col sm:flex-row items-center sm:items-start relative">
              <img
                // Added defensive checks for currentColors.avatarBg and userName
                src={`https://placehold.co/100x100/${currentColors.avatarBg ? currentColors.avatarBg.substring(1) : 'A78BFA'}/ffffff?text=${userName ? userName.charAt(0).toUpperCase() : '?'}`}
                alt="User Avatar"
                className="w-28 h-28 rounded-full mb-4 sm:mb-0 sm:mr-7 object-cover shadow-md border-4"
                style={{ borderColor: currentColors.secondaryAccent }}
              />
              <div className="flex-grow text-center sm:text-left">
                <h2 className="text-2xl font-bold mb-2" style={{ color: currentColors.textPrimary }}>
                  {userName}
                  {isNgoAccount && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-sm font-semibold"
                          style={{ backgroundColor: currentColors.ngoAccountBg, color: currentColors.ngoAccountText }}>
                      NGO Account
                    </span>
                  )}
                </h2>
                <p className="text-base mb-1" style={{ color: currentColors.textSecondary }}>Member Since: <span className="font-medium" style={{ color: currentColors.textPrimary }}>{memberSince}</span></p>
                <p className="text-base mb-1" style={{ color: currentColors.textSecondary }}>User ID: <span className="font-medium" style={{ color: currentColors.textPrimary }}>{userId || 'N/A'}</span></p>
                <p className="text-base mb-1" style={{ color: currentColors.textSecondary }}>Email: <span className="font-medium" style={{ color: currentColors.textPrimary }}>{userEmail}</span></p>
                <p className="text-base mb-4" style={{ color: currentColors.textSecondary }}>Primary Location: <span className="font-medium" style={{ color: currentColors.textPrimary }}>[User's Primary Location]</span></p>

                {/* Badges and Contributions stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center p-3 rounded-lg border" style={{ backgroundColor: currentColors.backgroundBase, borderColor: currentColors.borderSubtle }}>
                    <Award size={22} className="mr-3" style={{ color: currentColors.primaryBrand }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: currentColors.textPrimary }}>Current Badge:</p>
                      {/* Access name from currentBadge object */}
                      <p className="text-xs" style={{ color: currentColors.textSecondary }}>{currentBadge.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 rounded-lg border" style={{ backgroundColor: currentColors.backgroundBase, borderColor: currentColors.borderSubtle }}>
                    <Gauge size={22} className="mr-3" style={{ color: currentColors.primaryBrand }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: currentColors.textPrimary }}>Total Contributions:</p>
                      <p className="text-xs" style={{ color: currentColors.textSecondary }}>{totalUserReports}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 rounded-lg border" style={{ backgroundColor: currentColors.backgroundBase, borderColor: currentColors.borderSubtle }}>
                    <Clock size={22} className="mr-3" style={{ color: currentColors.primaryBrand }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: currentColors.textPrimary }}>Last Contribution:</p>
                      <p className="text-xs" style={{ color: currentColors.textSecondary }}>{lastContribution}</p>
                    </div>
                  </div>
                </div>

              </div>
              <button className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-100" style={{ color: currentColors.iconMuted }}>
                <Settings size={22} />
              </button>
            </div>
          </div>

          {/* New Global Accessibility Insights Card */}
          <div className="p-7 rounded-xl shadow-md border transition-all duration-300 hover:scale-[1.005] hover:shadow-lg hover:translate-y-[-2px]" style={{ backgroundColor: currentColors.cardBackground, borderColor: currentColors.cardBorder }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: currentColors.textPrimary }}>Global Accessibility Insights</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border" style={{ backgroundColor: currentColors.backgroundBase, borderColor: currentColors.borderSubtle }}>
                <div className="flex items-center">
                  <Globe size={22} className="mr-3" style={{ color: currentColors.primaryBrand }} />
                  <span className="font-medium" style={{ color: currentColors.textPrimary }}>Total Reports:</span>
                </div>
                <span style={{ color: currentColors.textSecondary }}>{totalGlobalReports}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border" style={{ backgroundColor: currentColors.backgroundBase, borderColor: currentColors.borderSubtle }}>
                <div className="flex items-center">
                  <Users size={22} className="mr-3" style={{ color: currentColors.primaryBrand }} />
                  <span className="font-medium" style={{ color: currentColors.textPrimary }}>Active Contributors:</span>
                </div>
                <span style={{ color: currentColors.textSecondary }}>{activeContributorsCount}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border" style={{ backgroundColor: currentColors.backgroundBase, borderColor: currentColors.borderSubtle }}>
                <div className="flex items-center">
                  <TrendingUp size={22} className="mr-3" style={{ color: currentColors.primaryBrand }} />
                  <span className="font-medium" style={{ color: currentColors.textPrimary }}>New Reports Today:</span>
                </div>
                <span style={{ color: currentColors.textSecondary }}>{newReportsTodayCount}</span>
              </div>
              <div>
                <p className="mb-2 text-base" style={{ color: currentColors.textSecondary }}>Most Reported Types:</p>
                <div className="grid grid-cols-2 gap-3 text-sm font-semibold">
                  {['ramp', 'restroom', 'elevator'].map((typeKey) => ( // Use typeKey to match the reportTypeIcons object keys
                    <div key={typeKey} className="flex items-center p-2 border rounded-md shadow-sm" style={{ borderColor: currentColors.borderSubtle, backgroundColor: currentColors.backgroundBase, color: currentColors.textPrimary }}>
                      {FileTextIcon[typeKey]} {/* Dynamically render icon */}
                      <span className="ml-2 capitalize">{typeKey}</span> {/* Display capitalized type name */}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Map Section */}
        <section className="p-7 rounded-xl shadow-md border mb-6" style={{ backgroundColor: currentColors.cardBackground, borderColor: currentColors.cardBorder }}>
          <h2 className="text-2xl font-bold mb-5 border-b pb-3" style={{ color: currentColors.textPrimary, borderColor: currentColors.borderSubtle }}>
            Interactive Accessibility Map
          </h2>
          <div className="relative">
            <div className="absolute top-4 left-4 z-[1000] bg-white p-3 shadow-lg rounded-lg w-full max-w-md"
                 style={{ backgroundColor: currentColors.cardBackground, color: currentColors.textPrimary, borderColor: currentColors.borderSubtle }}>
              <h2 className="text-xl font-bold mb-2" style={{ color: currentColors.primaryBrand }}>📍 Add Reports on Map</h2>
              <p className="text-sm mb-1" style={{ color: currentColors.textSecondary }}>Use the drawing tools on the top right of the map to add new accessibility reports.</p>
              <p className="text-sm" style={{ color: currentColors.textSecondary }}>Existing reports are shown as markers.</p>
            </div>

            <MapContainer
              center={MAP_CENTER}
              zoom={14}
              className="shadow-xl border"
              style={{
                borderColor: currentColors.cardBorder,
                height: '70vh',
                width: '100%',
                borderRadius: '1rem',
                overflow: 'hidden'
              }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              <FeatureGroup>
                <EditControl
                  position="topright"
                  onCreated={(e) => {
                    const { layerType, layer } = e;
                    if (layerType === 'marker') {
                      const { lat, lng } = layer.getLatLng();
                      handleMarkerAdd(lat, lng);
                      // Remove the drawn marker immediately after creation to prevent duplicates
                      // as the report will be added to the reports array and re-rendered
                      layer.remove();
                    }
                  }}
                  draw={{
                    rectangle: false,
                    polyline: false,
                    circle: false,
                    circlemarker: false,
                    polygon: false, // Disable polygon drawing as well
                  }}
                />
              </FeatureGroup>

              {accessibilityReports.map((report) => (
                // Ensure report has latitude and longitude before rendering marker
                report.latitude && report.longitude && (
                  <Marker key={report._id} position={[report.latitude, report.longitude]}>
                    <Popup>
                      <div style={{ color: currentColors.textPrimary }}>
                        <p className="font-semibold" style={{ color: currentColors.primaryBrand }}>{report.placeName || 'N/A'}</p>
                        <p className="text-sm" style={{ color: currentColors.textSecondary }}>Type: {report.type}</p>
                        <p className="text-sm" style={{ color: currentColors.textSecondary }}>Comment: {report.comment}</p>
                        <p className="text-xs mt-2" style={{ color: currentColors.textSecondary }}>Reported by: {report.userName || 'Unknown'}</p>
                        <p className="text-xs" style={{ color: currentColors.textSecondary }}>On: {new Date(report.timestamp).toLocaleString()}</p>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        </section>


        {/* Reports List Section (Combines Filters & Display) */}
        <section className="p-7 rounded-xl shadow-md border transition-all duration-300 hover:scale-[1.005] hover:shadow-lg hover:translate-y-[-2px]" style={{ backgroundColor: currentColors.cardBackground, borderColor: currentColors.cardBorder }}>
          <h2 className="text-2xl font-bold mb-5 border-b pb-3" style={{ color: currentColors.textPrimary, borderColor: currentColors.borderSubtle }}>
            {isSearchOrFilterActive ? "Search Results / Filtered Reports" : "Recent Reports"}
          </h2>

          {/* Filters & Sorting */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label htmlFor="filterType" className="block text-sm font-semibold mb-2" style={{ color: currentColors.textPrimary }}>
                Filter by Type:
              </label>
              <div className="relative">
                <select
                  id="filterType"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-opacity-75 shadow-sm"
                  style={{ borderColor: currentColors.cardBorder, color: currentColors.textPrimary, backgroundColor: currentColors.backgroundBase, '--tw-ring-color': currentColors.primaryBrand }}
                >
                  <option value="all">All Types</option>
                  <option value="ramp">Ramp</option>
                  <option value="elevator">Elevator</option>
                  <option value="restroom">Restroom</option>
                  <option value="parking">Parking</option>
                  <option value="entrance">Entrance</option>
                  <option value="pathway">Pathway</option>
                  <option value="other">Other</option>
                </select>
                <ChevronRight size={20} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90" style={{ color: currentColors.iconMuted }} />
              </div>
            </div>

            <div>
              <label htmlFor="sortOrder" className="block text-sm font-semibold mb-2" style={{ color: currentColors.textPrimary }}>
                Sort By:
              </label>
              <div className="relative">
                <select
                  id="sortOrder"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-opacity-75 shadow-sm"
                  style={{ borderColor: currentColors.cardBorder, color: currentColors.textPrimary, backgroundColor: currentColors.backgroundBase, '--tw-ring-color': currentColors.primaryBrand }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
                <ChevronRight size={20} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90" style={{ color: currentColors.iconMuted }} />
              </div>
            </div>
          </div>

          {/* Displayed Reports */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isSearchOrFilterActive ? (
              // Show all filtered reports when search/filter is active
              filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <div
                    key={report._id}
                    className="p-4 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.03] hover:shadow-xl flex flex-col cursor-pointer relative" // Added relative for status badge positioning
                    style={{
                      background: currentColors.reportCardGradient,
                      border: `1px solid ${currentColors.reportCardBorder}`,
                      boxShadow: `0 4px 12px ${currentColors.reportCardShadow}`
                    }}
                    onClick={() => {
                      setCurrentReportForComments(report);
                      setShowCommentsModal(true);
                    }}
                  >
                    <h3 className="text-lg font-semibold capitalize mb-2 flex items-center" style={{ color: currentColors.primaryBrand }}>
                      {FileTextIcon[report.type.toLowerCase()] || <MapPin size={18} style={{ color: currentColors.iconMuted }} />}
                      <span className="ml-2">{report.type}</span>
                    </h3>
                    {report.placeName && (
                      <p className="text-base font-medium mb-1" style={{ color: currentColors.textPrimary }}>{report.placeName}</p>
                    )}
                    {report.address && (
                      <p className="text-sm mb-2" style={{ color: currentColors.textSecondary }}>{report.address}</p>
                    )}
                    <p className="text-sm flex-grow mb-3" style={{ color: currentColors.textSecondary }}>{report.comment}</p>
                    {report.imageUrl && (
                      <img
                        src={report.imageUrl}
                        alt="report"
                        className="mt-2 rounded-md w-full h-32 object-cover mb-3"
                      />
                    )}
                    <p className="text-xs mt-auto flex items-center" style={{ color: currentColors.textSecondary }}>
                      <User size={12} className="mr-1" />
                      {report.reportedBy === userId ? 'You' : report.userName || 'Unknown'} •
                      <Clock size={12} className="ml-2 mr-1" /> {new Date(report.timestamp).toLocaleString()}
                    </p>
                     {/* NEW: Report Status Indicator (for regular users) */}
                    {/* Display if ANY NGO has verified or marked as spam */}
                    {report.isNgoReport && (
                        <div className="absolute top-3 right-3 flex items-center px-2 py-1 rounded-full text-xs font-semibold"
                             style={{
                               backgroundColor: currentColors.ngoAccountBg,
                               color: currentColors.ngoAccountText,
                             }}>
                          <Building size={14} className="mr-1" /> NGO Report
                        </div>
                    )}
                    {report.verifiedByNgos && report.verifiedByNgos.length > 0 ? (
                        <div className="absolute top-3 right-3 mt-8 flex items-center px-2 py-1 rounded-full text-xs font-semibold"
                             style={{
                               backgroundColor: currentColors.verifiedBg,
                               color: currentColors.verifiedText,
                               border: `1px solid ${currentColors.verifiedText}`
                             }}>
                          <ShieldCheck size={14} className="mr-1" /> Verified
                        </div>
                    ) : (report.markedAsSpamByNgos && report.markedAsSpamByNgos.length > 0) ? (
                        <div className="absolute top-3 right-3 mt-8 flex items-center px-2 py-1 rounded-full text-xs font-semibold"
                             style={{
                               backgroundColor: currentColors.spamBg,
                               color: currentColors.spamText,
                               border: `1px solid ${currentColors.spamText}`
                             }}>
                          <Ban size={14} className="mr-1" /> Spam
                        </div>
                    ) : null}

                    <div className="mt-4 pt-4 border-t flex justify-between items-center" style={{ borderColor: currentColors.borderSubtle }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentReportForComments(report);
                          setShowCommentsModal(true);
                        }}
                        className="flex items-center py-2 px-3 rounded-md font-semibold transition duration-200 hover:opacity-90"
                        style={{ backgroundColor: currentColors.primaryBrand, color: currentColors.cardBackground, '--tw-bg-opacity': 0.9 }}
                      >
                        <MessageSquare size={18} className="mr-2" /> Comments ({report.userComments?.length || 0})
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTrustReport(report._id);
                        }}
                        className={`flex items-center text-sm px-3 py-2 rounded-full transition-colors duration-200 ${
                          report.trustedBy?.includes(userId)
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        style={{
                          backgroundColor: report.trustedBy?.includes(userId) ? currentColors.likeColor : currentColors.backgroundBase,
                          color: report.trustedBy?.includes(userId) ? 'white' : currentColors.textSecondary
                        }}
                      >
                        <Heart size={16} className="mr-1" />
                        {report.trustedBy?.length || 0}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 col-span-full" style={{ color: currentColors.textSecondary }}>No reports found matching your criteria.</p>
              )
            ) : (
              // Show only the top 3 recent reports when no search/filter is active
              accessibilityReports.slice(0, 3).length > 0 ? (
                accessibilityReports.slice(0, 3).map((report) => (
                  <div
                    key={report._id}
                    className="p-4 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.03] hover:shadow-xl flex flex-col cursor-pointer relative" // Added relative for status badge positioning
                    style={{
                      background: currentColors.reportCardGradient,
                      border: `1px solid ${currentColors.reportCardBorder}`,
                      boxShadow: `0 4px 12px ${currentColors.reportCardShadow}`
                    }}
                    onClick={() => {
                      setCurrentReportForComments(report);
                      setShowCommentsModal(true);
                    }}
                  >
                    <h3 className="text-lg font-semibold capitalize mb-2 flex items-center" style={{ color: currentColors.primaryBrand }}>
                      {FileTextIcon[report.type.toLowerCase()] || <MapPin size={18} style={{ color: currentColors.iconMuted }} />}
                      <span className="ml-2">{report.type}</span>
                    </h3>
                    {report.placeName && (
                      <p className="text-base font-medium mb-1" style={{ color: currentColors.textPrimary }}>{report.placeName}</p>
                    )}
                    {report.address && (
                      <p className="text-sm mb-2" style={{ color: currentColors.textSecondary }}>{report.address}</p>
                    )}
                    <p className="text-sm flex-grow mb-3" style={{ color: currentColors.textSecondary }}>{report.comment}</p>
                    {report.imageUrl && (
                      <img
                        src={report.imageUrl}
                        alt="report"
                        className="mt-2 rounded-md w-full h-32 object-cover mb-3"
                      />
                    )}
                    <p className="text-xs mt-auto flex items-center" style={{ color: currentColors.textSecondary }}>
                      <User size={12} className="mr-1" />
                      {report.reportedBy === userId ? 'You' : report.userName || 'Unknown'} •
                      <Clock size={12} className="ml-2 mr-1" /> {new Date(report.timestamp).toLocaleString()}
                    </p>
                     {/* NEW: Report Status Indicator (for regular users) */}
                    {report.isNgoReport && (
                        <div className="absolute top-3 right-3 flex items-center px-2 py-1 rounded-full text-xs font-semibold"
                             style={{
                               backgroundColor: currentColors.ngoAccountBg,
                               color: currentColors.ngoAccountText,
                             }}>
                          <Building size={14} className="mr-1" /> NGO Report
                        </div>
                    )}
                    {report.verifiedByNgos && report.verifiedByNgos.length > 0 ? (
                        <div className="absolute top-3 right-3 mt-8 flex items-center px-2 py-1 rounded-full text-xs font-semibold"
                             style={{
                               backgroundColor: currentColors.verifiedBg,
                               color: currentColors.verifiedText,
                               border: `1px solid ${currentColors.verifiedText}`
                             }}>
                          <ShieldCheck size={14} className="mr-1" /> Verified
                        </div>
                    ) : (report.markedAsSpamByNgos && report.markedAsSpamByNgos.length > 0) ? (
                        <div className="absolute top-3 right-3 mt-8 flex items-center px-2 py-1 rounded-full text-xs font-semibold"
                             style={{
                               backgroundColor: currentColors.spamBg,
                               color: currentColors.spamText,
                               border: `1px solid ${currentColors.spamText}`
                             }}>
                          <Ban size={14} className="mr-1" /> Spam
                        </div>
                    ) : null}

                    <div className="mt-4 pt-4 border-t flex justify-between items-center" style={{ borderColor: currentColors.borderSubtle }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentReportForComments(report);
                          setShowCommentsModal(true);
                        }}
                        className="flex items-center py-2 px-3 rounded-md font-semibold transition duration-200 hover:opacity-90"
                        style={{ backgroundColor: currentColors.primaryBrand, color: currentColors.cardBackground, '--tw-bg-opacity': 0.9 }}
                      >
                        <MessageSquare size={18} className="mr-2" /> Comments ({report.userComments?.length || 0})
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTrustReport(report._id);
                        }}
                        className={`flex items-center text-sm px-3 py-2 rounded-full transition-colors duration-200 ${
                          report.trustedBy?.includes(userId)
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        style={{
                          backgroundColor: report.trustedBy?.includes(userId) ? currentColors.likeColor : currentColors.backgroundBase,
                          color: report.trustedBy?.includes(userId) ? 'white' : currentColors.textSecondary
                        }}
                      >
                        <Heart size={16} className="mr-1" />
                        {report.trustedBy?.length || 0}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 col-span-full" style={{ color: currentColors.textSecondary }}>No reports available yet.</p>
              )
            )}
          </div>
          {/* "See All Reports" button */}
          {!isSearchOrFilterActive && accessibilityReports.length >= 0 && ( // Only show if not filtered/searched and there are more than 3 reports
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/all-reports')} // Navigate to the new page for all reports
                className="px-6 py-3 rounded-full font-bold text-white transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
                style={{
                  background: `linear-gradient(to right, ${currentColors.primaryBrand}, ${currentColors.secondaryAccent})`,
                  border: 'none',
                }}
              >
                See All Reports
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Add Report Modal (This component is no longer rendered as a modal here) */}
      {/* It is expected that the router will render AddReportPage when navigating to /add-report */}
      {/* The initialLat and initialLng will be passed via react-router-dom's state */}

      {/* Comments Modal (This modal might be duplicated if MyContributionsPage also has one) */}
      {showCommentsModal && currentReportForComments && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg shadow-xl w-full max-w-lg p-6 relative flex flex-col" style={{ backgroundColor: currentColors.cardBackground, color: currentColors.textPrimary }}>
            <button
              onClick={() => setShowCommentsModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <XCircle size={24} style={{ color: currentColors.iconMuted }} />
            </button>
            <h3 className="text-2xl font-bold mb-4 border-b pb-3" style={{ color: currentColors.primaryBrand, borderColor: currentColors.borderSubtle }}>Comments for "{currentReportForComments.type}"</h3>

            {/* Existing Comments */}
            <div className="flex-grow max-h-80 overflow-y-auto custom-scrollbar pr-2 mb-4">
              {currentReportForComments.userComments && currentReportForComments.userComments.length > 0 ? (
                currentReportForComments.userComments.map((c, idx) => (
                  <div key={idx} className="mb-3 p-3 rounded-md flex items-center justify-between" style={{ backgroundColor: currentColors.commentBg }}>
                    <div>
                      <p className="font-semibold" style={{ color: currentColors.primaryBrand }}>{c.userName || 'Unknown User'}:</p>
                      <p style={{ color: currentColors.textSecondary }}>{c.commentText}</p>
                      <p className="text-xs text-gray-500 mt-1" style={{ color: c.read ? currentColors.textSecondary : currentColors.notificationUnreadText }}>{new Date(c.timestamp).toLocaleString()}</p>
                    </div>
                    {/* Like Button for Comments */}
                    <button
                      onClick={() => handleLikeComment(currentReportForComments._id, idx)}
                      className={`flex items-center text-sm px-2 py-1 rounded-full transition-colors duration-200 ${
                        c.likedBy?.includes(userId)
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      style={{
                        backgroundColor: c.likedBy?.includes(userId) ? currentColors.likeColor : currentColors.backgroundBase,
                        color: c.likedBy?.includes(userId) ? 'white' : currentColors.textSecondary
                      }}
                    >
                      <ThumbsUp size={14} className="mr-1" />
                      {c.likedBy?.length || 0}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center" style={{ color: currentColors.textSecondary }}>No comments yet. Be the first!</p>
              )}
            </div>

            {/* Add New Comment Input */}
            {userId && (
              <form className="flex" onSubmit={(e) => {
                e.preventDefault();
                const commentInput = e.target.elements.commentInput;
                handleCommentSubmit(currentReportForComments._id, commentInput.value);
                commentInput.value = ''; // Clear input
              }}>
                <input
                  type="text"
                  name="commentInput"
                  placeholder="Add a comment..."
                  className="flex-grow px-3 py-2 border rounded-l-md focus:outline-none focus:ring-1"
                  style={{ borderColor: currentColors.borderSubtle, color: currentColors.textPrimary, backgroundColor: currentColors.backgroundBase, '--tw-ring-color': currentColors.primaryBrand }}
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-r-md text-white transition duration-200"
                  style={{ backgroundColor: currentColors.primaryBrand }}
                >
                  <Send size={18} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg shadow-xl w-full max-w-md p-6 relative" style={{ backgroundColor: currentColors.cardBackground }}>
            <button
              onClick={() => setShowNotificationsModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <XCircle size={24} style={{ color: currentColors.iconMuted }} />
            </button>
            <h3 className="text-2xl font-bold mb-4 border-b pb-3" style={{ color: currentColors.primaryBrand, borderColor: currentColors.borderSubtle }}>Your Notifications</h3>
            <div className="max-h-96 overflow-y-auto custom-scrollbar pr-2">
              {notifications.length > 0 ? (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg mb-3 cursor-pointer flex items-start`}
                    style={{ backgroundColor: notif.read ? currentColors.notificationReadBg : currentColors.notificationUnreadBg, color: notif.read ? currentColors.textSecondary : currentColors.notificationUnreadText }}
                    onClick={() => markNotificationAsRead(notif.id)}
                  >
                    <Bell size={18} className="mr-3 mt-1" />
                    <div>
                      <p>{notif.message}</p>
                      <p className="text-xs mt-1" style={{ color: notif.read ? currentColors.textSecondary : currentColors.notificationUnreadText }}>{new Date(notif.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center" style={{ color: currentColors.textSecondary }}>No new notifications.</p>
              )}
            </div>
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

        @keyframes bounce-custom {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .animate-bounce-custom {
          animation: bounce-custom 1s infinite ease-in-out;
        }

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
};

export default MapView;

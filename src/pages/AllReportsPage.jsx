// File: src/pages/AllReportsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, User, Clock, MessageSquare, Heart,
  ChevronRight, Sun, Moon, Ruler, Toilet, ArrowUpSquare, BadgeInfo,
  Compass, XCircle, ThumbsUp, Send, ShieldCheck, Ban, Building, Award // Added Award icon for premium badge
} from 'lucide-react';

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
    // NEW: NGO Badge Colors
    ngoBg: '#E0E7FF', // Light blue for NGO reports
    ngoText: '#4338CA', // Indigo for NGO text
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
    // NEW: NGO Badge Colors
    ngoBg: '#312E81', // Dark indigo for NGO reports
    ngoText: '#A5B4FC', // Light indigo for NGO text
  }
};

// Map type to icon component for "Most Reported Types"
const reportTypeIcons = {
  ramp: <Ruler size={16} />,
  restroom: <Toilet size={16} />,
  elevator: <ArrowUpSquare size={16} />,
  parking: <MapPin size={16} />,
  entrance: <ChevronRight size={16} />,
  pathway: <Compass size={16} />,
  other: <BadgeInfo size={16} />,
};

const AllReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [currentReportForComments, setCurrentReportForComments] = useState(null);
  // Initialize darkMode from localStorage or default to false
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' ? true : false;
  });

  const navigate = useNavigate();

  // Get current color scheme
  const currentColors = darkMode ? colors.dark : colors.light;

  // Placeholder for Firebase User ID.
  // In a real app, this would come from Firebase Auth context.
  // For now, we'll use a mock ID or get it from a global state/context if available.
  const [currentUser, setCurrentUser] = useState(null); // State to hold user object including premium status
  const firebaseAuthUserId = "mock_firebase_uid_123"; // REPLACE WITH ACTUAL FIREBASE UID FROM AUTH

  // Define the free report limit for clarity, even though backend enforces it
  const REPORTS_FREE_LIMIT = 10;

  // Fetch current user details (including premium status)
  useEffect(() => {
    const fetchUser = async () => {
      if (!firebaseAuthUserId) return; // Don't fetch if no user ID
      try {
        const response = await fetch(`http://localhost:5000/api/users/${firebaseAuthUserId}`);
        if (!response.ok) {
          console.error(`Failed to fetch user data: ${response.status}`);
          setCurrentUser(null);
          return;
        }
        const userData = await response.json();
        setCurrentUser(userData);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setCurrentUser(null);
      }
    };
    fetchUser();
  }, [firebaseAuthUserId]);


  // Fetch all accessibility reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        console.log('Fetching all accessibility reports for AllReportsPage...');
        // Pass userId as a query parameter for premium check on backend
        const response = await fetch(`http://localhost:5000/api/reports?userId=${firebaseAuthUserId}`);
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`HTTP error fetching reports! Status: ${response.status}, Response: ${errorText}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('All accessibility reports fetched:', data);
        setReports(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setError("Failed to load accessibility reports. Make sure your backend server is running on http://localhost:5000.");
        setReports([]);
        setLoading(false);
      }
    };

    fetchReports();
    // Refresh data periodically (e.g., every 30 seconds)
    const intervalId = setInterval(fetchReports, 30000);
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [firebaseAuthUserId]); // Re-fetch if firebaseAuthUserId changes

  // Filter and Sort Reports
  useEffect(() => {
    let currentReports = [...reports];

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentReports = currentReports.filter(report =>
        report.placeName?.toLowerCase().includes(lowerCaseSearchTerm) ||
        report.address?.toLowerCase().includes(lowerCaseSearchTerm) ||
        report.comment?.toLowerCase().includes(lowerCaseSearchTerm) ||
        report.type?.toLowerCase().includes(lowerCaseSearchTerm)
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
  }, [reports, searchTerm, filterType, sortOrder]);


  // Placeholder for userId from authentication (you might get this from context or props if logged in)
  const userId = firebaseAuthUserId; // Using the Firebase UID for all user-related actions

  const handleLikeComment = async (reportId, commentIndex) => {
    if (!userId) {
      // Use a custom alert/modal instead of window.alert
      // For now, using a simple alert as per previous instruction to avoid complex modals
      alert("Please log in to like comments.");
      return;
    }

    try {
      // Optimistically update UI
      setReports(prevReports => {
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to toggle like on backend! Status: ${response.status}, Response: ${errorText}`);
        setError("Failed to update like. Please try again.");
      } else {
        console.log("Like/unlike updated on backend successfully.");
      }

    } catch (err) {
      console.error("Error liking comment:", err);
      setError("Failed to like comment: " + err.message);
    }
  };

  const handleCommentSubmit = async (reportId, commentText) => {
    // A placeholder userName as we don't have auth context here directly
    const tempUserName = currentUser?.displayName || currentUser?.firstName || "Guest User"; // Use actual user name if available
    if (!commentText.trim() || !userId) { // Ensure userId is available, though it's a placeholder here
      alert("Comment cannot be empty and you must be logged in."); // Use custom modal
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          userName: tempUserName, // Using tempUserName
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
      setReports(prevReports =>
        prevReports.map(report =>
          report._id === reportId ? { ...report, userComments: updatedReport.userComments } : report
        )
      );
      if (currentReportForComments && currentReportForComments._id === reportId) {
        setCurrentReportForComments(prev => ({ ...prev, userComments: updatedReport.userComments }));
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      setError(err.message);
    }
  };

  const handleTrustReport = async (reportId) => {
    if (!userId) {
      alert("Please log in to trust reports."); // Use custom modal
      return;
    }

    try {
      setReports(prevReports => {
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
      }
    } catch (err) {
      console.error("Error toggling trust:", err);
      setError("Failed to toggle trust: " + err.message);
    }
  };


  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', newMode.toString()); // Save to localStorage
      return newMode;
    });
  };

  // NEW: handleUpgrade function for premium access
  const handleUpgrade = async () => {
    if (!currentUser || !currentUser.uid) {
      alert("User not logged in. Cannot upgrade.");
      return;
    }

    // Mock payment confirmation
    const confirmed = window.confirm("Pay ₹99 to upgrade to Premium?");
    if (!confirmed) {
      setError("Payment cancelled.");
      return;
    }

    try {
      setError(''); // Clear previous errors
      const response = await fetch(`http://localhost:5000/api/users/${currentUser.uid}/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upgrade to premium.');
      }

      const updatedUser = await response.json();
      setCurrentUser(updatedUser.user); // Update local user state
      alert("🎉 Successfully upgraded to Premium! Enjoy unlimited reports.");
      // Optionally, re-fetch reports to immediately show all
      // You might want to trigger a full page reload or navigate to force re-fetch
      window.location.reload(); // Simple way to force re-fetch with new premium status
    } catch (err) {
      console.error("Error upgrading to premium:", err);
      setError(`Upgrade failed: ${err.message}`);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col" style={{ backgroundColor: currentColors.backgroundBase }}>
        <h2 className="text-3xl font-semibold" style={{ color: currentColors.textPrimary }}>Loading All Reports...</h2>
        <p className="text-lg mt-2" style={{ color: currentColors.textSecondary }}>Please wait a moment...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 font-sans" style={{ backgroundColor: currentColors.backgroundBase, color: currentColors.textPrimary }}>
      <header className="flex justify-between items-center p-4 rounded-xl mb-6 shadow-xl border transition-all duration-300" style={{ background: currentColors.headerBg, borderColor: currentColors.headerBorder }}>
        <h1 className="text-3xl font-bold" style={{ color: currentColors.textPrimary }}>All Accessibility Reports</h1>
        <div className="flex items-center space-x-4">
          {/* Premium Badge */}
          {currentUser?.premium && (
            <div className="flex items-center px-3 py-1 rounded-full text-sm font-bold shadow-md"
                 style={{
                   background: currentColors.premiumBg,
                   color: currentColors.sidebarActiveText, // White text
                 }}>
              <Award size={16} className="mr-1" /> Premium Member
            </div>
          )}

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
                color: currentColors.cardBackground,
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

      {/* Premium Access Restriction Banner */}
      {!currentUser?.premium && filteredReports.length >= REPORTS_FREE_LIMIT && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mt-4 mb-6 text-center shadow-md border"
             style={{ backgroundColor: currentColors.notificationUnreadBg, color: currentColors.notificationUnreadText, borderColor: currentColors.secondaryAccent }}>
          <strong style={{ color: currentColors.primaryBrand }}>🔓 Unlock full access!</strong><br />
          You've reached the free limit of {REPORTS_FREE_LIMIT} reports. Upgrade to Premium to view unlimited reports and support our mission.
          <button
            onClick={handleUpgrade}
            className="ml-4 px-6 py-2 rounded-full font-bold text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            style={{
              background: currentColors.premiumBg,
              color: currentColors.sidebarActiveText,
              border: 'none',
            }}
          >
            Upgrade to Premium
          </button>
        </div>
      )}


      {/* Filters & Sorting */}
      <section className="p-7 rounded-xl shadow-md border mb-6" style={{ backgroundColor: currentColors.cardBackground, borderColor: currentColors.cardBorder }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: currentColors.textPrimary }}>Filter & Sort Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div className="md:col-span-2">
            <label htmlFor="searchTerm" className="block text-sm font-semibold mb-2" style={{ color: currentColors.textPrimary }}>
              Search:
            </label>
            <div className="relative">
              <input
                type="text"
                id="searchTerm"
                placeholder="Search by place name, address, comment, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75 shadow-sm"
                style={{ borderColor: currentColors.cardBorder, color: currentColors.textPrimary, backgroundColor: currentColors.backgroundBase, '--tw-ring-color': currentColors.primaryBrand }}
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: currentColors.iconMuted }} />
            </div>
          </div>
        </div>
      </section>

      {/* All Reports Display */}
      <section className="p-7 rounded-xl shadow-md border" style={{ backgroundColor: currentColors.cardBackground, borderColor: currentColors.cardBorder }}>
        <h2 className="text-2xl font-bold mb-5 border-b pb-3" style={{ color: currentColors.textPrimary, borderColor: currentColors.borderSubtle }}>
          {searchTerm || filterType !== 'all' || sortOrder !== 'newest' ? "Filtered Results" : "All Reports"} ({filteredReports.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <div
                key={report._id}
                className="p-4 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.03] hover:shadow-xl flex flex-col cursor-pointer relative" // Added relative here for status badge positioning
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
                  {reportTypeIcons[report.type.toLowerCase()] || <MapPin size={18} />}
                  <span className="ml-2">{report.type}</span>
                </h3>
                {report.placeName && (
                  <p className="text-base font-medium mb-1" style={{ color: currentColors.textPrimary }}>{report.placeName}</p>
                )}
                {report.address && (
                  <p className="text-sm mb-2" style={{ color: currentColors.textSecondary }}>{report.address}</p>
                )}
                {report.googleMapsLink && (
                    <a
                      href={report.googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm mt-2 hover:underline flex items-center"
                      style={{ color: currentColors.primaryBrand }}
                      onClick={(e) => e.stopPropagation()} // Prevent card click when clicking link
                    >
                      View on Google Maps <ChevronRight size={14} className="ml-1" />
                    </a>
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
                  {report.userName || 'Unknown'} •
                  <Clock size={12} className="ml-2 mr-1" /> {new Date(report.timestamp).toLocaleString()}
                </p>

                {/* UPDATED: Report Status Indicator Section */}
                <div className="absolute top-3 right-3 flex flex-col items-end space-y-1">
                  {/* NGO Report Badge */}
                  {report.isNgoReport && (
                    <div className="flex items-center px-2 py-1 rounded-full text-xs font-semibold"
                         style={{
                           backgroundColor: currentColors.ngoBg,
                           color: currentColors.ngoText,
                         }}>
                      <Building size={14} className="mr-1" /> NGO Report
                    </div>
                  )}
                  {/* Verified/Spam Badge (if any NGO has verified/spammed it) */}
                  {report.verifiedByNgos && report.verifiedByNgos.length > 0 ? (
                      <div className="flex items-center px-2 py-1 rounded-full text-xs font-semibold"
                           style={{
                             backgroundColor: currentColors.verifiedBg,
                             color: currentColors.verifiedText,
                           }}>
                        <ShieldCheck size={14} className="mr-1" /> Verified
                      </div>
                  ) : (report.markedAsSpamByNgos && report.markedAsSpamByNgos.length > 0) ? (
                       <div className="flex items-center px-2 py-1 rounded-full text-xs font-semibold"
                           style={{
                             backgroundColor: currentColors.spamBg,
                             color: currentColors.spamText,
                           }}>
                        <Ban size={14} className="mr-1" /> Spam
                      </div>
                  ) : null}
                </div>


                <div className="mt-4 pt-4 border-t flex justify-between items-center" style={{ borderColor: currentColors.borderSubtle }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click from opening comments twice
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
                      e.stopPropagation(); // Prevent card click from opening comments modal
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
          )}
        </div>
      </section>

      {/* Comments Modal (reused from MapView) */}
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
                      <p className="text-xs text-gray-500 mt-1">{new Date(c.timestamp).toLocaleString()}</p>
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
                <p className="text-sm text-gray-500" style={{ color: currentColors.textSecondary }}>No comments yet. Be the first!</p>
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

      {/* Custom CSS for scrollbar and animation (copied from MapView) */}
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
      `}</style>
    </div>
  );
};

export default AllReportsPage;

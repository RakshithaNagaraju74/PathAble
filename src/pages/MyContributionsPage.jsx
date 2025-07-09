// File: MyContributionsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase'; // Assuming firebase.js exports 'auth'
import {
  Loader2, MapPin, User, Clock, MessageSquare, Trash2, // Added Trash2 for delete icon
  Ruler, Toilet, ArrowUpSquare, ChevronRight, BadgeInfo, CheckCircle, XCircle // NEW: CheckCircle, XCircle
} from 'lucide-react';

// Color Palette - Must be consistent with MapView.jsx
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
    errorBg: '#FEE2E2', // Red-100
    errorBorder: '#EF4444', // Red-500
    errorText: '#EF4444', // Red-700
    reportCardGradient: 'linear-gradient(to bottom right, #FDFDFD, #F0F2F5)', // Very subtle, clean gradient
    reportCardBorder: '#E0E7FF', // Soft bluish border
    reportCardShadow: 'rgba(0, 0, 0, 0.1)', // Subtle shadow for report cards
    headerBg: 'linear-gradient(to right, #F8F8FF, #FFFFFF)', // Light blueish gradient for header
    headerBorder: '#D1D5DB', // A clearer border for the header
    verifiedStatus: '#10B981', // Green-500 for verified status
    spamStatus: '#EF4444', // Red-500 for spam status
    pendingStatus: '#F59E0B', // Amber-500 for pending status
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
    errorBg: '#620000', // Darker red
    errorBorder: '#CF6679', // Lighter red
    errorText: '#CF6679', // Lighter red
    reportCardGradient: 'linear-gradient(to bottom right, #252525, #1E1E1E)', // Dark gradient for report cards
    reportCardBorder: '#3A3A3A', // Darker border for report cards
    reportCardShadow: 'rgba(0, 0, 0, 0.3)', // More pronounced shadow for report cards
    headerBg: 'linear-gradient(to right, #1E1E1E, #252525)', // Dark gradient for header
    headerBorder: '#3A3A3A', // A clearer border for the header
    verifiedStatus: '#68D391', // Lighter green for dark mode
    spamStatus: '#EF4444', // Red-500 for spam status
    pendingStatus: '#F6E05E', // Lighter amber for dark mode
  }
};

// Map type to icon component (consistent with MapView.jsx)
const reportTypeIcons = {
  ramp: <Ruler size={16} />,
  restroom: <Toilet size={16} />,
  elevator: <ArrowUpSquare size={16} />,
  parking: <MapPin size={16} />,
  entrance: <ChevronRight size={16} />,
  pathway: <Ruler size={16} />, // Reusing Ruler for pathway
  other: <BadgeInfo size={16} />,
};

const MyContributionsPage = () => {
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // Assume dark mode state can be passed or fetched

  const navigate = useNavigate();

  // Determine current color scheme based on darkMode state
  const currentColors = darkMode ? colors.dark : colors.light;

  // Authentication and User ID fetch
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthReady(true);
      } else {
        setError("User not authenticated. Please log in.");
        setIsAuthReady(true); // Still set ready even if not authenticated
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch user's reports from backend
  const fetchMyReports = async () => {
    setLoading(true);
    setError('');
    try {
      console.log(`Fetching reports for user ID: ${userId}`);
      const response = await fetch(`http://localhost:5000/api/reports/user/${userId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch reports: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      setUserReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching user reports:", err);
      setError(`Failed to load your contributions: ${err.message}. Make sure the backend is running.`);
      setUserReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthReady && userId) {
      fetchMyReports();
      const intervalId = setInterval(fetchMyReports, 30000); // Refresh every 30 seconds
      return () => clearInterval(intervalId);
    } else if (isAuthReady && !userId) {
      setLoading(false); // Stop loading if auth is ready but no userId
    }
  }, [userId, isAuthReady]);

  // Handle report deletion
  const handleDeleteReport = async (reportId) => {
    if (!userId) {
      setError("You must be logged in to delete reports.");
      return;
    }

    // Custom confirmation dialog (replacing window.confirm)
    // NOTE: In a production app, you'd use a custom modal for this instead of window.confirm
    const confirmDelete = window.confirm("Are you sure you want to delete this report? This action cannot be undone.");

    if (!confirmDelete) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId }), // Send userId for authorization
      });

      if (!response.ok) {
        let errorMessage = `Failed to delete report: HTTP ${response.status}`;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } else {
          const errorText = await response.text();
          errorMessage = `${errorMessage}. Server response: ${errorText.substring(0, 100)}...`;
          console.error("Non-JSON error response from server:", errorText);
        }
        throw new Error(errorMessage);
      }

      // If deletion is successful, update the state to remove the report
      setUserReports(prevReports => prevReports.filter(report => report._id !== reportId));
      // NOTE: In a production app, you'd use a custom modal for success feedback instead of window.alert
      alert("Report deleted successfully!");
    } catch (err) {
      console.error("Error deleting report:", err);
      setError(`Failed to delete report: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };


  if (!isAuthReady || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col" style={{ backgroundColor: currentColors.backgroundBase }}>
        <Loader2 className="animate-spin mb-4" size={64} style={{ color: currentColors.primaryBrand }} />
        <span className="text-3xl font-semibold" style={{ color: currentColors.textPrimary }}>
          {isAuthReady ? "Loading Your Contributions..." : "Authenticating User..."}
        </span>
        <p className="text-lg mt-2" style={{ color: currentColors.textSecondary }}>Please wait a moment...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 font-sans" style={{ backgroundColor: currentColors.backgroundBase, color: currentColors.textPrimary }}>
      {/* Header */}
      <header className="flex justify-between items-center w-full max-w-6xl p-4 rounded-xl mb-6 shadow-xl border transition-all duration-300" style={{ background: currentColors.headerBg, borderColor: currentColors.headerBorder }}>
        <h1 className="text-3xl font-bold" style={{ color: currentColors.primaryBrand }}>My Contributions</h1>
        <button
          onClick={() => navigate('/map')}
          className="px-6 py-2 rounded-full text-white font-bold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
          style={{ background: currentColors.primaryBrand }}
        >
          &larr; Back to Dashboard
        </button>
      </header>

      {error && (
        <div className="px-4 py-3 rounded-lg mb-4 text-center w-full max-w-6xl animate-fade-in-down" style={{ borderColor: currentColors.errorBorder, backgroundColor: currentColors.errorBg, color: currentColors.errorText }}>
          <strong>Error: </strong>{error}
        </div>
      )}

      {/* Reports Section */}
      <section className="p-7 rounded-xl shadow-md border transition-all duration-300 w-full max-w-6xl" style={{ backgroundColor: currentColors.cardBackground, borderColor: currentColors.cardBorder }}>
        <h2 className="text-2xl font-bold mb-5 border-b pb-3" style={{ color: currentColors.textPrimary, borderColor: currentColors.borderSubtle }}>Your Submitted Reports ({userReports.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userReports.length > 0 ? (
            userReports.map((report) => (
              <div
                key={report._id}
                className="p-4 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.03] hover:shadow-xl flex flex-col relative" // Added relative for absolute positioning of delete button
                style={{
                  background: currentColors.reportCardGradient,
                  border: `1px solid ${currentColors.reportCardBorder}`,
                  boxShadow: `0 4px 12px ${currentColors.reportCardShadow}`
                }}
              >
                {/* Delete Button (visible only for own reports) */}
                {userId === report.reportedBy && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                      handleDeleteReport(report._id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transition-colors duration-200"
                    title="Delete Report"
                  >
                    <Trash2 size={18} />
                  </button>
                )}

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
                <p className="text-xs mt-1 flex items-center" style={{ color: currentColors.textSecondary }}>
                  <MessageSquare size={12} className="mr-1" /> Comments: {report.userComments?.length || 0}
                </p>

                {/* NEW: Display Report Verification/Spam Status */}
                {report.isSpam ? (
                  <p className="text-sm mt-2 font-semibold flex items-center" style={{ color: currentColors.spamStatus }}>
                    <XCircle size={16} className="mr-1" /> Marked as Spam
                  </p>
                ) : report.isVerifiedByNgo ? (
                  <p className="text-sm mt-2 font-semibold flex items-center" style={{ color: currentColors.verifiedStatus }}>
                    <CheckCircle size={16} className="mr-1" /> Verified by NGO
                  </p>
                ) : (
                  <p className="text-sm mt-2 font-semibold flex items-center" style={{ color: currentColors.pendingStatus }}>
                    <BadgeInfo size={16} className="mr-1" /> Pending Review
                  </p>
                )}

                {report.googleMapsLink && (
                  <a
                    href={report.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm mt-2 hover:underline flex items-center"
                    style={{ color: currentColors.primaryBrand }}
                  >
                    View on Google Maps <ChevronRight size={14} className="ml-1" />
                  </a>
                )}
                {report.notificationStatus && (
                  <p className="text-xs mt-2" style={{ color: currentColors.textSecondary }}>
                    Notification Status: <span className="capitalize font-medium">{report.notificationStatus}</span>
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-center py-8 col-span-full" style={{ color: currentColors.textSecondary }}>You haven't submitted any reports yet.</p>
          )}
        </div>
      </section>

      {/* Custom CSS for fade-in animation */}
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
};

export default MyContributionsPage;

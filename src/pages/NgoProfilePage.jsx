// File: src/pages/NgoProfilePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Building, Mail, Award, MapPin, Clock, CheckCircle, XCircle, Loader2,
  Sun, Moon, Edit, TrendingUp, Users, ExternalLink, Info // Added Info icon for clarity
} from 'lucide-react';

// Define the same color palette for consistency
const colors = {
  light: {
    primaryBrand: '#007B8C', // Deep Teal - Main accent color
    secondaryAccent: '#FF8C00', // Warm Orange - For key actions, highlights, active states
    backgroundBase: '#F9FAFC', // Very light off-white - Overall background
    cardBackground: '#FFFFFF', // Pure white - Card backgrounds
    textPrimary: '#333333', // Dark Gray - Primary text
    textSecondary: '#666666', // Medium Gray - Secondary/placeholder text
    borderSubtle: '#DDE5ED', // Light gray - For subtle separation and input borders
    shadowBase: 'rgba(0, 0, 0, 0.08)', // Soft shadow
    successText: '#155724', // Dark green for success
    successBg: '#D4EDDA', // Light green for success background
    errorText: '#DC2626', // Red for errors
    errorBg: '#FEE2E2', // Light red for error background
    warningText: '#FF8C00', // Orange for warnings
    warningBg: '#FFFACD', // Light yellow for warning background
    verifiedBadgeBg: '#22C55E', // Bright green for verified badge
    verifiedBadgeText: '#FFFFFF', // White text on verified badge
    spamBadgeBg: '#EF4444', // Bright red for spam badge
    spamBadgeText: '#FFFFFF', // White text on spam badge
    buttonPrimaryBg: 'linear-gradient(to right, #007B8C, #00A693)', // Teal to greenish-teal gradient
    buttonPrimaryHover: 'linear-gradient(to right, #005F6B, #007B8C)', // Darker teal gradient for hover
    headerBg: 'linear-gradient(to right, #F9FAFC, #EBF2F6)', // Light gradient for header
    headerBorder: '#DDE5ED', // Light border for header
    reportCardGradient: 'linear-gradient(to bottom right, #FFFFFF, #F9FAFC)', // Subtle gradient for report cards
    reportCardBorder: '#EBF2F6', // Light border for report cards
    reportCardShadow: 'rgba(0, 0, 0, 0.12)', // Medium shadow for report cards
    ngoBg: '#8FD85B', // Soft green for NGO specific elements
    ngoText: '#005F6B', // Dark teal for NGO specific text
    userSpammedByYouBg: '#FEE2E2', // Light red for user marked as spam by current NGO
    userSpammedByYouText: '#DC2626', // Red text for user marked as spam by current NGO
    officialResponseBg: '#E0F7FA', // Light cyan for official response
    officialResponseText: '#007B8C', // Teal text for official response
    infoBg: '#E0F2F7', // Light blue for info cards
    infoText: '#00566C', // Dark blue for info cards
  },
  dark: {
    primaryBrand: '#00BCD4', // Lighter Cyan - Main accent color
    secondaryAccent: '#FFAB40', // Brighter Orange - For key actions, highlights, active states
    backgroundBase: '#121212', // Dark charcoal - Overall background
    cardBackground: '#1E1E1E', // Slightly lighter charcoal - Card backgrounds
    textPrimary: '#E0E0E0', // Light gray - Primary text
    textSecondary: '#B0B0B0', // Medium light gray - Secondary/placeholder text
    borderSubtle: '#303030', // Dark gray - For subtle separation and input borders
    shadowBase: 'rgba(0, 200, 200, 0.15)', // Cyan glow shadow
    successText: '#A5D6A7', // Light green for success
    successBg: '#2E7D32', // Dark green for success background
    errorText: '#EF9A9A', // Light red for errors
    errorBg: '#C62828', // Dark red for error background
    warningText: '#FFCC80', // Light orange for warnings
    warningBg: '#FFA726', // Dark orange for warning background
    verifiedBadgeBg: '#10B981', // Darker green for verified badge
    verifiedBadgeText: '#1F2937', // Dark text on verified badge
    spamBadgeBg: '#DC2626', // Darker red for spam badge
    spamBadgeText: '#1F2937', // Dark text on spam badge
    buttonPrimaryBg: 'linear-gradient(to right, #00BCD4, #4DD0E1)', // Cyan to light cyan gradient
    buttonPrimaryHover: 'linear-gradient(to right, #00838F, #00BCD4)', // Darker cyan gradient for hover
    headerBg: 'linear-gradient(to right, #1E1E1E, #282828)', // Dark gradient for header
    headerBorder: '#303030', // Dark border for header
    reportCardGradient: 'linear-gradient(to bottom right, #1E1E1E, #121212)', // Subtle dark gradient for report cards
    reportCardBorder: '#303030', // Dark border for report cards
    reportCardShadow: 'rgba(0, 220, 220, 0.25)', // Brighter cyan glow shadow for report cards
    ngoBg: '#4CAF50', // Medium green for NGO specific elements
    ngoText: '#121212', // Dark text for NGO specific text
    userSpammedByYouBg: '#C62828', // Dark red for user marked as spam by current NGO
    userSpammedByYouText: '#EF9A9A', // Light red text for user marked as spam by current NGO
    glowPrimary: 'rgba(0, 220, 220, 0.6)', // Primary glow effect
    glowAccent: 'rgba(255, 171, 64, 0.7)', // Accent glow effect
    officialResponseBg: '#004D40', // Dark teal for official response
    officialResponseText: '#80CBC4', // Light teal text for official response
    infoBg: '#003344', // Darker blue for info cards
    infoText: '#80DEEA', // Lighter blue for info cards
  }
};

export default function NgoProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const loggedInNgoId = location.state?.loggedInNgoId || localStorage.getItem('ngoId');

  const [ngoData, setNgoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const currentColors = darkMode ? colors.dark : colors.light;

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    } else {
      setDarkMode(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  }, []);

  const fetchNgoProfileData = useCallback(async () => {
    if (!loggedInNgoId) {
      setError("NGO ID not found. Please log in.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch NGO basic details (assuming an endpoint like /api/ngos/:ngoId exists)
      const ngoDetailsResponse = await fetch(`http://localhost:5000/api/ngos/${loggedInNgoId}`, {
        headers: { 'X-NGO-ID': loggedInNgoId }
      });

      if (!ngoDetailsResponse.ok) {
        const errorText = await ngoDetailsResponse.text();
        throw new Error(`Failed to fetch NGO details: ${ngoDetailsResponse.status} - ${errorText}`);
      }
      const ngoDetails = await ngoDetailsResponse.json();

      // 2. Fetch Leaderboard Data (filter for current NGO)
      const [
        totalReportsRes,
        verifiedReportsRes,
        fastestResponseRes,
        ngoZonesRes,
        spamReportsByNgoRes // Fetch spam reports by NGO
      ] = await Promise.all([
        fetch('http://localhost:5000/api/reports/leaderboard/total-reports-by-ngo', { headers: { 'X-NGO-ID': loggedInNgoId } }),
        fetch('http://localhost:5000/api/reports/leaderboard/total-verified-by-ngo', { headers: { 'X-NGO-ID': loggedInNgoId } }),
        fetch('http://localhost:5000/api/reports/leaderboard/fastest-response-ngos', { headers: { 'X-NGO-ID': loggedInNgoId } }),
        fetch('http://localhost:5000/api/zones', { headers: { 'X-NGO-ID': loggedInNgoId } }),
        fetch('http://localhost:5000/api/reports/leaderboard/total-spammed-by-ngo', { headers: { 'X-NGO-ID': loggedInNgoId } }) // Fetch spam reports
      ]);

      const totalReportsData = await totalReportsRes.json();
      const verifiedReportsData = await verifiedReportsRes.json();
      const fastestResponseData = await fastestResponseRes.json();
      const ngoZonesData = await ngoZonesRes.json();
      const spamReportsData = await spamReportsByNgoRes.json(); // Parse spam data

      const currentNgoTotalReports = totalReportsData.find(entry => entry.ngoId === loggedInNgoId)?.totalReports || 0;
      const currentNgoVerifiedReports = verifiedReportsData.find(entry => entry.ngoId === loggedInNgoId)?.totalVerifiedReports || 0;
      const currentNgoFastestResponse = fastestResponseData.find(entry => entry.ngoId === loggedInNgoId)?.averageResponseTimeHours;
      const currentNgoSpamReports = spamReportsData.find(entry => entry.ngoId === loggedInNgoId)?.totalSpamReports || 0; // Get spam count

      setNgoData({
        ...ngoDetails, // Should contain name, email, etc.
        totalReportsSubmitted: currentNgoTotalReports,
        totalReportsVerified: currentNgoVerifiedReports,
        averageResponseTimeHours: currentNgoFastestResponse,
        totalReportsMarkedSpam: currentNgoSpamReports, // Add spam count
        zones: ngoZonesData, // All zones managed by this NGO
      });

    } catch (err) {
      console.error("Error fetching NGO profile data:", err);
      setError(`Failed to load profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [loggedInNgoId]);

  useEffect(() => {
    fetchNgoProfileData();
  }, [fetchNgoProfileData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen" style={{ backgroundColor: currentColors.backgroundBase }}>
        <Loader2 size={48} className="animate-spin" style={{ color: currentColors.primaryBrand }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: currentColors.backgroundBase, color: currentColors.errorText }}>
        <div className="p-8 rounded-lg shadow-xl w-full max-w-md text-center" style={{ backgroundColor: currentColors.errorBg, border: `1px solid ${currentColors.errorText}` }}>
          <p className="text-lg font-semibold">{error}</p>
          <button
            onClick={() => navigate('/ngo-dashboard')}
            className="mt-6 px-6 py-3 rounded-full text-white font-bold transition-all duration-300 hover:shadow-lg hover:scale-105"
            style={{ background: currentColors.primaryBrand, boxShadow: `0 5px 15px ${currentColors.shadowBase}` }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!ngoData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: currentColors.backgroundBase, color: currentColors.textSecondary }}>
        <p className="text-xl">No NGO data available.</p>
        <button
            onClick={() => navigate('/ngo-dashboard')}
            className="mt-6 px-6 py-3 rounded-full text-white font-bold transition-all duration-300 hover:shadow-lg hover:scale-105"
            style={{ background: currentColors.primaryBrand, boxShadow: `0 5px 15px ${currentColors.shadowBase}` }}
          >
            Go to Dashboard
          </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 transition-colors duration-300 font-sans" style={{ backgroundColor: currentColors.backgroundBase, color: currentColors.textPrimary }}>
      <header
        className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center mb-8 p-6 rounded-2xl shadow-xl transition-colors duration-300"
        style={{ background: currentColors.headerBg, border: `1px solid ${currentColors.headerBorder}`, boxShadow: `0 10px 40px ${currentColors.shadowBase}` }}
      >
        <h1 className="text-4xl font-extrabold mb-4 md:mb-0" style={{ color: currentColors.primaryBrand, textShadow: darkMode ? `0 0 18px ${currentColors.primaryBrand}` : 'none' }}>NGO Profile</h1>
        <div className="flex flex-wrap justify-center items-center gap-4">
          <button
            onClick={() => navigate('/ngo-dashboard')}
            className="px-6 py-3 rounded-full font-bold text-base transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center"
            style={{ color: 'white', background: currentColors.primaryBrand, boxShadow: darkMode ? `0 0 15px ${currentColors.primaryBrand}` : `0 5px 15px ${currentColors.shadowBase}` }}
          >
            &larr; Back to Dashboard
          </button>
          <div
            onClick={toggleDarkMode}
            className="p-3 rounded-full cursor-pointer shadow-md transition-all duration-300 hover:scale-110"
            style={{ backgroundColor: currentColors.cardBackground, color: currentColors.textPrimary, boxShadow: `0 4px 12px ${currentColors.shadowBase}` }}
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </div>
        </div>
      </header>

      <main className="w-full max-w-4xl space-y-8">
        {/* NGO Details Section - Full width */}
        <section className="p-8 rounded-2xl shadow-xl transition-colors duration-300 animate-fade-in-down" style={{ backgroundColor: currentColors.cardBackground, border: `1px solid ${currentColors.borderSubtle}`, boxShadow: `0 10px 30px ${currentColors.shadowBase}` }}>
          <h2 className="text-3xl font-bold mb-6 flex items-center" style={{ color: currentColors.primaryBrand, textShadow: darkMode ? `0 0 12px ${currentColors.primaryBrand}` : 'none' }}>
            <Building size={32} className="mr-3" style={{filter: darkMode ? `drop-shadow(0 0 10px ${currentColors.primaryBrand})` : 'none'}} /> {ngoData.name || 'Your NGO Name'}
          </h2>
          <div className="space-y-4 text-lg">
            <p className="flex items-center">
              <Mail size={20} className="mr-3" style={{ color: currentColors.secondaryAccent }} />
              <span className="font-semibold" style={{ color: currentColors.textPrimary }}>Email:</span> {ngoData.email || 'N/A'}
            </p>
            {/* Add more NGO details here if available, e.g., description, website */}
            {ngoData.website && (
              <p className="flex items-center">
                <ExternalLink size={20} className="mr-3" style={{ color: currentColors.secondaryAccent }} />
                <span className="font-semibold" style={{ color: currentColors.textPrimary }}>Website:</span>
                <a href={ngoData.website} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:underline" style={{color: currentColors.primaryBrand}}>
                  {ngoData.website}
                </a>
              </p>
            )}
            {/* NEW: NGO ID for reference */}
            <p className="flex items-center text-sm" style={{ color: currentColors.textSecondary }}>
              <Info size={18} className="mr-2" style={{ color: currentColors.infoText }}/>
              <span className="font-semibold">NGO ID:</span> {loggedInNgoId}
            </p>
          </div>
          <div className="mt-8 text-right">
            <button
              onClick={() => alert('Edit Profile functionality coming soon!')}
              className="px-6 py-3 rounded-full text-white font-bold text-base transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center ml-auto"
              style={{ background: currentColors.buttonPrimaryBg, boxShadow: darkMode ? `0 0 15px ${currentColors.primaryBrand}` : `0 5px 15px ${currentColors.shadowBase}` }}
            >
              <Edit size={20} className="mr-2" /> Edit Profile
            </button>
          </div>
        </section>

        {/* Performance Badges Section - Full width */}
        <section className="p-8 rounded-2xl shadow-xl transition-colors duration-300 animate-fade-in-down" style={{ backgroundColor: currentColors.cardBackground, border: `1px solid ${currentColors.borderSubtle}`, boxShadow: `0 10px 30px ${currentColors.shadowBase}` }}>
          <h2 className="text-3xl font-bold mb-6 flex items-center" style={{ color: currentColors.primaryBrand, textShadow: darkMode ? `0 0 12px ${currentColors.primaryBrand}` : 'none' }}>
            <Award size={32} className="mr-3" style={{filter: darkMode ? `drop-shadow(0 0 10px ${currentColors.primaryBrand})` : 'none'}} /> Your Performance Badges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reports Verified Badge */}
            <div className="p-6 rounded-xl shadow-md flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-lg hover:scale-105" style={{ backgroundColor: currentColors.successBg, color: currentColors.successText, border: `1px solid ${currentColors.successText}` }}>
              <CheckCircle size={40} className="mb-3" style={{filter: darkMode ? `drop-shadow(0 0 8px ${currentColors.successText})` : 'none'}}/>
              <p className="text-xl font-semibold mb-2">Reports Verified:</p>
              <span className="text-5xl font-extrabold">{ngoData.totalReportsVerified}</span>
            </div>
            {/* Reports Submitted Badge */}
            <div className="p-6 rounded-xl shadow-md flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-lg hover:scale-105" style={{ backgroundColor: currentColors.infoBg, color: currentColors.infoText, border: `1px solid ${currentColors.infoText}` }}>
              <Users size={40} className="mb-3" style={{filter: darkMode ? `drop-shadow(0 0 8px ${currentColors.infoText})` : 'none'}}/>
              <p className="text-xl font-semibold mb-2">Reports Submitted:</p>
              <span className="text-5xl font-extrabold">{ngoData.totalReportsSubmitted}</span>
            </div>
            {/* Avg. Response Time Badge */}
            <div className="p-6 rounded-xl shadow-md flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-lg hover:scale-105" style={{ backgroundColor: currentColors.warningBg, color: currentColors.warningText, border: `1px solid ${currentColors.warningText}` }}>
              <Clock size={40} className="mb-3" style={{filter: darkMode ? `drop-shadow(0 0 8px ${currentColors.warningText})` : 'none'}}/>
              <p className="text-xl font-semibold mb-2">Avg. Response Time:</p>
              <span className="text-5xl font-extrabold">
                {ngoData.averageResponseTimeHours ? `${ngoData.averageResponseTimeHours.toFixed(1)}h` : 'N/A'}
              </span>
            </div>
            {/* Reports Marked Spam Badge (Now using actual data) */}
            <div className="p-6 rounded-xl shadow-md flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-lg hover:scale-105" style={{ backgroundColor: currentColors.errorBg, color: currentColors.errorText, border: `1px solid ${currentColors.errorText}` }}>
              <XCircle size={40} className="mb-3" style={{filter: darkMode ? `drop-shadow(0 0 8px ${currentColors.errorText})` : 'none'}}/>
              <p className="text-xl font-semibold mb-2">Reports Marked Spam:</p>
              <span className="text-5xl font-extrabold">{ngoData.totalReportsMarkedSpam}</span>
            </div>
          </div>
        </section>

        {/* Managed Zones Section - now below the grid */}
        <section className="p-8 rounded-2xl shadow-xl transition-colors duration-300 animate-fade-in-down" style={{ backgroundColor: currentColors.cardBackground, border: `1px solid ${currentColors.borderSubtle}`, boxShadow: `0 10px 30px ${currentColors.shadowBase}` }}>
          <h2 className="text-3xl font-bold mb-6 flex items-center" style={{ color: currentColors.primaryBrand, textShadow: darkMode ? `0 0 12px ${currentColors.primaryBrand}` : 'none' }}>
            <MapPin size={32} className="mr-3" style={{filter: darkMode ? `drop-shadow(0 0 10px ${currentColors.primaryBrand})` : 'none'}} /> Your Managed Zones ({ngoData.zones?.length || 0})
          </h2>
          {ngoData.zones && ngoData.zones.length > 0 ? (
            <ul className="space-y-4">
              {ngoData.zones.map(zone => (
                <li key={zone._id} className="p-4 rounded-lg flex justify-between items-center border shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.01]" style={{ backgroundColor: currentColors.backgroundBase, borderColor: currentColors.borderSubtle }}>
                  <span className="text-lg font-semibold" style={{ color: currentColors.textPrimary }}>{zone.name}</span>
                  <span className="text-sm" style={{ color: currentColors.textSecondary }}>
                    Created: {new Date(zone.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-lg text-center py-4" style={{ color: currentColors.textSecondary }}>No zones claimed yet. Define your operational areas from the dashboard!</p>
          )}
        </section>
      </main>
    </div>
  );
}

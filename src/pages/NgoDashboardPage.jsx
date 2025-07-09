// File: src/pages/NgoDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, UserX, UserCheck, Loader2, MapPin, Clock, MessageSquare, AlertTriangle, Eye, EyeOff, Users, Sun, Moon, Building, ExternalLink, MessageSquareText, Map, TrendingUp, BarChart, Trophy, Filter, Calendar, Award, PlusSquare, UserCircle } from 'lucide-react'; // Added PlusSquare and UserCircle icon
import { useNavigate } from 'react-router-dom';
import ManagedLocationsMap from './ManagedLocationsMap';
import L from 'leaflet'; // L is imported but not directly used in this file for point-in-polygon, keeping for consistency with Map components.
import pointInPolygon from 'point-in-polygon'; // Import the point-in-polygon library

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
  }
};

export default function NgoDashboardPage() {
  const [userReportsForReview, setUserReportsForReview] = useState([]);
  const [allNgoReports, setAllNgoReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ngoZones, setNgoZones] = useState([]);
  const [isNgoLoggedIn, setIsNgoLoggedIn] = useState(false);
  const [loggedInNgoId, setLoggedInNgoId] = useState(localStorage.getItem('ngoId') || null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [darkMode, setDarkMode] = useState(false);
  const currentColors = darkMode ? colors.dark : colors.light;

  const [activeTab, setActiveTab] = useState('userReports');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('');

  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  const [topZones, setTopZones] = useState([]);
  const [fastestResponseNgos, setFastestResponseNgos] = useState([]);

  // NEW STATE: Overall NGO Leaderboard Data
  const [ngoTotalReportsLeaderboard, setNgoTotalReportsLeaderboard] = useState([]);
  const [ngoVerifiedReportsLeaderboard, setNgoVerifiedReportsLeaderboard] = useState([]);
  const [ngoSpamReportsLeaderboard, setNgoSpamReportsLeaderboard] = useState([]);


  // NEW STATE: To control drawing mode in ManagedLocationsMap
  const [startDrawingMode, setStartDrawingMode] = useState(false);


  const navigate = useNavigate();

  // Helper function to check if a point is inside a polygon using the 'point-in-polygon' library
  // The 'point-in-polygon' library expects [longitude, latitude] for the point
  // and [[longitude, latitude], ...] for the polygon vertices.
  // Our backend fetches zones in Leaflet format [[lat, lng], ...]
  // So, for the point, we convert {latitude, longitude} to [longitude, latitude].
  // For the polygon, we convert the Leaflet format [[lat, lng], ...] to [[lng, lat], ...].
  const isPointInPolygonWrapper = useCallback((pointLat, pointLng, leafletPolygonCoords) => {
    console.log(`[isPointInPolygonWrapper] Checking point: [${pointLng}, ${pointLat}]`);

    // Convert report point from {latitude, longitude} to [longitude, latitude] for the library
    const point = [pointLng, pointLat];

    // Convert Leaflet-style polygon coordinates [[lat, lng], ...] to
    // point-in-polygon's expected [[lng, lat], ...]
    const polygon = leafletPolygonCoords && Array.isArray(leafletPolygonCoords)
                    ? leafletPolygonCoords.map(coord => [coord[1], coord[0]]) // Convert [lat, lng] to [lng, lat]
                    : [];

    console.log(`[isPointInPolygonWrapper] Converted Polygon coords for point-in-polygon:`, polygon);

    if (polygon.length < 3) { // A polygon needs at least 3 points
      console.log(`[isPointInPolygonWrapper] Polygon has less than 3 points, returning false.`);
      return false;
    }
    const result = pointInPolygon(point, polygon);
    console.log(`[isPointInPolygonWrapper] pointInPolygon result for [${pointLng}, ${pointLat}] in polygon: ${result}`);
    return result;
  }, []);


  const isPointInAnyZone = useCallback((pointLat, pointLng, zones) => {
    console.log(`[isPointInAnyZone] Checking point: [${pointLat}, ${pointLng}] against ${zones.length} zones.`);
    if (!zones || zones.length === 0) {
      console.log(`[isPointInAnyZone] No zones provided, returning false.`);
      return false;
    }
    for (const zone of zones) {
      console.log(`[isPointInAnyZone] Checking against zone: ${zone.name} (ID: ${zone._id})`);
      if (zone.coordinates) { // zone.coordinates is the Leaflet-style array [[lat, lng], ...]
        if (isPointInPolygonWrapper(pointLat, pointLng, zone.coordinates)) {
          console.log(`[isPointInAnyZone] Point [${pointLat}, ${pointLng}] IS IN ZONE: ${zone.name}`);
          return true;
        }
      } else {
        console.warn(`[isPointInAnyZone] Zone ${zone.name} (ID: ${zone._id}) has no coordinates.`);
      }
    }
    console.log(`[isPointInAnyZone] Point [${pointLat}, ${pointLng}] IS NOT IN ANY ZONE.`);
    return false;
  }, [isPointInPolygonWrapper]);


  const handleNgoLogout = useCallback(() => {
    setLoggedInNgoId(null);
    localStorage.removeItem('ngoId');
    setIsNgoLoggedIn(false);
    setUserReportsForReview([]);
    setAllNgoReports([]);
    setUsers([]);
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
    navigate('/ngo-dashboard');
  }, [navigate]);

  const fetchReportsAndUsers = useCallback(async () => {
    console.log("fetchReportsAndUsers called.");
    if (!loggedInNgoId) {
      console.log("No loggedInNgoId, skipping data fetch.");
      setLoading(false);
      return;
    }
    console.log("Fetching data with loggedInNgoId:", loggedInNgoId);

    try {
      setLoading(true);
      setError(null);

      // Construct query parameters for reports
      const queryParams = new URLSearchParams();
      queryParams.append('ngoView', 'true');
      if (selectedZoneFilter) {
        queryParams.append('zoneId', selectedZoneFilter); // Backend will ignore this for now, frontend filters
      }
      if (startDateFilter) {
        queryParams.append('startDate', startDateFilter);
      }
      if (endDateFilter) {
        queryParams.append('endDate', endDateFilter);
      }

      const reportsApiUrl = `http://localhost:5000/api/reports?${queryParams.toString()}`;

      const reportsResponse = await fetch(reportsApiUrl, {
        headers: { 'X-NGO-ID': loggedInNgoId }
      });
      if (!reportsResponse.ok) {
        const errorText = await reportsResponse.text();
        throw new Error(`HTTP error! status: ${reportsResponse.status} for reports: ${errorText}`);
      }
      const allReportsData = await reportsResponse.json();
      console.log("[fetchReportsAndUsers] Fetched all reports:", allReportsData);


      const userReports = allReportsData.filter(report => !report.isNgoReport);
      setUserReportsForReview(userReports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));

      const ngoReportsFiltered = allReportsData.filter(report => report.isNgoReport);
      setAllNgoReports(ngoReportsFiltered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));

      console.log("Fetching users...");
      const usersResponse = await fetch('http://localhost:5000/api/users', {
        headers: { 'X-NGO-ID': loggedInNgoId }
      });
      if (!usersResponse.ok) {
        const errorText = await usersResponse.text();
        throw new Error(`HTTP error! status: ${usersResponse.status} for users: ${errorText}`);
      }
      const usersData = await usersResponse.json();
      setUsers(usersData);
      console.log("Fetched users data successfully:", usersData);

      const zonesRes = await fetch('http://localhost:5000/api/zones', {
        headers: { 'X-NGO-ID': loggedInNgoId }
      });
      if (!zonesRes.ok) {
        const errorData = await zonesRes.json(); // Try to parse JSON error
        throw new Error(`HTTP error! status: ${zonesRes.status} for zones: ${errorData.error || 'Unknown error'}`);
      }
      const zones = await zonesRes.json();
      setNgoZones(zones);
      console.log("[fetchReportsAndUsers] Fetched NGO zones:", zones);


      // Fetch Leaderboard Data (Existing)
      console.log("Fetching leaderboard data...");
      const topZonesRes = await fetch('http://localhost:5000/api/reports/leaderboard/verified-zones', {
        headers: { 'X-NGO-ID': loggedInNgoId }
      });
      if (topZonesRes.ok) {
        const data = await topZonesRes.json();
        setTopZones(data);
        console.log("[fetchReportsAndUsers] Fetched top zones leaderboard:", data);
      } else {
        console.error("Failed to fetch top zones leaderboard:", await topZonesRes.text());
        setTopZones([]);
      }

      const fastestNgosRes = await fetch('http://localhost:5000/api/reports/leaderboard/fastest-response-ngos', {
        headers: { 'X-NGO-ID': loggedInNgoId }
      });
      if (fastestNgosRes.ok) {
        const data = await fastestNgosRes.json();
        setFastestResponseNgos(data);
        console.log("[fetchReportsAndUsers] Fetched fastest response NGOs leaderboard:", data);
      } else {
        console.error("Failed to fetch fastest response NGOs leaderboard:", await fastestNgosRes.text());
        setFastestResponseNgos([]);
      }

      // NEW: Fetch Overall NGO Leaderboard Data
      console.log("Fetching overall NGO leaderboard data...");
      const totalReportsByNgoRes = await fetch('http://localhost:5000/api/reports/leaderboard/total-reports-by-ngo', {
        headers: { 'X-NGO-ID': loggedInNgoId }
      });
      if (totalReportsByNgoRes.ok) {
        const data = await totalReportsByNgoRes.json();
        setNgoTotalReportsLeaderboard(data);
        console.log("[fetchReportsAndUsers] Fetched total reports by NGO leaderboard:", data);
      } else {
        console.error("Failed to fetch total reports by NGO leaderboard:", await totalReportsByNgoRes.text());
        setNgoTotalReportsLeaderboard([]);
      }

      const verifiedReportsByNgoRes = await fetch('http://localhost:5000/api/reports/leaderboard/total-verified-by-ngo', {
        headers: { 'X-NGO-ID': loggedInNgoId }
      });
      if (verifiedReportsByNgoRes.ok) {
        const data = await verifiedReportsByNgoRes.json();
        setNgoVerifiedReportsLeaderboard(data);
        console.log("[fetchReportsAndUsers] Fetched total verified reports by NGO leaderboard:", data);
      } else {
        console.error("Failed to fetch total verified reports by NGO leaderboard:", await verifiedReportsByNgoRes.text());
        setNgoVerifiedReportsLeaderboard([]);
      }

      const spamReportsByNgoRes = await fetch('http://localhost:5000/api/reports/leaderboard/total-spammed-by-ngo', {
        headers: { 'X-NGO-ID': loggedInNgoId }
      });
      if (spamReportsByNgoRes.ok) {
        const data = await spamReportsByNgoRes.json();
        setNgoSpamReportsLeaderboard(data);
        console.log("[fetchReportsAndUsers] Fetched total spam reports by NGO leaderboard:", data);
      } else {
        console.error("Failed to fetch total spam reports by NGO leaderboard:", await spamReportsByNgoRes.text());
        setNgoSpamReportsLeaderboard([]);
      }


    } catch (e) {
      console.error("Failed to fetch data:", e);
      setError(e.message);
      if (e.message.includes('401')) {
          handleNgoLogout();
          setLoginError("Session expired or unauthorized. Please log in again.");
      }
    } finally {
      setLoading(false);
    }
  }, [loggedInNgoId, selectedZoneFilter, startDateFilter, endDateFilter, handleNgoLogout]);


  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    } else {
      setDarkMode(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    if (loggedInNgoId) {
        setIsNgoLoggedIn(true);
        fetchReportsAndUsers();
    } else {
        setLoading(false);
    }

  }, [loggedInNgoId, fetchReportsAndUsers]);


  const toggleDarkMode = useCallback(() => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  }, []);

  const handleNgoLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/ngo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();
      if (response.ok && data.ngoId) {
        setLoggedInNgoId(data.ngoId);
        localStorage.setItem('ngoId', data.ngoId);
        setIsNgoLoggedIn(true);
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setLoginError(data.error || 'Login failed. Invalid credentials.');
        setIsNgoLoggedIn(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveZone = async (polygon) => {
    const zoneName = prompt('Enter a name for this zone:');
    if (!zoneName) {
      setStartDrawingMode(false); // Exit drawing mode if no name is provided
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/zones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-NGO-ID': loggedInNgoId
        },
        body: JSON.stringify({ name: zoneName, coordinates: polygon })
      });

      if (res.ok) {
        alert('Zone saved successfully!');
        fetchReportsAndUsers(); // Re-fetch zones and reports
        setStartDrawingMode(false); // Exit drawing mode
      } else {
        const errorData = await res.json();
        alert(`Failed to save zone: ${errorData.error || 'Unknown error'}. Details: ${errorData.details || 'N/A'}`);
        setError(errorData.error || 'Failed to save zone');
      }
    } catch (err) {
      console.error('Error saving zone from frontend:', err);
      alert(`An error occurred while saving the zone: ${err.message}`);
      setError(err.message);
    }
  };

  // Function to initiate zone drawing
  const handleAddZoneClick = () => {
    setActiveTab('managedLocations'); // Switch to the map tab
    setStartDrawingMode(true); // Tell the map to start drawing
    alert("Draw a polygon on the map to define your new zone. Click 'Save Zone' when done.");
  };


  const handleVerifyReport = async (reportId, currentStatus) => {
    if (!loggedInNgoId) {
      alert("NGO not authenticated. Please log in.");
      return;
    }
    const newStatus = !currentStatus;
    try {
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-NGO-ID': loggedInNgoId,
        },
        body: JSON.stringify({ isVerified: newStatus }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Failed to ${newStatus ? 'verify' : 'unverify'} report`);
      }

      await fetchReportsAndUsers();
      console.log(`Report ${newStatus ? 'verified' : 'unverified'} successfully!`);
    } catch (err) {
      console.error('Error verifying report:', err);
      setError(err.message);
    }
  };

  const handleMarkReportAsSpam = async (reportId, currentStatus) => {
    if (!loggedInNgoId) {
      alert("NGO not authenticated. Please log in.");
      return;
    }
    const newStatus = !currentStatus;
    let spamReason = '';
    if (newStatus) {
      spamReason = prompt("Enter a reason for marking this report as spam (optional):");
      if (spamReason === null) {
        return;
      }
    }

    try {
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}/spam`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-NGO-ID': loggedInNgoId,
        },
        body: JSON.stringify({ isSpam: newStatus, spamReason }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Failed to ${newStatus ? 'mark' : 'unmark'} report as spam`);
      }

      await fetchReportsAndUsers();
      console.log(`Report ${newStatus ? 'marked' : 'unmarked'} as spam!`);
    } catch (err) {
      console.error('Error marking report as spam:', err);
      setError(err.message);
    }
  };

  const handleAddOfficialResponse = async (reportId) => {
    if (!loggedInNgoId) {
      alert("NGO not authenticated. Please log in.");
      return;
    }
    const responseText = prompt("Enter your official response:");
    if (responseText === null || responseText.trim() === '') {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}/official-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-NGO-ID': loggedInNgoId,
        },
        body: JSON.stringify({ responseText }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Failed to add official response`);
      }

      await fetchReportsAndUsers();
      console.log("Official response added successfully!");
    } catch (err) {
      console.error("Error adding official response:", err);
      setError(err.message);
    }
  };


  const handleMarkUserAsSpam = async (userUid, currentStatus) => {
    if (!loggedInNgoId) {
      alert("NGO not authenticated. Please log in.");
      return;
    }
    const newStatus = !currentStatus;
    let spamReason = '';
    if (newStatus) {
      spamReason = prompt("Enter a reason for marking this user as spam (optional):");
      if (spamReason === null) {
        return;
      }
    }

    console.log(`[handleMarkUserAsSpam] Attempting to mark user ${userUid} as spam: ${newStatus}`);
    console.log(`[handleMarkUserAsSpam] Using loggedInNgoId: ${loggedInNgoId}`);

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userUid}/update-spam-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-NGO-ID': loggedInNgoId,
        },
        body: JSON.stringify({ isSpam: newStatus, spamReason }),
      });

      console.log(`[handleMarkUserAsSpam] Backend response status: ${response.status}`);

      if (!response.ok) {
        const errData = await response.json();
        console.error("[handleMarkUserAsSpam] Backend error response for user spam status:", errData);
        throw new Error(errData.error || `Failed to ${newStatus ? 'mark' : 'unmark'} user as spam`);
      }

      const updatedUserResponse = await response.json();
      console.log("[handleMarkUserAsSpam] Updated user object from backend (after action):", updatedUserResponse.user);

      console.log("[handleMarkUserAsSpam] Re-fetching all reports and users to update UI...");
      await fetchReportsAndUsers();

      console.log(`[handleMarkUserAsSpam] User ${newStatus ? 'marked' : 'unmarked'} as spam successfully!`);

    } catch (err) {
      console.error('[handleMarkUserAsSpam] Error marking user as spam:', err);
      setError(err.message);
    }
  };

  const handleGoToSpamAccountPage = (userUid) => {
      alert(`Navigating to Spam Account Details for User ID: ${userUid}`);
  };

  const handleGoBack = () => {
    navigate('/');
  };

  // Combine all reports (user + ngo) - this is for the total reports count and general display
  const allReportsCombined = userReportsForReview.concat(allNgoReports);
  console.log("[NgoDashboardPage] allReportsCombined length:", allReportsCombined.length);

  // Filter reports by selected zone for display in the "Managed Locations" tab
  const reportsInSelectedZone = selectedZoneFilter
    ? allReportsCombined.filter(r => {
        const zone = ngoZones.find(z => z._id === selectedZoneFilter);
        const lat = Number(r.latitude);
        const lng = Number(r.longitude);

        console.log(`[reportsInSelectedZone filter] Checking report ${r._id} (Lat: ${lat}, Lng: ${lng}) for zone ${zone?.name || 'N/A'}`);

        if (isNaN(lat) || isNaN(lng) || !zone) {
            console.warn("Skipping report due to invalid lat/lng or missing zone:", r);
            return false;
        }
        const isInZone = isPointInPolygonWrapper(lat, lng, zone.coordinates); // zone.coordinates is already leaflet-style
        console.log(`[reportsInSelectedZone filter] Report ${r._id} is in zone ${zone.name}: ${isInZone}`);
        return isInZone;
      })
    : allReportsCombined;

  // Calculate stats for the "Managed Locations" section
  const totalReportsInZones = allReportsCombined.filter(r => {
    const lat = Number(r.latitude);
    const lng = Number(r.longitude);
    if (isNaN(lat) || isNaN(lng)) {
      console.warn(`[totalReportsInZones calculation] Skipping report ${r._id} due to invalid lat/lng: ${lat}, ${lng}`);
      return false;
    }
    const isInAnyZone = isPointInAnyZone(lat, lng, ngoZones);
    console.log(`[totalReportsInZones calculation] Report ${r._id} is in ANY zone: ${isInAnyZone}`);
    return isInAnyZone;
  }).length;
  console.log("[NgoDashboardPage] totalReportsInZones:", totalReportsInZones);


  const verifiedReportsInZones = allReportsCombined.filter(r => {
    const lat = Number(r.latitude);
    const lng = Number(r.longitude);
    if (isNaN(lat) || isNaN(lng)) {
      console.warn(`[verifiedReportsInZones calculation] Skipping report ${r._id} due to invalid lat/lng: ${lat}, ${lng}`);
      return false;
    }
    const isInAnyZone = isPointInAnyZone(lat, lng, ngoZones);
    const isVerifiedByCurrentNgo = r.verifiedByNgos?.some(v => v.ngoId === loggedInNgoId);
    console.log(`[verifiedReportsInZones calculation] Report ${r._id} (in zone: ${isInAnyZone}, verified by NGO: ${isVerifiedByCurrentNgo})`);
    return isInAnyZone && isVerifiedByCurrentNgo;
  }).length;
  console.log("[NgoDashboardPage] verifiedReportsInZones:", verifiedReportsInZones);


  const verificationPercentage = totalReportsInZones > 0
    ? Math.round((verifiedReportsInZones / totalReportsInZones) * 100)
    : 0;
  console.log("[NgoDashboardPage] verificationPercentage:", verificationPercentage);


  // Calculate NGO Performance Comparison (Placeholder for more complex logic)
  const ngoPerformance = {
    reportsVerified: verifiedReportsInZones,
    reportsSpammed: allReportsCombined.filter(r => r.markedAsSpamByNgos?.some(s => s.ngoId === loggedInNgoId)).length,
    zonesClaimed: ngoZones.length,
  };
  console.log("[NgoDashboardPage] ngoPerformance:", ngoPerformance);


  // Function to handle export of reports (CSV)
  const handleExportReportsCSV = async () => {
    console.log("[Export] Attempting to export reports CSV...");
    try {
      const queryParams = new URLSearchParams();
      // Note: Backend might not fully implement zoneId filtering for CSV export yet.
      // This sends the filter, but the backend implementation is key.
      if (selectedZoneFilter) {
        queryParams.append('zoneId', selectedZoneFilter);
      }
      if (startDateFilter) {
        queryParams.append('startDate', startDateFilter);
      }
      if (endDateFilter) {
        queryParams.append('endDate', endDateFilter);
      }

      const exportUrl = `http://localhost:5000/api/reports/export/csv?${queryParams.toString()}`;
      console.log("[Export] Fetching from URL:", exportUrl);

      const response = await fetch(exportUrl, {
        headers: { 'X-NGO-ID': loggedInNgoId }
      });
      console.log("[Export] Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Export] Backend error response for CSV:", errorText);
        throw new Error(`Failed to export reports: ${response.status} - ${errorText}`);
      }

      const blob = await response.blob();
      console.log("[Export] Blob created:", blob);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `accessibility_reports_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      alert('Reports exported successfully as CSV!');
      console.log("[Export] CSV export successful.");
    } catch (err) {
      console.error('Error exporting reports CSV:', err);
      setError(`Error exporting reports: ${err.message}`);
    }
  };

  // Function to handle export of zones (GeoJSON)
  const handleExportZonesGeoJSON = async () => {
    console.log("[Export] Attempting to export zones GeoJSON...");
    try {
      const exportUrl = `http://localhost:5000/api/zones/export/geojson`;
      console.log("[Export] Fetching from URL:", exportUrl);

      const response = await fetch(exportUrl, {
        headers: { 'X-NGO-ID': loggedInNgoId }
      });
      console.log("[Export] Response status:", response.status);


      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Export] Backend error response for GeoJSON:", errorText);
        throw new Error(`Failed to export zones: ${response.status} - ${errorText}`);
      }

      const blob = await response.blob();
      console.log("[Export] Blob created:", blob);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ngo_zones_${new Date().toISOString().slice(0,10)}.geojson`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      alert('Zones exported successfully as GeoJSON!');
      console.log("[Export] GeoJSON export successful.");
    } catch (err) {
      console.error('Error exporting zones GeoJSON:', err);
      setError(`Error exporting zones: ${err.message}`);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen" style={{ backgroundColor: currentColors.backgroundBase }}>
        <Loader2 size={48} className="animate-spin" style={{ color: currentColors.primaryBrand }} />
      </div>
    );
  }

  if (!isNgoLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: currentColors.backgroundBase }}>
        <div className="p-8 rounded-lg shadow-xl w-full max-w-md transition-all duration-300 transform hover:scale-105" style={{ backgroundColor: currentColors.cardBackground, border: `1px solid ${currentColors.borderSubtle}`, boxShadow: `0 10px 30px ${currentColors.shadowBase}` }}>
          <h2 className="text-3xl font-extrabold mb-6 text-center" style={{ color: currentColors.primaryBrand, textShadow: darkMode ? `0 0 15px ${currentColors.primaryBrand}` : 'none' }}>NGO Login</h2>
          {loginError && (
            <p className="text-center mb-4 p-2 rounded-md" style={{color: currentColors.errorText, backgroundColor: currentColors.errorBg, border: `1px solid ${currentColors.errorText}`}}>{loginError}</p>
          )}
          <form onSubmit={handleNgoLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: currentColors.textPrimary }}>Email</label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-200"
                style={{
                  borderColor: currentColors.borderSubtle,
                  backgroundColor: currentColors.inputBg,
                  color: currentColors.textPrimary,
                  '--tw-ring-color': currentColors.primaryBrand
                }}
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: currentColors.textPrimary }}>Password</label>
              <input
                type="password"
                id="password"
                className="mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-200"
                style={{
                  borderColor: currentColors.borderSubtle,
                  backgroundColor: currentColors.inputBg,
                  color: currentColors.textPrimary,
                  '--tw-ring-color': currentColors.primaryBrand
                }}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 rounded-full text-white font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{
                background: currentColors.buttonPrimaryBg,
                boxShadow: darkMode ? `0 0 25px ${currentColors.primaryBrand}` : `0 8px 20px ${currentColors.shadowBase}`
              }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 transition-colors duration-300 font-sans" style={{ backgroundColor: currentColors.backgroundBase, color: currentColors.textPrimary }}>
      <header
        className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center mb-8 p-6 rounded-2xl shadow-xl transition-colors duration-300"
        style={{ background: currentColors.headerBg, border: `1px solid ${currentColors.headerBorder}`, boxShadow: `0 10px 40px ${currentColors.shadowBase}` }}
      >
        <h1 className="text-4xl font-extrabold mb-4 md:mb-0" style={{ color: currentColors.primaryBrand, textShadow: darkMode ? `0 0 18px ${currentColors.primaryBrand}` : 'none' }}>NGO Dashboard</h1>
        <div className="flex flex-wrap justify-center items-center gap-4">
          <button
            onClick={handleGoBack}
            className="px-6 py-3 rounded-full font-bold text-base transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center"
            style={{ color: 'white', background: currentColors.primaryBrand, boxShadow: darkMode ? `0 0 15px ${currentColors.primaryBrand}` : `0 5px 15px ${currentColors.shadowBase}` }}
          >
            &larr; Back to Home
          </button>
          <button
            onClick={() => navigate('/add-report', { state: { userId: 'firebase_uid_of_ngo_user', isNgo: true, loggedInNgoId: loggedInNgoId } })}
            className="px-6 py-3 rounded-full text-white font-bold text-base transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center"
            style={{ background: currentColors.buttonPrimaryBg, boxShadow: darkMode ? `0 0 15px ${currentColors.primaryBrand}` : `0 5px 15px ${currentColors.shadowBase}` }}
          >
            Add New Report
          </button>
          {/* NEW: Add Your Zone Button */}
          <button
            onClick={handleAddZoneClick}
            className="px-6 py-3 rounded-full text-white font-bold text-base transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center"
            style={{ background: currentColors.secondaryAccent, boxShadow: darkMode ? `0 0 15px ${currentColors.secondaryAccent}` : `0 5px 15px rgba(255,140,0,0.3)` }}
          >
            <PlusSquare size={20} className="mr-2" /> Add Your Zone
          </button>
          {/* UPDATED: Profile Button to link to NgoProfilePage */}
          <button
            onClick={() => navigate('/ngo-profile', { state: { loggedInNgoId: loggedInNgoId } })}
            className="px-6 py-3 rounded-full text-white font-bold text-base transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center"
            style={{ background: currentColors.primaryBrand, boxShadow: darkMode ? `0 0 15px ${currentColors.primaryBrand}` : `0 5px 15px ${currentColors.shadowBase}` }}
          >
            <UserCircle size={20} className="mr-2" /> Profile
          </button>
          <div
            onClick={toggleDarkMode}
            className="p-3 rounded-full cursor-pointer shadow-md transition-all duration-300 hover:scale-110"
            style={{ backgroundColor: currentColors.cardBackground, color: currentColors.textPrimary, boxShadow: `0 4px 12px ${currentColors.shadowBase}` }}
          >
          {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </div>
          <button
            onClick={handleNgoLogout}
            className="px-6 py-3 rounded-full text-white font-bold text-base transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center"
            style={{ background: currentColors.errorText, boxShadow: darkMode ? `0 0 15px ${currentColors.errorText}` : `0 5px 15px rgba(220,38,38,0.3)` }}
          >
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="w-full max-w-6xl px-6 py-4 rounded-lg mb-8 text-center animate-fade-in-down border-l-4" style={{ borderColor: currentColors.errorText, backgroundColor: currentColors.errorBg, color: currentColors.errorText, boxShadow: `0 4px 15px rgba(220,38,38,0.2)` }}>
          <strong className="font-bold">Error: </strong>{error}
        </div>
      )}

      <nav className="w-full max-w-7xl mb-8 flex flex-wrap justify-center gap-2 md:gap-4 p-2 rounded-xl shadow-inner" style={{ backgroundColor: currentColors.cardBackground, boxShadow: `inset 0 2px 8px ${currentColors.shadowBase}` }}>
        <TabButton activeTab={activeTab} setActiveTab={setActiveTab} tabName="userReports" icon={<MapPin size={20} className="mr-2" />} label="User Reports" currentColors={currentColors} />
        <TabButton activeTab={activeTab} setActiveTab={setActiveTab} tabName="ngoReports" icon={<Building size={20} className="mr-2" />} label="All NGO Reports" currentColors={currentColors} />
        <TabButton activeTab={activeTab} setActiveTab={setActiveTab} tabName="users" icon={<Users size={20} className="mr-2" />} label="Manage Users" currentColors={currentColors} />
        <TabButton activeTab={activeTab} setActiveTab={setActiveTab} tabName="managedLocations" icon={<Map size={20} className="mr-2" />} label="Managed Locations" currentColors={currentColors} />
        <TabButton activeTab={activeTab} setActiveTab={setActiveTab} tabName="analytics" icon={<BarChart size={20} className="mr-2" />} label="Analytics" currentColors={currentColors} />
        <TabButton activeTab={activeTab} setActiveTab={setActiveTab} tabName="overallLeaderboard" icon={<Award size={20} className="mr-2" />} label="Overall Leaderboard" currentColors={currentColors} />
      </nav>

      <main className="w-full max-w-7xl space-y-8">
        {activeTab === 'userReports' && (
          <section className="p-6 rounded-2xl shadow-xl transition-colors duration-300 animate-fade-in-down" style={{ backgroundColor: currentColors.cardBackground, border: `1px solid ${currentColors.borderSubtle}`, boxShadow: `0 10px 30px ${currentColors.shadowBase}` }}>
            <h2 className="text-3xl font-bold mb-6 flex items-center" style={{ color: currentColors.primaryBrand, textShadow: darkMode ? `0 0 12px ${currentColors.primaryBrand}` : 'none' }}>
              <MapPin size={28} className="mr-3" style={{filter: darkMode ? `drop-shadow(0 0 10px ${currentColors.primaryBrand})` : 'none'}} /> User Reports for Review ({userReportsForReview.length})
            </h2>
            {/* Date Range Filters for User Reports */}
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-8 p-5 rounded-xl border shadow-inner" style={{ borderColor: currentColors.borderSubtle, backgroundColor: currentColors.backgroundBase, boxShadow: `inset 0 2px 8px ${currentColors.shadowBase}` }}>
                <Calendar size={24} className="flex-shrink-0" style={{ color: currentColors.primaryBrand }} />
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium mb-1" style={{ color: currentColors.textSecondary }}>Start Date:</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDateFilter}
                            onChange={(e) => setStartDateFilter(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-200"
                            style={{ borderColor: currentColors.borderSubtle, backgroundColor: currentColors.inputBg, color: currentColors.textPrimary, '--tw-ring-color': currentColors.primaryBrand }}
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium mb-1" style={{ color: currentColors.textSecondary }}>End Date:</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDateFilter}
                            onChange={(e) => setEndDateFilter(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-200"
                            style={{ borderColor: currentColors.borderSubtle, backgroundColor: currentColors.inputBg, color: currentColors.textPrimary, '--tw-ring-color': currentColors.primaryBrand }}
                        />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userReportsForReview.length > 0 ? (
                userReportsForReview.map(report => {
                  const reporterUser = users.find(u => u.uid === report.reportedBy);
                  const isReporterSpamGlobally = reporterUser ? reporterUser.isGloballySpammed : false;
                  const isVerifiedByThisNgo = report.verifiedByNgos?.some(v => v.ngoId === loggedInNgoId);
                  const markedAsSpamByThisNgo = report.markedAsSpamByNgos?.some(s => s.ngoId === loggedInNgoId);
                  const spamCount = report.markedAsSpamByNgos ? report.markedAsSpamByNgos.length : 0;
                  const verifiedCount = report.verifiedByNgos ? report.verifiedByNgos.length : 0;

                  return (
                    <div
                      key={report._id}
                      className="p-6 rounded-xl shadow-lg flex flex-col border transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
                      style={{
                        background: currentColors.reportCardGradient,
                        borderColor: currentColors.reportCardBorder,
                        boxShadow: `0 6px 16px ${currentColors.reportCardShadow}`
                      }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold" style={{ color: currentColors.textPrimary }}>{report.placeName}</h3>
                          <p className="text-sm" style={{ color: currentColors.textSecondary }}>{report.address}</p>
                        </div>
                        {markedAsSpamByThisNgo ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: currentColors.spamBadgeBg, color: currentColors.spamBadgeText }}>
                            <XCircle size={16} className="mr-1" style={{filter: darkMode ? `drop-shadow(0 0 5px ${currentColors.spamBadgeText})` : 'none'}} /> Marked by You (Spam)
                          </span>
                        ) : isVerifiedByThisNgo ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: currentColors.verifiedBadgeBg, color: currentColors.verifiedBadgeText }}>
                            <CheckCircle size={16} className="mr-1" style={{filter: darkMode ? `drop-shadow(0 0 5px ${currentColors.verifiedBadgeText})` : 'none'}} /> Verified by You
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: currentColors.warningBg, color: currentColors.warningText }}>
                            <AlertTriangle size={16} className="mr-1" style={{filter: darkMode ? `drop-shadow(0 0 5px ${currentColors.warningText})` : 'none'}} /> Pending Your Review
                          </span>
                        )}
                      </div>
                      <p className="text-base italic mb-4" style={{ color: currentColors.textPrimary }}>"{report.comment}"</p>
                      {report.imageUrl && (
                        <img src={report.imageUrl} alt="Report" className="w-full h-40 object-cover rounded-md mb-4 border" style={{borderColor: currentColors.borderSubtle}} />
                      )}
                      <div className="flex items-center text-sm mb-2" style={{ color: currentColors.textSecondary }}>
                        <Users size={16} className="mr-2" style={{filter: darkMode ? `drop-shadow(0 0 4px ${currentColors.textSecondary})` : 'none'}} /> {reporterUser ? `${reporterUser.firstName} ${reporterUser.lastName}` : 'Anonymous User'}
                        {isReporterSpamGlobally && (
                          <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: currentColors.spamBadgeBg, color: currentColors.spamBadgeText }}>
                            Global Spam User
                          </span>
                        )}
                      </div>
                      {spamCount > 0 && (
                          <p className="text-xs mb-2 flex items-center" style={{ color: currentColors.errorText }}>
                              <AlertTriangle size={16} className="inline mr-2" style={{filter: darkMode ? `drop-shadow(0 0 4px ${currentColors.errorText})` : 'none'}} /> Marked as Spam by {spamCount} NGO(s)
                          </p>
                      )}
                      {verifiedCount > 0 && (
                          <p className="text-xs mb-2 flex items-center" style={{ color: currentColors.successText }}>
                              <CheckCircle size={16} className="inline mr-2" style={{filter: darkMode ? `drop-shadow(0 0 4px ${currentColors.successText})` : 'none'}} /> Verified by {verifiedCount} NGO(s)
                          </p>
                      )}
                      <div className="flex items-center text-sm mb-4" style={{ color: currentColors.textSecondary }}>
                        <Clock size={16} className="mr-2" style={{filter: darkMode ? `drop-shadow(0 0 4px ${currentColors.textSecondary})` : 'none'}} /> {new Date(report.timestamp).toLocaleDateString()}
                        <MessageSquare size={16} className="ml-4 mr-2" style={{filter: darkMode ? `drop-shadow(0 0 4px ${currentColors.textSecondary})` : 'none'}} /> {report.userComments ? report.userComments.length : 0} comments
                      </div>

                      {report.officialNgoResponse && (
                        <div className="p-4 mt-3 rounded-lg border shadow-inner" style={{ backgroundColor: currentColors.officialResponseBg, borderColor: currentColors.primaryBrand }}>
                          <p className="text-sm font-bold flex items-center mb-2" style={{ color: currentColors.officialResponseText }}>
                            <MessageSquareText size={18} className="mr-2" /> Official Response by {report.officialNgoResponse.ngoName}:
                          </p>
                          <p className="text-base italic" style={{ color: currentColors.officialResponseText }}>"{report.officialNgoResponse.responseText}"</p>
                          <p className="text-xs text-right mt-2" style={{ color: currentColors.officialResponseText }}>
                            - {new Date(report.officialNgoResponse.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      <div className="mt-auto flex flex-wrap justify-end space-x-2 pt-4">
                        <button
                          onClick={() => handleVerifyReport(report._id, isVerifiedByThisNgo)}
                          className={`px-4 py-2 rounded-full text-white font-semibold flex items-center text-sm transition-all duration-200 hover:shadow-md hover:scale-105 ${isVerifiedByThisNgo ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                          style={{ boxShadow: darkMode ? `0 0 10px ${isVerifiedByThisNgo ? currentColors.errorText : currentColors.successText}` : 'none'}}
                        >
                          {isVerifiedByThisNgo ? <XCircle size={18} className="mr-1" /> : <CheckCircle size={18} className="mr-1" />}
                          {isVerifiedByThisNgo ? 'Unverify' : 'Verify'}
                        </button>
                        <button
                          onClick={() => handleMarkReportAsSpam(report._id, markedAsSpamByThisNgo)}
                          className={`px-4 py-2 rounded-full text-white font-semibold flex items-center text-sm transition-all duration-200 hover:shadow-md hover:scale-105 ${markedAsSpamByThisNgo ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                          style={{ boxShadow: darkMode ? `0 0 10px ${markedAsSpamByThisNgo ? currentColors.successText : currentColors.errorText}` : 'none'}}
                        >
                          {markedAsSpamByThisNgo ? <Eye size={18} className="mr-1" /> : <EyeOff size={18} className="mr-1" />}
                          {markedAsSpamByThisNgo ? 'Unmark Spam' : 'Mark Spam'}
                        </button>
                        <button
                          onClick={() => handleAddOfficialResponse(report._id)}
                          className="px-4 py-2 rounded-full text-white font-semibold flex items-center text-sm transition-all duration-200 hover:shadow-md hover:scale-105"
                          style={{ backgroundColor: currentColors.primaryBrand, boxShadow: darkMode ? `0 0 10px ${currentColors.primaryBrand}` : 'none'}}
                        >
                          <MessageSquareText size={18} className="mr-1" /> Respond
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-xl col-span-full py-10 font-medium" style={{ color: currentColors.textSecondary }}>No user reports available for review.</p>
              )}
            </div>
          </section>
        )}

        {activeTab === 'ngoReports' && (
          <section className="p-6 rounded-2xl shadow-xl transition-colors duration-300 animate-fade-in-down" style={{ backgroundColor: currentColors.cardBackground, border: `1px solid ${currentColors.borderSubtle}`, boxShadow: `0 10px 30px ${currentColors.shadowBase}` }}>
            <h2 className="text-3xl font-bold mb-6 flex items-center" style={{ color: currentColors.primaryBrand, textShadow: darkMode ? `0 0 12px ${currentColors.primaryBrand}` : 'none' }}>
              <Building size={28} className="mr-3" style={{filter: darkMode ? `drop-shadow(0 0 10px ${currentColors.primaryBrand})` : 'none'}} /> All NGO Reports ({allNgoReports.length})
            </h2>
            {/* Date Range Filters for NGO Reports */}
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-8 p-5 rounded-xl border shadow-inner" style={{ borderColor: currentColors.borderSubtle, backgroundColor: currentColors.backgroundBase, boxShadow: `inset 0 2px 8px ${currentColors.shadowBase}` }}>
                <Calendar size={24} className="flex-shrink-0" style={{ color: currentColors.primaryBrand }} />
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div>
                        <label htmlFor="startDateNgo" className="block text-sm font-medium mb-1" style={{ color: currentColors.textSecondary }}>Start Date:</label>
                        <input
                            type="date"
                            id="startDateNgo"
                            value={startDateFilter}
                            onChange={(e) => setStartDateFilter(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-200"
                            style={{ borderColor: currentColors.borderSubtle, backgroundColor: currentColors.cardBackground, color: currentColors.textPrimary, '--tw-ring-color': currentColors.primaryBrand }}
                        />
                    </div>
                    <div>
                        <label htmlFor="endDateNgo" className="block text-sm font-medium mb-1" style={{ color: currentColors.textSecondary }}>End Date:</label>
                        <input
                            type="date"
                            id="endDateNgo"
                            value={endDateFilter}
                            onChange={(e) => setEndDateFilter(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-200"
                            style={{ borderColor: currentColors.borderSubtle, backgroundColor: currentColors.cardBackground, color: currentColors.textPrimary, '--tw-ring-color': currentColors.primaryBrand }}
                        />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allNgoReports.length > 0 ? (
                allNgoReports.map(report => {
                  const isVerifiedByThisNgo = report.verifiedByNgos?.some(v => v.ngoId === loggedInNgoId);
                  const markedAsSpamByThisNgo = report.markedAsSpamByNgos?.some(s => s.ngoId === loggedInNgoId);
                  const isReportedByLoggedInNgo = report.ngoReporterId === loggedInNgoId;
                  const otherNgoSpamCount = (report.markedAsSpamByNgos ? report.markedAsSpamByNgos.length : 0) - (markedAsSpamByThisNgo ? 1 : 0);
                  const verifiedCount = report.verifiedByNgos ? report.verifiedByNgos.length : 0;


                  return (
                    <div
                      key={report._id}
                      className="p-6 rounded-xl shadow-lg flex flex-col border transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
                      style={{
                        background: currentColors.reportCardGradient,
                        borderColor: currentColors.reportCardBorder,
                        boxShadow: `0 6px 16px ${currentColors.reportCardShadow}`
                      }}
                    >
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <h3 className="text-xl font-bold" style={{ color: currentColors.textPrimary }}>{report.placeName}</h3>
                              <p className="text-sm" style={{ color: currentColors.textSecondary }}>{report.address}</p>
                          </div>
                          {isReportedByLoggedInNgo ? (
                               <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                                     style={{ backgroundColor: currentColors.ngoBg, color: currentColors.ngoText }}>
                                  <Building size={16} className="mr-1" style={{filter: darkMode ? `drop-shadow(0 0 5px ${currentColors.ngoText})` : 'none'}} /> Reported by You
                               </span>
                          ) : markedAsSpamByThisNgo ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: currentColors.spamBadgeBg, color: currentColors.spamBadgeText }}>
                                  <XCircle size={16} className="mr-1" style={{filter: darkMode ? `drop-shadow(0 0 5px ${currentColors.spamBadgeText})` : 'none'}} /> Marked by You (Spam)
                              </span>
                          ) : isVerifiedByThisNgo ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: currentColors.verifiedBadgeBg, color: currentColors.verifiedBadgeText }}>
                                  <CheckCircle size={16} className="mr-1" style={{filter: darkMode ? `drop-shadow(0 0 5px ${currentColors.verifiedBadgeText})` : 'none'}} /> Verified by You
                              </span>
                          ) : (report.markedAsSpamByNgos && report.markedAsSpamByNgos.length > 0) ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: currentColors.spamBadgeBg, color: currentColors.spamBadgeText }}>
                                  <XCircle size={16} className="mr-1" style={{filter: darkMode ? `drop-shadow(0 0 5px ${currentColors.spamBadgeText})` : 'none'}} /> Marked as Spam ({otherNgoSpamCount})
                              </span>
                          ) : (report.verifiedByNgos && report.verifiedByNgos.length > 0) ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: currentColors.verifiedBadgeBg, color: currentColors.verifiedBadgeText }}>
                                  <CheckCircle size={16} className="mr-1" style={{filter: darkMode ? `drop-shadow(0 0 5px ${currentColors.verifiedBadgeText})` : 'none'}} /> Verified ({verifiedCount})
                              </span>
                          ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: currentColors.warningBg, color: currentColors.warningText }}>
                                  <AlertTriangle size={16} className="mr-1" style={{filter: darkMode ? `drop-shadow(0 0 5px ${currentColors.warningText})` : 'none'}} /> Pending Review
                              </span>
                          )}
                      </div>
                      <p className="text-base italic mb-4" style={{ color: currentColors.textPrimary }}>"{report.comment}"</p>
                      {report.imageUrl && (
                        <img src={report.imageUrl} alt="Report" className="w-full h-40 object-cover rounded-md mb-4 border" style={{borderColor: currentColors.borderSubtle}} />
                      )}
                      <div className="flex items-center text-sm mb-2" style={{ color: currentColors.textSecondary }}>
                        <Users size={16} className="mr-2" style={{filter: darkMode ? `drop-shadow(0 0 4px ${currentColors.textSecondary})` : 'none'}} /> {report.userName || 'Anonymous NGO'}
                      </div>
                      <div className="flex items-center text-sm mb-4" style={{ color: currentColors.textSecondary }}>
                        <Clock size={16} className="mr-2" style={{filter: darkMode ? `drop-shadow(0 0 4px ${currentColors.textSecondary})` : 'none'}} /> {new Date(report.timestamp).toLocaleDateString()}
                        <MessageSquare size={16} className="ml-4 mr-2" style={{filter: darkMode ? `drop-shadow(0 0 4px ${currentColors.textSecondary})` : 'none'}} /> {report.userComments ? report.userComments.length : 0} comments
                      </div>

                      {report.officialNgoResponse && (
                        <div className="p-4 mt-3 rounded-lg border shadow-inner" style={{ backgroundColor: currentColors.officialResponseBg, borderColor: currentColors.primaryBrand }}>
                          <p className="text-sm font-bold flex items-center mb-2" style={{ color: currentColors.officialResponseText }}>
                            <MessageSquareText size={18} className="mr-2" /> Official Response by {report.officialNgoResponse.ngoName}:
                          </p>
                          <p className="text-base italic" style={{ color: currentColors.officialResponseText }}>"{report.officialNgoResponse.responseText}"</p>
                          <p className="text-xs text-right mt-2" style={{ color: currentColors.officialResponseText }}>
                            - {new Date(report.officialNgoResponse.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {!isReportedByLoggedInNgo && (
                          <div className="mt-auto flex flex-wrap justify-end space-x-2 pt-4">
                              <button
                                  onClick={() => handleVerifyReport(report._id, isVerifiedByThisNgo)}
                                  className={`px-4 py-2 rounded-full text-white font-semibold flex items-center text-sm transition-all duration-200 hover:shadow-md hover:scale-105 ${isVerifiedByThisNgo ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                                  style={{ boxShadow: darkMode ? `0 0 10px ${isVerifiedByThisNgo ? currentColors.errorText : currentColors.successText}` : 'none'}}
                              >
                                  {isVerifiedByThisNgo ? <XCircle size={18} className="mr-1" /> : <CheckCircle size={18} className="mr-1" />}
                                  {isVerifiedByThisNgo ? 'Unverify' : 'Verify'}
                              </button>
                              <button
                                  onClick={() => handleMarkReportAsSpam(report._id, markedAsSpamByThisNgo)}
                                  className={`px-4 py-2 rounded-full text-white font-semibold flex items-center text-sm transition-all duration-200 hover:shadow-md hover:scale-105 ${markedAsSpamByThisNgo ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                                  style={{ boxShadow: darkMode ? `0 0 10px ${markedAsSpamByThisNgo ? currentColors.successText : currentColors.errorText}` : 'none'}}
                              >
                                  {markedAsSpamByThisNgo ? <Eye size={18} className="mr-1" /> : <EyeOff size={18} className="mr-1" />}
                                  {markedAsSpamByThisNgo ? 'Unmark Spam' : 'Mark Spam'}
                              </button>
                              <button
                                onClick={() => handleAddOfficialResponse(report._id)}
                                className="px-4 py-2 rounded-full text-white font-semibold flex items-center text-sm transition-all duration-200 hover:shadow-md hover:scale-105"
                                style={{ backgroundColor: currentColors.primaryBrand, boxShadow: darkMode ? `0 0 10px ${currentColors.primaryBrand}` : 'none'}}
                              >
                                <MessageSquareText size={18} className="mr-1" /> Respond
                              </button>
                          </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-xl col-span-full py-10 font-medium" style={{ color: currentColors.textSecondary }}>No NGO reports available.</p>
              )}
            </div>
          </section>
        )}

        {activeTab === 'users' && (
          <section className="p-6 rounded-2xl shadow-xl transition-colors duration-300 animate-fade-in-down" style={{ backgroundColor: currentColors.cardBackground, border: `1px solid ${currentColors.borderSubtle}`, boxShadow: `0 10px 30px ${currentColors.shadowBase}` }}>
            <h2 className="text-3xl font-bold mb-6 flex items-center" style={{ color: currentColors.primaryBrand, textShadow: darkMode ? `0 0 12px ${currentColors.primaryBrand}` : 'none' }}>
              <Users size={28} className="mr-3" style={{filter: darkMode ? `drop-shadow(0 0 10px ${currentColors.primaryBrand})` : 'none'}} /> Manage Users
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.length > 0 ? (
                users.map(user => {
                  const markedAsSpamByThisNgo = Array.isArray(user.markedAsSpamByNgos) && user.markedAsSpamByNgos.some(s => {
                      return s.ngoId?.toString() === loggedInNgoId;
                  });
                  const totalSpammingNgos = Array.isArray(user.markedAsSpamByNgos) ? user.markedAsSpamByNgos.length : 0;

                  console.log(`[User Card] User ${user.email} (UID: ${user.uid}): markedAsSpamByThisNgo = ${markedAsSpamByThisNgo}, totalSpammingNgos = ${totalSpammingNgos}, isGloballySpammed = ${user.isGloballySpammed}`);
                  if (Array.isArray(user.markedAsSpamByNgos)) {
                      user.markedAsSpamByNgos.forEach((s, idx) => {
                          console.log(`  [User Card] Spamming NGO entry ${idx}: ngoId: ${s.ngoId}, type: ${typeof s.ngoId}, toString(): ${s.ngoId?.toString()}`);
                      });
                  }


                  return (
                    <div
                      key={user._id}
                      className="p-6 rounded-xl shadow-lg flex flex-col border transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
                      style={{
                        backgroundColor: currentColors.cardBackground,
                        borderColor: currentColors.borderSubtle,
                        boxShadow: `0 6px 16px ${currentColors.reportCardShadow}`
                      }}
                    >
                      <h3 className="text-xl font-bold mb-3" style={{ color: currentColors.textPrimary }}>
                        {user.firstName} {user.lastName} <span className="text-sm font-normal" style={{color: currentColors.textSecondary}}>({user.email})</span>
                      </h3>
                      <div className="text-sm mb-4 space-y-2">
                        {user.isGloballySpammed ? (
                          <p className="font-semibold px-3 py-1.5 rounded-md flex items-center" style={{ backgroundColor: currentColors.errorBg, color: currentColors.errorText }}>
                            <AlertTriangle size={18} className="inline mr-2" style={{filter: darkMode ? `drop-shadow(0 0 4px ${currentColors.errorText})` : 'none'}} />
                            Account Status: Globally Spammed
                          </p>
                        ) : (
                          <p className="font-semibold px-3 py-1.5 rounded-md flex items-center" style={{ backgroundColor: currentColors.successBg, color: currentColors.successText }}>
                            <UserCheck size={18} className="inline mr-2" style={{filter: darkMode ? `drop-shadow(0 0 4px ${currentColors.successText})` : 'none'}} />
                            Account Status: Active
                          </p>
                        )}
                        <p className="px-3 py-1.5 rounded-md flex items-center" style={{
                            backgroundColor: markedAsSpamByThisNgo ? currentColors.userSpammedByYouBg : 'transparent',
                            color: markedAsSpamByThisNgo ? currentColors.userSpammedByYouText : currentColors.textSecondary,
                            fontWeight: markedAsSpamByThisNgo ? '600' : 'normal'
                        }}>
                            {markedAsSpamByThisNgo ? (
                                <>
                                    <AlertTriangle size={18} className="inline mr-2" style={{ color: currentColors.userSpammedByYouText }} />
                                    <span>You have marked this user as spam.</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={18} className="inline mr-2" style={{ color: currentColors.textSecondary }}/>
                                    <span>You have NOT marked this user as spam.</span>
                                </>
                            )}
                        </p>
                        {totalSpammingNgos > 0 && (
                            <p className="px-3 py-1.5 rounded-md flex items-center" style={{ backgroundColor: currentColors.errorBg, color: currentColors.errorText }}>
                                <AlertTriangle size={18} className="inline mr-2" style={{filter: darkMode ? `drop-shadow(0 0 4px ${currentColors.errorText})` : 'none'}} />
                                Marked as spam by {totalSpammingNgos} NGO(s) total.
                            </p>
                        )}
                        {user.isGloballySpammed && user.spamReason && (
                            <p className="text-sm italic px-3 py-1 rounded-md" style={{ color: currentColors.textSecondary }}>Reason: {user.spamReason}</p>
                        )}
                      </div>

                      <div className="mt-auto flex flex-wrap justify-end gap-2 pt-4">
                        <button
                          onClick={() => handleMarkUserAsSpam(user.uid, markedAsSpamByThisNgo)}
                          className={`px-5 py-2.5 rounded-full text-white font-semibold flex items-center text-base transition-all duration-200 hover:shadow-md hover:scale-105 ${markedAsSpamByThisNgo ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                          style={{ boxShadow: darkMode ? `0 0 10px ${markedAsSpamByThisNgo ? currentColors.successText : currentColors.errorText}` : 'none'}}
                        >
                          {markedAsSpamByThisNgo ? <UserCheck size={20} className="mr-1" /> : <UserX size={20} className="mr-1" />}
                          {markedAsSpamByThisNgo ? 'Unmark Spam' : 'Mark as Spam'}
                        </button>
                        {user.isGloballySpammed && (
                            <button
                                onClick={() => handleGoToSpamAccountPage(user.uid)}
                                className="px-5 py-2.5 rounded-full text-white font-semibold flex items-center text-base transition-all duration-200 hover:shadow-md hover:scale-105"
                                style={{ backgroundColor: currentColors.warningText, boxShadow: darkMode ? `0 0 10px ${currentColors.warningText}` : 'none'}}
                            >
                                <ExternalLink size={20} className="mr-1" /> Spam Details
                            </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-xl col-span-full py-10 font-medium" style={{ color: currentColors.textSecondary }}>No users available.</p>
              )}
            </div>
          </section>
        )}

        {activeTab === 'managedLocations' && (
          <section
            className="p-6 rounded-2xl shadow-xl transition-colors duration-300 animate-fade-in-down"
            style={{
              backgroundColor: currentColors.cardBackground,
              border: `1px solid ${currentColors.borderSubtle}`,
              boxShadow: `0 10px 30px ${currentColors.shadowBase}`
            }}
          >
            <h2
              className="text-3xl font-bold mb-6 flex items-center"
              style={{ color: currentColors.primaryBrand, textShadow: darkMode ? `0 0 12px ${currentColors.primaryBrand}` : 'none' }}
            >
              <Map size={28} className="mr-3" style={{filter: darkMode ? `drop-shadow(0 0 10px ${currentColors.primaryBrand})` : 'none'}} /> Manage NGO-Specific Locations
            </h2>

            {ngoZones.length === 0 && !startDrawingMode ? ( // Show message if no zones and not drawing
                <div className="text-center py-12 border rounded-xl mb-8 shadow-inner" style={{ borderColor: currentColors.borderSubtle, backgroundColor: currentColors.backgroundBase, color: currentColors.textSecondary, boxShadow: `inset 0 2px 8px ${currentColors.shadowBase}` }}>
                    <p className="text-xl font-semibold mb-4">No zones claimed yet!</p>
                    <p className="text-lg mb-6">Click "Add Your Zone" in the header to define your first managed zone.</p>
                </div>
            ) : (
                <>
                    {/* Zone Filter Dropdown */}
                    <div className="mb-6 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 p-4 rounded-xl border shadow-inner" style={{ borderColor: currentColors.borderSubtle, backgroundColor: currentColors.backgroundBase, boxShadow: `inset 0 2px 8px ${currentColors.shadowBase}` }}>
                        <label htmlFor="zoneFilter" className="font-semibold text-lg flex items-center" style={{ color: currentColors.textPrimary }}>
                            <Filter size={22} className="inline mr-2" /> Filter Reports by Zone:
                        </label>
                        <select
                            id="zoneFilter"
                            value={selectedZoneFilter}
                            onChange={(e) => setSelectedZoneFilter(e.target.value)}
                            className="p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-200 w-full sm:w-auto"
                            style={{ borderColor: currentColors.borderSubtle, backgroundColor: currentColors.inputBg, color: currentColors.textPrimary, '--tw-ring-color': currentColors.primaryBrand }}
                        >
                            <option value="">All My Zones</option>
                            {ngoZones.map(zone => (
                                <option key={zone._id} value={zone._id}>{zone.name}</option>
                            ))}
                        </select>
                    </div>
                </>
            )}


            <ManagedLocationsMap
              ngoZones={ngoZones}
              reports={reportsInSelectedZone}
              onZoneCreate={handleSaveZone}
              startDrawingMode={startDrawingMode} // Pass the new prop
              setStartDrawingMode={setStartDrawingMode} // Pass setter to allow map to reset it
              isPointInPolygonWrapper={isPointInPolygonWrapper} // NEW: Pass the wrapper function
            />

            {/* Zone Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="p-5 rounded-xl shadow-md flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-lg hover:scale-105" style={{ backgroundColor: currentColors.successBg, color: currentColors.successText, border: `1px solid ${currentColors.successText}` }}>
                <p className="text-xl font-semibold mb-2">Zones Claimed:</p>
                <span className="text-4xl font-extrabold">{ngoZones.length}</span>
              </div>
              <div className="p-5 rounded-xl shadow-md flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-lg hover:scale-105" style={{ backgroundColor: currentColors.officialResponseBg, color: currentColors.officialResponseText, border: `1px solid ${currentColors.officialResponseText}` }}>
                <p className="text-xl font-semibold mb-2">Reports in Zones:</p>
                <span className="text-4xl font-extrabold">{totalReportsInZones}</span>
              </div>
              <div className="p-5 rounded-xl shadow-md flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-lg hover:scale-105" style={{ backgroundColor: currentColors.warningBg, color: currentColors.warningText, border: `1px solid ${currentColors.warningText}` }}>
                <p className="text-xl font-semibold mb-2">Verified %:</p>
                <span className="text-4xl font-extrabold">{verificationPercentage}%</span>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'analytics' && (
          <section className="p-6 rounded-2xl shadow-xl transition-colors duration-300 animate-fade-in-down" style={{ backgroundColor: currentColors.cardBackground, border: `1px solid ${currentColors.borderSubtle}`, boxShadow: `0 10px 30px ${currentColors.shadowBase}` }}>
            <h2 className="text-3xl font-bold mb-6 flex items-center" style={{ color: currentColors.primaryBrand, textShadow: darkMode ? `0 0 12px ${currentColors.primaryBrand}` : 'none' }}>
              <BarChart size={28} className="mr-3" style={{filter: darkMode ? `drop-shadow(0 0 10px ${currentColors.primaryBrand})` : 'none'}} /> NGO Performance & Impact Analytics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* NGO Performance Overview */}
                <div className="p-6 rounded-xl border shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.01]" style={{ backgroundColor: currentColors.backgroundBase, borderColor: currentColors.borderSubtle, boxShadow: `0 4px 15px ${currentColors.shadowBase}` }}>
                    <h3 className="text-2xl font-bold mb-4 flex items-center" style={{ color: currentColors.primaryBrand }}>
                        <Trophy size={24} className="mr-2" /> Your Performance
                    </h3>
                    <div className="space-y-4 text-lg">
                        <p className="flex justify-between items-center py-2 border-b" style={{borderColor: currentColors.borderSubtle}}>
                            Reports Verified: <span className="font-bold text-green-600">{ngoPerformance.reportsVerified}</span>
                        </p>
                        <p className="flex justify-between items-center py-2 border-b" style={{borderColor: currentColors.borderSubtle}}>
                            Reports Marked as Spam: <span className="font-bold text-red-600">{ngoPerformance.reportsSpammed}</span>
                        </p>
                        <p className="flex justify-between items-center py-2">
                            Zones Claimed: <span className="font-bold text-blue-600">{ngoPerformance.zonesClaimed}</span>
                        </p>
                    </div>
                </div>

                {/* Impact by Zone */}
                <div className="p-6 rounded-xl border shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.01]" style={{ backgroundColor: currentColors.backgroundBase, borderColor: currentColors.borderSubtle, boxShadow: `0 4px 15px ${currentColors.shadowBase}` }}>
                    <h3 className="text-2xl font-bold mb-4 flex items-center" style={{ color: currentColors.primaryBrand }}>
                        <MapPin size={24} className="mr-2" /> Impact by Zone
                    </h3>
                    {ngoZones.length > 0 ? (
                        <ul className="space-y-3">
                            {ngoZones.map(zone => {
                                const reportsInThisZone = allReportsCombined.filter(r => {
                                    const lat = Number(r.latitude);
                                    const lng = Number(r.longitude);
                                    if (isNaN(lat) || isNaN(lng)) return false;
                                    return isPointInPolygonWrapper(lat, lng, zone.coordinates); // Use the corrected wrapper
                                });
                                const verifiedInThisZone = reportsInThisZone.filter(r =>
                                    r.verifiedByNgos?.some(v => v.ngoId === loggedInNgoId)
                                ).length;
                                const zoneVerificationPercent = reportsInThisZone.length > 0
                                    ? Math.round((verifiedInThisZone / reportsInThisZone.length) * 100)
                                    : 0;

                                return (
                                    <li key={zone._id} className="flex justify-between items-center text-lg p-2 rounded-md" style={{ backgroundColor: currentColors.cardBackground, border: `1px solid ${currentColors.borderSubtle}` }}>
                                        <span className="font-medium" style={{color: currentColors.textPrimary}}>{zone.name}:</span>
                                        <span className="text-gray-700 dark:text-gray-300 font-semibold">
                                            {reportsInThisZone.length} reports, {zoneVerificationPercent}% verified
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-lg text-gray-600 dark:text-gray-400 py-4">Claim zones in the "Managed Locations" tab to see zone-specific impact.</p>
                    )}
                </div>

                {/* Existing NGO Leaderboard Section (Zone-based and Fastest Response) */}
                <div className="md:col-span-2 p-6 rounded-xl border shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.01]" style={{ backgroundColor: currentColors.backgroundBase, borderColor: currentColors.borderSubtle, boxShadow: `0 4px 15px ${currentColors.shadowBase}` }}>
                    <h3 className="text-2xl font-bold mb-5 flex items-center" style={{ color: currentColors.primaryBrand }}>
                        <Award size={24} className="mr-2" /> Leaderboard (Zones & Response Time)
                    </h3>

                    {/* Zone with Most Verified Reports */}
                    <div className="mb-8">
                        <h4 className="text-xl font-bold mb-3 flex items-center" style={{ color: currentColors.textPrimary }}>
                            <MapPin size={20} className="mr-2" /> Zone with Most Verified Reports
                        </h4>
                        {topZones.length > 0 ? (
                            <ul className="space-y-2">
                                {topZones.map((entry, index) => (
                                    <li key={entry.zoneId} className="flex justify-between items-center p-3 rounded-md border" style={{ backgroundColor: index % 2 === 0 ? currentColors.cardBackground : currentColors.backgroundBase, borderColor: currentColors.borderSubtle }}>
                                        <span className="font-medium text-lg" style={{ color: currentColors.textPrimary }}>{index + 1}. {entry.zoneName}</span>
                                        <span className="text-green-600 font-bold text-lg">{entry.verifiedReportsCount} Verified Reports</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400 py-2">No zones with verified reports yet. Verify reports within your zones to see this leaderboard.</p>
                        )}
                    </div>

                    {/* NGO with Fastest Response Time */}
                    <div>
                        <h4 className="text-xl font-bold mb-3 flex items-center" style={{ color: currentColors.textPrimary }}>
                            <Clock size={20} className="mr-2" /> NGO with Fastest Response Time
                        </h4>
                        {fastestResponseNgos.length > 0 ? (
                            <ul className="space-y-2">
                                {fastestResponseNgos.map((entry, index) => (
                                    <li key={entry.ngoId} className="flex justify-between items-center p-3 rounded-md border" style={{ backgroundColor: index % 2 === 0 ? currentColors.cardBackground : currentColors.backgroundBase, borderColor: currentColors.borderSubtle }}>
                                        <span className="font-medium text-lg" style={{ color: currentColors.textPrimary }}>{index + 1}. {entry.ngoName}</span>
                                        <span className="text-blue-600 font-bold text-lg">
                                            {entry.averageResponseTimeHours.toFixed(2)} hours (Avg.)
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400 py-2">No official responses recorded yet. Respond to reports to see this leaderboard.</p>
                        )}
                    </div>
                </div>


                {/* Data Export Options */}
                <div className="md:col-span-2 p-6 rounded-xl border shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.01]" style={{ backgroundColor: currentColors.backgroundBase, borderColor: currentColors.borderSubtle, boxShadow: `0 4px 15px ${currentColors.shadowBase}` }}>
                    <h3 className="text-2xl font-bold mb-4 flex items-center" style={{ color: currentColors.primaryBrand }}>
                        <ExternalLink size={24} className="mr-2" /> Data Export
                    </h3>
                    <p className="text-base mb-4" style={{color: currentColors.textSecondary}}>Export your reports and claimed zones for external analysis or record-keeping.</p>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={handleExportReportsCSV}
                            className="px-6 py-3 rounded-full text-white font-bold text-base transition-all duration-300 hover:shadow-lg hover:scale-105"
                            style={{ background: currentColors.buttonPrimaryBg, boxShadow: darkMode ? `0 0 15px ${currentColors.primaryBrand}` : `0 5px 15px ${currentColors.shadowBase}` }}
                        >
                            Export Reports (CSV)
                        </button>
                        <button
                            onClick={handleExportZonesGeoJSON}
                            className="px-6 py-3 rounded-full text-white font-bold text-base transition-all duration-300 hover:shadow-lg hover:scale-105"
                            style={{ background: currentColors.buttonPrimaryBg, boxShadow: darkMode ? `0 0 15px ${currentColors.primaryBrand}` : `0 5px 15px ${currentColors.shadowBase}` }}
                        >
                            Export Zones (GeoJSON)
                        </button>
                    </div>
                </div>

                {/* Future Features / Analytics Roadmap */}
                <div className="md:col-span-2 p-6 rounded-xl border shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.01]" style={{ backgroundColor: currentColors.backgroundBase, borderColor: currentColors.borderSubtle, boxShadow: `0 4px 15px ${currentColors.shadowBase}` }}>
                    <h3 className="text-2xl font-bold mb-4 flex items-center" style={{ color: currentColors.primaryBrand }}>
                        <TrendingUp size={24} className="mr-2" /> Future Analytics & Features
                    </h3>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-3 text-base">
                        <li><strong>Accessibility Heatmaps:</strong> Visualize areas with high concentrations of accessibility issues within your zones.</li>
                        <li><strong>Month-wise Improvements:</strong> Track progress over time for reports within claimed zones.</li>
                        <li><strong>AI-based Route Suggestions:</strong> Integrate zone data to suggest accessible routes avoiding known inaccessible areas.</li>
                        <li><strong>Emergency Alerts:</strong> Send targeted alerts to NGOs or volunteers within specific zones.</li>
                        <li><strong>Collaborative Performance:</strong> Compare performance metrics with other NGOs (with proper data sharing agreements).</li>
                    </ul>
                </div>
            </div>
          </section>
        )}

        {activeTab === 'overallLeaderboard' && (
            <section className="p-6 rounded-2xl shadow-xl transition-colors duration-300 animate-fade-in-down" style={{ backgroundColor: currentColors.cardBackground, border: `1px solid ${currentColors.borderSubtle}`, boxShadow: `0 10px 30px ${currentColors.shadowBase}` }}>
                <h2 className="text-3xl font-bold mb-6 flex items-center" style={{ color: currentColors.primaryBrand, textShadow: darkMode ? `0 0 12px ${currentColors.primaryBrand}` : 'none' }}>
                    <Award size={28} className="mr-3" style={{filter: darkMode ? `drop-shadow(0 0 10px ${currentColors.primaryBrand})` : 'none'}} /> Overall NGO Leaderboard
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Total Reports by NGO */}
                    <div className="p-6 rounded-xl border shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.01]" style={{ backgroundColor: currentColors.backgroundBase, borderColor: currentColors.borderSubtle, boxShadow: `0 4px 15px ${currentColors.shadowBase}` }}>
                        <h3 className="text-2xl font-bold mb-4 flex items-center" style={{ color: currentColors.primaryBrand }}>
                            <Building size={24} className="mr-2" /> Most Reports Submitted
                        </h3>
                        {ngoTotalReportsLeaderboard.length > 0 ? (
                            <ul className="space-y-3">
                                {ngoTotalReportsLeaderboard.map((entry, index) => (
                                    <li key={entry.ngoId} className="flex justify-between items-center p-3 rounded-md border" style={{ backgroundColor: index % 2 === 0 ? currentColors.cardBackground : currentColors.backgroundBase, borderColor: currentColors.borderSubtle }}>
                                        <span className="font-medium text-lg" style={{ color: currentColors.textPrimary }}>{index + 1}. {entry.ngoName}</span>
                                        <span className="text-blue-600 font-bold text-lg">{entry.totalReports} reports</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-lg text-gray-600 dark:text-gray-400 py-2">No NGO reports submitted yet.</p>
                        )}
                    </div>

                    {/* Total Verified Reports by NGO */}
                    <div className="p-6 rounded-xl border shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.01]" style={{ backgroundColor: currentColors.backgroundBase, borderColor: currentColors.borderSubtle, boxShadow: `0 4px 15px ${currentColors.shadowBase}` }}>
                        <h3 className="text-2xl font-bold mb-4 flex items-center" style={{ color: currentColors.primaryBrand }}>
                            <CheckCircle size={24} className="mr-2" /> Most Reports Verified
                        </h3>
                        {ngoVerifiedReportsLeaderboard.length > 0 ? (
                            <ul className="space-y-3">
                                {ngoVerifiedReportsLeaderboard.map((entry, index) => (
                                    <li key={entry.ngoId} className="flex justify-between items-center p-3 rounded-md border" style={{ backgroundColor: index % 2 === 0 ? currentColors.cardBackground : currentColors.backgroundBase, borderColor: currentColors.borderSubtle }}>
                                        <span className="font-medium text-lg" style={{ color: currentColors.textPrimary }}>{index + 1}. {entry.ngoName}</span>
                                        <span className="text-green-600 font-bold text-lg">{entry.totalVerifiedReports} verified</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-lg text-gray-600 dark:text-gray-400 py-2">No reports verified by NGOs yet.</p>
                        )}
                    </div>

                    {/* Total Spam Reports by NGO */}
                    <div className="p-6 rounded-xl border shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.01]" style={{ backgroundColor: currentColors.backgroundBase, borderColor: currentColors.borderSubtle, boxShadow: `0 4px 15px ${currentColors.shadowBase}` }}>
                        <h3 className="text-2xl font-bold mb-4 flex items-center" style={{ color: currentColors.primaryBrand }}>
                            <XCircle size={24} className="mr-2" /> Most Reports Marked as Spam
                        </h3>
                        {ngoSpamReportsLeaderboard.length > 0 ? (
                            <ul className="space-y-3">
                                {ngoSpamReportsLeaderboard.map((entry, index) => (
                                    <li key={entry.ngoId} className="flex justify-between items-center p-3 rounded-md border" style={{ backgroundColor: index % 2 === 0 ? currentColors.cardBackground : currentColors.backgroundBase, borderColor: currentColors.borderSubtle }}>
                                        <span className="font-medium text-lg" style={{ color: currentColors.textPrimary }}>{index + 1}. {entry.ngoName}</span>
                                        <span className="text-red-600 font-bold text-lg">{entry.totalSpamReports} spam reports</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-lg text-gray-600 dark:text-gray-400 py-2">No reports marked as spam by NGOs yet.</p>
                        )}
                    </div>
                </div>
            </section>
        )}
      </main>
    </div>
  );
}

// Helper component for Tab Buttons to reduce repetition and improve readability
const TabButton = ({ activeTab, setActiveTab, tabName, icon, label, currentColors }) => (
  <button
    onClick={() => setActiveTab(tabName)}
    className={`px-6 py-3 rounded-xl font-bold text-base transition-all duration-200 flex items-center justify-center min-w-[150px] text-center ${activeTab === tabName ? 'text-white' : ''}`}
    style={{
      backgroundColor: activeTab === tabName ? currentColors.primaryBrand : currentColors.backgroundBase,
      color: activeTab === tabName ? currentColors.verifiedBadgeText : currentColors.textPrimary,
      // Replaced 'border' shorthand with individual properties to avoid conflict with 'borderBottom'
      borderTop: `1px solid ${currentColors.borderSubtle}`,
      borderLeft: `1px solid ${currentColors.borderSubtle}`,
      borderRight: `1px solid ${currentColors.borderSubtle}`,
      borderBottom: activeTab === tabName ? `4px solid ${currentColors.secondaryAccent}` : `1px solid ${currentColors.borderSubtle}`,
      boxShadow: activeTab === tabName ? `0 6px 20px ${currentColors.primaryBrand}40` : `0 2px 8px ${currentColors.shadowBase}`,
      transform: activeTab === tabName ? 'translateY(-2px)' : 'none',
      fontWeight: activeTab === tabName ? 'extrabold' : 'bold',
      position: 'relative',
      zIndex: activeTab === tabName ? 10 : 1,
      paddingTop: activeTab === tabName ? '14px' : '12px',
      paddingBottom: activeTab === tabName ? '14px' : '12px',
      borderRadius: '12px',
      // Removed conflicting 'borderColor' property as individual border properties are now used
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: `0 4px 15px ${currentColors.primaryBrand}20`,
      }
    }}
  >
    {icon} {label}
  </button>
);

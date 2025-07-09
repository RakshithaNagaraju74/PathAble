// UserAnalyticsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { CircleGauge, BadgeCheck, Handshake, MapPin, Loader2, Home, Award,Sun,Moon } from 'lucide-react'; // Added Award icon for Impact Score
import UserReportsMap from '../pages/UserReportsMap'; // Adjust path as needed
import L from 'leaflet'; // Import L for map related functions if needed for initial check

// Define color themes
const colors = {
    light: {
        primaryBg: 'bg-gradient-to-br from-indigo-50 to-purple-50',
        secondaryBg: 'bg-white',
        text: 'text-gray-800',
        border: 'border-gray-200',
        shadow: 'shadow-md',
        cardHover: 'hover:shadow-lg',
        icon: 'text-indigo-600',
        button: 'bg-indigo-600 text-white hover:bg-indigo-700',
        buttonOutline: 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50',
    },
    dark: {
        primaryBg: 'bg-gradient-to-br from-gray-900 to-gray-800',
        secondaryBg: 'bg-gray-800',
        text: 'text-gray-100',
        border: 'border-gray-700',
        shadow: 'shadow-lg shadow-gray-900',
        cardHover: 'hover:shadow-xl',
        icon: 'text-purple-400',
        button: 'bg-purple-600 text-white hover:bg-purple-700',
        buttonOutline: 'border border-purple-600 text-purple-400 hover:bg-purple-900',
    }
};

const UserAnalyticsPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [userTotalReports, setUserTotalReports] = useState(0);
    const [userVerifiedReports, setUserVerifiedReports] = useState(0);
    const [userTrustedReports, setUserTrustedReports] = useState(0);
    const [userId, setUserId] = useState(null);
    const [userReports, setUserReports] = useState([]);
    const [allReports, setAllReports] = useState([]); // All reports for general map context
    const [zones, setZones] = useState([]); // State to store zone data
    const [impactScore, setImpactScore] = useState(0); // State for Impact Score

    const navigate = useNavigate();
    const auth = getAuth();

    // Load dark mode preference from local storage
    useEffect(() => {
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode) {
            setDarkMode(JSON.parse(savedMode));
        }
    }, []);

    // Function to calculate Impact Score
    const calculateImpactScore = useCallback((reports, zones) => {
        let score = 0;
        const REPORTS_WEIGHT = 1;
        const VERIFIED_WEIGHT = 5;
        const TRUSTED_WEIGHT = 3;
        const CRITICAL_ZONE_WEIGHT = 10; // Reports within critical zones get a higher score

        score += reports.length * REPORTS_WEIGHT;

        reports.forEach(report => {
            if (report.status === 'Verified') {
                score += VERIFIED_WEIGHT;
            }
            if (report.trustedByUsers && report.trustedByUsers > 0) { // Assuming trustedByUsers is a count
                score += TRUSTED_WEIGHT;
            }

            // Check if report is within any critical zone
            // For a real implementation, you'd need to convert report lat/lng to a point
            // and use a geospatial library (like turf.js or point-in-polygon on frontend)
            // to check if the point falls within any of the 'zones' polygons.
            // This is a placeholder for actual geospatial calculation.
            const isCriticalZoneReport = zones.some(zone => {
                // Placeholder: In a real app, integrate proper point-in-polygon check
                // For example, if report.latitude and report.longitude exist:
                // return pointInPolygon([report.longitude, report.latitude], zone.coordinates.coordinates[0]);
                return false; // For now, assume no critical zone reports
            });

            if (isCriticalZoneReport) {
                score += CRITICAL_ZONE_WEIGHT;
            }
        });
        return score;
    }, []);

    // Function to fetch all analytics data
    const fetchUserAnalyticsData = useCallback(async (currentUserId) => {
        setLoading(true);
        setError(null);
        try {
            if (!currentUserId) {
                setError('User not logged in. Please log in to view your analytics.');
                setLoading(false);
                return;
            }

            // Fetch user-specific reports
            const userReportsRes = await fetch(`http://localhost:5000/api/reports/user/${currentUserId}`);
            if (!userReportsRes.ok) {
                throw new Error(`Failed to fetch user reports: ${userReportsRes.statusText}`);
            }
            const userReportsData = await userReportsRes.json();
            setUserReports(userReportsData);
            setUserTotalReports(userReportsData.length);

            // Calculate verified and trusted reports for the user
            const verifiedCount = userReportsData.filter(report => report.status === 'Verified').length;
            const trustedCount = userReportsData.filter(report => report.trustedByUsers > 0).length; // Assuming trustedByUsers is a count
            setUserVerifiedReports(verifiedCount);
            setUserTrustedReports(trustedCount);

            // Fetch all reports for map context (can filter spam later if needed, depending on user type)
            const allReportsRes = await fetch('http://localhost:5000/api/reports');
            if (!allReportsRes.ok) {
                throw new Error(`Failed to fetch all reports: ${allReportsRes.statusText}`);
            }
            const allReportsData = await allReportsRes.json();
            setAllReports(allReportsData);

            // Fetch zones
            const zonesRes = await fetch('http://localhost:5000/api/zones');
            if (!zonesRes.ok) {
                throw new Error(`Failed to fetch zones: ${zonesRes.statusText}`);
            }
            const zonesData = await zonesRes.json();
            setZones(zonesData);

            // Calculate Impact Score after reports and zones are fetched
            setImpactScore(calculateImpactScore(userReportsData, zonesData));

        } catch (err) {
            console.error("Error fetching user analytics data:", err);
            setError(`Error fetching data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [calculateImpactScore]);

    // Authenticate user and fetch data
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                fetchUserAnalyticsData(user.uid);
            } else {
                setUserId(null);
                setLoading(false);
                setError('Please log in to view your analytics.');
            }
        });
        return () => unsubscribe(); // Cleanup subscription
    }, [auth, fetchUserAnalyticsData]);

    const toggleDarkMode = () => {
        setDarkMode(prevMode => {
            const newMode = !prevMode;
            localStorage.setItem('darkMode', JSON.stringify(newMode));
            return newMode;
        });
    };

    const currentTheme = darkMode ? colors.dark : colors.light;

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${currentTheme.primaryBg}`}>
                <Loader2 className={`h-12 w-12 animate-spin ${currentTheme.icon}`} />
                <p className={`ml-4 text-lg ${currentTheme.text}`}>Loading your analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${currentTheme.primaryBg}`}>
                <div className={`p-8 rounded-lg ${currentTheme.secondaryBg} ${currentTheme.shadow} ${currentTheme.border} border text-center`}>
                    <p className={`text-xl font-semibold mb-4 ${currentTheme.text}`}>{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className={`py-2 px-6 rounded-md transition duration-300 ${currentTheme.button}`}
                    >
                        <Home className="inline-block mr-2" /> Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${currentTheme.primaryBg} ${currentTheme.text} p-4 sm:p-6 lg:p-8 transition-colors duration-300`}>
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-extrabold flex items-center" style={{ color: currentTheme.icon }}>
                    <CircleGauge size={36} className="mr-3" /> User Analytics
                </h1>
                <button
                    onClick={toggleDarkMode}
                    className={`p-3 rounded-full ${currentTheme.buttonOutline} ${currentTheme.text}`}
                    aria-label="Toggle dark mode"
                >
                    {darkMode ? <Sun size={24} /> : <Moon size={24} />}
                </button>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Impact Score Section */}
                <section className={`p-8 rounded-2xl shadow-xl transition-colors duration-300 animate-fade-in-down ${currentTheme.secondaryBg}`} style={{ border: `1px solid ${currentTheme.border}`, boxShadow: currentTheme.shadow }}>
                    <h2 className="text-3xl font-bold mb-6 flex items-center" style={{ color: currentTheme.icon, textShadow: darkMode ? `0 0 12px ${currentTheme.icon}` : 'none' }}>
                        <Award size={32} className="mr-3" style={{ filter: darkMode ? `drop-shadow(0 0 10px ${currentTheme.icon})` : 'none' }} /> Your Impact Score
                    </h2>
                    <div className="text-center">
                        <p className={`text-6xl font-extrabold mb-4 ${currentTheme.icon}`}>{impactScore}</p>
                        <p className="text-lg opacity-90">A calculated score based on your verified reports, trusted reports, and reports in critical zones.</p>
                        <p className="text-sm opacity-70 mt-2">
                            This score reflects the positive impact of your contributions to the community.
                        </p>
                    </div>
                </section>

                {/* Reports Summary */}
                <section className={`p-8 rounded-2xl shadow-xl transition-colors duration-300 animate-fade-in-down ${currentTheme.secondaryBg}`} style={{ border: `1px solid ${currentTheme.border}`, boxShadow: currentTheme.shadow }}>
                    <h2 className="text-3xl font-bold mb-6 flex items-center" style={{ color: currentTheme.icon, textShadow: darkMode ? `0 0 12px ${currentTheme.icon}` : 'none' }}>
                        <BadgeCheck size={32} className="mr-3" style={{ filter: darkMode ? `drop-shadow(0 0 10px ${currentTheme.icon})` : 'none' }} /> Your Contributions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                        <div className={`p-6 rounded-lg ${currentTheme.secondaryBg} ${currentTheme.shadow} ${currentTheme.border} border`}>
                            <h3 className="text-xl font-semibold mb-3">Total Reports</h3>
                            <p className="text-4xl font-bold" style={{ color: currentTheme.icon }}>{userTotalReports}</p>
                        </div>
                        <div className={`p-6 rounded-lg ${currentTheme.secondaryBg} ${currentTheme.shadow} ${currentTheme.border} border`}>
                            <h3 className="text-xl font-semibold mb-3">Verified Reports</h3>
                            <p className="text-4xl font-bold" style={{ color: currentTheme.icon }}>{userVerifiedReports}</p>
                        </div>
                        <div className={`p-6 rounded-lg ${currentTheme.secondaryBg} ${currentTheme.shadow} ${currentTheme.border} border`}>
                            <h3 className="text-xl font-semibold mb-3">Trusted Reports</h3>
                            <p className="text-4xl font-bold" style={{ color: currentTheme.icon }}>{userTrustedReports}</p>
                        </div>
                    </div>
                </section>

                {/* User Reports Map */}
                <section className={`md:col-span-2 p-8 rounded-2xl shadow-xl transition-colors duration-300 animate-fade-in-down ${currentTheme.secondaryBg}`} style={{ border: `1px solid ${currentTheme.border}`, boxShadow: currentTheme.shadow }}>
                    <h2 className="text-3xl font-bold mb-6 flex items-center" style={{ color: currentTheme.icon, textShadow: darkMode ? `0 0 12px ${currentTheme.icon}` : 'none' }}>
                        <MapPin size={32} className="mr-3" style={{ filter: darkMode ? `drop-shadow(0 0 10px ${currentTheme.icon})` : 'none' }} /> Your Reported Locations
                    </h2>
                    <div className="h-[500px] w-full rounded-lg overflow-hidden border" style={{ borderColor: currentTheme.border }}>
                        <UserReportsMap
                            userReports={userReports}
                            allReports={allReports} // Pass all reports for broader context
                            zones={zones} // Pass zones to the map
                            userId={userId}
                            currentColors={{
                                primaryBrand: colors.light.icon, // Using icon color as primary brand for map markers
                                verifiedBadgeText: colors.light.icon,
                                shadowBase: colors.light.shadow
                            }}
                        />
                    </div>
                    {userReports.length === 0 && (
                        <p className={`mt-4 text-center ${currentTheme.textSecondary}`}>No places reported yet.</p>
                    )}
                </section>
            </main>
        </div>
    );
};

export default UserAnalyticsPage;
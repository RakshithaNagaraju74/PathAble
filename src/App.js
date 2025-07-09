import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import HomePage from './pages/Homepage';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import AddReportPage from './pages/AddReportPage';
import MyContributionsPage from './pages/MyContributionsPage';
import AllReportsPage from './pages/AllReportsPage';
import BadgesPage from './pages/Badges';
import SettingsPage from './pages/Settings';
import NgoLogin from './pages/NgoLoginPage';
import SpamAccountPage from './pages/SpamAccountPage'; // Import the SpamAccountPage
import NgoDashboardPage from './pages/NgoDashboardPage';
import NgoProfilePage from './pages/NgoProfilePage';
import UserAnalyticsPage from './pages/UserAnalyticsPage';
import HowItHelpsPage from './pages/HowItHelpsPage';
import KeyFeaturesPage from './pages/KeyFeaturesPage';
import CommunityVoicePage from './pages/CommunityVoicePage';
import OurImpactPage from './pages/OurImpactPage';
import NGORegistrationPage from './pages/NGORegistrationPage';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/add-report" element={<AddReportPage />} />
        <Route path="/my-contributions" element={<MyContributionsPage />} />
        <Route path="/all-reports" element={<AllReportsPage />} />
        <Route path="/badges" element={<BadgesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/ngo-login" element={<NgoLogin />} />
        <Route path="/spam-account" element={<SpamAccountPage />} /> {/* Route for the SpamAccountPage */}
        <Route path="/ngo-dashboard" element={<NgoDashboardPage />} /> {/* Route for NGO Dashboard */}
        <Route path="/ngo-profile" element={<NgoProfilePage />} />
        <Route path="/user-analytics" element={<UserAnalyticsPage />} />
        <Route path="/how-it-helps" element={<HowItHelpsPage />} />
        <Route path="/key-features" element={<KeyFeaturesPage />} />
        <Route path="/community-voice" element={<CommunityVoicePage />} />
        <Route path="/our-impact" element={<OurImpactPage />} />
        <Route path="/our-impact" element={<OurImpactPage />} />
        <Route path="/ngo-registration" element={<NGORegistrationPage />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
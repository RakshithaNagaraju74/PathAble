import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css'; // Make sure this path is correct

import {
  MapPin,
  Camera,
  Route,
  Accessibility,
  Toilet,
  ShieldCheck,
  ArrowRight,
  User,
  Facebook,
  Twitter,
  Instagram,
  Sun, // Imported for theme toggle
  Moon, // Imported for theme toggle
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false); // State for theme

  // Effect to load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.removeAttribute('data-theme');
      setIsDarkMode(false);
    }
  }, []);

  // Function to toggle theme
  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="homepage-container">
      <header className="main-header">
        <nav className="navbar container">
          <a href="/" className="logo">AccessMap</a>
          <ul className="nav-links">
            <li><a href="#how-it-helps" onClick={() => handleNavigate('/how-it-helps')}>How It Helps</a></li>
            <li><a href="#features" onClick={() => handleNavigate('/key-features')}>Key Features</a></li>
            <li><a href="#contribute" onClick={() => handleNavigate('/community-voice')}>Community</a></li>
            <li><a href="#impact" onClick={() => handleNavigate('/our-impact')}>Our Impact</a></li>
          </ul>
          <button onClick={() => handleNavigate('/login')} className="btn btn-header">
            Get In Touch
          </button>
          {/* Theme Toggle Button */}
          <div className="theme-toggle-wrapper">
            <input
              type="checkbox"
              id="theme-switcher"
              onChange={toggleTheme}
              checked={isDarkMode}
              aria-label="Toggle dark/light mode"
            />
            <label htmlFor="theme-switcher" className="theme-toggle-label">
              {isDarkMode ? <Moon size={20} color="#f8f8f8" /> : <Sun size={20} color="#333" />}
            </label>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <div className="hero-card">
              <div className="hero-text-content">
                <h1>Your World, Accessible. Navigate with Freedom.</h1>
                <p>
                  AccessMap empowers disabled individuals to navigate their environment with unprecedented independence and confidence. Discover precise, verified accessibility details for every location.
                </p>
                <div className="hero-actions">
                    <button className="btn btn-primary" onClick={() => handleNavigate('/login')}>Find Accessible Paths</button>
                    <button className="btn btn-secondary" onClick={() => handleNavigate('/ngo-login')}>Contributor Community</button>
                </div>
              </div>
              <div className="hero-image-wrapper">
                <img src="/assets/pic_2.jpg" alt="Person navigating a city with a wheelchair, symbolizing accessibility" />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-helps" className="how-it-works-section section-padding">
            <div className="container text-center">
                <h2>Achieve Independent Navigation</h2>
                <p className="section-subtitle">
                    We adapt a uniquely personalized perspective to each journey. Our verified data, architectural understanding, and dedicated community ensure you travel with confidence.
                </p>
                <div className="steps-container">
                    <div className="step-item">
                        <MapPin size={40} />
                        <h3>Discover Barrier-Free Venues</h3>
                        <p>Locate businesses and public spaces with comprehensive accessibility information tailored to your needs.</p>
                    </div>
                    <div className="step-item">
                        <Camera size={40} />
                        <h3>Share Your Accessibility Insights</h3>
                        <p>Contribute photos and detailed information to help others in the community find accessible places.</p>
                    </div>
                    <div className="step-item">
                        <Route size={40} />
                        <h3>Plan Your Accessible Journey</h3>
                        <p>Generate personalized routes and get real-time updates for confident, stress-free travel.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Mid-Content with Images */}
        <section className="mid-content-section section-padding">
          {/* Removed container here to allow images to span full width */}
          <div className="mid-content-grid">
            <div className="mid-content-image mid-content-image-left">
              <img src="/assets/pic_1.jpg" alt="Accessible home interior design" />
            </div>
            <div className="mid-content-text text-center container"> {/* Added container back for text */}
              <h2>Join Our Community: <em>Become a Hero for Accessibility!</em></h2>
              <p>
                Empower lives and build a more inclusive world. Whether you're an NGO, a passionate youth, or a dedicated volunteer, your contributions make a monumental difference.
              </p>
              <button className="btn btn-primary" onClick={() => handleNavigate('/ngo-registration')}>Register Here & Become a Hero</button>
            </div>
            <div className="mid-content-image mid-content-image-right">
              <img src="/assets/pic_4.jpg" alt="Modern accessible building exterior" />
            </div>
          </div>
        </section>

        {/* Features Section - "Our Timeless Inclusions" */}
        <section id="features" className="features-section section-padding">
            <div className="container">
                <div className="features-card">
                    <div className="features-text-content">
                        <h2>Our Timeless Inclusions</h2>
                        <p>We've been creating a world our users are thrilled to call their own. Delighting them with hand-picked details, accurate data, and a system built for them.</p>
                        <button className="btn btn-primary" onClick={() => handleNavigate('/key-features')}>View Features</button>
                    </div>
                    <div className="features-grid">
                        <div className="feature-item">
                            <Accessibility />
                            <h3>Precise Entrance Details</h3>
                            <p>Ramp slopes, door widths, and automatic entry features.</p>
                        </div>
                        <div className="feature-item">
                            <Toilet />
                            <h3>Accessible Restrooms</h3>
                            <p>Info on turning radius, grab bars, and inclusive amenities.</p>
                        </div>
                        <div className="feature-item">
                            <ShieldCheck />
                            <h3>Community Verification</h3>
                            <p>Data is verified by our community for accuracy and trust.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Impact Section */}
        <section id="impact" className="impact-section section-padding">
            <div className="container text-center">
                 <h2>Driving Real Accessibility for Disabled Lives</h2>
                <div className="impact-metrics">
                    <div className="metric-item">
                        <span className="metric-number">100K+</span>
                        <p>Verified Locations</p>
                    </div>
                    <div className="metric-item">
                        <span className="metric-number">50K+</span>
                        <p>Disabled Lives Empowered</p>
                    </div>
                    <div className="metric-item">
                        <span className="metric-number">20K+</span>
                        <p>Dedicated Contributors</p>
                    </div>
                </div>
                <blockquote className="testimonial">
                    "AccessMap completely changed how I explore my city. For the first time, I feel true freedom and confidence when I go out. It’s an essential tool for accessibility."
                    <span>- Rohan P.</span>
                </blockquote>
            </div>
        </section>

      </main>

      <footer className="main-footer" role="contentinfo">
        <div className="container">
          <div className="footer-content">
              <div className="footer-about">
                  <h3 className="logo">AccessMap</h3>
                  <p>&copy; {new Date().getFullYear()} AccessMap. All rights reserved.</p>
              </div>
              <div className="footer-links">
                <a href="#">About</a>
                <a href="#">Contact</a>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
              </div>
              <div className="social-media">
                <a href="#" aria-label="Facebook"><Facebook /></a>
                <a href="#" aria-label="Twitter"><Twitter /></a>
                <a href="#" aria-label="Instagram"><Instagram /></a>
              </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

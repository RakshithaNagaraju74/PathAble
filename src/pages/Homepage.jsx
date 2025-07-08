import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/Homepage.css';

import {
  MapPin,
  Camera,
  Route,
  Accessibility,
  Toilet,
  Brain, // Brain icon is still imported but not used for "AI" feature
  ArrowRight,
  User,
  ShieldCheck,
  Facebook,
  Twitter,
  Instagram,
  Sun,
  Moon,
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const themeSwitcher = document.getElementById('theme-switcher');
    if (!themeSwitcher) return;

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeSwitcher.checked = true;
    } else {
      // Default to light mode if no saved theme or if saved as 'light'
      document.documentElement.removeAttribute('data-theme');
      themeSwitcher.checked = false;
    }

    const handleThemeChange = () => {
      if (themeSwitcher.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
      }
    };

    themeSwitcher.addEventListener('change', handleThemeChange);
    return () => {
      themeSwitcher.removeEventListener('change', handleThemeChange);
    };
  }, []);

  const handleStartClick = () => {
    navigate('/ngo-login');
  };

  return (
    <div className="homepage-container">
      <header className="main-header">
        <nav className="navbar" role="navigation" aria-label="Main navigation for AccessMap for Disabled Individuals">
          <a href="/" className="logo" aria-label="AccessMap Homepage">AccessMap</a>
          <ul className="nav-links">
            {/* Updated links to new pages */}
            <li><a href="/how-it-helps">How It Helps</a></li>
            <li><a href="/key-features">Key Features</a></li>
            <li><a href="/community-voice">Community Voice</a></li>
            <li><a href="/our-impact">Our Impact</a></li>
            <li>
              <a href="/login" className="btn btn-login" aria-label="Login to your AccessMap account">
                <User /> Login
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <div className="theme-float-toggle">
        <input type="checkbox" id="theme-switcher" aria-label="Toggle Dark Mode" />
        <label htmlFor="theme-switcher"></label>
      </div>

      <section className="hero-section" aria-labelledby="hero-title">
        {/* Floating decorative bubbles with gradients and increased blur */}
        <div className="floating-bubble" style={{ top: '10%', left: '5%', width: '120px', height: '120px', animationDelay: '0s' }}></div>
        <div className="floating-bubble" style={{ bottom: '20%', right: '10%', width: '180px', height: '180px', animationDelay: '2s' }}></div>
        <div className="floating-bubble" style={{ top: '50%', left: '30%', width: '90px', height: '90px', animationDelay: '4s' }}></div>

        <div className="dot-decoration dot-1"></div>
        <div className="dot-decoration dot-2"></div>
        <div className="dot-decoration dot-3"></div>
        <div className="hero-content-wrapper">
          <div className="hero-text-content">
            <h1 id="hero-title">Your World, Accessible. Navigate with Freedom.</h1>
            <p>
              AccessMap empowers <strong>disabled individuals</strong> to navigate their environment with <strong>unprecedented independence and confidence</strong>.
              Discover precise, verified accessibility details for every location, ensuring barrier-free journeys, all fueled by a dedicated community.
            </p>
            <div className="hero-actions">
              <div className="button-stack">
                {/* Updated link for "Find Accessible Paths" */}
                <button className="btn btn-primary" onClick={() => navigate('/login')}>Find Accessible Paths</button>
                {/* Updated link for "Join Contributor Community" */}
                <button className="btn btn-secondary" onClick={() => navigate('/ngo-registration')}>Join Contributor Community</button>
              </div>
            </div>
          </div>
          <div className="hero-image-gallery">
            <img src="assets/pic_2.jpg" alt="Accessible entrance with service dog" />
            <img src="assets/pic_1.jpg" alt="Blind person navigating with app" />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works section-padding text-center" aria-labelledby="how-it-helps-title">
        <div className="container">
          <h2 id="how-it-helps-title">Achieve Independent Navigation.</h2>
          <div className="steps-container">
            <div className="step-item">
              <MapPin />
              <h3>Discover Barrier-Free Venues</h3>
              <p>Locate businesses, venues, and public spaces with comprehensive, verified accessibility information tailored to your needs.</p>
            </div>
            <div className="step-item">
              <Camera />
              <h3>Share Your Accessibility Insights</h3>
              <p>Contribute photos and detailed information to help others find accessible places.</p>
            </div>
            <div className="step-item">
              <Route />
              <h3>Plan Your Accessible Journey</h3>
              <p>Generate personalized routes and real-time updates for confident travel.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features-showcase section-padding text-center" aria-labelledby="key-features-title">
        <div className="container">
          <h2 id="key-features-title">Uncompromising Accessibility Details, Demystified.</h2>
          <div className="features-grid">
            <div className="feature-card">
              <Accessibility />
              <h3>Precise Entrance Details</h3>
              <p>Ramp slopes, door widths, and automatic entry features at your fingertips.</p>
            </div>
            <div className="feature-card">
              <Toilet />
              <h3>Accessible Restrooms</h3>
              <p>Get verified info on turning radius, grab bars, and inclusive amenities.</p>
            </div>
            {/* Removed AI-related feature card */}
            <div className="feature-card">
              <ShieldCheck /> {/* Replaced Brain icon with ShieldCheck for Community Verification */}
              <h3>Community Verification System</h3>
              <p>Our community-driven verification ensures the accuracy and reliability of accessibility data, building trust and confidence.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contribute" className="community-hub section-padding text-center" aria-labelledby="community-voice-title">
        <div className="container">
          <h2 id="community-voice-title">Empowering Our Disability Community, Together.</h2>
          <div className="community-content">
            <div className="community-text">
              <p><strong>Support Accessibility:</strong> Collaborate with local communities to make change.</p>
              <p><strong>Empower Action:</strong> Help gather vital accessibility data.</p>
              <p><strong>NGO Dashboard:</strong> Monitor your impact and manage volunteers.</p>
            </div>
            <div className="community-visuals">
              <img src="assets/pic_4.jpg" alt="Community collaborating on accessibility map" />
            </div>
          </div>
          <button onClick={handleStartClick} className="btn btn-primary mt-6 lg:mt-0">
            Start Your Contribution <ArrowRight className="inline ml-2" />
          </button>
        </div>
      </section>

      <section id="impact" className="impact-vision section-padding text-center" aria-labelledby="our-impact-title">
        <div className="container">
          <h2 id="our-impact-title">Driving Real Accessibility for Disabled Lives.</h2>
          <div className="impact-metrics">
            <div className="metric-item">
              <span className="metric-number">100K+</span>
              <p>Verified Accessible Locations</p>
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
            "AccessMap changed how I explore my city. It’s an essential accessibility tool." - Rohan P.
          </blockquote>
          <p className="future-vision">
            We’re building real-time updates, predictive routing, and personalized profiles to drive full inclusion.
          </p>
        </div>
      </section>

      <footer className="main-footer" role="contentinfo">
        <div className="container">
          <div className="footer-links">
            <a href="#">About AccessMap</a>
            <a href="#">Contact Us</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
          <div className="social-media">
            <a href="#"><Facebook /></a>
            <a href="#"><Twitter /></a>
            <a href="#"><Instagram /></a>
          </div>
          <div className="app-download">
            <p>Get the AccessMap Mobile App:</p>
            <a href="#" className="btn btn-download">App Store</a>
            <a href="#" className="btn btn-download">Google Play</a>
            <a href="#" className="btn btn-download">Add to Home Screen (PWA)</a>
          </div>
          <p className="copyright">
            &copy; {new Date().getFullYear()} AccessMap. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

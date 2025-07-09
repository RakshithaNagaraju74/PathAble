// HowItHelpsPage.jsx
import React, { useEffect, useState } from 'react';
import { MapPin, Camera, Route, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HowItHelpsPage = () => {
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

  return (
    <div className="how-it-helps-page">
      {/* Embedded CSS */}
      <style>
        {`
        /* HowItHelpsPage.css - Enhanced Modern UI */

        /* Global styles for theme transition and font */
        body {
            transition: background-color 0.5s ease, color 0.5s ease;
            font-family: 'Inter', sans-serif;
            margin: 0; /* Ensure no default body margin */
            padding: 0; /* Ensure no default body padding */
        }

        /* Base container for the page */
        .how-it-helps-page {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start; /* Align content to top */
            padding: 3rem 1rem;
            background: linear-gradient(to bottom right, var(--page-bg-start), var(--page-bg-end));
            color: var(--text-color-primary);
            transition: background 0.5s ease, color 0.5s ease;
            overflow-x: hidden; /* Prevent any scrollbars */
        }

        /* Light Mode Variables */
        .how-it-helps-page {
            --page-bg-start: #E0F7FA; /* Light Cyan */
            --page-bg-end: #E8F5E9;   /* Light Green */
            --card-bg: #FFFFFF;
            --text-color-primary: #212121;
            --text-color-secondary: #424242;
            --border-color: #B2EBF2; /* Light Blue-Cyan */
            --accent-color-main: #673AB7; /* Deep Purple */
            --accent-color-1: #673AB7; /* Deep Purple */
            --accent-color-2: #2196F3; /* Blue */
            --accent-color-3: #4CAF50; /* Green */
            --button-bg: #673AB7; /* Purple */
            --button-hover-bg: #5E35B1; /* Darker Purple */
            --card-shadow: 0 12px 25px rgba(0, 0, 0, 0.1); /* Slightly more pronounced */
            --card-hover-shadow: 0 20px 40px rgba(0, 0, 0, 0.2); /* More pronounced on hover */
        }

        /* Dark Mode Variables */
        [data-theme='dark'] .how-it-helps-page {
            --page-bg-start: #212121; /* Dark Grey */
            --page-bg-end: #1A1A1A;   /* Very Dark Grey */
            --card-bg: #2C2C2C;
            --text-color-primary: #E0E0E0;
            --text-color-secondary: #BDBDBD;
            --border-color: #424242;
            --accent-color-main: #B39DDB; /* Light Purple */
            --accent-color-1: #B39DDB; /* Light Purple */
            --accent-color-2: #90CAF9; /* Light Blue */
            --accent-color-3: #A5D6A7; /* Light Green */
            --button-bg: #7E57C2; /* Lighter Purple */
            --button-hover-bg: #9575CD; /* Even Lighter Purple */
            --card-shadow: 0 12px 25px rgba(0, 0, 0, 0.3);
            --card-hover-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }

        .how-it-helps-content-wrapper {
            width: 90%; /* Occupy more width */
            max-width: 1200px; /* Max width for content */
            margin: 0 auto;
            background-color: var(--card-bg);
            border-radius: 1.5rem;
            box-shadow: var(--card-shadow);
            padding: 2.5rem;
            border: 1px solid var(--border-color);
            position: relative;
            transition: background-color 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease;
            z-index: 10;
        }

        .back-button {
            position: absolute;
            top: 1.5rem;
            left: 1.5rem;
            padding: 0.6rem;
            border-radius: 9999px;
            background-color: var(--border-color);
            color: var(--accent-color-main);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            z-index: 20;
        }

        .back-button:hover {
            background-color: var(--accent-color-main);
            color: var(--card-bg);
            transform: scale(1.05);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        /* Theme Toggle Button */
        .theme-toggle-wrapper {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 30px;
            background-color: var(--border-color);
            border-radius: 25px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            cursor: pointer;
            transition: background-color 0.5s ease;
            z-index: 20;
        }
        [data-theme='dark'] .theme-toggle-wrapper {
            background-color: var(--border-color);
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }

        .theme-toggle-wrapper input[type="checkbox"] {
            height: 0;
            width: 0;
            visibility: hidden;
        }

        .theme-toggle-label {
            cursor: pointer;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 5px;
            position: relative;
        }

        .theme-toggle-label::after {
            content: '';
            position: absolute;
            top: 3px;
            left: 3px;
            width: 24px;
            height: 24px;
            background-color: var(--text-color-primary);
            border-radius: 50%;
            transition: transform 0.3s ease, background-color 0.5s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        [data-theme='dark'] .theme-toggle-label::after {
            transform: translateX(30px);
            background-color: var(--text-color-primary);
        }

        .theme-toggle-label svg {
            z-index: 1;
            color: var(--text-color-secondary);
        }
        [data-theme='dark'] .theme-toggle-label svg {
            color: var(--text-color-secondary);
        }


        h1 {
            font-size: clamp(2.8rem, 4.5vw, 4rem); /* Slightly larger */
            font-weight: 800;
            text-align: center;
            margin-bottom: 1.5rem;
            color: var(--accent-color-main);
            line-height: 1.2;
            transition: color 0.5s ease;
        }

        .page-description {
            font-size: 1.2rem; /* Slightly larger */
            text-align: center;
            margin-bottom: 3rem;
            max-width: 70ch; /* Wider for better readability */
            margin-left: auto;
            margin-right: auto;
            color: var(--text-color-secondary);
            transition: color 0.5s ease;
        }

        /* Features Grid */
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2.5rem; /* Increased gap */
            margin-top: 2rem;
            padding: 0 1rem; /* Add some padding for smaller screens */
        }

        .feature-card {
            background-color: var(--card-bg);
            border-radius: 1rem;
            box-shadow: var(--card-shadow);
            padding: 2rem;
            text-align: center;
            border: 1px solid var(--border-color);
            transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.5s ease, border-color 0.5s ease;
        }

        .feature-card:hover {
            transform: translateY(-10px); /* More pronounced lift */
            box-shadow: var(--card-hover-shadow);
        }

        .feature-card .icon-wrapper {
            padding: 1.2rem; /* Larger padding */
            background-color: var(--border-color);
            border-radius: 9999px;
            margin: 0 auto 1.5rem auto; /* Center icon and add bottom margin */
            display: flex;
            align-items: center;
            justify-content: center;
            width: 80px; /* Larger icon circle */
            height: 80px;
            box-shadow: inset 0 3px 6px rgba(0,0,0,0.15); /* More pronounced inner shadow */
            transition: background-color 0.5s ease;
        }

        .feature-card .icon-wrapper svg {
            font-size: 3.5rem; /* Larger icon size */
            color: var(--accent-color-main); /* Default icon color */
            transition: color 0.5s ease;
        }

        /* Specific icon colors for each card */
        .feature-card:nth-child(1) .icon-wrapper svg { color: var(--accent-color-1); }
        .feature-card:nth-child(2) .icon-wrapper svg { color: var(--accent-color-2); }
        .feature-card:nth-child(3) .icon-wrapper svg { color: var(--accent-color-3); }


        .feature-card h3 {
            font-size: 1.85rem; /* Slightly larger */
            font-weight: bold;
            margin-bottom: 0.85rem;
            color: var(--text-color-primary);
            transition: color 0.5s ease;
        }

        .feature-card p {
            font-size: 1.05rem; /* Slightly larger */
            color: var(--text-color-secondary);
            margin-bottom: 0;
            transition: color 0.5s ease;
        }

        /* Call to action section */
        .cta-section {
            margin-top: 5rem; /* Increased margin */
            text-align: center;
            width: 100%;
        }

        .cta-section h2 {
            font-size: clamp(2.2rem, 3.5vw, 3rem); /* Larger */
            font-weight: bold;
            margin-bottom: 1.8rem; /* Increased margin */
            color: var(--accent-color-main);
            transition: color 0.5s ease;
        }

        .cta-button {
            padding: 1.2rem 3rem; /* Larger button */
            background-color: var(--button-bg);
            color: #FFFFFF;
            font-weight: 700; /* Bolder text */
            border-radius: 9999px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25); /* More pronounced shadow */
            transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
            border: none;
            cursor: pointer;
            font-size: 1.15rem; /* Larger font */
        }

        .cta-button:hover {
            background-color: var(--button-hover-bg);
            transform: translateY(-5px); /* More pronounced lift */
            box-shadow: 0 12px 25px rgba(0, 0, 0, 0.4); /* Darker shadow on hover */
        }

        /* Media Queries for responsiveness */
        @media (max-width: 768px) {
            .how-it-helps-content-wrapper {
                padding: 1.5rem;
            }
            h1 {
                font-size: 2rem;
            }
            .page-description {
                font-size: 1rem;
            }
            .features-grid {
                grid-template-columns: 1fr; /* Stack cards on small screens */
            }
            .feature-card {
                padding: 1.5rem;
            }
            .feature-card h3 {
                font-size: 1.5rem;
            }
            .feature-card .icon-wrapper {
                width: 60px;
                height: 60px;
            }
            .feature-card .icon-wrapper svg {
                font-size: 2.5rem;
            }
            .cta-section {
                margin-top: 3rem;
            }
            .cta-section h2 {
                font-size: 1.8rem;
            }
            .cta-button {
                padding: 0.8rem 2rem;
                font-size: 0.9rem;
            }
        }
        `}
      </style>

      <div className="how-it-helps-content-wrapper">
        <button
          onClick={() => navigate('/')}
          className="back-button"
          aria-label="Back to Homepage"
        >
          <ArrowLeft size={24} />
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

        <h1 className="text-center">
          How AccessMap Empowers You
        </h1>

        <p className="page-description">
          AccessMap is designed to break down barriers and foster independence for disabled individuals. Here's how we help you navigate your world with confidence.
        </p>

        <div className="features-grid">
          {/* Feature Card 1: Discover Barrier-Free Venues */}
          <div className="feature-card">
            <div className="icon-wrapper">
              <MapPin size={48} />
            </div>
            <h3>Discover Barrier-Free Venues</h3>
            <p>
              Easily locate businesses, public spaces, and attractions with comprehensive, verified accessibility information. Our detailed listings help you find places that truly meet your needs.
            </p>
          </div>

          {/* Feature Card 2: Share Your Accessibility Insights */}
          <div className="feature-card">
            <div className="icon-wrapper">
              <Camera size={48} />
            </div>
            <h3>Share Your Accessibility Insights</h3>
            <p>
              Become a vital part of our community by contributing your own accessibility reports. Share photos, details, and experiences to help fellow users make informed decisions.
            </p>
          </div>

          {/* Feature Card 3: Plan Your Accessible Journey */}
          <div className="feature-card">
            <div className="icon-wrapper">
              <Route size={48} />
            </div>
            <h3>Plan Your Accessible Journey</h3>
            <p>
              Utilize our intelligent routing features to plan your travels. Get real-time updates and predictive routes that prioritize accessibility, ensuring a smooth and confident journey.
            </p>
          </div>
        </div>

        <div className="cta-section">
          <h2>Ready to Explore?</h2>
          <button
            onClick={() => navigate('/login')}
            className="cta-button"
          >
            Start Navigating Now!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItHelpsPage;

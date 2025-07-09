// KeyFeaturesPage.jsx
import React, { useEffect, useState } from 'react';
import { Accessibility, Toilet, MapPin, Camera, Route, ArrowLeft, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const KeyFeaturesPage = () => {
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
    <div className="key-features-page">
      {/* Embedded CSS */}
      <style>
        {`
        /* KeyFeaturesPage.css - Modern UI */

        /* Global styles for theme transition and font */
        body {
            transition: background-color 0.5s ease, color 0.5s ease;
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
        }

        /* Base container for the page */
        .key-features-page {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding: 3rem 1rem;
            background: linear-gradient(to bottom right, var(--page-bg-start), var(--page-bg-end));
            color: var(--text-color-primary);
            transition: background 0.5s ease, color 0.5s ease;
            overflow-x: hidden;
        }

        /* Light Mode Variables */
        .key-features-page {
            --page-bg-start: #E3F2FD; /* Light Blue */
            --page-bg-end: #E8F5E9;   /* Light Green */
            --card-bg: #FFFFFF;
            --text-color-primary: #212121;
            --text-color-secondary: #424242;
            --border-color: #BBDEFB; /* Soft Blue */
            --accent-color-main: #1976D2; /* Dark Blue */
            --accent-color-1: #673AB7; /* Purple */
            --accent-color-2: #4CAF50; /* Green */
            --accent-color-3: #FFC107; /* Amber */
            --accent-color-4: #3F51B5; /* Indigo */
            --accent-color-5: #009688; /* Teal */
            --button-bg: #2196F3; /* Blue */
            --button-hover-bg: #1976D2; /* Darker Blue */
            --card-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
            --card-hover-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
        }

        /* Dark Mode Variables */
        [data-theme='dark'] .key-features-page {
            --page-bg-start: #1A1A1A;
            --page-bg-end: #212121;
            --card-bg: #2C2C2C;
            --text-color-primary: #E0E0E0;
            --text-color-secondary: #BDBDBD;
            --border-color: #424242;
            --accent-color-main: #90CAF9; /* Light Blue */
            --accent-color-1: #CE93D8; /* Light Purple */
            --accent-color-2: #A5D6A7; /* Light Green */
            --accent-color-3: #FFEB3B; /* Light Amber */
            --accent-color-4: #7986CB; /* Light Indigo */
            --accent-color-5: #4DB6AC; /* Light Teal */
            --button-bg: #64B5F6; /* Lighter Blue */
            --button-hover-bg: #90CAF9; /* Even Lighter Blue */
            --card-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
            --card-hover-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
        }

        .page-content-wrapper {
            width: 90%;
            max-width: 1200px;
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
            font-size: clamp(2.5rem, 4vw, 3.5rem);
            font-weight: 800;
            text-align: center;
            margin-bottom: 1.5rem;
            color: var(--accent-color-main);
            line-height: 1.2;
            transition: color 0.5s ease;
        }

        .page-description {
            font-size: 1.15rem;
            text-align: center;
            margin-bottom: 3rem;
            max-width: 60ch;
            margin-left: auto;
            margin-right: auto;
            color: var(--text-color-secondary);
            transition: color 0.5s ease;
        }

        /* Features Grid */
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
            padding: 0 1rem;
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
            transform: translateY(-8px);
            box-shadow: var(--card-hover-shadow);
        }

        .feature-card .icon-wrapper {
            padding: 1rem;
            background-color: var(--border-color);
            border-radius: 9999px;
            margin: 0 auto 1.5rem auto;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 70px;
            height: 70px;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
            transition: background-color 0.5s ease;
        }

        .feature-card .icon-wrapper svg {
            font-size: 3rem;
            color: var(--accent-color-main);
            transition: color 0.5s ease;
        }

        /* Specific icon colors for each card */
        .feature-card:nth-child(1) .icon-wrapper svg { color: var(--accent-color-1); }
        .feature-card:nth-child(2) .icon-wrapper svg { color: var(--accent-color-2); }
        .feature-card:nth-child(3) .icon-wrapper svg { color: var(--accent-color-3); }
        .feature-card:nth-child(4) .icon-wrapper svg { color: var(--accent-color-4); }
        .feature-card:nth-child(5) .icon-wrapper svg { color: var(--accent-color-5); }


        .feature-card h3 {
            font-size: 1.75rem;
            font-weight: bold;
            margin-bottom: 0.75rem;
            color: var(--text-color-primary);
            transition: color 0.5s ease;
        }

        .feature-card p {
            font-size: 1rem;
            color: var(--text-color-secondary);
            margin-bottom: 0;
            transition: color 0.5s ease;
        }

        /* Call to action section */
        .cta-section {
            margin-top: 4rem;
            text-align: center;
            width: 100%;
        }

        .cta-section h2 {
            font-size: clamp(2rem, 3vw, 2.5rem);
            font-weight: bold;
            margin-bottom: 1.5rem;
            color: var(--accent-color-main);
            transition: color 0.5s ease;
        }

        .cta-button {
            padding: 1rem 2.5rem;
            background-color: var(--button-bg);
            color: #FFFFFF;
            font-weight: 600;
            border-radius: 9999px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
            border: none;
            cursor: pointer;
        }

        .cta-button:hover {
            background-color: var(--button-hover-bg);
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }

        /* Media Queries for responsiveness */
        @media (max-width: 768px) {
            .page-content-wrapper {
                padding: 1.5rem;
            }
            h1 {
                font-size: 2rem;
            }
            .page-description {
                font-size: 1rem;
            }
            .features-grid {
                grid-template-columns: 1fr;
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

      <div className="page-content-wrapper">
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
          Uncompromising Accessibility Details, Demystified.
        </h1>

        <p className="page-description">
          AccessMap provides a rich set of features designed to give you precise, actionable information for every journey.
        </p>

        <div className="features-grid">
          {/* Feature Card 1: Detailed Location Profiles */}
          <div className="feature-card">
            <div className="icon-wrapper">
              <MapPin size={48} />
            </div>
            <h3>Detailed Location Profiles</h3>
            <p>
              Access comprehensive accessibility data for thousands of locations, including entrance types, interior layouts, and specific amenity details.
            </p>
          </div>

          {/* Feature Card 2: Precise Entrance Details */}
          <div className="feature-card">
            <div className="icon-wrapper">
              <Accessibility size={48} />
            </div>
            <h3>Precise Entrance Details</h3>
            <p>
              Get exact measurements for ramp slopes, door widths, and information on automatic entry systems, ensuring smooth entry and exit.
            </p>
          </div>

          {/* Feature Card 3: Accessible Restroom Verification */}
          <div className="feature-card">
            <div className="icon-wrapper">
              <Toilet size={48} />
            </div>
            <h3>Accessible Restroom Verification</h3>
            <p>
              Find verified information on restroom accessibility, including turning radius, grab bars, and other inclusive amenities.
            </p>
          </div>

          {/* Feature Card 4: Personalized Accessible Routing */}
          <div className="feature-card">
            <div className="icon-wrapper">
              <Route size={48} />
            </div>
            <h3>Personalized Accessible Routing</h3>
            <p>
              Generate routes that consider your specific mobility needs, avoiding obstacles and prioritizing accessible pathways.
            </p>
          </div>

          {/* Feature Card 5: Community Verification System */}
          <div className="feature-card">
            <div className="icon-wrapper">
              <ShieldCheck size={48} />
            </div>
            <h3>Community Verification System</h3>
            <p>
              Our community-driven verification ensures the accuracy and reliability of accessibility data, building trust and confidence.
            </p>
          </div>
        </div>

        <div className="cta-section">
          <h2>Explore All Features</h2>
          <button
            onClick={() => navigate('/login')}
            className="cta-button"
          >
            View Live Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyFeaturesPage;

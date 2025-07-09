// OurImpactPage.jsx
import React, { useEffect, useState } from 'react';
import { Globe, Users, TrendingUp, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OurImpactPage = () => {
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
    <div className="our-impact-page">
      {/* Embedded CSS */}
      <style>
        {`
        /* OurImpactPage.css - Modern UI */

        /* Global styles for theme transition and font */
        body {
            transition: background-color 0.5s ease, color 0.5s ease;
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
        }

        /* Base container for the page */
        .our-impact-page {
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
        .our-impact-page {
            --page-bg-start: #FFFDE7; /* Light Yellow */
            --page-bg-end: #FFF3E0;   /* Light Orange */
            --card-bg: #FFFFFF;
            --text-color-primary: #212121;
            --text-color-secondary: #424242;
            --border-color: #FFECB3; /* Soft Yellow */
            --accent-color-main: #F57C00; /* Dark Orange */
            --accent-color-1: #673AB7; /* Purple */
            --accent-color-2: #2196F3; /* Blue */
            --accent-color-3: #4CAF50; /* Green */
            --button-bg: #FF9800; /* Orange */
            --button-hover-bg: #FB8C00; /* Darker Orange */
            --card-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
            --card-hover-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
            --testimonial-bg: #FFF8E1; /* Lighter yellow for testimonial */
            --testimonial-border: #FFD54F; /* Yellow border for testimonial */
        }

        /* Dark Mode Variables */
        [data-theme='dark'] .our-impact-page {
            --page-bg-start: #1A1A1A;
            --page-bg-end: #212121;
            --card-bg: #2C2C2C;
            --text-color-primary: #E0E0E0;
            --text-color-secondary: #BDBDBD;
            --border-color: #424242;
            --accent-color-main: #FFB74D; /* Light Orange */
            --accent-color-1: #CE93D8; /* Light Purple */
            --accent-color-2: #90CAF9; /* Light Blue */
            --accent-color-3: #A5D6A7; /* Light Green */
            --button-bg: #FFB74D; /* Lighter Orange */
            --button-hover-bg: #FFCC80; /* Even Lighter Orange */
            --card-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
            --card-hover-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
            --testimonial-bg: #3A3A3A; /* Darker grey for testimonial */
            --testimonial-border: #FF8A65; /* Orange border for testimonial */
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

        /* Impact Metrics Grid */
        .impact-metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
            padding: 0 1rem;
            margin-bottom: 3rem; /* Space before testimonial */
        }

        .impact-metric-card {
            background-color: var(--card-bg);
            border-radius: 1rem;
            box-shadow: var(--card-shadow);
            padding: 2rem;
            text-align: center;
            border: 1px solid var(--border-color);
            transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.5s ease, border-color 0.5s ease;
        }

        .impact-metric-card:hover {
            transform: translateY(-8px);
            box-shadow: var(--card-hover-shadow);
        }

        .impact-metric-card .icon-wrapper {
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

        .impact-metric-card .icon-wrapper svg {
            font-size: 3rem;
            color: var(--accent-color-main);
            transition: color 0.5s ease;
        }

        /* Specific icon colors for each card */
        .impact-metric-card:nth-child(1) .icon-wrapper svg { color: var(--accent-color-1); }
        .impact-metric-card:nth-child(2) .icon-wrapper svg { color: var(--accent-color-2); }
        .impact-metric-card:nth-child(3) .icon-wrapper svg { color: var(--accent-color-3); }


        .impact-metric-card .metric-number {
            font-size: 3.5rem; /* Slightly smaller for better fit */
            font-weight: bold;
            color: var(--text-color-primary);
            display: block;
            margin-bottom: 0.5rem;
            transition: color 0.5s ease;
        }

        .impact-metric-card p {
            font-size: 1rem;
            color: var(--text-color-secondary);
            margin-bottom: 0;
            transition: color 0.5s ease;
        }

        /* Testimonial Section */
        .testimonial-section {
            text-align: center;
            margin-bottom: 4rem;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
            background-color: var(--testimonial-bg);
            padding: 2.5rem;
            border-radius: 1rem;
            box-shadow: var(--card-shadow);
            border-left: 8px solid var(--testimonial-border); /* Accent border */
            transition: background-color 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease;
        }

        .testimonial-section blockquote {
            font-family: 'Playfair Display', serif;
            font-style: italic;
            font-size: 1.5rem;
            line-height: 1.6;
            color: var(--text-color-primary);
            margin-bottom: 1.5rem;
            transition: color 0.5s ease;
        }

        .testimonial-section footer {
            font-size: 1rem;
            font-weight: 600;
            color: var(--accent-color-main);
            transition: color 0.5s ease;
        }

        /* Vision for the Future Section */
        .vision-section {
            margin-top: 2rem;
            text-align: center;
            width: 100%;
        }

        .vision-section h2 {
            font-size: clamp(2rem, 3vw, 2.5rem);
            font-weight: bold;
            margin-bottom: 1.5rem;
            color: var(--accent-color-main);
            transition: color 0.5s ease;
        }

        .vision-section p {
            font-size: 1.15rem;
            max-width: 70ch;
            margin-left: auto;
            margin-right: auto;
            color: var(--text-color-secondary);
            transition: color 0.5s ease;
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
            .impact-metrics-grid {
                grid-template-columns: 1fr;
            }
            .impact-metric-card {
                padding: 1.5rem;
            }
            .impact-metric-card h3 {
                font-size: 1.5rem;
            }
            .impact-metric-card .icon-wrapper {
                width: 60px;
                height: 60px;
            }
            .impact-metric-card .icon-wrapper svg {
                font-size: 2.5rem;
            }
            .impact-metric-card .metric-number {
                font-size: 3rem;
            }
            .testimonial-section {
                padding: 1.5rem;
                font-size: 1rem;
            }
            .testimonial-section blockquote {
                font-size: 1.2rem;
            }
            .testimonial-section footer {
                font-size: 0.9rem;
            }
            .vision-section {
                margin-top: 3rem;
            }
            .vision-section h2 {
                font-size: 1.8rem;
            }
            .vision-section p {
                font-size: 1rem;
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
          Driving Real Accessibility for Disabled Lives.
        </h1>

        <p className="page-description">
          Our mission is to create a more inclusive world. See the tangible impact AccessMap is making, fueled by our dedicated community.
        </p>

        <div className="impact-metrics-grid">
          {/* Impact Metric Card 1: Verified Accessible Locations */}
          <div className="impact-metric-card">
            <div className="icon-wrapper">
              <Globe size={48} />
            </div>
            <span className="metric-number">100K+</span>
            <p>Verified Accessible Locations</p>
          </div>

          {/* Impact Metric Card 2: Disabled Lives Empowered */}
          <div className="impact-metric-card">
            <div className="icon-wrapper">
              <Users size={48} />
            </div>
            <span className="metric-number">50K+</span>
            <p>Disabled Lives Empowered</p>
          </div>

          {/* Impact Metric Card 3: Dedicated Contributors */}
          <div className="impact-metric-card">
            <div className="icon-wrapper">
              <TrendingUp size={48} />
            </div>
            <span className="metric-number">20K+</span>
            <p>Dedicated Contributors</p>
          </div>
        </div>

        <div className="testimonial-section">
          <blockquote>
            "AccessMap changed how I explore my city. It’s an essential accessibility tool, giving me the freedom to go where I want, when I want."
            <footer>- Rohan P., AccessMap User</footer>
          </blockquote>
        </div>

        <div className="vision-section">
          <h2>Our Vision for the Future</h2>
          <p>
            We are continuously innovating, building real-time updates, predictive routing, and personalized profiles to drive full inclusion and redefine independent living for disabled individuals worldwide.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OurImpactPage;

// CommunityVoicePage.jsx
import React, { useEffect, useState } from 'react';
import { Users, MessageSquare, Heart, Trophy, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommunityVoicePage = () => {
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
    <div className="community-voice-page">
      {/* Embedded CSS */}
      <style>
        {`
        /* CommunityVoicePage.css - Modern UI */

        /* Global styles for theme transition and font */
        body {
            transition: background-color 0.5s ease, color 0.5s ease;
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
        }

        /* Base container for the page */
        .community-voice-page {
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
        .community-voice-page {
            --page-bg-start: #E8F5E9; /* Light Green */
            --page-bg-end: #E0F2F1;   /* Light Teal */
            --card-bg: #FFFFFF;
            --text-color-primary: #212121;
            --text-color-secondary: #424242;
            --border-color: #A7D9D5; /* Soft Teal */
            --accent-color-main: #2E7D32; /* Dark Green */
            --accent-color-1: #4CAF50; /* Green */
            --accent-color-2: #2196F3; /* Blue */
            --accent-color-3: #9C27B0; /* Purple */
            --accent-color-4: #FFC107; /* Amber */
            --button-bg: #4CAF50; /* Green */
            --button-hover-bg: #388E3C; /* Darker Green */
            --card-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
            --card-hover-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
        }

        /* Dark Mode Variables */
        [data-theme='dark'] .community-voice-page {
            --page-bg-start: #1A1A1A;
            --page-bg-end: #212121;
            --card-bg: #2C2C2C;
            --text-color-primary: #E0E0E0;
            --text-color-secondary: #BDBDBD;
            --border-color: #424242;
            --accent-color-main: #81C784; /* Light Green */
            --accent-color-1: #A5D6A7; /* Light Green */
            --accent-color-2: #90CAF9; /* Light Blue */
            --accent-color-3: #CE93D8; /* Light Purple */
            --accent-color-4: #FFEB3B; /* Light Amber */
            --button-bg: #66BB6A; /* Lighter Green */
            --button-hover-bg: #81C784; /* Even Lighter Green */
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

        /* Community Features Grid */
        .community-features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
            padding: 0 1rem;
        }

        .community-card {
            background-color: var(--card-bg);
            border-radius: 1rem;
            box-shadow: var(--card-shadow);
            padding: 2rem;
            text-align: center;
            border: 1px solid var(--border-color);
            transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.5s ease, border-color 0.5s ease;
        }

        .community-card:hover {
            transform: translateY(-8px);
            box-shadow: var(--card-hover-shadow);
        }

        .community-card .icon-wrapper {
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

        .community-card .icon-wrapper svg {
            font-size: 3rem;
            color: var(--accent-color-main); /* Default icon color */
            transition: color 0.5s ease;
        }

        /* Specific icon colors for each card */
        .community-card:nth-child(1) .icon-wrapper svg { color: var(--accent-color-1); }
        .community-card:nth-child(2) .icon-wrapper svg { color: var(--accent-color-2); }
        .community-card:nth-child(3) .icon-wrapper svg { color: var(--accent-color-3); }
        .community-card:nth-child(4) .icon-wrapper svg { color: var(--accent-color-4); }


        .community-card h3 {
            font-size: 1.75rem;
            font-weight: bold;
            margin-bottom: 0.75rem;
            color: var(--text-color-primary);
            transition: color 0.5s ease;
        }

        .community-card p {
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
            .community-features-grid {
                grid-template-columns: 1fr;
            }
            .community-card {
                padding: 1.5rem;
            }
            .community-card h3 {
                font-size: 1.5rem;
            }
            .community-card .icon-wrapper {
                width: 60px;
                height: 60px;
            }
            .community-card .icon-wrapper svg {
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
          Empowering Our Disability Community, Together.
        </h1>

        <p className="page-description">
          AccessMap thrives on the collective power of its community. Every contribution, every comment, and every verification strengthens our mission.
        </p>

        <div className="community-features-grid">
          {/* Community Card 1: Support Accessibility Initiatives */}
          <div className="community-card">
            <div className="icon-wrapper">
              <Users size={48} />
            </div>
            <h3>Support Accessibility Initiatives</h3>
            <p>
              Collaborate with local communities, NGOs, and fellow users to identify accessibility gaps and drive positive change. Your voice makes a difference.
            </p>
          </div>

          {/* Community Card 2: Engage and Verify */}
          <div className="community-card">
            <div className="icon-wrapper">
              <MessageSquare size={48} />
            </div>
            <h3>Engage and Verify</h3>
            <p>
              Leave comments, provide feedback, and help verify existing reports. Your active participation ensures the accuracy and reliability of our data for everyone.
            </p>
          </div>

          {/* Community Card 3: Share Your Stories */}
          <div className="community-card">
            <div className="icon-wrapper">
              <Heart size={48} />
            </div>
            <h3>Share Your Stories</h3>
            <p>
              Connect with a global network of users. Share your experiences, challenges, and successes to inspire and support others in their accessibility journeys.
            </p>
          </div>

          {/* Community Card 4: Earn Badges and Recognition */}
          <div className="community-card">
            <div className="icon-wrapper">
              <Trophy size={48} />
            </div>
            <h3>Earn Badges and Recognition</h3>
            <p>
              Your contributions don't go unnoticed! Earn badges for your active participation and become a recognized leader in the accessibility mapping community.
            </p>
          </div>
        </div>

        <div className="cta-section">
          <h2>Join the Movement!</h2>
          <button
            onClick={() => navigate('/ngo-login')}
            className="cta-button"
          >
            Start Your Contribution Today
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityVoicePage;

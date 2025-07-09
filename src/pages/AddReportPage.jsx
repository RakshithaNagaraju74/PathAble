import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// Changed import style for lucide-react to import all as a namespace
import * as LucideIcons from 'lucide-react'; 
// Removed Google Maps imports: import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
// Removed axios as it was primarily for Google Geocoding
// import axios from 'axios';

// Define a Teal & Orange color palette for a professional and eye-catching look
const colors = {
  // Light Mode Teal & Orange Theme
  primary: '#007B8C', // Deep Teal - Main accent color
  primaryDark: '#005F6B', // Darker Teal - For headings and stronger accents
  secondary: '#FF8C00', // Warm Orange - For key actions, highlights, active states
  accent: '#8FD85B', // Soft Green - For positive affirmations, subtle accents (e.g., success messages)
  backgroundLight: '#F9FAFC', // Very light off-white - Overall background
  backgroundMid: '#EBF2F6', // Slightly darker light gray - Subtle contrast sections, form card background
  backgroundDark: '#2C3E50', // Deep Charcoal Blue - Footer, dark sections
  textPrimary: '#333333', // Dark Gray - Primary text
  textSecondary: '#666666', // Medium Gray - Secondary/placeholder text
  textLight: '#ffffff', // Pure white - Text on dark backgrounds
  borderLight: '#DDE5ED', // Light gray - For subtle separation and input borders
  inputBg: '#FFFFFF', // Pure white - Input field background
  buttonGradient: 'linear-gradient(to right, #007B8C, #00A693)', // Teal gradient for buttons
  buttonHover: 'linear-gradient(to right, #005F6B, #007B8C)', // Darker teal on hover
  shadowBase: 'rgba(0, 0, 0, 0.08)', // Soft, diffused shadow
  successBg: '#D4EDDA', // Light green for success
  successText: '#155724', // Dark green for success text
  errorBg: '#FEE2E2', // Light red for error
  errorText: '#DC2626', // Dark red for error text
  sidebarBg: 'linear-gradient(to bottom, #F9FAFC, #EBF2F6)', // Subtle gradient for sidebar
  sidebarActiveBg: '#FF8C00', // Orange for active sidebar step
  sidebarActiveText: '#FFFFFF', // White for active sidebar text
  stepNumberBg: '#DDE5ED', // Light gray for step numbers
  stepNumberActiveBg: '#007B8C', // Deep Teal for active step number
  aiAccent: '#4CAF50', // Green for AI verification success
  aiError: '#F44336', // Red for AI verification error
  aiInfo: '#2196F3', // Blue for AI info/neutral
  aiInfoBg: '#E3F2FD', // Light blue for AI info background

  // Dark Mode Teal & Orange Theme
  dark: {
    primary: '#00BCD4', // Bright Cyan/Teal - Main interactive elements
    primaryDark: '#00838F', // Darker Teal - For headings and stronger accents
    secondary: '#FFAB40', // Bright Orange - For secondary actions, highlights
    accent: '#A5D6A7', // Soft Green for dark mode accents
    backgroundLight: '#121212', // Very Dark Gray - Overall background
    backgroundMid: '#1E1E1E', // Slightly Lighter Dark Gray - Cards/sections
    backgroundDark: '#0A0A0A', // Deepest black-gray - Footer, deepest sections
    textPrimary: '#E0E0E0', // Light Gray - Primary text
    textSecondary: '#B0B0B0', // Medium Light Gray - Muted text
    textLight: '#FFFFFF', // Pure white - Highlights
    borderLight: '#303030', // Dark Gray - Borders
    inputBg: '#1E1E1E', // Darker background for inputs
    buttonGradient: 'linear-gradient(to right, #00BCD4, #4DD0E1)', // Cyan/Teal gradient
    buttonHover: 'linear-gradient(to right, #00838F, #00BCD4)',
    shadowBase: 'rgba(0, 200, 200, 0.15)', // Subtle Cyan/Teal glow shadow
    glowPrimary: 'rgba(0, 220, 220, 0.6)', // Strong Teal/Cyan glow
    successBg: '#2E7D32',
    successText: '#A5D6A7',
    errorBg: '#C62828',
    errorText: '#EF9A9A',
    sidebarBg: 'linear-gradient(to bottom, #121212, #1E1E1E)', // Darker gradient for sidebar
    sidebarActiveBg: '#FFAB40', // Bright Orange for active sidebar step
    sidebarActiveText: '#121212', // Dark text on bright orange
    stepNumberBg: '#303030', // Dark gray for step numbers
    stepNumberActiveBg: '#00BCD4', // Bright Cyan/Teal for active step number
    aiAccent: '#A5D6A7', // Light Green for AI verification success
    aiError: '#EF9A9A', // Light Red for AI verification error
    aiInfo: '#90CAF9', // Light Blue for AI info/neutral
    aiInfoBg: '#1E3A8A', // Dark blue for AI info background
  }
};

// Environment variables for Cloudinary
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'your_unsigned_preset'; // Replace with your actual preset
const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'your_cloud_name'; // Replace with your actual cloud name

// Teachable Machine Model URL
const TM_MODEL_URL = "https://teachablemachine.withgoogle.com/models/P2PjnzrQ5/";

// Mapping for Teachable Machine class names to desired accessibility types
// This map allows you to control the displayed name regardless of TM's internal labels.
const CLASS_NAME_MAP = {
  "Class 1": "ramp",
  "Class 2": "elevator",
  "Class 3": "restroom",
  "Class 4": "parking",
  "Class 5": "pathway",
  // Add more mappings as needed, e.g., "Class 6": "entrance", "Class 7": "other"
  // If your TM model outputs different class names, update this map accordingly.
};

export default function AddReportPage() {
  const [type, setType] = useState('');
  const [comment, setComment] = useState('');
  const [imageFile, setImageFile] = useState(null); // Raw file for upload
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null); // Cloudinary URL
  const [placeName, setPlaceName] = useState('');
  const [address, setAddress] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [mongoUserId, setMongoUserId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notificationStatus, setNotificationStatus] = useState('none');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Teachable Machine States
  const [tmModel, setTmModel] = useState(null);
  const [isTmModelLoading, setIsTmModelLoading] = useState(true);
  const [tmPredictionResult, setTmPredictionResult] = useState(null);
  const [tmError, setTmError] = useState(null);
  const [isTmPredicting, setIsTmPredicting] = useState(false);

  // Nominatim Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);


  const navigate = useNavigate();
  const location = useLocation();
  const { userId, isNgo, loggedInNgoId } = location.state || {};

  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDarkMode);
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const currentColors = darkMode ? colors.dark : colors;

  const steps = [
    { id: 1, name: 'Feature', icon: <LucideIcons.CheckCircle size={16} /> }, // Use LucideIcons.CheckCircle
    { id: 2, name: 'Details with Image', icon: <LucideIcons.Image size={16} /> }, // Use LucideIcons.Image
    { id: 3, name: 'Location Details', icon: <LucideIcons.MapPin size={16} /> }, // Use LucideIcons.MapPin
    { id: 4, name: 'Summary', icon: <LucideIcons.ListChecks size={16} /> }, // Use LucideIcons.ListChecks
    { id: 5, name: 'Report', icon: <LucideIcons.CheckCircle size={16} /> }, // Use LucideIcons.CheckCircle
  ];

  useEffect(() => {
    if (!userId) return;
    setMongoUserId(userId);
  }, [userId]);

  // Effect to get current geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setError(''); // Clear any previous geolocation errors
        },
        (err) => {
          console.warn("Geolocation failed:", err);
          // Provide a more actionable error message
          setError("Could not get your current location. Please enter Latitude and Longitude manually in the Location Details step.");
        },
        { timeout: 10000 } // Increased timeout for better chance of success
      );
    } else {
      setError("Geolocation is not supported by your browser. Please enter Latitude and Longitude manually in the Location Details step.");
    }
  }, []);

  // Effect to load Teachable Machine model and its dependencies
  useEffect(() => {
    const loadScriptsSequentially = async () => {
      setIsTmModelLoading(true);
      setTmError(null);

      try {
        // Load TensorFlow.js
        if (typeof window.tf === 'undefined') {
          console.log("Loading TensorFlow.js...");
          const tfScript = document.createElement('script');
          tfScript.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js";
          tfScript.async = true;
          document.body.appendChild(tfScript);

          await new Promise((resolve, reject) => {
            tfScript.onload = resolve;
            tfScript.onerror = () => reject(new Error("Failed to load TensorFlow.js"));
          });
          console.log("TensorFlow.js loaded.");
        }

        // Load Teachable Machine Image library
        if (typeof window.tmImage === 'undefined') {
          console.log("Loading Teachable Machine Image library...");
          const tmScript = document.createElement('script');
          tmScript.src = "https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8/dist/teachablemachine-image.min.js";
          tmScript.async = true;
          document.body.appendChild(tmScript);

          await new Promise((resolve, reject) => {
            tmScript.onload = resolve;
            tmScript.onerror = () => reject(new Error("Failed to load Teachable Machine Image library"));
          });
          console.log("Teachable Machine Image library loaded.");
        }

        // Load your specific Teachable Machine model
        console.log("Loading Teachable Machine model...");
        const modelURL = TM_MODEL_URL + "model.json";
        const metadataURL = TM_MODEL_URL + "metadata.json";
        const loadedModel = await window.tmImage.load(modelURL, metadataURL);
        setTmModel(loadedModel);
        setIsTmModelLoading(false);
        console.log("Teachable Machine model loaded successfully.");

      } catch (e) {
        console.error("Error loading Teachable Machine model or its dependencies:", e);
        setTmError(`Failed to load Teachable Machine model: ${e.message}. Ensure TensorFlow.js and Teachable Machine scripts are accessible.`);
        setIsTmModelLoading(false);
      }
    };

    loadScriptsSequentially();
  }, []); // Run only once on mount

  // Handle image file selection and immediate Cloudinary upload
  const handleImageFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file); // Store the raw file for preview
      setUploadedImageUrl(URL.createObjectURL(file)); // For immediate local preview

      // Clear previous AI results/errors
      setTmPredictionResult(null); // Clear TM results
      setTmError(null); // Clear TM errors

      setError(''); // Clear general error

      // Upload to Cloudinary immediately
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error?.message || 'Image upload failed');
        }
        const data = await res.json();
        const url = data.secure_url;
        setUploadedImageUrl(url); // Update with Cloudinary URL
        console.log("Image uploaded to Cloudinary:", url);
      } catch (err) {
        console.error("Error uploading image to Cloudinary:", err);
        setError(`Image upload failed: ${err.message || 'Check Cloudinary config. Make sure CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET are set correctly in .env'}`);
        setUploadedImageUrl(null); // Clear URL on error
        setImageFile(null); // Clear file on error
      }
    } else {
      setImageFile(null);
      setUploadedImageUrl(null);
      setTmPredictionResult(null); // Clear TM results
      setTmError(null); // Clear TM errors
    }
  };

  // New function for Teachable Machine prediction
  const runTeachableMachinePrediction = async () => {
    if (!tmModel) {
      setTmError("Teachable Machine model not loaded yet. Please wait or check console for errors.");
      return;
    }
    if (!uploadedImageUrl) {
      setTmError("Please upload an image first for Teachable Machine prediction.");
      return;
    }

    setIsTmPredicting(true);
    setTmPredictionResult(null);
    setTmError(null);

    try {
      console.log("Starting Teachable Machine prediction...");
      const img = new Image();
      img.crossOrigin = "anonymous"; // Important for CORS if image is from another domain
      img.src = uploadedImageUrl;

      img.onload = async () => {
        console.log("Image loaded for TM prediction.");
        const allPredictions = await tmModel.predict(img);
        console.log("TM All Predictions (raw):", allPredictions);

        // Correctly get the human-readable labels from the loaded model's metadata
        // Use optional chaining for safe access
        const classLabels = tmModel.metadata?.labels || [];
        console.log("TM Class Labels from metadata:", classLabels);

        // Normalize the selected report type for comparison
        const selectedReportTypeNormalized = type ? type.toLowerCase().replace(/\s+/g, '') : null;

        let matchingPredictionForType = null;
        let highestConfidenceOverall = { className: "N/A", probability: "0.00" };

        allPredictions.forEach((p, index) => {
          // Get the class name from classLabels array using index, fallback to raw p.className
          let currentClassName = classLabels[index] || p.className;

          // Apply the custom mapping if available (for "Class X" to "ramp" etc.)
          currentClassName = CLASS_NAME_MAP[currentClassName] || currentClassName;

          const currentProbability = (p.probability * 100).toFixed(2);

          // Update overall highest confidence
          if (parseFloat(currentProbability) > parseFloat(highestConfidenceOverall.probability)) {
            highestConfidenceOverall = {
              className: currentClassName,
              probability: currentProbability
            };
          }

          // Check for a match with the selected report type
          // Normalize the current class name for comparison
          const currentClassNameNormalized = currentClassName.toLowerCase().replace(/\s+/g, '');

          // Add a confidence threshold (e.g., 70%) for a "confident match"
          if (selectedReportTypeNormalized && currentClassNameNormalized === selectedReportTypeNormalized && p.probability > 0.7) {
            matchingPredictionForType = {
              className: currentClassName,
              probability: currentProbability
            };
          }
        });

        if (selectedReportTypeNormalized) {
          if (matchingPredictionForType) {
            // If a type is selected and a confident matching prediction is found
            setTmPredictionResult({
              className: matchingPredictionForType.className,
              probability: matchingPredictionForType.probability,
              message: `Image matches selected type '${selectedReportTypeNormalized}' with ${matchingPredictionForType.probability}% confidence.`
            });
          } else {
            // If a type is selected but no confident matching prediction
            setTmPredictionResult({
              className: highestConfidenceOverall.className, // Still show overall highest for context
              probability: highestConfidenceOverall.probability,
              message: `No confident match found for selected type '${selectedReportTypeNormalized}'. Highest prediction is '${highestConfidenceOverall.className}' with ${highestConfidenceOverall.probability}% confidence.`
            });
          }
        } else {
          // If no type is selected, just show the overall highest prediction
          if (allPredictions.length > 0) {
            setTmPredictionResult({
              className: highestConfidenceOverall.className,
              probability: highestConfidenceOverall.probability,
              message: "No specific type selected. Showing overall highest confidence prediction."
            });
          } else {
            setTmPredictionResult({
              className: "N/A",
              probability: "0.00",
              message: "No confident prediction from Teachable Machine."
            });
          }
        }
        setIsTmPredicting(false);
      };
      img.onerror = () => {
        console.error("Image loading error for TM prediction.");
        setTmError("Failed to load image for Teachable Machine prediction. Check image URL or CORS settings.");
        setIsTmPredicting(false);
      };

    } catch (err) {
      console.error("Error during Teachable Machine prediction (catch block):", err);
      setTmError(err.message || "An unexpected error occurred during Teachable Machine prediction.");
      setIsTmPredicting(false);
    }
  };

  // Nominatim Search Function (direct call, no proxy)
  const handleNominatimSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    setError(''); // Clear previous errors
    try {
      // Direct call to Nominatim
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'AccessMap/1.0 (contact@accessmap.com)' // IMPORTANT: Identify your app
        }
      });
      if (!res.ok) {
        throw new Error(`Nominatim API error: ${res.statusText}`);
      }
      const data = await res.json();
      setSearchResults(data);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Error searching with Nominatim:", err);
      setError(`Failed to search for places: ${err.message}. Please try again.`);
      setSearchResults([]);
      setShowSuggestions(false);
    }
  }, []);

  // Handle search input change (no debouncing as per request)
  const handleSearchInputChange = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) { // Only search if query is at least 3 characters
      handleNominatimSearch(query);
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
    }
  }, [handleNominatimSearch]);


  // Handle selection from search suggestions
  const handleSuggestionSelect = useCallback(async (result) => {
    setPlaceName(result.name || result.display_name.split(',')[0].trim());
    setLatitude(parseFloat(result.lat));
    setLongitude(parseFloat(result.lon));
    
    // Improved address parsing for Indian locations with more detail from addressdetails=1
    const addressParts = result.address;
    let fullAddress = result.display_name;
    if (addressParts) {
      const parts = [];
      // Prioritize more specific components
      if (addressParts.house_number) parts.push(addressParts.house_number);
      if (addressParts.road) parts.push(addressParts.road);
      if (addressParts.suburb) parts.push(addressParts.suburb);
      if (addressParts.neighbourhood) parts.push(addressParts.neighbourhood);
      if (addressParts.hamlet) parts.push(addressParts.hamlet); // Smaller locality
      if (addressParts.village) parts.push(addressParts.village);
      if (addressParts.town) parts.push(addressParts.town);
      if (addressParts.city) parts.push(addressParts.city);
      if (addressParts.city_district) parts.push(addressParts.city_district); // Common in India
      if (addressParts.county) parts.push(addressParts.county); // Often equivalent to district
      if (addressParts.state_district) parts.push(addressParts.state_district); // Explicit district
      if (addressParts.state) parts.push(addressParts.state);
      if (addressParts.postcode) parts.push(addressParts.postcode);
      if (parts.length > 0) {
        fullAddress = parts.join(', ');
      }
    }
    setAddress(fullAddress);

    setCity(addressParts?.city || addressParts?.town || addressParts?.village || 'N/A');
    setDistrict(addressParts?.state_district || addressParts?.county || addressParts?.city_district || 'N/A'); // Prioritize state_district/county/city_district for India
    setPostalCode(addressParts?.postcode || 'N/A');
    setGoogleMapsLink(`https://www.google.com/maps/search/?api=1&query=${result.lat},${result.lon}`); // Generate Google Maps link

    setSearchQuery(result.display_name); // Set search query to full display name
    setSearchResults([]); // Clear suggestions
    setShowSuggestions(false); // Hide suggestions after selection
    setError(''); // Clear any search errors
  }, []);

  // Close suggestions when clicking outside of the search input
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setShowSuccessMessage(false);

    if (!mongoUserId) {
      setError("Authentication required. Please log in.");
      setSubmitting(false);
      return;
    }

    // Check if latitude and longitude are provided (either by geolocation or manually)
    if (latitude === null || longitude === null) {
      setError("Location coordinates (Latitude and Longitude) are required. Please ensure geolocation is enabled or enter them manually.");
      setSubmitting(false);
      return;
    }

    try {
      const reportPayload = {
        type,
        comment,
        imageUrl: uploadedImageUrl, // Use the Cloudinary URL
        lat: latitude,
        lng: longitude,
        reportedBy: mongoUserId,
        placeName,
        address,
        googleMapsLink,
        city,
        district,
        postalCode,
        notificationStatus,
        isNgoReport: !!isNgo,
        // NEW: Teachable Machine Prediction
        teachableMachinePrediction: tmPredictionResult ? {
          className: tmPredictionResult.className,
          probability: tmPredictionResult.probability,
        } : null,
      };

      if (isNgo && loggedInNgoId) {
        reportPayload.ngoReporterId = loggedInNgoId;
      }

      const res = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportPayload),
      });

      if (!res.ok) {
        const errData = await res.json();
        if (res.status === 403 && errData.error && errData.error.includes('spam')) {
            setError(`Report submission failed: ${errData.error}`);
        } else {
            throw new Error(errData.error || 'Report submission failed');
        }
        setSubmitting(false);
        return;
      }

      setShowSuccessMessage(true);
      // Reset form fields
      setType('');
      setComment('');
      setImageFile(null);
      setUploadedImageUrl(null);
      setTmPredictionResult(null); // Reset TM results
      setTmError(null); // Reset TM errors
      setPlaceName('');
      setAddress('');
      setGoogleMapsLink('');
      setLatitude(null);
      setLongitude(null);
      setCity('');
      setDistrict('');
      setPostalCode('');
      setNotificationStatus('none');

      setTimeout(() => {
        navigate(isNgo ? '/ngo-dashboard' : '/map');
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextStep = () => {
    setError('');
    if (currentStep === 1) {
      if (!type || !comment.trim()) {
        setError("Please select a feature type and provide a comment.");
        return;
      }
    } else if (currentStep === 2) { // Logic for image verification step
      if (!uploadedImageUrl) {
        setError("Please upload an image first.");
        return;
      }
      if (!tmPredictionResult) {
        setError("Please run Teachable Machine verification on the image.");
        return;
      }

      const selectedReportTypeNormalized = type ? type.toLowerCase().replace(/\s+/g, '') : null;
      const predictedClassNameNormalized = tmPredictionResult.className ? tmPredictionResult.className.toLowerCase().replace(/\s+/g, '') : null;
      const confidence = parseFloat(tmPredictionResult.probability);

      if (selectedReportTypeNormalized) {
        // If a type is selected, ensure it matches confidently
        if (predictedClassNameNormalized !== selectedReportTypeNormalized || confidence < 70) { // 70% threshold for confident match
          setError(`The uploaded image does not confidently match the selected accessibility type '${type}'. Please change the image or the selected type.`);
          return;
        }
      } else {
        // If no type is selected, ensure there's at least a confident prediction overall
        if (confidence < 50) { // Lower threshold if no specific type is targeted
          setError("Image verification did not yield a confident result. Please try another image.");
          return;
        }
      }
    } else if (currentStep === 3) {
      // Check for latitude and longitude before proceeding
      if (latitude === null || longitude === null) {
        setError("Location coordinates (Latitude and Longitude) are required. Please ensure geolocation is enabled or enter them manually.");
        return;
      }
    }
    setCurrentStep((prevStep) => Math.min(prevStep + 1, steps.length));
  };

  const handleBackStep = () => {
    setError('');
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 1));
  };

  const renderCurrentFormStep = () => {
    // Helper to conditionally display value or empty string for placeholders
    const getFieldValue = (fieldValue) => {
      return (fieldValue && fieldValue !== 'N/A' && !fieldValue.startsWith('Error')) ? fieldValue : '';
    };

    switch (currentStep) {
      case 1: // Feature
        return (
          <>
            <label className="block text-xs font-semibold uppercase mb-3" style={{ color: currentColors.textSecondary }}>
              Report Details
            </label>
            <div className="grid grid-cols-1 gap-4">
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75 appearance-none pr-10"
                  style={{
                    borderColor: currentColors.borderLight,
                    backgroundColor: currentColors.inputBg,
                    color: currentColors.textPrimary,
                    '--tw-ring-color': currentColors.primary,
                    boxShadow: darkMode ? `0 0 8px ${currentColors.glowPrimary}` : 'none'
                  }}
                >
                  <option value="">Select Accessibility Type</option>
                  <option value="ramp">Ramp</option>
                  <option value="elevator">Elevator</option>
                  <option value="restroom">Restroom</option>
                  <option value="parking">Parking</option>
                  <option value="entrance">Entrance</option>
                  <option value="pathway">Pathway</option>
                  <option value="other">Other</option>
                </select>
                <LucideIcons.ChevronRight size={20} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90" style={{ color: currentColors.textSecondary }} />
              </div>
              <div className="relative">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe the accessibility feature (e.g., 'Ramp too steep')"
                  required
                  rows={3}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75 resize-y"
                  style={{
                    borderColor: currentColors.borderLight,
                    backgroundColor: currentColors.inputBg,
                    color: currentColors.textPrimary,
                    '--tw-ring-color': currentColors.primary,
                    boxShadow: darkMode ? `0 0 8px ${currentColors.glowPrimary}` : 'none'
                  }}
                />
                <LucideIcons.HelpCircle size={18} className="absolute top-3 right-3" style={{ color: currentColors.textSecondary }} />
              </div>
            </div>
          </>
        );
      case 2: // Details with Image and AI Verification
        return (
          <>
            <label className="block text-xs font-semibold uppercase mb-3" style={{ color: currentColors.textSecondary }}>
              Image Details (Optional)
            </label>
            <div>
              <label htmlFor="imageUpload" className="block text-sm font-medium mb-2" style={{ color: currentColors.textPrimary }}>
                Upload Image (Optional)
              </label>
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageFileChange} // Use new handler
                className="w-full text-sm
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-purple-50 file:text-purple-700
                  hover:file:bg-purple-100"
                style={{
                  color: currentColors.textPrimary,
                  '--tw-file-bg': darkMode ? colors.dark.backgroundMid : colors.backgroundMid,
                  '--tw-file-text': darkMode ? currentColors.primary : currentColors.primary,
                  '--tw-file-hover-bg': darkMode ? colors.dark.borderLight : colors.borderLight,
                }}
              />
              {imageFile && <p className="text-sm mt-2" style={{ color: currentColors.textSecondary }}>Selected: {imageFile.name}</p>}

              {uploadedImageUrl && ( // Use uploadedImageUrl for preview
                <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: currentColors.backgroundMid, border: `1px solid ${currentColors.borderLight}` }}>
                  <h4 className="text-base font-medium mb-3" style={{ color: currentColors.textPrimary }}>Image Preview & AI Tools:</h4>
                  <img src={uploadedImageUrl} alt="Image Preview" className="max-w-full h-auto rounded-lg shadow-md mb-4" style={{ border: `1px solid ${currentColors.borderLight}` }} />

                  <div className="grid grid-cols-1 gap-3 mb-4"> {/* Only one column for TM button */}
                    {/* Teachable Machine Button */}
                    <button
                      type="button"
                      onClick={runTeachableMachinePrediction}
                      disabled={isTmModelLoading || isTmPredicting || !uploadedImageUrl}
                      className="px-4 py-2 rounded-full text-white font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      style={{
                        background: currentColors.buttonGradient,
                        boxShadow: darkMode ? `0 0 15px ${currentColors.glowPrimary}` : `0 5px 15px rgba(0, 123, 140, 0.3)`,
                      }}
                    >
                      {isTmModelLoading ? (
                        <>
                          <LucideIcons.Loader2 size={16} className="animate-spin mr-2" /> Loading TM Model...
                        </>
                      ) : isTmPredicting ? (
                        <>
                          <LucideIcons.Loader2 size={16} className="animate-spin mr-2" /> Verifying Image...
                        </>
                      ) : (
                        <>
                          <LucideIcons.Microscope size={16} className="mr-2" /> Verify Image (TM)
                        </>
                      )}
                    </button>
                  </div>

                  {/* Teachable Machine Prediction Results */}
                  {tmError && (
                    <div className="mt-3 p-3 rounded-lg flex items-center" style={{ backgroundColor: currentColors.errorBg, color: currentColors.errorText, border: `1px solid ${currentColors.aiError}` }}>
                      <LucideIcons.XCircle size={20} className="mr-2" />
                      <span>Teachable Machine Error: {tmError}</span>
                    </div>
                  )}
                  {tmPredictionResult && (
                    <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: currentColors.aiInfoBg, color: currentColors.aiInfo, border: `1px solid ${currentColors.aiInfo}` }}>
                      <LucideIcons.Microscope size={20} className="inline-block mr-2" />
                      <strong>Teachable Machine Prediction:</strong>
                      <p className="ml-7">
                        Class: <span className="font-semibold">{tmPredictionResult.className}</span> with {tmPredictionResult.probability}% confidence.
                      </p>
                      {/* Display the specific message for clarity */}
                      {tmPredictionResult.message && <p className="ml-7 text-xs">{tmPredictionResult.message}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        );
      case 3: // Location Details with Manual Input and Nominatim Search
        return (
          <>
            <label className="block text-xs font-semibold uppercase mb-3" style={{ color: currentColors.textSecondary }}>
              Location Details
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nominatim Search Input */}
              <div className="relative md:col-span-2" ref={searchInputRef}>
                <input
                  type="text"
                  placeholder="Search for a place (e.g., 'Eiffel Tower, Paris')"
                  value={searchQuery}
                  onChange={handleSearchInputChange} // Direct call to handleNominatimSearch
                  onFocus={() => searchQuery.length > 2 && searchResults.length > 0 && setShowSuggestions(true)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75 pr-10"
                  style={{
                    borderColor: currentColors.borderLight,
                    backgroundColor: currentColors.inputBg,
                    color: currentColors.textPrimary,
                    '--tw-ring-color': currentColors.primary,
                    boxShadow: darkMode ? `0 0 8px ${currentColors.glowPrimary}` : 'none'
                  }}
                />
                <LucideIcons.MapPin size={18} className="absolute top-3 right-3" style={{ color: currentColors.textSecondary }} />
                {showSuggestions && searchResults.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {searchResults.map((result) => (
                      <li
                        key={result.place_id}
                        className="p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        style={{ color: currentColors.textPrimary }}
                        onClick={() => handleSuggestionSelect(result)}
                      >
                        {result.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Manual Inputs (can be pre-filled by Nominatim) */}
              <input
                type="text"
                placeholder="Place Name (e.g., 'Cafe Bliss')"
                value={getFieldValue(placeName)}
                onChange={(e) => setPlaceName(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75"
                style={{
                  borderColor: currentColors.borderLight,
                  backgroundColor: currentColors.inputBg,
                  color: currentColors.textPrimary,
                  '--tw-ring-color': currentColors.primary,
                  boxShadow: darkMode ? `0 0 8px ${currentColors.glowPrimary}` : 'none'
                }}
              />
              <input
                type="text"
                placeholder="Address (e.g., '123 Main St')"
                value={getFieldValue(address)}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75"
                style={{
                  borderColor: currentColors.borderLight,
                  backgroundColor: currentColors.inputBg,
                  color: currentColors.textPrimary,
                  '--tw-ring-color': currentColors.primary,
                  boxShadow: darkMode ? `0 0 8px ${currentColors.glowPrimary}` : 'none'
                }}
              />
              <input
                type="text"
                placeholder="City"
                value={getFieldValue(city)}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75"
                style={{
                  borderColor: currentColors.borderLight,
                  backgroundColor: currentColors.inputBg,
                  color: currentColors.textPrimary,
                  '--tw-ring-color': currentColors.primary,
                  boxShadow: darkMode ? `0 0 8px ${currentColors.glowPrimary}` : 'none'
                }}
              />
              <input
                type="text"
                placeholder="District"
                value={getFieldValue(district)}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75"
                style={{
                  borderColor: currentColors.borderLight,
                  backgroundColor: currentColors.inputBg,
                  color: currentColors.textPrimary,
                  '--tw-ring-color': currentColors.primary,
                  boxShadow: darkMode ? `0 0 8px ${currentColors.glowPrimary}` : 'none'
                }}
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={getFieldValue(postalCode)}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75"
                style={{
                  borderColor: currentColors.borderLight,
                  backgroundColor: currentColors.inputBg,
                  color: currentColors.textPrimary,
                  '--tw-ring-color': currentColors.primary,
                  boxShadow: darkMode ? `0 0 8px ${currentColors.glowPrimary}` : 'none'
                }}
              />
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Latitude"
                  value={latitude || ''}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  step="any"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75"
                  style={{
                    borderColor: currentColors.borderLight,
                    backgroundColor: currentColors.inputBg,
                    color: currentColors.textPrimary,
                    '--tw-ring-color': currentColors.primary,
                    boxShadow: darkMode ? `0 0 8px ${currentColors.glowPrimary}` : 'none'
                  }}
                />
                <input
                  type="number"
                  placeholder="Longitude"
                  value={longitude || ''}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  step="any"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75"
                  style={{
                    borderColor: currentColors.borderLight,
                    backgroundColor: currentColors.inputBg,
                    color: currentColors.textPrimary,
                    '--tw-ring-color': currentColors.primary,
                    boxShadow: darkMode ? `0 0 8px ${currentColors.glowPrimary}` : 'none'
                  }}
                />
              </div>
              <div className="md:col-span-2 relative">
                <input
                  type="url"
                  placeholder="Google Maps Link (e.g., https://goo.gl/maps/xyz)"
                  value={googleMapsLink}
                  onChange={(e) => setGoogleMapsLink(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75 pr-10"
                  style={{
                    borderColor: currentColors.borderLight,
                    backgroundColor: currentColors.inputBg,
                    color: currentColors.textPrimary,
                    '--tw-ring-color': currentColors.primary,
                    boxShadow: darkMode ? `0 0 8px ${currentColors.glowPrimary}` : 'none'
                  }}
                />
                <LucideIcons.HelpCircle size={18} className="absolute top-3 right-3" style={{ color: currentColors.textSecondary }} />
                <p className="text-xs mt-1" style={{ color: currentColors.textSecondary }}>
                  Providing a Google Maps link helps us pinpoint the exact location.
                </p>
              </div>
            </div>
            {latitude && longitude && (
              <div className="text-sm mt-4 flex items-center p-3 rounded-lg border" style={{ color: currentColors.textSecondary, borderColor: currentColors.borderLight, backgroundColor: currentColors.backgroundMid }}>
                <LucideIcons.MapPin className="mr-2" size={18} style={{ color: currentColors.primary }} />
                <span>Lat: {latitude.toFixed(5)} | Lng: {longitude.toFixed(5)}</span>
              </div>
            )}
          </>
        );
      case 4: // Summary
        return (
          <>
            <h3 className="text-xl font-bold mb-4" style={{ color: currentColors.textPrimary }}>Review Your Report</h3>
            <div className="space-y-3 text-sm" style={{ color: currentColors.textPrimary }}>
              <p><strong>Feature Type:</strong> <span className="capitalize">{type || 'N/A'}</span></p>
              <p><strong>Comment:</strong> {comment || 'N/A'}</p>
              <p><strong>Image:</strong> {imageFile ? imageFile.name : 'No image uploaded'}</p>
              {uploadedImageUrl && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium mb-1" style={{ color: currentColors.textPrimary }}>Image Preview:</h4>
                  <img src={uploadedImageUrl} alt="Report Preview" className="max-w-xs h-auto rounded-lg shadow-md" style={{ border: `1px solid ${currentColors.borderLight}` }} />
                </div>
              )}
              {tmPredictionResult && (
                <div className="mt-2 p-3 rounded-lg" style={{ backgroundColor: currentColors.aiInfoBg, color: currentColors.aiInfo, border: `1px solid ${currentColors.aiInfo}` }}>
                  <p><strong>Teachable Machine Prediction:</strong></p>
                  <p className="ml-7">
                    Class: <span className="font-semibold">{tmPredictionResult.className}</span> with {tmPredictionResult.probability}% confidence.
                  </p>
                  {/* Display the specific message for clarity */}
                  {tmPredictionResult.message && <p className="ml-7 text-xs">{tmPredictionResult.message}</p>}
                </div>
              )}
              <p><strong>Place Name:</strong> {getFieldValue(placeName) || 'N/A'}</p>
              <p><strong>Address:</strong> {getFieldValue(address) || 'N/A'}</p>
              <p><strong>City:</strong> {getFieldValue(city) || 'N/A'}</p>
              <p><strong>District:</strong> {getFieldValue(district) || 'N/A'}</p>
              <p><strong>Postal Code:</strong> {getFieldValue(postalCode) || 'N/A'}</p>
              <p><strong>Google Maps Link:</strong> <a href={googleMapsLink} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: currentColors.primary }}>{googleMapsLink || 'N/A'}</a></p>
              <p><strong>Location:</strong> {latitude && longitude ? `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}` : 'N/A'}</p>
              <p><strong>Notification Status:</strong> <span className="capitalize">{notificationStatus || 'None'}</span></p>
              {isNgo && loggedInNgoId && (
                <p><strong>Reported by NGO:</strong> Yes (NGO ID: {loggedInNgoId})</p>
              )}
            </div>
          </>
        );
      case 5: // Report (Final Submission Step)
        return (
          <>
            <h3 className="text-xl font-bold mb-4" style={{ color: currentColors.textPrimary }}>Finalize Report</h3>
            <p className="text-base mb-6" style={{ color: currentColors.textSecondary }}>
              Almost done! Confirm the details below and submit your report.
            </p>
            <div>
              <label className="block text-xs font-semibold uppercase mb-3" style={{ color: currentColors.textSecondary }}>
                Notification Status
              </label>
              <div className="relative">
                <select
                  value={notificationStatus}
                  onChange={(e) => setNotificationStatus(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75 appearance-none pr-10"
                  style={{
                    borderColor: currentColors.borderLight,
                    backgroundColor: currentColors.inputBg,
                    color: currentColors.textPrimary,
                    '--tw-ring-color': currentColors.primary, /* Corrected: was currentColors.colors.primary */
                    boxShadow: darkMode ? `0 0 8px ${currentColors.glowPrimary}` : 'none'
                  }}
                >
                  <option value="none">None</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                </select>
                <LucideIcons.ChevronRight size={20} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90" style={{ color: currentColors.textSecondary }} />
              </div>
              <p className="text-xs mt-1" style={{ color: currentColors.textSecondary }}>
                Status of notifications related to this report.
              </p>
            </div>
          </>
        );
      default:
        return null;
    }
  };


  return (
    <div className="min-h-screen flex justify-center py-10 px-4 font-sans" style={{ backgroundColor: currentColors.backgroundLight }}>
      <div className="flex w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden"
        style={{
          backgroundColor: currentColors.backgroundMid,
          boxShadow: `0 20px 50px ${currentColors.shadowBase}`,
        }}
      >

        <aside className="w-1/3 p-8 flex flex-col justify-between rounded-l-2xl" style={{ background: currentColors.sidebarBg }}>
          <div>
            <h1 className="text-3xl font-bold mb-12" style={{ color: currentColors.primaryDark }}>AccessMap</h1>

            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.id}>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white mr-3"
                      style={{
                        backgroundColor: currentStep === step.id ? currentColors.stepNumberActiveBg : (currentStep > step.id ? currentColors.stepNumberActiveBg : currentColors.stepNumberBg),
                        color: currentColors.sidebarActiveText
                      }}>
                      {/* Use LucideIcons.CheckCircle here */}
                      {currentStep > step.id ? <LucideIcons.CheckCircle size={16} /> : step.id}
                    </div>
                    <span className={`font-semibold ${currentStep === step.id ? '' : 'font-normal'}`}
                      style={{
                        color: currentStep === step.id ? currentColors.primaryDark : (currentStep > step.id ? currentColors.primaryDark : currentColors.textSecondary)
                      }}>
                      {step.name}
                    </span>
                  </div>
                  {step.id < steps.length && (
                    <div className="flex">
                      <div className="w-0.5 h-10 ml-3.5 -my-2" style={{ backgroundColor: currentColors.borderLight }}></div>
                      <div className="flex-grow"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => navigate(isNgo ? '/ngo-dashboard' : '/map')}
            className="text-sm font-semibold hover:underline"
            style={{ color: currentColors.primaryDark }}
          >
            &larr; Back to Dashboard
          </button>
        </aside>

        <main className="w-2/3 p-10 flex flex-col justify-between" style={{ backgroundColor: currentColors.inputBg }}>
          <div>
            <h2 className="text-3xl font-bold mb-8" style={{ color: currentColors.primaryDark }}>
              {currentStep === 1 && (isNgo ? 'NGO: Report a Feature' : 'Provide Feature Details')}
              {currentStep === 2 && 'Add Image (Optional) & AI Verification'}
              {currentStep === 3 && 'Provide Location Details'}
              {currentStep === 4 && 'Review Report Summary'}
              {currentStep === 5 && 'Finalize & Submit Report'}
            </h2>
            {showSuccessMessage && (
              <div className="relative p-4 rounded-lg mb-6 flex items-center justify-between animate-fade-in-down" style={{ backgroundColor: currentColors.successBg, color: currentColors.successText, border: `1px solid ${currentColors.primary}` }}>
                <span>✅ Report submitted successfully! Redirecting...</span>
                <button onClick={() => setShowSuccessMessage(false)} className="text-xl" style={{ color: currentColors.successText }}>
                  <LucideIcons.XCircle size={20} />
                </button>
              </div>
            )}
            {error && (
              <div className="relative p-4 rounded-lg mb-6 flex items-center justify-between animate-fade-in-down" style={{ backgroundColor: currentColors.errorBg, color: currentColors.errorText, border: `1px solid ${currentColors.errorText}` }}>
                <span>🚨 <strong>Error:</strong> {error}</span>
                <button onClick={() => setError('')} className="text-xl" style={{ color: currentColors.errorText }}>
                  <LucideIcons.XCircle size={20} />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {renderCurrentFormStep()}

              <div className="flex justify-between mt-8">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBackStep}
                    className="px-6 py-3 rounded-full text-white font-bold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                    style={{
                      background: currentColors.textSecondary,
                      boxShadow: darkMode ? `0 0 15px rgba(255,255,255,0.1)` : `0 5px 15px rgba(0,0,0,0.1)`
                    }}
                  >
                    Back
                  </button>
                )}

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className={`px-8 py-3 rounded-full text-white font-bold text-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 ${currentStep === 1 ? 'ml-auto' : ''}`}
                    style={{
                      background: currentColors.buttonGradient,
                      boxShadow: darkMode ? `0 0 20px ${currentColors.glowPrimary}` : `0 5px 15px rgba(0, 123, 140, 0.3)`,
                    }}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 rounded-full text-white font-bold text-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                    style={{
                      background: submitting ? currentColors.primaryDark : currentColors.buttonGradient,
                      opacity: submitting ? 0.7 : 1,
                      boxShadow: darkMode ? `0 0 20px ${currentColors.glowPrimary}` : `0 5px 15px rgba(0, 123, 140, 0.3)`,
                    }}
                  >
                    {submitting ? "Submitting..." : "Submit Report"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </main>
      </div>
      <style>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

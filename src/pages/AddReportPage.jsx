import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, CheckCircle, HelpCircle, XCircle, ChevronRight, Image, Link, ListChecks, Loader2 } from 'lucide-react';
import { searchPlace, getAutoFillData } from '../utils/locationUtils';

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
  }
};

export default function AddReportPage() {
  const [type, setType] = useState('');
  const [comment, setComment] = useState('');
  const [imageFile, setImageFile] = useState(null);
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

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [manualLocationInput, setManualLocationInput] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { userId, initialLat, initialLng, isNgo, loggedInNgoId } = location.state || {};

  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

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
    { id: 1, name: 'Feature', icon: <CheckCircle size={16} /> },
    { id: 2, name: 'Details with Image', icon: <Image size={16} /> },
    { id: 3, name: 'Location Details', icon: <MapPin size={16} /> },
    { id: 4, name: 'Summary', icon: <ListChecks size={16} /> },
    { id: 5, name: 'Report', icon: <CheckCircle size={16} /> },
  ];

  useEffect(() => {
    if (!userId) return;
    setMongoUserId(userId);
  }, [userId]);

  // Function to autofill location data from coordinates
  const autofillLocationDetails = useCallback(async (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
    setIsSearchingLocation(true);
    try {
      const autoFillData = await getAutoFillData(lat, lng);
      // Only set if data is meaningful, otherwise keep empty to show placeholder
      setAddress(autoFillData.address && autoFillData.address !== 'Error fetching address' ? autoFillData.address : '');
      setCity(autoFillData.city && autoFillData.city !== 'Error' ? autoFillData.city : '');
      setDistrict(autoFillData.district && autoFillData.district !== 'Error' ? autoFillData.district : '');
      setPostalCode(autoFillData.postalCode && autoFillData.postalCode !== 'Error' ? autoFillData.postalCode : '');

      // For placeName, try to use a more specific part of the address, or keep empty
      if (!placeName && autoFillData.address && autoFillData.address !== 'Error fetching address') {
        // Attempt to extract something more specific than the full address for placeName
        const parts = autoFillData.address.split(', ');
        // Take the first part if it looks like a specific place, otherwise keep empty
        setPlaceName(parts[0] && !parts[0].match(/^\d+/) ? parts[0] : '');
      } else if (!placeName) {
        setPlaceName(''); // Ensure placeName is empty if autofill address is not meaningful
      }

      setError('');
    } catch (err) {
      console.error("Error autofilling location data:", err);
      setError("Failed to autofill location details. Please enter manually.");
      setAddress(''); // Clear on error
      setCity('');
      setDistrict('');
      setPostalCode('');
      setPlaceName('');
    } finally {
      setIsSearchingLocation(false);
    }
  }, [placeName]);

  // Effect to handle initial lat/lng or get current geolocation
  useEffect(() => {
    if (initialLat && initialLng) {
      autofillLocationDetails(initialLat, initialLng);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          autofillLocationDetails(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => console.warn("Geolocation failed:", err)
      );
    }
  }, [initialLat, initialLng, autofillLocationDetails]);

  // Handle place name input and debounce search for suggestions
  useEffect(() => {
    setLocationSuggestions([]);
    setError('');

    if (!manualLocationInput.trim()) {
      setIsSearchingLocation(false);
      return;
    }

    setIsSearchingLocation(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const results = await searchPlace(manualLocationInput);
        setLocationSuggestions(results);
      } catch (err) {
        console.error("Error fetching location suggestions:", err);
        setError("Failed to fetch location suggestions.");
        setLocationSuggestions([]);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [manualLocationInput]);

  // Handle selection from suggestions
  const handleSuggestionSelect = useCallback(async (suggestion) => {
    setLocationSuggestions([]);
    setManualLocationInput(suggestion.display_name);
    setPlaceName(suggestion.display_name); // Set placeName state from selected suggestion

    if (suggestion.lat && suggestion.lon) {
      autofillLocationDetails(parseFloat(suggestion.lat), parseFloat(suggestion.lon));
    } else {
      setError("Selected suggestion missing coordinates. Please try another.");
    }
  }, [autofillLocationDetails]);

  // Handle image upload to Cloudinary
  const handleImageUpload = async () => {
    if (!imageFile) return '';
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', uploadPreset);

    try {
      const res = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'Image upload failed');
      }
      const data = await res.json();
      return data.secure_url || '';
    } catch (err) {
      setError(`Image upload failed: ${err.message}`);
      return '';
    }
  };

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

    if (!latitude || !longitude) {
      setError("Location coordinates are missing. Please ensure a valid place name, address, or Google Maps link is provided.");
      setSubmitting(false);
      return;
    }

    try {
      const imageUrl = await handleImageUpload();

      const reportPayload = {
        type,
        comment,
        imageUrl,
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
      setType('');
      setComment('');
      setImageFile(null);
      setPlaceName('');
      setAddress('');
      setGoogleMapsLink('');
      setLatitude(null);
      setLongitude(null);
      setCity('');
      setDistrict('');
      setPostalCode('');
      setNotificationStatus('none');
      setManualLocationInput('');
      setLocationSuggestions([]);

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
    } else if (currentStep === 3) {
      if (!latitude || !longitude) {
        if (!placeName.trim() && !address.trim() && !googleMapsLink.trim()) {
          setError("Please provide a place name, address, or Google Maps link to determine location.");
          return;
        }
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
                <ChevronRight size={20} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90" style={{ color: currentColors.textSecondary }} />
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
                <HelpCircle size={18} className="absolute top-3 right-3" style={{ color: currentColors.textSecondary }} />
              </div>
            </div>
          </>
        );
      case 2: // Details with Image
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
                onChange={(e) => setImageFile(e.target.files[0])}
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
            </div>
          </>
        );
      case 3: // Location Details with Autofill/Suggestions
        return (
          <>
            <label className="block text-xs font-semibold uppercase mb-3" style={{ color: currentColors.textSecondary }}>
              Location Details
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative md:col-span-2">
                <input
                  type="text"
                  placeholder="Search for a place (e.g., 'Eiffel Tower', '123 Main St')"
                  value={manualLocationInput}
                  onChange={(e) => setManualLocationInput(e.target.value)}
                  onFocus={() => {
                      if (manualLocationInput.trim() && locationSuggestions.length === 0) {
                          const debounceTimer = setTimeout(async () => {
                              try {
                                  const results = await searchPlace(manualLocationInput);
                                  setLocationSuggestions(results);
                              } catch (err) {
                                  console.error("Error fetching location suggestions on focus:", err);
                              }
                          }, 100);
                          return () => clearTimeout(debounceTimer);
                      }
                  }}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75"
                  style={{
                    borderColor: currentColors.borderLight,
                    backgroundColor: currentColors.inputBg,
                    color: currentColors.textPrimary,
                    '--tw-ring-color': currentColors.primary,
                    boxShadow: darkMode ? `0 0 8px ${currentColors.glowPrimary}` : 'none'
                  }}
                />
                {isSearchingLocation && (
                  <Loader2 size={20} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin" style={{ color: currentColors.primary }} />
                )}
                {locationSuggestions.length > 0 && manualLocationInput.trim() && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto"
                      style={{ backgroundColor: currentColors.inputBg, borderColor: currentColors.borderLight }}>
                    {locationSuggestions.map((suggestion) => (
                      <li
                        key={suggestion.place_id}
                        className="p-3 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
                        style={{ borderColor: currentColors.borderLight, color: currentColors.textPrimary, '--tw-bg-hover': currentColors.backgroundMid }}
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        {suggestion.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <input
                type="text"
                placeholder="Place Name"
                value={getFieldValue(placeName)} // Use helper
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
                placeholder="Address"
                value={getFieldValue(address)} // Use helper
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
                value={getFieldValue(city)} // Use helper
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
                value={getFieldValue(district)} // Use helper
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
                value={getFieldValue(postalCode)} // Use helper
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
                <HelpCircle size={18} className="absolute top-3 right-3" style={{ color: currentColors.textSecondary }} />
                <p className="text-xs mt-1" style={{ color: currentColors.textSecondary }}>
                  Providing a Google Maps link helps us pinpoint the exact location.
                </p>
              </div>
            </div>
            {latitude && longitude && (
              <div className="text-sm mt-4 flex items-center p-3 rounded-lg border" style={{ color: currentColors.textSecondary, borderColor: currentColors.borderLight, backgroundColor: currentColors.backgroundMid }}>
                <MapPin className="mr-2" size={18} style={{ color: currentColors.primary }} />
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
                    '--tw-ring-color': currentColors.primary,
                    boxShadow: darkMode ? `0 0 8px ${currentColors.glowPrimary}` : 'none'
                  }}
                >
                  <option value="none">None</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                </select>
                <ChevronRight size={20} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90" style={{ color: currentColors.textSecondary }} />
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
                      {currentStep > step.id ? <CheckCircle size={16} /> : step.id}
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
              {currentStep === 2 && 'Add Image (Optional)'}
              {currentStep === 3 && 'Provide Location Details'}
              {currentStep === 4 && 'Review Report Summary'}
              {currentStep === 5 && 'Finalize & Submit Report'}
            </h2>
            {showSuccessMessage && (
              <div className="relative p-4 rounded-lg mb-6 flex items-center justify-between animate-fade-in-down" style={{ backgroundColor: currentColors.successBg, color: currentColors.successText, border: `1px solid ${currentColors.primary}` }}>
                <span>✅ Report submitted successfully! Redirecting...</span>
                <button onClick={() => setShowSuccessMessage(false)} className="text-xl" style={{ color: currentColors.successText }}>
                  <XCircle size={20} />
                </button>
              </div>
            )}
            {error && (
              <div className="relative p-4 rounded-lg mb-6 flex items-center justify-between animate-fade-in-down" style={{ backgroundColor: currentColors.errorBg, color: currentColors.errorText, border: `1px solid ${currentColors.errorText}` }}>
                <span>🚨 <strong>Error:</strong> {error}</span>
                <button onClick={() => setError('')} className="text-xl" style={{ color: currentColors.errorText }}>
                  <XCircle size={20} />
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
                    className={`px-8 py-3 rounded-full text-white font-bold text-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 ${currentStep === 1 && 'ml-auto'}`}
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
      <style jsx>{`
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

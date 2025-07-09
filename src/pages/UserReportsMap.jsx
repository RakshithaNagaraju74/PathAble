// File: src/pages/UserReportsMap.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css'; // Import Leaflet Draw CSS
import 'leaflet-draw'; // Import Leaflet Draw JS

// Fix for default Leaflet icon paths
// Wrap the expression in parentheses to satisfy ESLint's no-unused-expressions rule
(L.Icon.Default.prototype._get='iconUrl'); // Changed from delete to assignment, as it's typically setting a property
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Map report types to Lucide icons (or similar visual cues)
const reportTypeIcons = {
  ramp: '♿', // Wheelchair emoji
  restroom: '🚻', // Restroom emoji
  elevator: '⬆️⬇️', // Up-down arrow emoji
  parking: '🅿️', // Parking emoji
  entrance: '🚪', // Door emoji
  pathway: '🚶', // Person walking emoji
  other: '📍', // Pin emoji
};

const UserReportsMap = ({ userReports, allReports, zones, userId, currentColors, darkMode }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const featureGroupRef = useRef(null); // Ref for reports FeatureGroup
  const zoneLayerGroupRef = useRef(null); // Ref for zones LayerGroup

  // Memoized custom icon creation for reports
  const createCustomIcon = useCallback((type) => {
    // Ensure currentColors is defined before using its properties
    const bgColor = currentColors?.primaryBrand || '#6A0DAD'; // Default if undefined
    const textColor = currentColors?.cardBackground || '#FFFFFF';
    const borderColor = currentColors?.secondaryAccent || '#FFD700';
    const shadowColor = currentColors?.shadowBase || 'rgba(0,0,0,0.3)';

    return L.divIcon({
      html: `<div style="
        background-color: ${bgColor};
        color: ${textColor};
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        font-size: 18px;
        font-weight: bold;
        border: 2px solid ${borderColor};
        box-shadow: 0 4px 8px ${shadowColor};
        transform: rotate(45deg); /* Rotate the container */
      ">
        <span style="transform: rotate(-45deg);">${reportTypeIcons[type] || '📍'}</span>
      </div>`,
      className: 'custom-div-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
  }, [currentColors]);


  useEffect(() => {
    // Initialize map only once
    if (!mapInstanceRef.current && mapContainerRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [20.5937, 78.9629], // Center of India
        zoom: 5,
        zoomControl: false, // Will add custom zoom control
        attributionControl: false, // Will add custom attribution
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      // Add custom zoom control
      L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);

      // Add custom attribution control
      L.control.attribution({ position: 'bottomleft', prefix: false })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors')
        .addTo(mapInstanceRef.current);

      featureGroupRef.current = L.featureGroup().addTo(mapInstanceRef.current);
      zoneLayerGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current); // Initialize zone layer group
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    featureGroupRef.current.clearLayers(); // Clear existing markers
    zoneLayerGroupRef.current.clearLayers(); // Clear existing zones

    // Add markers for user's reports
    userReports.forEach(report => {
      // ADDED: Check for valid latitude and longitude
      if (typeof report.latitude === 'number' && typeof report.longitude === 'number' &&
          !isNaN(report.latitude) && !isNaN(report.longitude)) {
        const marker = L.marker([report.latitude, report.longitude], {
          icon: createCustomIcon(report.type)
        }).bindPopup(`
          <div style="color: ${currentColors?.textPrimary || '#333333'};">
            <b>${report.placeName || 'N/A'}</b><br/>
            Type: ${report.type}<br/>
            Comment: ${report.comment}<br/>
            Reported by: ${report.userName || 'Anonymous'}<br/>
            Timestamp: ${new Date(report.timestamp).toLocaleString()}
            ${report.imageUrl ? `<br/><img src="${report.imageUrl}" alt="Report Image" style="width:100%; max-height:100px; object-fit:cover; margin-top:5px;"/>` : ''}
            ${report.verifiedByNgos && report.verifiedByNgos.length > 0 ? `<br/><span style="color:${currentColors?.successText || '#155724'}; font-weight:bold;">Verified by ${report.verifiedByNgos.length} NGO(s)</span>` : ''}
            ${report.markedAsSpamByNgos && report.markedAsSpamByNgos.length > 0 ? `<br/><span style="color:${currentColors?.errorText || '#DC2626'}; font-weight:bold;">Marked as Spam by ${report.markedAsSpamByNgos.length} NGO(s)</span>` : ''}
          </div>
        `);
        featureGroupRef.current.addLayer(marker);
      } else {
        console.warn(`Skipping report due to invalid coordinates:`, report);
      }
    });

    // Add zones
    if (zones && zoneLayerGroupRef.current) {
      zones.forEach(zone => {
        // Corrected access to zone.coordinates and added array checks
        if (zone.coordinates && Array.isArray(zone.coordinates) && zone.coordinates.length > 0 && Array.isArray(zone.coordinates[0])) {
          // GeoJSON Polygon coordinates are typically an array of rings, e.g., [[[lng, lat], [lng, lat], ...]]
          // Leaflet Polygon expects an array of lat/lng arrays: [[lat, lng], [lat, lng], ...]
          // So, we need to transform the GeoJSON coordinates from [lng, lat] to [lat, lng]
          const leafletCoordinates = zone.coordinates[0].map(coord => [coord[1], coord[0]]);

          const polygon = L.polygon(leafletCoordinates, {
            color: currentColors?.zoneBorder || '#6A0DAD', // Add nullish coalescing
            fillColor: currentColors?.zoneFill || 'rgba(106, 13, 173, 0.3)', // Add nullish coalescing
            weight: 2,
            opacity: 0.7,
            fillOpacity: 0.3,
          }).bindPopup(`<b>${zone.name}</b><br/>NGO ID: ${zone.ngoId}`);
          zoneLayerGroupRef.current.addLayer(polygon);
        }
      });
    }


    // Fit map to markers and zones if any exist
    const allLayers = featureGroupRef.current.getLayers().concat(zoneLayerGroupRef.current.getLayers());
    if (allLayers.length > 0) {
      const bounds = L.featureGroup(allLayers).getBounds();
      if (bounds.isValid()) { // Check if bounds are valid before fitting
        map.fitBounds(bounds, { padding: [50, 50] });
      } else {
        map.setView([20.5937, 78.9629], 5); // Fallback if bounds are invalid
      }
    } else {
      // If no markers or zones, reset to default center/zoom
      map.setView([20.5937, 78.9629], 5);
    }

    // Cleanup function
    return () => {
      // No need to remove map instance, as it's managed by mapInstanceRef.current
      // Clear layers when component unmounts or dependencies change
      if (mapInstanceRef.current) {
        featureGroupRef.current.clearLayers();
        zoneLayerGroupRef.current.clearLayers();
      }
    };
  }, [userReports, allReports, zones, userId, createCustomIcon, currentColors]); // Added zones to dependencies

  return (
    <div
      ref={mapContainerRef}
      style={{
        height: '500px',
        width: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: currentColors ? `0 4px 15px ${currentColors.shadowBase}` : 'none',
        border: currentColors ? `1px solid ${currentColors.borderSubtle}` : 'none',
      }}
      aria-label="Map displaying user's reported locations and accessibility zones"
    />
  );
};

export default UserReportsMap;
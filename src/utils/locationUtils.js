// 📁 src/utils/locationUtils.js

/**
 * @file This file contains utility functions for location-based services,
 * including geocoding (forward and reverse) and fetching accessibility data
 * from OpenStreetMap using Nominatim and Overpass APIs, and GeoNames for
 * city/postal code details.
 */

// IMPORTANT: For GeoNames API, a username is required. 'demo' is used here for demonstration.
// For production, you should register for a free account at geonames.org and use your own username.
// Alternatively, consider proxying these requests through a backend to hide API keys or sensitive info.

// 🔍 Forward Geocoding (Place Search using Nominatim)
/**
 * Searches for a place using the Nominatim OpenStreetMap API.
 * @param {string} query - The search query (e.g., "Eiffel Tower", "1600 Amphitheatre Parkway").
 * @returns {Promise<Array>} A promise that resolves to an array of place objects.
 */
export async function searchPlace(query) {
  try {
    // Increased limit to 10 and added &dedupe=1 for more distinct results
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&accept-language=en&addressdetails=1&limit=10&dedupe=1`);
    if (!res.ok) {
      throw new Error(`Nominatim search failed with status: ${res.status}`);
    }
    const results = await res.json();
    return results;
  } catch (error) {
    console.error("Error in searchPlace (Nominatim):", error);
    return []; // Return empty array on error
  }
}

// 📍 Reverse Geocoding (lat, lng → address)
/**
 * Performs reverse geocoding to get an address from latitude and longitude using Nominatim.
 * @param {number} lat - The latitude.
 * @param {number} lon - The longitude.
 * @returns {Promise<string>} A promise that resolves to the display name (address) of the location.
 */
export async function reverseGeocode(lat, lon) {
  try {
    // Added &accept-language=en for English results
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`);
    if (!res.ok) {
      throw new Error(`Nominatim reverse geocode failed with status: ${res.status}`);
    }
    const data = await res.json();
    return data.display_name || 'Address not found';
  } catch (error) {
    console.error("Error in reverseGeocode (Nominatim):", error);
    return 'Error fetching address';
  }
}

// ♿ Fetch accessible places from OpenStreetMap (Overpass API)
/**
 * Fetches accessible places (wheelchair="yes") within a specified bounding box using Overpass API.
 * @param {Array<number>} bbox - Bounding box coordinates [south, west, north, east]. Default is a small area in Bengaluru.
 * @returns {Promise<Array>} A promise that resolves to an array of accessible place elements.
 */
export async function fetchAccessiblePlaces(bbox = [12.95, 77.55, 13.00, 77.60]) {
  const query = `
    [out:json];
    node["wheelchair"="yes"](${bbox.join(',')});
    out body;
  `;

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded' // Required for Overpass API POST requests
      },
      body: query,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Overpass API failed with status: ${res.status}, response: ${errorText}`);
    }

    const data = await res.json();
    return data.elements || [];
  } catch (error) {
    console.error("Error in fetchAccessiblePlaces (Overpass API):", error);
    return []; // Return empty array on error
  }
}

// 🌐 GeoNames: Get City and District
/**
 * Gets city and district information from latitude and longitude using GeoNames API.
 * A GeoNames username is required. 'demo' is used for demonstration purposes.
 * @param {number} lat - The latitude.
 * @param {number} lng - The longitude.
 * @param {string} username - Your GeoNames API username.
 * @returns {Promise<{city: string, district: string}>} A promise that resolves to an object with city and district.
 */
export async function getCityDistrict(lat, lng, username = 'demo') {
  try {
    // GeoNames API often returns administrative names in local script.
    // There isn't a direct 'accept-language' parameter like Nominatim for these specific endpoints.
    const res = await fetch(
      `http://api.geonames.org/countrySubdivisionJSON?lat=${lat}&lng=${lng}&username=${username}`
    );
    if (!res.ok) {
      throw new Error(`GeoNames city/district API failed with status: ${res.status}`);
    }
    const data = await res.json();
    return {
      city: data.adminName2 || 'N/A',
      district: data.adminName1 || 'N/A',
    };
  } catch (error) {
    console.error("Error in getCityDistrict (GeoNames):", error);
    return { city: 'Error', district: 'Error' };
  }
}

// 📮 GeoNames: Get Postal Code
/**
 * Gets postal code from latitude and longitude using GeoNames API.
 * A GeoNames username is required. 'demo' is used for demonstration purposes.
 * @param {number} lat - The latitude.
 * @param {number} lng - The longitude.
 * @param {string} username - Your GeoNames API username.
 * @returns {Promise<string>} A promise that resolves to the postal code.
 */
export async function getPostalCode(lat, lng, username = 'demo') {
  try {
    // GeoNames API often returns administrative names in local script.
    // There isn't a direct 'accept-language' parameter like Nominatim for these specific endpoints.
    const res = await fetch(
      `http://api.geonames.org/findNearbyPostalCodesJSON?lat=${lat}&lng=${lng}&username=${username}`
    );
    if (!res.ok) {
      throw new Error(`GeoNames postal code API failed with status: ${res.status}`);
    }
    const data = await res.json();
    return data.postalCodes?.[0]?.postalCode || 'N/A';
  } catch (error) {
    console.error("Error in getPostalCode (GeoNames):", error);
    return 'Error';
  }
}

// 🧠 Combined: Autofill Report Data
/**
 * Combines reverse geocoding and GeoNames lookups to get comprehensive autofill data for a report.
 * @param {number} lat - The latitude.
 * @param {number} lng - The longitude.
 * @param {string} username - Your GeoNames API username (optional, defaults to 'demo').
 * @returns {Promise<{address: string, city: string, district: string, postalCode: string}>}
 * A promise that resolves to an object containing address, city, district, and postal code.
 */
export async function getAutoFillData(lat, lng, username = 'demo') {
  try {
    const [address, { city, district }, postalCode] = await Promise.all([
      reverseGeocode(lat, lng),
      getCityDistrict(lat, lng, username),
      getPostalCode(lat, lng, username),
    ]);

    return {
      address,
      city,
      district,
      postalCode,
    };
  } catch (error) {
    console.error("Error in getAutoFillData:", error);
    return {
      address: 'Error fetching address',
      city: 'Error',
      district: 'Error',
      postalCode: 'Error',
    };
  }
}

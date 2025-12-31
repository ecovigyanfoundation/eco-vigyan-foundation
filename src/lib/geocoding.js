/**
 * Geocode a city name to coordinates using Nominatim (OpenStreetMap)
 * @param {string} cityName - The city name to geocode
 * @returns {Promise<{latitude: number, longitude: number} | null>}
 */
export async function geocodeCity(cityName) {
  try {
    if (!cityName || cityName.trim().length === 0) {
      return null;
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        cityName.trim()
      )}&limit=1`,
      {
        headers: {
          "User-Agent": "EcoVigyan/1.0", // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      throw new Error("Geocoding service unavailable");
    }

    const data = await response.json();

    if (data && data.length > 0 && data[0].lat && data[0].lon) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Get city boundary (polygon) using Nominatim with polygon_geojson
 * @param {string} cityName - The city name to get boundary for
 * @returns {Promise<{center: {lat: number, lng: number}, boundary: Array<Array<[lng, lat]>>} | null>}
 */
export async function getCityBoundary(cityName) {
  try {
    if (!cityName || cityName.trim().length === 0) {
      return null;
    }

    // First, search for the place to get OSM ID
    const searchResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        cityName.trim()
      )}&limit=1&addressdetails=1`,
      {
        headers: {
          "User-Agent": "EcoVigyan/1.0",
        },
      }
    );

    if (!searchResponse.ok) {
      throw new Error("Geocoding service unavailable");
    }

    const searchData = await searchResponse.json();

    if (!searchData || searchData.length === 0) {
      return null;
    }

    const place = searchData[0];
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    const osmId = place.osm_id;
    const osmType = place.osm_type; // node, way, or relation

    // Try to get detailed boundary using lookup API with polygon_geojson
    let boundary = null;
    
    if (osmId && osmType) {
      try {
        const lookupResponse = await fetch(
          `https://nominatim.openstreetmap.org/lookup?format=json&osm_ids=${osmType[0].toUpperCase()}${osmId}&polygon_geojson=1`,
          {
            headers: {
              "User-Agent": "EcoVigyan/1.0",
            },
          }
        );

        if (lookupResponse.ok) {
          const lookupData = await lookupResponse.json();
          if (lookupData && lookupData.length > 0) {
            const detailedPlace = lookupData[0];
            if (detailedPlace.geojson) {
              if (detailedPlace.geojson.type === "Polygon") {
                boundary = detailedPlace.geojson.coordinates[0].map((coord) => [coord[0], coord[1]]);
              } else if (detailedPlace.geojson.type === "MultiPolygon") {
                // Use the largest polygon from MultiPolygon
                let largestPolygon = detailedPlace.geojson.coordinates[0][0];
                let maxArea = 0;
                detailedPlace.geojson.coordinates.forEach((polygon) => {
                  const area = polygon[0].length;
                  if (area > maxArea) {
                    maxArea = area;
                    largestPolygon = polygon[0];
                  }
                });
                boundary = largestPolygon.map((coord) => [coord[0], coord[1]]);
              }
            }
          }
        }
      } catch (lookupError) {
        console.warn("Lookup API failed, using fallback:", lookupError);
      }
    }

    // Fallback: use bounding box if polygon not available
    if (!boundary && place.boundingbox) {
      const [minLat, maxLat, minLng, maxLng] = place.boundingbox.map(parseFloat);
      boundary = [
        [minLng, minLat],
        [maxLng, minLat],
        [maxLng, maxLat],
        [minLng, maxLat],
        [minLng, minLat], // Close the polygon
      ];
    }

    if (boundary) {
      return {
        center: { lat, lng },
        boundary,
        name: place.display_name,
        type: "city",
      };
    }

    return null;
  } catch (error) {
    console.error("City boundary error:", error);
    return null;
  }
}

/**
 * Generate a circular boundary
 * @param {number} centerLat - Center latitude
 * @param {number} centerLng - Center longitude
 * @param {number} radiusKm - Radius in kilometers
 * @returns {Array<Array<number>>} Array of [lng, lat] coordinates
 */
export function generateCircleBoundary(centerLat, centerLng, radiusKm) {
  const points = 64; // Number of points to approximate circle
  const boundary = [];
  
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    // Convert km to degrees (approximate: 1 degree ≈ 111 km)
    const latOffset = (radiusKm / 111) * Math.cos(angle);
    const lngOffset = (radiusKm / (111 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle);
    
    boundary.push([
      centerLng + lngOffset,
      centerLat + latOffset,
    ]);
  }
  
  return boundary;
}

/**
 * Generate a rectangular boundary
 * @param {number} centerLat - Center latitude
 * @param {number} centerLng - Center longitude
 * @param {number} widthKm - Width in kilometers
 * @param {number} heightKm - Height in kilometers
 * @returns {Array<Array<number>>} Array of [lng, lat] coordinates
 */
export function generateRectangleBoundary(centerLat, centerLng, widthKm, heightKm) {
  // Convert km to degrees
  const latOffset = heightKm / 2 / 111;
  const lngOffset = widthKm / 2 / (111 * Math.cos(centerLat * Math.PI / 180));
  
  return [
    [centerLng - lngOffset, centerLat - latOffset], // Bottom-left
    [centerLng + lngOffset, centerLat - latOffset], // Bottom-right
    [centerLng + lngOffset, centerLat + latOffset], // Top-right
    [centerLng - lngOffset, centerLat + latOffset], // Top-left
    [centerLng - lngOffset, centerLat - latOffset], // Close polygon
  ];
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 * @param {number} lat - Latitude of the point
 * @param {number} lng - Longitude of the point
 * @param {Array<Array<number>>} polygon - Array of [lng, lat] coordinates
 * @returns {boolean}
 */
export function isPointInPolygon(lat, lng, polygon) {
  if (!polygon || polygon.length < 3) return false;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]; // xi = lng, yi = lat
    const [xj, yj] = polygon[j]; // xj = lng, yj = lat

    // Check if ray crosses edge: compare latitudes (y-coordinates)
    const intersect =
      yi > lat !== yj > lat && // Ray crosses the edge in latitude
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi; // Intersection point is to the left
    if (intersect) inside = !inside;
  }

  return inside;
}











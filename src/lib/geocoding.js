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










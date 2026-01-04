/**
 * Utility functions for saving and loading trails
 * Uses MongoDB via API with localStorage as fallback
 */

const TRAIL_STORAGE_KEY = 'eco-vigyan-saved-trails';

/**
 * Save a trail to MongoDB (or localStorage as fallback)
 * @param {Object} trailData - Trail data to save
 * @returns {Promise<string|null>} - Trail ID
 */
export async function saveTrail(trailData) {
  try {
    // Try to save to MongoDB first
    try {
      const isUpdate = trailData.id && trailData.id.startsWith('trail-') === false; // MongoDB ObjectId
      
      const url = isUpdate 
        ? `/api/trails/${trailData.id}`
        : '/api/trails';
      
      const method = isUpdate ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: trailData.name || `Trail ${new Date().toLocaleDateString()}`,
          location: trailData.location || {},
          mushrooms: trailData.mushrooms || [],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const trailId = data.trail?._id || data.trail?.id;
        
        // Also save to localStorage as backup
        if (trailId) {
          saveToLocalStorage({
            id: trailId,
            name: data.trail.name,
            location: data.trail.location,
            mushrooms: data.trail.mushrooms,
            createdAt: data.trail.createdAt || new Date().toISOString(),
            updatedAt: data.trail.updatedAt || new Date().toISOString(),
          });
        }
        
        return trailId;
      } else if (response.status === 401) {
        // User not authenticated, fall back to localStorage
        console.log('User not authenticated, saving to localStorage');
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    } catch (apiError) {
      console.log('API save failed, using localStorage fallback:', apiError);
    }

    // Fallback to localStorage
    const trails = getSavedTrailsFromLocalStorage();
    const trailId = trailData.id || `trail-${Date.now()}`;
    const trailToSave = {
      id: trailId,
      name: trailData.name || `Trail ${new Date().toLocaleDateString()}`,
      location: trailData.location || {},
      mushrooms: trailData.mushrooms || [],
      createdAt: trailData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Check if trail with this ID exists, update it, otherwise add new
    const existingIndex = trails.findIndex(t => t.id === trailId);
    if (existingIndex >= 0) {
      trails[existingIndex] = trailToSave;
    } else {
      trails.push(trailToSave);
    }
    
    localStorage.setItem(TRAIL_STORAGE_KEY, JSON.stringify(trails));
    return trailId;
  } catch (error) {
    console.error('Error saving trail:', error);
    return null;
  }
}

/**
 * Get all saved trails from MongoDB (or localStorage as fallback)
 * @returns {Promise<Array>} - Array of saved trails
 */
export async function getSavedTrails() {
  try {
    // Try to get from MongoDB first
    try {
      const response = await fetch('/api/trails', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const trails = data.trails || [];
        
        // Normalize trail data format
        const normalizedTrails = trails.map(trail => ({
          id: trail._id || trail.id,
          name: trail.name,
          location: trail.location || {},
          mushrooms: trail.mushrooms || [],
          createdAt: trail.createdAt || trail.createdAt,
          updatedAt: trail.updatedAt || trail.updatedAt,
        }));
        
        // Also sync to localStorage
        if (normalizedTrails.length > 0) {
          localStorage.setItem(TRAIL_STORAGE_KEY, JSON.stringify(normalizedTrails));
        }
        
        return normalizedTrails;
      } else if (response.status === 401) {
        // User not authenticated, fall back to localStorage
        console.log('User not authenticated, loading from localStorage');
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    } catch (apiError) {
      console.log('API load failed, using localStorage fallback:', apiError);
    }

    // Fallback to localStorage
    return getSavedTrailsFromLocalStorage();
  } catch (error) {
    console.error('Error loading trails:', error);
    return [];
  }
}

/**
 * Get all saved trails from localStorage only
 * @returns {Array} - Array of saved trails
 */
function getSavedTrailsFromLocalStorage() {
  try {
    const stored = localStorage.getItem(TRAIL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading trails from localStorage:', error);
    return [];
  }
}

/**
 * Save a trail to localStorage only
 * @param {Object} trailData - Trail data to save
 */
function saveToLocalStorage(trailData) {
  try {
    const trails = getSavedTrailsFromLocalStorage();
    const existingIndex = trails.findIndex(t => t.id === trailData.id);
    if (existingIndex >= 0) {
      trails[existingIndex] = trailData;
    } else {
      trails.push(trailData);
    }
    localStorage.setItem(TRAIL_STORAGE_KEY, JSON.stringify(trails));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Get a specific trail by ID
 * @param {string} trailId - Trail ID
 * @returns {Promise<Object|null>} - Trail data
 */
export async function getTrail(trailId) {
  try {
    // Try to get from MongoDB first
    try {
      const response = await fetch(`/api/trails/${trailId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const trail = data.trail;
        if (trail) {
          return {
            id: trail._id || trail.id,
            name: trail.name,
            location: trail.location || {},
            mushrooms: trail.mushrooms || [],
            createdAt: trail.createdAt,
            updatedAt: trail.updatedAt,
          };
        }
      } else if (response.status === 401) {
        // User not authenticated, fall back to localStorage
        console.log('User not authenticated, loading from localStorage');
      }
    } catch (apiError) {
      console.log('API get failed, using localStorage fallback:', apiError);
    }

    // Fallback to localStorage
    const trails = getSavedTrailsFromLocalStorage();
    return trails.find(t => t.id === trailId) || null;
  } catch (error) {
    console.error('Error getting trail:', error);
    return null;
  }
}

/**
 * Delete a trail
 * @param {string} trailId - Trail ID to delete
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteTrail(trailId) {
  try {
    // Try to delete from MongoDB first
    try {
      // Check if it's a MongoDB ObjectId (not a localStorage ID)
      const isMongoId = trailId && !trailId.startsWith('trail-') && trailId.length === 24;
      
      if (isMongoId) {
        const response = await fetch(`/api/trails/${trailId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          // Also remove from localStorage
          const trails = getSavedTrailsFromLocalStorage();
          const filtered = trails.filter(t => t.id !== trailId);
          localStorage.setItem(TRAIL_STORAGE_KEY, JSON.stringify(filtered));
          return true;
        } else if (response.status === 401) {
          // User not authenticated, fall back to localStorage
          console.log('User not authenticated, deleting from localStorage');
        }
      }
    } catch (apiError) {
      console.log('API delete failed, using localStorage fallback:', apiError);
    }

    // Fallback to localStorage
    const trails = getSavedTrailsFromLocalStorage();
    const filtered = trails.filter(t => t.id !== trailId);
    localStorage.setItem(TRAIL_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting trail:', error);
    return false;
  }
}


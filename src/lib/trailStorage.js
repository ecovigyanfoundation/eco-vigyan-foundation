/**
 * Utility functions for saving and loading trails
 */

const TRAIL_STORAGE_KEY = 'eco-vigyan-saved-trails';

/**
 * Save a trail to localStorage
 * @param {Object} trailData - Trail data to save
 * @returns {string} - Trail ID
 */
export function saveTrail(trailData) {
  try {
    const trails = getSavedTrails();
    const trailId = trailData.id || `trail-${Date.now()}`;
    const trailToSave = {
      id: trailId,
      name: trailData.name || `Trail ${new Date().toLocaleDateString()}`,
      location: trailData.location,
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
 * Get all saved trails
 * @returns {Array} - Array of saved trails
 */
export function getSavedTrails() {
  try {
    const stored = localStorage.getItem(TRAIL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading trails:', error);
    return [];
  }
}

/**
 * Get a specific trail by ID
 * @param {string} trailId - Trail ID
 * @returns {Object|null} - Trail data
 */
export function getTrail(trailId) {
  try {
    const trails = getSavedTrails();
    return trails.find(t => t.id === trailId) || null;
  } catch (error) {
    console.error('Error getting trail:', error);
    return null;
  }
}

/**
 * Delete a trail
 * @param {string} trailId - Trail ID to delete
 * @returns {boolean} - Success status
 */
export function deleteTrail(trailId) {
  try {
    const trails = getSavedTrails();
    const filtered = trails.filter(t => t.id !== trailId);
    localStorage.setItem(TRAIL_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting trail:', error);
    return false;
  }
}


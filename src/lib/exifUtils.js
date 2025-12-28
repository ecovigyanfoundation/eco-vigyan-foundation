import exifr from "exifr";

/**
 * Extract GPS coordinates and date/time from image EXIF data
 * @param {File} file - The image file
 * @returns {Promise<{gps: {latitude: number, longitude: number} | null, dateTime: Date | null}>}
 */
export async function extractExifData(file) {
  try {
    if (!file || !(file instanceof File)) {
      return { gps: null, dateTime: null };
    }

    // Read EXIF data - exifr can parse File objects directly
    // Include all EXIF segments to ensure we capture camera metadata (especially from mobile cameras)
    const exifData = await exifr.parse(file, {
      gps: true,        // GPS coordinates
      exif: true,       // EXIF data
      ifd0: true,       // Image file directory 0 (basic image info)
      ifd1: true,       // Image file directory 1 (thumbnail info)
      translateKeys: false, // Keep original key names
    });

    if (!exifData) {
      return { gps: null, dateTime: null };
    }

    // Extract GPS coordinates
    let gps = null;
    if (exifData.latitude && exifData.longitude) {
      gps = {
        latitude: exifData.latitude,
        longitude: exifData.longitude,
      };
    } else if (exifData.GPSLatitude && exifData.GPSLongitude) {
      // Handle different EXIF formats
      const lat = convertDMSToDD(
        exifData.GPSLatitude,
        exifData.GPSLatitudeRef
      );
      const lng = convertDMSToDD(
        exifData.GPSLongitude,
        exifData.GPSLongitudeRef
      );
      if (lat && lng) {
        gps = { latitude: lat, longitude: lng };
      }
    }

    // Extract date/time
    let dateTime = null;
    if (exifData.DateTimeOriginal) {
      dateTime = new Date(exifData.DateTimeOriginal);
    } else if (exifData.DateTime) {
      dateTime = new Date(exifData.DateTime);
    } else if (exifData.CreateDate) {
      dateTime = new Date(exifData.CreateDate);
    } else if (exifData.ModifyDate) {
      dateTime = new Date(exifData.ModifyDate);
    }

    // Validate date
    if (dateTime && (isNaN(dateTime.getTime()) || dateTime.getFullYear() < 2000)) {
      dateTime = null;
    }

    return { gps, dateTime };
  } catch (error) {
    console.error("Error extracting EXIF data:", error);
    return { gps: null, dateTime: null };
  }
}

/**
 * Convert DMS (Degrees, Minutes, Seconds) to Decimal Degrees
 */
function convertDMSToDD(dms, ref) {
  if (!dms || !Array.isArray(dms) || dms.length < 3) {
    return null;
  }

  let dd = dms[0] + dms[1] / 60 + dms[2] / (60 * 60);
  if (ref === "S" || ref === "W") {
    dd = dd * -1;
  }
  return dd;
}


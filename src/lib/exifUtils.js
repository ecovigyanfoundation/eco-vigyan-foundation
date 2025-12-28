import exifr from "exifr";

/**
 * Extract GPS coordinates and date/time from image EXIF data
 * @param {File} file - The image file
 * @returns {Promise<{gps: {latitude: number, longitude: number} | null, dateTime: Date | null}>}
 */
export async function extractExifData(file) {
  try {
    if (!file || !(file instanceof File)) {
      console.log("extractExifData: Invalid file object");
      return { gps: null, dateTime: null };
    }

    console.log("extractExifData: Processing file", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Read EXIF data - exifr can parse File objects directly
    // Include all EXIF segments to ensure we capture camera metadata (especially from mobile cameras)
    const exifData = await exifr.parse(file, {
      gps: true,        // GPS coordinates
      exif: true,       // EXIF data
      ifd0: true,       // Image file directory 0 (basic image info)
      ifd1: true,       // Image file directory 1 (thumbnail info)
      translateKeys: false, // Keep original key names
      silent: false,    // Show warnings
    });

    console.log("extractExifData: Raw EXIF data", exifData);

    if (!exifData || Object.keys(exifData).length === 0) {
      console.log("extractExifData: No EXIF data found");
      return { gps: null, dateTime: null };
    }

    // Extract GPS coordinates - try multiple formats
    let gps = null;
    
    // Method 1: Direct latitude/longitude (exifr sometimes provides these)
    if (exifData.latitude !== undefined && exifData.longitude !== undefined) {
      gps = {
        latitude: Number(exifData.latitude),
        longitude: Number(exifData.longitude),
      };
      console.log("extractExifData: Found GPS via direct lat/lng", gps);
    } 
    // Method 2: GPSLatitude/GPSLongitude (standard EXIF format)
    else if (exifData.GPSLatitude && exifData.GPSLongitude) {
      const lat = convertDMSToDD(
        exifData.GPSLatitude,
        exifData.GPSLatitudeRef
      );
      const lng = convertDMSToDD(
        exifData.GPSLongitude,
        exifData.GPSLongitudeRef
      );
      if (lat !== null && lng !== null) {
        gps = { latitude: lat, longitude: lng };
        console.log("extractExifData: Found GPS via DMS conversion", gps);
      }
    }
    // Method 3: Check for GPSInfo object
    else if (exifData.GPSInfo) {
      const gpsInfo = exifData.GPSInfo;
      if (gpsInfo.GPSLatitude && gpsInfo.GPSLongitude) {
        const lat = convertDMSToDD(
          gpsInfo.GPSLatitude,
          gpsInfo.GPSLatitudeRef
        );
        const lng = convertDMSToDD(
          gpsInfo.GPSLongitude,
          gpsInfo.GPSLongitudeRef
        );
        if (lat !== null && lng !== null) {
          gps = { latitude: lat, longitude: lng };
          console.log("extractExifData: Found GPS via GPSInfo", gps);
        }
      }
    }

    if (!gps) {
      console.log("extractExifData: No GPS coordinates found in EXIF");
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


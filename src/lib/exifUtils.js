import exifr from "exifr";

/**
 * Extract GPS coordinates and date/time from image EXIF data
 * @param {File|ArrayBuffer} fileOrBuffer - The image file or ArrayBuffer
 * @param {File} originalFile - Optional original file for metadata
 * @returns {Promise<{gps: {latitude: number, longitude: number} | null, dateTime: Date | null}>}
 */
export async function extractExifData(fileOrBuffer, originalFile = null) {
  try {
    if (!fileOrBuffer) {
      console.log("extractExifData: No file or buffer provided");
      return { gps: null, dateTime: null };
    }

    const file = originalFile || fileOrBuffer;
    const fileInfo = file instanceof File ? {
      name: file.name,
      type: file.type,
      size: file.size,
    } : {
      type: "ArrayBuffer",
      size: fileOrBuffer.byteLength,
    };

    console.log("extractExifData: Processing", fileInfo);

    // Read EXIF data - exifr can parse File objects, ArrayBuffers, or Blobs
    // Using ArrayBuffer preserves all binary data including EXIF (important for mobile)
    // Try with comprehensive options first
    let exifData = await exifr.parse(fileOrBuffer, {
      gps: true,        // GPS coordinates
      exif: true,       // EXIF data
      ifd0: true,       // Image file directory 0 (basic image info)
      ifd1: true,       // Image file directory 1 (thumbnail info)
      translateKeys: false, // Keep original key names
      silent: false,    // Show warnings
      reviveValues: false, // Don't convert values automatically
    });

    // If no data found, try with translated keys (sometimes exifr works better with this)
    if (!exifData) {
      console.log("extractExifData: Trying with translated keys...");
      exifData = await exifr.parse(fileOrBuffer, {
        gps: true,
        exif: true,
        translateKeys: true, // Try with translated keys
      });
    } else if (Object.keys(exifData).length === 0) {
      console.log("extractExifData: Trying with translated keys...");
      exifData = await exifr.parse(fileOrBuffer, {
        gps: true,
        exif: true,
        translateKeys: true, // Try with translated keys
      });
    }

    // If still no data, try with just GPS and all segments
    if (!exifData) {
      console.log("extractExifData: Trying with GPS only and all segments...");
      exifData = await exifr.parse(fileOrBuffer, {
        gps: true,
        exif: true,
        ifd0: true,
        ifd1: true,
        translateKeys: true,
      });
    } else if (Object.keys(exifData).length === 0) {
      console.log("extractExifData: Trying with GPS only and all segments...");
      exifData = await exifr.parse(fileOrBuffer, {
        gps: true,
        exif: true,
        ifd0: true,
        ifd1: true,
        translateKeys: true,
      });
    }

    console.log("extractExifData: Raw EXIF data", exifData);
    
    // Check if exifData is null or undefined before accessing it
    if (!exifData) {
      console.log("extractExifData: No EXIF data found in file");
      return { gps: null, dateTime: null };
    }
    
    // Check if exifData is an empty object
    if (Object.keys(exifData).length === 0) {
      console.log("extractExifData: EXIF data is empty object");
      return { gps: null, dateTime: null };
    }
    
    console.log("extractExifData: EXIF keys found", Object.keys(exifData));
    
    // Log all GPS-related fields for debugging
    const gpsFields = Object.keys(exifData).filter(k => 
      k.toLowerCase().includes('gps') || 
      k.toLowerCase().includes('lat') || 
      k.toLowerCase().includes('lon') ||
      k.toLowerCase() === 'latitude' ||
      k.toLowerCase() === 'longitude'
    );
    if (gpsFields.length > 0) {
      console.log("extractExifData: GPS-related fields found:", gpsFields);
      gpsFields.forEach(key => {
        console.log(`  ${key}:`, exifData[key], typeof exifData[key]);
      });
    }

    if (Object.keys(exifData).length === 0) {
      console.log("extractExifData: No EXIF data found in file");
      
      // Check if file might have been processed/stripped
      if (fileOrBuffer instanceof ArrayBuffer) {
        const view = new Uint8Array(fileOrBuffer.slice(0, 100));
        const header = Array.from(view.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join(' ');
        console.log("extractExifData: File header (first 20 bytes):", header);
        
        // JPEG files should start with FF D8
        if (view[0] === 0xFF && view[1] === 0xD8) {
          console.log("extractExifData: Valid JPEG header found");
          
          // Check for EXIF marker (should be at position 2-5: FF E1 XX XX 45 78 69 66)
          let hasExifMarker = false;
          for (let i = 2; i < Math.min(view.length - 8, 20); i++) {
            if (view[i] === 0xFF && view[i + 1] === 0xE1) {
              // Check if next bytes are "Exif"
              const exifString = String.fromCharCode(view[i + 4], view[i + 5], view[i + 6], view[i + 7]);
              if (exifString === "Exif") {
                hasExifMarker = true;
                console.log("extractExifData: EXIF marker found at position", i);
                break;
              }
            }
          }
          
          if (!hasExifMarker) {
            console.warn("extractExifData: JPEG file appears to have EXIF data stripped (no EXIF marker found)");
            console.warn("extractExifData: This commonly happens when selecting images from mobile gallery");
          } else {
            console.log("extractExifData: EXIF marker present but exifr couldn't parse it");
          }
        } else {
          console.log("extractExifData: File might not be a valid JPEG");
        }
      }
      
      return { gps: null, dateTime: null };
    }

    // Extract GPS coordinates - try multiple formats and field names
    let gps = null;
    
    // Method 1: Direct latitude/longitude (exifr sometimes provides these as numbers)
    if (exifData.latitude !== undefined && exifData.longitude !== undefined) {
      const lat = Number(exifData.latitude);
      const lng = Number(exifData.longitude);
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        gps = { latitude: lat, longitude: lng };
        console.log("extractExifData: Found GPS via direct lat/lng", gps);
      }
    }
    
    // Method 2: GPSLatitude/GPSLongitude (standard EXIF format) - try both translated and untranslated
    if (!gps) {
      const gpsLat = exifData.GPSLatitude || exifData.gpsLatitude || exifData.latitude;
      const gpsLng = exifData.GPSLongitude || exifData.gpsLongitude || exifData.longitude;
      const latRef = exifData.GPSLatitudeRef || exifData.gpsLatitudeRef;
      const lngRef = exifData.GPSLongitudeRef || exifData.gpsLongitudeRef;
      
      if (gpsLat && gpsLng) {
        // Check if already in decimal format
        if (typeof gpsLat === 'number' && typeof gpsLng === 'number') {
          let lat = gpsLat;
          let lng = gpsLng;
          
          // Apply reference (N/S, E/W)
          if (latRef === 'S' || latRef === 's') lat = -lat;
          if (lngRef === 'W' || lngRef === 'w') lng = -lng;
          
          if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            gps = { latitude: lat, longitude: lng };
            console.log("extractExifData: Found GPS via numeric lat/lng", gps);
          }
        } else {
          // Try DMS conversion
          const lat = convertDMSToDD(gpsLat, latRef);
          const lng = convertDMSToDD(gpsLng, lngRef);
          if (lat !== null && lng !== null) {
            gps = { latitude: lat, longitude: lng };
            console.log("extractExifData: Found GPS via DMS conversion", gps);
          }
        }
      }
    }
    
    // Method 3: Check for GPSInfo object or nested GPS data
    if (!gps && exifData.GPSInfo) {
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
    
    // Method 4: Try to find any GPS-related fields
    if (!gps) {
      const allKeys = Object.keys(exifData);
      const gpsKeys = allKeys.filter(k => k.toLowerCase().includes('gps') || k.toLowerCase().includes('lat') || k.toLowerCase().includes('lon'));
      if (gpsKeys.length > 0) {
        console.log("extractExifData: Found GPS-related keys but couldn't parse:", gpsKeys);
        console.log("extractExifData: GPS-related values:", gpsKeys.reduce((acc, key) => {
          acc[key] = exifData[key];
          return acc;
        }, {}));
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


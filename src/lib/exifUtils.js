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
    const exifData = await exifr.parse(fileOrBuffer, {
      gps: true,        // GPS coordinates
      exif: true,       // EXIF data
      ifd0: true,       // Image file directory 0 (basic image info)
      ifd1: true,       // Image file directory 1 (thumbnail info)
      translateKeys: false, // Keep original key names
      silent: false,    // Show warnings
      reviveValues: false, // Don't convert values automatically
    });

    console.log("extractExifData: Raw EXIF data", exifData);
    console.log("extractExifData: EXIF keys found", Object.keys(exifData));

    if (!exifData || Object.keys(exifData).length === 0) {
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


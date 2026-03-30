import { v2 as cloudinary } from "cloudinary";
import https from "https";

/* ---------------------------------------------------
   CLOUDINARY CONFIGURATION
--------------------------------------------------- */
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Disable SSL certificate validation in development to fix local certificate issues
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
} else {
  console.warn("Cloudinary credentials not fully configured. Image uploads may fail.");
}

/* ---------------------------------------------------
   EXPORT
--------------------------------------------------- */
export default cloudinary;

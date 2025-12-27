import { MongoClient } from "mongodb";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
const options = {};

let clientPromise;

if (uri) {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri, options).connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    clientPromise = new MongoClient(uri, options).connect();
  }
} else {
  clientPromise = null;
}

export async function getMongoDb() {
  if (!clientPromise) {
    throw new Error(
      "MONGODB_URI is not defined. Add it to your environment to enable MongoDB."
    );
  }

  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB || "eco-vigyan";
  return client.db(dbName);
}

export function isMongoConfigured() {
  return Boolean(clientPromise);
}

// Mongoose connection for Mongoose models
let mongooseConnection = null;

export async function connectDB() {
  // Check if already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not defined. Add it to your environment to enable MongoDB."
    );
  }

  try {
    // Only connect if not already connecting or connected
    if (mongoose.connection.readyState === 0) {
      mongooseConnection = await mongoose.connect(uri, {
        dbName: process.env.MONGODB_DB || "eco-vigyan",
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      });
    }
    return mongooseConnection || mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error(`Database connection failed: ${error.message}`);
  }
}


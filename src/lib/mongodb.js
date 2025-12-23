import { MongoClient } from "mongodb";

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


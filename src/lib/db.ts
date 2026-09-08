import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

declare global {
  var __omxMongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const cached = global.__omxMongoose ?? (global.__omxMongoose = { conn: null, promise: null });

/** True when a MongoDB connection string is configured. Otherwise the app runs on the in-memory seed store. */
export function hasDatabase() {
  return Boolean(uri);
}

export async function connectDb() {
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 5000 })
      .then((m) => m);
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}

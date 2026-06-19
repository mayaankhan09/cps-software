// This file is responsible for connecting our backend to the MongoDB Atlas database.
// We use Mongoose, a library that makes it easier to work with MongoDB from Node.js.

import mongoose from "mongoose";

// connectDB() opens the connection to MongoDB using the connection string
// stored in the MONGODB_URI variable inside the .env file.
// We never write the real connection string in this file — it always comes from .env.
export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing. Make sure it is set in your .env file.");
  }

  await mongoose.connect(uri);
}

// This is the entry point of the backend. Running this file starts everything:
// it connects to the database, then starts the Express server listening for requests.

import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  console.log("Database connected");

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();

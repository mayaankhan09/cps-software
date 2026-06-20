// This file sets up the Express application itself: middleware and routes.
// It does NOT start the server or connect to the database — that happens in
// server.js. Keeping this separate makes the app easier to test later.

import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const app = express();

// Allows the frontend (running on a different port during development) to
// call this API. This is just dev-environment plumbing, not business logic.
app.use(cors());

// Lets Express understand JSON request bodies (e.g. from form submissions).
app.use(express.json());

// All API routes are mounted under /api.
app.use("/api", routes);

export default app;

import express from "express";
import connectDB from "./config/db.js";
import config from "./config/env.js";
import apiRoute from "./routes/index.js"

const app = express();

app.use(express.json());


// Routes
app.use("/api", apiRoute);

app.get("/", (req, res) => {
  res.json("Server test");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    errorResponse: { message: "Route not found" },
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    errorResponse: {
      message: err.message || "Internal server error",
    },
  });
});

async function startServer() {
  try {
    await connectDB();

    app.listen(config.port, () => {
      console.log(`App listening on port ${config.port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

startServer();
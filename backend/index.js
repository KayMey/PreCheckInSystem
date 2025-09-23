import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import bookingsRouter from "./routes/bookings.js"; // adjust if your router file is in a different path

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ Enable CORS (allow requests from your Netlify frontend)
app.use(
  cors({
    origin: "https://nimble-kangaroo-5dfc99.netlify.app", // Netlify frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Middleware
app.use(bodyParser.json());

// ✅ Routes
app.use("/bookings", bookingsRouter);

// ✅ Health check (optional, good for testing Render)
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

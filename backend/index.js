import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import pkg from "@supabase/supabase-js";

const { createClient } = pkg;
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ✅ Enable CORS (allow requests from Netlify frontend)
app.use(
  cors({
    origin: "https://nimble-kangaroo-5dfc99.netlify.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Middleware
app.use(bodyParser.json());

/* --------------------------
   📌 ROUTES
---------------------------*/

// ✅ GET bookings by status
app.get("/bookings", async (req, res) => {
  const { status } = req.query;

  let query = supabase.from("bookings").select("*");
  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ✅ POST new booking
app.post("/bookings", async (req, res) => {
  const { booking_name, firstname, surname, schedule_date, schedule_time, cellphone } = req.body;

  const { data, error } = await supabase
    .from("bookings")
    .insert([{ booking_name, firstname, surname, schedule_date, schedule_time, cellphone, status: "not-prechecked" }]);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ✅ PUT update booking status (e.g. pre-check-in)
app.put("/bookings/:id", async (req, res) => {
  const { id } = req.params;
  const { status, license_photo_url } = req.body;

  const { data, error } = await supabase
    .from("bookings")
    .update({ status, license_photo_url })
    .eq("id", id);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

/* --------------------------
   ✅ HEALTH CHECK
---------------------------*/
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

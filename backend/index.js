import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

// --- Setup ---
const app = express();
const PORT = process.env.PORT || 4000;

// Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Clickatell
const CLICKATELL_API_KEY = process.env.CLICKATELL_API_KEY;
const CLICKATELL_URL = "https://platform.clickatell.com/messages/http/send";

// --- Middleware ---
app.use(
  cors({
    origin: "https://nimble-kangaroo-5dfc99.netlify.app", // Netlify frontend
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json());

// --- ROUTES ---

// 1) Health check
app.get("/", (req, res) => {
  res.send("✅ Backend is running");
});

// 2) Get bookings by status
app.get("/bookings", async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase.from("bookings").select("*").order("schedule_time", { ascending: true });
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3) Create booking + send SMS
app.post("/bookings", async (req, res) => {
  try {
    const { booking_name, firstname, surname, schedule_date, schedule_time, cellphone } = req.body;

    // Insert into Supabase
    const { data, error } = await supabase
      .from("bookings")
      .insert([{ booking_name, firstname, surname, schedule_date, schedule_time, cellphone, status: "not-prechecked" }])
      .select();

    if (error) throw error;

    const booking = data[0];
    const preCheckinLink = `https://nimble-kangaroo-5dfc99.netlify.app/precheckin/${booking.id}`;

    // Send SMS via Clickatell
    const smsResponse = await axios.get(CLICKATELL_URL, {
      params: {
        apiKey: CLICKATELL_API_KEY,
        to: cellphone,
        content: `Hello ${firstname}, complete your pre-check-in here: ${preCheckinLink}`,
      },
    });

    res.status(201).json({ booking, sms: smsResponse.data });
  } catch (err) {
    console.error("Error creating booking:", err.response?.data || err.message);
    res.status(500).json({ error: err.message, details: err.response?.data });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});

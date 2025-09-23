import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ Supabase setup
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ✅ Clickatell setup
const CLICKATELL_API_KEY = (process.env.CLICKATELL_API_KEY || "").trim();
const CLICKATELL_URL = "https://platform.clickatell.com/messages/http/send";

// ✅ Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // ⚠️ no trailing slash in Render env var
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json());

// ✅ Create booking
app.post("/bookings", async (req, res) => {
  try {
    const { booking_name, firstname, surname, schedule_date, schedule_time, cellphone } = req.body;

    // 1️⃣ Insert booking into Supabase
    const { data, error } = await supabase
      .from("bookings")
      .insert([
        { booking_name, firstname, surname, schedule_date, schedule_time, cellphone, status: "not-prechecked" }
      ])
      .select();

    if (error) throw error;

    const booking = data[0];

    // 2️⃣ Generate pre-check-in link
    const preCheckinLink = `${process.env.FRONTEND_URL}/precheckin/${booking.id}`;

    // 3️⃣ Send SMS via Clickatell
    try {
      const smsResponse = await axios.get(CLICKATELL_URL, {
        params: {
          apiKey: CLICKATELL_API_KEY,
          to: cellphone,
          content: `Hello ${firstname}, complete your pre-check-in here: ${preCheckinLink}`,
        },
        validateStatus: () => true, // log even errors
      });

      console.log("📩 Clickatell response:", smsResponse.status, smsResponse.data);

      if (smsResponse.status !== 202) {
        // Pass the actual Clickatell error back so you can see it in the frontend
        return res.status(500).json({
          error: "SMS sending failed",
          clickatellResponse: smsResponse.data,
        });
      }
    } catch (smsErr) {
      console.error("❌ Failed to send SMS:", smsErr.message);
      return res.status(500).json({ error: "Clickatell request failed" });
    }

    res.status(201).json({ booking });
  } catch (err) {
    console.error("❌ Error creating booking:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get bookings (needed for frontend table)
app.get("/bookings", async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase.from("bookings").select("*").order("schedule_time", { ascending: true });
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching bookings:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Health check
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});

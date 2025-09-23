import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import path from "path";

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
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json());

// ✅ Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Create booking
app.post("/bookings", async (req, res) => {
  try {
    const { booking_name, firstname, surname, schedule_date, schedule_time, cellphone } = req.body;

    const { data, error } = await supabase
      .from("bookings")
      .insert([
        { booking_name, firstname, surname, schedule_date, schedule_time, cellphone, status: "not-prechecked" }
      ])
      .select();

    if (error) throw error;
    const booking = data[0];

    const preCheckinLink = `${process.env.FRONTEND_URL}/precheckin/${booking.id}`;

    try {
      const smsResponse = await axios.get(CLICKATELL_URL, {
        params: {
          apiKey: CLICKATELL_API_KEY,
          to: cellphone,
          content: `Hello ${firstname}, complete your pre-check-in here: ${preCheckinLink}`,
        },
        validateStatus: () => true,
      });

      console.log("📩 Clickatell response:", smsResponse.status, smsResponse.data);

      if (smsResponse.status !== 202) {
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

// ✅ Get all bookings
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

// ✅ Get booking by ID
app.get("/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase.from("bookings").select("*").eq("id", id).single();
    if (error || !data) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching booking:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Pre-check-in update
app.put("/bookings/:id/precheckin", upload.single("license"), async (req, res) => {
  try {
    const { id } = req.params;
    const { dropoff_firstname, dropoff_surname, dropoff_phone } = req.body;
    let licenseUrl = null;

    if (req.file) {
      const fileName = `${id}_${Date.now()}${path.extname(req.file.originalname)}`;
      const { error: uploadError } = await supabase.storage
        .from("licenses")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("licenses").getPublicUrl(fileName);
      licenseUrl = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("bookings")
      .update({
        dropoff_firstname,
        dropoff_surname,
        dropoff_phone,
        license_url: licenseUrl,
        status: "prechecked",
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    res.json({ success: true, booking: data[0] });
  } catch (err) {
    console.error("❌ Error during pre-check-in:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Health check
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});

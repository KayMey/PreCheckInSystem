import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer"; // ✅ for handling file uploads
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

// ✅ File upload handler
const upload = multer({ storage: multer.memoryStorage() });

// ---------------- ROUTES ---------------- //

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

// ✅ Get all bookings (for employee view)
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

// ✅ Get single booking by ID (for PreCheckin page)
app.get("/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from("bookings").select("*").eq("id", id).single();
    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching booking:", err);
    res.status(404).json({ error: "Booking not found" });
  }
});

// ✅ Update booking with license upload + mark prechecked
app.put("/bookings/:id/precheckin", upload.single("license"), async (req, res) => {
  try {
    const { id } = req.params;

    // file uploaded?
    if (!req.file) {
      return res.status(400).json({ error: "License image is required" });
    }

    // upload to Supabase storage
    const filePath = `licenses/${id}-${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("licenses")
      .upload(filePath, req.file.buffer, { contentType: req.file.mimetype });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from("licenses").getPublicUrl(filePath);
    const licenseUrl = publicUrlData.publicUrl;

    // update booking
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "prechecked", license_url: licenseUrl })
      .eq("id", id);

    if (updateError) throw updateError;

    res.json({ success: true, license_url: licenseUrl });
  } catch (err) {
    console.error("❌ Error in precheckin:", err);
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

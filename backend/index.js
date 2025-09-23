// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// ---- App & middleware -------------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer: keep uploaded file in memory, max 5 MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ---- Supabase ---------------------------------------------------------------
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ---- Routes -----------------------------------------------------------------

// Create booking + send SMS
app.post("/bookings", async (req, res) => {
  try {
    const { booking_name, firstname, surname, schedule_date, schedule_time, cellphone } = req.body;

    // 1) Save booking
    const { data, error } = await supabase
      .from("bookings")
      .insert([{ booking_name, firstname, surname, schedule_date, schedule_time, cellphone }])
      .select()
      .single();
    if (error) throw error;

    // 2) Build the pre-check-in link (frontend route)
    // 2) Build the pre-check-in link (frontend route)
	const precheckLink = `${process.env.FRONTEND_URL}/precheckin?id=${data.id}`;


    // 3) Send SMS via Clickatell HTTP API (Sandbox uses test phones only)
    const smsMessage = `Booking confirms ${firstname} ${surname}. Please fill in the pre-check in link below: ${precheckLink}`;

    await axios.get("https://platform.clickatell.com/messages/http/send", {
      params: {
        apiKey: process.env.CLICKATELL_API_KEY,
        to: cellphone,      // digits only, e.g. 27XXXXXXXXX
        content: smsMessage // Clickatell handles URL encoding
      },
    });

    res.json({ success: true, booking: data });
  } catch (err) {
    console.error("POST /bookings error:", err);
    res.status(500).json({ success: false, error: err.message || "Server error" });
  }
});

// List all bookings
app.get("/bookings", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error("GET /bookings error:", err);
    res.status(500).json({ success: false, error: err.message || "Server error" });
  }
});

// Customer Pre-Check-In: upload license + drop-off details, update booking
app.post("/precheckin", upload.single("license_front"), async (req, res) => {
  try {
    const { id, dropoff_firstname, dropoff_surname, dropoff_phone } = req.body;

    // 1) Ensure booking exists
    const { data: existing, error: readErr } = await supabase
      .from("bookings")
      .select("id")
      .eq("id", id)
      .single();
    if (readErr || !existing) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    // 2) Upload license image to Supabase Storage (bucket: licenses)
    let publicUrl = null;
    if (req.file) {
      const ext = (req.file.originalname?.split(".").pop() || "jpg").toLowerCase();
      const path = `${id}/front_${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("licenses")
        .upload(path, req.file.buffer, {
          contentType: req.file.mimetype || "image/jpeg",
          upsert: true,
        });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("licenses").getPublicUrl(path);
      publicUrl = pub?.publicUrl || null;
    }

    // 3) Update booking row with details + file URL + status
    const { data: updated, error: updErr } = await supabase
      .from("bookings")
      .update({
        dropoff_firstname,
        dropoff_surname,
        dropoff_phone,
        license_url: publicUrl,
        status: "prechecked",
      })
      .eq("id", id)
      .select()
      .single();
    if (updErr) throw updErr;

    res.json({ success: true, booking: updated });
  } catch (err) {
    console.error("POST /precheckin error:", err);
    res.status(500).json({ success: false, error: err.message || "Server error" });
  }
});

// ---- Start server -----------------------------------------------------------
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

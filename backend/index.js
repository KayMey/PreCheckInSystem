import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import multer from "multer";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// ── App & middleware ───────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// allow Netlify + local dev
const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5173"].filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
  })
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ── Supabase ──────────────────────────────────────────────────────────────────
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ── Create booking + SMS ──────────────────────────────────────────────────────
app.post("/bookings", async (req, res) => {
  try {
    const { booking_name, firstname, surname, schedule_date, schedule_time, cellphone } = req.body;

    // prevent double-booking same slot
    const { data: conflicts, error: confErr } = await supabase
      .from("bookings")
      .select("id")
      .eq("schedule_date", schedule_date)
      .eq("schedule_time", schedule_time);

    if (confErr) throw confErr;
    if (conflicts?.length) {
      return res.status(409).json({ success: false, error: "Time slot already booked" });
    }

    // unique token for the customer link
    const token = crypto.randomUUID();

    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          booking_name,
          firstname,
          surname,
          schedule_date,
          schedule_time,
          cellphone,
          token,
          status: "not-prechecked",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    const base = (process.env.FRONTEND_URL || "").replace(/\/$/, "");
    const link = `${base}/precheckin/${token}`;

    const smsMessage = `Booking confirmed ${firstname} ${surname} for ${schedule_date} at ${schedule_time}. Please complete pre-check-in: ${link}`;

    // ── Send SMS via Clickatell ───────────────────────────────
    try {
      const smsResponse = await axios.get(
        "https://platform.clickatell.com/messages/http/send",
        {
          params: {
            apiKey: process.env.CLICKATELL_API_KEY, // Clickatell API key
            to: cellphone,                          // e.g. 27XXXXXXXXX
            content: smsMessage,                    // message body
          },
        }
      );
      console.log("SMS sent successfully:", smsResponse.data);
    } catch (smsErr) {
      console.error("Error sending SMS via Clickatell:", smsErr.response?.data || smsErr.message);
    }

    res.json({ success: true, booking: data, link });
  } catch (err) {
    console.error("POST /bookings error:", err);
    res.status(500).json({ success: false, error: err.message || "Server error" });
  }
});

// ── List bookings (optional ?status=prechecked / not-prechecked) ──────────────
app.get("/bookings", async (req, res) => {
  try {
    const status = req.query.status;
    let q = supabase
      .from("bookings")
      .select("*")
      .order("schedule_date", { ascending: true })
      .order("schedule_time", { ascending: true });
    if (status) q = q.eq("status", status);

    const { data, error } = await q;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error("GET /bookings error:", err);
    res.status(500).json({ success: false, error: err.message || "Server error" });
  }
});

// ── Customer link verification ────────────────────────────────────────────────
app.get("/precheckin/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { data, error } = await supabase
      .from("bookings")
      .select("id, booking_name, firstname, surname, schedule_date, schedule_time, status")
      .eq("token", token)
      .single();

    if (error || !data) return res.status(404).json({ ok: false, error: "Invalid link" });
    if (data.status === "prechecked") return res.status(410).json({ ok: false, error: "Already submitted" });

    res.json({ ok: true, booking: data });
  } catch (err) {
    console.error("GET /precheckin/verify/:token error:", err);
    res.status(500).json({ ok: false, error: err.message || "Server error" });
  }
});

// ── Customer submit (photo + details) ─────────────────────────────────────────
app.post("/precheckin", upload.single("license_front"), async (req, res) => {
  try {
    const { token, dropoff_firstname, dropoff_surname, dropoff_phone } = req.body;

    const { data: booking, error: findErr } = await supabase
      .from("bookings")
      .select("id, status")
      .eq("token", token)
      .single();

    if (findErr || !booking) return res.status(404).json({ success: false, error: "Invalid link" });
    if (booking.status === "prechecked")
      return res.status(409).json({ success: false, error: "Already submitted" });

    // upload license image (optional)
    let publicUrl = null;
    if (req.file) {
      const ext = (req.file.originalname?.split(".").pop() || "jpg").toLowerCase();
      const path = `${booking.id}/front_${Date.now()}.${ext}`;
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

    const { data: updated, error: updErr } = await supabase
      .from("bookings")
      .update({
        dropoff_firstname,
        dropoff_surname,
        dropoff_phone,
        license_url: publicUrl,
        status: "prechecked",
      })
      .eq("id", booking.id)
      .select()
      .single();

    if (updErr) throw updErr;

    res.json({ success: true, booking: updated });
  } catch (err) {
    console.error("POST /precheckin error:", err);
    res.status(500).json({ success: false, error: err.message || "Server error" });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));

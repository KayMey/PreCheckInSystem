import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import path from "path";

const app = express();
const PORT = process.env.PORT || 4000;

/* ---------- Supabase ---------- */
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Storage bucket for licence photos
const LICENSES_BUCKET = process.env.SUPABASE_BUCKET_LICENSES || "licenses";

/* ---------- Clickatell (best-effort) ---------- */
const CLICKATELL_API_KEY = (process.env.CLICKATELL_API_KEY || "").trim();
const CLICKATELL_URL = "https://platform.clickatell.com/messages/http/send";

/* ---------- CORS ---------- */
const allowedOrigins = [
  "http://localhost:5173",
  "https://nimble-kangaroo-5dfc99.netlify.app",
];
app.use(
  cors({
    origin: (origin, cb) =>
      !origin || allowedOrigins.includes(origin)
        ? cb(null, true)
        : cb(new Error("Not allowed by CORS")),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.options("*", cors());
app.use(bodyParser.json());

/* ---------- File uploads ---------- */
const upload = multer({ storage: multer.memoryStorage() });

/* ---------- Helpers ---------- */
async function getBookingById(id) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) throw new Error("Booking not found");
  return data;
}

/* ======================== ROUTES ======================= */

/** Create booking (captures owner ID number) */
app.post("/bookings", async (req, res) => {
  try {
    const {
      booking_name,
      firstname,
      surname,
      schedule_date,
      schedule_time,
      cellphone,
      booking_id_number, // NEW
    } = req.body;

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
          booking_id_number, // NEW
          status: "not-prechecked",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Link for SMS
    const preCheckinLink = `${process.env.FRONTEND_URL}/precheckin/${data.id}`;

    // Best-effort SMS; don't fail the booking if SMS fails
    if (CLICKATELL_API_KEY && cellphone) {
      try {
        const smsResponse = await axios.get(CLICKATELL_URL, {
          params: {
            apiKey: CLICKATELL_API_KEY,
            to: cellphone,
            content: `Hello ${firstname}, your booking is confirmed for ${schedule_date} at ${schedule_time}. Please complete pre-check-in: ${preCheckinLink}`,
          },
          validateStatus: () => true,
        });
        console.log("Clickatell response:", smsResponse.status, smsResponse.data);
      } catch (smsErr) {
        console.warn("Clickatell request failed:", smsErr.message);
      }
    }

    res.status(201).json({ booking: data });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ error: err.message });
  }
});

/** List bookings (+flatten dropoff_name & license_photo_url) */
app.get("/bookings", async (req, res) => {
  try {
    const { status, date } = req.query;

    let q = supabase
      .from("bookings")
      .select(
        `
        id,
        booking_name,
        firstname,
        surname,
        cellphone,
        schedule_date,
        schedule_time,
        status,
        dropoffs(first_name, surname, license_url)
      `
      )
      .order("schedule_date", { ascending: true })
      .order("schedule_time", { ascending: true });

    if (status) q = q.eq("status", status);
    if (date) q = q.eq("schedule_date", date);

    const { data, error } = await q;
    if (error) throw error;

    const rows = (data || []).map((r) => {
      const d = Array.isArray(r.dropoffs) ? r.dropoffs[0] : null;
      return {
        ...r,
        dropoff_name: d ? `${d.first_name || ""} ${d.surname || ""}`.trim() : null,
        license_photo_url: d?.license_url || null, // keep ViewBookings working
      };
    });

    res.json(rows);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: err.message });
  }
});

/** Get one booking */
app.get("/bookings/:id", async (req, res) => {
  try {
    const data = await getBookingById(req.params.id);
    res.json(data);
  } catch (err) {
    console.error("Error fetching booking:", err);
    res.status(404).json({ error: err.message });
  }
});

/** Pre-check-in (confirm|update) + upload licence */
app.put(
  "/bookings/:id/precheckin",
  upload.single("license"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const action = String(req.body.action || "").toLowerCase(); // 'confirm' | 'update'
      if (!["confirm", "update"].includes(action)) {
        return res
          .status(400)
          .json({ error: "Missing or invalid 'action' (confirm|update)" });
      }

      const booking = await getBookingById(id);

      // Build dropoff payload
      let payload;
      if (action === "confirm") {
        // Copy owner details, including owner ID number
        payload = {
          booking_id: booking.id,
          first_name: booking.firstname,
          surname: booking.surname,
          phone: booking.cellphone,
          id_number: booking.booking_id_number || null,
          details_source: "confirmed",
          details_confirmed: true,
        };
      } else {
        // Use updated details from the form
        payload = {
          booking_id: booking.id,
          first_name: (req.body.first_name || "").trim() || null,
          surname: (req.body.surname || "").trim() || null,
          phone: (req.body.phone || "").trim() || null,
          id_number: (req.body.id_number || "").trim() || null,
          details_source: "updated",
          details_confirmed: true,
        };
      }

      // Upsert one dropoff per booking (onConflict booking_id)
      const { data: upserted, error: dErr } = await supabase
        .from("dropoffs")
        .upsert([payload], { onConflict: "booking_id" })
        .select()
        .single();
      if (dErr) throw dErr;

      // Upload licence image if provided
      let licenseUrl = null;
      if (req.file) {
        const safeExt =
          path.extname(req.file.originalname || "").toLowerCase() || ".jpg";
        const filename = `ids/${booking.id}/${Date.now()}${safeExt}`;

        const { error: uploadErr } = await supabase.storage
          .from(LICENSES_BUCKET)
          .upload(filename, req.file.buffer, {
            contentType: req.file.mimetype || "image/jpeg",
            upsert: true,
          });
        if (uploadErr) throw uploadErr;

        const { data: pub } = supabase
          .storage
          .from(LICENSES_BUCKET)
          .getPublicUrl(filename);
        licenseUrl = pub?.publicUrl || null;

        // Save on dropoffs
        const { error: updDrop } = await supabase
          .from("dropoffs")
          .update({ license_url: licenseUrl })
          .eq("id", upserted.id);
        if (updDrop) throw updDrop;
      }

      // Mark booking as prechecked + keep legacy column for UI
      const { error: updBooking } = await supabase
        .from("bookings")
        .update({
          status: "prechecked",
          license_photo_url: licenseUrl ?? booking.license_photo_url ?? null,
        })
        .eq("id", booking.id);
      if (updBooking) throw updBooking;

      // Return joined view (like list route)
      const { data: fresh, error: freshErr } = await supabase
        .from("bookings")
        .select(
          `
          id,
          booking_name,
          firstname,
          surname,
          cellphone,
          schedule_date,
          schedule_time,
          status,
          dropoffs(first_name, surname, license_url)
        `
        )
        .eq("id", booking.id)
        .single();
      if (freshErr) throw freshErr;

      const d = Array.isArray(fresh.dropoffs) ? fresh.dropoffs[0] : null;
      res.json({
        ok: true,
        booking: {
          ...fresh,
          dropoff_name: d ? `${d.first_name || ""} ${d.surname || ""}`.trim() : null,
          license_photo_url: d?.license_url || null,
        },
      });
    } catch (err) {
      console.error("Error during pre-check-in:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

/** Health check */
app.get("/", (_req, res) => res.send("Backend is running"));

app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);

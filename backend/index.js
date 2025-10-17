import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import path from "path";

const app = express();
const PORT = process.env.PORT || 4000;

/** Supabase
 * Prefer the service role key on the server (for Storage & RLS-safe writes).
 * Fallback to SUPABASE_KEY if that's how you're currently deployed.
 */
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Storage bucket for licence photos
const LICENSES_BUCKET = process.env.SUPABASE_BUCKET_LICENSES || "licenses";

/** Clickatell */
const CLICKATELL_API_KEY = (process.env.CLICKATELL_API_KEY || "").trim();
const CLICKATELL_URL = "https://platform.clickatell.com/messages/http/send";

/** CORS */
const allowedOrigins = [
  "http://localhost:5173",
  "https://nimble-kangaroo-5dfc99.netlify.app",
];
app.use(
  cors({
    origin: (origin, cb) => (!origin || allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error("Not allowed by CORS"))),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.options("*", cors());
app.use(bodyParser.json());

/** File uploads */
const upload = multer({ storage: multer.memoryStorage() });

/* ---------------- Helper: booking + first dropoff ---------------- */
async function getBookingWithDropoff(bookingId) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, dropoffs(*)")
    .eq("id", bookingId)
    .single();
  if (error || !data) throw new Error("Booking not found");
  const dropoff = Array.isArray(data.dropoffs) ? data.dropoffs[0] : null;
  delete data.dropoffs;
  return { booking: data, dropoff };
}

/* ======================== ROUTES ======================= */

// Create booking
app.post("/bookings", async (req, res) => {
  try {
    const { booking_name, firstname, surname, schedule_date, schedule_time, cellphone } = req.body;

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
          status: "not-prechecked",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Deep link to your frontend route (you already use /precheckin/:id)
    const preCheckinLink = `${process.env.FRONTEND_URL}/precheckin/${data.id}`;

    // Send SMS via Clickatell (optional, keep your current behavior)
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
      if (smsResponse.status !== 202) {
        return res.status(500).json({ error: "SMS sending failed", clickatellResponse: smsResponse.data });
      }
    } catch (smsErr) {
      console.error("Failed to send SMS:", smsErr.message);
      return res.status(500).json({ error: "Clickatell request failed" });
    }

    res.status(201).json({ booking: data });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get bookings (optionally by status/date). Also return first dropoff.license_url flattened.
app.get("/bookings", async (req, res) => {
  try {
    const { status, date } = req.query;

    let q = supabase
      .from("bookings")
      .select("id, booking_name, firstname, surname, cellphone, schedule_date, schedule_time, status, dropoffs(license_url)")
      .order("schedule_date", { ascending: true })
      .order("schedule_time", { ascending: true });

    if (status) q = q.eq("status", status);
    if (date) q = q.eq("schedule_date", date);

    const { data, error } = await q;
    if (error) throw error;

    // Flatten for backward compatibility with your ViewBookings table
    const rows = (data || []).map((r) => ({
      ...r,
      license_photo_url: r.dropoffs?.[0]?.license_url || null,
      dropoff: r.dropoffs?.[0] || null,
    }));

    res.json(rows);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get booking by ID (same as before)
app.get("/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from("bookings").select("*").eq("id", id).single();
    if (error || !data) return res.status(404).json({ error: "Booking not found" });
    res.json(data);
  } catch (err) {
    console.error("Error fetching booking:", err);
    res.status(500).json({ error: err.message });
  }
});

/** Pre-check-in (NEW 2-table logic)
 * Frontend sends:
 *  - action=confirm   -> copy booking->dropoffs
 *  - action=update    -> use provided first_name/surname/phone/id_number
 *  - license (file)   -> optional; uploaded to Storage and saved on dropoffs.license_url
 */
app.put("/bookings/:id/precheckin", upload.single("license"), async (req, res) => {
  try {
    const { id } = req.params;
    const action = String(req.body.action || "").toLowerCase(); // 'confirm' | 'update'
    if (!["confirm", "update"].includes(action)) {
      return res.status(400).json({ error: "Missing or invalid 'action' (confirm|update)" });
    }

    const { booking, dropoff } = await getBookingWithDropoff(id);

    // 1) Build dropoff payload
    let payload;
    if (action === "confirm") {
      payload = {
        first_name: booking.firstname,
        surname: booking.surname,
        phone: booking.cellphone,
        // id_number is optional (can be filled later via OCR)
        details_source: "confirmed",
        details_confirmed: true,
      };
    } else {
      // update mode: use submitted fields
      payload = {
        first_name: (req.body.first_name || "").trim() || null,
        surname: (req.body.surname || "").trim() || null,
        phone: (req.body.phone || "").trim() || null,
        id_number: (req.body.id_number || "").trim() || null,
        details_source: "updated",
        details_confirmed: true,
      };
    }

    // 2) Upsert into dropoffs
    let dropoffRow;
    if (!dropoff) {
      const { data, error } = await supabase
        .from("dropoffs")
        .insert([{ booking_id: booking.id, ...payload }])
        .select("*")
        .single();
      if (error) throw error;
      dropoffRow = data;
    } else {
      const { data, error } = await supabase
        .from("dropoffs")
        .update(payload)
        .eq("id", dropoff.id)
        .select("*")
        .single();
      if (error) throw error;
      dropoffRow = data;
    }

    // 3) Upload licence image if present
    if (req.file) {
      const filename = `ids/${booking.id}/${Date.now()}-${req.file.originalname}`;
      const { error: uploadErr } = await supabase.storage
        .from(LICENSES_BUCKET)
        .upload(filename, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });
      if (uploadErr) throw uploadErr;

      const { data: pub } = supabase.storage.from(LICENSES_BUCKET).getPublicUrl(filename);
      const license_url = pub?.publicUrl || null;

      const { error: updErr } = await supabase
        .from("dropoffs")
        .update({ license_url })
        .eq("id", dropoffRow.id);
      if (updErr) throw updErr;
    }

    // 4) Mark booking as prechecked
    await supabase.from("bookings").update({ status: "prechecked" }).eq("id", booking.id);

    // 5) Return refreshed state
    const fresh = await getBookingWithDropoff(id);
    res.json({ ok: true, ...fresh });
  } catch (err) {
    console.error("Error during pre-check-in:", err);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get("/", (req, res) => res.send("Backend is running"));

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));

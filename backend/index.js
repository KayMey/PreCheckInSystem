import express from "express";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const router = express.Router();

// Supabase setup
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Clickatell setup
const CLICKATELL_API_KEY = process.env.CLICKATELL_API_KEY; 
const CLICKATELL_URL = "https://platform.clickatell.com/messages/http/send";

// Create booking
router.post("/", async (req, res) => {
  try {
    const { booking_name, firstname, surname, schedule_date, schedule_time, cellphone } = req.body;

    // 1️⃣ Insert into Supabase
    const { data, error } = await supabase
      .from("bookings")
      .insert([
        { booking_name, firstname, surname, schedule_date, schedule_time, cellphone, status: "not-prechecked" }
      ])
      .select();

    if (error) throw error;

    // 2️⃣ Generate pre-check-in link
    const booking = data[0];
    const preCheckinLink = `https://nimble-kangaroo-5dfc99.netlify.app/precheckin/${booking.id}`;

    // 3️⃣ Send SMS via Clickatell
    const smsResponse = await axios.get(CLICKATELL_URL, {
      params: {
        apiKey: CLICKATELL_API_KEY,
        to: cellphone,
        content: `Hello ${firstname}, complete your pre-check-in here: ${preCheckinLink}`
      }
    });

    console.log("SMS sent:", smsResponse.data);

    res.status(201).json({ booking, sms: smsResponse.data });

  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

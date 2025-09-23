import { useMemo, useState } from "react";
import axios from "axios";
import { API_URL } from "../api";

export default function CreateBooking() {
  const [form, setForm] = useState({
    booking_name: "",
    firstname: "",
    surname: "",
    schedule_date: "",
    schedule_time: "07:00",
    cellphone: ""
  });
  const [status, setStatus] = useState("");

  // Build 10-minute time slots from 07:00 to 09:00 (inclusive of 09:00)
  const times = useMemo(() => {
    const out = [];
    for (let h = 7; h <= 9; h++) {
      for (let m = 0; m < 60; m += 10) {
        if (h === 9 && m > 0) break; // stop at 09:00
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        out.push(`${hh}:${mm}`);
      }
    }
    return out;
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Submitting…");

    // SA number normalisation: remove non-digits, ensure it starts with 27
    const digits = form.cellphone.replace(/[^\d]/g, "");
    if (!digits.startsWith("27")) {
      setStatus("Phone must be in international format, e.g. 27XXXXXXXXX");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/bookings`, {
        ...form,
        cellphone: digits
      });
      if (res.data?.success) {
        setStatus("✅ Booking saved and SMS sent!");
        // optional: clear the form after success
        // setForm({ booking_name:"", firstname:"", surname:"", schedule_date:"", schedule_time:"07:00", cellphone:"" });
      } else {
        setStatus("⚠️ Unexpected response from server.");
      }
    } catch (err) {
      setStatus(`❌ Error: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div style={{maxWidth: 640, margin: "30px auto", fontFamily: "sans-serif"}}>
      <h2>Create Booking</h2>
      <form onSubmit={handleSubmit} style={{display: "grid", gap: 10}}>
        <label>
          Booking name
          <input name="booking_name" value={form.booking_name} onChange={handleChange} required />
        </label>
        <label>
          First name
          <input name="firstname" value={form.firstname} onChange={handleChange} required />
        </label>
        <label>
          Surname
          <input name="surname" value={form.surname} onChange={handleChange} required />
        </label>
        <label>
          Schedule date
          <input type="date" name="schedule_date" value={form.schedule_date} onChange={handleChange} required />
        </label>
        <label>
          Schedule time
          <select name="schedule_time" value={form.schedule_time} onChange={handleChange}>
            {times.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          Cellphone (e.g. 27XXXXXXXXX)
          <input name="cellphone" value={form.cellphone} onChange={handleChange} required />
        </label>

        <button type="submit" style={{padding: "10px 16px"}}>Schedule</button>
      </form>

      {status && <p style={{marginTop: 12}}>{status}</p>}
    </div>
  );
}

import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../api";

export default function CreateBooking() {
  const [form, setForm] = useState({
    booking_name: "",
    firstname: "",
    surname: "",
    schedule_date: "",
    schedule_time: "",
    cellphone: "",
    booking_id_number: "", // NEW: owner ID
  });

  const [availableTimes, setAvailableTimes] = useState([]);

  // 07:00 → 09:00, every 10 minutes (13 slots)
  const allSlots = Array.from({ length: 13 }, (_, i) => {
    const h = 7 + Math.floor(i / 6);
    const m = (i % 6) * 10;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  });

  useEffect(() => {
    if (!form.schedule_date) {
      setAvailableTimes([]);
      return;
    }

    console.log("GET bookings -> API_URL =", API_URL);

    axios
      .get(`${API_URL}/bookings`)
      .then((res) => {
        const bookings = Array.isArray(res.data) ? res.data : [];
        const taken = bookings
          .filter((b) => b.schedule_date === form.schedule_date)
          .map((b) => b.schedule_time);
        setAvailableTimes(allSlots.filter((t) => !taken.includes(t)));
      })
      .catch((err) => {
        console.warn("GET /bookings failed:", err?.message);
        setAvailableTimes(allSlots);
      });
  }, [form.schedule_date]);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log("POST booking -> API_URL =", API_URL, "payload =", form);

    try {
      await axios.post(`${API_URL}/bookings`, form);
      alert("✅ Booking created successfully!");
      setForm({
        booking_name: "",
        firstname: "",
        surname: "",
        schedule_date: "",
        schedule_time: "",
        cellphone: "",
        booking_id_number: "",
      });
      setAvailableTimes([]);
    } catch (err) {
      console.error("POST /bookings error:", err?.message, err?.response);
      alert(err.response?.data?.error || err.message);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f8f9fa",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 40,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: 600,
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: 20 }}>
          Pre-Check-In Demo System
        </h1>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          Create Booking
        </h2>

        <form onSubmit={onSubmit}>
          {/* Booking name */}
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 6 }}>
              Booking Name
            </label>
            <input
              type="text"
              name="booking_name"
              value={form.booking_name}
              onChange={onChange}
              required
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          {/* Owner first/last */}
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 6 }}>Firstname</label>
            <input
              type="text"
              name="firstname"
              value={form.firstname}
              onChange={onChange}
              required
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 6 }}>Surname</label>
            <input
              type="text"
              name="surname"
              value={form.surname}
              onChange={onChange}
              required
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          {/* Owner ID number (saved on booking) */}
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 6 }}>
              Owner ID Number
            </label>
            <input
              type="text"
              name="booking_id_number"
              value={form.booking_id_number}
              onChange={onChange}
              placeholder="13 digits"
              pattern="\d{13}"
              title="Enter a 13-digit South African ID number"
              required
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          {/* Date + time */}
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 6 }}>
              Schedule Date
            </label>
            <input
              type="date"
              name="schedule_date"
              value={form.schedule_date}
              onChange={onChange}
              required
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />

            {form.schedule_date && (
              <div style={{ marginTop: 8 }}>
                <strong>Available times:</strong>
                <ul style={{ marginTop: 6 }}>
                  {availableTimes.length ? (
                    availableTimes.map((t) => <li key={t}>{t}</li>)
                  ) : (
                    <li>No slots left</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 6 }}>
              Schedule Time
            </label>
            <input
              type="time"
              name="schedule_time"
              value={form.schedule_time}
              onChange={onChange}
              required
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          {/* Cell */}
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 6 }}>
              Cellphone (e.g. 276XXXXXXXX)
            </label>
            <input
              type="text"
              name="cellphone"
              value={form.cellphone}
              onChange={onChange}
              required
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: 12,
              background: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Create Booking
          </button>
        </form>
      </div>
    </div>
  );
}

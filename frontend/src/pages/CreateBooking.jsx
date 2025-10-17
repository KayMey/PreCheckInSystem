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
    axios
      .get(`${API_URL}/bookings`)
      .then((res) => {
        const bookings = Array.isArray(res.data) ? res.data : [];
        const taken = bookings
          .filter((b) => b.schedule_date === form.schedule_date)
          .map((b) => b.schedule_time);
        const free = allSlots.filter((t) => !taken.includes(t));
        setAvailableTimes(free);
      })
      .catch(() => setAvailableTimes(allSlots));
  }, [form.schedule_date]);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
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
      });
      setAvailableTimes([]);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"100vh", background:"#f8f9fa" }}>
      <div style={{ background:"#fff", padding:40, borderRadius:12, boxShadow:"0 4px 12px rgba(0,0,0,0.1)", width:"100%", maxWidth:600 }}>
        <h1 style={{ textAlign:"center", marginBottom:20 }}>Pre-Check-In Demo System</h1>
        <h2 style={{ textAlign:"center", marginBottom:20 }}>Create Booking</h2>

        <form onSubmit={onSubmit}>
          {[
            { label:"Booking Name", name:"booking_name" },
            { label:"Firstname", name:"firstname" },
            { label:"Surname", name:"surname" },
            { label:"Schedule Date", name:"schedule_date", type:"date" },
            { label:"Schedule Time", name:"schedule_time", type:"time" },
            { label:"Cellphone (e.g. 276XXXXXXXX)", name:"cellphone" },
          ].map((f) => (
            <div key={f.name} style={{ marginBottom:15 }}>
              <label style={{ display:"block", marginBottom:6 }}>{f.label}</label>
              <input
                type={f.type || "text"}
                name={f.name}
                value={form[f.name]}
                onChange={onChange}
                required
                style={{ width:"100%", padding:10, borderRadius:6, border:"1px solid #ccc", fontSize:14 }}
              />
              {f.name === "schedule_date" && form.schedule_date && (
                <div style={{ marginTop:8 }}>
                  <strong>Available times:</strong>
                  <ul style={{ marginTop:6 }}>
                    {availableTimes.length ? availableTimes.map((t) => <li key={t}>{t}</li>) : <li>No slots left</li>}
                  </ul>
                </div>
              )}
            </div>
          ))}

          <button type="submit" style={{ width:"100%", padding:12, background:"#007bff", color:"#fff", border:"none", borderRadius:6, fontSize:16, cursor:"pointer" }}>
            Create Booking
          </button>
        </form>
      </div>
    </div>
  );
}

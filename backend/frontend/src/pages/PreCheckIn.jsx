import { useMemo, useState } from "react";
import axios from "axios";
import { API_URL } from "../api";

export default function PreCheckIn() {
  // read booking id from ?id=<uuid> in the url
  const id = useMemo(() => new URLSearchParams(window.location.search).get("id"), []);
  const [form, setForm] = useState({
    dropoff_firstname: "",
    dropoff_surname: "",
    dropoff_phone: ""
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Submitting…");

    if (!id) {
      setStatus("Missing booking id in link.");
      return;
    }

    // normalise phone → digits only (you can also enforce 27… if you like)
    const digits = form.dropoff_phone.replace(/[^\d]/g, "");

    const fd = new FormData();
    fd.append("id", id);
    fd.append("dropoff_firstname", form.dropoff_firstname);
    fd.append("dropoff_surname", form.dropoff_surname);
    fd.append("dropoff_phone", digits);
    if (file) fd.append("license_front", file);

    try {
      const res = await axios.post(`${API_URL}/precheckin`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data?.success) {
        setStatus("✅ Pre-check-in submitted successfully. Thank you!");
      } else {
        setStatus("⚠️ Unexpected response from server.");
      }
    } catch (err) {
      setStatus(`❌ Error: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div style={{maxWidth: 640, margin: "30px auto", fontFamily: "sans-serif"}}>
      <h2>Pre-Check-In</h2>
      {!id && <p style={{color: "crimson"}}>Invalid link (no booking id).</p>}

      <form onSubmit={handleSubmit} style={{display: "grid", gap: 10}}>
        <label>
          Person dropping the car — First name
          <input
            name="dropoff_firstname"
            value={form.dropoff_firstname}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Surname
          <input
            name="dropoff_surname"
            value={form.dropoff_surname}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Cellphone (e.g. 27XXXXXXXXX)
          <input
            name="dropoff_phone"
            value={form.dropoff_phone}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Driver’s license (front)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>

        <button type="submit" disabled={!id} style={{padding: "10px 16px"}}>
          Submit
        </button>
      </form>

      {status && <p style={{marginTop: 12}}>{status}</p>}
    </div>
  );
}

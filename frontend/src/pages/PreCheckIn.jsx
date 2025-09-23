import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../api";

export default function PreCheckIn() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState(null);
  const [form, setForm] = useState({
    dropoff_firstname: "",
    dropoff_surname: "",
    dropoff_phone: "",
    file: null,
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/precheckin/verify/${token}`)
      .then((res) => {
        setInfo(res.data.booking);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Invalid or expired link.");
        setLoading(false);
      });
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    setStatus("Submitting…");

    const fd = new FormData();
    fd.append("token", token);
    fd.append("dropoff_firstname", form.dropoff_firstname);
    fd.append("dropoff_surname", form.dropoff_surname);
    fd.append("dropoff_phone", form.dropoff_phone);
    if (form.file) fd.append("license_front", form.file);

    try {
      const res = await axios.post(`${API_URL}/precheckin`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success) {
        setStatus("✅ Thanks! Your pre-check-in is submitted.");
      } else {
        setStatus("⚠️ Unexpected response.");
      }
    } catch (err) {
      setStatus(`❌ Error: ${err.response?.data?.error || err.message}`);
    }
  };

  if (loading) return <p style={{ fontFamily: "sans-serif", margin: 24 }}>Loading…</p>;
  if (error) return <p style={{ fontFamily: "sans-serif", margin: 24 }}>{error}</p>;

  return (
    <div style={{ maxWidth: 520, margin: "30px auto", fontFamily: "sans-serif" }}>
      <h2>Pre-check-in</h2>
      <p>
        Please fill the information below for the person <b>dropping the vehicle off</b>.
      </p>
      <div style={{ background: "#f7f7f7", padding: 12, borderRadius: 8, marginBottom: 12 }}>
        <div>
          <b>Booking:</b> {info.firstname} {info.surname}
        </div>
        <div>
          <b>Date:</b> {info.schedule_date} &nbsp; <b>Time:</b> {info.schedule_time}
        </div>
      </div>

      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <label>
          First name (drop-off person)
          <input
            required
            value={form.dropoff_firstname}
            onChange={(e) => setForm((f) => ({ ...f, dropoff_firstname: e.target.value }))}
          />
        </label>
        <label>
          Surname (drop-off person)
          <input
            required
            value={form.dropoff_surname}
            onChange={(e) => setForm((f) => ({ ...f, dropoff_surname: e.target.value }))}
          />
        </label>
        <label>
          Cellphone (drop-off person)
          <input
            required
            value={form.dropoff_phone}
            onChange={(e) => setForm((f) => ({ ...f, dropoff_phone: e.target.value }))}
          />
        </label>
        <label>
          Upload front side of driver’s license
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] || null }))}
          />
        </label>

        <button type="submit" style={{ padding: "10px 16px" }}>
          Submit
        </button>
      </form>

      {status && <p style={{ marginTop: 12 }}>{status}</p>}
    </div>
  );
}

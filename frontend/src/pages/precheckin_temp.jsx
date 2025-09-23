import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function PreCheckIn() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);
  const [form, setForm] = useState({
    dropoff_firstname: "",
    dropoff_surname: "",
    dropoff_phone: "",
    license_front: null,
  });

  useEffect(() => {
    async function verifyToken() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/precheckin/verify/${token}`);
        setBooking(res.data.booking);
      } catch (err) {
        setError(err.response?.data?.error || "Invalid link");
      } finally {
        setLoading(false);
      }
    }
    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("token", token);
    fd.append("dropoff_firstname", form.dropoff_firstname);
    fd.append("dropoff_surname", form.dropoff_surname);
    fd.append("dropoff_phone", form.dropoff_phone);
    if (form.license_front) fd.append("license_front", form.license_front);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/precheckin`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Pre-check-in submitted successfully!");
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Pre-Check-In for {booking.firstname} {booking.surname}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Drop-off First Name</label>
          <input
            type="text"
            value={form.dropoff_firstname}
            onChange={(e) => setForm({ ...form, dropoff_firstname: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Drop-off Surname</label>
          <input
            type="text"
            value={form.dropoff_surname}
            onChange={(e) => setForm({ ...form, dropoff_surname: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Drop-off Phone</label>
          <input
            type="text"
            value={form.dropoff_phone}
            onChange={(e) => setForm({ ...form, dropoff_phone: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Upload Driver’s License (front)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, license_front: e.target.files[0] })}
            required
          />
        </div>
        <button type="submit">Submit Pre-Check-In</button>
      </form>
    </div>
  );
}

export default PreCheckIn;

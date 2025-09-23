import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../api";

export default function ViewBookings() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    axios.get(`${API_URL}/bookings`)
      .then(res => {
        if (mounted) {
          setRows(res.data || []);
          setLoading(false);
        }
      })
      .catch(err => {
        setLoading(false);
        alert(`Error: ${err.response?.data?.error || err.message}`);
      });
    return () => { mounted = false; };
  }, []);

  if (loading) return <p style={{fontFamily:"sans-serif", margin: 24}}>Loading…</p>;

  return (
    <div style={{maxWidth: 900, margin: "24px auto", fontFamily: "sans-serif"}}>
      <h2>All Bookings</h2>
      <table border="1" cellPadding="8" cellSpacing="0" style={{width: "100%", borderCollapse:"collapse"}}>
        <thead>
          <tr>
            <th>Created</th>
            <th>Booking</th>
            <th>Name</th>
            <th>Date</th>
            <th>Time</th>
            <th>Cellphone</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{new Date(r.created_at).toLocaleString()}</td>
              <td>{r.booking_name}</td>
              <td>{r.firstname} {r.surname}</td>
              <td>{r.schedule_date}</td>
              <td>{r.schedule_time}</td>
              <td>{r.cellphone}</td>
              <td>{r.status || "not-prechecked"}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan="7" style={{textAlign:"center"}}>No bookings yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

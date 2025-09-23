import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../api";

export default function ViewBookings() {
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState("not-prechecked"); // or "prechecked"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/bookings`, { params: { status: tab } })
      .then((res) => setRows(res.data || []))
      .catch((err) => alert(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div style={{ maxWidth: 980, margin: "24px auto", fontFamily: "sans-serif" }}>
      <h2>Bookings</h2>

      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => setTab("not-prechecked")}
          style={{ marginRight: 8, padding: "6px 10px", background: tab === "not-prechecked" ? "#eee" : "" }}
        >
          Still to pre-check-in
        </button>
        <button
          onClick={() => setTab("prechecked")}
          style={{ padding: "6px 10px", background: tab === "prechecked" ? "#eee" : "" }}
        >
          Already pre-checked-in
        </button>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Booking</th>
              <th>Name</th>
              <th>Cell</th>
              <th>Status</th>
              {tab === "prechecked" && <th>License</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.schedule_date}</td>
                <td>{r.schedule_time}</td>
                <td>{r.booking_name}</td>
                <td>
                  {r.firstname} {r.surname}
                </td>
                <td>{r.cellphone}</td>
                <td>{r.status}</td>
                {tab === "prechecked" && (
                  <td>{r.license_url ? <a href={r.license_url} target="_blank" rel="noreferrer">View photo</a> : "-"}</td>
                )}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={tab === "prechecked" ? 7 : 6} style={{ textAlign: "center" }}>
                  No bookings
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

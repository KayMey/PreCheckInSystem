import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../api";

export default function ViewBookings() {
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState("not-prechecked");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/bookings`, { params: { status: tab } })
      .then((res) => {
        setRows(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        alert(err.response?.data?.error || err.message);
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f8f9fa",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          maxWidth: "1000px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "20px" }}>Pre-Check-In Demo System</h1>
        <h2 style={{ marginBottom: "20px" }}>Bookings</h2>

        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => setTab("not-prechecked")}
            style={{
              marginRight: "10px",
              padding: "10px 15px",
              background: tab === "not-prechecked" ? "#eee" : "#007bff",
              color: tab === "not-prechecked" ? "#000" : "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Still to pre-check-in
          </button>
          <button
            onClick={() => setTab("prechecked")}
            style={{
              padding: "10px 15px",
              background: tab === "prechecked" ? "#28a745" : "#eee",
              color: tab === "prechecked" ? "#fff" : "#000",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Already pre-checked-in
          </button>
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : (
          <table
            border="1"
            cellPadding="8"
            cellSpacing="0"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
            }}
          >
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Booking</th>
                <th>Name</th>
                <th>Cell</th>
                <th>Status</th>
                <th>License</th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.schedule_date}</td>
                    <td>{r.schedule_time}</td>
                    <td>{r.booking_name}</td>
                    <td>{r.firstname} {r.surname}</td>
                    <td>{r.cellphone}</td>
                    <td>{r.status}</td>
                    <td>
                      {r.license_photo_url ? (
                        <a href={r.license_photo_url} target="_blank" rel="noreferrer">
                          View photo
                        </a>
                      ) : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No bookings</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

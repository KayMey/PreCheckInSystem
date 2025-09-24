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
      .then((res) => setRows(Array.isArray(res.data) ? res.data : []))
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
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "900px",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "20px" }}>Pre-Check-In Demo System</h1>
        <h2 style={{ marginBottom: "20px" }}>Bookings</h2>

        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => setTab("not-prechecked")}
            style={{
              padding: "8px 14px",
              marginRight: "10px",
              background: tab === "not-prechecked" ? "#ddd" : "#f8f9fa",
              border: "1px solid #ccc",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Still to pre-check-in
          </button>
          <button
            onClick={() => setTab("prechecked")}
            style={{
              padding: "8px 14px",
              background: tab === "prechecked" ? "#28a745" : "#f8f9fa",
              color: tab === "prechecked" ? "white" : "black",
              border: "1px solid #ccc",
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
          <div style={{ overflowX: "auto" }}>
            <table
              border="1"
              cellPadding="10"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <thead style={{ background: "#f1f1f1" }}>
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
                {rows.length > 0 ? (
                  rows.map((r) => (
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
                        <td>
                          {r.license_photo_url ? (
                            <a
                              href={r.license_photo_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View photo
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={tab === "prechecked" ? 7 : 6}>
                      No bookings
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

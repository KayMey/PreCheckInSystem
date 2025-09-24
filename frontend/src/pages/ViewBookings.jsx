import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../api";
import Layout from "../Layout";

export default function ViewBookings() {
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState("not-prechecked");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/bookings`, { params: { status: tab } })
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data)) {
          setRows(data);
        } else if (Array.isArray(data?.bookings)) {
          setRows(data.bookings);
        } else {
          setRows([]);
        }
      })
      .catch((err) => {
        alert(err.response?.data?.error || err.message);
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <Layout title="Pre-Check-In Demo System">
      <h3 style={{ marginBottom: "20px" }}>Bookings</h3>

      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setTab("not-prechecked")}
          style={{
            marginRight: 10,
            padding: "8px 12px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            background: tab === "not-prechecked" ? "#6c757d" : "#e9ecef",
            color: tab === "not-prechecked" ? "white" : "black",
          }}
        >
          Still to pre-check-in
        </button>
        <button
          onClick={() => setTab("prechecked")}
          style={{
            padding: "8px 12px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            background: tab === "prechecked" ? "#28a745" : "#e9ecef",
            color: tab === "prechecked" ? "white" : "black",
          }}
        >
          Already pre-checked-in
        </button>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div style={{ width: "100%", overflowX: "auto" }}>
          <table
            border="1"
            cellPadding="8"
            cellSpacing="0"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "white",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <thead style={{ background: "#f1f3f5" }}>
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
              {Array.isArray(rows) && rows.length > 0 ? (
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
                          <a href={r.license_photo_url} target="_blank" rel="noreferrer">
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
                  <td colSpan={tab === "prechecked" ? 7 : 6} style={{ textAlign: "center" }}>
                    No bookings
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

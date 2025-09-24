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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
        background: "#f8f9fa",
        paddingTop: "40px",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          maxWidth: "1000px",
          width: "100%",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Bookings</h2>

        <div style={{ marginBottom: 20, textAlign: "center" }}>
          <button
            onClick={() => setTab("not-prechecked")}
            style={{
              marginRight: 10,
              padding: "10px 20px",
              background: tab === "not-prechecked" ? "#007bff" : "#ddd",
              color: tab === "not-prechecked" ? "white" : "black",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Still to pre-check-in
          </button>
          <button
            onClick={() => setTab("prechecked")}
            style={{
              padding: "10px 20px",
              background: tab === "prechecked" ? "green" : "#ddd",
              color: tab === "prechecked" ? "white" : "black",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Already pre-checked-in
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: "center" }}>Loading…</p>
        ) : (
          <table
            border="1"
            cellPadding="8"
            cellSpacing="0"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "center",
            }}
          >
            <thead style={{ background: "#f1f1f1" }}>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Booking</th>
                <th>Name</th>
                <th>Cell</th>
                <th>Status</th>
                {tab === "prechecked" && (
                  <>
                    <th>ID Number</th>
                    <th>License</th>
                  </>
                )}
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
                      <>
                        <td>{r.dropoff_id_number || "-"}</td>
                        <td>
                          {r.license_photo_url ? (
                            <a href={r.license_photo_url} target="_blank" rel="noreferrer">
                              View photo
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={tab === "prechecked" ? 8 : 6} style={{ textAlign: "center" }}>
                    No bookings
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

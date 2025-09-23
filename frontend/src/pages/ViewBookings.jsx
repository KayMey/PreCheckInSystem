import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ViewBookings() {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [checkedBookings, setCheckedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("pending"); // "pending" or "checked"

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // 🔹 Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const resPending = await axios.get(`${BACKEND_URL}/bookings?status=not-prechecked`);
        const resChecked = await axios.get(`${BACKEND_URL}/bookings?status=prechecked`);

        setPendingBookings(Array.isArray(resPending.data) ? resPending.data : []);
        setCheckedBookings(Array.isArray(resChecked.data) ? resChecked.data : []);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading bookings...</p>;

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Bookings Overview</h2>

      {/* Toggle buttons */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setView("pending")}
          style={{
            marginRight: "10px",
            padding: "10px 20px",
            background: view === "pending" ? "#007bff" : "#f1f1f1",
            color: view === "pending" ? "#fff" : "#000",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Not Yet Pre-Checked-In
        </button>
        <button
          onClick={() => setView("checked")}
          style={{
            padding: "10px 20px",
            background: view === "checked" ? "#28a745" : "#f1f1f1",
            color: view === "checked" ? "#fff" : "#000",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Already Pre-Checked-In
        </button>
      </div>

      {/* 🔹 Pending bookings table */}
      {view === "pending" && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
          <thead>
            <tr style={{ background: "#f1f1f1" }}>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Customer</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Date</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Time</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Cellphone</th>
            </tr>
          </thead>
          <tbody>
            {pendingBookings.map((b) => (
              <tr key={b.id}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {b.firstname} {b.surname}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{b.schedule_date}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{b.schedule_time}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{b.cellphone}</td>
              </tr>
            ))}
            {pendingBookings.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "10px" }}>
                 All customers have pre-checked-in!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* 🔹 Checked bookings table */}
      {view === "checked" && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
          <thead>
            <tr style={{ background: "#f1f1f1" }}>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Customer</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Date</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Time</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Drop-off Name</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Drop-off Phone</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Driver’s License</th>
            </tr>
          </thead>
          <tbody>
            {checkedBookings.map((b) => (
              <tr key={b.id}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {b.firstname} {b.surname}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{b.schedule_date}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{b.schedule_time}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {b.dropoff_firstname} {b.dropoff_surname}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{b.dropoff_phone}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {b.license_url ? (
                    <a href={b.license_url} target="_blank" rel="noopener noreferrer">
                      View License
                    </a>
                  ) : (
                    "Not uploaded"
                  )}
                </td>
              </tr>
            ))}
            {checkedBookings.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "10px" }}>
                  No pre-checked-in customers yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

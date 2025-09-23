import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ViewBookings() {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [checkedBookings, setCheckedBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Pending bookings
        const resPending = await axios.get(
          `${BACKEND_URL}/bookings?status=not-prechecked`
        );
        console.log("Pending bookings raw:", resPending.data);

        if (Array.isArray(resPending.data)) {
          setPendingBookings(resPending.data);
        } else {
          console.error("Expected array for pending bookings, got:", resPending.data);
          setPendingBookings([]);
        }

        // Prechecked bookings
        const resChecked = await axios.get(
          `${BACKEND_URL}/bookings?status=prechecked`
        );
        console.log("Prechecked bookings raw:", resChecked.data);

        if (Array.isArray(resChecked.data)) {
          setCheckedBookings(resChecked.data);
        } else {
          console.error("Expected array for checked bookings, got:", resChecked.data);
          setCheckedBookings([]);
        }
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

      {/* Tabs */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("pending")}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            background: activeTab === "pending" ? "#007bff" : "#ddd",
            color: activeTab === "pending" ? "white" : "black",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Not Yet Pre-Checked-In
        </button>
        <button
          onClick={() => setActiveTab("checked")}
          style={{
            padding: "10px 20px",
            background: activeTab === "checked" ? "#28a745" : "#ddd",
            color: activeTab === "checked" ? "white" : "black",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Already Pre-Checked-In
        </button>
      </div>

      {/* Tables */}
      {activeTab === "pending" && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
          }}
        >
          <thead>
            <tr style={{ background: "#f1f1f1" }}>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Customer
              </th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Date</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Time</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Cellphone
              </th>
            </tr>
          </thead>
          <tbody>
            {pendingBookings.map((b) => (
              <tr key={b.id}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {b.firstname} {b.surname}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {b.schedule_date}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {b.schedule_time}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {b.cellphone}
                </td>
              </tr>
            ))}
            {pendingBookings.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "10px" }}>
                  All customers have pre-checked-in
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {activeTab === "checked" && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
          }}
        >
          <thead>
            <tr style={{ background: "#f1f1f1" }}>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Customer
              </th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Date</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Time</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Drop-off Name
              </th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Drop-off Phone
              </th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Driver’s License
              </th>
            </tr>
          </thead>
          <tbody>
            {checkedBookings.map((b) => (
              <tr key={b.id}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {b.firstname} {b.surname}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {b.schedule_date}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {b.schedule_time}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {b.dropoff_firstname} {b.dropoff_surname}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {b.dropoff_phone}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {b.license_url ? (
                    <a
                      href={b.license_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
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

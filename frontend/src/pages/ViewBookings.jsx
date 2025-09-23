import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ViewBookings() {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [checkedBookings, setCheckedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // 🔹 Fetch bookings on mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const resPending = await axios.get(
          `${BACKEND_URL}/bookings?status=not-prechecked`
        );
        const resChecked = await axios.get(
          `${BACKEND_URL}/bookings?status=prechecked`
        );

        console.log("Pending bookings:", resPending.data);
        console.log("Checked bookings:", resChecked.data);

        setPendingBookings(resPending.data || []);
        setCheckedBookings(resChecked.data || []);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading bookings...</p>;
  }

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>📋 Bookings Overview</h2>

      {/* 🔹 Toggle Buttons */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("pending")}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            background: activeTab === "pending" ? "#007bff" : "#f1f1f1",
            color: activeTab === "pending" ? "white" : "black",
            cursor: "pointer",
          }}
        >
          Not Yet Pre-Checked-In
        </button>
        <button
          onClick={() => setActiveTab("checked")}
          style={{
            padding: "10px 20px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            background: activeTab === "checked" ? "green" : "#f1f1f1",
            color: activeTab === "checked" ? "white" : "black",
            cursor: "pointer",
          }}
        >
          Already Pre-Checked-In
        </button>
      </div>

      {/* 🔹 Pending Bookings Table */}
      {activeTab === "pending" && (
        <table
          style={{
            width: "80%",
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
            {pendingBookings.length > 0 ? (
              pendingBookings.map((b) => (
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
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "10px" }}>
                  All customers have pre-checked-in!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Checked Bookings Table */}
      {activeTab === "checked" && (
        <table
          style={{
            width: "80%",
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
            {checkedBookings.length > 0 ? (
              checkedBookings.map((b) => (
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
              ))
            ) : (
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

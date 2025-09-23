import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import CreateBooking from "./pages/CreateBooking";
import ViewBookings from "./pages/ViewBookings";
import PreCheckIn from "./pages/PreCheckIn";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Employee area */}
        <Route
          path="/employee"
          element={
            <>
              <nav style={{ padding: 12, borderBottom: "1px solid #ddd", fontFamily: "sans-serif" }}>
                <Link to="/employee" style={{ marginRight: 12 }}>Home</Link>
                <Link to="/employee/create" style={{ marginRight: 12 }}>Create Booking</Link>
                <Link to="/employee/view">View Bookings</Link>
              </nav>
              <Home />
            </>
          }
        />
        <Route path="/employee/create" element={<CreateBooking />} />
        <Route path="/employee/view" element={<ViewBookings />} />

        {/* Customer page (link from SMS) */}
        <Route path="/precheckin/:token" element={<PreCheckIn />} />

        {/* Default → employee home (you can change to a landing page later) */}
        <Route path="/" element={<Navigate to="/employee" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

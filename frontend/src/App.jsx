import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import CreateBooking from "./pages/CreateBooking.jsx";
import ViewBookings from "./pages/ViewBookings.jsx";
import PreCheckIn from "./pages/PreCheckIn.jsx"; // NEW

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{padding: 12, borderBottom: "1px solid #ddd", fontFamily:"sans-serif"}}>
        <Link to="/" style={{marginRight: 12}}>Home</Link>
        <Link to="/create" style={{marginRight: 12}}>Create Booking</Link>
        <Link to="/view" style={{marginRight: 12}}>View Bookings</Link>
        <Link to="/precheckin">Pre-Check-In (test)</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateBooking />} />
        <Route path="/view" element={<ViewBookings />} />
        <Route path="/precheckin" element={<PreCheckIn />} /> {/* handles ?id=... */}
      </Routes>
    </BrowserRouter>
  );
}

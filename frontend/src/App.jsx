import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import CreateBooking from "./pages/CreateBooking";
import ViewBookings from "./pages/ViewBookings";
import PreCheckIn from "./pages/PreCheckIn"; // ✅ match filename

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/employee" replace />} />
        <Route path="/employee" element={<Home />} />
        <Route path="/employee/create" element={<CreateBooking />} />
        <Route path="/employee/view" element={<ViewBookings />} />
        {/* ✅ Make sure param matches PreCheckIn.jsx useParams() */}
        <Route path="/precheckin/:id" element={<PreCheckIn />} />
      </Routes>
    </Router>
  );
}

export default App;

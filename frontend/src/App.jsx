import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateBooking from "./pages/CreateBooking";
import ViewBookings from "./pages/ViewBookings";
import PreCheckIn from "./pages/PreCheckIn";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/employee" element={<Home />} />
        <Route path="/employee/create" element={<CreateBooking />} />
        <Route path="/employee/view" element={<ViewBookings />} />
        <Route path="/precheckin/:token" element={<PreCheckIn />} />
      </Routes>
    </Router>
  );
}

export default App;

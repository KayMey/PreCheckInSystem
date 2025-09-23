import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EmployeeHome from "./pages/EmployeeHome";
import CreateBooking from "./pages/CreateBooking";
import ViewBookings from "./pages/ViewBookings";
import PreCheckIn from "./pages/PreCheckIn";   // <-- add this

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/employee" element={<EmployeeHome />} />
        <Route path="/employee/create" element={<CreateBooking />} />
        <Route path="/employee/view" element={<ViewBookings />} />
        <Route path="/precheckin/:token" element={<PreCheckIn />} /> {/* <-- new */}
      </Routes>
    </Router>
  );
}

export default App;

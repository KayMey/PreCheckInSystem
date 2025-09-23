import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{maxWidth: 520, margin: "40px auto", fontFamily: "sans-serif"}}>
      <h1>Pre-Check-In System</h1>
      <p>Select an action:</p>
      <div style={{display: "flex", gap: 12}}>
        <Link to="/create">
          <button style={{padding: "10px 16px"}}>Create Booking</button>
        </Link>
        <Link to="/view">
          <button style={{padding: "10px 16px"}}>View Bookings</button>
        </Link>
      </div>
    </div>
  );
}

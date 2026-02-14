import { Outlet, Link } from "react-router-dom";

export default function App() {
  return (
    <div className="container">
      <nav style={{ marginBottom: "20px" }}>
        <Link to="/">Home</Link> | {" "}
        <Link to="/about">About</Link> | {" "}
        <Link to="/profile">Profile</Link>
      </nav>

      <Outlet />
    </div>
  );
}
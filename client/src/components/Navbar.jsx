
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  ShoppingBag,
  Heart,
  Bell,
  LogOut
} from "lucide-react";

function Navbar() {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">

      <Link to="/" className="logo">
        PricePilot.
      </Link>

      <div className="nav-links">

        <Link to="/">
          <Home size={16} /> Home
        </Link>

        <Link to="/dashboard">
          <LayoutDashboard size={16} /> Dashboard
        </Link>

        <Link to="/products">
          <ShoppingBag size={16} /> Products
        </Link>

        <Link to="/watchlist">
          <Heart size={16} /> Watchlist
        </Link>

        <Link to="/price-alerts">
          <Bell size={16} /> Alerts
        </Link>

        {localStorage.getItem("token") ? (
          <button
            className="nav-button"
            onClick={handleLogout}
          >
            <LogOut size={16} /> Logout
          </button>
        ) : (
          <Link to="/login" className="nav-button">
            Login
          </Link>
        )}

      </div>
    </nav>
  );
}

export default Navbar;

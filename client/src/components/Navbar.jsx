import { Link } from "react-router-dom";

function Navbar() {
  const handleLogout = ()=> {
        localStorage.removeItem("token");
        window.location.href = "/login";
  };
  return (
    <nav>
      
      <Link to="/">
        PricePilot
      </Link>

      <Link to="/register">
        Register
      </Link>

      <Link to="/login">
        Login
      </Link>
      <button onClick={handleLogout}>
          Logout
      </button>
    </nav>
  );
}

export default Navbar;
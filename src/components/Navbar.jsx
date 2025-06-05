import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import LogoutButton from "./LogoutButton";
import "../styles/navbar.css";
import DarkModeToggle from "./DarkModeToggle";

const Navbar = ({ searchQuery, setSearchQuery, onCreateClick }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <div className="navbar-left">
        <h2 className="logo">VIBE</h2>
      </div>

      <div className="navbar-center">
        <input
          className="search-input"
          type="text"
          placeholder="Search by title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="navbar-right">
        <DarkModeToggle />
        <button
          onClick={onCreateClick}
          className="icon-btn create-btn-navbar"
          title="Create"
        >
          +
        </button>
        {!user && (
          <Link to="/login" className="icon-btn">
            Login
          </Link>
        )}
        {user && <LogoutButton />}
      </div>
    </div>
  );
};

export default Navbar;

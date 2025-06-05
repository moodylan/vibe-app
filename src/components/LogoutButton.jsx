import { useContext } from "react";
import { supabase } from "../supabaseClient";
import { AuthContext } from "../context/AuthProvider";
import "../styles/navbar.css";

const LogoutButton = () => {
  const { user } = useContext(AuthContext);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!user) return null;

  return (
    <div>
      <button className="icon-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default LogoutButton;

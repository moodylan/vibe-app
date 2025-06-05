import { supabase } from "../supabaseClient";
import "../styles/login.css";

const Login = () => {
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;

    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert("Login error");
    else alert("Check your email for the login link!");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>VIBE</h1>
        <p className="login-tagline">
          What are you vibing with? <br />
          Share your sounds, sights, and feels.
        </p>
        <form onSubmit={handleLogin}>
          <input
            name="email"
            type="email"
            placeholder="Enter your email..."
            required
          />
          <button type="submit">Send Magic Link</button>
        </form>
      </div>
    </div>
  );
};

export default Login;

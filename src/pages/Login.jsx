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
        <div className="app-details">
          <h1>VIBE</h1>
        </div>

        <h2>Magic Link Login</h2>
        <p className="magic-link-description">
          Enter your email address, and you'll receive a link from Supabase Auth
          to log in
        </p>
        <p></p>
        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email Address:</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
          />
          <button type="submit">Send Magic Link</button>
        </form>
      </div>
    </div>
  );
};

export default Login;

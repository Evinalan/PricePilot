import { useState } from "react";
import { registerUser } from "../api/authApi";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await registerUser({
        name,
        email,
        password
      });

      console.log(data);
      alert("Registration successful!");

    } catch (error) {
      console.log(error);
      alert("Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-decoration auth-decoration-one"></div>
      <div className="auth-decoration auth-decoration-two"></div>

      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">P</div>
          <span>Price<span className="brand-highlight">Pilot</span></span>
        </div>

        <div className="auth-heading">
          <span className="auth-label">GET STARTED</span>
          <h1>Create your account</h1>
          <p>Join PricePilot and start finding better prices today.</p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          <div className="auth-field">
            <label htmlFor="register-name">Full name</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">♙</span>
              <input
                id="register-name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="register-email">Email address</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">✉</span>
              <input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="register-password">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">🔒</span>
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <small className="auth-hint">Use at least 6 characters.</small>
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
            {!loading && <span>→</span>}
          </button>
        </form>

        <div className="auth-divider">
          <span>ALREADY A MEMBER?</span>
        </div>

        <p className="auth-switch">
          Already have an account?
          <a href="/login"> Sign in</a>
        </p>

        <div className="auth-bottom-note">
          <span>✓</span> One account. Smarter shopping.
        </div>
      </div>
    </div>
  );
}

export default Register;
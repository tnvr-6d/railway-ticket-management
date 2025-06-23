import React, { useState } from "react";
import { loginPassenger } from "../api/api";

function Login({ onLogin }) { // Changed from onLoginSuccess to onLogin to match App.js
  const [passengerId, setPassengerId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Attempting login with:", { passengerId, password }); // Debug log
      
      const result = await loginPassenger(passengerId, password);
      
      console.log("Login result:", result); // Debug log

      if (result?.success) {
        alert("✅ Login successful");
        onLogin(result.user.passenger_id); // Pass just the passenger_id to match App.js expectation
      } else {
        setError(result?.message || "❌ Invalid Passenger ID or password");
      }
    } catch (error) {
      console.error("Login error:", error); // Debug log
      setError("❌ Login failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-section">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2>Passenger Login</h2>
            <p>Enter your Passenger ID and password to continue</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Passenger ID</label>
              <input
                className="form-input"
                type="number"
                value={passengerId}
                onChange={(e) => setPassengerId(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>

        <div className="info-cards">
          <div className="info-card">
            <span className="info-icon">🚆</span>
            <h3>Use demo credentials</h3>
            <p>
              Try Passenger ID: <strong>1</strong>, Password: <strong>hash123</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;



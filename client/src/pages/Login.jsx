import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./login.css";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      login(data.user, data.token);
      setOpenSnackbar(true);
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="container">
        {/* Left - Form */}
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <h1 className="head">Sign In</h1>

            <span>Welcome! Please login to your account</span>

            <div className="infield">
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                required
              />
            </div>

            <div className="infield">
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
              />
            </div>

            {error && <p className="error">{error}</p>}

            <a href="#" className="forgot">
              Forgot your password?
            </a>

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Right - Overlay */}
        <div className="overlay-container">
          <div className="overlay-panel">
            <h1>Hello, Welcome!</h1>
            <p>Enter your personal details and see your attendance</p>
            <button
              type="button"
              className="ghost"
              onClick={() => navigate("/register")}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          You have been logged in successfully!
        </MuiAlert>
      </Snackbar>
    </div>
  );
}

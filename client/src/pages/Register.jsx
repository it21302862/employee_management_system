import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./login.css";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");

    try {
      await axios.post("http://localhost:8000/api/auth/register", inputs);

      const res = await axios.post("http://localhost:8000/api/auth/login", {
        email: inputs.email,
        password: inputs.password,
      });

      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (error) {
      setErr(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" id="container">
      {/* Register Form */}
      <div className="form-container sign-in-container">
        <form onSubmit={handleRegister}>
          <h1 className="head">Sign up</h1>
          <div className="social-container">
            <a href="#" className="social">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="social">
              <i className="fab fa-google-plus-g"></i>
            </a>
            <a href="#" className="social">
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
          <span>or use your email for registration</span>
          <div className="infield">
            <input
              type="text"
              name="username"
              placeholder="Username"
              onChange={handleChange}
              required
            />
            <label></label>
          </div>
          <div className="infield">
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />
            <label></label>
          </div>
          <div className="infield">
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
            <label></label>
          </div>
          {err && <p className="error" style={{ color: "red" }}>{err}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>
      </div>

      {/* Overlay Panel */}
      <div className="overlay-container" id="overlayCon">
        <div className="overlay">
          <div className="overlay-panel overlay-right">
            <h1>Welcome Back!</h1>
            <p>Already have an account? Sign in now</p>
            <button
              type="button"
              className="ghost"
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

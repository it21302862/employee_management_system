import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./login.css"; // Scoped styles are applied inside .register-container

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
    employeeId: "",
    profileImage: "",
    position: "",
    age: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
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
      await axios.post("api/auth/register", inputs);

      const res = await axios.post("api/auth/login", {
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
    <div className="register-container">
      <div className="container" id="container">
        {/* Register Form */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleRegister}>
            <h1 className="head">Sign up</h1>
            <span>Please enter your details to Sign up</span>

            <div className="infield">
              <input
                type="text"
                name="name"
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

            <div className="infield">
              <select name="role" onChange={handleChange} value={inputs.role}>
                <option value="emp">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="infield">
              <input
                type="text"
                name="employeeId"
                placeholder="Employee ID"
                onChange={handleChange}
                required
              />
              <label></label>
            </div>

            <div className="infield">
              <input
                type="text"
                name="profileImage"
                placeholder="Profile Image URL"
                onChange={handleChange}
              />
              <label></label>
            </div>

            <div className="infield">
              <input
                type="text"
                name="position"
                placeholder="Position"
                onChange={handleChange}
              />
              <label></label>
            </div>

            <div className="infield">
              <input
                type="number"
                name="age"
                placeholder="Age"
                onChange={handleChange}
                min="18"
                max="100"
              />
              <label></label>
            </div>

            <div className="infield">
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                onChange={handleChange}
              />
              <label></label>
            </div>

            <div className="infield">
              <input
                type="text"
                name="address"
                placeholder="Address"
                onChange={handleChange}
              />
              <label></label>
            </div>

            <div className="infield">
              <input
                type="text"
                name="city"
                placeholder="City"
                onChange={handleChange}
              />
              <label></label>
            </div>

            <div className="infield">
              <input
                type="text"
                name="zipCode"
                placeholder="Zip Code"
                onChange={handleChange}
              />
              <label></label>
            </div>

            {err && <p className="error">{err}</p>}

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
    </div>
  );
}

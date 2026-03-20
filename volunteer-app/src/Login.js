 import React, { useState } from "react";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (email && password) {
      onLogin();
    } else {
      alert("Enter email & password");
    }
  };

  return (
    <div style={container}>
      
      <div style={loginBox}>
        <h2 style={{ marginBottom: "10px" }}>Volunteer Login</h2>
        <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
          Smart Tourist Safety System
        </p>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={input}
        />

        <select style={input}>
          <option>Volunteer</option>
        </select>

        <button onClick={handleLogin} style={btn}>
          Login
        </button>

        <p style={{ marginTop: "15px", fontSize: "12px", color: "#64748b" }}>
          Secure access for authorized volunteers only
        </p>
      </div>

    </div>
  );
}

/* STYLES */

const container = {
  height: "100vh",
  background: "linear-gradient(135deg, #0f172a, #020617)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "Segoe UI"
};

const loginBox = {
  background: "#1e293b",
  padding: "40px",
  borderRadius: "12px",
  width: "320px",
  color: "white",
  boxShadow: "0 0 30px rgba(0,0,0,0.6)"
};

const input = {
  width: "100%",
  padding: "10px",
  margin: "10px 0",
  borderRadius: "6px",
  border: "none",
  outline: "none"
};

const btn = {
  width: "100%",
  padding: "10px",
  marginTop: "10px",
  background: "#3b82f6",
  border: "none",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold"
};

export default Login;
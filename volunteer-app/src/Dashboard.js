 import React, { useState, useEffect } from "react";

function Dashboard({ onLogout }) {
  const [taskStatus, setTaskStatus] = useState("Received");
  const [location, setLocation] = useState(null);

  // 📍 GET LIVE GPS LOCATION
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        alert("Please allow location access");
      }
    );
  }, []);

  return (
    <div style={container}>

      {/* SIDEBAR */}
      <div style={sidebar}>
        <div>
          <h2>👤 Volunteer</h2>
          <p style={{ fontSize: "12px" }}>volunteer@help.com</p>
        </div>

        <div style={{ marginTop: "30px" }}>
          <p>🏠 Dashboard</p>
          <p>🚨 Alerts</p>
          <p>📍 Map</p>
          <p>🔔 Notifications</p>
        </div>
      </div>

      {/* MAIN AREA */}
      <div style={main}>

        {/* HEADER */}
        <div style={header}>
          <h2>Dashboard</h2>
          <button onClick={onLogout} style={logoutBtn}>Logout</button>
        </div>

        {/* STATS */}
        <div style={stats}>
          <div style={statCard}>👥 Tourists: 24</div>
          <div style={statCard}>🚨 Alerts: 5</div>
          <div style={statCard}>🧑 Volunteers: 12</div>
          <div style={statCard}>⚠️ Risk Zones: 3</div>
        </div>

        {/* CONTENT */}
        <div style={content}>

          {/* LEFT PANEL */}
          <div style={panel}>

            <h3>🚨 Alerts</h3>
            <p>Flood Alert - Area A</p>
            <button onClick={() => setTaskStatus("Accepted")} style={btn}>Accept</button>

            <h3 style={{ marginTop: "20px" }}>📊 Status: {taskStatus}</h3>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={() => setTaskStatus("On the Way")} style={btn}>On the Way</button>
              <button onClick={() => setTaskStatus("Reached")} style={btn}>Reached</button>
              <button onClick={() => setTaskStatus("Helping")} style={btn}>Helping</button>
              <button onClick={() => setTaskStatus("Completed")} style={btn}>Completed</button>
            </div>

          </div>

          {/* RIGHT PANEL */}
          <div style={panel}>

            <h3>📍 Live GPS Map</h3>

            {location ? (
              <iframe
                title="map"
                src={`https://www.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
                width="100%"
                height="250"
                style={{ border: 0, borderRadius: "10px" }}
              ></iframe>
            ) : (
              <p>Fetching your location...</p>
            )}

            <h3 style={{ marginTop: "20px" }}>🔔 Notifications</h3>
            <p>🚨 Alert received</p>
            <p>📍 Tourist unsafe</p>
            <p>✅ Task {taskStatus}</p>

          </div>

        </div>

      </div>
    </div>
  );
}

/* STYLES */

const container = {
  display: "flex",
  height: "100vh",
  fontFamily: "Segoe UI"
};

const sidebar = {
  width: "220px",
  background: "#1e293b",
  color: "white",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between"
};

const main = {
  flex: 1,
  background: "#0f172a",
  padding: "20px",
  color: "white"
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const logoutBtn = {
  background: "#ef4444",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer"
};

const stats = {
  display: "flex",
  gap: "15px",
  marginTop: "20px"
};

const statCard = {
  flex: 1,
  background: "#1e293b",
  padding: "15px",
  borderRadius: "10px",
  textAlign: "center"
};

const content = {
  display: "flex",
  gap: "20px",
  marginTop: "20px"
};

const panel = {
  flex: 1,
  background: "#1e293b",
  padding: "20px",
  borderRadius: "12px"
};

const btn = {
  background: "#3b82f6",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  color: "white",
  marginTop: "10px",
  cursor: "pointer"
};

export default Dashboard;
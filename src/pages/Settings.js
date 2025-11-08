import React from "react";

import '../App.css';

function Settings() {
  return (
    <main className="main-content">
      <h1>Settings</h1>
      <section className="chart-section">
        <h2>Business Settings</h2>
        <form style={{ display: "grid", gap: "20px", maxWidth: "500px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Business Name</label>
            <input
              type="text"
              defaultValue="Foodics Clone Cafe"
              style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Email</label>
            <input
              type="email"
              defaultValue="info@foodicsclone.com"
              style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Phone</label>
            <input
              type="tel"
              defaultValue="+201113945587"
              style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}
            />
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: "#4c1d95",
              color: "#fff",
              padding: "12px",
              borderRadius: "6px",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
            }}
          >
            Save Changes
          </button>
        </form>
      </section>
    </main>
  );
}

export default Settings;

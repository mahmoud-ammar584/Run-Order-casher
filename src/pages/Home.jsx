import React from "react";

const Home = () => {
  const metrics = [
    { title: "Total Orders", value: 1280, trend: "positive" },
    { title: "Revenue", value: "$15,230", trend: "positive" },
    { title: "Customers", value: 320, trend: "neutral" },
    { title: "Low Stock Items", value: 12, trend: "negative" },
  ];

  return (
    <div>
      <div className="dashboard-header">
        <h1>Home Dashboard</h1>
      </div>
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="dashboard-card">
            <div className="card-title">{metric.title}</div>
            <div className="card-value">{metric.value}</div>
            <div className={`card-trend ${metric.trend}`}>
              {metric.trend === "positive" ? "▲" : metric.trend === "negative" ? "▼" : "■"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;

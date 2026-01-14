import React from "react";
import './DashboardCard.css';
import '../App.css';

function DashboardCard({ title, value, trend, trendType }) {
  return (
    <div className="dashboard-card">
      <h3 className="card-title">{title}</h3>
      <p className="card-value">{value}</p>
      <p className={`card-trend ${trendType}`}>{trend}</p>
    </div>
  );
}

export default DashboardCard;

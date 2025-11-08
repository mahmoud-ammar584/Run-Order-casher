import React from "react";
import '../App.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { monthlyRevenue, dashboardStats } from "../data";

ChartJS.register(
  CategoryScale, LinearScale, LineElement, PointElement, BarElement,
  Title, Tooltip, Legend
);

function Analytics() {
  const lineData = {
    labels: monthlyRevenue.labels,
    datasets: [
      {
        label: "Monthly Revenue",
        data: monthlyRevenue.data,
        borderColor: "#4c1d95",
        backgroundColor: "rgba(76,29,149,0.12)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const barData = {
    labels: dashboardStats.weeklyLabels,
    datasets: [
      {
        label: "Weekly Sales",
        data: dashboardStats.weeklySales,
        backgroundColor: "#4c1d95"
      }
    ]
  };

  return (
    <main className="main-content">
      <h1>Analytics</h1>

      <section className="chart-section">
        <h2>Revenue Trend (Year)</h2>
        <Line data={lineData} />
      </section>

      <section className="chart-section">
        <h2>Weekly Sales</h2>
        <Bar data={barData} />
      </section>
    </main>
  );
}

export default Analytics;

import React from "react";
import DashboardCard from "../components/DashboardCard";
import '../App.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Daily Sales ($)",
        data: [1200, 1950, 3100, 4800, 2900, 3400, 4300],
        backgroundColor: "#4c1d95",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: false },
    },
  };

  const fakeOrders = [
    { id: "#1024", customer: "Ahmed Khaled", amount: "$75.00", status: "Completed" },
    { id: "#1025", customer: "Sarah Ali", amount: "$42.50", status: "Pending" },
    { id: "#1026", customer: "Omar Hassan", amount: "$99.00", status: "Cancelled" },
  ];

  return (
    <main className="main-content">
      <header className="dashboard-header">
        <h1>Dashboard Overview</h1>
      </header>

      <section className="metrics-grid">
        <DashboardCard title="Total Sales" value="$15,450" trend="+12% increase" trendType="positive" />
        <DashboardCard title="Orders Count" value="342" trend="-3% decrease" trendType="negative" />
        <DashboardCard title="Average Order Value" value="$45.17" trend="Stable" trendType="neutral" />
      </section>

      <section className="chart-section">
        <h2>Weekly Sales Chart</h2>
        <Bar data={data} options={options} />
      </section>

      <section className="chart-section">
        <h2>Recent Orders</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
              <th style={{ padding: "10px" }}>Order ID</th>
              <th style={{ padding: "10px" }}>Customer</th>
              <th style={{ padding: "10px" }}>Amount</th>
              <th style={{ padding: "10px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {fakeOrders.map((order, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "10px" }}>{order.id}</td>
                <td style={{ padding: "10px" }}>{order.customer}</td>
                <td style={{ padding: "10px" }}>{order.amount}</td>
                <td
                  style={{
                    padding: "10px",
                    color:
                      order.status === "Completed"
                        ? "#10b981"
                        : order.status === "Pending"
                        ? "#f59e0b"
                        : "#ef4444",
                    fontWeight: "600",
                  }}
                >
                  {order.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

export default Dashboard;

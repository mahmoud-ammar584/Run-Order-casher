import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { FaHome, FaBox, FaShoppingCart, FaClipboardList, FaChartBar } from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./App.css";

const Sidebar = () => (
  <div className="sidebar">
    <div className="logo">Foodics Clone</div>
    <nav>
      <ul>
        <li><Link to="/" className="active"><FaHome /> Home</Link></li>
        <li><Link to="/inventory"><FaBox /> Inventory</Link></li>
        <li><Link to="/orders"><FaShoppingCart /> Orders</Link></li>
        <li><Link to="/products"><FaClipboardList /> Products</Link></li>
        <li><Link to="/reports"><FaChartBar /> Reports</Link></li>
      </ul>
    </nav>
  </div>
);

const Navbar = () => (
  <div className="navbar">
    <h2 className="logo">Foodics Clone</h2>
    <div className="navbar-right">
      <FaChartBar className="icon" />
    </div>
  </div>
);

const DashboardCard = ({ title, value, trend }) => (
  <div className="dashboard-card">
    <div className="card-title">{title}</div>
    <div className="card-value">{value}</div>
    <div className={`card-trend ${trend.type}`}>{trend.text}</div>
  </div>
);

const Home = () => {
  const metrics = [
    { title: "Total Sales", value: "$12,345", trend: { text: "+5%", type: "positive" } },
    { title: "Orders", value: "123", trend: { text: "-2%", type: "negative" } },
    { title: "Customers", value: "89", trend: { text: "0%", type: "neutral" } },
    { title: "Products", value: "56", trend: { text: "+8%", type: "positive" } },
  ];

  const data = [
    { name: "Jan", Sales: 4000, Orders: 2400 },
    { name: "Feb", Sales: 3000, Orders: 1398 },
    { name: "Mar", Sales: 2000, Orders: 9800 },
    { name: "Apr", Sales: 2780, Orders: 3908 },
    { name: "May", Sales: 1890, Orders: 4800 },
    { name: "Jun", Sales: 2390, Orders: 3800 },
    { name: "Jul", Sales: 3490, Orders: 4300 },
  ];

  return (
    <div className="main-content">
      <Navbar />
      <div className="dashboard-header">
        <h1>Dashboard</h1>
      </div>
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <DashboardCard key={index} {...metric} />
        ))}
      </div>
      <div className="chart-section">
        <h2>Sales & Orders</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Sales" stroke="#4c1d95" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="Orders" stroke="#10b981" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const Inventory = () => (
  <div className="main-content">
    <Navbar />
    <h1>Inventory</h1>
    <p>Here is some dummy inventory data to show layout.</p>
  </div>
);

const Orders = () => (
  <div className="main-content">
    <Navbar />
    <h1>Orders</h1>
    <p>Dummy orders list displayed here.</p>
  </div>
);

const Products = () => (
  <div className="main-content">
    <Navbar />
    <h1>Products</h1>
    <p>Dummy products list displayed here.</p>
  </div>
);

const Reports = () => (
  <div className="main-content">
    <Navbar />
    <h1>Reports</h1>
    <p>Dummy reports data displayed here.</p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/products" element={<Products />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

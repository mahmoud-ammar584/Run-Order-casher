import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">Foodics Clone</div>
      <nav>
        <ul>
          <li>
            <NavLink to="/" end>Home</NavLink>
          </li>
          <li>
            <NavLink to="/inventory">Inventory</NavLink>
          </li>
          <li>
            <NavLink to="/orders">Orders</NavLink>
          </li>
          <li>
            <NavLink to="/products">Products</NavLink>
          </li>
          <li>
            <NavLink to="/reports">Reports</NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;

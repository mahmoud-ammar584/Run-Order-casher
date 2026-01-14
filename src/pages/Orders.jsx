import React from "react";

const Orders = () => {
  const orders = [
    { id: 1, customer: "Ali", total: "$120", status: "Delivered" },
    { id: 2, customer: "Sara", total: "$250", status: "Pending" },
    { id: 3, customer: "Hassan", total: "$80", status: "Cancelled" },
  ];

  return (
    <div>
      <h1>Orders</h1>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customer}</td>
              <td>{order.total}</td>
              <td>{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;

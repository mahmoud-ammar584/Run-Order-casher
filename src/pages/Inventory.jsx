import React from "react";

const Inventory = () => {
  const data = [
    { id: 1, name: "Tomatoes", stock: 120, unit: "kg" },
    { id: 2, name: "Cheese", stock: 50, unit: "kg" },
    { id: 3, name: "Chicken", stock: 200, unit: "kg" },
  ];

  return (
    <div>
      <h1>Inventory</h1>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Item</th>
            <th>Stock</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.stock}</td>
              <td>{item.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inventory;

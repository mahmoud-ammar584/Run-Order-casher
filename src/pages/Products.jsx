import React from "react";

const Products = () => {
  const products = [
    { id: 1, name: "Burger", price: "$5", category: "Fast Food" },
    { id: 2, name: "Pizza", price: "$8", category: "Fast Food" },
    { id: 3, name: "Pasta", price: "$7", category: "Italian" },
  ];

  return (
    <div>
      <h1>Products</h1>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Price</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.price}</td>
              <td>{p.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Products;

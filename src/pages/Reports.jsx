import React from "react";

const Reports = () => {
  const reports = [
    { id: 1, title: "Monthly Sales", value: "$5,000" },
    { id: 2, title: "Top Product", value: "Pizza" },
    { id: 3, title: "New Customers", value: 45 },
  ];

  return (
    <div>
      <h1>Reports</h1>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Report</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.title}</td>
              <td>{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reports;

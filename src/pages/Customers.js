import React, { useMemo } from "react";
import { useTable, useSortBy, usePagination } from "react-table";
import { customersData } from "../data";
import '../App.css';

function Customers() {
  const data = useMemo(() => customersData, []);
  const columns = useMemo(
    () => [
      { Header: "Customer ID", accessor: "id" },
      { Header: "Name", accessor: "name" },
      { Header: "Email", accessor: "email" },
      { Header: "Orders", accessor: "orders" },
      { Header: "Total Spent", accessor: "totalSpent" },
      { Header: "Joined", accessor: "joined" },
    ],
    []
  );

  const {
    getTableProps, getTableBodyProps, headerGroups, page, prepareRow,
    canPreviousPage, canNextPage, pageOptions, nextPage, previousPage, state: { pageIndex },
    gotoPage, pageCount
  } = useTable({ columns, data, initialState: { pageIndex: 0, pageSize: 5 } }, useSortBy, usePagination);

  return (
    <main className="main-content">
      <h1>Customers</h1>
      <section className="chart-section">
        <h2>Top Customers</h2>
        <table {...getTableProps()} style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            {headerGroups.map(hg => (
              <tr {...hg.getHeaderGroupProps()}>
                {hg.headers.map(col => (
                  <th
                    {...col.getHeaderProps(col.getSortByToggleProps())}
                    style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #eee", cursor: "pointer" }}
                  >
                    {col.render("Header")}
                    <span style={{ marginLeft: 8 }}>{col.isSorted ? (col.isSortedDesc ? " 🔽" : " 🔼") : ""}</span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} style={{ borderBottom: "1px solid #eee" }}>
                  {row.cells.map(cell => <td {...cell.getCellProps()} style={{ padding: "10px" }}>{cell.render("Cell")}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>{"<<"}</button>
          <button onClick={() => previousPage()} disabled={!canPreviousPage}>Prev</button>
          <span>Page <strong>{pageIndex + 1} of {pageOptions.length}</strong></span>
          <button onClick={() => nextPage()} disabled={!canNextPage}>Next</button>
          <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>{">>"}</button>
        </div>
      </section>
    </main>
  );
}

export default Customers;

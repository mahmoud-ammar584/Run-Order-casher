export const dashboardStats = {
  totalSales: "$15,450",
  ordersCount: 342,
  avgOrderValue: "$45.17",
  weeklySales: [1200, 1950, 3100, 4800, 2900, 3400, 4300],
  weeklyLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
};

export const ordersData = [
  { id: "#1024", customer: "Ahmed Khaled", items: 3, total: "$75.00", status: "Completed", date: "2025-11-01" },
  { id: "#1025", customer: "Sarah Ali", items: 2, total: "$42.50", status: "Pending", date: "2025-11-02" },
  { id: "#1026", customer: "Omar Hassan", items: 4, total: "$99.00", status: "Cancelled", date: "2025-11-03" },
  { id: "#1027", customer: "Nour Hassan", items: 1, total: "$22.00", status: "Completed", date: "2025-11-04" },
  { id: "#1028", customer: "Ali Youssef", items: 5, total: "$134.00", status: "Completed", date: "2025-11-05" },
  { id: "#1029", customer: "Fatma Omar", items: 2, total: "$38.00", status: "Pending", date: "2025-11-06" },
];

export const customersData = [
  { id: "C001", name: "Ahmed Khaled", email: "ahmed@example.com", orders: 12, totalSpent: "$1,200.00", joined: "2024-02-10" },
  { id: "C002", name: "Sarah Ali", email: "sarah@example.com", orders: 5, totalSpent: "$320.50", joined: "2024-06-23" },
  { id: "C003", name: "Omar Hassan", email: "omar@example.com", orders: 3, totalSpent: "$99.00", joined: "2025-01-12" },
  { id: "C004", name: "Nour Hassan", email: "nour@example.com", orders: 8, totalSpent: "$610.00", joined: "2023-12-05" },
  { id: "C005", name: "Ali Youssef", email: "ali@example.com", orders: 20, totalSpent: "$2,430.00", joined: "2022-09-01" },
];

export const productsData = [
  { sku: "P001", name: "Beef Burger", price: "$6.00", stock: 120, sold: 420 },
  { sku: "P002", name: "Chicken Burger", price: "$5.50", stock: 80, sold: 310 },
  { sku: "P003", name: "French Fries", price: "$2.00", stock: 200, sold: 800 },
  { sku: "P004", name: "Coke 330ml", price: "$1.50", stock: 20, sold: 290 },
  { sku: "P005", name: "Cheese Pizza", price: "$8.00", stock: 45, sold: 150 },
];

export const monthlyRevenue = {
  labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  data: [12000, 15500, 19000, 23000, 18000, 25000, 31000, 28000, 27000, 32000, 35000, 40000]
};

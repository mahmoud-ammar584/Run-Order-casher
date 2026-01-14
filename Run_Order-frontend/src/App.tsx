import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import POSPage from './pages/POS/POSPage';
import CategoriesPage from './pages/Dashboard/CategoriesPage';
import ItemsPage from './pages/Dashboard/ItemsPage';
import TablesPage from './pages/Dashboard/TablesPage';
import InventoryPage from './pages/Inventory/InventoryPage';
import RecipesPage from './pages/Recipes/RecipesPage';
import ReportsPage from './pages/Reports/ReportsPage';
import AccountingPage from './pages/Accounting/AccountingPage';
import KitchenDisplayPage from './pages/KDS/KitchenDisplayPage';
import DashboardLayout from './components/Layout/DashboardLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/pos" element={<ProtectedRoute><POSPage /></ProtectedRoute>} />
          <Route path="/kds" element={<ProtectedRoute><KitchenDisplayPage /></ProtectedRoute>} />

          {/* Dashboard Routes - Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard/categories" replace />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="items" element={<ItemsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="recipes" element={<RecipesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="accounting" element={<AccountingPage />} />
            <Route path="tables" element={<TablesPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

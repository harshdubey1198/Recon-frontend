import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import CreateNews from "./pages/CreateNews";
import NewsList from "./pages/NewsList";
import Dashboard from "./pages/Dashboard";
import NewsDetail from "./pages/NewsDetail";
import AccessControl from "./pages/AccessControl";
import UserAccessList from "./pages/UserAcessList";
import ProtectedRoute from "./components/ProtectedRoute";
import SidebarLayout from "./components/SidebarLayout";
import CategoryMapping from "./pages/CategoryMapping";
import AllCategories from "./pages/AllCategories";
import PortalManagement from "./pages/PortalManagement";
import UserCategories from "./pages/UserCategories";
import NewsReports from "./pages/NewsReports";
import UserStats from "./pages/UserStats";
import PortalList from "./pages/PortalList";
import CategoryList from "./pages/CategoryList";
import GoogleAnalytics from "./pages/GoogleAnalytics";
import { ToastContainer } from "react-toastify";
import UserPortalMapping from "./pages/UserPortalMapping";
import PortalCategoryMapping from "./pages/PortalCategoryMapping";

// Master-only route wrapper component
function MasterRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
  const isMaster = user?.role === "master";
  
  if (!isMaster) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public routes */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Protected routes with Sidebar */}
      <Route
        element={
          <ProtectedRoute>
            <SidebarLayout />
          </ProtectedRoute>
        }
      >
        {/* Common routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-news" element={<CreateNews />} />
        <Route path="/edit-news/:id" element={<CreateNews />} />
        <Route path="/news-list" element={<NewsList />} />
        <Route path="/news/:id" element={<NewsDetail />} />

        {/* Master-only routes - Always defined, protected by MasterRoute */}
        <Route path="/portal-mapping" element={<MasterRoute><UserPortalMapping /></MasterRoute>} />
        <Route path="/Portal-category-mapping" element={<MasterRoute><PortalCategoryMapping /></MasterRoute>} />
        {/* <Route path="/category-insights" element={<MasterRoute><CategoryList /></MasterRoute>} /> */}
        <Route path="/portal-insights" element={<MasterRoute><PortalList /></MasterRoute>} />
        <Route path="/user-stats" element={<MasterRoute><UserStats /></MasterRoute>} />
        <Route path="/portal-management" element={<MasterRoute><PortalManagement /></MasterRoute>} />
        <Route path="/user-access-list" element={<MasterRoute><UserAccessList /></MasterRoute>} />
        <Route path="/news-reports" element={<MasterRoute><NewsReports /></MasterRoute>} />
        <Route path="/all-categories" element={<MasterRoute><AllCategories /></MasterRoute>} />
        <Route path="/user-categories" element={<MasterRoute><UserCategories /></MasterRoute>} />
        <Route path="/analytics" element={<MasterRoute><GoogleAnalytics /></MasterRoute>} />
      </Route>

      {/* Catch-all */}
      <Route
        path="*"
        element={<div style={{ padding: 20 }}>404 — Page not found</div>}
      />
    </Routes>
  );
}
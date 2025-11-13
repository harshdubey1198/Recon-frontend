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
import { ToastContainer } from "react-toastify";

export default function AppRoutes() {
  // const authUser = JSON.parse(localStorage.getItem("auth_data") || "{}");
  // const role = authUser?.data?.role || null;
  // const isMaster = role === "master";

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

        {/* Master-only routes */}
        
          <>
            <Route path="/category-mapping" element={<CategoryMapping />} />
            <Route path="/category-insights" element={<CategoryList />} />
            <Route path="/portal-insights" element={<PortalList />} />
            <Route path="/access-control" element={<AccessControl />} />
            <Route path="/user-stats" element={<UserStats />} />
            <Route path="/portal-management" element={<PortalManagement />} />
            <Route path="/user-access-list" element={<UserAccessList />} />
            <Route path="/news-reports" element={<NewsReports />} />
            <Route path="/all-categories" element={<AllCategories />} />
            <Route path="/user-categories" element={<UserCategories />} />
          </>
       
      </Route>

      {/* Catch-all */}
      <Route
        path="*"
        element={<div style={{ padding: 20 }}>404 — Page not found</div>}
      />
    </Routes>
  );
}
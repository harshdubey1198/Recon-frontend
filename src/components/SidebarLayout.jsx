import React, { useState } from "react";
import {
  Home,
  User,
  Menu,
  X,
  LogOut,
  FilePlus2,
  Newspaper,
  BarChart3,
  ShieldCheck,
  FolderTree,
  Network,
  Building2,
  Layers,
  BarChart2,
  Users2,
} from "lucide-react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import formatUsername from "../utils/formateName";

export default function SidebarLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMaster = user?.role === "master";

  
  
  const menuItems = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "Create News", icon: FilePlus2, path: "/create-news" },
    { name: "News List", icon: Newspaper, path: "/news-list" },
    { name: "News Reports", icon: BarChart3, path: "/news-reports" },
    ...(isMaster
      ? [
          { name: "Portal List", icon: Building2, path: "/portal-list" },
          { name: "Category Mapping", icon: Network, path: "/category-mapping" },
          { name: "All Categories", icon: FolderTree, path: "/all-categories" },
          { name: "Category Insights", icon: BarChart2, path: "/category-insights" },
          { name: "User Access Control", icon: ShieldCheck, path: "/access-control" },
          { name: "User Categories", icon: Layers, path: "/user-categories" },
          { name: "User Stats", icon: BarChart3, path: "/user-stats" },
          { name: "Portal Management", icon: Users2, path: "/portal-management" },
          { name: "User Portal Sync", icon: Building2, path: "/user-access-list" },
        ]
        : []),
      ];
      const currentPage =
      menuItems.find((item) => location.pathname === item.path)?.name || "";

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5 text-gray-600" />
          ) : (
            <Menu className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-20 px-6 border-b border-gray-100 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <h1 className="text-2xl font-bold text-black">Recon</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto mt-4 px-3">
          <ul className="space-y-1">
            {menuItems.map(({ name, icon: Icon, path }) => {
              const isActive = location.pathname === path;
              return (
                <li key={name}>
                  <button
                    onClick={() => {
                      navigate(path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm scale-[1.02]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? "text-blue-600" : "text-gray-400"
                      }`}
                    />
                    <span className="flex-1 text-left">{name}</span>
                    {isActive && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-black to-gray-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-900 flex-1 truncate">
              {formatUsername(user.username)}
            </p>
            <button
              onClick={logout}
              title="Logout"
              className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 ml-0 lg:ml-72 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm backdrop-blur-sm bg-white/95 sticky top-0 z-30">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="lg:hidden w-10"></div>
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {currentPage || "Dashboard"}
                  </h2>
                </div>

                {/* Right section */}
                <div className="flex items-center relative">
                 <div className="absolute right-0 mt-2 w-30 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                        <button
                          onClick={logout}
                          className="w-auto bg-black text-white flex items-center px-4 py-2 text-md justify-center"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </div>
                     </div>
              </div>
            </div>
          </header>

        {/* Routed Page Content */}
        <div className="p-6 flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

import React, { useState } from "react";
import { Home, User, Menu, X, LogOut, BarChart3, FilePlus2, Newspaper, ShieldCheck, Network, Building2, BarChart2,} from "lucide-react";
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
    ...(isMaster
      ? [
        // { name: "Category Insights", icon: BarChart2, path: "/category-insights" },
        { name: "Portal Insights", icon: Building2, path: "/portal-insights" },
        { name: "Portal Category Mapping", icon: Network, path: "/Portal-category-mapping" },
        { name: "User Portal Mapping", icon: ShieldCheck, path: "/portal-mapping" },
        // { name: "User Category Mapping", icon: ShieldCheck, path: "/access-control" },
          { name: "User Stats", icon: BarChart3, path: "/user-stats" },
          { name: "User Portal Management", icon: User, path: "/portal-management" },
          { name: "User Data", icon: Building2, path: "/user-access-list" },
          { name: "News Reports", icon: BarChart3, path: "/news-reports" },
          { name: "Google Analytics", icon: BarChart3, path: "/analytics" },
        ]
      : []),
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Get current page name from location
  const getCurrentPageName = () => {
    const currentItem = menuItems.find(item => location.pathname === item.path);
    return currentItem ? currentItem.name : "Dashboard";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 z-50">
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
        className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 shadow-lg
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }
      `}
      >
        {/* Logo/Brand - Fixed at top */}
        <div className="flex items-center justify-center h-20 px-6 border-b border-gray-100 bg-white flex-shrink-0 mr-[80px]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shadow-md cursor-pointer"
            onClick={() => navigate("/dashboard")}
            >
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <h1 className="text-2xl font-bold text-black">Recon</h1>
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Navigation */}
          <nav className="mt-4 sm:mt-6 px-3 sm:px-4">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <li key={item.name}>
                    <button
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`
                        w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium
                        transition-all duration-200 ease-in-out group
                        ${
                          isActive
                            ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm transform scale-[1.02]"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm hover:transform hover:scale-[1.01]"
                        }
                      `}
                    >
                      <Icon
                        className={`w-5 h-5 transition-all duration-200 ${
                          isActive
                            ? "text-blue-600 transform scale-110"
                            : "text-gray-400 group-hover:text-gray-600"
                        }`}
                      />
                      <span className="flex-1 text-left">{item.name}</span>
                      {isActive && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* User section at bottom - Fixed */}
        <div className="p-3 sm:p-4 border-t border-gray-100 bg-white flex-shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-xl bg-gray-100 hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-black to-gray-500 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate group-hover:text-blue-700 transition-colors duration-200">
                {formatUsername(user.username)}
              </p>
            </div>
            <button
              title="Logout"
              onClick={logout}
              className="text-gray-400 group-hover:text-blue-600 transition-colors duration-200 flex-shrink-0"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 ml-0 lg:ml-72 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
          {/* Header - Fixed at top */}
          <header className="bg-white border-b border-gray-200 shadow-sm backdrop-blur-sm bg-white/95 sticky top-0 z-30">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="lg:hidden w-10"></div>
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {getCurrentPageName()}
                  </h2>
                </div>

                {/* Right section */}
                <div className="flex items-center relative">
                  <button
                    onClick={logout}
                    className="bg-black text-white flex items-center px-4 py-2 text-sm rounded-md hover:bg-gray-800 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Page content - Scrollable */}
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
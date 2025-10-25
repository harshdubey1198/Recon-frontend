import React, { useState, useEffect } from "react";
import {Home,User,Settings,Menu,X,FileText,LogOut,List,ListTree, FilePlus, Shield, Users, Network, Settings2, Layers} from "lucide-react";
import Dashboard from "../pages/Dashboard";
import CreateNews from "../pages/CreateNews";
import NewsList from "../pages/NewsList";
import AccessControl from "../pages/AccessControl";
import UserAccessList from "../pages/UserAcessList";
import CategoryMapping from "../pages/CategoryMapping";
import AllCategories from "../pages/AllCategories";
import PortalManagement from "../pages/PortalManagement";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserCategories from "../pages/UserCategories";



export default function SidebarLayout() {
    // const [activeItem, setActiveItem] = useState("Dashboard");
    const [activeItem, setActiveItem] = useState(localStorage.getItem("activeTab") || "Dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
 const { user, logout } = useAuth();
 console.log("Authenticated user:", user);
  const isMaster = user?.role === "master";





const menuItems = [
  { name: "Dashboard", icon: Home },
  { name: "Create News", icon: FilePlus },
  { name: "News List", icon: FileText },
  // { name: "Portal Management",icon:List},
  // Only show these if role is master
  ...(isMaster
    ? [
        { name: "Access Control", icon: Shield },
        { name: "User Access List", icon: Users },
        { name: "All Categories", icon: Layers },
        { name: "Category Mapping", icon: Network },
        { name: "Portal Management",icon:Settings2},
        { name: "User Categories",icon:ListTree},
      ]
    : []),
];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };



  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile menu button */}
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
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <h1 className="text-2xl font-bold text-black">Recon</h1>
          </div>
        </div>

        {/* Search Bar - Fixed below logo */}
        {/* <div className="px-4 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div> */}

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Navigation */}
          <nav className="mt-6 px-4">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive = activeItem === item.name;
                const Icon = item.icon;

                return (
                  <li key={item.name}>
                    <button
                      onClick={() => {
                        setActiveItem(item.name);
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

          {/* Quick Actions */}
          <div className="mt-8 px-4 pb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Create New</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>Import Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* User section at bottom - Fixed */}
        <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-100 hover:from-blue-50 hover:to-purple-50 transition-all duration-200 cursor-pointer group">
            <div className="w-10 h-10 bg-gradient-to-r from-black to-gray-500 rounded-full flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700 transition-colors duration-200">
                {user?.username || "User Name"}
              </p>
            </div>
            <div className="text-gray-400 group-hover:text-blue-600 transition-colors duration-200">
                  <button
                           title="Logout"
                          onClick={logout}
                          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          
                        </button>
            </div>
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
      <main className="flex-1 ml-0 lg:ml-72">
        <div className="min-h-screen bg-gray-50">
          {/* Header - Fixed at top */}
          <header className="bg-white border-b border-gray-200 shadow-sm backdrop-blur-sm bg-white/95 sticky top-0 z-30">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="lg:hidden w-10"></div>
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {activeItem}
                  </h2>
                </div>

                {/* Right section */}
                <div className="flex items-center relative">
                 <div className="absolute right-0 mt-2 w-30 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                        <button
                          onClick={logout}
                          className="w-auto bg-black text-white flex items-center px-4 py-2 text-sm justify-center"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </div>
                     </div>
              </div>
            </div>
          </header>

          {/* Page content - Scrollable */}
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              {/* Render your Dashboard component */}
              {activeItem === "Dashboard" && <Dashboard />}

              {/* {activeItem === "Profile" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Profile Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <input
                          type="text"
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                          defaultValue="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
                          defaultValue="john@example.com"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-16 h-16 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeItem === "Settings" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Application Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-800">Dark Mode</h4>
                        <p className="text-sm text-gray-600">
                          Toggle dark mode theme
                        </p>
                      </div>
                      <button className="w-12 h-6 bg-gray-300 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform duration-200"></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          Notifications
                        </h4>
                        <p className="text-sm text-gray-600">
                          Enable push notifications
                        </p>
                      </div>
                      <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform duration-200"></div>
                      </button>
                    </div>
                  </div>
                </div>
              )} */}
            </div>
            {activeItem === "Create News" && <CreateNews />}
            {activeItem === "News List" && <NewsList />}
            {activeItem === "Portal Management" && <PortalManagement />}
            {activeItem === "Access Control" && <AccessControl />}
            {activeItem === "User Access List" && <UserAccessList />}
            {activeItem === "Category Mapping" && <CategoryMapping />}
            {activeItem === "All Categories" && <AllCategories />}
            {activeItem === "User Categories" && <UserCategories />}
          </div>
        </div>
      </main>
    </div>
  );
}

// import React, { useState, useEffect } from "react";
// import {Home,User,Settings,Menu,X,Bell,Search,FileText,LogOut,List,ListTree} from "lucide-react";
// import Dashboard from "../pages/Dashboard";
// import CreateNews from "../pages/CreateNews";
// import NewsList from "../pages/NewsList";
// import AccessControl from "../pages/AccessControl";
// import UserAccessList from "../pages/UserAcessList";
// import CategoryMapping from "../pages/CategoryMapping";
// import AllCategories from "../pages/AllCategories";
// import PortalManagement from "../pages/PortalManagement";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import UserCategories from "../pages/UserCategories";



// export default function SidebarLayout() {
//     const [activeItem, setActiveItem] = useState("Dashboard");
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const navigate = useNavigate();
//  const { user, logout } = useAuth();
//  console.log("Authenticated user:", user);
//   const isMaster = user?.role === "master";





// const menuItems = [
//   { name: "Dashboard", icon: Home },
//   { name: "Create News", icon: FileText },
//   { name: "News List", icon: FileText },
//   // { name: "Portal Management",icon:List},
//   // Only show these if role is master
//   ...(isMaster
//     ? [
//         { name: "Access Control", icon: User },
//         { name: "User Access List", icon: User },
//         { name: "All Categories", icon: List },
//         { name: "Category Mapping", icon: List },
//         { name: "Portal Management",icon:List},
//         { name: "User Categories",icon:ListTree},
//       ]
//     : []),
// ];

//   const toggleMobileMenu = () => {
//     setIsMobileMenuOpen(!isMobileMenuOpen);
//   };



//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       {/* Mobile menu button */}
//       <div className="lg:hidden fixed top-4 left-4 z-50">
//         <button
//           onClick={toggleMobileMenu}
//           className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
//         >
//           {isMobileMenuOpen ? (
//             <X className="w-5 h-5 text-gray-600" />
//           ) : (
//             <Menu className="w-5 h-5 text-gray-600" />
//           )}
//         </button>
//       </div>

//       {/* Sidebar */}
//       <aside
//         className={`
//         fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 shadow-lg
//         transform transition-transform duration-300 ease-in-out
//         ${
//           isMobileMenuOpen
//             ? "translate-x-0"
//             : "-translate-x-full lg:translate-x-0"
//         }
//       `}
//       >
//         {/* Logo/Brand */}
//         <div className="flex items-center justify-center h-20 px-6 border-b border-gray-100 bg-white">
//           <div className="flex items-center space-x-3">
//             <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shadow-md">
//               <span className="text-white font-bold text-lg">R</span>
//             </div>
//             <h1 className="text-2xl font-bold text-black">Recon</h1>
//           </div>
//         </div>

//         {/* Search Bar */}
//         <div className="px-4 py-4 border-b border-gray-100">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search..."
//               className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//             />
//           </div>
//         </div>

//         {/* Navigation */}
//         <nav className="mt-6 px-4">
//           <ul className="space-y-1">
//             {menuItems.map((item) => {
//               const isActive = activeItem === item.name;
//               const Icon = item.icon;

//               return (
//                 <li key={item.name}>
//                   <button
//                     onClick={() => {
//                       setActiveItem(item.name);
//                       setIsMobileMenuOpen(false);
//                     }}
//                     className={`
//                       w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium
//                       transition-all duration-200 ease-in-out group
//                       ${
//                         isActive
//                           ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm transform scale-[1.02]"
//                           : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm hover:transform hover:scale-[1.01]"
//                       }
//                     `}
//                   >
//                     <Icon
//                       className={`w-5 h-5 transition-all duration-200 ${
//                         isActive
//                           ? "text-blue-600 transform scale-110"
//                           : "text-gray-400 group-hover:text-gray-600"
//                       }`}
//                     />
//                     <span className="flex-1 text-left">{item.name}</span>
//                     {isActive && (
//                       <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
//                     )}
//                   </button>
//                 </li>
//               );
//             })}
//           </ul>
//         </nav>

//         {/* Quick Actions */}
//         <div className="mt-8 px-4">
//           <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
//             Quick Actions
//           </h3>
//           <div className="space-y-2">
//             <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
//               <div className="w-2 h-2 bg-green-400 rounded-full"></div>
//               <span>Create New</span>
//             </button>
//             <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
//               <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
//               <span>Import Data</span>
//             </button>
//           </div>
//         </div>

//         {/* User section at bottom */}
//         <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
//           <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 transition-all duration-200 cursor-pointer group">
//             <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-md">
//               <User className="w-5 h-5 text-white" />
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700 transition-colors duration-200">
//                 {user?.username || "User Name"}
//               </p>
//             </div>
//             <div className="text-gray-400 group-hover:text-blue-600 transition-colors duration-200">
//               <Settings className="w-4 h-4" />
//             </div>
//           </div>
//         </div>
//       </aside>

//       {/* Mobile overlay */}
//       {isMobileMenuOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300"
//           onClick={() => setIsMobileMenuOpen(false)}
//         />
//       )}

//       {/* Main content */}
//       <main className="flex-1 lg:ml-0">
//         <div className="min-h-screen bg-gray-50">
//           {/* Header */}
//           <header className="bg-white border-b border-gray-200 shadow-sm backdrop-blur-sm bg-white/95">
//             <div className="px-6 py-4">
//               <div className="flex items-center justify-between">
//                 <div className="lg:hidden w-10"></div>
//                 <div className="flex items-center space-x-4">
//                   <h2 className="text-2xl font-bold text-gray-800">
//                     {activeItem}
//                   </h2>
//                 </div>

//                 {/* Right section */}
//                 <div className="flex items-center space-x-3 relative">
//                   <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
//                     <Bell className="w-5 h-5" />
//                     <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
//                   </button>

//                   {/* Settings + Dropdown */}
//                   <div className="relative">
//                     <button
//                       onClick={() => setShowDropdown(!showDropdown)}
//                       className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
//                     >
//                       <Settings className="w-5 h-5" />
//                     </button>

//                     {showDropdown && (
//                       <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-50">
//                         <button
//                           onClick={logout}
//                           className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                         >
//                           <LogOut className="w-4 h-4 mr-2" />
//                           Logout
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </header>

//           {/* Page content */}
//           <div className="p-6">
//             <div className="max-w-7xl mx-auto">
//               {/* Render your Dashboard component */}
//               {activeItem === "Dashboard" && <Dashboard />}

//               {/* {activeItem === "Profile" && (
//                 <div className="space-y-6">
//                   <h3 className="text-xl font-semibold text-gray-800">
//                     Profile Settings
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="space-y-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                           Full Name
//                         </label>
//                         <input
//                           type="text"
//                           className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
//                           defaultValue="John Doe"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                           Email
//                         </label>
//                         <input
//                           type="email"
//                           className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
//                           defaultValue="john@example.com"
//                         />
//                       </div>
//                     </div>
//                     <div className="flex items-center justify-center">
//                       <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
//                         <User className="w-16 h-16 text-white" />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {activeItem === "Settings" && (
//                 <div className="space-y-6">
//                   <h3 className="text-xl font-semibold text-gray-800">
//                     Application Settings
//                   </h3>
//                   <div className="space-y-4">
//                     <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                       <div>
//                         <h4 className="font-medium text-gray-800">Dark Mode</h4>
//                         <p className="text-sm text-gray-600">
//                           Toggle dark mode theme
//                         </p>
//                       </div>
//                       <button className="w-12 h-6 bg-gray-300 rounded-full relative">
//                         <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform duration-200"></div>
//                       </button>
//                     </div>
//                     <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                       <div>
//                         <h4 className="font-medium text-gray-800">
//                           Notifications
//                         </h4>
//                         <p className="text-sm text-gray-600">
//                           Enable push notifications
//                         </p>
//                       </div>
//                       <button className="w-12 h-6 bg-blue-600 rounded-full relative">
//                         <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform duration-200"></div>
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )} */}
//             </div>
//             {activeItem === "Create News" && <CreateNews />}
//             {activeItem === "News List" && <NewsList />}
//             {activeItem === "Portal Management" && <PortalManagement />}
//             {activeItem === "Access Control" && <AccessControl />}
//             {activeItem === "User Access List" && <UserAccessList />}
//             {activeItem === "Category Mapping" && <CategoryMapping />}
//             {activeItem === "All Categories" && <AllCategories />}
//             {activeItem === "User Categories" && <UserCategories />}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

import React, { useState, useEffect, useRef } from "react";
import { User, Globe, Tag, FileText, Plus, X, Loader2 } from "lucide-react";
import { fetchUserDetails, registerUser } from "../../server";
import { toast, ToastContainer } from "react-toastify";
export default function UserAccessTable() {
  const [users, setUsers] = useState([]);
  const [userAccess, setUserAccess] = useState({});
  const [status, setStatus] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  
  const scrollContainerRef = useRef(null);
  const scrollTimeout = useRef(null);

  // Load users from API
  const loadUsers = async (page = 1) => {
    if (loadingPage) return;
    
    setLoadingPage(true);
    try {
      const res = await fetchUserDetails(page);
      const apiResponse = res.data;

      if (apiResponse.status && Array.isArray(apiResponse.data)) {
        const apiUsers = apiResponse.data.map((u) => ({
          name: u.username || '',
          joined: u.date_joined ? new Date(u.date_joined).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        }));

        const apiUserAccess = {};
        apiResponse.data.forEach((u) => {
          const username = u.username || '';
          apiUserAccess[username] = (u.assigned_portals || []).map((portal) => ({
            domain: { name: portal.name || portal.domain || '' },
            categories: (portal.categories || []).map((c) => typeof c === 'string' ? c : (c.name || '')),
            totalPosts: portal.total_posts || portal.totalPosts || 0,
            todaysPosts: portal.todays_posts || portal.todaysPosts || 0,
          }));
        });

       setUsers(prev => page === 1 ? apiUsers : [...prev, ...apiUsers]);

       setStatus(prev => ({ ...prev, ...apiUsers.reduce((acc, u) => ({ ...acc, [u.name]: true }), {}) }));

        setUserAccess(prev => ({ ...prev, ...apiUserAccess }));

        
        // Update pagination info
        if (apiResponse.pagination) {
          setCurrentPage(apiResponse.pagination.page);
          setTotalPages(apiResponse.pagination.total_pages);
          setHasNext(!!apiResponse.pagination.next);
          setHasPrevious(!!apiResponse.pagination.previous);
        }
      } else {
        console.error("Invalid API response", apiResponse);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    loadUsers(1);
  }, []);

  // Handle scroll for pagination
 // Handle scroll for pagination (replace your current handleScroll with this)
const handleScroll = () => {
  const container = scrollContainerRef.current;
  if (!container || loadingPage) return;

  const { scrollTop, scrollHeight, clientHeight } = container;
  const scrolledToBottom = scrollHeight - scrollTop <= clientHeight + 50;

  if (scrolledToBottom && hasNext) {
    const nextPage = currentPage + 1;
    if (nextPage <= totalPages) {
      // optional debounce (uses your existing refs)
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        loadUsers(nextPage);
      }, 150);
    }
  }
};


  const toggleStatus = (userName) => {
    setStatus((prev) => ({ ...prev, [userName]: !prev[userName] }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.password) return;

    setIsLoading(true);

    try {
    const res =  await registerUser({
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
      });
      // toast.success(res.data.message);
      // console.log("successMeaage",res.data.message);
      
   await loadUsers(currentPage);

      setNewUser({ username: "", email: "", password: "" });
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message?.username?.[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    if (!isLoading) {
      setIsModalOpen(false);
      setNewUser({ username: "", email: "", password: "" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              User Portal Access
            </h1>
            <p className="text-gray-600">Manage user permissions and portal access</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl shadow-lg hover:bg-gray-800 hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={20} />
            Add User
          </button>
        </div>

        {/* Pagination Info */}
        <div className="mb-4 flex justify-between items-center">
         
         {loadingPage && (
              <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-50">
                <div className="flex items-center gap-2 text-gray-700">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading...</span>
                </div>
              </div>
            )}
        </div>
         
        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="max-h-[calc(100vh-250px)] overflow-y-auto pr-2"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="grid gap-6">
            {users.map((user) => {
              const accessList = userAccess[user.name] || [];
              const isActive = status[user.name];
              
              return (
                <div
                  key={user.name}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
                >
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                          <User className="text-gray-900" size={24} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                          <p className="text-gray-300 text-sm">
                            Joined {user.joined} • {accessList.length} {accessList.length === 1 ? 'Portal' : 'Portals'} Assigned
                          </p>
                        </div>
                      </div>
                      {/* <button
                        onClick={() => toggleStatus(user.name)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                          isActive
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-600 text-gray-200 hover:bg-gray-700'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-white' : 'bg-gray-400'}`} />
                        {isActive ? 'Active' : 'Inactive'}
                      </button> */}
                    </div>
                  </div>

                  <div className="p-6">
                    {accessList.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Globe className="mx-auto mb-3 opacity-30" size={48} />
                        <p className="font-medium">No Portal Access Assigned</p>
                        <p className="text-sm mt-1">Assign portals to grant access</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {accessList.map((access, idx) => (
                          <div
                            key={idx}
                            className="border border-gray-200 rounded-xl p-5 hover:border-gray-400 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-gray-50"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Globe className="text-white" size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    // href={access.domain.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-lg font-bold text-gray-900 hover:text-gray-700 hover:underline block truncate"
                                  >
                                    {access.domain.name}
                                  </p>
                                </div>
                              </div>
                             <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg flex-shrink-0 ml-4">
                                <FileText size={16} />
                                <span className="font-bold">{access.todaysPosts}</span>
                                <span className="text-sm">today posts</span>
                              </div>
                              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg flex-shrink-0 ml-4">
                                <FileText size={16} />
                                <span className="font-bold">{access.totalPosts}</span>
                                <span className="text-sm">posts</span>
                              </div>
                               
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              <Tag size={16} className="text-gray-500 flex-shrink-0" />
                              {access.categories.map((cat, i) => (
                                <span
                                  key={i}
                                  className="bg-gray-200 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full hover:bg-gray-300 transition-colors"
                                >
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scroll Indicators */}
          {hasPrevious && (
            <div className="text-center py-2 text-gray-500 text-sm">
              Scroll up to load previous page
            </div>
          )}
          {hasNext && (
            <div className="text-center py-2 text-gray-500 text-sm">
              Scroll down to load next page
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-2xl px-8 py-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Add New User</h2>
                <p className="text-gray-300 text-sm mt-1">
                  Fill in the details to create a new user account
                </p>
              </div>
              <button
                onClick={closeModal}
                disabled={isLoading}
                className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-gray-100 focus:border-gray-500 transition-all duration-200 placeholder-gray-400"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-gray-100 focus:border-gray-500 transition-all duration-200 placeholder-gray-400"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-gray-100 focus:border-gray-500 transition-all duration-200 placeholder-gray-400"
                  disabled={isLoading}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? "Adding..." : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
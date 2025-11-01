import React, { useEffect, useState, useRef } from "react";
import {fetchPortalStatusByUsername,fetchAllUsersList,mapPortalUser,} from "../../server";
import { toast } from "react-toastify";
import { flushSync } from "react-dom";
import formatUsername from "../utils/formateName";

export default function PortalManagement() {
  const [portalData, setPortalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState({
    username: "",
    user_id: null,
  });
 const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  // User list pagination states
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const scrollRef = useRef(null);

  // Portal data pagination states
  const [portalPage, setPortalPage] = useState(1);
  const [portalPagination, setPortalPagination] = useState(null);
  const [isPortalFetching, setIsPortalFetching] = useState(false);

  // Fetch users with pagination on mount
  useEffect(() => {
    fetchUsers(1);
  }, []);

  const fetchUsers = async (pageNumber, search = "") => {
     if (isFetching) return;
     setIsFetching(true);
     try {
       const searchParam = search ? `&search=${search}` : "";
       const res = await fetchAllUsersList(pageNumber, search);
       
       if (res.data?.status) {
         setPagination(res.data.pagination);
 
         if (pageNumber > page) {
           setUsers((prev) => [...prev, ...res.data.data]);
         } else if (pageNumber < page) {
           setUsers((prev) => [...res.data.data, ...prev]);
         } else {
           setUsers(res.data.data);
         }
 
         setPage(pageNumber);
       }
     } catch (err) {
       console.error("Error fetching users:", err);
       toast.error("Failed to fetch users");
     } finally {
       setIsFetching(false);
       setIsSearching(false);
     }
   };

   // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsSearching(true);
    setPage(1);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchUsers(1, value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(true);
    setPage(1);
    fetchUsers(1, "");
  };

  // User list scroll handler for infinite scroll
  const handleScroll = () => {
    if (!scrollRef.current || !pagination) return;

    const container = scrollRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;

    if (
      scrollTop + clientHeight >= scrollHeight - 10 &&
      pagination.next &&
      !isFetching
    ) {
      const nextPage = page + 1;
      if (nextPage <= pagination.total_pages) {
        fetchUsers(nextPage);
      }
    }

    if (scrollTop === 0 && pagination.previous && !isFetching) {
      const prevPage = page - 1;
      if (prevPage >= 1) {
        const currentScrollHeight = scrollHeight;
        fetchUsers(prevPage).then(() => {
          requestAnimationFrame(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTop =
                scrollRef.current.scrollHeight - currentScrollHeight;
            }
          });
        });
      }
    }
  };

  // Attach user list scroll listener
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [pagination, page, isFetching]);

  // Fetch portal status for a user (with pagination support)
  const handleCheckUsername = async (
    name = selectedUser.username,
    pageNumber = 1
  ) => {
    if (!name.trim()) {
      toast.warning("Please enter a username");
      return;
    }

    if (pageNumber === 1) {
      setLoading(true);
      setPortalData([]);
      setPortalPage(1);
      setPortalPagination(null);
    } else {
      setIsPortalFetching(true);
    }

    try {
      const res = await fetchPortalStatusByUsername(name, pageNumber);
      console.log("API Response:", res.data);
      
      if (res.data?.status) {
        const mappedData = res.data.data.map((item) => {
          const user = users.find((u) => u.username === item.username);
          return { ...item, user_id: user?.user_id || null };
        });

        setPortalPagination(res.data.pagination);

        if (pageNumber === 1) {
          setPortalData(mappedData);
        } else {
          setPortalData((prev) => [...prev, ...mappedData]);
        }

        setPortalPage(pageNumber);
      } else {
        toast.info("No data found for this username");
        setPortalData([]);
        setPortalPagination(null);
      }
    } catch (err) {
      console.error("Error fetching portal data:", err);
      toast.error(
        err.response?.data?.message ||
          "Error fetching data. Check console for details."
      );
    } finally {
      setLoading(false);
      setIsPortalFetching(false);
    }
  };

  // Load More Handler
  const handleLoadMore = () => {
    if (portalPagination && portalPagination.next && !isPortalFetching) {
      const nextPage = portalPage + 1;
      handleCheckUsername(selectedUser.username, nextPage);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Portal Management
          </h1>
          <p className="text-gray-600">Manage user portal access and status</p>
        </div>
         <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search users by username or email..."
              className="w-full pl-12 pr-12 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {isSearching && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
              <span>Searching...</span>
            </div>
          )}
        </div>

        {/* User Cards Grid */}
        <div
          ref={scrollRef}
          className="max-h-[75vh] overflow-y-auto pr-2 space-y-4 custom-scrollbar"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user, i) => (
              <div
                key={`${user.id}-${i}`}
                onClick={() => {
                  flushSync(() => {
                    setSelectedUser({ username: user.username, user_id: user.id });
                    setShowModal(true);
                    setPortalData([]);
                    setPortalPage(1);
                    setPortalPagination(null);
                  });
                  handleCheckUsername(user.username, 1);
                }}
                className="group relative bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-200 hover:border-gray-900"
              >
                <div className="relative z-10">
                  {/* Avatar Circle */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <span className="text-white text-lg font-semibold">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`px-3 py-1 rounded-md text-xs font-medium ${
                      user.is_active 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  {/* Username */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
                    {formatUsername(user.username)}
                  </h3>

                  {/* Email */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-600 truncate">
                      {user.email || 'No email provided'}
                    </p>
                  </div>

                  {/* Joining Date */}
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-500">
                      Joined {formatDate(user.date_joined)}
                    </p>
                  </div>

                  {/* Hover Arrow */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center shadow-sm">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading indicator for users */}
          {isFetching && (
            <div className="flex items-center justify-center py-6">
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-lg shadow-sm border border-gray-200">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                <span className="text-gray-600 font-medium">Loading more users...</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal for portal data */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center pt-20 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full relative mx-4">
              {/* Close button */}
              <button
                onClick={() => {
                  setShowModal(false);
                  setPortalData([]);
                  setPortalPage(1);
                  setPortalPagination(null);
                }}
                className="absolute top-2 right-3 text-gray-600 hover:text-black text-2xl font-bold"
              >
                ✖
              </button>

              {/* User info header */}
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Portal Status: {selectedUser.username}
              </h2>

              {/* Table with data */}
              <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                <table className="min-w-full border border-gray-300 divide-y divide-gray-300 bg-white">
                  <thead className="bg-black text-white sticky top-0 z-10">
                    <tr>
                      <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">
                        Portal
                      </th>
                      <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">
                        Found
                      </th>
                      <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">
                        Username
                      </th>
                      <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">
                        Message
                      </th>
                      <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {loading && portalData.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-10 text-center text-gray-600 font-medium"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
                            <p className="mt-3">Loading data...</p>
                          </div>
                        </td>
                      </tr>
                    ) : portalData.length > 0 ? (
                      <>
                        {portalData.map((item, index) => (
                          <tr
                            key={`${item.portal}-${index}`}
                            className="hover:bg-gray-50 transition duration-150"
                          >
                            <td className="py-3 px-6 font-medium text-gray-900">
                              {item.portal}
                            </td>
                            <td className="py-3 px-6">
                              {item.found ? (
                                <span className="text-green-600 font-semibold">
                                  Found
                                </span>
                              ) : (
                                <span className="text-red-600 font-semibold">
                                  Not Found
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-6 text-gray-700">
                              {formatUsername(item.username) || "-"}
                            </td>
                            <td className="py-3 px-6 text-gray-500 max-w-xs">
                              <div className="truncate" title={item.message}>
                                {item.message || "-"}
                              </div>
                            </td>
                            <td className="py-3 px-6 text-right">
                              {!item.found && (
                                <button
                                  onClick={async () => {
                                    try {
                                      setLoading(true);
                                      await mapPortalUser(
                                        selectedUser.username,
                                        selectedUser.user_id
                                      );
                                      handleCheckUsername(
                                        selectedUser.username,
                                        1
                                      );
                                    } catch (err) {
                                      console.error(err);
                                      toast.error("Failed to retry");
                                    } finally {
                                      setLoading(false);
                                    }
                                  }}
                                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                                >
                                  Retry
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </>
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center text-gray-500 py-8 font-medium"
                        >
                          No data found for this user.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination info and Load More Button */}
              {portalPagination && portalData.length > 0 && (
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <div className="text-sm text-gray-600">
                    Page {portalPagination.page} of{" "}
                    {portalPagination.total_pages} | Total:{" "}
                    {portalPagination.count} portals
                  </div>
                  
                  {portalPagination.next && (
                    <button
                      onClick={handleLoadMore}
                      disabled={isPortalFetching}
                      className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isPortalFetching ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          <span>Load More</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}

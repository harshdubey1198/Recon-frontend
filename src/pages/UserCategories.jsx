import React, { useEffect, useState, useRef } from "react";
import { fetchAllUsersList, fetchAssignmentsByUsername, fetchMappedCategoriesById } from "../../server";
import { toast } from "react-toastify";
import { flushSync } from "react-dom";
import formatUsername from "../utils/formateName";

export default function UserCategories() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState({ username: "", user_id: null });
  const [assignments, setAssignments] = useState([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  // User list pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const scrollRef = useRef(null);

  // Assignments pagination
  const [assignmentPage, setAssignmentPage] = useState(1);
  const [assignmentPagination, setAssignmentPagination] = useState(null);
  const [isAssignmentFetching, setIsAssignmentFetching] = useState(false);

  // Expanded category state (no separate modal)
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [mappingData, setMappingData] = useState({});
  const [mappingLoading, setMappingLoading] = useState({});

  // Initial fetch
  useEffect(() => {
    fetchUsers(1);
  }, []);

  // Fetch users (handles pagination)
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

  // Scroll handler for users
  const handleScroll = () => {
    if (!scrollRef.current || !pagination) return;

    const container = scrollRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;

    if (scrollTop + clientHeight >= scrollHeight - 10 && pagination.next && !isFetching) {
      const nextPage = page + 1;
      if (nextPage <= pagination.total_pages) {
        fetchUsers(nextPage, searchQuery);
      }
    }

    if (scrollTop === 0 && pagination.previous && !isFetching) {
      const prevPage = page - 1;
      if (prevPage >= 1) {
        const currentScrollHeight = scrollHeight;
        fetchUsers(prevPage, searchQuery).then(() => {
          requestAnimationFrame(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight - currentScrollHeight;
            }
          });
        });
      }
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

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [pagination, page, isFetching]);

  // Fetch assignments for user
  const handleCheckUsername = async (name = selectedUser.username, pageNumber = 1) => {
    if (!name.trim()) {
      toast.warning("Please enter a username");
      return;
    }

    if (pageNumber === 1) {
      setLoading(true);
      setAssignments([]);
      setAssignmentPage(1);
      setAssignmentPagination(null);
    } else {
      setIsAssignmentFetching(true);
    }

    try {
      const res = await fetchAssignmentsByUsername(name, pageNumber);
      
      if (res.data?.status) {
        setAssignmentPagination(res.data.pagination);

        if (pageNumber === 1) {
          setAssignments(res.data.data);
        } else {
          setAssignments((prev) => [...prev, ...res.data.data]);
        }

        setAssignmentPage(pageNumber);
        
        if (pageNumber === 1) {
          setShowModal(true);
        }
      } else {
        toast.info("No assignments found for this username");
        setAssignments([]);
        setAssignmentPagination(null);
      }
    } catch (err) {
      console.error("Error fetching assignments:", err);
      toast.error(err.response?.data?.message || "Failed to fetch assignments");
    } finally {
      setLoading(false);
      setIsAssignmentFetching(false);
    }
  };

  // Load More Handler for assignments
  const handleLoadMoreAssignments = () => {
    if (assignmentPagination && assignmentPagination.next && !isAssignmentFetching) {
      const nextPage = assignmentPage + 1;
      handleCheckUsername(selectedUser.username, nextPage);
    }
  };

  // Fetch mapping details for a category
  const handleCategoryClick = async (categoryId, categoryName) => {
    if (!categoryId) return;
    
    // If clicking the same category, collapse it
    if (expandedCategoryId === categoryId) {
      setExpandedCategoryId(null);
      return;
    }

    // Expand new category
    setExpandedCategoryId(categoryId);
    
    // If data already loaded, don't fetch again
    if (mappingData[categoryId]) {
      return;
    }
    
    setMappingLoading(prev => ({ ...prev, [categoryId]: true }));
    
    try {
      const res = await fetchMappedCategoriesById(categoryId, 1);
      console.log("Mapping API Response:", res.data);
      
      if (res.data?.status) {
        setMappingData(prev => ({ ...prev, [categoryId]: res.data.data }));
      } else {
        toast.info("No mapping data found for this category");
        setMappingData(prev => ({ ...prev, [categoryId]: null }));
      }
    } catch (err) {
      console.error("Error fetching mapping data:", err);
      toast.error(err.response?.data?.message || "Failed to fetch mapping data");
      setMappingData(prev => ({ ...prev, [categoryId]: null }));
    } finally {
      setMappingLoading(prev => ({ ...prev, [categoryId]: false }));
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
            User Category List
          </h1>
          <p className="text-gray-600">Explore user profiles and their assigned categories</p>
        </div>

        {/* Search Bar */}
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
                    setAssignments([]);
                    setAssignmentPage(1);
                    setAssignmentPagination(null);
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

        {/* Modal for user category assignments */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden animate-slideUp">
              {/* Modal Header */}
              <div className="bg-gray-900 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Category Assignments</h2>
                    <p className="text-gray-300">
                      Viewing categories for <span className="font-semibold text-white">{selectedUser.username}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setAssignments([]);
                      setAssignmentPage(1);
                      setAssignmentPagination(null);
                    }}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
                {loading && assignments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-14 h-14 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading assignments...</p>
                  </div>
                ) : assignments.length > 0 ? (
                  <div className="space-y-3">
                    {assignments.map((item, index) => {
                      const isExpanded = expandedCategoryId === item.master_category?.id;
                      const categoryData = mappingData[item.master_category?.id];
                      const isLoading = mappingLoading[item.master_category?.id];
                      
                      return (
                        <div key={`${item.id || index}`} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Category Card - Clickable */}
                          <div
                            onClick={() => handleCategoryClick(item.master_category?.id, item.master_category?.name)}
                            className="bg-white p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {item.master_category?.name || "Unnamed Category"}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {isExpanded ? "Click to collapse" : "Click to view mappings"}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right flex items-center gap-3">
                                <div>
                                  <p className="text-sm text-gray-700 font-medium">
                                    {formatDate(item.created_at)}
                                  </p>
                                  <p className="text-xs text-gray-500">Assigned date</p>
                                </div>
                                <svg 
                                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Expanded Details - Shows below category */}
                          {isExpanded && (
                            <div className="border-t border-gray-200 bg-gray-50 p-4 animate-slideDown">
                              {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                  <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                                    <span className="text-gray-600 text-sm">Loading mapping details...</span>
                                  </div>
                                </div>
                              ) : categoryData ? (
                                <div className="space-y-4">
                                  {/* Assigned Users */}
                                  {categoryData.assigned_users && categoryData.assigned_users.length > 0 && (
                                    <div>
                                      <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        Assigned Users ({categoryData.assigned_users.length})
                                      </h5>
                                      <div className="flex flex-wrap gap-2">
                                        {categoryData.assigned_users.map((user) => (
                                          <div key={user.id} className="bg-gray-200 rounded-full px-3 py-1.5 text-sm text-gray-700">
                                            {formatUsername(user.username)} ({user.email || 'No email'})
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Portal Mappings */}
                                  {categoryData.mappings && categoryData.mappings.length > 0 ? (
                                    <div>
                                      <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                        Portal Mappings ({categoryData.mappings.length})
                                      </h5>
                                      <div className="space-y-2">
                                        {categoryData.mappings.map((mapping) => (
                                          <div key={mapping.id} className="bg-white rounded-lg p-3 border border-gray-200">
                                            <div className="flex items-center gap-2 mb-1">
                                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                              </svg>
                                              <span className="font-semibold text-gray-900 text-sm">{mapping.portal_name}</span>
                                              <span className="text-gray-400">→</span>
                                              <span className="text-sm text-gray-700">{mapping.portal_category_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 ml-6">
                                              {mapping.is_default && (
                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-200">
                                                  Default
                                                </span>
                                              )}
                                              {mapping.use_default_content && (
                                                <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded border border-green-200">
                                                  Uses Default Content
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center py-4 text-gray-500 text-sm">
                                      No portal mappings found
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-4 text-gray-500 text-sm">
                                  No mapping data available
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">No categories assigned yet</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              {assignmentPagination && assignments.length > 0 && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">Page {assignmentPagination.page}</span> of {assignmentPagination.total_pages} 
                      <span className="mx-2">•</span>
                      <span className="font-semibold text-gray-900">{assignmentPagination.count}</span> total assignments
                    </div>
                    
                    {assignmentPagination.next && (
                      <button
                        onClick={handleLoadMoreAssignments}
                        disabled={isAssignmentFetching}
                        className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
                      >
                        {isAssignmentFetching ? (
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
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mapping Details Modal - REMOVED */}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

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

// import React, { useEffect, useState } from "react";
// import { fetchAllUsersList, fetchAssignmentsByUsername } from "../../server";
// import { toast } from "react-toastify";


// export default function UserCategories() {
//   const [username, setUsername] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [users, setUsers] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState({ username: "", user_id: null });
//   const [assignments, setAssignments] = useState([]);

//   useEffect(() => {
//     (async () => {
//       const res = await fetchAllUsersList();
//       if (res.data?.status) setUsers(res.data.data);
//     })();
//   }, []);

//   const handleCheckUsername = async (name = selectedUser.username) => {
//     if (!name.trim()) {
//       toast.warning(" Please enter a username");
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await fetchAssignmentsByUsername(name);
//       if (res.data?.status) {
//         setAssignments(res.data.data);
//         setShowModal(true);
//       } else {
//         toast.info("No assignments found for this username");
//         setAssignments([]);
//       }
//     } catch (err) {
//       console.error("Error fetching assignments:", err);
//       toast.error(err.response?.data?.message );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">

//         {/* <div className="flex gap-3 mb-6">
//           <input
//             type="text"
//             placeholder="Enter username"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
//           />
//           <button
//             onClick={handleCheckUsername}
//             disabled={loading}
//             className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
//           >
//             {loading ? "Checking..." : "Check"}
//           </button>
//         </div> */}
//         List of Users 
//         <ul className="space-y-2">
//           {users.map((u, i) => (
//             <li
//               key={i}
//               onClick={() => {
//                 setSelectedUser({ username: u.username, user_id: u.id });
//                 handleCheckUsername(u.username); 
//               }}
//               className="p-2 border rounded cursor-pointer hover:bg-gray-100"
//             >
//               {u.username}
//             </li>
//           ))}
//         </ul>

//         {showModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center pt-28 pl-72">
//             <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full relative">
//               <h2 className="text-xl font-semibold mb-4">Details of categories assigned to: {selectedUser.username}</h2>

//               <button
//                 onClick={() => setShowModal(false)}
//                 className="absolute top-2 right-3 text-gray-600 hover:text-black"
//               >
//                 ✖
//               </button>
//               {assignments.length > 0 && (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full border border-gray-300 divide-y divide-gray-300 bg-white">
//                     <thead className="bg-black text-white">
//                       <tr>
//                         {/* <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">Category</th> */}
//                         <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">Master Category</th>
//                         <th className="py-3 px-6 text-left font-semibold uppercase tracking-wider">Created At</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200">
//                       {assignments.map((item, index) => (
//                         <tr key={index} className="hover:bg-gray-50 transition duration-150">
//                           {/* <td className="py-3 px-6 text-gray-700">{item.group || "-"}</td> */}
//                           <td className="py-3 px-6 text-gray-700">{item.master_category?.name || "-"}</td>
//                           <td className="py-3 px-6 text-gray-500">{new Date(item.created_at).toLocaleString()}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

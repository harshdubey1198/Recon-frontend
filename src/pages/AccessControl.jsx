import React, { useState, useEffect, useRef } from "react";
import { User, List, CheckCircle2, Plus, Loader2, X, Trash2 } from "lucide-react";
import { createMasterCategory, fetchMasterCategories, assignMasterCategoriesToUser, fetchAllUsersList, fetchAssignmentsByUsername, removeUserAssignment } from "../../server";
import { toast } from "react-toastify";
import formatUsername from "../utils/formateName";

const AccessControl = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [masterCategoryName, setMasterCategoryName] = useState("");
  const [masterCategoryDescription, setMasterCategoryDescription] = useState("");
  const [masterCategories, setMasterCategories] = useState([]);
  const [selectedMasterCategories, setSelectedMasterCategories] = useState([]);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  // Pagination states for users
  const [userPage, setUserPage] = useState(1);
  const [userPagination, setUserPagination] = useState(null);
  const [isUserFetching, setIsUserFetching] = useState(false);
  const userScrollRef = useRef(null);

  // Pagination states for categories
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryPagination, setCategoryPagination] = useState(null);
  const [isCategoryFetching, setIsCategoryFetching] = useState(false);
  const categoryScrollRef = useRef(null);

  // Assignment display states
  const [userAssignments, setUserAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentPage, setAssignmentPage] = useState(1);
  const [assignmentPagination, setAssignmentPagination] = useState(null);
  const [removingAssignment, setRemovingAssignment] = useState(null);
  const [isLoadingMoreAssignments, setIsLoadingMoreAssignments] = useState(false);
  const assignmentScrollRef = useRef(null);
 const [selectedUserId, setSelectedUserId] = useState(null);
  // Load Users with pagination
  const loadUsers = async (page = 1, append = false) => {
    if (isUserFetching) return;
    setIsUserFetching(true);
    try {
      const response = await fetchAllUsersList(page);
      const { data, pagination } = response.data;
      
      setUnassignedUsers(prev => append ? [...prev, ...data] : data);
      setUserPagination(pagination);
      setUserPage(page);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsUserFetching(false);
    }
  };

  // Load Categories with pagination
  const loadCategories = async (page = 1, append = false) => {
    if (isCategoryFetching) return;
    setIsCategoryFetching(true);
    try {
      const response = await fetchMasterCategories(page);
      const { data, pagination } = response.data;
      
      setMasterCategories(prev => append ? [...prev, ...data] : data);
      setCategoryPagination(pagination);
      setCategoryPage(page);
    } catch (error) {
      console.error("Error fetching master categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setIsCategoryFetching(false);
    }
  };

  // Load user assignments with infinite scroll
  const loadUserAssignments = async (username, page = 1, append = false) => {
    if (!username) {
      setUserAssignments([]);
      setAssignmentPagination(null);
      return;
    }

    if (append) {
      setIsLoadingMoreAssignments(true);
    } else {
      setAssignmentsLoading(true);
    }

    try {
      const response = await fetchAssignmentsByUsername(username, page);
      if (response.data?.status) {
        setUserAssignments(prev => append ? [...prev, ...response.data.data] : response.data.data);
        setAssignmentPagination(response.data.pagination);
        setAssignmentPage(page);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to load assignments");
      if (!append) {
        setUserAssignments([]);
      }
    } finally {
      setAssignmentsLoading(false);
      setIsLoadingMoreAssignments(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadCategories();
  }, []);

  // Handle user selection change
 const handleUserChange = (username) => {
    setSelectedUser(username);
    setAssignmentPage(1);
    
    // Find and store user ID
    const user = unassignedUsers.find(u => u.username === username);
    setSelectedUserId(user ? user.id : null);
    
    if (username) {
      loadUserAssignments(username, 1, false);
    } else {
      setUserAssignments([]);
      setAssignmentPagination(null);
    }
  };

  // Handle assignment scroll for infinite loading
  const handleAssignmentScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (assignmentPagination?.next && !isLoadingMoreAssignments && selectedUser) {
        loadUserAssignments(selectedUser, assignmentPage + 1, true);
      }
    }
  };

  // Remove assignment without confirmation
   const handleRemoveAssignment = async (assignment) => {
    if (!selectedUserId) {
      toast.error("User ID not found");
      return;
    }

    const masterCategoryId = assignment.master_category?.id;
    if (!masterCategoryId) {
      toast.error("Master category ID not found");
      return;
    }

    setRemovingAssignment(assignment.id);
    try {
      const response = await removeUserAssignment({
        user_id: selectedUserId,
        master_category_id: masterCategoryId
      });
      
      toast.success(response?.data?.message || `Removed assignment: ${assignment.master_category?.name}`);
      
      // Remove from local state
      setUserAssignments(prev => prev.filter(a => a.id !== assignment.id));
      
      // Update pagination count
      if (assignmentPagination) {
        setAssignmentPagination(prev => ({
          ...prev,
          count: prev.count - 1
        }));
      }
    } catch (error) {
      console.error("Error removing assignment:", error);
      toast.error(error.response?.data?.message || "Failed to remove assignment");
    } finally {
      setRemovingAssignment(null);
    }
  };

  // Handle user select scroll
  const handleUserScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (userPagination?.next && !isUserFetching) {
        loadUsers(userPage + 1, true);
      }
    }
    
    if (scrollTop === 0 && userPage > 1 && !isUserFetching) {
      loadUsers(userPage - 1, false);
    }
  };

  // Handle category select scroll
  const handleCategoryScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (categoryPagination?.next && !isCategoryFetching) {
        loadCategories(categoryPage + 1, true);
      }
    }
    
    if (scrollTop === 0 && categoryPage > 1 && !isCategoryFetching) {
      loadCategories(categoryPage - 1, false);
    }
  };

  // Create Master Category
  const handleCreateMasterCategory = async () => {
    if (!masterCategoryName || !masterCategoryDescription) {
      toast.warning("Please fill both name and description");
      return;
    }
    try {
      await createMasterCategory({
        name: masterCategoryName,
        description: masterCategoryDescription,
      });
      toast.success("Master Category created!");
      setIsModalOpen(false);
      setMasterCategoryName("");
      setMasterCategoryDescription("");
      loadCategories(1, false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create master category");
    }
  };

  // Add access (assign master categories to user)
  const handleAddAccess = async () => {
    if (!selectedUser || selectedMasterCategories.length === 0) {
      toast.warning("Please select a user and at least one master category");
      return;
    }

    try {
      const userObj = unassignedUsers.find((u) => u.username === selectedUser);
      const categoryIds = masterCategories
        .filter((cat) => selectedMasterCategories.includes(cat.name))
        .map((cat) => cat.id);

      const res = await assignMasterCategoriesToUser({
        username: userObj.username,
        master_categories: categoryIds,
      });

      toast.success(`${res.data.message}\n${selectedMasterCategories.join(", ")}`);
      setSelectedMasterCategories([]);
      
      // Refresh assignments for the selected user
      loadUserAssignments(selectedUser, 1, false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to assign categories");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gray-900 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  Access Control
                </h1>
                <p className="text-gray-300 text-sm mt-1">Manage user permissions and master categories</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all shadow-md font-medium"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-8 space-y-8">
            {/* User Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="bg-gray-900 p-1.5 rounded-lg">
                  <User className="w-4 h-4 text-white" />
                </div>
                Select User
              </label>
              <div className="relative">
                <select
                  ref={userScrollRef}
                  value={selectedUser}
                  onChange={(e) => handleUserChange(e.target.value)}
                  onScroll={handleUserScroll}
                  size="6"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 transition-all bg-white text-gray-700 font-medium cursor-pointer hover:border-gray-900 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-opacity-20 outline-none overflow-y-auto"
                >
                  <option value="">-- Select User --</option>
                  {unassignedUsers.map((u) => (
                    <option key={u.id} value={u.username}>
                      {formatUsername(u.username)} {u.email ? `(${u.email})` : ""}
                    </option>
                  ))}
                </select>
                 {/* User Assignments Section */}
            {selectedUser && (
              <div className="mt-8 border-t border-gray-200 pt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-gray-900" />
                    Assigned Categories for {formatUsername(selectedUser)}
                  </h3>
                  {assignmentPagination && (
                    <span className="text-sm text-gray-500">
                      {assignmentPagination.count} total assignments
                    </span>
                  )}
                </div>

                {assignmentsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Loading assignments...</span>
                    </div>
                  </div>
                ) : userAssignments.length > 0 ? (
                  <div 
                    ref={assignmentScrollRef}
                    onScroll={handleAssignmentScroll}
                    className="space-y-3 max-h-96 overflow-y-auto pr-2"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#1f2937 #f3f4f6' }}
                  >
                    {userAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-gray-900 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                              <List className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {assignment.master_category?.name || "Unnamed Category"}
                              </h4>
                              <p className="text-sm text-gray-500">
                                Assigned on {formatDate(assignment.created_at)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveAssignment(assignment)}
                            disabled={removingAssignment === assignment.id}
                            className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                          >
                            {removingAssignment === assignment.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Removing...</span>
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" />
                                <span className="text-sm">Remove</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                    {isLoadingMoreAssignments && (
                      <div className="flex items-center justify-center py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="text-sm">Loading more...</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <List className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No assignments found</p>
                    <p className="text-sm text-gray-400 mt-1">Assign categories to this user using the form above</p>
                  </div>
                )}
              </div>
            )}
                {isUserFetching && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-900">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Master Category Multi-Select */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="bg-gray-900 p-1.5 rounded-lg">
                  <List className="w-4 h-4 text-white" />
                </div>
                Select Master Categories
                <span className="text-xs text-gray-500 font-normal">(Hold Ctrl/Cmd to select multiple)</span>
              </label>
              <div className="relative">
                <select
                  ref={categoryScrollRef}
                  multiple
                  value={selectedMasterCategories}
                  onChange={(e) =>
                    setSelectedMasterCategories(
                      Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      )
                    )
                  }
                  onScroll={handleCategoryScroll}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 transition-all bg-white text-gray-700 font-medium h-64 cursor-pointer hover:border-gray-900 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-opacity-20 outline-none"
                >
                  {masterCategories.map((cat) => (
                    <option key={cat.id} value={cat.name} className="py-2 px-2 hover:bg-gray-50">
                      {cat.name}
                    </option>
                  ))}
                </select>
                
                {isCategoryFetching && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-900">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedMasterCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedMasterCategories.map((cat) => (
                    <span
                      key={cat}
                      className="bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Add Access Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleAddAccess}
                className="px-6 py-3 bg-gray-900 text-white rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                <CheckCircle2 className="w-5 h-5" />
                Add Access
              </button>
            </div>

           
          </div>
        </div>
      </div>

      {/* Modal for Master Category */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md space-y-5 shadow-2xl animate-in">
            <div className="flex items-center gap-3">
              <div className="bg-gray-900 p-2 rounded-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Add Master Category</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g., Global News"
                  value={masterCategoryName}
                  onChange={(e) => setMasterCategoryName(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-opacity-20 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Enter category description..."
                  value={masterCategoryDescription}
                  onChange={(e) => setMasterCategoryDescription(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-opacity-20 outline-none transition-all min-h-24"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMasterCategory}
                className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all shadow-lg font-medium"
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessControl;
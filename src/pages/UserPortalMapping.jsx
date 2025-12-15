import React, { useState, useEffect, useRef } from "react";
import { User, List, CheckCircle2, Plus, Loader2, X, Trash2 } from "lucide-react";
import {  assignMultiplePortalsToUser,fetchPortals, fetchAllUsersList,registerUser, fetchUserPortalsByUserId, removePortalUserAssignment } from "../../server";
import { toast } from "react-toastify";
import formatUsername from "../utils/formateName";

const UserPortalMapping = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [masterCategoryName, setMasterCategoryName] = useState("");
  const [masterCategoryDescription, setMasterCategoryDescription] = useState("");
  const [masterCategories, setMasterCategories] = useState([]);
  const [selectedMasterCategories, setSelectedMasterCategories] = useState([]);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
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
  const [newUser, setNewUser] = useState({
     username: "",
     email: "",
     password: "",
   });
   const [isLoading, setIsLoading] = useState(false);
   
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

// Load Portals with pagination (replacing loadCategories)
const loadCategories = async (page = 1, append = false) => {
  if (isCategoryFetching) return;
  setIsCategoryFetching(true);

  try {
    const response = await fetchPortals(page);
    const { data, pagination } = response.data;

    // Structure portal data
    const formattedData = data.map((portal) => ({
      id: portal.id,
      name: portal.name,        // portal.name based on your API
      base_url: portal.base_url // optional if you want to use it later
    }));

    setMasterCategories((prev) =>
      append ? [...prev, ...formattedData] : formattedData
    );

    setCategoryPagination(pagination);
    setCategoryPage(page);

  } catch (error) {
    console.error("Error fetching portals:", error);
    toast.error("Failed to load portals");
  } finally {
    setIsCategoryFetching(false);
  }
};



 // Load user portal assignments with infinite scroll
const loadUserAssignments = async (userId, page = 1, append = false) => {
  if (!userId) {
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
    const response = await fetchUserPortalsByUserId(userId, page);

    if (response.data?.status) {
      const newData = response.data.data.map((item) => ({
        id: item.assignment_id,          // assignment id
        master_category: {               // match old category structure
          id: item.portal_id,
          name: item.portal_name
        },
        created_at: item.assigned_at,    // match expected timestamp key
      }));

      setUserAssignments(prev =>
        append ? [...prev, ...newData] : newData
      );

      setAssignmentPagination(response.data.pagination);
      setAssignmentPage(page);
    }
  } catch (error) {
    console.error("Error fetching portal assignments:", error);
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
      loadUserAssignments(user.id, 1, false);
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
      const response = await removePortalUserAssignment({
        user_id: selectedUserId,
        portal_id: masterCategoryId
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

 // Add access (assign master categories to user)
 const handleAddAccess = async () => {
  if (!selectedUser || selectedMasterCategories.length === 0) {
    toast.warning("Please select a user and at least one portal");
    return;
  }

  try {
    const userObj = unassignedUsers.find((u) => u.username === selectedUser);

    const portalIds = masterCategories
      .filter((cat) => selectedMasterCategories.includes(cat.name))
      .map((cat) => cat.id);

    const res = await assignMultiplePortalsToUser({
      user_id: userObj.id,       // ✅ FIXED (was userObj.user_id)
      portal_ids: portalIds,     // ✅ matches API payload
    });

    toast.success(`${res.data.message}\n${selectedMasterCategories.join(", ")}`);
    setSelectedMasterCategories([]);

    // Refresh assignments
    loadUserAssignments(userObj.id, 1, false); // ✅ FIXED (was selectedUser)
  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.message || "Failed to assign portals");
  }
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
        
     loadUsers();
  
        setNewUser({ username: "", email: "", password: "" });
       setIsAddUserModalOpen(false);
      } catch (err) {
        toast.error(err.message?.username?.[0]);
      } finally {
        setIsLoading(false);
      }
    };
  
    const closeModal = () => {
      if (!isLoading) {
        setIsAddUserModalOpen(false);
        setNewUser({ username: "", email: "", password: "" });
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
   <div className="min-h-screen bg-gray-50 py-8 overflow-hidden">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-black px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                User Portal Mapping
                </h1>
                <p className="text-gray-300 text-sm mt-1 ml-12">Manage user permissions and portals</p>
              </div>
                 <button
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all shadow-md text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" /> Add User
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
                    Assigned Portals for {formatUsername(selectedUser)}
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

            {/* select multi portal  */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="bg-gray-900 p-1.5 rounded-lg">
                  <List className="w-4 h-4 text-white" />
                </div>
                Select Portals
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
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 transition-all bg-white text-gray-700 font-medium h-64 cursor-pointer hover:border-gray-900 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-opacity-20 outline-none overflow-hidden"
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
                Assign Portal 
              </button>
            </div>

           
          </div>
        </div>
      </div>

       {isAddUserModalOpen && (
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
};

export default UserPortalMapping;
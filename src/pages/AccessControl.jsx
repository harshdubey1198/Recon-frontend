import React, { useState, useEffect, useRef } from "react";
import { User, List, CheckCircle2, Plus, Loader2 } from "lucide-react";
import { createMasterCategory, fetchMasterCategories, assignMasterCategoriesToUser, fetchAllUsersList } from "../../server";
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

  useEffect(() => {
    loadUsers();
    loadCategories();
  }, []);

  // Handle user select scroll
  const handleUserScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    
    // Scroll to bottom - load next page
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (userPagination?.next && !isUserFetching) {
        loadUsers(userPage + 1, true);
      }
    }
    
    // Scroll to top - load previous page
    if (scrollTop === 0 && userPage > 1 && !isUserFetching) {
      loadUsers(userPage - 1, false);
    }
  };

  // Handle category select scroll
  const handleCategoryScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    
    // Scroll to bottom - load next page
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (categoryPagination?.next && !isCategoryFetching) {
        loadCategories(categoryPage + 1, true);
      }
    }
    
    // Scroll to top - load previous page
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

      // Refresh categories
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

      toast.success(
        `${res.data.message}\n${selectedMasterCategories.join(", ")}`
      );
      setSelectedUser("");
      setSelectedMasterCategories([]);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to assign categories");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-black px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  Access Control
                </h1>
                <p className="text-blue-100 text-sm mt-1">Manage user permissions and master categories</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-blue-50 transition-all shadow-md font-medium"
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
                <div className="bg-black/80 p-1.5 rounded-lg">
                  <User className="w-4 h-4 text-white" />
                </div>
                Select User
              </label>
              <div className="relative">
                <select
                  ref={userScrollRef}
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  onScroll={handleUserScroll}
                  size="6"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3  transition-all bg-white text-gray-700 font-medium cursor-pointer hover:border-black/80 overflow-y-auto"
                >
                  <option value="">-- Select User --</option>
                  {unassignedUsers.map((u) => (
                    <option key={u.id} value={u.username}>
                       {formatUsername(u.username)} {u.email ? `(${u.email})` : ""}
                    </option>
                  ))}
                </select>
                
                {isUserFetching && (
                   <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-lg">
                      <div className="flex items-center gap-2 text-black/80">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    </div>
                )}
               
              </div>
              {/* {userPagination && (
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                    Page {userPagination.page} of {userPagination.total_pages}
                  </span>
                  <span>•</span>
                  <span>{userPagination.count} total users</span>
                </p>
              )} */}
            </div>

            {/* Master Category Multi-Select */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="bg-black/80 p-1.5 rounded-lg">
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
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3  transition-all bg-white text-gray-700 font-medium h-64 cursor-pointer hover:border-black/80"
                >
                  {masterCategories.map((cat) => (
                    <option key={cat.id} value={cat.name} className="py-2 px-2 hover:bg-blue-50">
                      {cat.name}
                    </option>
                  ))}
                </select>
               {isCategoryFetching && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-lg">
                      <div className="flex items-center gap-2 text-black/80">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    </div>
)}

              </div>
              {/* {categoryPagination && (
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    Page {categoryPagination.page} of {categoryPagination.total_pages}
                  </span>
                  <span>•</span>
                  <span>{categoryPagination.count} total categories</span>
                </p>
              )} */}
              {selectedMasterCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedMasterCategories.map((cat) => (
                    <span
                      key={cat}
                      className="bg-black/80 text-white px-3 py-1 rounded-full text-xs font-medium"
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
                className="px-6 py-3 bg-black text-white rounded-xl flex items-center gap-2 hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold"
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
              <div className="bg-black/80 p-2 rounded-lg">
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
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3  transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Enter category description..."
                  value={masterCategoryDescription}
                  onChange={(e) => setMasterCategoryDescription(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3  transition-all min-h-24"
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
                className="px-5 py-2.5 bg-black text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg font-medium"
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


// import React, { useState, useEffect,useRef } from "react";
// import { User, List, CheckCircle2, Trash2, Send, Plus } from "lucide-react";
// import { createMasterCategory, fetchMasterCategories, fetchUnassignedUsers, assignMasterCategoriesToUser, fetchAllUsersList,  } from "../../server";
// import { toast } from "react-toastify";

// const AccessControl = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [masterCategoryName, setMasterCategoryName] = useState("");
//   const [masterCategoryDescription, setMasterCategoryDescription] = useState("");
//   const [masterCategories, setMasterCategories] = useState([]);
//   const [selectedMasterCategories, setSelectedMasterCategories] = useState([]);
//   const [unassignedUsers, setUnassignedUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState("");

//   // pagination states
//    const [page, setPage] = useState(1);
//   const [pagination, setPagination] = useState(null);
//   const [isFetching, setIsFetching] = useState(false);
//   const scrollRef = useRef(null);

//   useEffect(() => {
//     const loadUsers = async () => {
//       try {
//         const response = await fetchAllUsersList();
//         setUnassignedUsers(response.data.data);
//       } catch (error) {
//         console.error("Error fetching users:", error);
//       }
//     };

//     const loadCategories = async () => {
//       try {
//         const response = await fetchMasterCategories();
//         setMasterCategories(response.data.data);
//       } catch (error) {
//         console.error("Error fetching master categories:", error);
//       }
//     };

//     loadUsers();
//     loadCategories();
//   }, []);

//   // Create Master Category
//   const handleCreateMasterCategory = async () => {
//     if (!masterCategoryName || !masterCategoryDescription) {
//       toast.warning("Please fill both name and description");
//       return;
//     }
//     try {
//       await createMasterCategory({
//         name: masterCategoryName,
//         description: masterCategoryDescription,
//       });
//        toast.success("Master Category created!");
//       setIsModalOpen(false);
//       setMasterCategoryName("");
//       setMasterCategoryDescription("");

//       // Refresh categories
//       const response = await fetchMasterCategories();
//       setMasterCategories(response.data.data);
//     } catch (error) {
//       console.error(error);
//       toast.error(error.response?.data?.message || "Failed to create master category" );
//     }
//   };

//   // Add access (assign master categories to user)
//   const handleAddAccess = async () => {
//     if (!selectedUser || selectedMasterCategories.length === 0) {
//       toast.warning("Please select a user and at least one master category");
//       return;
//     }

//     try {
//       const userObj = unassignedUsers.find((u) => u.username === selectedUser);
//       const categoryIds = masterCategories
//         .filter((cat) => selectedMasterCategories.includes(cat.name))
//         .map((cat) => cat.id);

//      const res = await assignMasterCategoriesToUser({
//         username: userObj.username,
//         master_categories: categoryIds,
//       });

//         toast.success(
//             `${res.data.message}\n${selectedMasterCategories.join(", ")}`
//           );
//        setSelectedUser("");
//       setSelectedMasterCategories([]);
//     } catch (error) {
//       console.error(error);
//       toast.error(error.response?.data?.message || " Failed to assign categories" );
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-6">
//       <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
//           {/* Header */}
//           <div className="bg-black px-6 py-4 flex items-center justify-between">
//             <h1 className="text-lg font-semibold text-white">Access Control</h1>
//             {/* <button
//               onClick={() => setIsModalOpen(true)}
//               className="flex items-center gap-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-green-600"
//             >
//               <Plus className="w-4 h-4" /> Add Master Category
//             </button> */}
//           </div>

//           {/* Form */}
//           <div className="p-6 space-y-6">
//             {/* User Selection */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                 <User className="w-4 h-4" /> Select User
//               </label>
//               <select
//                 value={selectedUser}
//                 onChange={(e) => setSelectedUser(e.target.value)}
//                 className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
//               >
//                 <option value="">-- Select User --</option>
//                 {unassignedUsers.map((u) => (
//                   <option key={u.id} value={u.username}>
//                     {u.username} {u.email ? `(${u.email})` : ""}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Master Category Multi-Select */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                 <List className="w-4 h-4" /> Select Master Categories
//               </label>
//               <select
//                 multiple
//                 value={selectedMasterCategories}
//                 onChange={(e) =>
//                   setSelectedMasterCategories(
//                     Array.from(
//                       e.target.selectedOptions,
//                       (option) => option.value
//                     )
//                   )
//                 }
//                 className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200 h-[223px]"
//               >
//                 {masterCategories.map((cat) => (
//                   <option key={cat.id} value={cat.name}>
//                     {cat.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Add Access Button */}
//             <div className="flex justify-end">
//               <button
//                 onClick={handleAddAccess}
//                 className="px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2 hover:bg-gray-800 transition"
//               >
//                 <CheckCircle2 className="w-4 h-4" />
//                 Add Access
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Modal for Master Category */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
//           <div className="bg-white rounded-lg p-6 w-96 space-y-4">
//             <h3 className="text-lg font-semibold">Add Master Category</h3>
//             <input
//               type="text"
//               placeholder="Name"
//               value={masterCategoryName}
//               onChange={(e) => setMasterCategoryName(e.target.value)}
//               className="w-full border rounded px-3 py-2"
//             />
//             <textarea
//               placeholder="Description"
//               value={masterCategoryDescription}
//               onChange={(e) => setMasterCategoryDescription(e.target.value)}
//               className="w-full border rounded px-3 py-2"
//             />
//             <div className="flex justify-end gap-2">
//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleCreateMasterCategory}
//                 className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//               >
//                 Create
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AccessControl;

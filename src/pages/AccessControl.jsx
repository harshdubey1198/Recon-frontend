import React, { useState, useEffect } from "react";
import { User, List, CheckCircle2, Trash2, Send, Plus } from "lucide-react";
import { createMasterCategory, fetchMasterCategories, fetchUnassignedUsers, assignMasterCategoriesToUser, fetchAllUsersList,  } from "../../server";

const AccessControl = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [masterCategoryName, setMasterCategoryName] = useState("");
  const [masterCategoryDescription, setMasterCategoryDescription] = useState("");
  const [masterCategories, setMasterCategories] = useState([]);
  const [selectedMasterCategories, setSelectedMasterCategories] = useState([]);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetchAllUsersList();
        setUnassignedUsers(response.data.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const loadCategories = async () => {
      try {
        const response = await fetchMasterCategories();
        setMasterCategories(response.data.data);
      } catch (error) {
        console.error("Error fetching master categories:", error);
      }
    };

    loadUsers();
    loadCategories();
  }, []);

  // Create Master Category
  const handleCreateMasterCategory = async () => {
    if (!masterCategoryName || !masterCategoryDescription) {
      alert("⚠️ Please fill both name and description");
      return;
    }
    try {
      await createMasterCategory({
        name: masterCategoryName,
        description: masterCategoryDescription,
      });
      alert("✅ Master Category created!");
      setIsModalOpen(false);
      setMasterCategoryName("");
      setMasterCategoryDescription("");

      // Refresh categories
      const response = await fetchMasterCategories();
      setMasterCategories(response.data.data);
    } catch (error) {
      console.error(error);
      alert("❌ Failed to create master category");
    }
  };

  // Add access (assign master categories to user)
  const handleAddAccess = async () => {
    if (!selectedUser || selectedMasterCategories.length === 0) {
      alert("⚠️ Please select a user and at least one master category");
      return;
    }

    try {
      const userObj = unassignedUsers.find((u) => u.username === selectedUser);
      const categoryIds = masterCategories
        .filter((cat) => selectedMasterCategories.includes(cat.name))
        .map((cat) => cat.id);

      await assignMasterCategoriesToUser({
        username: userObj.username,
        master_categories: categoryIds,
      });

      alert(
        `✅ Access assigned to ${userObj.username}:\n` +
          selectedMasterCategories.join(", ")
      );

      setSelectedUser("");
      setSelectedMasterCategories([]);
    } catch (error) {
      console.error(error);
      alert("❌ Failed to assign access");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-black px-6 py-4 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-white">Access Control</h1>
            {/* <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-green-600"
            >
              <Plus className="w-4 h-4" /> Add Master Category
            </button> */}
          </div>

          {/* Form */}
          <div className="p-6 space-y-6">
            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" /> Select User
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
              >
                <option value="">-- Select User --</option>
                {unassignedUsers.map((u) => (
                  <option key={u.id} value={u.username}>
                    {u.username} {u.email ? `(${u.email})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Master Category Multi-Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <List className="w-4 h-4" /> Select Master Categories
              </label>
              <select
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
                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
              >
                {masterCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Add Access Button */}
            <div className="flex justify-end">
              <button
                onClick={handleAddAccess}
                className="px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2 hover:bg-gray-800 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Add Access
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Master Category */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 space-y-4">
            <h3 className="text-lg font-semibold">Add Master Category</h3>
            <input
              type="text"
              placeholder="Name"
              value={masterCategoryName}
              onChange={(e) => setMasterCategoryName(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <textarea
              placeholder="Description"
              value={masterCategoryDescription}
              onChange={(e) => setMasterCategoryDescription(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMasterCategory}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessControl;

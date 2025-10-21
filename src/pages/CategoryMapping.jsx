import React, { useState, useEffect } from "react";
import { Globe, List, Plus } from "lucide-react";
import {
  fetchMasterCategories,
  fetchPortals,
  fetchPortalCategories,
  mapMasterCategory,
  createMasterCategory,
} from "../../server";

const CategoryMapping = () => {
  const [masterCategories, setMasterCategories] = useState([]);
  const [selectedMasterCategory, setSelectedMasterCategory] = useState("");

  const [portals, setPortals] = useState([]);
  const [selectedPortal, setSelectedPortal] = useState(null);

  const [portalCategories, setPortalCategories] = useState([]);
  const [selectedPortalCategory, setSelectedPortalCategory] = useState("");
  const [useDefaultContent, setUseDefaultContent] = useState(false); // default false

  const [mappings, setMappings] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMasterCategoryName, setNewMasterCategoryName] = useState("");
  const [
    newMasterCategoryDescription,
    setNewMasterCategoryDescription,
  ] = useState("");

  // Load master categories + portals on mount
  useEffect(() => {
    const loadMasterCategories = async () => {
      try {
        const response = await fetchMasterCategories();
        setMasterCategories(response.data.data);
      } catch (error) {
        console.error("Error fetching master categories:", error);
      }
    };

    const loadPortals = async () => {
      try {
        const response = await fetchPortals();
        setPortals(response.data.data);
      } catch (error) {
        console.error("Error fetching portals:", error);
      }
    };

    loadMasterCategories();
    loadPortals();
  }, []);

  // Load portal categories dynamically when portal changes
  useEffect(() => {
    if (!selectedPortal) {
      setPortalCategories([]);
      return;
    }
    const loadPortalCategories = async () => {
      try {
        const response = await fetchPortalCategories(selectedPortal.name);
        setPortalCategories(response.data.data);
      } catch (error) {
        console.error("Error fetching portal categories:", error);
      }
    };
    loadPortalCategories();
  }, [selectedPortal]);

  // Add mapping
  const handleAddMapping = async () => {
    if (!selectedMasterCategory || !selectedPortal || !selectedPortalCategory) {
      alert("⚠️ Please select Master Category, Portal, and Portal Category");
      return;
    }

    const masterCategoryObj = masterCategories.find(
      (cat) => cat.name === selectedMasterCategory
    );

    const portalCategoryObj = portalCategories.find(
          (cat) => cat.id === Number(selectedPortalCategory)
        );

    const newMapping = {
      masterCategory: selectedMasterCategory,
      portal: selectedPortal.name,
      portalCategory: selectedPortalCategory,
    };

    const exists = mappings.some(
      (m) =>
        m.masterCategory === newMapping.masterCategory &&
        m.portal === newMapping.portal &&
        m.portalCategory === newMapping.portalCategory
    );

    if (exists) {
      alert("⚠️ Mapping already exists!");
      return;
    }

    try {
      // Call API with IDs
      await mapMasterCategory({
        master_category: masterCategoryObj.id,
        portal_categories: [portalCategoryObj.id],
        use_default_content: useDefaultContent, // dynamic true/false
      });

      // Update local state if API succeeds
      setMappings([...mappings, newMapping]);
      setSelectedPortalCategory("");
      alert("✅ Mapping saved successfully!");
    } catch (err) {
      console.error("Failed to map category:", err);
      alert("❌ Failed to save mapping. Check console.");
    }
  };

  // Create new Master Category
  const handleCreateMasterCategory = async () => {
    if (!newMasterCategoryName || !newMasterCategoryDescription) {
      alert("⚠️ Please fill both Name and Description");
      return;
    }

    try {
      const response = await createMasterCategory({
        name: newMasterCategoryName,
        description: newMasterCategoryDescription,
      });
      alert("✅ Master Category created successfully!");

      // Refresh master categories
      const updated = await fetchMasterCategories();
      setMasterCategories(updated.data.data);

      setIsModalOpen(false);
      setNewMasterCategoryName("");
      setNewMasterCategoryDescription("");
    } catch (error) {
      console.error("Error creating master category:", error);
      alert("❌ Failed to create master category!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow border rounded-lg p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Category Mapping</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-green-600"
            >
              <Plus className="w-4 h-4" /> Add Master Category
            </button>
          </div>

          {/* Master Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <List className="w-4 h-4" /> Select Master Category
            </label>
            <select
              value={selectedMasterCategory}
              onChange={(e) => setSelectedMasterCategory(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
            >
              <option value="">-- Select Master Category --</option>
              {masterCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Portal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Select Portal
            </label>
            <select
              value={selectedPortal?.id || ""}
              onChange={(e) => {
                const portal = portals.find(
                  (p) => p.id === Number(e.target.value)
                );
                setSelectedPortal(portal);
                setSelectedPortalCategory("");
              }}
              className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
            >
              <option value="">-- Select Portal --</option>
              {portals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Portal Category */}
          {/* {selectedPortal && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <List className="w-4 h-4" /> Select Portal Category
              </label>
              <select
                value={selectedPortalCategory}
                onChange={(e) => setSelectedPortalCategory(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
              >
                <option value="">-- Select Portal Category --</option>
                {portalCategories.map((cat, idx) => (
                  <option key={idx} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )} */}
          {/* Portal Category */}
          {selectedPortal && (
            <>
              {/* Use Default Content */}
              <div className="flex items-center gap-2 mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Use Default Content:
                </label>
                <select
                  value={useDefaultContent.toString()}
                  onChange={(e) =>
                    setUseDefaultContent(e.target.value === "true")
                  }
                  className="border rounded px-3 py-2"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              </div>

              {/* Portal Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <List className="w-4 h-4" /> Select Portal Category
                </label>
                <select
                  value={selectedPortalCategory}
                  onChange={(e) => setSelectedPortalCategory(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                >
                  <option value="">-- Select Portal Category --</option>
                  {/* {portalCategories.map((cat, idx) => (
                    <option key={idx} value={cat.name}>
                      {cat.name}
                    </option>
                  ))} */}
                  {portalCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.parent_name} → {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Add Button */}
          <button
            onClick={handleAddMapping}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Add Mapping
          </button>

          {/* Mapping List */}
          {mappings.length > 0 && (
            <div className="mt-6">
              <h2 className="font-semibold text-gray-800">Mapped Categories</h2>
              <ul className="mt-2 space-y-2">
                {mappings.map((m, idx) => (
                  <li
                    key={idx}
                    className="bg-gray-100 border px-4 py-2 rounded-lg"
                  >
                    {m.masterCategory} → {m.portal} / {m.portalCategory}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Modal for creating master category */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 space-y-4">
            <h3 className="text-lg font-semibold">Add Master Category</h3>
            <input
              type="text"
              placeholder="Name"
              value={newMasterCategoryName}
              onChange={(e) => setNewMasterCategoryName(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <textarea
              placeholder="Description"
              value={newMasterCategoryDescription}
              onChange={(e) => setNewMasterCategoryDescription(e.target.value)}
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

export default CategoryMapping;

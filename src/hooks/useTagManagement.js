// hooks/useTagManagement.js
import { useState, useEffect, useRef } from "react";
import { fetchAllTags } from "../../server";

export const useTagManagement = (formData, setFormData) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [isTagsLoading, setIsTagsLoading] = useState(true);
  const [tagInput, setTagInput] = useState("");
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagInputRef = useRef(null);

  const filteredTags = availableTags.filter((tag) => {
    const matchesSearch = tag.name
      .toLowerCase()
      .includes(tagSearchQuery.toLowerCase());
    const notSelected = !formData.tags.includes(tag.name);
    return matchesSearch && notSelected;
  });

  useEffect(() => {
    const loadTags = async () => {
      try {
        const res = await fetchAllTags();
        if (res.data?.status && res.data?.tags) {
          setAvailableTags(res.data.tags);
        }
      } catch (err) {
        console.error("Failed to fetch tags:", err);
      } finally {
        setIsTagsLoading(false);
      }
    };

    loadTags();
  }, []);

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleTagKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  return {
    availableTags,
    isTagsLoading,
    tagInput,
    setTagInput,
    tagSearchQuery,
    setTagSearchQuery,
    showTagDropdown,
    setShowTagDropdown,
    tagInputRef,
    filteredTags,
    addTag,
    handleTagKeyPress,
    removeTag,
  };
};
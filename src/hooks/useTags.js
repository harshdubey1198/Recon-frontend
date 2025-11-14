import { useState, useEffect } from "react";
import { fetchAllTags } from "../../server";

export const useTags = () => {
  const [availableTags, setAvailableTags] = useState([]);
  const [isTagsLoading, setIsTagsLoading] = useState(true);
  const [tagInput, setTagInput] = useState("");

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

  return {
    availableTags,
    isTagsLoading,
    tagInput,
    setTagInput,
  };
};

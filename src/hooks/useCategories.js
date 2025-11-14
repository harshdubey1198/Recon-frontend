import { useState, useEffect } from "react";
import { fetchAssignedCategories, fetchMappedCategoriesById } from "../../server";

export const useCategories = () => {
  const [assignedCategories, setAssignedCategories] = useState([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [nextCategoryPage, setNextCategoryPage] = useState(null);
  const [isLoadingMoreCategories, setIsLoadingMoreCategories] = useState(false);

  const loadAssignedCategories = async (page = 1, append = false) => {
    try {
      const res = await fetchAssignedCategories(page);
      if (res?.data?.status && Array.isArray(res.data.data)) {
        const categories = res.data.data
          .map((item) => item.master_category)
          .filter(Boolean)
          .map((cat) => ({
            id: Number(cat.id),
            name: cat.name,
          }));

        setAssignedCategories((prev) =>
          append ? [...prev, ...categories] : categories
        );

        const nextUrl = res.data?.pagination?.next;
        if (nextUrl) {
          const nextPageParam = new URL(nextUrl).searchParams.get("page");
          setNextCategoryPage(Number(nextPageParam));
        } else {
          setNextCategoryPage(null);
        }

        setIsCategoryLoading(false);
      }
    } catch (err) {
      console.error("❌ Failed to fetch assigned categories:", err);
    }
  };

  useEffect(() => {
    loadAssignedCategories();
  }, []);

  return {
    assignedCategories,
    isCategoryLoading,
    nextCategoryPage,
    isLoadingMoreCategories,
    setIsLoadingMoreCategories,
    loadAssignedCategories,
  };
};
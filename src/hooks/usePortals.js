import { useState, useEffect } from "react";
import { fetchMappedCategoriesById } from "../../server";

export const usePortals = (masterCategory, drafts) => {
  const [mappedPortals, setMappedPortals] = useState([]);
  const [showPortalSection, setShowPortalSection] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (!masterCategory) {
      setShowPortalSection(false);
    }
  }, [masterCategory]);

  const handleCategorySelect = async (categoryId, loadNext = false) => {
    if (!loadNext) {
      setMappedPortals([]);
      setNextPage(null);
    }

    if (!categoryId) {
      setMappedPortals([]);
      setShowPortalSection(false);
      return;
    }

    try {
      if (loadNext) setIsLoadingMore(true);
      const res = await fetchMappedCategoriesById(categoryId, loadNext ? nextPage : 1);
      const raw = res?.data?.data;
      const mappings = raw?.mappings ?? [];
      const next = res?.data?.pagination.next || null;

      if (Array.isArray(mappings) && mappings.length > 0) {
        const excluded = Array.isArray(drafts?.excluded_portals)
          ? drafts.excluded_portals.map(Number)
          : [];

        const formatted = mappings.map((item) => ({
          id: item.id,
          portalId: Number(item.portal_id),
          portalCategoryId: Number(item.portal_category),
          portalName: item.portal_name || "Unnamed Portal",
          categoryId: item.master_category,
          categoryName: item.master_category_name || "",
          portalCategoryName: item.portal_category_name || "",
          selected: !excluded.includes(Number(item.portal_category)),
        }));

        setMappedPortals((prev) => [...prev, ...formatted]);
        setShowPortalSection(true);
        if (next) {
          const nextPageParam = new URL(next).searchParams.get("page");
          setNextPage(Number(nextPageParam));
        } else {
          setNextPage(null);
        }
      } else {
        setShowPortalSection(false);
      }
    } catch (err) {
      console.error("❌ Error fetching mapped portals:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return {
    mappedPortals,
    setMappedPortals,
    showPortalSection,
    setShowPortalSection,
    nextPage,
    isLoadingMore,
    handleCategorySelect,
  };
};

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  fetchUserPortalsByUserId,
  fetchPortalParentCategories,
  fetchSubCategoriesByParent,
  fetchCrossPortalMappings,
  fetchPortals,
} from "../../server";

export const usePortalManagement = (userId, formData, setFormData, distId) => {
  const [assignedCategories, setAssignedCategories] = useState([]);
  const [mappedPortals, setMappedPortals] = useState([]);
  const [showPortalSection, setShowPortalSection] = useState(false);
  const [isPortalsLoading, setIsPortalsLoading] = useState(false);
  const [isCategoryloading, setIsCategoryloading] = useState(true);
  const [categoryHistory, setCategoryHistory] = useState([]);
  const [isViewingSubcategories, setIsViewingSubcategories] = useState(false);
  const [isCrossMappingChecked, setIsCrossMappingChecked] = useState(false);
  const [showPortalCategoryModal, setShowPortalCategoryModal] = useState(false);
  const [selectedPortalForCategories, setSelectedPortalForCategories] = useState("");
  const [portalList, setPortalList] = useState([]);
  const [portalCategoriesModal, setPortalCategoriesModal] = useState([]);
  const [isSubcategoryView, setIsSubcategoryView] = useState(false);
  const [selectedParentCategory, setSelectedParentCategory] = useState(null);
  const [forceEnablePortal, setForceEnablePortal] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const [nextCategoryPage, setNextCategoryPage] = useState(null);
  const [portalPage, setPortalPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);

  useEffect(() => {
    if (!formData.master_category) {
      setShowPortalSection(false);
    }
  }, [formData.master_category]);

  useEffect(() => {
    if (showPortalCategoryModal) {
      fetchPortals(portalPage).then((res) =>
        setPortalList(res?.data?.data || [])
      );
    }
  }, [showPortalCategoryModal, portalPage]);

  useEffect(() => {
    if (selectedPortalForCategories && categoryPage === 1) {
      fetchPortalParentCategories(
        selectedPortalForCategories,
        categoryPage
      ).then((res) => {
        const categories = res?.data?.data?.parent_categories || [];
        setPortalCategoriesModal(categories);
      });
    }
  }, [selectedPortalForCategories, categoryPage]);

  const handleCategorySelect = async (e, loadNext = false) => {
    const categoryId = loadNext ? formData.master_category : e.target.value;

    if (!loadNext) {
      setFormData((prev) => ({
        ...prev,
        master_category: categoryId,
      }));
      setMappedPortals([]);
      setCategoryHistory([]);
      setShowPortalSection(false);
      setIsViewingSubcategories(false);
    }

    if (!categoryId) {
      setMappedPortals([]);
      setShowPortalSection(false);
      setCategoryHistory([]);
      return;
    }

    if (!loadNext) setIsPortalsLoading(true);

    try {
      const res = await fetchPortalParentCategories(
        categoryId,
        loadNext ? nextPage : 1
      );
      const raw = res?.data?.data;
      const mappings = raw?.parent_categories ?? [];
      const next = res?.data?.pagination?.next || null;

      if (Array.isArray(mappings) && mappings.length > 0) {
        const selectedPortal = assignedCategories.find(
          (cat) => cat.id === Number(categoryId)
        );
        const portalName = selectedPortal?.name || "Portal";

        const formatted = mappings.map((item) => ({
          id: item.parent_external_id,
          portalId: Number(categoryId),
          portalName: portalName,
          portalCategoryName: item.parent_name,
          portalCategoryId: item.parent_external_id,
          selected: true,
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
      setIsPortalsLoading(false);
    }
  };

  const handlePortalCategoryClick = async (portal) => {
    try {
      setIsPortalsLoading(true);

      if (mappedPortals.length > 0) {
        setCategoryHistory((prev) => [...prev, mappedPortals]);
      }

      let subcats = [];
      let hasSubcategories = false;

      if (!isViewingSubcategories) {
        try {
          const subCatRes = await fetchSubCategoriesByParent(
            portal.portalId,
            portal.portalCategoryId
          );
          subcats = subCatRes?.data?.data?.categories || [];

          if (subcats.length > 0) {
            hasSubcategories = true;
            setIsViewingSubcategories(true);
          }
        } catch (subError) {
          hasSubcategories = false;
        }
      }

      if (hasSubcategories) {
        setIsViewingSubcategories(true);
        setMappedPortals(
          subcats.map((c) => ({
            id: c.id,
            portalId: portal.portalId,
            portalName: portal.portalName,
            portalCategoryName: c.name,
            portalParentCategory: c.parent_name,
            portalCategoryId: c.external_id,
            selected: true,
            has_subcategories: true,
          }))
        );
        return;
      }

      try {
        const matchingRes = await fetchCrossPortalMappings(portal.id);
        setIsCrossMappingChecked(true);
        const matchingData = matchingRes?.data?.data || {};
        const mappingFound = matchingData.mapping_found;
        const requestedCategory = matchingData.requested_portal_category;
        const mappedCategories = matchingData.mapped_portal_categories || [];

        if (mappingFound && (mappedCategories.length > 0 || requestedCategory)) {
          setIsViewingSubcategories(false);

          const allCategories = [];

          if (requestedCategory) {
            allCategories.push({
              id: requestedCategory.id,
              portalId: requestedCategory.portal_id || portal.portalId,
              portalName: requestedCategory.portal_name || portal.portalName,
              portalCategoryName: requestedCategory.name,
              portalParentCategory: requestedCategory.parent_name,
              portalCategoryId: requestedCategory.id,
              selected: true,
              mapping_found: mappingFound,
              master_category_id: matchingData.master_category_id,
            });
          }

          mappedCategories.forEach((c) => {
            allCategories.push({
              id: c.id,
              portalId: c.portal_id,
              portalName: c.portal_name,
              portalCategoryName: c.name,
              portalParentCategory: c.parent_name,
              portalCategoryId: c.id,
              selected: true,
              mapping_found: mappingFound,
              master_category_id: matchingData.master_category_id,
            });
          });

          setMappedPortals(allCategories);
          toast.success(`Found ${mappedCategories.length} matched categories`);
        } else if (requestedCategory && !hasSubcategories) {
          setMappedPortals([
            {
              id: requestedCategory.id,
              portalId: requestedCategory.portal_id || portal.portalId,
              portalName: requestedCategory.portal_name || portal.portalName,
              portalCategoryName: requestedCategory.name,
              portalParentCategory: requestedCategory.parent_name,
              portalCategoryId: requestedCategory.id,
              selected: true,
              mapping_found: mappingFound,
            },
          ]);

          if (!mappingFound) {
            toast.info("No related categories mapped yet");
          }
        } else if (!hasSubcategories && !mappingFound) {
          toast.info("No categories found for this selection");
          setCategoryHistory((prev) => prev.slice(0, -1));
        }
      } catch (matchError) {
        setIsCrossMappingChecked(true);
        if (!hasSubcategories) {
          setCategoryHistory((prev) => prev.slice(0, -1));
          toast.error("Failed to load categories");
        }
      }
    } catch (e) {
      console.error("❌ Unexpected error:", e);
      toast.error("Failed to load categories. Please try again.");
      setCategoryHistory((prev) => prev.slice(0, -1));
    } finally {
      setIsPortalsLoading(false);
    }
  };

const handleGoBack = (resetImages) => {
  if (categoryHistory.length > 0) {
    const previousState = categoryHistory[categoryHistory.length - 1];

    // restore previous mapped portals
    setMappedPortals(previousState);

    // pop history
    setCategoryHistory((prev) => prev.slice(0, -1));

    // exit subcategory view
    setIsViewingSubcategories(false);

    // check if any mapping exists in previous state
    const hasMappedPortals = previousState.some(
      (p) => p.mapping_found === true
    );

    // reset cross-mapping + images ONLY if mapping not found
    if (!hasMappedPortals) {
      setIsCrossMappingChecked(false);

      // 🔥 safely reset image upload state (modal close)
      resetImages?.();
    }
  }
};


  const loadAssignedCategories = async (page = 1, append = false) => {
    try {
      if (!userId) {
        console.error("❌ User ID not found in localStorage");
        return;
      }

      setIsCategoryloading(true);
      setShowPortalSection(true);
      setIsPortalsLoading(true);

      const res = await fetchUserPortalsByUserId(userId, page);

      if (
        res?.data?.status &&
        Array.isArray(res.data.data) &&
        res.data.data.length > 0
      ) {
        const portals = res.data.data.map((item) => ({
          id: Number(item.portal_id),
          name: item.portal_name,
        }));

        const finalList = append ? [...assignedCategories, ...portals] : portals;
        setAssignedCategories(finalList);

        if (finalList.length > 0 && !distId) {
          const defaultPortal = finalList[0];

          setFormData((p) => ({
            ...p,
            master_category: defaultPortal.id,
          }));

          try {
            const categoryRes = await fetchPortalParentCategories(
              defaultPortal.id
            );
            const parents = categoryRes?.data?.data?.parent_categories || [];

            setMappedPortals(
              parents.map((c) => ({
                id: c.parent_external_id,
                portalId: defaultPortal.id,
                portalName: defaultPortal.name,
                portalCategoryName: c.parent_name,
                portalCategoryId: c.parent_external_id,
                selected: true,
                has_subcategories: true,
              }))
            );
          } catch (err) {
            console.error("❌ Failed to fetch parent categories:", err);
            setMappedPortals([]);
          }
        }

        const nextUrl = res.data?.pagination?.next;
        if (nextUrl) {
          const nextPageParam = new URL(nextUrl).searchParams.get("page");
          setNextCategoryPage(Number(nextPageParam));
        } else {
          setNextCategoryPage(null);
        }

        setIsCategoryloading(false);
      } else {
        console.warn("⚠️ No portal found for this user.");
        setAssignedCategories([]);
        setFormData((p) => ({
          ...p,
          master_category: null,
        }));
        setMappedPortals([]);
        setShowPortalSection(false);
        setIsCategoryloading(false);
        setIsPortalsLoading(false);
        setShowPortalCategoryModal(false);
      }
    } catch (err) {
      console.error("❌ Failed to fetch portal list:", err);
      setAssignedCategories([]);
      setMappedPortals([]);
      setShowPortalSection(false);
      setIsCategoryloading(false);
      setShowPortalCategoryModal(false);
    } finally {
      setIsPortalsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignedCategories();
  }, []);

  return {
    assignedCategories,
    mappedPortals,
    setMappedPortals,
    showPortalSection,
    setShowPortalSection,
    isPortalsLoading,
    isCategoryloading,
    categoryHistory,
    setCategoryHistory,
    isViewingSubcategories,
    setIsViewingSubcategories,
    isCrossMappingChecked,
    setIsCrossMappingChecked,
    showPortalCategoryModal,
    setShowPortalCategoryModal,
    selectedPortalForCategories,
    setSelectedPortalForCategories,
    portalList,
    portalCategoriesModal,
    setPortalCategoriesModal,
    isSubcategoryView,
    setIsSubcategoryView,
    selectedParentCategory,
    setSelectedParentCategory,
    forceEnablePortal,
    setForceEnablePortal,
    handleCategorySelect,
    handlePortalCategoryClick,
    handleGoBack,
    loadAssignedCategories,
  };
};
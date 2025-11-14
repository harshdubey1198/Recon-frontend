import { useState } from "react";
import { fetchDraftNews, fetchMappedCategoriesById } from "../../server";
import constant from "../../Constant";

export const useDrafts = () => {
  const [drafts, setDrafts] = useState([]);
  const [showDrafts, setShowDrafts] = useState(false);

  const handleViewDrafts = async () => {
    try {
      const res = await fetchDraftNews();
      if (res.data?.status && Array.isArray(res.data.data)) {
        setDrafts(res.data.data);
        setShowDrafts(!showDrafts);
      }
    } catch (err) {
      console.error("Error fetching drafts:", err);
    }
  };

  const handleSelectDraft = async (
    draft,
    setFormData,
    setOriginalDraft,
    setImagePreview,
    setMappedPortals,
    setShowPortalSection
  ) => {
    setFormData({
      id: draft?.id || "",
      headline: draft.title || "",
      title: draft.title || "",
      shortDesc: draft.short_description || "",
      longDesc: draft.content || "",
      meta_title: draft.meta_title || "",
      slug: draft.slug || "",
      status: draft.status || "DRAFT",
      image: draft?.post_image || null,
      latestNews: draft.latest_news || false,
      upcomingEvents: draft.upcoming_event || false,
      headlines: draft.Head_Lines || false,
      articles: draft.articles || false,
      trending: draft.trending || false,
      breakingNews: draft.BreakingNews || false,
      eventStartDate: draft.Event_date || "",
      eventEndDate: draft.Event_end_date || "",
      scheduleDate: draft.schedule_date || "",
      counter: draft.counter || 0,
      excluded_portals: draft.excluded_portals || [],
    });

    setOriginalDraft(draft);
    setImagePreview(
      draft?.post_image ? `${constant.appBaseUrl}${draft.post_image}` : null
    );
    setShowDrafts(false);

    if (draft.master_category) {
      setFormData((prev) => ({ ...prev, master_category: draft.master_category }));
      const res = await fetchMappedCategoriesById(draft.master_category);
      if (res.data?.status && Array.isArray(res.data?.data)) {
        const formatted = res.data.data.map((item) => ({
          id: item.id,
          portalId: item.portal_id,
          portalName: item.portal_name,
          categoryId: item.master_category,
          categoryName: item.master_category_name,
          portalCategoryName: item.portal_category_name,
          selected: !(
            Array.isArray(draft.excluded_portals) &&
            draft.excluded_portals.map(Number).includes(Number(item.portal_id))
          ),
        }));
        setMappedPortals(formatted);
        setShowPortalSection(true);
      }
    }
  };

  return {
    drafts,
    showDrafts,
    setShowDrafts,
    handleViewDrafts,
    handleSelectDraft,
  };
};
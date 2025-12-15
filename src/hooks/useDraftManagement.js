// hooks/useDraftManagement.js
import { useState } from "react";
import { fetchDraftNews } from "../../server";
import constant from "../../Constant";

export const useDraftManagement = (
  setFormData,
  setImagePreview,
  setMappedPortals,
  setShowPortalSection,
  setCategoryHistory
) => {
  const [drafts, setDrafts] = useState([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [originalDraft, setOriginalDraft] = useState(null);

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

  const handleSelectDraft = async (draft) => {
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
      master_category: draft.master_category || "",
    });

    setOriginalDraft(draft);

    setImagePreview(
      draft?.post_image ? `${constant.appBaseUrl}${draft.post_image}` : null
    );
    setShowDrafts(false);

    // Handle mapped portals if master_category exists
    if (draft.master_category) {
      // Import and call fetchMappedCategoriesById here if needed
      // This would need to be passed as a dependency or imported
    }
  };

  return {
    drafts,
    showDrafts,
    setShowDrafts,
    originalDraft,
    setOriginalDraft,
    handleViewDrafts,
    handleSelectDraft,
  };
};
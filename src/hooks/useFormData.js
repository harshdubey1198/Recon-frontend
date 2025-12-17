import { useState, useEffect } from "react";
import { fetchDistributedNewsDetail } from "../../server";
import { toast } from "react-toastify";
import constant from "../../Constant";

export const useFormData = (distId) => {
  const [formData, setFormData] = useState({
    headline: "",
    title: "",
    master_category: "",
    excluded_portals: [],
    shortDesc: "",
    longDesc: "",
    image: null,
    tags: [],
    latestNews: true,
    headlines: false,
    articles: false,
    trending: false,
    breakingNews: false,
    upcomingEvents: false,
    eventStartDate: "",
    eventEndDate: "",
    scheduleDate: "",
    counter: 0,
    order: 0,
    status: "PUBLISHED",
    meta_title: "",
    slug: "",
    slugEdited: false,
  });

  const [editorKey, setEditorKey] = useState(Date.now());
  const [isDistributedEdit, setIsDistributedEdit] = useState(false);
  const [distributedNewsId, setDistributedNewsId] = useState(null);

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      if (name === "meta_title" && !prev.slugEdited) {
        newData.slug = generateSlug(value);
      }
      return newData;
    });
  };

  const handleSlugChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      slug: e.target.value,
      slugEdited: true,
    }));
  };

 const resetForm = () => {
  setIsPublished(false);
  setIsCrossMappingChecked(false);
  
  // 🔥 Revoke all portal image preview URLs
  Object.values(portalImagePreviews).forEach(url => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
  
  revokeIfBlob(imagePreview);
  
  setFormData((prev) => ({
    headline: "",
    title: "",
    shortDesc: "",
    longDesc: "",
    image: null,
    tags: [],
    content: "",
    latestNews: false,
    headlines: false,
    articles: false,
    trending: false,
    breakingNews: false,
    upcomingEvents: false,
    eventStartDate: "",
    eventEndDate: "",
    scheduleDate: "",
    counter: 0,
    order: 0,
    status: "PUBLISHED",
    meta_title: "",
    slug: "",
    slugEdited: false,
    master_category: prev.master_category, // Keep selected portal
  }));
  
  setTagInput("");
  setImagePreview(null);
  
  // 🔥 Clear portal images and previews
  setPortalImages({});
  setPortalImagePreviews({});
  setShowPortalImageUpload(false);
  
  setEditorKey(Date.now()); // Force CKEditor remount
};

  // Load distributed news data
  useEffect(() => {
    const loadDistributedNewsData = async () => {
      if (distId) {
        try {
          const res = await fetchDistributedNewsDetail(distId);
          if (res?.data?.status) {
            const nd = res.data.data.portal_response;

            setIsDistributedEdit(true);
            setDistributedNewsId(distId);

            setFormData({
              headline: nd.post_title || "",
              title: nd.post_title || "",
              shortDesc: nd.post_short_des || "",
              longDesc: nd.post_des || "",
              meta_title: nd.meta_title || "",
              slug: nd.slug || generateSlug(nd.post_title || ""),
              status: "PUBLISHED",
              image: null,
              tags: nd.post_tag
                ? nd.post_tag.split(",").map((t) => t.replace("#", "").trim())
                : [],
              latestNews: nd.Head_Lines || false,
              headlines: nd.Head_Lines || false,
              articles: nd.articles || false,
              trending: nd.trending || false,
              breakingNews: nd.BreakingNews || false,
              upcomingEvents: nd.Event || false,
              eventStartDate: nd.Event_date || "",
              eventEndDate: nd.Eventend_date || "",
              scheduleDate: nd.schedule_date || "",
              counter: nd.viewcounter || 0,
              order: nd.order || 0,
              slugEdited: false,
              master_category: res.data.data.portal_news_id || "",
            });
            setEditorKey(Date.now());
          }
        } catch (err) {
          console.error("Failed to load distributed news:", err);
          toast.error("Failed to load distributed news data");
        }
      }
    };
    loadDistributedNewsData();
  }, [distId]);

  return {
    formData,
    setFormData,
    handleInputChange,
    handleSlugChange,
    resetForm,
    editorKey,
    setEditorKey,
    isDistributedEdit,
    distributedNewsId,
  };
};
import { useState } from "react";

export const useFormData = (initialDraft = null) => {
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

  const [originalDraft, setOriginalDraft] = useState(null);
  const [editorKey, setEditorKey] = useState(Date.now());

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

  const resetForm = (revokeImageFn) => {
    if (revokeImageFn) revokeImageFn();
    setFormData({
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
    });
    setEditorKey(Date.now());
  };

  const buildDraftDiff = (oldData, newData) => {
    const diff = {};
    Object.keys(newData).forEach((key) => {
      if (newData[key] !== oldData[key]) diff[key] = newData[key];
    });
    return diff;
  };

  return {
    formData,
    setFormData,
    originalDraft,
    setOriginalDraft,
    editorKey,
    handleInputChange,
    handleSlugChange,
    resetForm,
    buildDraftDiff,
  };
};

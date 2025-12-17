// hooks/useFormSubmit.js
import { useState } from "react";
import { toast } from "react-toastify";
import {
  createNewsArticle,
  publishNewsArticle,
  updateDistributedNews,
  uploadMultipleImages,
  fetchPortalParentCategories,
} from "../../server";

export const useFormSubmit = (
  formData,
  imagePreview,
  mappedPortals,
  setImagePreview,
  availableTags,
  originalDraft,
  portalImages,
  portalImagePreviews,
  distId,
  resetForm,
  loadAssignedCategories,
  navigate,
  setShowPortalImageUpload,
  setIsCrossMappingChecked,
  setIsViewingSubcategories,
  setMappedPortals,
  setSelectedPortalForCategories,
  setCategoryHistory,
  setPortalImages,
  setPortalImagePreviews,
  assignedCategories,
  setShowPortalSection,
  setEditorKey,
  isDistributedEdit,
  distributedNewsId
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const buildDraftDiff = (oldData, newData) => {
    const diff = {};
    Object.keys(newData).forEach((key) => {
      if (newData[key] !== oldData[key]) diff[key] = newData[key];
    });
    return diff;
  };

  const handleSubmit = async (e, statusType = "PUBLISHED") => {
    e.preventDefault();

    const valid_statuses = ["DRAFT", "PUBLISHED", "rejected"];

    if (!formData.meta_title.trim()) {
      toast.warning("Meta title is required.");
      return;
    }

    if (!valid_statuses.includes(statusType)) {
      toast.warning(`Invalid status. Must be one of: ${valid_statuses.join(", ")}`);
      return;
    }

    if (!formData.image && !imagePreview) {
      toast.warning("Please upload a post image before submitting.");
      return;
    }

    if (formData.shortDesc.length > 160) {
      toast.warning("Short description must be less than 160 characters.");
      return;
    }

    setIsLoading(true);

    try {
      // Handle DISTRIBUTED NEWS UPDATE
      if (isDistributedEdit && distributedNewsId) {
        const updatePayload = {
          ai_title: formData.headline || formData.title,
          ai_short_description: formData.shortDesc,
          ai_content: formData.longDesc,
          ai_meta_title: formData.meta_title,
          ai_slug: formData.slug,
          post_tag:
            formData.tags && formData.tags.length > 0
              ? formData.tags
                  .map((tag) => {
                    const tagData = availableTags.find((t) => t.id === tag);
                    const tagName = tagData ? tagData.name : tag;
                    return `#${tagName}`;
                  })
                  .join(", ")
              : "",
          is_active: formData.latestNews ? 1 : 0,
          Head_Lines: formData.headlines ? 1 : 0,
          articles: formData.articles ? 1 : 0,
          trending: formData.trending ? 1 : 0,
          BreakingNews: formData.breakingNews ? 1 : 0,
          Event: formData.upcomingEvents ? 1 : 0,
          Event_date: formData.eventStartDate
            ? new Date(formData.eventStartDate).toISOString().split("T")[0]
            : null,
          Event_end_date: formData.eventEndDate
            ? new Date(formData.eventEndDate).toISOString().split("T")[0]
            : null,
          schedule_date: formData.scheduleDate || null,
          post_status: statusType === "PUBLISHED" ? 100 : 0,
        };

        if (formData.image && typeof formData.image !== "string") {
          updatePayload.edited_image = formData.image;
        }

        const res = await updateDistributedNews(distributedNewsId, updatePayload);

        if (res?.data?.status) {
          resetForm();
          setImagePreview(null);
          setMappedPortals([]);
          setCategoryHistory([]);
          navigate("/news-list");
          return;
        } else {
          toast.error(res?.data?.message || "Failed to update distributed news.");
          setIsLoading(false);
          return;
        }
      }

      // Original logic for master news posts
      const formDataToSend = new FormData();

      formDataToSend.append("title", formData.title || formData.headline);
      formDataToSend.append("short_description", formData.shortDesc);
      formDataToSend.append("content", formData.longDesc);
      formDataToSend.append("post_image", formData.image);
      formDataToSend.append("meta_title", formData.meta_title);
      formDataToSend.append("slug", formData.slug);
      formDataToSend.append("status", statusType);
      formDataToSend.append("counter", formData.counter);
      formDataToSend.append("order", formData.order);
      formDataToSend.append(
        "cross_portal_category_id",
        mappedPortals[0]?.mapping_found
          ? mappedPortals[0]?.portalCategoryId
          : mappedPortals[0]?.id
      );

      if (formData.tags && formData.tags.length > 0) {
        const formattedTags = formData.tags
          .map((tag) => {
            const tagData = availableTags.find((t) => t.id === tag);
            const tagName = tagData ? tagData.name : tag;
            return `#${tagName}`;
          })
          .join(", ");
        formDataToSend.append("post_tag", formattedTags);
      }

      formDataToSend.append("latest_news", formData.latestNews ? "true" : "false");
      formDataToSend.append("Head_Lines", formData.headlines ? "true" : "false");
      formDataToSend.append("articles", formData.articles ? "true" : "false");
      formDataToSend.append("trending", formData.trending ? "true" : "false");
      formDataToSend.append("BreakingNews", formData.breakingNews ? "true" : "false");
      formDataToSend.append("upcoming_event", formData.upcomingEvents ? "true" : "false");

      if (formData.eventStartDate) {
        formDataToSend.append(
          "Event_date",
          new Date(formData.eventStartDate).toISOString().split("T")[0]
        );
      }
      if (formData.eventEndDate) {
        formDataToSend.append(
          "Event_end_date",
          new Date(formData.eventEndDate).toISOString().split("T")[0]
        );
      }
      if (formData.scheduleDate) {
        formDataToSend.append("schedule_date", formData.scheduleDate);
      }

      let createdArticle;

      // UPDATE EXISTING MASTER NEWS
      if (formData.id) {
        const nextStatus = statusType === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
        const changedFields = originalDraft
          ? buildDraftDiff(originalDraft, formData)
          : formData;

        if (changedFields.longDesc) {
          changedFields.content = changedFields.longDesc;
          delete changedFields.longDesc;
        }

        changedFields.title = changedFields.title || formData.headline;
        changedFields.content = formData.longDesc || formData.content;
        changedFields.master_category = Number(formData.master_category);

        const selectedCategories = mappedPortals
          .filter((p) => p.selected)
          .map((p) => Number(p.portalCategoryId));

        const excludedCategories = mappedPortals
          .filter((p) => !p.selected)
          .map((p) => Number(p.id));

        changedFields.portal_category_ids = selectedCategories;
        changedFields.exclude_portal_categories = excludedCategories;

        createdArticle = { id: formData.id };
        if (nextStatus === "DRAFT") toast.success("Draft saved successfully.");
      }
      // CREATE NEW MASTER NEWS
      else {
        const newlyAddedCategories = mappedPortals
          .filter((p) => p.portalId === 0 && p.selected && p.portalCategoryId)
          .map((p) => Number(p.id));

        const excludedCategories = mappedPortals
          .filter((p) => !p.selected && p.portalId !== 0 && p.portalCategoryId)
          .map((p) => Number(p.portalCategoryId));

        if (mappedPortals[0]?.mapping_found) {
          formDataToSend.append(
            "portal_category_ids",
            JSON.stringify(newlyAddedCategories)
          );
        } else {
          const categoryIds =
            newlyAddedCategories.length > 0
              ? newlyAddedCategories
              : [mappedPortals[0]?.id];

          formDataToSend.append(
            "portal_category_ids",
            JSON.stringify(categoryIds)
          );
        }
        formDataToSend.append(
          "exclude_portal_categories",
          JSON.stringify(excludedCategories)
        );

        const response = await createNewsArticle(formDataToSend);
        createdArticle = response.data.data;
      }

      if (statusType === "DRAFT") {
        setIsPublished(false);
        resetForm();
        await loadAssignedCategories();
        setIsLoading(false);
        return;
      }

      if (statusType === "PUBLISHED") {
        // 🔥 STEP 1: Upload portal images FIRST (if any)
        let portalImagesUploaded = false;
        
        if (Object.keys(portalImages).length > 0) {
          try {
            // 🔥 Convert blob URLs to actual File objects
            const portalImageArray = [];
            
            for (const [portalId, fileOrUrl] of Object.entries(portalImages)) {
              let actualFile = fileOrUrl;
              
              // If it's a blob URL string, fetch and convert to File
              if (typeof fileOrUrl === 'string' && fileOrUrl.startsWith('blob:')) {
                const response = await fetch(fileOrUrl);
                const blob = await response.blob();
                actualFile = new File([blob], `portal_${portalId}.webp`, {
                  type: blob.type || 'image/webp'
                });
              }
              
              portalImageArray.push({
                portalId: Number(portalId),
                file: actualFile
              });
            }

            const uploadRes = await uploadMultipleImages(createdArticle.id, portalImageArray);
            
            console.log("✅ Upload Response:", uploadRes);
            
            // 🔥 Don't throw error, just log and continue
            toast.success(
              `Successfully uploaded ${portalImageArray.length} portal image${
                portalImageArray.length > 1 ? "s" : ""
              }`
            );

            portalImagesUploaded = true;

            // Clear portal images after successful upload
            setPortalImages({});
            Object.values(portalImagePreviews).forEach((url) =>
              URL.revokeObjectURL(url)
            );
            setPortalImagePreviews({});
          } catch (imgErr) {
            console.error("❌ Portal image upload error:", imgErr);
            // 🔥 Don't stop - continue to publish even if image upload fails
          }
        }

        // 🔥 STEP 2: Publish article AFTER images are uploaded
        const res = await publishNewsArticle(createdArticle.id, {
          portal_category_id: mappedPortals[0]?.mapping_found
            ? mappedPortals[0]?.master_category_id
            : mappedPortals[0]?.id,
        });

        if (res?.data?.message) toast.success(res.data.message);

        // After successful publish API call
        if (statusType === "PUBLISHED") {
          setIsPublished(true);
          setShowPortalImageUpload(false);
          setIsCrossMappingChecked(false);
          setIsViewingSubcategories(false);
        }

        setMappedPortals([]);
        setSelectedPortalForCategories("");
        setCategoryHistory([]);
        resetForm();
        await loadAssignedCategories();

        if (mappedPortals.length === 0 && assignedCategories.length > 0) {
          const defaultPortalId = assignedCategories[0]?.id;
          if (defaultPortalId) {
            try {
              const categoryRes = await fetchPortalParentCategories(defaultPortalId);
              const parents = categoryRes?.data?.data?.parent_categories || [];
              if (parents.length) {
                setMappedPortals(
                  parents.map((c) => ({
                    id: c.parent_external_id,
                    portalId: defaultPortalId,
                    portalName: assignedCategories[0].name,
                    portalCategoryName: c.parent_name,
                    portalCategoryId: c.parent_external_id,
                    selected: true,
                    has_subcategories: true,
                  }))
                );
                setShowPortalSection(true);
              } else {
                setShowPortalSection(false);
              }
            } catch (err) {
              setShowPortalSection(false);
            }
          }
        } else {
          setShowPortalSection(mappedPortals.length > 0);
        }
      } else {
        resetForm();
      }
    } catch (err) {
      console.error("Error processing form:", err);
      toast.error("Failed to process form.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isPublished,
    handleSubmit,
  };
};
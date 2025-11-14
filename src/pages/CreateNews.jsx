import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { createNewsArticle, publishNewsArticle, fetchPortals, fetchPortalCategories } from "../../server";

// Custom Hooks
import { useFormData } from "../hooks/useFormData";
import { useCategories } from "../hooks/useCategories";
import { usePortals } from "../hooks/usePortals";
import { useTags } from "../hooks/useTags";
import { useImageCropper } from "../hooks/useImageCropper";
import { useDrafts } from "../hooks/useDrafts";

// Components
import FormHeader from "../components/createNewsMultipleScetion/FormHeader";
import BasicInformation from "../components/createNewsMultipleScetion/BasicInformation";
import CategorySelector from "../components/createNewsMultipleScetion/CategorySelector";
import PortalSelection from "../components/createNewsMultipleScetion/PortalSelection";
import PortalCategoryModal from "../components/createNewsMultipleScetion/PortalCategoryModal";
import ImageUploader from "../components/createNewsMultipleScetion/ImageUploader";
import ImageCropper from "../components/createNewsMultipleScetion/ImageCropper";
import TagsSection from "../components/createNewsMultipleScetion/TagsSection";
import PublishingOptions from "../components/createNewsMultipleScetion/PublishingOptions";
import EventDetails from "../components/createNewsMultipleScetion/EventDetails";
import SchedulingSettings from "../components/createNewsMultipleScetion/SchedulingSettings";
import DraftsModal from "../components/createNewsMultipleScetion/DraftsModal";
import FormActions from "../components/createNewsMultipleScetion/FormActions";

const NewsArticleForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // State Management via Custom Hooks
  const {formData,setFormData,originalDraft,setOriginalDraft,editorKey,handleInputChange,handleSlugChange,resetForm,buildDraftDiff, } = useFormData();

  const {assignedCategories,isCategoryLoading,nextCategoryPage,isLoadingMoreCategories,setIsLoadingMoreCategories,loadAssignedCategories,} = useCategories();

  const { mappedPortals, setMappedPortals, showPortalSection, nextPage, isLoadingMore, handleCategorySelect,} = usePortals(formData.master_category, drafts);
  const { availableTags, isTagsLoading, tagInput, setTagInput } = useTags();

  const {imagePreview,setImagePreview,showCropper,setShowCropper,crop,setCrop,zoom,setZoom,rotation,setRotation,aspect,setAspect,revokeIfBlob,setPreviewFromFile,removeImage,onCropComplete,applyCrop,
  } = useImageCropper();
const { drafts, showDrafts, setShowDrafts, handleViewDrafts, handleSelectDraft } = useDrafts();

  // Portal Category Modal State
  const [showPortalCategoryModal, setShowPortalCategoryModal] = useState(false);
  const [portalList, setPortalList] = useState([]);
  const [portalCategoriesModal, setPortalCategoriesModal] = useState([]);
  const [selectedPortalForCategories, setSelectedPortalForCategories] = useState("");
  const [portalPage, setPortalPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);
  const [hasNextCategoryPage, setHasNextCategoryPage] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // Effects
  useEffect(() => {
    if (isEditMode) {
      console.log("🟣 Edit mode enabled for ID:", id);
    } else {
      console.log("🟢 Create mode active");
    }
  }, [isEditMode, id]);

  useEffect(() => {
    if (showPortalCategoryModal) {
      fetchPortals(portalPage).then((res) => setPortalList(res?.data?.data || []));
    }
  }, [showPortalCategoryModal, portalPage]);

  useEffect(() => {
    if (selectedPortalForCategories) {
      fetchPortalCategories(selectedPortalForCategories, categoryPage).then((res) => {
        setPortalCategoriesModal(res?.data?.data || []);
        setHasNextCategoryPage(!!res?.data?.pagination?.next);
      });
    }
  }, [selectedPortalForCategories, categoryPage]);

  // Event Handlers
  const handleCategoryChange = async (e) => {
    if (e.target.value === "load_more") {
      if (nextCategoryPage) {
        setIsLoadingMoreCategories(true);
        await loadAssignedCategories(nextCategoryPage, true);
        setIsLoadingMoreCategories(false);
      }
      return;
    }
    setFormData((prev) => ({ ...prev, master_category: e.target.value }));
    handleCategorySelect(e.target.value);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.warning("Image size must be less than 10MB");
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewFromFile(file);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setShowCropper(true);
    }
  };

  const handleApplyCrop = async () => {
    await applyCrop((croppedFile) => {
      setFormData((prev) => ({ ...prev, image: croppedFile }));
    });
  };

  const handlePortalToggle = (index) => {
    setMappedPortals((prev) => {
      const updated = prev.map((p, idx) => (idx === index ? { ...p, selected: !p.selected } : p));
      return updated;
    });
  };

  const handleLoadMorePortals = () => {
    handleCategorySelect(formData.master_category, true);
  };

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

  const handleSelectTag = (e) => {
    const tagId = e.target.value;
    if (tagId && !formData.tags.includes(tagId)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagId],
      }));
    }
    e.target.value = "";
  };

  const handleManagePortalCategories = () => {
    setShowPortalCategoryModal(true);
  };

  const handleSavePortalCategories = () => {
    const selectedCats = portalCategoriesModal.filter((c) => c.selected);
    if (selectedCats.length === 0) {
      toast.warning("Please select at least one category.");
      return;
    }

    setMappedPortals((prev) => {
      const updated = [...prev];
      selectedCats.forEach((cat) => {
        const exists = updated.some(
          (p) =>
            p.portalName === selectedPortalForCategories && p.portalCategoryName === cat.name
        );
        if (!exists) {
          updated.push({
            id: Date.now() + Math.random(),
            portalId: 0,
            portalName: selectedPortalForCategories,
            portalCategoryName: cat.name,
            portalCategoryId: cat.id,
            selected: true,
          });
        }
      });
      return updated;
    });

    toast.success(
      `${selectedCats.length} categor${selectedCats.length > 1 ? "ies" : "y"} added for ${selectedPortalForCategories}`
    );
    setShowPortalCategoryModal(false);
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

    if (!formData.image) {
      toast.warning("Please upload a post image before submitting.");
      return;
    }

    if (formData.shortDesc.length > 160) {
      toast.warning("Short description must be less than 160 characters.");
      return;
    }

    const categoryId = Number(formData.master_category);

    if (statusType === "PUBLISHED" && !categoryId && !formData.id) {
      toast.warning("Please select a category.");
      return;
    }

    setIsLoading(true);

    try {
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
      formDataToSend.append("master_category", categoryId);

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

      if (formData.id) {
        const nextStatus = statusType === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
        const changedFields = originalDraft ? buildDraftDiff(originalDraft, formData) : formData;

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
          .map((p) => Number(p.portalCategoryId));

        changedFields.portal_category_ids = selectedCategories;
        changedFields.exclude_portal_categories = excludedCategories;

        createdArticle = { id: formData.id };
        if (nextStatus === "DRAFT") toast.success("Draft saved successfully.");
      } else {
        const newlyAddedCategories = mappedPortals
          .filter((p) => p.portalId === 0 && p.selected && p.portalCategoryId)
          .map((p) => Number(p.portalCategoryId));

        const excludedCategories = mappedPortals
          .filter((p) => !p.selected && p.portalId !== 0 && p.portalCategoryId)
          .map((p) => Number(p.portalCategoryId));

        formDataToSend.append("portal_category_ids", JSON.stringify(newlyAddedCategories));
        formDataToSend.append("exclude_portal_categories", JSON.stringify(excludedCategories));

        const response = await createNewsArticle(formDataToSend);
        createdArticle = response.data.data;
      }

      if (statusType === "DRAFT") {
        resetForm(() => revokeIfBlob(imagePreview));
        setIsLoading(false);
        return;
      }

      if (statusType === "PUBLISHED") {
        const payload = {
          portal_category_ids: mappedPortals
            .filter((p) => p.selected)
            .map((p) => Number(p.portalCategoryId)),
          exclude_portal_categories: mappedPortals
            .filter((p) => !p.selected)
            .map((p) => Number(p.portalCategoryId)),
        };

        const res = await publishNewsArticle(createdArticle.id, payload);
        resetForm(() => revokeIfBlob(imagePreview));
        if (res?.data?.message) toast.success(res.data.message);
      }

      resetForm(() => revokeIfBlob(imagePreview));
    } catch (err) {
      toast.error("Failed to process form.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetForm = () => {
    resetForm(() => revokeIfBlob(imagePreview));
  };

  const handleSelectDraftWrapper = (draft) => {
    handleSelectDraft( draft, setFormData, setOriginalDraft, setImagePreview, setMappedPortals, () => {}
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
          <FormHeader onReset={handleResetForm} onViewDrafts={handleViewDrafts} />

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <BasicInformation formData={formData} onInputChange={handleInputChange} onSlugChange={handleSlugChange} onSubmit={handleSubmit} isLoading={isLoading}
              editorKey={editorKey}
            />

            <CategorySelector formData={formData} assignedCategories={assignedCategories} isCategoryLoading={isCategoryLoading} nextCategoryPage={nextCategoryPage} 
            isLoadingMoreCategories={isLoadingMoreCategories} 
           onCategoryChange={handleCategoryChange} onLoadMoreCategories={() => loadAssignedCategories(nextCategoryPage, true)} />

            {showPortalSection && (
              <PortalSelection mappedPortals={mappedPortals} onPortalToggle={handlePortalToggle} onLoadMore={handleLoadMorePortals} hasNextPage={!!nextPage} isLoadingMore={isLoadingMore}
                onManageCategories={handleManagePortalCategories}
              />
            )}

            <ImageUploader  imagePreview={imagePreview}  onImageUpload={handleImageUpload}  onRemoveImage={removeImage}  onOpenCropper={() => setShowCropper(true)}
            />

            <TagsSection formData={formData} availableTags={availableTags} isTagsLoading={isTagsLoading} tagInput={tagInput} onTagInputChange={(e) => setTagInput(e.target.value)} onAddTag={addTag}
              onRemoveTag={removeTag} onSelectTag={handleSelectTag}  onTagKeyPress={handleTagKeyPress}
            />

            <PublishingOptions formData={formData} onInputChange={handleInputChange} />

            <EventDetails formData={formData} onInputChange={handleInputChange} />

            <SchedulingSettings formData={formData} onInputChange={handleInputChange} />

            <FormActions  isLoading={isLoading}  onReset={handleResetForm}  onSubmit={handleSubmit}  />
          </form>
        </div>
      </div>

      <ImageCropper show={showCropper} imagePreview={imagePreview} crop={crop} zoom={zoom} rotation={rotation} aspect={aspect} onCropChange={setCrop}
        onZoomChange={setZoom} onRotationChange={setRotation} onAspectChange={setAspect} onCropComplete={onCropComplete}onApply={handleApplyCrop}onClose={() => setShowCropper(false)}
       />

      <DraftsModal show={showDrafts} drafts={drafts} onClose={() => setShowDrafts(false)} onSelectDraft={handleSelectDraftWrapper}
      />

      <PortalCategoryModal show={showPortalCategoryModal}  portalList={portalList}  portalCategories={portalCategoriesModal}  setPortalCategories={setPortalCategoriesModal}  selectedPortal={selectedPortalForCategories}
        onSelectPortal={setSelectedPortalForCategories} categoryPage={categoryPage} setCategoryPage={setCategoryPage} hasNextPage={hasNextCategoryPage} onSave={handleSavePortalCategories} onClose={() => setShowPortalCategoryModal(false)}
      />
    </div>
  );
};

export default NewsArticleForm;
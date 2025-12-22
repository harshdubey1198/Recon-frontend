// NewsArticleForm.jsx (MAIN COMPONENT)
import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "../css/InputCursorFix.css";


// Import hooks
import { useFormData } from "../hooks/useFormData";
import { usePortalManagement } from "../hooks/usePortalManagement";
import { useImageManagement } from "../hooks/useImageManagement";
import { useTagManagement } from "../hooks/useTagManagement";
import { useDraftManagement } from "../hooks/useDraftManagement";
import { useFormSubmit } from "../hooks/useFormSubmit";
import FormHeader from "../components/NewsArticleForm/FormHeader";
import PortalSelectionSection from "../components/NewsArticleForm/PortalSelectionSection";
import PortalCategoryModal from "../components/NewsArticleForm/PortalCategoryModal";
import BasicInfoSection from "../components/NewsArticleForm/BasicInfoSection";
import FeaturedImageSection from "../components/NewsArticleForm/FeaturedImageSection";
import ImageCropperModal from "../components/NewsArticleForm/ImageCropperModal";
import PortalImagesSection from "../components/NewsArticleForm/PortalImagesSection";
import TagsSection from "../components/NewsArticleForm/TagsSection";
import PublishingOptionsSection from "../components/NewsArticleForm/PublishingOptionsSection";
import EventDetailsSection from "../components/NewsArticleForm/EventDetailsSection";
import SchedulingSection from "../components/NewsArticleForm/SchedulingSection";
import FormActions from "../components/NewsArticleForm/FormActions";
import DraftsModal from "../components/NewsArticleForm/DraftsModal";

const NewsArticleForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const distId = queryParams.get("dist_id");

  const isEditMode = Boolean(id);
  const authUser = JSON.parse(localStorage.getItem("auth_user"));
  const userId = authUser?.id || null;

  // Use custom hooks
  const {
    formData,
    setFormData,
    handleInputChange,
    handleSlugChange,
    resetForm,
    editorKey,
    setEditorKey,
    isDistributedEdit,
    distributedNewsId,
  } = useFormData(distId);

  const {
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
  } = usePortalManagement(userId, formData, setFormData, distId);

  const {
    imagePreview,
    setImagePreview,
    showCropper,
    setShowCropper,
    crop,
    setCrop,
    zoom,
    setZoom,
    rotation,
    setRotation,
    aspect,
    setAspect,
    croppedAreaPixels,
    cropPreview,
    activePortalForCrop,
    portalImages,
    setPortalImages,
    portalImagePreviews,
    setPortalImagePreviews,
    showPortalImageUpload,
    setShowPortalImageUpload,
    handleImageUpload,
    removeImage,
    onCropComplete,
    applyCrop,
    handlePortalImageUpload,
    removePortalImage,
  } = useImageManagement(formData, setFormData);

  const {
    availableTags,
    isTagsLoading,
    tagInput,
    setTagInput,
    tagSearchQuery,
    setTagSearchQuery,
    showTagDropdown,
    setShowTagDropdown,
    tagInputRef,
    filteredTags,
    addTag,
    handleTagKeyPress,
    removeTag,
  } = useTagManagement(formData, setFormData);

  const {
    drafts,
    showDrafts,
    setShowDrafts,
    originalDraft,
    handleViewDrafts,
    handleSelectDraft,
  } = useDraftManagement(setFormData, setImagePreview, setMappedPortals, setShowPortalSection, setCategoryHistory);

 const { isLoading, isPublished, handleSubmit } = useFormSubmit(
  formData,
  imagePreview,
  mappedPortals,
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
);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
          <FormHeader
            distId={distId}
            handleViewDrafts={handleViewDrafts}
            resetForm={resetForm}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            isDistributedEdit={isDistributedEdit}
          />

          <form onSubmit={(e) => e.preventDefault()} className="p-8 space-y-8">
            {!distId && (
              <PortalSelectionSection
                isCategoryloading={isCategoryloading}
                assignedCategories={assignedCategories}
                formData={formData}
                setFormData={setFormData}
                handleCategorySelect={handleCategorySelect}
                showPortalSection={showPortalSection}
                isPortalsLoading={isPortalsLoading}
                mappedPortals={mappedPortals}
                setMappedPortals={setMappedPortals}
                categoryHistory={categoryHistory}
                isViewingSubcategories={isViewingSubcategories}
                handlePortalCategoryClick={handlePortalCategoryClick}
                handleGoBack={() =>
                                handleGoBack(() => {
                                  setShowPortalImageUpload(false); // modal close
                                })
                              }
                setShowPortalCategoryModal={setShowPortalCategoryModal}
                forceEnablePortal={forceEnablePortal}
                setForceEnablePortal={setForceEnablePortal}
                isCrossMappingChecked={isCrossMappingChecked}
              />
            )}

            {showPortalCategoryModal && (
              <PortalCategoryModal
                showPortalCategoryModal={showPortalCategoryModal}
                setShowPortalCategoryModal={setShowPortalCategoryModal}
                selectedPortalForCategories={selectedPortalForCategories}
                setSelectedPortalForCategories={setSelectedPortalForCategories}
                portalList={portalList}
                portalCategoriesModal={portalCategoriesModal}
                setPortalCategoriesModal={setPortalCategoriesModal}
                isSubcategoryView={isSubcategoryView}
                setIsSubcategoryView={setIsSubcategoryView}
                selectedParentCategory={selectedParentCategory}
                setSelectedParentCategory={setSelectedParentCategory}
                setMappedPortals={setMappedPortals}
                setShowPortalSection={setShowPortalSection}
                formData={formData}
              />
            )}

            <BasicInfoSection
              formData={formData}
              handleInputChange={handleInputChange}
              handleSlugChange={handleSlugChange}
              editorKey={editorKey}
              setFormData={setFormData}
            />

            <FeaturedImageSection imagePreview={imagePreview} setShowCropper={setShowCropper} removeImage={removeImage} handleImageUpload={handleImageUpload} />

            {showCropper && (
              <ImageCropperModal
                showCropper={showCropper}
                setShowCropper={setShowCropper}
                cropPreview={cropPreview}
                crop={crop}
                setCrop={setCrop}
                zoom={zoom}
                setZoom={setZoom}
                rotation={rotation}
                setRotation={setRotation}
                aspect={aspect}
                setAspect={setAspect}
                onCropComplete={onCropComplete}
                applyCrop={applyCrop}
              />
            )}

            {showPortalSection && mappedPortals.length > 0 && !distId && (
              <PortalImagesSection
                isCrossMappingChecked={isCrossMappingChecked}
                isPublished={isPublished}
                showPortalImageUpload={showPortalImageUpload}
                setShowPortalImageUpload={setShowPortalImageUpload}
                mappedPortals={mappedPortals}
                portalImages={portalImages}
                portalImagePreviews={portalImagePreviews}
                handlePortalImageUpload={handlePortalImageUpload}
                removePortalImage={removePortalImage}
              />
            )}

            <TagsSection
              tagInput={tagInput}
              setTagInput={setTagInput}
              handleTagKeyPress={handleTagKeyPress}
              addTag={addTag}
              tagSearchQuery={tagSearchQuery}
              setTagSearchQuery={setTagSearchQuery}
              tagInputRef={tagInputRef}
              showTagDropdown={showTagDropdown}
              setShowTagDropdown={setShowTagDropdown}
              isTagsLoading={isTagsLoading}
              filteredTags={filteredTags}
              formData={formData}
              setFormData={setFormData}
              availableTags={availableTags}
              removeTag={removeTag}
            />

            <PublishingOptionsSection formData={formData} handleInputChange={handleInputChange} />

            {formData.upcomingEvents && <EventDetailsSection formData={formData} handleInputChange={handleInputChange} />}

            <SchedulingSection formData={formData} handleInputChange={handleInputChange} />

            <FormActions resetForm={resetForm} isLoading={isLoading} handleSubmit={handleSubmit} isDistributedEdit={isDistributedEdit} />
          </form>
        </div>
      </div>

      {showDrafts && <DraftsModal showDrafts={showDrafts} setShowDrafts={setShowDrafts} drafts={drafts} handleSelectDraft={handleSelectDraft} />}
    </div>
  );
};

export default NewsArticleForm;

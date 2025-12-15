import React from "react";
import { ImageIcon, Upload, X, Eye, AlertCircle } from "lucide-react";

const PortalImagesSection = ({
  isCrossMappingChecked,
  isPublished,
  showPortalImageUpload,
  setShowPortalImageUpload,
  mappedPortals,
  portalImages,
  portalImagePreviews,
  handlePortalImageUpload,
  removePortalImage,
  canUploadImages,
}) => {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b-2 border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gray-100 rounded-lg">
            <ImageIcon className="w-5 h-5 text-gray-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Portal-Specific Images</h2>
            <p className="text-xs text-gray-500 mt-0.5">Upload custom images for each portal (optional)</p>
          </div>
        </div>
        <button
        type="button"
        disabled={!isCrossMappingChecked || isPublished}
        onClick={() => setShowPortalImageUpload(prev => !prev)}
        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all
          ${isCrossMappingChecked && !isPublished
            ? "bg-gray-900 text-white hover:bg-gray-800"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"}
        `}
      >

      {showPortalImageUpload ? (
        <>
          <Eye className="w-4 h-4" />
          Hide
        </>
      ) : (
        <>
          <Upload className="w-4 h-4" />
          Upload Images
        </>
      )}
    </button>
      </div>

      {showPortalImageUpload && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mappedPortals
            .filter((portal) => portal.selected && (portal.portalId || portal.is_manually_added))
            .map((portal, idx) => (
              <div key={idx} className="border-2 border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-all">
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm">{portal.portalName}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{portal.portalCategoryName}</p>
                </div>

                {portalImagePreviews[portal.portalId] ? (
                  <div className="relative group">
                    <div className="aspect-video rounded-lg overflow-hidden border border-gray-200">
                      <img src={portalImagePreviews[portal.portalId]} alt={`${portal.portalName} preview`} className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePortalImage(portal.portalId)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      {portalImages[portal.portalId]?.name}
                    </div>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-all">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-600 font-medium">Click to upload</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                    </div>
                    <input type="file" accept="image/*" onChange={(e) => handlePortalImageUpload(portal.portalId, e.target.files[0])} className="hidden" />
                  </label>
                )}
              </div>
            ))}
        </div>
      )}

      {Object.keys(portalImages).length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">
              {Object.keys(portalImages).length} portal image{Object.keys(portalImages).length > 1 ? "s" : ""} ready to upload
            </p>
            <p className="text-xs text-blue-700 mt-1">These images will be uploaded automatically after publishing the article</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default PortalImagesSection;
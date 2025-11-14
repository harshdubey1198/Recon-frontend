import React from "react";
import { Upload, X, Crop, AlertCircle, ImageIcon } from "lucide-react";
import constant from "../../Constant";

const ImageUploader = ({
  imagePreview,
  onImageUpload,
  onRemoveImage,
  onOpenCropper,
}) => {
  return (
    <section className="space-y-5">
      <div className="flex items-center space-x-2 pb-3 border-b-2 border-gray-200">
        <div className="p-2 bg-gray-100 rounded-lg">
          <ImageIcon className="w-5 h-5 text-gray-700" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Featured Image *</h2>
      </div>

      {imagePreview ? (
        <div className="relative group">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50">
            <img
              src={imagePreview}
              alt="Preview"
              className="absolute top-1/2 left-1/2 w-auto h-full max-w-full max-h-full object-cover -translate-x-1/2 -translate-y-1/2"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onOpenCropper}
                className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all flex items-center gap-2 shadow-lg"
              >
                <Crop className="w-4 h-4" />
                Crop & Edit
              </button>
              <button
                type="button"
                onClick={onRemoveImage}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800">
              <strong>Tip:</strong> Hover over the image and click "Crop & Edit" to
              adjust the image, zoom, rotate, or change aspect ratio
            </p>
          </div>
        </div>
      ) : (
        <label
          htmlFor="image-upload"
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all group"
        >
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-all">
              <Upload className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-base font-medium mt-4 text-gray-700">
              Click to upload image
            </p>
            <p className="text-sm mt-2 text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
          />
        </label>
      )}
    </section>
  );
};

export default React.memo(ImageUploader);
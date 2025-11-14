import React from "react";
import Cropper from "react-easy-crop";
import { X, Crop, ZoomIn, RotateCw, Maximize2 } from "lucide-react";

const ImageCropper = ({
  show,
  imagePreview,
  crop,
  zoom,
  rotation,
  aspect,
  onCropChange,
  onZoomChange,
  onRotationChange,
  onAspectChange,
  onCropComplete,
  onApply,
  onClose,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
            <Crop className="w-4 h-4 sm:w-5 sm:h-5" />
            Crop & Edit Image
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
        </div>

        {/* Cropper Section */}
        <div className="relative w-full flex-1 min-h-[300px] sm:min-h-[400px] md:min-h-[500px] bg-gray-900">
          <Cropper
            image={imagePreview}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            rotation={rotation}
            showGrid={true}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropComplete}
            onRotationChange={onRotationChange}
            cropShape="rect"
            style={{
              containerStyle: {
                backgroundColor: "#111827",
              },
            }}
          />
        </div>

        {/* Controls */}
        <div className="p-4 sm:p-6 bg-gray-50 space-y-5 overflow-y-auto">
          {/* Zoom and Rotate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <ZoomIn className="w-4 h-4" />
                Zoom
              </label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => onZoomChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-gray-900"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <RotateCw className="w-4 h-4" />
                Rotate
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={rotation}
                onChange={(e) => onRotationChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-gray-900"
              />
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Maximize2 className="w-4 h-4" />
              Aspect Ratio
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Free", value: null },
                { label: "1:1", value: 1 },
                { label: "4:3", value: 4 / 3 },
                { label: "16:9", value: 16 / 9 },
                { label: "3:4", value: 3 / 4 },
                { label: "9:16", value: 9 / 16 },
              ].map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onAspectChange(value)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    aspect === value
                      ? "bg-gray-900 text-white shadow-lg"
                      : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onApply}
              className="w-full sm:w-auto px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all shadow-lg"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ImageCropper);
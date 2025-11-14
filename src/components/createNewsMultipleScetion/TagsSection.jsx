import React from "react";
import { Tag, Plus, X } from "lucide-react";

const TagsSection = ({
  formData,
  availableTags,
  isTagsLoading,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  onSelectTag,
  onTagKeyPress,
}) => {
  return (
    <section className="space-y-5">
      <div className="flex items-center space-x-2 pb-3 border-b-2 border-gray-200">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Tag className="w-5 h-5 text-gray-700" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Custom Tag
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={onTagInputChange}
              onKeyPress={onTagKeyPress}
              placeholder="Enter custom tag..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={onAddTag}
              className="px-4 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Existing Tag
          </label>
          <select
            onChange={onSelectTag}
            disabled={isTagsLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {isTagsLoading ? "Loading tags..." : "-- Select Tag --"}
            </option>
            {availableTags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {formData.tags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selected Tags ({formData.tags.length})
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map((tag, i) => {
              const tagData = availableTags.find((t) => t.id === tag);
              const displayName = tagData ? tagData.name : tag;
              return (
                <span
                  key={i}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm"
                >
                  <span>#{displayName}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveTag(tag)}
                    className="hover:bg-white/20 rounded p-0.5 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              );
            })}
          </div>
          <div className="text-sm text-gray-800 font-medium">
            {formData.tags
              .map((tag) => {
                const tagData = availableTags.find((t) => t.id === tag);
                const name = tagData ? tagData.name : tag;
                return `#${name}`;
              })
              .join(", ")}
          </div>
        </div>
      )}
    </section>
  );
};

export default React.memo(TagsSection);
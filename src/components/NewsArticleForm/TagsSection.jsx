import React from "react";
import { Tag, Plus, X } from "lucide-react";

const TagsSection = ({
  tagInput,
  setTagInput,
  handleTagKeyPress,
  addTag,
  tagSearchQuery,
  setTagSearchQuery,
  tagInputRef,
  showTagDropdown,
  setShowTagDropdown,
  isTagsLoading,
  filteredTags,
  formData,
  setFormData,
  availableTags,
  removeTag,
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Add Custom Tag</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagKeyPress}
              placeholder="Enter custom tag..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Existing Tag</label>
          <input
            type="text"
            value={tagSearchQuery}
            ref={tagInputRef}
            onChange={(e) => setTagSearchQuery(e.target.value)}
            onFocus={() => setShowTagDropdown(true)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Click to search and select tags..."
            disabled={isTagsLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
          />

          {showTagDropdown && !isTagsLoading && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => {
                  setShowTagDropdown(false);
                  setTagSearchQuery("");
                }}
              />
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {filteredTags.length > 0 ? (
                  filteredTags.map((tag) => (
                    <div
                      key={tag.slug}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag.name] }));
                        setTagSearchQuery("");
                        setTimeout(() => tagInputRef.current?.focus(), 0);
                      }}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-all border-b border-gray-100 last:border-b-0"
                    >
                      <span className="text-sm text-gray-800 font-medium">{tag.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    {tagSearchQuery ? "No matching tags found" : "All tags selected or no tags available"}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {formData.tags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Selected Tags ({formData.tags.length})</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map((tag, i) => {
              const tagData = availableTags.find((t) => t.id === tag);
              const displayName = tagData ? tagData.name : tag;
              return (
                <span key={i} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm">
                  <span>#{displayName}</span>
                  <button type="button" onClick={() => removeTag(tag)} className="hover:bg-white/20 rounded p-0.5 transition-all">
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

export default TagsSection;
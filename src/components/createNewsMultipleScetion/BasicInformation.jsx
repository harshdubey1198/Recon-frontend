import React from "react";
import { Settings, Save, SaveAll } from "lucide-react";
import { CKEditor } from "ckeditor4-react";

const BasicInformation = ({
  formData,
  onInputChange,
  onSlugChange,
  onSubmit,
  isLoading,
  editorKey,
}) => {
  return (
    <section className="space-y-5">
      <div className="flex relative items-center space-x-2 pb-3 border-b-2 border-gray-200">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Settings className="w-5 h-5 text-gray-700" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
        <div className="absolute right-2.5 flex gap-0.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={(e) => onSubmit(e, "DRAFT")}
            className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg text-xs font-semibold hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg"
          >
            <SaveAll className="w-4 h-4 mr-2" />
            Save as Draft
          </button>
          <button
            type="submit"
            onClick={(e) => onSubmit(e, "PUBLISHED")}
            disabled={isLoading}
            className="px-8 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg text-xs font-semibold hover:from-gray-800 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-3 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Publishing...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Publish Article
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Headline <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="headline"
            value={formData.headline}
            onChange={onInputChange}
            placeholder="Enter compelling headline..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Meta Title *
        </label>
        <input
          type="text"
          name="meta_title"
          value={formData.meta_title || ""}
          onChange={onInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          placeholder="Meta title for SEO"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          URL Slug
        </label>
        <input
          type="text"
          name="slug"
          value={formData.slug}
          onChange={onSlugChange}
          placeholder="url-friendly-slug"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all font-mono"
        />
        <p className="text-gray-500 text-xs mt-1.5">
          Auto-generated from meta title but editable
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Short Description *
        </label>
        <textarea
          name="shortDesc"
          value={formData.shortDesc}
          onChange={onInputChange}
          rows="3"
          maxLength="160"
          placeholder="Brief summary of the article (max 160 characters)..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          required
        />
        <p className="text-gray-500 text-xs mt-1.5 text-right">
          {formData.shortDesc.length}/160 characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Full Content *
        </label>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <CKEditor
            key={editorKey}
            scriptUrl="/ckeditor/ckeditor.js"
            initData={formData.longDesc}
            onBeforeLoad={(CKEDITOR) => {
              CKEDITOR.disableAutoInline = true;
            }}
            config={{
              height: 400,
              removePlugins: "easyimage,cloudservices",
              extraPlugins: "widget,justify,colorbutton,font",
              autoGrow_minHeight: 300,
              autoGrow_maxHeight: 600,
              contentsCss: "/ckeditor/contents.css",
              language: "en",
              skin: "moono-lisa,/ckeditor/skins/moono-lisa/",
              toolbar: [
                { name: "document", items: ["Source", "-", "Preview", "Print"] },
                { name: "clipboard", items: ["Cut", "Copy", "Paste", "-", "Undo", "Redo"] },
                { name: "editing", items: ["Find", "Replace", "-", "SelectAll"] },
                {
                  name: "insert",
                  items: [
                    "Image",
                    "Table",
                    "HorizontalRule",
                    "SpecialChar",
                    "CodeSnippet",
                    "Youtube",
                    "Html5video",
                    "Link",
                    "Unlink",
                    "-",
                  ],
                },
                {
                  name: "basicstyles",
                  items: ["Bold", "Italic", "Underline", "Strike", "-", "RemoveFormat"],
                },
                {
                  name: "paragraph",
                  items: [
                    "NumberedList",
                    "BulletedList",
                    "-",
                    "Outdent",
                    "Indent",
                    "-",
                    "Blockquote",
                    "JustifyLeft",
                    "JustifyCenter",
                    "JustifyRight",
                    "JustifyBlock",
                  ],
                },
                { name: "styles", items: ["Styles", "Format", "Font", "FontSize"] },
                { name: "colors", items: ["TextColor", "BGColor"] },
                { name: "tools", items: ["Maximize"] },
              ],
            }}
            onChange={(event) => {
              const data = event.editor.getData();
              onInputChange({
                target: { name: "longDesc", value: data },
              });
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default React.memo(BasicInformation);

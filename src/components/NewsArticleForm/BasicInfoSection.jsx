import React from "react";
import { CKEditor } from "ckeditor4-react";

const BasicInfoSection = ({ formData, handleInputChange, handleSlugChange, editorKey, setFormData }) => {
  return (
    <section className="space-y-5">
      <div className="grid grid-cols-1 gap-2">
        <label className="block text-sm font-semibold text-gray-700 mb-0">
          Headline <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="headline"
          value={formData.headline}
          onChange={handleInputChange}
          placeholder="Enter compelling headline..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Title *</label>
          <input
            type="text"
            name="meta_title"
            value={formData.meta_title || ""}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            placeholder="Meta title for SEO"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">URL Slug</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleSlugChange}
            placeholder="url-friendly-slug"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all font-mono"
          />
          <p className="text-gray-500 text-xs mt-1.5">Auto-generated from meta title but editable</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description *</label>
        <textarea
          name="shortDesc"
          value={formData.shortDesc}
          onChange={handleInputChange}
          rows="3"
          maxLength="160"
          placeholder="Brief summary of the article (max 160 characters)..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          required
        />
        <p className="text-gray-500 text-xs mt-1.5 text-right">{formData.shortDesc.length}/160 characters</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Content *</label>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <CKEditor
            key={editorKey}
            scriptUrl="/ckeditor/ckeditor.js"
            initData={formData.longDesc}
            onBeforeLoad={(CKEDITOR) => {
              CKEDITOR.disableAutoInline = true;
              document.body.setAttribute("contenteditable", "false");
              document.body.style.caretColor = "transparent";
            }}
            config={{
              height: 400,
              versionCheck: false,
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
                { name: "insert", items: ["Image", "Table", "HorizontalRule", "SpecialChar", "CodeSnippet", "Youtube", "Html5video", "Link", "Unlink", "-"] },
                { name: "basicstyles", items: ["Bold", "Italic", "Underline", "Strike", "-", "RemoveFormat"] },
                { name: "paragraph", items: ["NumberedList", "BulletedList", "-", "Outdent", "Indent", "-", "Blockquote", "JustifyLeft", "JustifyCenter", "JustifyRight", "JustifyBlock"] },
                { name: "styles", items: ["Styles", "Format", "Font", "FontSize"] },
                { name: "colors", items: ["TextColor", "BGColor"] },
                { name: "tools", items: ["Maximize"] },
              ],
            }}
            onChange={(event) => {
              const data = event.editor.getData();
              setFormData((prev) => ({ ...prev, longDesc: data }));
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default BasicInfoSection;
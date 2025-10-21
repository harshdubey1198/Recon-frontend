import React, { useState, useEffect } from "react";
import {
  Upload,
  X,
  Plus,
  Calendar,
  Eye,
  Save,
  RefreshCw,
  Image as ImageIcon,
  Tag,
  FileText,
  Settings,
  Clock,
  TrendingUp,
  AlertCircle,
  Star,
  Crop,
  RotateCw,
  ZoomIn,
  Maximize2,
} from "lucide-react";
import Cropper from "react-easy-crop";
import { CKEditor } from "ckeditor4-react";
import {
  createNewsArticle,
  publishNewsArticle,
  fetchAllTags,
  fetchAssignedCategories
} from "../../server";

const NewsArticleForm = () => {
  const [formData, setFormData] = useState({
    headline: "",
    master_category_id: "", // keep only this
    shortDesc: "",
    longDesc: "",
    image: null,
    tags: [],
    latestNews: true,
    headlines: false,
    articles: false,
    trending: false,
    breakingNews: false,
    upcomingEvents: false,
    eventStartDate: "",
    eventEndDate: "",
    scheduleDate: "",
    counter: 0,
    order: 0,
    status: "active",
    meta_title: "",
    slug: "",
    slugEdited: false,
  });
  

  const [availableTags, setAvailableTags] = useState([]);
  const [isTagsLoading, setIsTagsLoading] = useState(true);
  const [tagInput, setTagInput] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState(16 / 9);
  const [assignedCategories, setAssignedCategories] = useState([]);


  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  const revokeIfBlob = (url) => {
    if (url && typeof url === "string" && url.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(url);
      } catch (_) {}
    }
  };

  const setPreviewFromFile = (file) => {
    const objectUrl = URL.createObjectURL(file);
    revokeIfBlob(imagePreview);
    setImagePreview(objectUrl);
  };

  const getRadianAngle = (deg) => (deg * Math.PI) / 180;

  const rotateSize = (width, height, rotationDeg) => {
    const rotRad = getRadianAngle(rotationDeg);
    return {
      width:
        Math.abs(Math.cos(rotRad) * width) +
        Math.abs(Math.sin(rotRad) * height),
      height:
        Math.abs(Math.sin(rotRad) * width) +
        Math.abs(Math.cos(rotRad) * height),
    };
  };

  const getCroppedImg = async (imageSrc, cropPixels, rotationDeg = 0) => {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = imageSrc;
    });

    const rotRad = getRadianAngle(rotationDeg);
    const { width: rotatedW, height: rotatedH } = rotateSize(
      image.width,
      image.height,
      rotationDeg
    );

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = Math.round(rotatedW);
    tempCanvas.height = Math.round(rotatedH);
    const tctx = tempCanvas.getContext("2d");
    tctx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tctx.rotate(rotRad);
    tctx.drawImage(image, -image.width / 2, -image.height / 2);

    const outCanvas = document.createElement("canvas");
    outCanvas.width = Math.round(cropPixels.width);
    outCanvas.height = Math.round(cropPixels.height);
    const outCtx = outCanvas.getContext("2d");

    outCtx.drawImage(
      tempCanvas,
      Math.round(cropPixels.x),
      Math.round(cropPixels.y),
      Math.round(cropPixels.width),
      Math.round(cropPixels.height),
      0,
      0,
      Math.round(cropPixels.width),
      Math.round(cropPixels.height)
    );

    return await new Promise((resolve) => {
      outCanvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.95);
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      if (name === "meta_title" && !prev.slugEdited) {
        newData.slug = generateSlug(value);
      }
      return newData;
    });
  };

  const handleSlugChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      slug: e.target.value,
      slugEdited: true,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Image size must be less than 10MB");
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

  const removeImage = () => {
    revokeIfBlob(imagePreview);
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const onCropComplete = (croppedArea, croppedAreaPx) => {
    setCroppedAreaPixels(croppedAreaPx);
  };

  const applyCrop = async () => {
    if (!imagePreview || !croppedAreaPixels) {
      setShowCropper(false);
      return;
    }
    try {
      const blob = await getCroppedImg(
        imagePreview,
        croppedAreaPixels,
        rotation
      );
      if (!blob) return;
      const croppedFile = new File([blob], "cropped.jpg", {
        type: "image/jpeg",
      });
      setPreviewFromFile(croppedFile);
      setFormData((prev) => ({ ...prev, image: croppedFile }));
    } catch (e) {
      console.error("Crop failed", e);
    } finally {
      setShowCropper(false);
    }
  };

  useEffect(() => {
    const loadTags = async () => {
      try {
        const res = await fetchAllTags();
        if (res.data?.status && res.data?.tags) {
          setAvailableTags(res.data.tags);
        }
      } catch (err) {
        console.error("Failed to fetch tags:", err);
      } finally {
        setIsTagsLoading(false);
      }
    };

    loadTags();

    return () => {
      revokeIfBlob(imagePreview);
    };
  }, []);

  useEffect(() => {
    const loadAssignedCategories = async () => {
      try {
        const res = await fetchAssignedCategories();
        if (res.data?.status && Array.isArray(res.data.data)) {
          const categories = res.data.data
            .map((item) => item.master_category)
            .filter(Boolean) // remove nulls
            .map((cat) => ({
              id: Number(cat.id),
              name: cat.name,
            }));
  
          setAssignedCategories(categories);
        } else {
          console.warn("⚠️ No assigned categories found");
        }
      } catch (err) {
        console.error("Failed to fetch assigned categories:", err);
      }
    };
  
    loadAssignedCategories();
  }, []);
  
  

  useEffect(() => {
    if (assignedCategories.length && !formData.master_category_id) {
      setFormData((prev) => ({
        ...prev,
        master_category_id: assignedCategories[0].id, // this must be a number
      }));
    }
  }, [assignedCategories]);
  
  
  
  
  

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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   const valid_statuses = ["active", "inactive", "rejected"];

  //   if (!formData.meta_title.trim()) {
  //     alert("⚠️ Meta title is required.");
  //     return;
  //   }

  //   if (!valid_statuses.includes(formData.status)) {
  //     alert(`⚠️ Invalid status. Must be one of: ${valid_statuses.join(", ")}`);
  //     return;
  //   }

  //   if (!formData.image) {
  //     alert("⚠️ Please upload a post image before submitting.");
  //     return;
  //   }

  //   if (formData.shortDesc.length > 160) {
  //     alert("⚠️ Short description must be less than 160 characters.");
  //     return;
  //   }

  //   setIsLoading(true);
  //   try {
  //     const formDataToSend = new FormData();
  //     formDataToSend.append("title", formData.headline);
  //     formDataToSend.append("short_description", formData.shortDesc);
  //     formDataToSend.append("content", formData.longDesc);
  //      // ✅ Format tags as "#tag1, #tag2, #tag3"
  //   if (formData.tags && formData.tags.length > 0) {
  //     const formattedTags = formData.tags
  //       .map((tag) => {
  //         const tagData = availableTags.find((t) => t.id === tag);
  //         const tagName = tagData ? tagData.name : tag;
  //         return `#${tagName}`;
  //       })
  //       .join(", ");
  //     formDataToSend.append("post_tag", formattedTags);
  //   }
  //     formDataToSend.append("post_image", formData.image);
  //     formDataToSend.append("latest_news", formData.latestNews ? "true" : "false");
  //     formDataToSend.append("Head_Lines", formData.headlines ? "true" : "false");
  //     formDataToSend.append("articles", formData.articles ? "true" : "false");
  //     formDataToSend.append("trending", formData.trending ? "true" : "false");
  //     formDataToSend.append("BreakingNews", formData.breakingNews ? "true" : "false");
  //     formDataToSend.append("upcoming_event", formData.upcomingEvents ? "true" : "false");

  //     formDataToSend.append("master_category_id", Number(formData.category));


  //     if (formData.eventStartDate) {
  //       const eventDate = new Date(formData.eventStartDate).toISOString().split("T")[0];
  //       formDataToSend.append("Event_date", eventDate);
  //     }
  //     if (formData.eventEndDate) {
  //       const eventEndDate = new Date(formData.eventEndDate).toISOString().split("T")[0];
  //       formDataToSend.append("Event_end_date", eventEndDate);
  //     }
  //     if (formData.scheduleDate) {
  //       formDataToSend.append("schedule_date", formData.scheduleDate);
  //     }

  //     formDataToSend.append("counter", formData.counter);
  //     formDataToSend.append("order", formData.order);
  //     formDataToSend.append("status", formData.status);
  //     formDataToSend.append("meta_title", formData.meta_title);
  //     formDataToSend.append("slug", formData.slug);

  //     // formData.tags.forEach((tagId) => {
  //     //   formDataToSend.append("tags", tagId);
  //     // });

  //     const response = await createNewsArticle(formDataToSend);
  //     const createdArticle = response.data.data;
  //     console.log(createdArticle)

  //     if (createdArticle?.id) {
  //       await publishNewsArticle(createdArticle.id, {
  //         master_category_id: Number(formData.category), // make sure it's a number
  //       });
  //       alert("✅ Article created and published successfully!");
  //     } else {
  //       alert("⚠️ Article created but publish failed: No ID returned.");
  //     }

  //     resetForm();
  //   } catch (err) {
  //     console.error("Error creating article:", err?.message?.slug);
  //     alert(err?.message?.slug || "Failed to publish article.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const valid_statuses = ["active", "inactive", "rejected"];
  
    // Basic validations
    if (!formData.meta_title.trim()) {
      alert("⚠️ Meta title is required.");
      return;
    }
  
    if (!valid_statuses.includes(formData.status)) {
      alert(`⚠️ Invalid status. Must be one of: ${valid_statuses.join(", ")}`);
      return;
    }
  
    if (!formData.image) {
      alert("⚠️ Please upload a post image before submitting.");
      return;
    }
  
    if (formData.shortDesc.length > 160) {
      alert("⚠️ Short description must be less than 160 characters.");
      return;
    }
    const categoryId = Number(formData.master_category_id);

    if (!categoryId) {
      alert("⚠️ Please select a category.");
      return;
    }
    
  
    setIsLoading(true);
  
    try {
      const formDataToSend = new FormData();
  
      // Basic fields
      formDataToSend.append("title", formData.headline);
      formDataToSend.append("short_description", formData.shortDesc);
      formDataToSend.append("content", formData.longDesc);
      formDataToSend.append("post_image", formData.image);
      formDataToSend.append("meta_title", formData.meta_title);
      formDataToSend.append("slug", formData.slug);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("counter", formData.counter);
      formDataToSend.append("order", formData.order);
  
      // Category
      formDataToSend.append("master_category_id", categoryId);
  
      // Tags
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
  
      // Boolean fields
      formDataToSend.append("latest_news", formData.latestNews ? "true" : "false");
      formDataToSend.append("Head_Lines", formData.headlines ? "true" : "false");
      formDataToSend.append("articles", formData.articles ? "true" : "false");
      formDataToSend.append("trending", formData.trending ? "true" : "false");
      formDataToSend.append("BreakingNews", formData.breakingNews ? "true" : "false");
      formDataToSend.append("upcoming_event", formData.upcomingEvents ? "true" : "false");
  
      // Dates
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
  
      // Create article
      const response = await createNewsArticle(formDataToSend);
      const createdArticle = response.data.data;
      console.log("Created Article:", createdArticle);
  
      if (createdArticle?.id) {
        const categoryId = Number(formData.master_category_id);
        if (!categoryId) {
          alert("⚠️ Please select a category before publishing.");
          setIsLoading(false);
          return;
        }
      
        // Publish article with category
        await publishNewsArticle(createdArticle.id, categoryId);
      
        alert("✅ Article created and published successfully!");
      }
      
  
      resetForm();
    } catch (err) {
      console.error("Error creating article:", err);
      alert(err?.message || "Failed to publish article.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    revokeIfBlob(imagePreview);
    setFormData({
      headline: "",
      shortDesc: "",
      longDesc: "",
      image: null,
      tags: [],
      latestNews: false,
      headlines: false,
      articles: false,
      trending: false,
      breakingNews: false,
      upcomingEvents: false,
      eventStartDate: "",
      eventEndDate: "",
      scheduleDate: "",
      counter: 0,
      order: 0,
      status: "active",
      meta_title: "",
      slug: "",
      slugEdited: false,
    });
    setTagInput("");
    setImagePreview(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Create News Article
                  </h1>
                  <p className="text-gray-300 text-sm">
                    Fill in the details to publish your article
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-all flex items-center space-x-2 border border-white/20"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-all flex items-center space-x-2 border border-white/20"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Info */}
            <section className="space-y-5">
              <div className="flex items-center space-x-2 pb-3 border-b-2 border-gray-200">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Settings className="w-5 h-5 text-gray-700" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h2>
              </div>
              <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <select
  name="master_category_id"
  value={formData.master_category_id || ""}
  onChange={handleInputChange}
  required
>
  <option value="">-- Select Category --</option>
  {assignedCategories.map((cat) => (
    <option key={cat.id} value={cat.id}>
      {cat.name}
    </option>
  ))}
</select>


            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Headline *
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
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meta Title *
                </label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleSlugChange}
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
                  onChange={handleInputChange}
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
                  {/* <CKEditor
                    initData={formData.longDesc}
                    config={{
                      height: 400,
                      licenseKey: 'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NjAzOTk5OTksImp0aSI6Ijg5MTg0MmZmLTgxYTYtNGVkZS04MDBiLWIxZmEzODI2ZGZlZCIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjllYjBhYmQyIn0.FQMKlIgJugkHsuMd24DxsZ-bavs8KkEAe_XnQQFvPL06eFfKdKN7CrbqSKqJ0GoPVTXmQPSKHgocSjKlGzLWyg',
                      toolbar: [
                        { name: "document", items: ["Source", "-", "Save", "Preview", "Print"] },
                        { name: "clipboard", items: ["Cut", "Copy", "Paste", "-", "Undo", "Redo"] },
                        { name: "editing", items: ["Find", "Replace", "-", "SelectAll"] },
                        { name: "basicstyles", items: ["Bold", "Italic", "Underline", "Strike", "-", "RemoveFormat"] },
                        { name: "paragraph", items: ["NumberedList", "BulletedList", "-", "Outdent", "Indent", "-", "Blockquote"] },
                        { name: "insert", items: ["Image", "Table", "HorizontalRule", "SpecialChar"] },
                        { name: "styles", items: ["Styles", "Format", "Font", "FontSize"] },
                        { name: "colors", items: ["TextColor", "BGColor"] },
                        { name: "tools", items: ["Maximize"] },
                      ],
                      extraPlugins: "image2,autogrow,justify,colorbutton,font",
                      removePlugins: "easyimage,cloudservices",
                      autoGrow_minHeight: 300,
                      autoGrow_maxHeight: 600,
                    }}
                    onChange={(event) => {
                      const data = event.editor.getData();
                      setFormData((prev) => ({ ...prev, longDesc: data }));
                    }}
                  /> */}

<CKEditor
  scriptUrl="/ckeditor/ckeditor.js" // points to your local copy
  initData={formData.longDesc} onBeforeLoad={(CKEDITOR) => { CKEDITOR.disableAutoInline = true; }}
  config={{
    height: 400,
    removePlugins: 'easyimage,cloudservices',
    extraPlugins: 'widget,justify,colorbutton,font',
    autoGrow_minHeight: 300,
    autoGrow_maxHeight: 600,
    contentsCss: '/ckeditor/contents.css',      // ensures editor content styling loads
    language: 'en',
    skin: 'moono-lisa,/ckeditor/skins/moono-lisa/',
    toolbar: [
      { name: 'document', items: ['Source', '-', 'Preview', 'Print'] },
      { name: 'clipboard', items: ['Cut', 'Copy', 'Paste', '-', 'Undo', 'Redo'] },
      { name: 'editing', items: ['Find', 'Replace', '-', 'SelectAll'] },
      {
        name: 'insert',
        items: ['Image', 'Table', 'HorizontalRule', 'SpecialChar', 'CodeSnippet', 'Youtube', 'Html5video']
      },
      { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', '-', 'RemoveFormat'] },
      {
        name: 'paragraph',
        items: ['NumberedList','BulletedList','-','Outdent','Indent','-','Blockquote','JustifyLeft','JustifyCenter','JustifyRight']
      },
      { name: 'styles', items: ['Styles','Format','Font','FontSize'] },
      { name: 'colors', items: ['TextColor','BGColor'] },
      { name: 'tools', items: ['Maximize'] },
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

            {/* Featured Image Section */}
            <section className="space-y-5">
              <div className="flex items-center space-x-2 pb-3 border-b-2 border-gray-200">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-gray-700" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Featured Image *
                </h2>
              </div>

              {imagePreview ? (
                <div className="relative group">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowCropper(true)}
                        className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all flex items-center gap-2 shadow-lg"
                      >
                        <Crop className="w-4 h-4" />
                        Crop & Edit
                      </button>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-800">
                      <strong>Tip:</strong> Hover over the image and click "Crop & Edit" to adjust the image, zoom, rotate, or change aspect ratio
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
                    <p className="text-sm mt-2 text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}

              {/* Cropper Modal */}
              {showCropper && (
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
                        onClick={() => setShowCropper(false)}
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
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                        onRotationChange={setRotation}
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
                            onChange={(e) => setZoom(Number(e.target.value))}
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
                            onChange={(e) => setRotation(Number(e.target.value))}
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
                              onClick={() => setAspect(value)}
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
                          onClick={() => setShowCropper(false)}
                          className="w-full sm:w-auto px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={applyCrop}
                          className="w-full sm:w-auto px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all shadow-lg"
                        >
                          Apply Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </section>

            {/* Tags */}
            {/* <section className="space-y-5">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Existing Tag
                  </label>
                  <select
                    onChange={(e) => {
                      const tagId = e.target.value;
                      if (tagId && !formData.tags.includes(tagId)) {
                        setFormData((prev) => ({
                          ...prev,
                          tags: [...prev.tags, tagId],
                        }));
                      }
                      e.target.value = "";
                    }}
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
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, i) => {
                      const tagData = availableTags.find(t => t.id === tag);
                      const displayName = tagData ? tagData.name : tag;
                      return (
                        <span
                          key={i}
                          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm"
                        >
                          <span>{displayName}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:bg-white/20 rounded p-0.5 transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </section> */}

<section className="space-y-5">
  {/* Header */}
  <div className="flex items-center space-x-2 pb-3 border-b-2 border-gray-200">
    <div className="p-2 bg-gray-100 rounded-lg">
      <Tag className="w-5 h-5 text-gray-700" />
    </div>
    <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
  </div>

  {/* Inputs */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Add Custom Tag */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Add Custom Tag
      </label>
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

    {/* Select Existing Tag */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Existing Tag
      </label>
      <select
        onChange={(e) => {
          const tagId = e.target.value;
          if (tagId && !formData.tags.includes(tagId)) {
            setFormData((prev) => ({
              ...prev,
              tags: [...prev.tags, tagId],
            }));
          }
          e.target.value = "";
        }}
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

  {/* Display Selected Tags */}
  {formData.tags.length > 0 && (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Selected Tags ({formData.tags.length})
      </label>

      {/* Tag Pills */}
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
                onClick={() => removeTag(tag)}
                className="hover:bg-white/20 rounded p-0.5 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          );
        })}
      </div>

      {/* Comma-separated tag list */}
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


            {/* Publishing Options */}
            <section className="space-y-5">
              <div className="flex items-center space-x-2 pb-3 border-b-2 border-gray-200">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Star className="w-5 h-5 text-gray-700" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Publishing Options
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { key: "latestNews", label: "Latest News", icon: Clock },
                  { key: "headlines", label: "Headlines", icon: FileText },
                  { key: "articles", label: "Articles", icon: FileText },
                  { key: "trending", label: "Trending", icon: TrendingUp },
                  {
                    key: "breakingNews",
                    label: "Breaking News",
                    icon: AlertCircle,
                  },
                  {
                    key: "upcomingEvents",
                    label: "Upcoming Events",
                    icon: Calendar,
                  },
                ].map(({ key, label, icon: Icon }) => (
                  <label
                    key={key}
                    className={`flex items-center space-x-3 border-2 p-4 rounded-xl cursor-pointer transition-all ${
                      formData[key]
                        ? "bg-gray-900 border-gray-900 text-white shadow-lg"
                        : "bg-white border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name={key}
                      checked={formData[key]}
                      onChange={handleInputChange}
                      className="w-5 h-5 rounded accent-gray-900"
                    />
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Event Details */}
            {formData.upcomingEvents && (
              <section className="space-y-5 bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                <h3 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Event Details</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      name="eventStartDate"
                      value={formData.eventStartDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      name="eventEndDate"
                      value={formData.eventEndDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Scheduling & Settings */}
            <section className="space-y-5">
              <div className="flex items-center space-x-2 pb-3 border-b-2 border-gray-200">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-700" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Scheduling & Settings
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Schedule Date
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduleDate"
                    value={formData.scheduleDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Counter
                  </label>
                  <input
                    type="number"
                    name="counter"
                    value={formData.counter}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
            </section>

            {/* Submit Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg text-sm font-semibold hover:from-gray-800 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                    <Save className="w-5 h-5 mr-2" />
                    Publish Article
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewsArticleForm;
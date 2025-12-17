import { useState } from "react";
import { toast } from "react-toastify";
import webpfy from "webpfy";

export const useImageManagement = (formData, setFormData) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState(16 / 9);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropPreview, setCropPreview] = useState(null);
  const [activePortalForCrop, setActivePortalForCrop] = useState(null);
  const [portalImages, setPortalImages] = useState({});
  const [portalImagePreviews, setPortalImagePreviews] = useState({});
  const [showPortalImageUpload, setShowPortalImageUpload] = useState(false);

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.warning("Image size must be less than 10MB");
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      setCropPreview(URL.createObjectURL(file));
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

  const applyCrop = async () => {
    if (!cropPreview || !croppedAreaPixels) {
      setShowCropper(false);
      return;
    }
    try {
      const blob = await getCroppedImg(cropPreview, croppedAreaPixels, rotation);
      if (!blob) return;

      const originalName =
        activePortalForCrop !== null
          ? portalImages[activePortalForCrop]?.name ||
            formData?.image?.name ||
            "image.jpg"
          : formData?.image?.name || "image.jpg";

      const baseName = originalName.replace(/\.[^/.]+$/, "");
      const croppedFile = new File([blob], `${baseName}.jpg`, {
        type: "image/jpeg",
      });

      let finalFile = croppedFile;
      try {
        const { webpBlob } = await webpfy({
          image: croppedFile,
          fileName: `${baseName}.webp`,
        });
        if (webpBlob) {
          finalFile = new File([webpBlob], `${baseName}.webp`, {
            type: "image/webp",
          });
        }
      } catch (webpError) {
        console.warn("WebP conversion failed, using original JPEG:", webpError);
      }

      if (activePortalForCrop !== null) {
        setPortalImages((prev) => ({
          ...prev,
          [activePortalForCrop]: finalFile,
        }));
        setPortalImagePreviews((prev) => ({
          ...prev,
          [activePortalForCrop]: URL.createObjectURL(finalFile),
        }));
        setActivePortalForCrop(null);
      } else {
        setFormData((prev) => ({ ...prev, image: finalFile }));
        setPreviewFromFile(finalFile);
      }
    } catch (e) {
      console.error("Crop failed", e);
    } finally {
      setCropPreview(null);
      setShowCropper(false);
    }
  };

 const handlePortalImageUpload = (portalId, file) => {
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    toast.warning("Image size must be less than 10MB");
    return;
  }

  // ✅ STORE ORIGINAL FILE (NOT blob URL)
  setPortalImages(prev => ({
    ...prev,
    [portalId]: file
  }));

  // ✅ CREATE PREVIEW (blob URL for display only)
  setPortalImagePreviews(prev => ({
    ...prev,
    [portalId]: URL.createObjectURL(file)
  }));

  // ✅ TELL SYSTEM THIS IS PORTAL IMAGE (NOT FEATURED)
  setActivePortalForCrop(portalId);

  // ✅ OPEN CROPPER ONLY FOR PORTAL IMAGE
  setCropPreview(URL.createObjectURL(file));
  setShowCropper(true);
};

  const removePortalImage = (portalId) => {
    if (portalImagePreviews[portalId]) {
      URL.revokeObjectURL(portalImagePreviews[portalId]);
    }

    setPortalImages((prev) => {
      const updated = { ...prev };
      delete updated[portalId];
      return updated;
    });

    setPortalImagePreviews((prev) => {
      const updated = { ...prev };
      delete updated[portalId];
      return updated;
    });
  };

  return {
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
  };
};
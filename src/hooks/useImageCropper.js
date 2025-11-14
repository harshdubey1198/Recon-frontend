import { useState } from "react";

export const useImageCropper = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState(16 / 9);

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

  const removeImage = () => {
    revokeIfBlob(imagePreview);
    setImagePreview(null);
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

  const onCropComplete = (croppedArea, croppedAreaPx) => {
    setCroppedAreaPixels(croppedAreaPx);
  };

  const applyCrop = async (setFormImage) => {
    if (!imagePreview || !croppedAreaPixels) {
      setShowCropper(false);
      return;
    }
    try {
      const blob = await getCroppedImg(imagePreview, croppedAreaPixels, rotation);
      if (!blob) return;
      const croppedFile = new File([blob], "cropped.jpg", {
        type: "image/jpeg",
      });
      setPreviewFromFile(croppedFile);
      setFormImage(croppedFile);
    } catch (e) {
      console.error("Crop failed", e);
    } finally {
      setShowCropper(false);
    }
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
    croppedAreaPixels,
    rotation,
    setRotation,
    aspect,
    setAspect,
    revokeIfBlob,
    setPreviewFromFile,
    removeImage,
    onCropComplete,
    applyCrop,
  };
};

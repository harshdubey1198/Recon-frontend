export const getRadianAngle = (deg) => (deg * Math.PI) / 180;

export const rotateSize = (width, height, rotationDeg) => {
  const rotRad = getRadianAngle(rotationDeg);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
};

export const getCroppedImg = async (imageSrc, cropPixels, rotationDeg = 0) => {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = imageSrc;
  });

  const rotRad = getRadianAngle(rotationDeg);
  const { width: rotatedW, height: rotatedH } = rotateSize(image.width, image.height, rotationDeg);

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

export const revokeIfBlob = (url) => {
  if (url && typeof url === "string" && url.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(url);
    } catch (_) {}
  }
};
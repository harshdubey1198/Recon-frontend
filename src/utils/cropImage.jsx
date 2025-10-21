export const getCroppedImg = (imageSrc, crop, width, height) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
  
        canvas.width = width;
        canvas.height = height;
  
        ctx.drawImage(
          image,
          crop.x,
          crop.y,
          crop.width,
          crop.height,
          0,
          0,
          width,
          height
        );
  
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          blob.name = "cropped.jpeg";
          const fileUrl = URL.createObjectURL(blob);
          resolve({ blob, url: fileUrl });
        }, "image/jpeg");
      };
      image.onerror = (error) => reject(error);
    });
  };
  
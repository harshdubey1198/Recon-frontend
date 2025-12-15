// utils/formHelpers.js
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
};

export const buildDraftDiff = (oldData, newData) => {
  const diff = {};
  Object.keys(newData).forEach((key) => {
    if (newData[key] !== oldData[key]) diff[key] = newData[key];
  });
  return diff;
};

export const formatTagsForSubmission = (tags, availableTags) => {
  return tags
    .map((tag) => {
      const tagData = availableTags.find((t) => t.id === tag);
      const tagName = tagData ? tagData.name : tag;
      return `#${tagName}`;
    })
    .join(", ");
};
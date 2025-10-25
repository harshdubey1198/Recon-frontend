import axios from "axios";
import constant from "./Constant";

const axiosInstance = axios.create({
  baseURL: `${constant.appBaseUrl}/`,
  // timeout: 10000,
});

// Attach token only to protected endpoints
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // ✅ changed

  const publicEndpoints = ["/account/login/", "auth/signup/"];

  const isPublic = publicEndpoints.some((endpoint) =>
    config.url.includes(endpoint)
  );

  if (!isPublic && token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  if (config.headers["Content-Type"] === "application/x-www-form-urlencoded") {
    delete config.headers["Content-Type"];
  }

  return config;
});

// Handle API errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error.response?.data || "Something went wrong")
);

// API functions
export async function authorizeMe(token) {
  localStorage.setItem("accessToken", token);
}

export async function login(data) {
  return axiosInstance.post("/account/login/", data);
}

/**
 * Create a news article
 * @param {FormData} formData - must include fields like title, short_description, content, etc.
 */
export async function createNewsArticle(formData) {
  return axiosInstance.post("/api/news/create/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function publishNewsArticle(id, payload) {
  // if (!payload || !payload.master_category) {
  //   throw new Error("Please provide valid payload with master_category.");
  // }

  return axiosInstance.post(`/api/publish/news/${id}/`, payload, {
    headers: { "Content-Type": "application/json" },
  });
}
export async function fetchDraftNews() {
  return axiosInstance.get(`/api/my/news/posts/?status=DRAFT`);
}

export async function updateDraftNews(id, status = "PUBLISHED",payload) {
  if (!id) throw new Error("News ID is required to update draft.");

  const formData = new FormData();
  formData.append("status", status);

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) 
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value)); 
      } else {
        formData.append(key, value);
      }

  });

  return axiosInstance.put(`/api/news/update/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}




export async function fetchNewsList(page = 1){
  return axiosInstance.get(`/api/news/distributed/list/?page=${page}`);
}

/**
 * Get detail of a distributed news article
 * @param {number|string} id - news article ID
 */
export async function fetchNewsDetail(id) {
  return axiosInstance.get(`/api/news/distributed/detail/${id}/`);
}

export async function fetchAdminStats() {
  return axiosInstance.get("/api/admin/stats/");
}

export async function fetchDomainDistribution() {
  return axiosInstance.get("/api/domain/distribution/");
}

export async function fetchMasterCategories() {
  return axiosInstance.get("/api/master/category/");
}


export async function fetchAssignedCategories() {
  return axiosInstance.get("/account/my/assignments/list/");
}

/**
 * Create a new master category
 * @param {Object} data - must include fields like name and description
 */
export async function createMasterCategory(data) {
  return axiosInstance.post("/api/master/category/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// Assign multiple master categories to a user
export async function assignMasterCategoriesToUser(data) {
  return axiosInstance.post("/account/user/assignment/", data);
}


export async function fetchPortals() {
  return axiosInstance.get("/api/portals/list/");
}

export async function fetchUnassignedUsers() {
  return axiosInstance.get("/account/unassigned/users/");
}

export async function fetchAllUsersList(page = 1) {
  return axiosInstance.get(`/account/all/users/list/?page=${page}`);
}

export async function fetchPortalStatusByUsername(username) {
  return axiosInstance.get(`/account/check/username/?username=${username}`);
}

export async function mapPortalUser(username, user_id) {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("user_id", user_id);

  return axiosInstance.post("/account/portal/user/mapping/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function fetchAssignmentsByUsername(username) {
  return axiosInstance.get(`/account/assignments/list/?username=${username}`);
}

export async function fetchMappedCategoriesById(id) {
  return axiosInstance.get(`/api/master/categories/mapped/${id}/`);
}


/**
 * Fetch categories for a given portal
 * @param {string} portalName - e.g., "newsableasia"
 */
export async function fetchPortalCategories(portalName) {
  return axiosInstance.get(`/api/portals/categories/list/${portalName}/`);
}

export async function mapMasterCategory(data) {
  return axiosInstance.post("/api/master/category/mapping/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function registerUser(data) {
  // data should be a plain object: { username, password, email }
  return axiosInstance.post("/account/registration/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export const fetchCategoryMappings = () => {
  return axiosInstance.get("/api/master/category/mapping/");
};


export async function fetchUserDetails() {
  return axiosInstance.get("/account/user/details/list/");
}
// export async function fetchMasterCategories() {
//   return axiosInstance.get("/api/master/category/");
// }


export async function fetchAllTags() {
  return axiosInstance.get("/api/all/tags/");
}

export async function fetchMappedCategories(mapped = false) {
  return axiosInstance.get(`/api/master/category/?mapped=${mapped}`);
}




export default axiosInstance;

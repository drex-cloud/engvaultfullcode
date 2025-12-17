// js/api.js

// ✅ POINT TO CLOUD BACKEND
const BASE_URL = "https://drex-notes-api.onrender.com/api/";

// ✅ Helper to get JWT token
export function getToken() {
  return localStorage.getItem("access_token");
}

// ✅ Helper to set JWT token
export function setToken(token) {
  localStorage.setItem("access_token", token);
}

// ✅ Helper to remove token
export function removeToken() {
  localStorage.removeItem("access_token");
}

// ✅ Generic function to handle fetch requests
export async function fetchAPI(endpoint, options = {}) {
  const token = getToken();
  const headers = options.headers || {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  options.headers = headers;

  const response = await fetch(BASE_URL + endpoint, options);

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (response.status === 401) {
    removeToken();
    window.location.href = "login.html";
  }

  return { status: response.status, data };
}

// ---------------------------
// AUTH
// ---------------------------
export async function registerUser(username, email, password) {
  return fetchAPI("register/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
}

export async function loginUser(username, password) {
  return fetchAPI("login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
}

// ---------------------------
// UNITS
// ---------------------------
export async function getUnits() {
  return fetchAPI("units/");
}

export async function createUnit(name) {
  return fetchAPI("units/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export async function updateUnit(id, data) {
  return fetchAPI(`units/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteUnit(id) {
  return fetchAPI(`units/${id}/`, { method: "DELETE" });
}

// ---------------------------
// SUBTOPICS
// ---------------------------
export async function getSubtopics() {
  return fetchAPI("subtopics/");
}

export async function getSubtopicDetail(id) {
  return fetchAPI(`subtopics/${id}/`);
}

export async function createSubtopic(unitId, title, notes = "") {
  return fetchAPI("subtopics/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ unit: unitId, title, notes }),
  });
}

export async function updateSubtopic(id, data) {
  return fetchAPI(`subtopics/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteSubtopic(id) {
  return fetchAPI(`subtopics/${id}/`, { method: "DELETE" });
}

// ---------------------------
// PDFS
// ---------------------------
export async function getPDFs() {
  return fetchAPI("pdfs/");
}

export async function uploadPDF(subtopicId, file) {
  const formData = new FormData();
  formData.append("subtopic", subtopicId);
  formData.append("file", file);
  formData.append("title", file.name); // Fixes "No Name" issue

  return fetchAPI("pdfs/", {
    method: "POST",
    body: formData,
  });
}

export async function updatePDF(id, data) {
  return fetchAPI(`pdfs/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deletePDF(id) {
  return fetchAPI(`pdfs/${id}/`, { method: "DELETE" });
}

// ---------------------------
// IMAGES (For Editor)
// ---------------------------
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  return fetchAPI("upload-image/", {
    method: "POST",
    body: formData,
  });
}
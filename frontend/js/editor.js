// js/editor.js
import { getSubtopicDetail, updateSubtopic, uploadImage } from "./api.js";

// ------------------------------------
// Get subtopic id from URL
// ------------------------------------
function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

const subId = getQueryParam("subtopic");
const titleEl = document.getElementById("sub-title");
const saveStatus = document.getElementById("save-status");
const saveBtn = document.getElementById("save-btn");
const backBtn = document.getElementById("back-btn");

if (!subId) {
  alert("Missing subtopic id (?subtopic=ID)");
  throw new Error("No subtopic id");
}

// ------------------------------------
// Quill Setup
// ------------------------------------
const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link", "image"],
  ["clean"],
];

const quill = new Quill("#editor", {
  theme: "snow",
  modules: {
    toolbar: {
      container: toolbarOptions,
      handlers: {
        image: imageHandler,
      },
    },
  },
});

// ------------------------------------
// Restore from localStorage or Backend
// ------------------------------------
const STORAGE_KEY = `subtopic_${subId}_draft`;

async function loadSubtopic() {
  const localDraft = localStorage.getItem(STORAGE_KEY);
  if (localDraft) {
    quill.root.innerHTML = localDraft;
    saveStatus.textContent = "Recovered unsaved draft";
  }

  // Use API helper
  const { status, data } = await getSubtopicDetail(subId);

  if (status !== 200) {
    showToast("Could not load subtopic");
    return;
  }

  titleEl.textContent = data.title;

  if (!localDraft) quill.root.innerHTML = data.notes || "";
  saveStatus.textContent = "Editor ready";
}

loadSubtopic();

// ------------------------------------
// Image Upload Handler
// ------------------------------------
async function imageHandler() {
  const picker = document.createElement("input");
  picker.type = "file";
  picker.accept = "image/*";
  picker.click();

  picker.onchange = async () => {
    const file = picker.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image too large (max 5MB)");
      return;
    }

    // Use API helper
    const { status, data } = await uploadImage(file);

    if (status !== 201) {
      showToast(data.error || "Failed to upload image");
      return;
    }

    const range = quill.getSelection(true);
    quill.insertEmbed(range.index, "image", data.url);
    showToast("Image uploaded ✓");
  };
}

// ------------------------------------
// LocalStorage Auto-Save
// ------------------------------------
quill.on("text-change", () => {
  localStorage.setItem(STORAGE_KEY, quill.root.innerHTML);
  saveStatus.textContent = "Changes saved locally";
});

// ------------------------------------
// Save to server (manual or before exit)
// ------------------------------------
async function saveToServer() {
  const html = localStorage.getItem(STORAGE_KEY) || quill.root.innerHTML;

  try {
    // Use API helper
    const { status } = await updateSubtopic(subId, { notes: html });

    if (status === 200) {
      saveStatus.textContent = "Saved to server ✓";
      localStorage.removeItem(STORAGE_KEY);
      showToast("Notes saved to server ✓");
    } else {
      saveStatus.textContent = "Save failed ❌";
      showToast("Failed to save to server ❌");
    }
  } catch (err) {
    console.error(err);
    saveStatus.textContent = "Save failed ❌";
    showToast("Failed to save to server ❌");
  }
}

// ------------------------------------
// Save on page exit
// ------------------------------------
let unsavedChanges = false;
quill.on("text-change", () => unsavedChanges = true);

window.addEventListener("beforeunload", async (e) => {
  if (unsavedChanges) {
    await saveToServer();
    e.preventDefault();
    e.returnValue = ""; // browser warning
  }
});

// ------------------------------------
// Manual Save Button
// ------------------------------------
saveBtn.addEventListener("click", async () => {
  await saveToServer();
  unsavedChanges = false;
});

// ------------------------------------
// Toast for feedback
// ------------------------------------
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 1500);
}

// ------------------------------------
// Back to Dashboard
// ------------------------------------
backBtn.addEventListener("click", () => {
  if (unsavedChanges && !confirm("You have unsaved changes. Continue?")) return;
  window.location.href = "dashboard.html";
});
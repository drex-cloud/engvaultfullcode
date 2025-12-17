import {
  getUnits, createUnit, updateUnit, deleteUnit,
  getSubtopics, createSubtopic, deleteSubtopic,
  getPDFs, uploadPDF, deletePDF, removeToken
} from "./api.js";

// ==========================
// SYSTEM BOOTSTRAP
// ==========================
if (!localStorage.getItem("access_token")) window.location.href = "login.html";

const unitsList = document.getElementById("units-list");

// ==========================
// 1. LOAD SYSTEMS (Units)
// ==========================
async function loadSystems() {
  unitsList.innerHTML = `<p style="text-align:center; font-family:monospace; color:#64748b;">> FETCHING_DATA...</p>`;

  const res = await getUnits();
  if (!res || !res.data) {
    unitsList.innerHTML = `<p style="text-align:center; color:var(--danger);">ERROR: API CONNECTION FAILED</p>`;
    return;
  }

  const { status, data } = res;
  unitsList.innerHTML = "";

  if (status === 200) {
    document.getElementById("unit-count").textContent = data.length.toString().padStart(2, '0');

    if (data.length === 0) {
      unitsList.innerHTML = `<p style="text-align:center; color:#64748b; padding:20px;">DATABASE EMPTY. INITIALIZE A SYSTEM ABOVE.</p>`;
      return;
    }

    data.forEach(unit => {
      const div = document.createElement("div");
      div.classList.add("system-card");
      div.dataset.id = unit.id;

      // Fake Engineering ID logic (SYS-101, SYS-102...)
      const sysId = `SYS-${100 + unit.id}`;

      div.innerHTML = `
                <div class="system-header" onclick="toggleSystem(${unit.id})">
                    <div class="system-info">
                        <span class="system-id">${sysId}</span>
                        <span class="system-title">${unit.name}</span>
                    </div>
                    <div class="icon-actions">
                        <button class="icon-btn" onclick="handleEditSystem(event, ${unit.id}, '${unit.name}')">✎</button>
                        <button class="icon-btn text-danger" onclick="handleDeleteSystem(event, ${unit.id})">🗑</button>
                    </div>
                </div>
                
                <div class="system-body" id="subs-${unit.id}">
                    <div style="display:flex; gap:10px; margin-bottom:20px;">
                        <input type="text" id="sub-title-${unit.id}" placeholder="New Specification ID/Name..." style="flex:1; padding:8px; border:1px solid #e2e8f0; border-radius:4px;">
                        <button onclick="handleAddSpec(${unit.id})" style="background:var(--primary); color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer;">ADD SPEC</button>
                    </div>
                    
                    <div id="list-subs-${unit.id}">
                        <small style="color:#94a3b8; font-family:monospace;">> CLICK HEADER TO LOAD MODULES...</small>
                    </div>
                </div>
            `;
      unitsList.appendChild(div);
    });
  } else if (status === 401) {
    removeToken(); window.location.href = "login.html";
  }
}

// ==========================
// 2. TOGGLE & LOAD DETAILS
// ==========================
window.toggleSystem = async (unitId) => {
  const div = document.querySelector(`.system-card[data-id='${unitId}']`);
  div.classList.toggle("open");
  if (div.classList.contains("open")) {
    loadSystemDetails(unitId, div);
  }
};

async function loadSystemDetails(unitId, parentDiv) {
  const listDiv = parentDiv.querySelector(`#list-subs-${unitId}`);
  listDiv.innerHTML = `<small style="color:#64748b;">> LOADING_MODULES...</small>`;

  const [subRes, pdfRes] = await Promise.all([getSubtopics(), getPDFs()]);

  if (subRes.status === 200 && pdfRes.status === 200) {
    const mySubs = subRes.data.filter(s => s.unit === unitId);
    const allPDFs = pdfRes.data;

    listDiv.innerHTML = "";
    if (mySubs.length === 0) {
      listDiv.innerHTML = "<p style='text-align:center; color:#cbd5e1; font-style:italic;'>No specifications logged yet.</p>";
      return;
    }

    mySubs.forEach(sub => {
      const myPDFs = allPDFs.filter(p => p.subtopic === sub.id);

      let pdfHtml = "";
      myPDFs.forEach(pdf => {
        pdfHtml += `
                    <div class="file-item">
                        <a href="${pdf.file}" target="_blank" class="file-link">📄 ${pdf.title}</a>
                        <button class="icon-btn text-danger" style="font-size:0.9rem;" onclick="handleDeletePDF(${pdf.id}, ${unitId})">×</button>
                    </div>`;
      });

      const subDiv = document.createElement("div");
      subDiv.classList.add("spec-item");

      subDiv.innerHTML = `
                <div class="spec-header">
                    <span class="spec-title">${sub.title}</span>
                    <button class="icon-btn text-danger" onclick="handleDeleteSpec(${sub.id}, ${unitId})">DELETE</button>
                </div>
                
                <a href="editor.html?subtopic=${sub.id}" class="btn-launch-editor">
                    <span>OPEN DATASHEET / NOTES</span>
                    <span>→</span>
                </a>

                <div class="file-list">
                    ${pdfHtml || "<small style='color:#cbd5e1'>No blueprints attached</small>"}
                </div>
                
                <div style="margin-top:10px; display:flex; gap:10px;">
                    <input type="file" id="file-${sub.id}" style="font-size:0.8rem; flex:1;">
                    <button onclick="handleUploadPDF(${sub.id}, ${unitId})" style="background:#e2e8f0; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">UPLOAD PDF</button>
                </div>
            `;
      listDiv.appendChild(subDiv);
    });
  }
}

// ==========================
// 3. HANDLERS
// ==========================

// Add System
document.getElementById("add-unit-btn").addEventListener("click", async () => {
  const input = document.getElementById("new-unit-name");
  if (input.value) {
    await createUnit(input.value);
    input.value = "";
    loadSystems();
    showToast("SYSTEM INITIALIZED");
  }
});

// Add Spec
window.handleAddSpec = async (uid) => {
  const title = document.getElementById(`sub-title-${uid}`).value;
  if (!title) return alert("Spec Title required");
  await createSubtopic(uid, title, "");
  document.getElementById(`sub-title-${uid}`).value = "";
  loadSystemDetails(uid, document.querySelector(`.system-card[data-id='${uid}']`));
  showToast("SPEC ADDED");
};

// Edit System
window.handleEditSystem = async (e, id, oldName) => {
  e.stopPropagation();
  const newName = prompt("Rename System:", oldName);
  if (newName) { await updateUnit(id, { name: newName }); loadSystems(); }
};

// Delete System
window.handleDeleteSystem = async (e, id) => {
  e.stopPropagation();
  if (confirm("TERMINATE SYSTEM? This will delete all associated data.")) {
    await deleteUnit(id); loadSystems(); showToast("SYSTEM TERMINATED");
  }
};

// Delete Spec
window.handleDeleteSpec = async (sid, uid) => {
  if (confirm("Delete this Specification?")) {
    await deleteSubtopic(sid);
    loadSystemDetails(uid, document.querySelector(`.system-card[data-id='${uid}']`));
  }
};

// Upload PDF
window.handleUploadPDF = async (sid, uid) => {
  const f = document.getElementById(`file-${sid}`).files[0];
  if (f) {
    showToast("UPLOADING ASSET...");
    await uploadPDF(sid, f);
    loadSystemDetails(uid, document.querySelector(`.system-card[data-id='${uid}']`));
    showToast("ASSET ARCHIVED");
  }
};

// Delete PDF
window.handleDeletePDF = async (pid, uid) => {
  if (confirm("Delete Asset?")) {
    await deletePDF(pid);
    loadSystemDetails(uid, document.querySelector(`.system-card[data-id='${uid}']`));
  }
};

// Logout
document.getElementById("logout-btn").addEventListener("click", () => { removeToken(); window.location.href = "login.html"; });

// Search
document.getElementById("search-input").addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll(".system-card").forEach(card => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(term) ? "block" : "none";
  });
});

// Toast
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.style.display = "block";
  setTimeout(() => t.style.display = "none", 3000);
}

// Start
loadSystems();
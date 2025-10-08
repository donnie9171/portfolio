// --- Block Data Structures ---
const BLOCK_TYPES = {
  title: {
    title: "",
    subtitle: "",
    overview: "",
    people: "",
    img1: { src: "", caption: "" },
    img2: { src: "", caption: "" },
    imgmobile: { src: "", caption: "" },
    card: []
  },
  text: {
    text: "",
    card: []
  },
  image: {
    size: "fit",
    images: [{ src: "", caption: "" }],
    card: []
  },
  quote: {
    quote: "",
    card: []
  },
  cardbox: {
    "card-shown": [],
    card: []
  },
  separator: {},
  custom: {
    html: ""
  }
};

const STORAGE_KEY = "projectPageEditorBlocks";

// --- Utility Functions ---
function saveBlocks(blocks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
}
function loadBlocks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

// --- DOM Elements ---
const blockListEl = document.getElementById("block-list");
const previewEl = document.getElementById("editor-preview");
const addBlockBtn = document.getElementById("add-block");
const blockTypeSelect = document.getElementById("block-type");
const exportBtn = document.getElementById("export-html");
const clearBtn = document.getElementById("clear-blocks");

// --- State ---
let blocks = loadBlocks();

// --- Render Functions ---
function renderBlockEditor(block, idx) {
  // Minimal editor for each block type
  let html = `<div class="block-editor" draggable="true" data-idx="${idx}">`;
  html += `<div style="display:flex;justify-content:space-between;align-items:center;">
    <strong>${block.type.charAt(0).toUpperCase() + block.type.slice(1)}</strong>
    <button data-action="delete" data-idx="${idx}" style="background:#e33;color:#fff;border:none;border-radius:4px;padding:0.2em 0.7em;cursor:pointer;">Delete</button>
  </div>`;
  switch (block.type) {
    case "title":
      html += `<input type="text" placeholder="Title" value="${block.data.title}" data-field="title" data-idx="${idx}" /><br/>
        <input type="text" placeholder="Subtitle" value="${block.data.subtitle}" data-field="subtitle" data-idx="${idx}" /><br/>
        <textarea placeholder="Overview" data-field="overview" data-idx="${idx}">${block.data.overview}</textarea><br/>
        <textarea placeholder="People" data-field="people" data-idx="${idx}">${block.data.people}</textarea><br/>
        <input type="text" placeholder="Image 1 src" value="${block.data.img1.src}" data-field="img1.src" data-idx="${idx}" /><br/>
        <input type="text" placeholder="Image 1 caption" value="${block.data.img1.caption}" data-field="img1.caption" data-idx="${idx}" /><br/>
        <input type="text" placeholder="Image 2 src" value="${block.data.img2.src}" data-field="img2.src" data-idx="${idx}" /><br/>
        <input type="text" placeholder="Image 2 caption" value="${block.data.img2.caption}" data-field="img2.caption" data-idx="${idx}" /><br/>
        <input type="text" placeholder="Mobile Image src" value="${block.data.imgmobile.src}" data-field="imgmobile.src" data-idx="${idx}" /><br/>
        <input type="text" placeholder="Mobile Image caption" value="${block.data.imgmobile.caption}" data-field="imgmobile.caption" data-idx="${idx}" /><br/>
        <input type="text" placeholder="Cards (comma separated)" value="${block.data.card.join(',')}" data-field="card" data-idx="${idx}" /><br/>`;
      break;
    case "text":
      html += `<textarea placeholder="Text" data-field="text" data-idx="${idx}">${block.data.text}</textarea><br/>
        <input type="text" placeholder="Cards (comma separated)" value="${block.data.card.join(',')}" data-field="card" data-idx="${idx}" /><br/>`;
      break;
    case "image":
      html += `<select data-field="size" data-idx="${idx}">
        <option value="large"${block.data.size === "large" ? " selected" : ""}>Large</option>
        <option value="fit"${block.data.size === "fit" ? " selected" : ""}>Fit</option>
      </select><br/>`;
      block.data.images.forEach((img, imgIdx) => {
        html += `<input type="text" placeholder="Image src" value="${img.src}" data-field="images.${imgIdx}.src" data-idx="${idx}" /><br/>
          <input type="text" placeholder="Image caption" value="${img.caption}" data-field="images.${imgIdx}.caption" data-idx="${idx}" /><br/>`;
      });
      html += `<button data-action="add-image" data-idx="${idx}">Add Image</button><br/>
        <input type="text" placeholder="Cards (comma separated)" value="${block.data.card.join(',')}" data-field="card" data-idx="${idx}" /><br/>`;
      break;
    case "quote":
      html += `<textarea placeholder="Quote" data-field="quote" data-idx="${idx}">${block.data.quote}</textarea><br/>
        <input type="text" placeholder="Cards (comma separated)" value="${block.data.card.join(',')}" data-field="card" data-idx="${idx}" /><br/>`;
      break;
    case "cardbox":
      html += `<input type="text" placeholder="Cards shown (comma separated)" value="${block.data["card-shown"].join(',')}" data-field="card-shown" data-idx="${idx}" /><br/>
        <input type="text" placeholder="Cards (comma separated)" value="${block.data.card.join(',')}" data-field="card" data-idx="${idx}" /><br/>`;
      break;
    case "separator":
      html += `<em>Separator line</em>`;
      break;
    case "custom":
      html += `<textarea placeholder="Custom HTML" data-field="html" data-idx="${idx}">${block.data.html || ""}</textarea><br/>`;
      break;
  }
  html += `</div>`;
  return html;
}

function renderBlockList() {
  blockListEl.innerHTML = blocks.map((block, idx) => `<li>${renderBlockEditor(block, idx)}</li>`).join("");
}

function renderPreview() {
  // For simplicity, just show JSON for now
  previewEl.innerHTML = `<pre style="background:#fff;padding:1em;border-radius:8px;">${JSON.stringify(blocks, null, 2)}</pre>`;
}

// --- Block Manipulation ---
function addBlock(type) {
  const data = JSON.parse(JSON.stringify(BLOCK_TYPES[type]));
  blocks.push({ type, data });
  saveBlocks(blocks);
  renderBlockList();
  renderPreview();
}

function deleteBlock(idx) {
  blocks.splice(idx, 1);
  saveBlocks(blocks);
  renderBlockList();
  renderPreview();
}

function updateBlock(idx, field, value, options = {}) {
  // Handle nested fields like images.0.src
  const path = field.split(".");
  let obj = blocks[idx].data;
  for (let i = 0; i < path.length - 1; i++) {
    if (Array.isArray(obj)) {
      obj = obj[parseInt(path[i])];
    } else {
      obj = obj[path[i]];
    }
  }
  const last = path[path.length - 1];
  if (last === "card" || last === "card-shown") {
    obj[last] = value.split(",").map(s => s.trim()).filter(Boolean);
  } else {
    obj[last] = value;
  }
  saveBlocks(blocks);
  if (!options.skipBlockListRender) renderBlockList();
  renderPreview();
}

function addImageToBlock(idx) {
  blocks[idx].data.images.push({ src: "", caption: "" });
  saveBlocks(blocks);
  renderBlockList();
  renderPreview();
}

// --- Drag and Drop ---
let dragSrcIdx = null;
blockListEl.addEventListener("dragstart", e => {
  const li = e.target.closest("li");
  if (!li) return;
  dragSrcIdx = Array.from(blockListEl.children).indexOf(li);
  e.dataTransfer.effectAllowed = "move";
});
blockListEl.addEventListener("dragover", e => {
  e.preventDefault();
});
blockListEl.addEventListener("drop", e => {
  const li = e.target.closest("li");
  if (!li || dragSrcIdx === null) return;
  const dropIdx = Array.from(blockListEl.children).indexOf(li);
  if (dragSrcIdx !== dropIdx) {
    const moved = blocks.splice(dragSrcIdx, 1)[0];
    blocks.splice(dropIdx, 0, moved);
    saveBlocks(blocks);
    renderBlockList();
    renderPreview();
  }
  dragSrcIdx = null;
});

// --- Event Listeners ---
addBlockBtn.addEventListener("click", () => {
  addBlock(blockTypeSelect.value);
});

blockListEl.addEventListener("input", e => {
  const field = e.target.getAttribute("data-field");
  const idx = parseInt(e.target.getAttribute("data-idx"));
  if (field && !isNaN(idx)) {
    updateBlock(idx, field, e.target.value, { skipBlockListRender: true });
  }
});

blockListEl.addEventListener("click", e => {
  const action = e.target.getAttribute("data-action");
  const idx = parseInt(e.target.getAttribute("data-idx"));
  if (action === "delete" && !isNaN(idx)) {
    deleteBlock(idx);
  }
  if (action === "add-image" && !isNaN(idx)) {
    addImageToBlock(idx);
  }
});

exportBtn.addEventListener("click", () => {
  const dataStr = JSON.stringify(blocks, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "project-page.json";
  a.click();
  URL.revokeObjectURL(url);
});

clearBtn.addEventListener("click", () => {
  if (confirm("Clear all blocks?")) {
    blocks = [];
    saveBlocks(blocks);
    renderBlockList();
    renderPreview();
  }
});

// Draggable resizer logic
const sidebar = document.querySelector('.editor-sidebar');
const resizer = document.getElementById('editor-resizer');
const preview = document.querySelector('.editor-preview');
const expandToggle = document.getElementById('expand-toggle');

let isDragging = false;

resizer.addEventListener('mousedown', function(e) {
isDragging = true;
resizer.classList.add('dragging');
document.body.style.cursor = 'ew-resize';
});

document.addEventListener('mousemove', function(e) {
if (!isDragging) return;
let containerRect = document.querySelector('.editor-container').getBoundingClientRect();
let newSidebarWidth = Math.max(300, Math.min(e.clientX - containerRect.left, containerRect.width - 300));
sidebar.style.width = newSidebarWidth + 'px';
preview.style.minWidth = '300px';
});

document.addEventListener('mouseup', function() {
if (isDragging) {
    isDragging = false;
    resizer.classList.remove('dragging');
    document.body.style.cursor = '';
}
});

// Toggle logic
expandToggle.addEventListener('click', function() {
  const container = document.querySelector('.editor-container');
  const containerWidth = container.offsetWidth;
  const sidebarWidth = sidebar.offsetWidth;
  const previewWidth = preview.offsetWidth;

  // If sidebar is smaller, expand sidebar
  if (sidebarWidth < previewWidth) {
    sidebar.style.width = (containerWidth - 300) + 'px';
    expandToggle.textContent = '<';
  } else {
    sidebar.style.width = '300px';
    expandToggle.textContent = '>';
  }
});

// --- Initial Render ---
renderBlockList();
renderPreview();
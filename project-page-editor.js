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
const previewModeToggle = document.createElement('button');
previewModeToggle.id = 'preview-mode-toggle';
previewModeToggle.textContent = 'Preview';
previewModeToggle.style.marginLeft = 'auto';

// Insert the toggle button into the editor actions area
const editorActions = document.querySelector('.editor-actions');
editorActions.appendChild(previewModeToggle);

// --- State ---
let blocks = loadBlocks();
let previewMode = true; // false = JSON, true = HTML preview

// --- Toggle Preview Mode ---
previewModeToggle.addEventListener('click', () => {
  previewMode = !previewMode;
  previewModeToggle.textContent = previewMode ? 'JSON' : 'Preview';
  renderPreview();
});

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

// Add a simple markdown-to-HTML converter (basic bold, italic, links, lists, code)
function renderMarkdown(md) {
  if (!md) return "";
  let html = md
    .replace(/</g, "&lt;") // Escape HTML
    .replace(/(?:__|\*\*)(.*?)\1/g, "<strong>$1</strong>") // Bold
    .replace(/(?:_|\*)(.*?)\1/g, "<em>$1</em>") // Italic
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: inherit" target="_blank" rel="noopener">$1</a>') // Links
    .replace(/`([^`]+)`/g, '<code>$1</code>') // Inline code
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^\s*\n\*/gm, '<ul>\n*')
    .replace(/^(\* .+)$/gm, '<li>$1</li>')
    .replace(/<\/li>\n<li>/g, '</li><li>')
    .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
    .replace(/\n{2,}/g, '<br/>');
  return html;
}

function renderTitleBlockPreview(data) {
  // Mobile header image
  const mobileImage = data.imgmobile.src
    ? `<div class="project-images mobile-header-image" style="--img-count: 1">
        <figure>
          <img src="${data.imgmobile.src}" alt="${data.imgmobile.caption}" />
          ${data.imgmobile.caption ? `<figcaption>${data.imgmobile.caption}</figcaption>` : ""}
        </figure>
      </div>`
    : "";

  // Non-mobile images
  const nonMobileImages = [data.img1, data.img2]
    .filter(img => img.src)
    .map(img =>
      `<figure>
        <img src="${img.src}" alt="${img.caption}" />
        ${img.caption ? `<figcaption>${img.caption}</figcaption>` : ""}
      </figure>`
    ).join("");

  const nonMobileImagesBlock = nonMobileImages
    ? `<div class="project-images non-mobile" style="--img-count: ${[data.img1, data.img2].filter(img => img.src).length}">
        ${nonMobileImages}
      </div>`
    : "";

  // Overview and People
  const overviewBlock = data.overview
    ? `<div class="overview">
        <h2>Overview</h2>
        <p>${renderMarkdown(data.overview)}</p>
      </div>`
    : "";

  const peopleBlock = data.people
    ? `<div class="people">
        <h2>People</h2>
        <p>${renderMarkdown(data.people)}</p>
      </div>`
    : "";

  const overviewAndPeople = (overviewBlock || peopleBlock)
    ? `<div class="overview-and-people">${overviewBlock}${peopleBlock}</div>`
    : "";

  // Main block
  return `
    <section class="top-section">
      <div class="project-block">
        ${mobileImage}
        <h1${data.card && data.card.length ? ` data-card-event="${data.card.join(', ')}"` : ""}>${data.title}</h1>
        ${data.subtitle ? `<div class="project-subtitle">${data.subtitle}</div>` : ""}
        ${overviewAndPeople}
      </div>
      ${nonMobileImagesBlock}
    </section>
  `;
}

function renderTextBlockPreview(data){
    return `<section class="project-block center-text"><div>${renderMarkdown(data.text)}</div></section>`;
}

function renderImageBlockPreview(data) {
  return data.images.map(img =>
    `<figure><img src="${img.src}" alt="${img.caption}" style="max-width:100%;"/><figcaption>${img.caption}</figcaption></figure>`
  ).join('');
}

function renderQuoteBlockPreview(data) {
  return `<section class="project-block center-text"><div class="quote">${renderMarkdown(data.quote)}</div></section>`;
}

function renderSeparatorBlockPreview() {
  return `<section class="project-block"><div class="separator line"></div></section>`;
}

function renderCardboxBlockPreview(data) {
  return `<div style="background:#eaf3ff;padding:1em;border-radius:8px;margin:1em 0;">Cards: ${data["card-shown"].join(', ')}</div>`;
}

function renderCustomBlockPreview(data) {
  return data.html;
}

function renderBlockPreview(block) {
  switch (block.type) {
    case "title":
      return renderTitleBlockPreview(block.data);
    case "text":
      return renderTextBlockPreview(block.data);
    case "image":
      return renderImageBlockPreview(block.data);
    case "quote":
      return renderQuoteBlockPreview(block.data);
    case "separator":
      return renderSeparatorBlockPreview();
    case "cardbox":
      return renderCardboxBlockPreview(block.data);
    case "custom":
      return renderCustomBlockPreview(block.data);
    default:
      return '';
  }
}

function renderPreview() {
  if (previewMode) {
    previewEl.innerHTML = blocks.map(renderBlockPreview).join('');
  } else {
    previewEl.innerHTML = `<pre style="background:#fff;padding:1em;border-radius:8px; overflow:auto; max-width: 100%">${JSON.stringify(blocks, null, 2)}</pre>`;
  }
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

// --- Drag and Drop with Insert Indicator ---
let dragSrcIdx = null;
let dragOverIdx = null;
let insertLine = document.createElement("div");
insertLine.className = "block-insert-line";
insertLine.style.height = "4px";
insertLine.style.background = "#3a7afe";
insertLine.style.borderRadius = "2px";
insertLine.style.transition = "background 0.2s";
insertLine.style.position = "relative";

// Helper to remove insert lines
function removeInsertLines() {
  document.querySelectorAll('.block-insert-line').forEach(el => el.remove());
}

blockListEl.addEventListener("dragstart", e => {
  const li = e.target.closest("li");
  if (!li) return;
  dragSrcIdx = Array.from(blockListEl.children).indexOf(li);
  e.dataTransfer.effectAllowed = "move";
});

blockListEl.addEventListener("dragover", e => {
  e.preventDefault();
  const li = e.target.closest("li");
  if (!li || dragSrcIdx === null) return;

  // Remove any previous insert lines
  removeInsertLines();

  // Calculate insertIdx based on mouse position
  const rect = li.getBoundingClientRect();
  const offset = e.clientY - rect.top;
  let hoveredIdx = Array.from(blockListEl.children).indexOf(li);
  insertIdx = hoveredIdx;
  if (offset >= rect.height / 2) insertIdx++;

  // Show insert line at the correct position
  if (insertIdx >= blockListEl.children.length) {
    blockListEl.appendChild(insertLine);
  } else {
    blockListEl.insertBefore(insertLine, blockListEl.children[insertIdx]);
  }
  insertLine.style.display = "block";
});

blockListEl.addEventListener("dragleave", e => {
  removeInsertLines();
});

blockListEl.addEventListener("drop", e => {
  removeInsertLines();
  if (dragSrcIdx === null || insertIdx === null) return;
  if (dragSrcIdx !== insertIdx && dragSrcIdx !== insertIdx - 1) {
    const moved = blocks.splice(dragSrcIdx, 1)[0];
    blocks.splice(insertIdx > dragSrcIdx ? insertIdx - 1 : insertIdx, 0, moved);
    saveBlocks(blocks);
    renderBlockList();
    renderPreview();
  }
  dragSrcIdx = null;
  insertIdx = null;
});

blockListEl.addEventListener("dragend", () => {
  removeInsertLines();
  dragSrcIdx = null;
  insertIdx = null;
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
let newSidebarWidth = Math.max(300, Math.min(e.clientX - containerRect.left - 24, containerRect.width - 300));
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
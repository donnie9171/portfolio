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
previewModeToggle.textContent = 'JSON';
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

const importBtn = document.getElementById("import-html");

importBtn.addEventListener("click", async () => {

  // Create a file input dynamically
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".html,text/html";
  input.style.display = "none";
  document.body.appendChild(input);

  input.addEventListener("change", async (e) => {
    const file = input.files[0];
    if (!file) return;
    const text = await file.text();

    // Extract metadata from <script type="application/json" id="project-metadata">
    const match = text.match(/<script[^>]*type=["']application\/json["'][^>]*id=["']project-metadata["'][^>]*>([\s\S]*?)<\/script>/);
    if (match && match[1]) {
    if (!confirm("Loading project will replace current contents! Are you sure?")) return;
      try {
        const metadata = JSON.parse(match[1]);
        blocks = metadata;
        saveBlocks(blocks);
        renderBlockList();
        renderPreview();
      } catch (err) {
        alert("Failed to parse project metadata.");
        console.error(err);
      }
    } else {
      alert("No project metadata found in the HTML file.");
    }
    document.body.removeChild(input);
  });

  input.click();
});

// --- Render Functions ---
function renderImageBlockEditor(data, idx) {
  let html = `
    <label>
      Size:
      <select data-field="size" data-idx="${idx}">
        <option value="large"${data.size === "large" ? " selected" : ""}>Large</option>
        <option value="fit"${data.size === "fit" ? " selected" : ""}>Fit</option>
      </select>
    </label>
    <br/>
    <label>
      <input type="checkbox" data-field="noRatio" data-idx="${idx}" ${data.noRatio ? "checked" : ""} />
      No aspect ratio
    </label>
    <br/>
    <label>
      <input type="checkbox" data-field="noShadow" data-idx="${idx}" ${data.noShadow ? "checked" : ""} />
      No shadow
    </label>
    <br/>
  `;
  data.images.forEach((img, imgIdx) => {
    html += `
      <input type="text" placeholder="Image src" value="${img.src}" data-field="images.${imgIdx}.src" data-idx="${idx}" /><br/>
      <textarea placeholder="Image caption (markdown supported)" data-field="images.${imgIdx}.caption" data-idx="${idx}">${img.caption}</textarea><br/>
    `;
  });
    html += `<button data-action="add-image" data-idx="${idx}" style="background:#3a7afe;color:#fff;border:none;border-radius:4px;padding:0.2em 0.7em;cursor:pointer;">Add Image</button><br/>`;
  html += `<input type="text" placeholder="Cards (comma separated)" value="${data.card.join(',')}" data-field="card" data-idx="${idx}" /><br/>`;
  return html;
}


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
      html += renderImageBlockEditor(block.data, idx);
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
    // Bold: **text** or __text__
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.*?)__/g, "<strong>$1</strong>")
    // Italic: *text* or _text_
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: inherit" target="_blank" rel="noopener">$1</a>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Headings
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    // Bulleted lists: - item or * item
    .replace(/((?:^[-*] .+(?:\n|$))+)/gm, function(match) {
      const items = match.trim().split('\n').map(line =>
        line.replace(/^[-*] (.+)/, '<li>$1</li>')
      ).join('');
      return `<ul>${items}</ul>`;
    })
    // Paragraph breaks
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
    return `<section class="project-block center-text" ${data.card && data.card.length ? ` data-card-event="${data.card.join(', ')}"` : ""}><div>${renderMarkdown(data.text)}</div></section>`;
}

function renderImageBlockPreview(data) {
  const imgCount = data.images.filter(img => img.src).length;
  if (imgCount === 0) return "";

  // Build figure HTML
  const figures = data.images
    .filter(img => img.src)
    .map(img =>
      `<figure>
        <img src="${img.src}" alt="${img.caption}" />
        ${img.caption ? `<figcaption>${renderMarkdown(img.caption)}</figcaption>` : ""}
      </figure>`
    ).join("");

  // Build classes and styles
  let classes = "project-images";
  if (data.size === "large") classes += " large-image";
  if (data.noRatio) classes += " no-ratio";
  if (data.noShadow) classes += " no-shadow";

  // Build data-card-event attribute if needed
  const cardAttr = data.card && data.card.length ? ` data-card-event="${data.card.join(', ')}"` : "";

  return `
    <section class="project-block${data.size === "large" ? " large-image" : " center-text"}">
      <div class="${classes}" style="--img-count: ${imgCount};"${cardAttr}>
        ${figures}
      </div>
    </section>
  `;
}

function renderQuoteBlockPreview(data) {
  return `<section class="project-block center-text" ${data.card && data.card.length ? ` data-card-event="${data.card.join(', ')}"` : ""}><div class="quote">${renderMarkdown(data.quote)}</div></section>`;
}

function renderSeparatorBlockPreview() {
  return `<section class="project-block"><div class="separator line"></div></section>`;
}

function renderCardboxBlockPreview(data) {
  return `<div style="background:#eaf3ff;padding:1em;border-radius:8px;margin:1em 0; ${data.card && data.card.length ? ` data-card-event="${data.card.join(', ')}"` : ""}">Cards: ${data["card-shown"].join(', ')}</div>`;
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

exportBtn.addEventListener("click", async () => {
    const pageTitle = blocks.find(b => b.type === "title")?.data.title || "Project";
  // Static header and footer
  const headerHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${pageTitle} | Enoch Kang</title>
        <link rel="stylesheet" href="styles.css" />
        <link rel="stylesheet" href="trading-card.css" />
        <link rel="stylesheet" href="project-page.css" />
        <link rel="preload" href="styles.css" as="style" />
        <link rel="icon" type="image/x-icon" href="assets/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
        rel="stylesheet"
        />
    </head>
    <body>
        <header>
        <h1>
            <a
            href="index.html"
            style="color: inherit; text-decoration: none; cursor: pointer"
            >Enoch Kang</a
            >
        </h1>
        <nav class="main-nav">
            <button class="nav-toggle" aria-label="Toggle menu">
            <span class="hamburger"></span>
            </button>
            <ul class="nav-list">
            <li><a href="index.html">Work</a></li>
            <li><a href="play.html">Play</a></li>
            <li><a href="about.html">About</a></li>
            </ul>
        </nav>
        </header>
        <main>
`;

  const footerHTML = `
        </main>
        <button class="deck" id="deckButton">
        <img src="assets/images/trading-card-button.png" alt="" />
        </button>
        <footer>
        <p>
            enochkang9171@gmail.com |
            <a
            href="https://www.youtube.com/@fireworksstudios9172"
            target="_blank"
            aria-label="YouTube"
            style="
                vertical-align: middle;
                display: inline-block;
                margin: 0 0.2em;
                margin-top: -2px;
            "
            >
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style="vertical-align: middle"
            >
                <path
                d="M23.498 6.186a2.994 2.994 0 0 0-2.107-2.117C19.228 3.5 12 3.5 12 3.5s-7.228 0-9.391.569A2.994 2.994 0 0 0 .502 6.186C0 8.36 0 12 0 12s0 3.64.502 5.814a2.994 2.994 0 0 0 2.107 2.117C4.772 20.5 12 20.5 12 20.5s7.228 0 9.391-.569a2.994 2.994 0 0 0 2.107-2.117C24 15.64 24 12 24 12s0-3.64-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                fill="#FF0000"
                />
            </svg>
            </a>
            |
            <a
            href="https://www.linkedin.com/in/enochkang9171"
            target="_blank"
            aria-label="LinkedIn"
            style="
                vertical-align: middle;
                display: inline-block;
                margin: 0 0.2em;
                margin-bottom: -4.5px;
            "
            >
            <svg
                width="22px"
                height="22px"
                viewBox="0 0 24 24"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
            >
                <title>LinkedIn icon</title>
                <path
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                fill="#0072B1"
                />
            </svg>
            </a>
            |
            <a
            href="https://github.com/donnie9171"
            target="_blank"
            aria-label="GitHub"
            style="
                vertical-align: middle;
                display: inline-block;
                margin: 0 0.2em;
                margin-top: -2.5px;
            "
            >
            <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style="vertical-align: middle"
            >
                <path
                d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.262.82-.582 0-.288-.012-1.243-.018-2.252-3.338.726-4.042-1.415-4.042-1.415-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.304-5.466-1.332-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.52 11.52 0 0 1 3.003-.404c1.02.005 2.047.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.119 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.625-5.475 5.921.43.371.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.218.699.825.58C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z"
                fill="#181717"
                />
            </svg>
            </a>
        </p>
        <p>
            Made with passion and a lot of
            <a
            href="https://github.com/donnie9171/portfolio"
            target="_blank"
            rel="noopener"
            style="color: inherit"
            >persistence</a
            >
            (wrangling Copilot).
        </p>
        <p>by Enoch (I-Nuo) Kang 康以諾</p>
        </footer>
        <script src="hamburger-menu.js"></script>
        <script src="trading-card.js"></script>
        <script src="project-page.js"></script>
        <div id="page-fade-cover">
        <!-- self contained div for loading cover -->
        <style>
            #page-fade-cover {
            position: fixed;
            inset: 0;
            width: 100vw;
            height: 100vh;
            background: #fff;
            z-index: 99999;
            opacity: 1;
            transition: opacity 0.5s cubic-bezier(.4,0,.2,1);
            pointer-events: auto;
            }
            #page-fade-cover.fade-out {
            opacity: 0;
            pointer-events: none;
            }
        </style>
        <script>
            function fadeCover() {
            var cover = document.getElementById('page-fade-cover');
            if (cover) cover.classList.add('fade-out');
            setTimeout(function() {
                if (cover) cover.style.display = 'none';
            }, 600);
            window.removeEventListener('DOMContentLoaded', fadeCover);
            }

            window.addEventListener('DOMContentLoaded', fadeCover);
        </script>
        </div>
    </body>
    </html>
`;

  // Get the preview content
  const contentHTML = blocks.map(renderBlockPreview).join('');

  const metadataJSON = JSON.stringify(blocks, null, 2);
const metadataTag = `<script type="application/json" id="project-metadata">\n${metadataJSON}\n</script>`;

  // Combine all parts
const fullHTML = `${headerHTML}${contentHTML}${footerHTML.replace('</body>', `${metadataTag}\n</body>`)}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(fullHTML);
      alert("HTML copied to clipboard!");
    } catch (err) {
      alert("Failed to copy HTML to clipboard.");
      console.error(err);
    }
  } else {
    // Fallback: download as file
    const blob = new Blob([fullHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pageTitle.replace(/\s+/g, '_').toLowerCase() || 'project'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("Clipboard API not available. Downloaded HTML file instead.");
  }
});

clearBtn.addEventListener("click", () => {
  if (confirm("Clear all blocks?")) {
    blocks = [];
    saveBlocks(blocks);
    renderBlockList();
    renderPreview();
  }
});

blockListEl.addEventListener("input", e => {
  const field = e.target.getAttribute("data-field");
  const idx = parseInt(e.target.getAttribute("data-idx"));
  if (field && !isNaN(idx)) {
    // Handle checkboxes for boolean fields
    if (e.target.type === "checkbox") {
      updateBlock(idx, field, e.target.checked, { skipBlockListRender: true });
    } else {
      updateBlock(idx, field, e.target.value, { skipBlockListRender: true });
    }
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
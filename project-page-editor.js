// --- Block Data Structures ---
const BLOCK_TYPES = {
  title: {
    title: "",
    ZHtitle: "",
    subtitle: "",
    ZHsubtitle: "",
    overview: "",
    ZHoverview: "",
    people: "",
    ZHpeople: "",
    img1: { src: "", caption: "", ZHcaption: "" },
    img2: { src: "", caption: "", ZHcaption: "" },
    imgmobile: { src: "", caption: "", ZHcaption: "" },
    card: []
  },
  text: {
    text: "",
    ZHtext: "",
    card: []
  },
  image: {
    size: "fit",
    images: [{ src: "", caption: "", ZHcaption: "" }],
    card: []
  },
  quote: {
    quote: "",
    ZHquote: "",
    card: []
  },
  cardbox: {
    "card-shown": [],
    card: []
  },
  separator: {},
  youtube: {
    size: "fit",
    videos: [{ id: "", caption: "", ZHcaption: "" }],
    autoplay: false,
    loop: false,
    card: []
  },
  custom: {
    html: ""
  }
};

const STORAGE_KEY = "projectPageEditorBlocks";
let selectedBlockId = null;

window.editorLanguage = localStorage.getItem('editorLanguage') || 'en';

// --- Utility Functions ---
function generateBlockId() {
  // Simple unique id: timestamp + random
  return 'block-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
}
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

function migrateBlocksForLocalization(blocks) {
  console.log("migrating blocks for localization: ", blocks);
  blocks.forEach(block => {
    // Title block
    if (block.type === "title") {
      if (!("ZHtitle" in block.data)) block.data.ZHtitle = "";
      if (!("ZHsubtitle" in block.data)) block.data.ZHsubtitle = "";
      if (!("ZHoverview" in block.data)) block.data.ZHoverview = "";
      if (!("ZHpeople" in block.data)) block.data.ZHpeople = "";
      if (block.data.img1 && !("ZHcaption" in block.data.img1)) block.data.img1.ZHcaption = "";
      if (block.data.img2 && !("ZHcaption" in block.data.img2)) block.data.img2.ZHcaption = "";
      if (block.data.imgmobile && !("ZHcaption" in block.data.imgmobile)) block.data.imgmobile.ZHcaption = "";
    }
    // Text block
    if (block.type === "text") {
      if (!("ZHtext" in block.data)) block.data.ZHtext = "";
    }
    // Quote block
    if (block.type === "quote") {
      if (!("ZHquote" in block.data)) block.data.ZHquote = "";
    }
    // Image block
    if (block.type === "image" && Array.isArray(block.data.images)) {
      block.data.images.forEach(img => {
        if (!("ZHcaption" in img)) img.ZHcaption = "";
      });
    }
    // Youtube block
    if (block.type === "youtube" && Array.isArray(block.data.videos)) {
      block.data.videos.forEach(vid => {
        if (!("ZHcaption" in vid)) vid.ZHcaption = "";
      });
    }
  });
  return blocks;
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

const sidebar = document.querySelector('.editor-sidebar');
const resizer = document.getElementById('editor-resizer');
const preview = document.querySelector('.editor-preview');
const expandToggle = document.getElementById('expand-toggle');

// Insert the toggle button into the editor actions area
const editorActions = document.querySelector('.editor-actions');
editorActions.appendChild(previewModeToggle);

// --- State ---
let blocks = loadBlocks();
let previewMode = true; // false = JSON, true = HTML preview

let primaryScrollSource = null;
let scrollTimeout = null;

let isDragging = false;

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
        // Ensure each block has a blockId
        blocks = metadata.map(block => ({
            ...block,
            blockId: block.blockId || generateBlockId()
        }));

        // When loading blocks from metadata (e.g., after import or on page load)
        blocks = metadata.map(block => {
          if (block.type === "youtube") {
            // If old format: has 'id' but not 'videos'
            if (block.data && block.data.id && !block.data.videos) {
              block.data = {
                size: "fit",
                videos: [{ id: block.data.id, caption: "" }],
                autoplay: false,
                loop: false,
                card: block.data.card || []
              };
            }
            // If old format: has 'url' but not 'videos'
            if (block.data && block.data.url && !block.data.videos) {
              // Try to extract YouTube ID from URL
              const match = block.data.url.match(/embed\/([a-zA-Z0-9_-]+)/);
              const id = match ? match[1] : "";
              block.data = {
                size: "fit",
                videos: [{ id, caption: "" }],
                autoplay: false,
                loop: false,
                card: block.data.card || []
              };
            }
          }
          block.blockId = block.blockId || generateBlockId();
          return block;
        });

        blocks = migrateBlocksForLocalization(blocks);

        saveBlocks(blocks);
        renderBlockList();
        renderPreview();
        alert("Project loaded!");
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

document.getElementById('language-toggle').addEventListener('click', function() {
  window.editorLanguage = window.editorLanguage === 'en' ? 'zh' : 'en';
  localStorage.setItem('editorLanguage', window.editorLanguage);
  this.textContent = window.editorLanguage === 'en' ? 'English' : '中文';
  renderBlockList(); // Re-render the editor sidebar
  renderPreview();   // Re-render the live preview
});

// Set initial button text on page load
const langToggleBtn = document.getElementById('language-toggle');
if (langToggleBtn) {
  langToggleBtn.textContent = window.editorLanguage === 'en' ? 'English' : '中文';
}

// --- Render Functions ---
function renderTitleBlockEditor(data, idx) {
  let html = '';
  if (window.editorLanguage === 'en') {
    html += `<input type="text" placeholder="Title" value="${data.title}" data-field="title" data-idx="${idx}" /><br/>
      <input type="text" placeholder="Subtitle" value="${data.subtitle}" data-field="subtitle" data-idx="${idx}" /><br/>
      <textarea placeholder="Overview" data-field="overview" data-idx="${idx}">${data.overview}</textarea><br/>
      <textarea placeholder="People" data-field="people" data-idx="${idx}">${data.people}</textarea><br/>
      <input type="text" placeholder="Image 1 caption" value="${data.img1.caption}" data-field="img1.caption" data-idx="${idx}" /><br/>
      <input type="text" placeholder="Image 2 caption" value="${data.img2.caption}" data-field="img2.caption" data-idx="${idx}" /><br/>
      <input type="text" placeholder="Mobile Image caption" value="${data.imgmobile.caption}" data-field="imgmobile.caption" data-idx="${idx}" /><br/>`;
  } else {
    html += `<input type="text" placeholder="標題" value="${data.ZHtitle}" data-field="ZHtitle" data-idx="${idx}" /><br/>
      <input type="text" placeholder="副標題" value="${data.ZHsubtitle}" data-field="ZHsubtitle" data-idx="${idx}" /><br/>
      <textarea placeholder="簡介" data-field="ZHoverview" data-idx="${idx}">${data.ZHoverview}</textarea><br/>
      <textarea placeholder="成員" data-field="ZHpeople" data-idx="${idx}">${data.ZHpeople}</textarea><br/>
      <input type="text" placeholder="圖片1說明" value="${data.img1.ZHcaption}" data-field="img1.ZHcaption" data-idx="${idx}" /><br/>
      <input type="text" placeholder="圖片2說明" value="${data.img2.ZHcaption}" data-field="img2.ZHcaption" data-idx="${idx}" /><br/>
      <input type="text" placeholder="手機圖片說明" value="${data.imgmobile.ZHcaption}" data-field="imgmobile.ZHcaption" data-idx="${idx}" /><br/>`;
  }
  html += `<input type="text" placeholder="Cards (comma separated)" value="${data.card.join(',')}" data-field="card" data-idx="${idx}" /><br/>`;
  return html;
}

function renderTextBlockEditor(data, idx) {
  let html = '';
  if (window.editorLanguage === 'en') {
    html += `<textarea placeholder="Text" data-field="text" data-idx="${idx}">${data.text}</textarea><br/>`;
  } else {
    html += `<textarea placeholder="內容" data-field="ZHtext" data-idx="${idx}">${data.ZHtext}</textarea><br/>`;
  }
  html += `<input type="text" placeholder="Cards (comma separated)" value="${data.card.join(',')}" data-field="card" data-idx="${idx}" /><br/>`;
  return html;
}

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
    if (window.editorLanguage === 'en') {
      html += `
        <input type="text" placeholder="Image src" value="${img.src}" data-field="images.${imgIdx}.src" data-idx="${idx}" /><br/>
        <textarea placeholder="Image caption (markdown supported)" data-field="images.${imgIdx}.caption" data-idx="${idx}">${img.caption}</textarea><br/>
      `;
    } else {
      html += `
        <input type="text" placeholder="圖片連結" value="${img.src}" data-field="images.${imgIdx}.src" data-idx="${idx}" /><br/>
        <textarea placeholder="圖片說明 (支援 markdown)" data-field="images.${imgIdx}.ZHcaption" data-idx="${idx}">${img.ZHcaption}</textarea><br/>
      `;
    }
  });
  html += `<button data-action="add-image" data-idx="${idx}" style="background:#3a7afe;color:#fff;border:none;border-radius:4px;padding:0.2em 0.7em;cursor:pointer;">Add Image</button><br/>`;
  html += `<input type="text" placeholder="Cards (comma separated)" value="${data.card.join(',')}" data-field="card" data-idx="${idx}" /><br/>`;
  return html;
}

function renderQuoteBlockEditor(data, idx) {
  let html = '';
  if (window.editorLanguage === 'en') {
    html += `<textarea placeholder="Quote" data-field="quote" data-idx="${idx}">${data.quote}</textarea><br/>`;
  } else {
    html += `<textarea placeholder="引用" data-field="ZHquote" data-idx="${idx}">${data.ZHquote}</textarea><br/>`;
  }
  html += `<input type="text" placeholder="Cards (comma separated)" value="${data.card.join(',')}" data-field="card" data-idx="${idx}" /><br/>`;
  return html;
}

function renderYoutubeBlockEditor(data, idx) {
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
      <input type="checkbox" data-field="autoplay" data-idx="${idx}" ${data.autoplay ? "checked" : ""} />
      Autoplay
    </label>
    <br/>
    <label>
      <input type="checkbox" data-field="loop" data-idx="${idx}" ${data.loop ? "checked" : ""} />
      Loop
    </label>
    <br/>
  `;
  data.videos.forEach((vid, vidIdx) => {
    if (window.editorLanguage === 'en') {
      html += `
        <input type="text" placeholder="YouTube Project ID (e.g. 2Ti-4tyv9Lg)" value="${vid.id}" data-field="videos.${vidIdx}.id" data-idx="${idx}" /><br/>
        <textarea placeholder="Video caption (markdown supported)" data-field="videos.${vidIdx}.caption" data-idx="${idx}">${vid.caption}</textarea><br/>
      `;
    } else {
      html += `
        <input type="text" placeholder="YouTube 專案 ID (如 2Ti-4tyv9Lg)" value="${vid.id}" data-field="videos.${vidIdx}.id" data-idx="${idx}" /><br/>
        <textarea placeholder="影片說明 (支援 markdown)" data-field="videos.${vidIdx}.ZHcaption" data-idx="${idx}">${vid.ZHcaption}</textarea><br/>
      `;
    }
  });
  html += `<button data-action="add-video" data-idx="${idx}" style="background:#3a7afe;color:#fff;border:none;border-radius:4px;padding:0.2em 0.7em;cursor:pointer;">Add Video</button><br/>`;
  html += `<input type="text" placeholder="Cards (comma separated)" value="${data.card.join(',')}" data-field="card" data-idx="${idx}" /><br/>`;
  return html;
}


function renderBlockEditor(block, idx) {
  // Minimal editor for each block type
  let html = `<div class="block-editor" draggable="true" data-idx="${idx}" data-block-id="${block.blockId}" id="editor-block-${block.blockId}">`;
  html += `<div style="display:flex;justify-content:space-between;align-items:center;">
    <strong>${block.type.charAt(0).toUpperCase() + block.type.slice(1)}</strong>
    <button data-action="delete" data-idx="${idx}" style="background:#e33;color:#fff;border:none;border-radius:4px;padding:0.2em 0.7em;cursor:pointer;">Delete</button>
  </div>`;
  switch (block.type) {
    case "title":
      html += renderTitleBlockEditor(block.data, idx);
      break;
    case "text":
      html += renderTextBlockEditor(block.data, idx);
      break;
    case "image":
      html += renderImageBlockEditor(block.data, idx);
      break;
    case "quote":
      html += renderQuoteBlockEditor(block.data, idx);
      break;
    case "cardbox":
      html += `<input type="text" placeholder="Cards shown (comma separated)" value="${block.data["card-shown"].join(',')}" data-field="card-shown" data-idx="${idx}" /><br/>
        <input type="text" placeholder="Cards (comma separated)" value="${block.data.card.join(',')}" data-field="card" data-idx="${idx}" /><br/>`;
      break;
    case "separator":
      html += `<em>Separator line</em>`;
      break;
    case "youtube":
      html += renderYoutubeBlockEditor(block.data, idx);
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
    // Links: section links (#...) vs normal links
    .replace(/\[(.*?)\]\((#.*?)\)/g, '<a href="$2" style="color: inherit" class="section-link">$1</a>') // Section links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: inherit" target="_blank" rel="noopener">$1</a>') // External links
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Headings
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
  // Indented bullets (supports up to 4 levels)
  html = html.replace(
    /((?:^(?:\s{0,8}[-*] .+(?:\n|$))+)+)/gm,
    function (match) {
      const lines = match.trim().split('\n');
      let result = '';
      let stack = [];
      lines.forEach(line => {
        const indent = line.match(/^(\s*)/)[1].length;
        const level = Math.floor(indent / 2); // 2 spaces per level
        const content = line.replace(/^\s*[-*] (.+)/, '$1');
        while (stack.length < level + 1) {
          result += '<ul>';
          stack.push('ul');
        }
        while (stack.length > level + 1) {
          result += '</ul>';
          stack.pop();
        }
        result += `<li>${content}</li>`;
      });
      while (stack.length > 0) {
        result += '</ul>';
        stack.pop();
      }
      return result;
    }
  );
    // Paragraph breaks
    html = html.replace(/\n{2,}/g, '<br/>');
  return html;
}

function renderTitleBlockPreview(data, blockId) {
  const lang = window.editorLanguage === 'zh' ? 'zh' : 'en';
  const title = lang === 'zh' && data.ZHtitle ? data.ZHtitle : data.title;
  const subtitle = lang === 'zh' && data.ZHsubtitle ? data.ZHsubtitle : data.subtitle;
  const overview = lang === 'zh' && data.ZHoverview ? data.ZHoverview : data.overview;
  const people = lang === 'zh' && data.ZHpeople ? data.ZHpeople : data.people;
  const img1Caption = lang === 'zh' && data.img1.ZHcaption ? data.img1.ZHcaption : data.img1.caption;
  const img2Caption = lang === 'zh' && data.img2.ZHcaption ? data.img2.ZHcaption : data.img2.caption;
  const imgmobileCaption = lang === 'zh' && data.imgmobile.ZHcaption ? data.imgmobile.ZHcaption : data.imgmobile.caption;

  // Mobile header image
  const mobileImage = data.imgmobile.src
    ? `<div class="project-images mobile-header-image" style="--img-count: 1">
        <figure>
          <img src="${data.imgmobile.src}" alt="${imgmobileCaption}" />
          ${imgmobileCaption ? `<figcaption>${imgmobileCaption}</figcaption>` : ""}
        </figure>
      </div>`
    : "";

  // Non-mobile images
  const nonMobileImages = [data.img1, data.img2]
    .filter(img => img.src)
    .map(img =>
      `<figure>
        <img src="${img.src}" alt="${img === data.img1 ? img1Caption : img2Caption}" />
        ${(img === data.img1 ? img1Caption : img2Caption) ? `<figcaption>${img === data.img1 ? img1Caption : img2Caption}</figcaption>` : ""}
      </figure>`
    ).join("");

  const nonMobileImagesBlock = nonMobileImages
    ? `<div class="project-images non-mobile" style="--img-count: ${[data.img1, data.img2].filter(img => img.src).length}">
        ${nonMobileImages}
      </div>`
    : "";

  // Overview and People
  const overviewBlock = overview
    ? `<div class="overview">
        <h2>${lang === 'zh' ? '簡介' : 'Overview'}</h2>
        <p>${renderMarkdown(overview)}</p>
      </div>`
    : "";

  const peopleBlock = people
    ? `<div class="people">
        <h2>${lang === 'zh' ? '成員' : 'People'}</h2>
        <p>${renderMarkdown(people)}</p>
      </div>`
    : "";

  const overviewAndPeople = (overviewBlock || peopleBlock)
    ? `<div class="overview-and-people">${overviewBlock}${peopleBlock}</div>`
    : "";

  // Main block
  return `
    <section class="top-section" id="preview-block-${blockId}" data-block-id="${blockId}">
      <div class="project-block">
        ${mobileImage}
        <h1${data.card && data.card.length ? ` data-card-event="${data.card.join(', ')}"` : ""}>${title}</h1>
        ${subtitle ? `<div class="project-subtitle">${subtitle}</div>` : ""}
        ${overviewAndPeople}
      </div>
      ${nonMobileImagesBlock}
    </section>
  `;
}

function renderTextBlockPreview(data, blockId){
  const text = window.editorLanguage === 'zh' && data.ZHtext ? data.ZHtext : data.text;
  return `<section class="project-block center-text" id="preview-block-${blockId}" data-block-id="${blockId}" ${data.card && data.card.length ? ` data-card-event="${data.card.join(', ')}"` : ""}><div>${renderMarkdown(text)}</div></section>`;
}

function renderImageBlockPreview(data, blockId) {
  const lang = window.editorLanguage === 'zh' ? 'zh' : 'en';
  const imgCount = data.images.filter(img => img.src).length;
  if (imgCount === 0) return "";

  // Build figure HTML
  const figures = data.images
    .filter(img => img.src)
    .map(img => {
      const caption = lang === 'zh' && img.ZHcaption ? img.ZHcaption : img.caption;
      // Check for mp4 video
      if (img.src.match(/\.(mp4)$/i)) {
        return `<figure>
          <video src="${img.src}" controls autoplay muted loop playsinline style="width:100%;height:auto;display:block;"></video>
          ${caption ? `<figcaption>${renderMarkdown(caption)}</figcaption>` : ""}
        </figure>`;
      } else {
        return `<figure>
          <img loading="lazy" src="${img.src}" alt="${caption}" style="width:100%;height:auto;display:block;" />
          ${caption ? `<figcaption>${renderMarkdown(caption)}</figcaption>` : ""}
        </figure>`;
      }
    })
    .join("");

  // Build classes and styles
  let classes = "project-images";
  if (data.size === "large") classes += " large-image";
  if (data.noRatio) classes += " no-ratio";
  if (data.noShadow) classes += " no-shadow";

  // Build data-card-event attribute if needed
  const cardAttr = data.card && data.card.length ? ` data-card-event="${data.card.join(', ')}"` : "";

  return `
    <section id="preview-block-${blockId}" data-block-id="${blockId}" class="project-block${data.size === "large" ? " large-image" : " center-text"}">
      <div class="${classes}" style="--img-count: ${imgCount};"${cardAttr}>
        ${figures}
      </div>
    </section>
  `;
}

function renderQuoteBlockPreview(data, blockId) {
  const quote = window.editorLanguage === 'zh' && data.ZHquote ? data.ZHquote : data.quote;
  return `<section class="project-block center-text" id="preview-block-${blockId}" data-block-id="${blockId}" ${data.card && data.card.length ? ` data-card-event="${data.card.join(', ')}"` : ""}><div class="quote">${renderMarkdown(quote)}</div></section>`;
}

function renderSeparatorBlockPreview(blockId) {
  return `<section class="project-block" id="preview-block-${blockId}" data-block-id="${blockId}"><div class="separator line"></div></section>`;
}

function renderCardboxBlockPreview(data, blockId) {
  return `<div style="background:#eaf3ff;padding:1em;border-radius:8px;margin:1em 0; ${data.card && data.card.length ? ` data-card-event="${data.card.join(', ')}"` : ""}">Cards: ${data["card-shown"].join(', ')}</div>`;
}

function renderYoutubeBlockPreview(data, blockId) {
  const videoCount = data.videos.filter(vid => vid.id).length;
  if (videoCount === 0) return "";

  // Ensure the YouTube API script is only added once
  if (!window._ytApiScriptAdded) {
    window._ytApiScriptAdded = true;
    setTimeout(() => {
      if (!document.getElementById('yt-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api';
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
    }, 0);
  }

  // Generate unique player IDs for each video
  const playerIds = data.videos.map((vid, i) => `yt-player-${blockId}-${i}`);

  // Build figure HTML for each video
  const figures = data.videos
    .filter(vid => vid.id)
    .map((vid, i) => {
      const caption = window.editorLanguage === 'zh' && vid.ZHcaption ? vid.ZHcaption : vid.caption;
      return `<figure>
        <div class="video-wrapper">
          <div id="${playerIds[i]}" class="yt-api-player" data-ytid="${vid.id}" data-autoplay="${data.autoplay ? 1 : 0}" data-loop="${data.loop ? 1 : 0}"></div>
        </div>
        ${caption ? `<figcaption>${renderMarkdown(caption)}</figcaption>` : ""}
      </figure>`;
    })
    .join("");

  // Classes and styles
  let classes = "project-videos";
  if (data.size === "large") classes += " large-video";
  if (data.noRatio) classes += " no-ratio";
  if (data.noShadow) classes += " no-shadow";
  const cardAttr = data.card && data.card.length ? ` data-card-event="${data.card.join(', ')}"` : "";

  // Attach the player setup script (runs after DOM update)
  setTimeout(() => {
    if (!window._ytPlayers) window._ytPlayers = {};
    window.onYouTubeIframeAPIReady = function() {
      document.querySelectorAll('.yt-api-player').forEach(function(el) {
        const ytid = el.getAttribute('data-ytid');
        const autoplay = el.getAttribute('data-autoplay') === '1';
        const loop = el.getAttribute('data-loop') === '1';
        if (!window._ytPlayers[el.id]) {
          window._ytPlayers[el.id] = new YT.Player(el.id, {
            videoId: ytid,
            playerVars: {
              modestbranding: 1,
              autoplay: autoplay ? 1 : 0,
              controls: 1,
              showinfo: 0,
              rel: 0,
              mute: autoplay ? 1 : 0,
              origin: window.location.origin
            },
            events: {
              'onReady': function(event) {
                if (autoplay) event.target.playVideo();
              },
              'onStateChange': function(event) {
                const player = event.target;
                if (loop && event.data === YT.PlayerState.PLAYING) {
                  const remains = player.getDuration() - player.getCurrentTime();
                  if (player._rewindTO) clearTimeout(player._rewindTO);
                  player._rewindTO = setTimeout(function() {
                    player.seekTo(0);
                  }, (remains - 0.1) * 1000);
                }
                if (loop && event.data === YT.PlayerState.ENDED) {
                  player.seekTo(0);
                  player.playVideo();
                }
              }
            }
          });
        }
      });
    };
    // If API is already loaded, call the setup immediately
    if (window.YT && window.YT.Player) window.onYouTubeIframeAPIReady();
  }, 0);

  return `
    <section id="preview-block-${blockId}" data-block-id="${blockId}" class="project-block${data.size === "large" ? " large-video" : " center-text"}">
      <div class="${classes}" style="--video-count: ${videoCount};"${cardAttr}>
        ${figures}
      </div>
    </section>
  `;
}

function renderCustomBlockPreview(data, blockId) {
  return data.html;
}

function renderBlockPreview(block) {
  switch (block.type) {
    case "title":
      return renderTitleBlockPreview(block.data, block.blockId);
    case "text":
      return renderTextBlockPreview(block.data, block.blockId);
    case "image":
      return renderImageBlockPreview(block.data, block.blockId);
    case "quote":
      return renderQuoteBlockPreview(block.data, block.blockId);
    case "separator":
      return renderSeparatorBlockPreview(block.blockId);
    case "cardbox":
      return renderCardboxBlockPreview(block.data, block.blockId);
    case "youtube":
      return renderYoutubeBlockPreview(block.data, block.blockId);
    case "custom":
      return renderCustomBlockPreview(block.data, block.blockId);
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

function updateBlockPreview(idx) {
  const block = blocks[idx];
  const previewBlock = document.getElementById(`preview-block-${block.blockId}`);
  if (previewBlock) {
    // Replace the block's outerHTML with the new preview HTML
    previewBlock.outerHTML = renderBlockPreview(block);
  }
}

// --- Block Manipulation ---
function addBlock(type) {
  const data = JSON.parse(JSON.stringify(BLOCK_TYPES[type]));
  const blockId = generateBlockId();
  const newBlock = { type, data, blockId };

  let insertIdx = blocks.length; // Default: end of list
  if (selectedBlockId) {
    const selectedIdx = blocks.findIndex(b => b.blockId === selectedBlockId);
    if (selectedIdx !== -1) {
      insertIdx = selectedIdx + 1;
    }
  }
  blocks.splice(insertIdx, 0, newBlock);

  // Select the newly added block
  selectedBlockId = blockId;
  saveBlocks(blocks);
  renderBlockList();
  renderPreview();
  updateSelectionHighlight();
}

function deleteBlock(idx) {
  const deletedBlockId = blocks[idx].blockId;
  blocks.splice(idx, 1);

  // If deleted block was selected, select previous block or clear selection
  if (selectedBlockId === deletedBlockId) {
    if (blocks[idx]) {
      selectedBlockId = blocks[idx].blockId;
    } else if (blocks[idx - 1]) {
      selectedBlockId = blocks[idx - 1].blockId;
    } else {
      selectedBlockId = null;
    }
  }

  saveBlocks(blocks);
  renderBlockList();
  renderPreview();
  updateSelectionHighlight();
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
//   renderPreview();
    updateBlockPreview(idx); // Efficient update for preview
}

function updateSelectionHighlight() {
  // Remove .selected from all blocks
  document.querySelectorAll('.block-editor.selected').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('.project-block.selected').forEach(el => el.classList.remove('selected'));

  if (selectedBlockId) {
    // Add .selected to the selected editor block
    const editorBlock = document.getElementById(`editor-block-${selectedBlockId}`);
    if (editorBlock) editorBlock.classList.add('selected');

    // Add .selected to the selected preview block
    const previewBlock = document.getElementById(`preview-block-${selectedBlockId}`);
    if (previewBlock) previewBlock.classList.add('selected');
  }
}

function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function getMostVisibleBlock(container, blockClass) {
  const blocks = Array.from(container.querySelectorAll(blockClass));
  let maxVisible = 0;
  let mostVisibleBlock = null;
  blocks.forEach(block => {
    const rect = block.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const visible =
      Math.max(0, Math.min(rect.bottom, containerRect.bottom) - Math.max(rect.top, containerRect.top));
    if (visible > maxVisible) {
      maxVisible = visible;
      mostVisibleBlock = block;
    }
  });
  return mostVisibleBlock;
}

function setPrimaryScroll(source) {
  primaryScrollSource = source;
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    primaryScrollSource = null;
  }, 1000); // 1000ms after last scroll event, reset
}

function syncPreviewToEditor() {
  const block = getMostVisibleBlock(sidebar, '.block-editor');
  if (!block) return;
  const blockId = block.getAttribute('data-block-id');
  const previewBlock = document.getElementById(`preview-block-${blockId}`);
  if (previewBlock) {
    previewBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function syncEditorToPreview() {
  const block = getMostVisibleBlock(preview, '.project-block');
  if (!block) return;
  const blockId = block.getAttribute('data-block-id');
  const editorBlock = document.getElementById(`editor-block-${blockId}`);
  if (editorBlock) {
    editorBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

const debouncedSyncPreviewToEditor = debounce(syncPreviewToEditor, 100);
const debouncedSyncEditorToPreview = debounce(syncEditorToPreview, 100);

function addImageToBlock(idx) {
  blocks[idx].data.images.push({ src: "", caption: "" });
  saveBlocks(blocks);
  renderBlockList();
  renderPreview();
}

function addVideoToBlock(idx) {
  blocks[idx].data.videos.push({ id: "", caption: "" });
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

blockListEl.addEventListener("click", e => {
  const blockEl = e.target.closest('.block-editor');
  if (blockEl) {
    selectedBlockId = blockEl.getAttribute('data-block-id');
    updateSelectionHighlight();
  }
});

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
// Editor scroll event
sidebar.addEventListener('scroll', () => {
  if (primaryScrollSource === 'preview') return; // Only follow, don't initiate
  setPrimaryScroll('editor');
  debouncedSyncPreviewToEditor();
});

// Preview scroll event
preview.addEventListener('scroll', () => {
  if (primaryScrollSource === 'editor') return; // Only follow, don't initiate
  setPrimaryScroll('preview');
  debouncedSyncEditorToPreview();
});

addBlockBtn.addEventListener("click", () => {
  addBlock(blockTypeSelect.value);
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
  if (action === "add-video" && !isNaN(idx)) {
    addVideoToBlock(idx);
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
        <header>
        <h1>
            <a
            href="index.html"
            style="color: inherit; text-decoration: none; cursor: pointer"
            >Enoch Kang</a
            >
        </h1>
        <nav class="main-nav">
                <button class="translate">
            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" class="bi bi-translate" viewBox="0 0 16 16">
  <path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286zm1.634-.736L5.5 3.956h-.049l-.679 2.022z"/>
  <path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm7.138 9.995q.289.451.63.846c-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6 6 0 0 1-.415-.492 2 2 0 0 1-.94.31"/>
</svg>
        </button>
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
        <img src="assets/images/trading-card-button.avif" alt="" />
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
        <script src="header-menu.js"></script>
        <script src="trading-card.js"></script>
        <script src="project-page.js"></script>
    </body>
    </html>
`;

  // Render all blocks in English for export
  const originalLang = window.editorLanguage;
  window.editorLanguage = 'en';
  const contentHTML = blocks.map(renderBlockPreview).join('');
  window.editorLanguage = originalLang;

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

document.getElementById('output-csv').addEventListener('click', () => {
  // List of translatable fields per block type
  const translatableFields = {
    title: ['title', 'subtitle', 'overview', 'people', 'ZHtitle', 'ZHsubtitle', 'ZHoverview', 'ZHpeople'],
    text: ['text', 'ZHtext'],
    quote: ['quote', 'ZHquote'],
    image: ['images', 'img1', 'img2', 'imgmobile'],
    youtube: ['videos'],
  };

  // Helper to flatten fields for CSV
  function extractFields(block) {
    const rows = [];
    const { type, data, blockId } = block;

    if (type === 'title') {
      ['title', 'subtitle', 'overview', 'people'].forEach(field => {
        rows.push({
          blockId,
          field,
          en: data[field] || '',
          zh: data['ZH' + field.charAt(0).toUpperCase() + field.slice(1)] || ''
        });
      });
      // Images
      ['img1', 'img2', 'imgmobile'].forEach(imgKey => {
        if (data[imgKey]) {
          rows.push({
            blockId,
            field: `${imgKey}.caption`,
            en: data[imgKey].caption || '',
            zh: data[imgKey].ZHcaption || ''
          });
        }
      });
    }
    if (type === 'text') {
      rows.push({
        blockId,
        field: 'text',
        en: data.text || '',
        zh: data.ZHtext || ''
      });
    }
    if (type === 'quote') {
      rows.push({
        blockId,
        field: 'quote',
        en: data.quote || '',
        zh: data.ZHquote || ''
      });
    }
    if (type === 'image') {
      if (Array.isArray(data.images)) {
        data.images.forEach((img, idx) => {
          rows.push({
            blockId,
            field: `images[${idx}].caption`,
            en: img.caption || '',
            zh: img.ZHcaption || ''
          });
        });
      }
    }
    if (type === 'youtube') {
      if (Array.isArray(data.videos)) {
        data.videos.forEach((vid, idx) => {
          rows.push({
            blockId,
            field: `videos[${idx}].caption`,
            en: vid.caption || '',
            zh: vid.ZHcaption || ''
          });
        });
      }
    }
    return rows;
  }

  // Build CSV rows
  let csvRows = [['blockId', 'field', 'en', 'zh']];
  blocks.forEach(block => {
    extractFields(block).forEach(row => {
      // Escape quotes for CSV
      csvRows.push([
        row.blockId,
        row.field,
        `"${(row.en || '').replace(/"/g, '""')}"`,
        `"${(row.zh || '').replace(/"/g, '""')}"`
      ]);
    });
  });

  // Join rows
  const csvString = csvRows.map(r => r.join(',')).join('\n');

  // Copy to clipboard and download as file
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(csvString)
      .then(() => alert('CSV copied to clipboard!'))
      .catch(() => alert('Failed to copy CSV.'));
  }

  // Also trigger download
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'translations.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

document.getElementById('input-csv').addEventListener('click', () => {
  // Create file input for CSV upload
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv,text/csv';
  input.style.display = 'none';
  document.body.appendChild(input);

input.addEventListener('change', async (e) => {
  const file = input.files[0];
  if (!file) return;
  const text = await file.text();

  // Use PapaParse to parse CSV
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  if (!parsed.data || parsed.data.length === 0) {
    alert('CSV is empty or invalid.');
    document.body.removeChild(input);
    return;
  }

  // Map for quick block lookup
  const blockMap = {};
  blocks.forEach(block => blockMap[block.blockId] = block);

  let updatedCount = 0;
  parsed.data.forEach(row => {
    const blockId = row.blockId?.trim();
    const field = row.field?.trim();
    const zh = row.zh?.trim();
    if (!blockId || !field) {
      console.warn(`[CSV Import] Skipped row due to missing blockId or field:`, row);
      return;
    }
    const block = blockMap[blockId];
    if (!block) {
      console.warn(`[CSV Import] Skipped row due to missing block in blockMap:`, row);
      return;
    }
    // ...rest of your update logic...
// Handle nested fields (e.g. images[0].caption)
      let target = block.data;
      let fieldPath = field;
      let zhField = null;
      if (field.match(/^images\[(\d+)\]\.caption$/)) {
        const idx = parseInt(field.match(/^images\[(\d+)\]\.caption$/)[1]);
        if (target.images && target.images[idx]) {
          target = target.images[idx];
          zhField = 'ZHcaption';
        }
      } else if (field.match(/^videos\[(\d+)\]\.caption$/)) {
        const idx = parseInt(field.match(/^videos\[(\d+)\]\.caption$/)[1]);
        if (target.videos && target.videos[idx]) {
          target = target.videos[idx];
          zhField = 'ZHcaption';
        }
      } else if (field.match(/^img(1|2|mobile)\.caption$/)) {
        const imgKey = field.split('.')[0];
        if (target[imgKey]) {
          target = target[imgKey];
          zhField = 'ZHcaption';
        }
      } else {
        // For normal fields, if field is 'text', use 'ZHtext', if 'quote', use 'ZHquote', etc.
        if (field === 'text') zhField = 'ZHtext';
        else if (field === 'quote') zhField = 'ZHquote';
        else if (field === 'people') zhField = 'ZHpeople';
        else if (field === 'overview') zhField = 'ZHoverview';
        else if (field === 'subtitle') zhField = 'ZHsubtitle';
        else if (field === 'title') zhField = 'ZHtitle';
        else zhField = field.startsWith('ZH') ? field : 'ZH' + field;
      }

      if (zhField && typeof target === 'object' && zh !== undefined) {
        target[zhField] = zh;
        updatedCount++;
        console.log(`[CSV Import] Updated blockId: ${blockId}, field: ${zhField}, value:`, zh);
      } else {
        console.warn(`[CSV Import] Failed to update blockId: ${blockId}, field: ${zhField}. Reason:`,
          {
            blockId,
            field,
            zhField,
            targetType: typeof target,
            zh,
            block,
            target
          }
        );
      }
  });

    saveBlocks(blocks);
    renderBlockList();
    renderPreview();
    alert(`Imported CSV. Updated ${updatedCount} translations.`);
    document.body.removeChild(input);
  });

  input.click();
});
// Responsive floating contents menu based on headings
function updateFloatingMenu() {
// Select all h2 and h3 headings in main content
	const headings = Array.from(document.querySelectorAll('main h2, main h3'));
	if (headings.length === 0) return;

	// Remove existing menu if any
	const existingMenu = document.querySelector('.floating-contents-menu');
	if (existingMenu) {
		existingMenu.remove();
	}

	// Create menu container
	const menu = document.createElement('nav');
	menu.className = 'floating-contents-menu';
	const list = document.createElement('ul');

	// Build menu items
		headings.forEach((heading, idx) => {
			// Ensure each heading has an id
			if (!heading.id) {
				heading.id = 'section-' + idx;
			}
			const li = document.createElement('li');
			const a = document.createElement('a');
			a.href = '#' + heading.id;
			a.textContent = heading.textContent;
			// Indent h3 more than h2
			if (heading.tagName.toLowerCase() === 'h3') {
				li.classList.add('indent-h3');
			}
			li.appendChild(a);
			list.appendChild(li);
		});
	menu.appendChild(list);
	// If on project-page-editor, append to .editor-preview, else to body
    const previewDiv = document.querySelector('.editor-preview');
    if (previewDiv) {
        previewDiv.appendChild(menu);
    } else {
        document.body.appendChild(menu);
    }

	// Track which menu item was last clicked
	let clickedIdx = null;

	Array.from(list.children).forEach((li, idx) => {
		li.addEventListener('click', function(e) {
			clickedIdx = idx;
			setActive(idx);
		});
	});

	function setActive(idx) {
		Array.from(list.children).forEach((li, i) => {
			if (i === idx) {
				li.classList.add('active');
			} else {
				li.classList.remove('active');
			}
		});
	}

	function updateActive() {
		// If user clicked, prioritize that
		if (clickedIdx !== null) {
            console.log("clicked idx with: ", clickedIdx);
			setActive(clickedIdx);
            clickedIdx = null;
		} else {
			// Default: highlight by scroll
            console.log("clicked idx is null?");
			let activeIdx = 0;
			const scrollY = window.scrollY + 100;
			headings.forEach((heading, idx) => {
				if (heading.offsetTop <= scrollY) {
					activeIdx = idx;
				}
			});
			// Top of page
			if (window.scrollY < 10) {
				setActive(0);
				return;
			}
			// Bottom of page
			if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
				setActive(headings.length - 1);
				return;
			}
			setActive(activeIdx);
		}
	}
	window.addEventListener('scroll', updateActive);
	updateActive();
}

document.addEventListener('DOMContentLoaded', function () {
	updateFloatingMenu();
});

window.updateFloatingMenu = updateFloatingMenu;

// youtube iframe support

document.addEventListener('DOMContentLoaded', function () {
  // Load YouTube IFrame API
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

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
});

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

function translatePage(){
  // Get the metadata from the script tag
  const metadataEl = document.getElementById('project-metadata');
  if (!metadataEl) return;
  let blocks;
  try {
    blocks = JSON.parse(metadataEl.textContent);
  } catch (e) {
    console.error("Could not parse project metadata:", e);
    return;
  }

  // Determine language
  const lang = window.currentLanguage === 'zh' ? 'zh' : 'en';

  // --- Update header ---
  const header = document.querySelector('header');
  if (header) {
    // Update name
    const nameLink = header.querySelector('h1 a');
    if (nameLink) {
      nameLink.textContent = lang === 'zh' ? '康以諾' : 'Enoch Kang';
    }
    // Update nav links
    const navList = header.querySelectorAll('.nav-list li a');
    if (navList.length >= 3) {
      navList[0].textContent = lang === 'zh' ? '作品' : 'Work';
      navList[1].textContent = lang === 'zh' ? '遊戲' : 'Play';
      navList[2].textContent = lang === 'zh' ? '關於' : 'About';
    }
  }

  // --- Update footer ---
  const footer = document.querySelector('footer');
  if (footer) {
    // Update contact info and credits
    const pTags = footer.querySelectorAll('p');
    if (pTags.length >= 3) {
      // First <p>: email and social links (leave as-is)
      // Second <p>: credits
      pTags[1].innerHTML = lang === 'zh'
        ? '用滿滿的 熱忱 和 <a href="https://github.com/donnie9171/portfolio" target="_blank" rel="noopener" style="color: inherit;">毅力</a> (跟 Copilot 吵架) 完成的作品。'
        : 'Made with passion and a lot of <a href="https://github.com/donnie9171/portfolio" target="_blank" rel="noopener" style="color: inherit;">persistence</a> (wrangling Copilot).';
      // Third <p>: name
      pTags[2].textContent = lang === 'zh'
        ? 'Enoch (I-Nuo) Kang 康以諾'
        : 'by Enoch (I-Nuo) Kang 康以諾';
    }
  }

  // For each block, update the corresponding DOM element
  blocks.forEach(block => {
    const blockId = block.blockId;
    const el = document.querySelector(`[data-block-id="${blockId}"]`);
    if (!el) return;

// Title block
if (block.type === "title") {
  const data = block.data;
  const title = lang === 'zh' && data.ZHtitle ? data.ZHtitle : data.title;
  const subtitle = lang === 'zh' && data.ZHsubtitle ? data.ZHsubtitle : data.subtitle;
  const overview = lang === 'zh' && data.ZHoverview ? data.ZHoverview : data.overview;
  const people = lang === 'zh' && data.ZHpeople ? data.ZHpeople : data.people;
  const img1Caption = lang === 'zh' && data.img1.ZHcaption ? data.img1.ZHcaption : data.img1.caption;
  const img2Caption = lang === 'zh' && data.img2.ZHcaption ? data.img2.ZHcaption : data.img2.caption;
  const imgmobileCaption = lang === 'zh' && data.imgmobile.ZHcaption ? data.imgmobile.ZHcaption : data.imgmobile.caption;

  // Update title, subtitle, overview, people, and captions
  const h1 = el.querySelector('h1');
  if (h1) h1.innerHTML = renderMarkdown(title);
  const subtitleDiv = el.querySelector('.project-subtitle');
  if (subtitleDiv) subtitleDiv.innerHTML = renderMarkdown(subtitle);
  const overviewDiv = el.querySelector('.overview');
  if (overviewDiv) {
    const h2 = overviewDiv.querySelector('h2');
    if (h2) h2.innerHTML = lang === 'zh' ? '簡介' : 'Overview';
    const p = overviewDiv.querySelector('p');
    if (p) p.innerHTML = renderMarkdown(overview);
  }
  const peopleDiv = el.querySelector('.people');
  if (peopleDiv) {
    const h2 = peopleDiv.querySelector('h2');
    if (h2) h2.innerHTML = lang === 'zh' ? '成員' : 'People';
    const p = peopleDiv.querySelector('p');
    if (p) p.innerHTML = renderMarkdown(people);
  }
  // Update image captions
  const figures = el.querySelectorAll('figure');
  if (figures.length > 0) {
    if (figures[0]) {
      const figcaption = figures[0].querySelector('figcaption');
      if (figcaption) figcaption.innerHTML = renderMarkdown(imgmobileCaption || "");
    }
    if (figures[1]) {
      const figcaption = figures[1].querySelector('figcaption');
      if (figcaption) figcaption.innerHTML = renderMarkdown(img1Caption || "");
    }
    if (figures[2]) {
      const figcaption = figures[2].querySelector('figcaption');
      if (figcaption) figcaption.innerHTML = renderMarkdown(img2Caption || "");
    }
  }
}

// Text block
if (block.type === "text") {
  const data = block.data;
  const text = lang === 'zh' && data.ZHtext ? data.ZHtext : data.text;
  const div = el.querySelector('div');
  if (div) div.innerHTML = renderMarkdown(text);
  else el.innerHTML = renderMarkdown(text);
}

// Quote block
if (block.type === "quote") {
  const data = block.data;
  const quote = lang === 'zh' && data.ZHquote ? data.ZHquote : data.quote;
  const quoteDiv = el.querySelector('.quote');
  if (quoteDiv) quoteDiv.innerHTML = renderMarkdown(quote);
  else el.innerHTML = renderMarkdown(quote);
}

// Image block
if (block.type === "image") {
  const data = block.data;
  const figures = el.querySelectorAll('figure');
  data.images.forEach((img, idx) => {
    const caption = lang === 'zh' && img.ZHcaption ? img.ZHcaption : img.caption;
    if (figures[idx]) {
      const figcaption = figures[idx].querySelector('figcaption');
      if (figcaption) figcaption.innerHTML = renderMarkdown(caption || "");
    }
  });
}

// Youtube block
if (block.type === "youtube") {
  const data = block.data;
  const figures = el.querySelectorAll('figure');
  data.videos.forEach((vid, idx) => {
    const caption = lang === 'zh' && vid.ZHcaption ? vid.ZHcaption : vid.caption;
    if (figures[idx]) {
      const figcaption = figures[idx].querySelector('figcaption');
      if (figcaption) figcaption.innerHTML = renderMarkdown(caption || "");
    }
  });
}
  });

  if (typeof window.updateFloatingMenu === 'function') {
    window.updateFloatingMenu();
  }
}


// translate support
document.addEventListener('DOMContentLoaded', function () {
  var preferredLang = localStorage.getItem('preferredLanguage');
   // Set global language variable
  window.currentLanguage = localStorage.getItem('preferredLanguage') || 'en';
  // If user has a preference, redirect if necessary
  if (preferredLang === 'zh' ) {
	// translate text contents to zh and retrigger heading menu update
	translatePage();
  }

  const translateBtn = document.querySelector('.translate');
  if (!translateBtn) return;
  translateBtn.addEventListener('click', function () {
    if (window.currentLanguage === 'zh') {
      localStorage.setItem('preferredLanguage', 'en');
    } else {
      localStorage.setItem('preferredLanguage', 'zh');
    }
	window.currentLanguage = localStorage.getItem('preferredLanguage');
	translatePage();
  });
});
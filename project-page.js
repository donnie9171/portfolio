// Responsive floating contents menu based on headings
function updateFloatingMenu() {
// Select all h2 and h3 headings in main content
	const headings = Array.from(document.querySelectorAll('main h2, main h3'));
	if (headings.length === 0) return;

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
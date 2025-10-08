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
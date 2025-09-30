/**
 * Injects a modal with card content into the current page.
 * The modal is appended to the body and overlays all content.
 * Call this function to show the modal.
 */
function showTradingCardModal(cards = []) {
  let modal = document.getElementById('tradingCardModal');
  let content, grid, gridContainer, closeBtn;
  if (!modal) {
    // Create modal overlay
    modal = document.createElement('div');
    modal.id = 'tradingCardModal';
    modal.className = 'trading-card-modal hidden';

  // Modal content container
  content = document.createElement('div');
  content.className = 'trading-card-modal-content';

  // Add top message
  const topMessage = document.createElement('div');
  topMessage.className = 'trading-card-modal-message';
  topMessage.textContent = 'Find all the hidden cards!';
  content.appendChild(topMessage);

    // Close button
    closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.className = 'trading-card-modal-close';
    closeBtn.onclick = () => {
      modal.classList.add('hidden');
      document.body.classList.remove('modal-open');
    };

    // Cards grid container
    gridContainer = document.createElement('div');
    gridContainer.className = 'trading-card-grid-container';

    topImage = document.createElement('img');
    topImage.src = 'assets/images/trading-card-top-image.png';
    topImage.alt = '';
    topImage.className = 'trading-card-modal-top-image';
    content.appendChild(topImage);

    // Cards grid
    grid = document.createElement('div');
    grid.className = 'trading-card-modal-grid';
    gridContainer.appendChild(grid);

    content.appendChild(closeBtn);
    content.appendChild(gridContainer);
    modal.appendChild(content);

    // Remove modal on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
      }
    });

    document.body.appendChild(modal);
  } else {
    content = modal.querySelector('.trading-card-modal-content');
    gridContainer = modal.querySelector('.trading-card-grid-container');
    grid = modal.querySelector('.trading-card-modal-grid');
    closeBtn = modal.querySelector('.trading-card-modal-close');
  }

  // Update cards content
  grid.innerHTML = '';
  if (cards.length === 0) {
    grid.innerHTML = `<div class=\"trading-card-modal-empty\">No cards to display.</div>`;
  } else {
    cards.forEach((card, idx) => {
      const cardDiv = document.createElement('div');
      cardDiv.className = 'trading-card-modal-card';
      cardDiv.dataset.cardIndex = idx;
      if(card.found === "false"){
        cardDiv.classList.add('not-found');
        cardDiv.innerHTML = `
            <div class="card-not-found-text">?</div>
        `;
      }else{
        cardDiv.innerHTML = `
          <img src="${card.image || ''}" alt="${card.title || 'Card Title'}"></img>
        `;
        if(card.shiny === "true"){
          cardDiv.classList.add('shiny');
          cardDiv.innerHTML += `
              <s></s>
          `;
        }
      }
      // Add click handler for detailed view
      cardDiv.addEventListener('click', function(e) {
        e.stopPropagation();
        if(card.found === "false") return; // Do nothing if not found
        showCardDetailModal(card);
      });
      grid.appendChild(cardDiv);
    });
  }
// Show a detailed modal for a single card
function showCardDetailModal(card) {
  // Remove any existing detail modal
  let detailModal = document.getElementById('tradingCardDetailModal');
  if (detailModal) detailModal.remove();
  // Create modal overlay
  detailModal = document.createElement('div');
  detailModal.id = 'tradingCardDetailModal';
  detailModal.className = 'trading-card-detail-modal';
  // Modal content
  const content = document.createElement('div');
  content.className = 'trading-card-detail-content';
  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.className = 'trading-card-detail-close';
  closeBtn.onclick = () => {
    detailModal.remove();
  };
  // Card visual wrapper for 3D and shiny effect
  const cardVisual = document.createElement('div');
  cardVisual.className = 'trading-card-modal-card trading-card-detail-card';
  if(card.shiny === "true") {
    cardVisual.classList.add('shiny');
    const shine = document.createElement('s');
    cardVisual.appendChild(shine);
  }
  // Card image
  const img = document.createElement('img');
  img.src = card.image || '';
  img.alt = card.title || 'Card Title';
  img.className = 'trading-card-detail-img';
  cardVisual.appendChild(img);
  // Card title
  const title = document.createElement('h2');
  title.textContent = card.title || 'Card Title';
  title.className = 'trading-card-detail-title';
  // Card details (add more fields as needed)
  const details = document.createElement('div');
  details.className = 'trading-card-detail-desc';
  details.textContent = card.description || '';
  // Append all
  content.appendChild(closeBtn);
  content.appendChild(cardVisual);
//   content.appendChild(title);
//   content.appendChild(details);
  detailModal.appendChild(content);
  // Remove modal on background click
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) detailModal.remove();
  });
  document.body.appendChild(detailModal);

  // Add 3D and shine effect to the detail card for both mouse and pointer events
  function handle3DPointer(e) {
    const rect = cardVisual.getBoundingClientRect();
    let x, y;
    if (e.touches && e.touches.length) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = (e.clientX !== undefined ? e.clientX : 0) - rect.left;
      y = (e.clientY !== undefined ? e.clientY : 0) - rect.top;
    }
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = (x - cx) / cx;
    const dy = (y - cy) / cy;
    const maxRotate = 5;
    const rotateY = dx * maxRotate;
    const rotateX = -dy * maxRotate;
    cardVisual.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
    cardVisual.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.07)';
    cardVisual.querySelector('s')?.style.setProperty('--angle', `${rotateY + 45}deg`);
    cardVisual.querySelector('s')?.style.setProperty('--s-o', `0.5`);
    cardVisual.querySelector('s')?.style.setProperty('--s-s', `400%`);
  }
  function reset3DPointer() {
    cardVisual.style.transform = '';
    cardVisual.style.boxShadow = '';
    cardVisual.querySelector('s')?.style.setProperty('--angle', `45deg`);
    cardVisual.querySelector('s')?.style.setProperty('--s-o', `0.2`);
    cardVisual.querySelector('s')?.style.setProperty('--s-s', `100%`);
  }
  cardVisual.addEventListener('mousemove', handle3DPointer);
  cardVisual.addEventListener('pointermove', handle3DPointer);
  cardVisual.addEventListener('touchmove', handle3DPointer);
  cardVisual.addEventListener('mouseleave', reset3DPointer);
  cardVisual.addEventListener('pointerleave', reset3DPointer);
  cardVisual.addEventListener('mouseout', reset3DPointer);
  cardVisual.addEventListener('touchend', reset3DPointer);
  cardVisual.addEventListener('touchcancel', reset3DPointer);
}

  // Show modal
  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  // Attach 3D card mouse events after grid is populated
  setup3DCardGrid(grid);
}

// Attach to deck button
document.addEventListener("DOMContentLoaded", function () {
  const deckBtn = document.getElementById("deckButton");
  if (deckBtn) {
    deckBtn.addEventListener("click", function () {
      // Example cards array; replace with your data source
      showTradingCardModal([
        { title: "Internship at Scratch", image: "assets/trading cards/25.png", found: "true" },
        { title: "Eric Rosenbaum", image: "assets/trading cards/24.png", found: "true", shiny: "true"  },
        { title: "MEW", image: "assets/trading cards/43.png", found: "true", shiny: "true"  },
        { title: "Perseverance of an Engineer", image: "assets/trading cards/26.png", found: "true"  },
        { title: "Passion of an Artist", image: "assets/trading cards/27.png", found: "true"  },
        { title: "Curiosity of a Child", image: "assets/trading cards/28.png", found: "true"  },
        { title: "HTML", image: "assets/trading cards/13.png", found: "true" },
        { title: "CSS", image: "assets/trading cards/14.png", found: "true"  },
        { title: "JS", image: "assets/trading cards/15.png", found: "true" },
        { title: "Scratch Book", image: "assets/trading cards/33.png", found: "true"  },
        { title: "Visioneers", image: "assets/trading cards/36.png", found: "true"  },
        { title: "Visioneers alt", image: "assets/trading cards/37.png", found: "true", shiny: "true"  },
        { title: "Scratch Day Taiwan", image: "assets/trading cards/32.png", found: "true"  },
        { title: "Pizza Man", image: "assets/trading cards/34.png", found: "true", shiny: "true"  },
        { title: "Macaroni Mastermind", image: "assets/trading cards/35.png", found: "true" },
        { title: "Refactorman", image: "assets/trading cards/10.png", found: "true", shiny: "true"  },
        { title: "Cut", image: "assets/trading cards/11.png", found: "true", shiny: "true"  },
        { title: "Shadow Paste", image: "assets/trading cards/12.png", found: "true", shiny: "true"  },
        { title: "Matchbox isam2024", image: "assets/trading cards/40.png", found: "true"  },
        { title: "Matchbox merch 1", image: "assets/trading cards/41.png", found: "true", shiny: "true"  },
        { title: "Matchbox merch 2", image: "assets/trading cards/42.png", found: "true", shiny: "true"  },
        { title: "ScratchGO", image: "assets/trading cards/38.png", found: "true", shiny: "true"  },
        { title: "Matchbox", image: "assets/trading cards/39.png", found: "true", shiny: "true"  },
        { title: "Fireside Friday Refactorman", image: "assets/trading cards/9.png", found: "true" },
        { title: "Copy", image: "assets/trading cards/20.png", found: "true"  },
        { title: "Paste", image: "assets/trading cards/21.png", found: "true"  },
        { title: "Copy and Paste Truck", image: "assets/trading cards/22.png", found: "true" },
        { title: "Scrum Master", image: "assets/trading cards/23.png", found: "true"  },
        { title: "Sphagetti Code Monster", image: "assets/trading cards/17.png", found: "true"  },
        { title: "Tiny Bug", image: "assets/trading cards/16.png", found: "true" },
        { title: "Doctor Refactorman", image: "assets/trading cards/18.png", found: "true"  },
        { title: "Therapist Refactorman", image: "assets/trading cards/19.png", found: "true"  },
        { title: "Card 1", image: "assets/trading cards/28.png", found: "false" },
        { title: "Perseverance of an Engineer alt", image: "assets/trading cards/29.png", found: "true", shiny: "true"  },
        { title: "Passion of an Artist alt", image: "assets/trading cards/30.png", found: "true", shiny: "true"  },
        { title: "Curiosity of a Child alt", image: "assets/trading cards/31.png", found: "true", shiny: "true"  },
      ]);
    });
  }
});


// Attach 3D card mouse events to a grid element (only once)
function setup3DCardGrid(grid) {
  if (!grid || grid._has3DCardEvents) return;
  grid._has3DCardEvents = true;
  grid.addEventListener('mousemove', function (e) {
    const card = e.target.closest('.trading-card-modal-card');
    if (!card) return;
    if (card.classList.contains('not-found')) return; // Skip not found cards
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = (x - cx) / cx;
    const dy = (y - cy) / cy;
    const maxRotate = 5;
    const rotateY = dx * maxRotate;
    const rotateX = -dy * maxRotate;
    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
    card.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.07)';
    card.querySelector('s')?.style.setProperty('--angle', `${rotateY + 45}deg`);
    card.querySelector('s')?.style.setProperty('--s-o', `0.5`);
    card.querySelector('s')?.style.setProperty('--s-s', `400%`);
  });
  grid.addEventListener('mouseleave', function (e) {
    if (e.target.classList && e.target.classList.contains('trading-card-modal-card')) {
      e.target.style.transform = '';
      e.target.style.boxShadow = '';
    e.target.querySelector('s')?.style.setProperty('--angle', `45deg`);
    e.target.querySelector('s')?.style.setProperty('--s-o', `0.2`);
    e.target.querySelector('s')?.style.setProperty('--s-s', `100%`);
    }
  }, true);
  grid.addEventListener('mouseout', function (e) {
    if (e.target.classList && e.target.classList.contains('trading-card-modal-card')) {
      e.target.style.transform = '';
      e.target.style.boxShadow = '';
          e.target.querySelector('s')?.style.setProperty('--angle', `45deg`);
    e.target.querySelector('s')?.style.setProperty('--s-o', `0.2`);
    e.target.querySelector('s')?.style.setProperty('--s-s', `100%`);
    }
  }, true);
}

// Export for use in other scripts if needed
window.showTradingCardModal = showTradingCardModal;


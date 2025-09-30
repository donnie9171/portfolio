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
    cards.forEach(card => {
      const cardDiv = document.createElement('div');
      cardDiv.className = 'trading-card-modal-card';
      if(card.found === "false"){
        cardDiv.classList.add('not-found');
        cardDiv.innerHTML = `
            <div class="card-not-found-text">?</div>
        `;
      }else{
      cardDiv.innerHTML = `
        <img src="${card.image || ''}" alt="${card.title || 'Card Title'}"></img>
      `;
      }
      grid.appendChild(cardDiv);
    });
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
        { title: "Card 1", image: "assets/trading cards/25.png", found: "true"  },
        { title: "Card 2", image: "assets/trading cards/26.png", found: "true"  },
        { title: "Card 3", image: "assets/trading cards/27.png", found: "true"  },
        { title: "Card 1", image: "assets/trading cards/28.png", found: "false" },
        { title: "Card 2", image: "assets/trading cards/29.png", found: "false"  },
        { title: "Card 3", image: "assets/trading cards/30.png", found: "false"  },
        { title: "Card 2", image: "assets/trading cards/33.png", found: "true"  },
        { title: "Card 3", image: "assets/trading cards/34.png", found: "true"  },
        { title: "Card 1", image: "assets/trading cards/28.png", found: "false" },
        { title: "Card 2", image: "assets/trading cards/29.png", found: "false"  },
        { title: "Card 3", image: "assets/trading cards/30.png", found: "false"  },
        { title: "Card 1", image: "assets/trading cards/28.png", found: "false" },
        { title: "Card 1", image: "assets/trading cards/28.png", found: "true"  },
        { title: "Card 2", image: "assets/trading cards/29.png", found: "true"  },
        { title: "Card 3", image: "assets/trading cards/30.png", found: "true"  },
        { title: "Card 2", image: "assets/trading cards/29.png", found: "false"  },
        { title: "Card 3", image: "assets/trading cards/30.png", found: "false"  },
        { title: "Card 1", image: "assets/trading cards/28.png", found: "false" },
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
  });
  grid.addEventListener('mouseleave', function (e) {
    if (e.target.classList && e.target.classList.contains('trading-card-modal-card')) {
      e.target.style.transform = '';
      e.target.style.boxShadow = '';
    }
  }, true);
  grid.addEventListener('mouseout', function (e) {
    if (e.target.classList && e.target.classList.contains('trading-card-modal-card')) {
      e.target.style.transform = '';
      e.target.style.boxShadow = '';
    }
  }, true);
}

// Export for use in other scripts if needed
window.showTradingCardModal = showTradingCardModal;


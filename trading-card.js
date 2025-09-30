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
      cardDiv.innerHTML = `
        <h3>${card.title || 'Card Title'}</h3>
        <p>${card.description || ''}</p>
      `;
      grid.appendChild(cardDiv);
    });
  }

  // Show modal
  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

// Attach to deck button
document.addEventListener("DOMContentLoaded", function () {
  const deckBtn = document.getElementById("deckButton");
  if (deckBtn) {
    deckBtn.addEventListener("click", function () {
      // Example cards array; replace with your data source
      showTradingCardModal([
        { title: "Card 1", description: "This is the first card." },
        { title: "Card 2", description: "This is the second card." },
        { title: "Card 3", description: "This is the third card." },
        { title: "Card 1", description: "This is the first card." },
        { title: "Card 2", description: "This is the second card." },
        { title: "Card 3", description: "This is the third card." },
        { title: "Card 1", description: "This is the first card." },
        { title: "Card 2", description: "This is the second card." },
        { title: "Card 3", description: "This is the third card." },
        { title: "Card 1", description: "This is the first card." },
        { title: "Card 2", description: "This is the second card." },
        { title: "Card 3", description: "This is the third card." },
        { title: "Card 1", description: "This is the first card." },
        { title: "Card 2", description: "This is the second card." },
        { title: "Card 3", description: "This is the third card." },
        { title: "Card 1", description: "This is the first card." },
        { title: "Card 2", description: "This is the second card." },
        { title: "Card 3", description: "This is the third card." },
      ]);
    });
  }
});

// Export for use in other scripts if needed
window.showTradingCardModal = showTradingCardModal;

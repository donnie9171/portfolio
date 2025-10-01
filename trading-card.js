/**
 * Injects a modal with card content into the current page.
 * The modal is appended to the body and overlays all content.
 * Call this function to show the modal.
 */
function showTradingCardModal(cardNames = []) {
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
    document.body.classList?.remove("no-scroll");
    document.body.classList?.remove("modal-open");
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
        document.body?.classList.remove("no-scroll");
        document.body?.classList.remove("modal-open");
      }
    });

    // add 2 pointers for up and down if there are new cards out of view of the scroll view
    const upPointer = document.createElement('div');
    upPointer.className = 'trading-card-scroll-pointer up';
    upPointer.innerHTML = '<span class="new-triangle">▲</span> New!';
    gridContainer.appendChild(upPointer);

    const downPointer = document.createElement('div');
    downPointer.className = 'trading-card-scroll-pointer down';
    downPointer.innerHTML = '<span class="new-triangle">▼</span> New!';
    gridContainer.appendChild(downPointer);

    // Helper to check if any new cards are above or below the visible area
    function updateScrollPointers() {
      const newCards = getNewCards();
      const cardDivs = Array.from(grid.querySelectorAll('.trading-card-modal-card'));
      if (cardDivs.length === 0 || newCards.length === 0) {
        upPointer.style.display = 'none';
        downPointer.style.display = 'none';
        return;
      }
      const containerRect = gridContainer.getBoundingClientRect();
      let hasAbove = false, hasBelow = false;
      cardDivs.forEach(cardDiv => {
        const title = cardDiv.querySelector('img')?.alt;
        if (newCards.includes(title)) {
          const rect = cardDiv.getBoundingClientRect();
          if (rect.bottom < containerRect.top + 10) hasAbove = true;
          if (rect.top > containerRect.bottom - 10) hasBelow = true;
        }
      });
      upPointer.style.display = hasAbove ? 'flex' : 'none';
      downPointer.style.display = hasBelow ? 'flex' : 'none';
    }

    // Listen for scroll and update pointers
    gridContainer.addEventListener('scroll', updateScrollPointers);
    // Also update after grid is populated
    setTimeout(updateScrollPointers, 0);
    document.body.appendChild(modal);
  } else {
    content = modal.querySelector('.trading-card-modal-content');
    gridContainer = modal.querySelector('.trading-card-grid-container');
    grid = modal.querySelector('.trading-card-modal-grid');
    closeBtn = modal.querySelector('.trading-card-modal-close');
  }

  // Update cards content
  grid.innerHTML = '';

  // fetch card data based on cardNames and info in trading-cards.json
  let cards = [];
    fetch('trading-cards.json')
    .then(response => response.json())
    .then(data => {
        cards = data.map(card => ({
        ...card,
        found: cardNames.includes(card.title) ? "true" : "false"
        }));
        populateCardGrid();
    })
    .catch(error => {
        console.error('Error fetching trading cards data:', error);
        grid.innerHTML = `<div class=\"trading-card-modal-empty\">Error loading cards.</div>`;
    });


function populateCardGrid(){
if (cards.length === 0) {
    grid.innerHTML = `<div class="trading-card-modal-empty">No cards to display.</div>`;
  } else {
    grid.innerHTML = '';
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
        // Add badge if card is in newTradingCards
        const newCards = getNewCards();
        if (newCards.includes(card.title)) {
          const badge = document.createElement('div');
          badge.className = 'trading-card-deck-badge textvariant';
          badge.innerHTML = '<span>New!</span>';
          cardDiv.appendChild(badge);
        }
      }
      // Add click handler for detailed view
      cardDiv.addEventListener('click', function(e) {
        e.stopPropagation();
        if(card.found === "false") return; // Do nothing if not found
        if(getNewCards().includes(card.title)){
            // remove from new cards
            const updatedNewCards = getNewCards().filter(name => name !== card.title);
            setNewCards(updatedNewCards);
            updateDeckButtonBadge();
            // remove badge
            const badge = cardDiv.querySelector('.trading-card-deck-badge');
            if(badge) badge.remove();
        }
        showCardDetailModal(card);
      });
      grid.appendChild(cardDiv);
    });
    // Update scroll pointers immediately after rendering cards
    if (typeof updateScrollPointers === 'function') updateScrollPointers();
  }
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
      showTradingCardModal(getTradingCardStorage());
    });
    updateDeckButtonBadge();
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



function getTradingCardStorage(){
    const stored = localStorage.getItem('tradingCardCollection');
    return stored ? JSON.parse(stored) : [];
}

window.getTradingCardStorage = getTradingCardStorage;

function setTradingCardStorage(cardNamesArray){
    localStorage.setItem('tradingCardCollection', JSON.stringify(cardNamesArray));
}

window.setTradingCardStorage = setTradingCardStorage;

function getNewCards(){
    const stored = localStorage.getItem('newTradingCards');
    return stored ? JSON.parse(stored) : [];
}

function setNewCards(cardNamesArray){
    localStorage.setItem('newTradingCards', JSON.stringify(cardNamesArray));
}

window.setNewCards = setNewCards;

function notifyNewCard(cardNames) {
    // if there are more than one card, show "New cards found!" otherwise show "New card found!"
    setNewCards([...new Set([...getNewCards(), ...cardNames])]); // merge and dedupe
    setTradingCardStorage([...new Set([...getTradingCardStorage(), ...cardNames])]); // merge and dedupe
    if (cardNames.length === 0) return;
    const message = cardNames.length === 1 ? 'New card found!' : 'New cards found!';
    // Create notification element
    let notification = document.getElementById('tradingCardNotification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'tradingCardNotification';
        notification.className = 'trading-card-notification';
        document.body.appendChild(notification);
    }
    // Clear previous content
    notification.innerHTML = '';

    // Add message
    const msgDiv = document.createElement('div');
    msgDiv.textContent = message;
    msgDiv.style.marginBottom = '0.5rem';

    // Fetch card data and show thumbnails for new cards
    fetch('trading-cards.json')
      .then(response => response.json())
      .then(data => {
        const thumbsRow = document.createElement('div');
        thumbsRow.style.display = 'flex';
        thumbsRow.style.gap = '0.5rem';
        thumbsRow.style.justifyContent = 'center';

        cardNames.forEach(cardName => {
          const card = data.find(c => c.title === cardName);
          if (card && card.image) {
            const thumb = document.createElement('div');
            thumb.style.width = '60px';
            thumb.style.height = '84px';
            thumb.style.borderRadius = '5px';
            thumb.style.overflow = 'hidden';
            thumb.style.background = '#eee';
            thumb.style.display = 'flex';
            thumb.style.alignItems = 'center';
            thumb.style.justifyContent = 'center';
            const img = document.createElement('img');
            img.src = card.image;
            img.alt = card.title;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.pointerEvents = 'none';
            img.style.userSelect = 'none';
            thumb.appendChild(img);
            thumbsRow.appendChild(thumb);
          }
        });

        notification.appendChild(msgDiv);
        notification.appendChild(thumbsRow);

        notification.addEventListener('click', () => {
            showTradingCardModal(getTradingCardStorage());
            notification.classList.remove('show');
        })

        // dismiss notification if swipe up
        let startY = null;
        notification.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });
        notification.addEventListener('touchmove', (e) => {
            if (!startY) return;
            let diffY = e.touches[0].clientY - startY;
            if (diffY < -30) { // swipe up
                if (!notification.classList.contains('show')) return; // already dismissed
                notification.classList.remove('show');
                animateThumbsToDeck(thumbsRow);
                startY = null;
            }
        });
        notification.addEventListener('touchend', () => {
            startY = null;
        });

        notification.classList.add('show');
        // Hide after 3 seconds
        setTimeout(() => {
            if (!notification.classList.contains('show')) return; // already dismissed
            notification.classList.remove('show');
            animateThumbsToDeck(thumbsRow);
        }, 3000);
      });
}
window.notifyNewCard = notifyNewCard;


function animateThumbsToDeck(thumbsRow) {
    const deckBtn = document.getElementById('deckButton');
    if (!deckBtn) return;

    // Get deck button position
    const deckRect = deckBtn.getBoundingClientRect();
    const deckX = deckRect.left + deckRect.width / 2;
    const deckY = deckRect.top + deckRect.height / 2;

    // For each thumb in the notification
    thumbsRow.querySelectorAll('div').forEach(thumb => {
        const img = thumb.querySelector('img');
        if (!img) return;

        // hide the original thumb
        thumb.style.visibility = 'hidden';

        // Get thumb position
        const thumbRect = img.getBoundingClientRect();
        const startX = thumbRect.left + thumbRect.width / 2;
        const startY = thumbRect.top + thumbRect.height / 2;

        // Create a floating clone
        const floating = img.cloneNode(true);
        floating.style.position = 'fixed';
        floating.style.left = `${startX - thumbRect.width / 2}px`;
        floating.style.top = `${startY - thumbRect.height / 2}px`;
        floating.style.width = `${thumbRect.width}px`;
        floating.style.height = `${thumbRect.height}px`;
        floating.style.zIndex = 99999;
        floating.style.pointerEvents = 'none';
        floating.style.borderRadius = '6px';
        floating.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
        floating.style.background = '#eee';
        floating.classList.add('trading-card-floating-thumb');

        document.body.appendChild(floating);

        // Animate to deck button
        requestAnimationFrame(() => {
            const dx = deckX - startX;
            const dy = deckY - startY;
            floating.style.transform = `translate(${dx}px, ${dy}px)`;
        });        

        // Remove after animation
        setTimeout(() => {
            floating.remove();
        }, 800);


        // animate the deck icon to pulse (spring effect) when the cards reach it
        deckBtn.classList.add('trading-card-deck-pulse');
        setTimeout(() => {
        deckBtn.classList.remove('trading-card-deck-pulse');
        }, 850);
        });

        updateDeckButtonBadge();
}

function updateDeckButtonBadge(){
    const deckBtn = document.getElementById('deckButton');
    if (!deckBtn) return;
    // add a new card icon to the deck button (a red circle with a ! sign)
    let deckBadge = document.getElementById('deckButtonBadge');
    if (!deckBadge) {
      deckBadge = document.createElement('div');
      deckBadge.id = 'deckButtonBadge';
      deckBadge.className = 'trading-card-deck-badge';
      deckBadge.innerHTML = '<span>!</span>';
      deckBtn.appendChild(deckBadge);
    }
    if(getNewCards().length === 0){
        deckBadge.style.display = 'none';
        return;
    }else{
        deckBadge.style.display = 'flex';
    }
}
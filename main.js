const sideLength = 200; // Length of the cube side in pixels
function getCubeSideLength() {
  const cube = document.querySelector('.cube');
  if (!cube) return 200;
  const style = getComputedStyle(cube);
  const size = style.getPropertyValue('--cubeSize');
  if (size) {
    // Remove 'px' and parse as float
    return parseFloat(size);
  }
  return 200;
}

function verticalSideLengthOnScreen(rotationX) {
    const radiansX = rotationX * (Math.PI / 180);
    return getCubeSideLength() * Math.abs(Math.cos(radiansX));
}

function artSideArea(rotationX) {
    const verticalLength = verticalSideLengthOnScreen(rotationX);
    const bounds = document.getElementById('artSide').getBoundingClientRect();
    return verticalLength * bounds.width;
}

function techSideArea(rotationX) {
    const verticalLength = verticalSideLengthOnScreen(rotationX);
    const bounds = document.getElementById('techSide').getBoundingClientRect();
    return verticalLength * bounds.width;
}

function eduSideArea(rotationX) {
    const verticalLength = verticalSideLengthOnScreen(rotationX);
    const edubounds = document.getElementById('eduSide').getBoundingClientRect();
    const artbounds = document.getElementById('artSide').getBoundingClientRect();
    const techbounds = document.getElementById('techSide').getBoundingClientRect();
    const w = edubounds.width;
    const h = edubounds.height;
    const a1 = artbounds.height - verticalLength;
    const a2 = artbounds.width;
    const b1 = techbounds.height - verticalLength;
    const b2 = techbounds.width;
    return w*h-(a1*a2 + b1*b2);
}

function getSideAreas(rotationX) {
    const artArea = artSideArea(rotationX);
    const techArea = techSideArea(rotationX);
    const eduArea = eduSideArea(rotationX);
    const totalArea = artArea + techArea + eduArea;
    return {
        art: artArea / totalArea,
        tech: techArea / totalArea,
        edu: eduArea / totalArea
    };
}

function updateSideAreasBar(rotationX) {
  if (!window._lastBarUpdate) window._lastBarUpdate = 0;
  const now = performance.now();
  if (now - window._lastBarUpdate < 100) return;
  window._lastBarUpdate = now;
  const sideAreas = getSideAreas(rotationX);
  const techDiv = document.getElementById('techSlider');
  const artDiv = document.getElementById('artSlider');
  const eduDiv = document.getElementById('eduSlider');
  if (techDiv && artDiv && eduDiv) {
    techDiv.style.width = `${(sideAreas.tech * 100)}%`;
    artDiv.style.width = `${(sideAreas.art * 100)}%`;
    eduDiv.style.width = `${(sideAreas.edu * 100)}%`;
  }
}

// Make rotationX and rotationY public
let rotationX = 0;
let rotationY = 0;
let didUserDragCube = false;
let updateId = 0;

// Store loaded projects globally
let loadedProjects = [];

function getCurrentCubeRatio() {
  // Get the current side area ratios (tech, art, edu) based on rotationX
  const areas = getSideAreas(rotationX);
  // Convert to [tech, art, edu] array, normalized to 100
  return [
    areas.tech * 100,
    areas.art * 100,
    areas.edu * 100
  ];
}

function getDnaSimilarity(dna, ratio) {
  // Euclidean distance (lower is more similar)
  return Math.sqrt(
    Math.pow(dna[0] - ratio[0], 2) +
    Math.pow(dna[1] - ratio[1], 2) +
    Math.pow(dna[2] - ratio[2], 2)
  );
}

function updateCardRankOrder() {
  if(!didUserDragCube) return; // Only update if user has interacted
  didUserDragCube = false;    // Reset flag
  updateId++;
  const thisUpdate = updateId;
  updatingCards = true;
  pendingCardUpdate = false;
  const container = document.querySelector('.card-container');
  if (!container || loadedProjects.length === 0) return;
  const currentRatio = getCurrentCubeRatio();
  // Sort projects by similarity (lowest distance first)
  const sorted = loadedProjects.slice().sort((a, b) => {
    const simA = getDnaSimilarity(a.dna, currentRatio);
    const simB = getDnaSimilarity(b.dna, currentRatio);
    return simA - simB;
  });
  // Fade out all cards
  const cards = Array.from(container.children);
  cards.forEach(card => card.classList.add('fade-out'));

    container.innerHTML = '';
    sorted.forEach((project, idx) => {
      const total = project.dna.reduce((a, b) => a + b, 0) || 1;
      const techPercent = (project.dna[0] / total) * 100;
      const artPercent = (project.dna[1] / total) * 100;
      const eduPercent = (project.dna[2] / total) * 100;
      const card = document.createElement('div');
      card.className = 'card';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.95)';
      card.innerHTML = `
        <div class="card-dna-bar">
          <div class="card-dna-segment tech" style="width: ${techPercent}%;"></div>
          <div class="card-dna-segment art" style="width: ${artPercent}%;"></div>
          <div class="card-dna-segment edu" style="width: ${eduPercent}%;"></div>
        </div>
        <a href="${project.page}" class="card-link">
          <img src="${project.thumbnail}" alt="${project.title}" class="card-thumb" loading="lazy">
          <div class="card-info">
            <p class="card-title">${project.title}</p>
            <p class="card-desc">${project.description}</p>
          </div>
        </a>
      `;
      setTimeout(() => {
        if (thisUpdate !== updateId) return;
        card.style.transition = 'opacity 0.4s, transform 0.4s';
        container.appendChild(card);
        requestAnimationFrame(() => {
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        });
      }, idx * 400); // Delay per rank
    });
    // Wait for all fade-ins to finish before allowing another update
    setTimeout(() => {
      if (thisUpdate !== updateId) return; // Abort if a newer update started
      updatingCards = false;
    }, sorted.length * 400 + 400);
}

document.addEventListener('DOMContentLoaded', function() {
  // Animate radial spin text
  const spinTextCircle = document.querySelector('.spin-text-circle svg');
  let spinAngle = 0;
  function animateSpinText() {
    spinAngle += 0.2;
    if (spinTextCircle) {
      spinTextCircle.style.transform = `rotate(${spinAngle}deg)`;
    }
    requestAnimationFrame(animateSpinText);
  }
  animateSpinText();
  // Dynamically load and render project cards
  fetch('project_list.json')
    .then(res => res.json())
    .then(projects => {
      loadedProjects = projects; // Store globally
      const container = document.querySelector('.card-container');
      if (container) {
        container.innerHTML = '';
        projects.forEach((project, idx) => {
          const total = project.dna.reduce((a, b) => a + b, 0) || 1;
          const techPercent = (project.dna[0] / total) * 100;
          const artPercent = (project.dna[1] / total) * 100;
          const eduPercent = (project.dna[2] / total) * 100;
          const card = document.createElement('div');
          card.className = 'card';
          card.style.order = idx;
          card.innerHTML = `
            <div class="card-dna-bar">
              <div class="card-dna-segment tech" style="width: ${techPercent}%;"></div>
              <div class="card-dna-segment art" style="width: ${artPercent}%;"></div>
              <div class="card-dna-segment edu" style="width: ${eduPercent}%;"></div>
            </div>
            <a href="${project.page}" class="card-link">
              <img src="${project.thumbnail}" alt="${project.title}" class="card-thumb" loading="lazy">
              <div class="card-info">
                <p class="card-title">${project.title}</p>
                <p class="card-desc">${project.description}</p>
              </div>
            </a>
          `;
          container.appendChild(card);
        });
      }
      // Do not call updateCardRankOrder on initial load
    });
  function triggerDizzy() {
    shakeAccumulator = 0;
    isDizzy = true;
    setTimeout(() => {
      isDizzy = false;
      setTransform();
    }, 1800);
  }
  // Hamburger menu toggle with X animation
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  const hamburger = document.querySelector('.hamburger');
  if (navToggle && navList && hamburger) {
    navToggle.addEventListener('click', function() {
      navList.classList.toggle('open');
      hamburger.classList.toggle('open');
    });
  }
  // Dizzy threshold and state
  const DIZZY_THRESHOLD = 30;
  let shakeAccumulator = 0;
  let isDizzy = false;
  // Pointer-based cube rotation with inertia
  const cube = document.querySelector('.cube');
  const pupilLeft = document.querySelector('.pupil-left');
  const pupilRight = document.querySelector('.pupil-right');
  if (cube) {
    let rect = null;
    // Set random starting rotation
    let velocityX = -20 + Math.random() * 5;
    let velocityY = 20 + Math.random() * 5;
    let spinning = false;
    shakeAccumulator = 0;
    function setTransform() {
      cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
      // Animate pupils based on velocity (rattle effect)
      if (pupilLeft && pupilRight) {
        // Map velocity to pupil offset (max 8px from center)
        const maxOffset = 20;
        // Add a little randomness for rattle
        const shakeX = velocityY * -2;
        const shakeY = velocityX * 2;
        const offsetX = Math.max(-maxOffset, Math.min(maxOffset, shakeX));
        const offsetY = Math.max(-maxOffset, Math.min(maxOffset, shakeY));
        pupilLeft.setAttribute('cx', 15 + offsetX);
        pupilLeft.setAttribute('cy', 15 + offsetY);
        pupilRight.setAttribute('cx', 45 + offsetX);
        pupilRight.setAttribute('cy', 15 + offsetY);
      }
        // Check for dizzy effect
        if (isDizzy) {
          // Dizzy: spin pupils in circles
          const t = performance.now() / 200;
          pupilLeft.setAttribute('cx', 15 + Math.cos(t) * 7);
          pupilLeft.setAttribute('cy', 15 + Math.sin(t) * 7);
          pupilRight.setAttribute('cx', 45 + Math.cos(t + 1) * 7);
          pupilRight.setAttribute('cy', 15 + Math.sin(t + 1) * 7);
        }
    }

    // Set initial transform and start spinning on page load
    setTransform();
    spinning = true;
    requestAnimationFrame(spinCube);

    function spinCube(ts) {
      if (!spinning) return;
      // Apply inertia
      rotationY += velocityY * 0.1;
      rotationX += velocityX * 0.1;
      // Accumulate shake
      shakeAccumulator += Math.abs(velocityX) + Math.abs(velocityY);
      setTransform();
      // Gradually slow down
      velocityX *= 0.95;
      velocityY *= 0.95;
      if (Math.abs(velocityX) < 1 && Math.abs(velocityY) < 1) {
        updateCardRankOrder();
      }
      if (Math.abs(velocityX) > 0.01 || Math.abs(velocityY) > 0.01) {
        requestAnimationFrame(spinCube);
      } else {
        spinning = false;
        shakeAccumulator = 0;
      }
      // Update side-areas bar
      updateSideAreasBar(rotationX);
    }

    let pointerActive = false;

    const cubeHitbox = document.querySelector('.cubehitbox');

    cubeHitbox.addEventListener('pointerdown', function(e) {
      e.preventDefault();
      pointerActive = true;
      didUserDragCube = true;
      cube.classList.add('grabbing');
      spinning = false;
      velocityX = 0;
      velocityY = 0;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      shakeAccumulator = 0;
    });

    cubeHitbox.addEventListener('pointermove', function(e) {
      if (e.buttons === 0 && !pointerActive) return;
      e.preventDefault();
      if (lastPointerX !== null && lastPointerY !== null) {
        const dx = e.clientX - lastPointerX;
        const dy = e.clientY - lastPointerY;
        const sensitivity = 0.4;
        rotationY += dx * sensitivity;
        rotationX -= dy * sensitivity;
        velocityY = dx * sensitivity;
        velocityX = -dy * sensitivity;
        setTransform();
      }
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;

        // Initial bar update
        updateSideAreasBar(rotationX);

    });

    cubeHitbox.addEventListener('pointerup', function(e) {
      e.preventDefault();
      pointerActive = false;
      cube.classList.remove('grabbing');
      // Check for dizzy on release
      if (shakeAccumulator > DIZZY_THRESHOLD) {
        triggerDizzy();
      }
      spinning = true;
      requestAnimationFrame(spinCube);
    });

    cubeHitbox.addEventListener('pointerleave', function(e) {
      e.preventDefault();
      pointerActive = false;
      cube.classList.remove('grabbing');
      // Check for dizzy on leave
      if (shakeAccumulator > DIZZY_THRESHOLD) {
        triggerDizzy();
      }
      spinning = true;
      requestAnimationFrame(spinCube);
      rect = null;
    });
        // Add click handlers for side-area sliders to rotate cube
  function rotateCubeTo(targetX, targetY) {
    // Calculate velocity needed to reach target rotation
    // (simple proportional velocity, can be tuned)
    const velocityScale = 0.25;
    velocityX = (targetX - rotationX) * velocityScale;
    velocityY = (targetY - rotationY) * velocityScale;
    spinning = true;
    requestAnimationFrame(spinCube);
  }

  document.getElementById('techSlider').onclick = function() {
    didUserDragCube = true;
    rotateCubeTo(0, 0);
  };
  document.getElementById('artSlider').onclick = function() {
    didUserDragCube = true;
    rotateCubeTo(0, 90);
  };
  document.getElementById('eduSlider').onclick = function() {
    didUserDragCube = true;
    rotateCubeTo(-90, 0);
  };
  }
});

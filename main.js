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

document.addEventListener('DOMContentLoaded', function() {
  // Dynamically load and render project cards
  fetch('project_list.json')
    .then(res => res.json())
    .then(projects => {
      const container = document.querySelector('.card-container');
      if (!container) return;
      container.innerHTML = '';
      projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'card';
        // Calculate total for normalization
        const total = project.dna.reduce((a, b) => a + b, 0) || 1;
        const techPercent = (project.dna[0] / total) * 100;
        const artPercent = (project.dna[1] / total) * 100;
        const eduPercent = (project.dna[2] / total) * 100;
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
    let rotationX = 0;
    let rotationY = 0;
    // Set slight random starting velocity
    let velocityX = -20 + Math.random() * 5;
    let velocityY = 20 + Math.random() * 5;
    let lastX = 0;
    let lastY = 0;
    let spinning = false;
    let lastTime = 0;

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
  }
});

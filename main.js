document.addEventListener('DOMContentLoaded', function () {
  const loadingDiv = document.querySelector('.loading');
  if (loadingDiv) {
    setTimeout(() => {
      loadingDiv.style.opacity = '0';
    }, 50);
    setTimeout(() => {
      loadingDiv.style.display = 'none';
    }, 600);
  }
});

document.addEventListener('DOMContentLoaded', function () {
  // Check if intro has already played this session
  const body = document.body;
  if (!sessionStorage.getItem('introPlayed')) {
    setTimeout(() => {
      window.scrollTo(0, 0); // Ensure scroll is at top before adding class
      body.classList.add('initial');
    }, 0); // Next tick
  }
  sessionStorage.setItem('lastPage', window.location.href);
});

// Animate .cube-drag-hint along a sine wave
document.addEventListener('DOMContentLoaded', function () {
  const dragHint = document.querySelector('.cube-drag-hint');
  if (!dragHint) return;
  let start = null;
  const amplitudeX = 40; // px left/right
  const amplitudeY = 40; // px up/down
  const period = 8000; // ms for a full cycle
  function animateDragHint(ts) {
    if (!start) start = ts;
    const elapsed = (ts - start) % period;
    const theta = (elapsed / period) * 2 * Math.PI;
    const x = Math.sin(theta) * amplitudeX;
    const y = Math.cos(theta) * amplitudeY;
    dragHint.style.transform = `translateX(calc(-50% + ${x}px)) translateY(calc(-50% + ${y}px))`;
    requestAnimationFrame(animateDragHint);
  }
  requestAnimationFrame(animateDragHint);
});
// 3D card tilt effect on hover
document.addEventListener('DOMContentLoaded', function () {
  const cardContainer = document.querySelector('.card-container');
  if (!cardContainer) return;
  cardContainer.addEventListener('mousemove', function (e) {
    const cards = cardContainer.querySelectorAll('.card');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      if (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      ) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const px = (x / rect.width - 0.5) * 2; // -1 to 1
        const py = (y / rect.height - 0.5) * 2;
        const tiltX = (-py * 2.5).toFixed(2) + 'deg';
        const tiltY = (px * 1.5).toFixed(2) + 'deg';
        card.style.setProperty('--card-tilt-x', tiltX);
        card.style.setProperty('--card-tilt-y', tiltY);
      } else {
        card.style.setProperty('--card-tilt-x', '0deg');
        card.style.setProperty('--card-tilt-y', '0deg');
      }
    });
  });
  cardContainer.addEventListener('mouseleave', function () {
    const cards = cardContainer.querySelectorAll('.card');
    cards.forEach(card => {
      card.style.setProperty('--card-tilt-x', '0deg');
      card.style.setProperty('--card-tilt-y', '0deg');
    });
  });
});
const sideLength = 200; // Length of the cube side in pixels
function getCubeSideLength() {
  const cube = document.querySelector(".cube");
  if (!cube) return 200;
  const style = getComputedStyle(cube);
  const size = style.getPropertyValue("--cubeSize");
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
  const bounds = document.getElementById("artSide").getBoundingClientRect();
  return verticalLength * bounds.width;
}

function techSideArea(rotationX) {
  const verticalLength = verticalSideLengthOnScreen(rotationX);
  const bounds = document.getElementById("techSide").getBoundingClientRect();
  return verticalLength * bounds.width;
}

function eduSideArea(rotationX) {
  const verticalLength = verticalSideLengthOnScreen(rotationX);
  const edubounds = document.getElementById("eduSide").getBoundingClientRect();
  const artbounds = document.getElementById("artSide").getBoundingClientRect();
  const techbounds = document
    .getElementById("techSide")
    .getBoundingClientRect();
  const w = edubounds.width;
  const h = edubounds.height;
  const a1 = artbounds.height - verticalLength;
  const a2 = artbounds.width;
  const b1 = techbounds.height - verticalLength;
  const b2 = techbounds.width;
  return w * h - (a1 * a2 + b1 * b2);
}

function getSideAreas(rotationX) {
  const artArea = artSideArea(rotationX);
  const techArea = techSideArea(rotationX);
  const eduArea = eduSideArea(rotationX);
  const totalArea = artArea + techArea + eduArea;
  return {
    art: artArea / totalArea,
    tech: techArea / totalArea,
    edu: eduArea / totalArea,
  };
}

function updateSideAreasBar(rotationX) {
  if (!window._lastBarUpdate) window._lastBarUpdate = 0;
  const now = performance.now();
  if (now - window._lastBarUpdate < 100) return;
  window._lastBarUpdate = now;
  const sideAreas = getSideAreas(rotationX);
  const techDiv = document.getElementById("techSlider");
  const artDiv = document.getElementById("artSlider");
  const eduDiv = document.getElementById("eduSlider");
  if (techDiv && artDiv && eduDiv) {
    techDiv.style.width = `${sideAreas.tech * 100}%`;
    artDiv.style.width = `${sideAreas.art * 100}%`;
    eduDiv.style.width = `${sideAreas.edu * 100}%`;
  }
}

// Make rotationX and rotationY public
let rotationX = -30;
let rotationY = 45;
let didUserDragCube = false;
let updateId = 0;
let initialCubeIdleRotation = true;
let idleStartTime = null;
let showAllProjects = false;

const rotationRenderThreshold = 1; // degrees

let oldRotationX = rotationX;
let oldRotationY = rotationY;

// Store loaded projects globally
let loadedProjects = [];

function getCurrentCubeRatio() {
  // Get the current side area ratios (tech, art, edu) based on rotationX
  const areas = getSideAreas(rotationX);
  // Convert to [tech, art, edu] array, normalized to 100
  return [areas.tech * 100, areas.art * 100, areas.edu * 100];
}

function getDnaSimilarity(dna, ratio) {
  // Euclidean distance (lower is more similar)
  return Math.sqrt(
    Math.pow(dna[0] - ratio[0], 2) +
      Math.pow(dna[1] - ratio[1], 2) +
      Math.pow(dna[2] - ratio[2], 2)
  );
}

function spawnProjectCards(projects, thisUpdate){
  const container = document.querySelector(".card-container");
  container.innerHTML = "";
  projects.forEach((project, idx) => {
    const total = project.dna.reduce((a, b) => a + b, 0) || 1;
    const techPercent = (project.dna[0] / total) * 100;
    const artPercent = (project.dna[1] / total) * 100;
    const eduPercent = (project.dna[2] / total) * 100;
    const card = document.createElement("div");
    card.className = "card";
    card.style.opacity = "0";
    card.style.transform = "scale(0.95)";
    card.innerHTML = `
        <div class="card-dna-bar">
          <div class="card-dna-segment tech" style="width: ${techPercent}%;"></div>
          <div class="card-dna-segment art" style="width: ${artPercent}%;"></div>
          <div class="card-dna-segment edu" style="width: ${eduPercent}%;"></div>
        </div>
        <a href="${project.page}" class="card-link">
          <img src="${project.thumbnail}" alt="${project.title}" class="card-thumb" loading="${project.highlight ? 'eager' : 'lazy'}">
          <div class="card-info">
            <p class="card-title">${project.title}</p>
            <p class="card-desc">${project.description}</p>
            <div class="card-keywords">${project.keywords.map(kw => `<span class='keyword-tag'>${kw}</span>`).join('')}</div>
            <button class="view-project-button">View Project</button>
          </div>
        </a>
      `;
    if(thisUpdate === null){
      container.appendChild(card);
        requestAnimationFrame(() => {
          card.style.opacity = "1";
          card.style.transform = "scale(1)";
        });
    }else{
      // Staggered fade-in animation
      setTimeout(() => {
        if (thisUpdate !== updateId) return;
        container.appendChild(card);
        requestAnimationFrame(() => {
          card.style.opacity = "1";
          card.style.transform = "scale(1)";
        });
      }, idx * 400); // Delay per rank
    }
  });
}

function updateCardRankOrder() {
  if (!didUserDragCube) return; // Only update if user has interacted
  didUserDragCube = false; // Reset flag
  updateId++;
  const thisUpdate = updateId;
  updatingCards = true;
  pendingCardUpdate = false;
  const container = document.querySelector(".card-container");
  const showAllMessage = document.querySelector(".show-all-message");
  if (showAllMessage) {
    showAllMessage.classList.add("hidden");
  }
  if (!container || loadedProjects.length === 0) return;
  const currentRatio = getCurrentCubeRatio();
  // Filter projects if showAllProjects is false
  let filteredProjects = showAllProjects
    ? loadedProjects.slice()
    : loadedProjects.filter(p => p.highlight);
  // Sort projects by similarity (lowest distance first)
  const sorted = filteredProjects.sort((a, b) => {
    const simA = getDnaSimilarity(a.dna, currentRatio);
    const simB = getDnaSimilarity(b.dna, currentRatio);
    return simA - simB;
  });

  spawnProjectCards(sorted, thisUpdate);

  // Wait for all fade-ins to finish before allowing another update
  setTimeout(() => {
    if (thisUpdate !== updateId) return; // Abort if a newer update started
    updatingCards = false;
    // reset visibility of end message
    if (showAllMessage && !showAllProjects) {
      showAllMessage.classList.remove("hidden");
    }
  }, sorted.length * 400 + 400);
}

document.addEventListener("DOMContentLoaded", function () {
  // Idle cube animation before user interacts
  function idleCubeLoop(ts) {
    if (!initialCubeIdleRotation) return;
    if (!idleStartTime) idleStartTime = ts;
    const t = (ts - idleStartTime) / 1000;
    rotationX = -30 + Math.sin(t) * 15 - 7.5;
    rotationY = 45 + Math.cos(t) * 15 - 7.5;
    setTransform();
    updateSideAreasBar(rotationX);
    requestAnimationFrame(idleCubeLoop);
  }
  requestAnimationFrame(idleCubeLoop);
  // Animate radial spin text
  const spinTextCircle = document.querySelector(".spin-text-circle svg");
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
  fetch("project_list.json")
    .then((res) => res.json())
    .then((projects) => {
      loadedProjects = projects; // Store globally
      const container = document.querySelector(".card-container");
      if (container) {
        container.innerHTML = "";
        let filteredProjects = showAllProjects
          ? projects.slice()
          : projects.filter(p => p.highlight);
        spawnProjectCards(filteredProjects, null);
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
  // Dizzy threshold and state
  const DIZZY_THRESHOLD = 30;
  let shakeAccumulator = 0;
  let isDizzy = false;
  // Pointer-based cube rotation with inertia
  const cube = document.querySelector(".cube");
  const pupilLeft = document.querySelector(".pupil-left");
  const pupilRight = document.querySelector(".pupil-right");
  if (!cube) return;
  let rect = null;
  // Set random starting rotation
  let velocityX = 0;
  let velocityY = 0;
  let spinning = false;
  shakeAccumulator = 0;
  function setTransform() {
    rotationX = Math.max(-90, Math.min(90, rotationX));
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
      pupilLeft.setAttribute("cx", 15 + offsetX);
      pupilLeft.setAttribute("cy", 15 + offsetY);
      pupilRight.setAttribute("cx", 45 + offsetX);
      pupilRight.setAttribute("cy", 15 + offsetY);
    }
    // Check for dizzy effect
    if (isDizzy) {
      // Dizzy: spin pupils in circles
      const t = performance.now() / 200;
      pupilLeft.setAttribute("cx", 15 + Math.cos(t) * 7);
      pupilLeft.setAttribute("cy", 15 + Math.sin(t) * 7);
      pupilRight.setAttribute("cx", 45 + Math.cos(t + 1) * 7);
      pupilRight.setAttribute("cy", 15 + Math.sin(t + 1) * 7);
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
    rotationX = Math.max(-90, Math.min(90, rotationX));
    // Accumulate shake
    shakeAccumulator += Math.abs(velocityX) + Math.abs(velocityY);
    setTransform();
    // Gradually slow down
    velocityX *= 0.95;
    velocityY *= 0.95;
if (
  (Math.abs(rotationX - oldRotationX) > rotationRenderThreshold ||
   Math.abs(rotationY - oldRotationY) > rotationRenderThreshold) &&
  Math.abs(velocityX) < 1 && Math.abs(velocityY) < 1
) {
  updateCardRankOrder();
  oldRotationX = rotationX;
  oldRotationY = rotationY;
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

  const cubeHitbox = document.querySelector(".cubehitbox");

  cubeHitbox.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    pointerActive = true;
    didUserDragCube = true;
    initialCubeIdleRotation = false; // Stop idle loop on first interaction
    cube.classList.add("grabbing");
    const dragHint = document.querySelector('.cube-drag-hint');
    dragHint?.classList.add('hidden');
    spinning = false;
    velocityX = 0;
    velocityY = 0;
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
    shakeAccumulator = 0;
  });

  cubeHitbox.addEventListener("pointermove", function (e) {
    if (e.buttons === 0 && !pointerActive) return;
    e.preventDefault();
    if (lastPointerX !== null && lastPointerY !== null) {
      const dx = e.clientX - lastPointerX;
      const dy = e.clientY - lastPointerY;
      const sensitivity = 0.4;
      rotationY += dx * sensitivity;
      rotationX -= dy * sensitivity;
      rotationX = Math.max(-90, Math.min(90, rotationX));
      velocityY = dx * sensitivity;
      velocityX = -dy * sensitivity;
      setTransform();
    }
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;

    // Initial bar update
    updateSideAreasBar(rotationX);
  });

  cubeHitbox.addEventListener("pointerup", function (e) {
    e.preventDefault();
    if(didUserDragCube){
    const body = document.querySelector('body');
    body?.classList.remove("initial");
    sessionStorage.setItem('introPlayed', 'true');
    }
    pointerActive = false;
    cube.classList.remove("grabbing");
    // Check for dizzy on release
    if (shakeAccumulator > DIZZY_THRESHOLD) {
      triggerDizzy();
    }
    spinning = true;
    requestAnimationFrame(spinCube);
  });

  cubeHitbox.addEventListener("pointerleave", function (e) {
    e.preventDefault();
    if(didUserDragCube){
    const body = document.querySelector('body');
    body?.classList.remove("initial");
    sessionStorage.setItem('introPlayed', 'true');
    }
    pointerActive = false;
    cube.classList.remove("grabbing");
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
    targetX = Math.max(-90, Math.min(90, targetX));
    velocityX = (targetX - rotationX) * velocityScale;
    velocityY = (targetY - rotationY) * velocityScale;
    spinning = true;
    requestAnimationFrame(spinCube);
  }

  document.getElementById("techSlider").onclick = function () {
    didUserDragCube = true;
    initialCubeIdleRotation = false;
    rotateCubeTo(0, 0);
  };
  document.getElementById("artSlider").onclick = function () {
    didUserDragCube = true;
    initialCubeIdleRotation = false;
    rotateCubeTo(0, 90);
  };
  document.getElementById("eduSlider").onclick = function () {
    didUserDragCube = true;
    initialCubeIdleRotation = false;
    rotateCubeTo(-90, 0);
  };
  document.querySelector(".show-all-btn").onclick = function () {
    showAllProjects = true;
    // spawn in the remaining projects
    spawnProjectCards(loadedProjects, null);
    const showAllMessage = document.querySelector(".show-all-message");
    if (showAllMessage) {
      showAllMessage.classList.add("hidden");
    }
  }
});

// Add onclick to lockfacebuttons to increment/decrement and loop 0-9
document.addEventListener('DOMContentLoaded', function () {
  // Use variables to store the current value for each lock input
  const lockfaceValues = [0, 0, 0, 0];

  for (let i = 1; i <= 4; i++) {
    const upBtn = document.getElementById(`lockfaceButton${(i - 1) * 2 + 1}`);
    const downBtn = document.getElementById(`lockfaceButton${(i - 1) * 2 + 2}`);
    const inputSpan = document.getElementById(`lockfaceInput${i}`);

    // Initialize display
    if (inputSpan) inputSpan.textContent = lockfaceValues[i - 1];

    if (upBtn && inputSpan) {
      upBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        lockfaceValues[i - 1] = lockfaceValues[i - 1] < 9 ? lockfaceValues[i - 1] + 1 : 0;
        inputSpan.textContent = lockfaceValues[i - 1];
        checkLockfaceCode(lockfaceValues);
      });
    }
    if (downBtn && inputSpan) {
      downBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        lockfaceValues[i - 1] = lockfaceValues[i - 1] > 0 ? lockfaceValues[i - 1] - 1 : 9;
        inputSpan.textContent = lockfaceValues[i - 1];
        checkLockfaceCode(lockfaceValues);
      });
    }
  }
});

function checkLockfaceCode(inputCode) {
  const correctCode = [9, 1, 7, 1];
  if (
    inputCode.length !== correctCode.length ||
    !inputCode.every((val, idx) => val === correctCode[idx])
  ) return;

  window.notifyNewCard(["Perseverance of an Engineer alt","Passion of an Artist alt","Curiosity of a Child alt"]);
}

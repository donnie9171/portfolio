document.addEventListener('DOMContentLoaded', function() {
  // Pointer-based cube rotation with inertia
  const cube = document.querySelector('.cube');
  if (cube) {
    let rect = null;
    // Set random starting rotation
    let rotationX = 0;
    let rotationY = 0;
    // Set slight random starting velocity
    let velocityX = -10 + Math.random() * 5;
    let velocityY = 20 + Math.random() * 5;
    let lastX = 0;
    let lastY = 0;
    let spinning = false;
    let lastTime = 0;

    function setTransform() {
      cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
    }

    // Set initial transform and start spinning on page load
    setTransform();
    spinning = true;
    requestAnimationFrame(spinCube);


    function updateRotation(e) {
      if (!rect) rect = cube.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const percentX = (x / rect.width - 0.5) * 2;
      const percentY = (y / rect.height - 0.5) * 2;
      // Calculate velocity based on pointer movement
      velocityY = (percentX * 45 - rotationY);
      velocityX = (-percentY * 45 - rotationX);
      rotationY = percentX * 45;
      rotationX = -percentY * 45;
      setTransform();
      lastX = percentX * 45;
      lastY = -percentY * 45;
      lastTime = performance.now();
    }

    function spinCube(ts) {
      if (!spinning) return;
      // Apply inertia
      rotationY += velocityY * 0.1;
      rotationX += velocityX * 0.1;
      setTransform();
      // Gradually slow down
      velocityX *= 0.95;
      velocityY *= 0.95;
      if (Math.abs(velocityX) > 0.01 || Math.abs(velocityY) > 0.01) {
        requestAnimationFrame(spinCube);
      } else {
        spinning = false;
      }
    }

    let isPointerDown = false;

    cube.addEventListener('pointerdown', function(e) {
      e.preventDefault();
      isPointerDown = true;
      cube.classList.add('grabbing');
      spinning = false;
      velocityX = 0;
      velocityY = 0;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
    });

    cube.addEventListener('pointermove', function(e) {
      if (!isPointerDown) return;
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
    });

    cube.addEventListener('pointerup', function(e) {
      e.preventDefault();
      isPointerDown = false;
      cube.classList.remove('grabbing');
      spinning = true;
      requestAnimationFrame(spinCube);
    });

    cube.addEventListener('pointerleave', function(e) {
      e.preventDefault();
      isPointerDown = false;
      cube.classList.remove('grabbing');
      spinning = true;
      requestAnimationFrame(spinCube);
      rect = null;
    });
  }
});

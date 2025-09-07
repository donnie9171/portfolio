document.addEventListener('DOMContentLoaded', function() {
  // Pointer-based cube rotation with inertia
  const cube = document.querySelector('.cube');
  if (cube) {
    let rect = null;
    let rotationX = 0;
    let rotationY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let lastX = 0;
    let lastY = 0;
    let spinning = false;
    let lastTime = 0;

    function setTransform() {
      cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
    }

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

    cube.addEventListener('pointermove', function(e) {
      e.preventDefault();
      updateRotation(e);
    });
    cube.addEventListener('pointerleave', function(e) {
      e.preventDefault();
      spinning = true;
      requestAnimationFrame(spinCube);
      rect = null;
    });
    cube.addEventListener('pointerenter', function(e) {
      e.preventDefault();
      spinning = false;
      velocityX = 0;
      velocityY = 0;
    });
  }
});

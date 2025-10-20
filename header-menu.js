  // Hamburger menu toggle with X animation
  const navToggle = document.querySelector(".nav-toggle");
  const navList = document.querySelector(".nav-list");
  const hamburger = document.querySelector(".hamburger");
  if (navToggle && navList && hamburger) {
    navToggle.addEventListener("click", function () {
      navList.classList.toggle("open");
      hamburger.classList.toggle("open");
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
  let lastScroll = window.scrollY;
  const header = document.querySelector('header');
  let ticking = false;

  function onScroll() {
    const currentScroll = window.scrollY;
    if (currentScroll > lastScroll && currentScroll > 60) {
      // Scrolling down, hide header
      header.classList.add('header-hidden');
    } else {
      // Scrolling up, show header
      header.classList.remove('header-hidden');
    }
    lastScroll = currentScroll;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  });
});
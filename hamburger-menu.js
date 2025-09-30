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
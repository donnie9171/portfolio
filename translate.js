document.addEventListener('DOMContentLoaded', function () {
  // Set global language variable
  var path = window.location.pathname;
  if (path.endsWith('.zh.html')) {
    window.currentLanguage = 'zh';
  } else {
    window.currentLanguage = 'en';
  }

  const translateBtn = document.querySelector('.translate');
  if (!translateBtn) return;
  translateBtn.addEventListener('click', function () {
    if (window.currentLanguage === 'zh') {
      // Switch to regular version
      window.location.href = path.replace('.zh.html', '.html');
    } else if (path.endsWith('.html')) {
      // Switch to zh version
      window.location.href = path.replace('.html', '.zh.html');
    } else {
      // Fallback: go to index.zh.html
      window.location.href = 'index.zh.html';
    }
  });
});
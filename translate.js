document.addEventListener('DOMContentLoaded', function () {
  var path = window.location.pathname;
  var preferredLang = localStorage.getItem('preferredLanguage');
  var isZhPage = path.endsWith('.zh.html');
  var isEnPage = path.endsWith('.html') && !isZhPage;

  // If user has a preference, redirect if necessary
  if (preferredLang === 'zh' && isEnPage) {
    window.location.href = path.replace('.html', '.zh.html');
    return;
  } else if (preferredLang === 'en' && isZhPage) {
    window.location.href = path.replace('.zh.html', '.html');
    return;
  }

  // Set global language variable
  window.currentLanguage = isZhPage ? 'zh' : 'en';

  const translateBtn = document.querySelector('.translate');
  if (!translateBtn) return;
  translateBtn.addEventListener('click', function () {
    if (window.currentLanguage === 'zh') {
      localStorage.setItem('preferredLanguage', 'en');
      window.location.href = path.replace('.zh.html', '.html');
    } else if (isEnPage) {
      localStorage.setItem('preferredLanguage', 'zh');
      window.location.href = path.replace('.html', '.zh.html');
    } else {
      localStorage.setItem('preferredLanguage', 'zh');
      window.location.href = 'index.zh.html';
    }
  });
});
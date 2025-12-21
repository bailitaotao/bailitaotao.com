document.addEventListener("DOMContentLoaded", () => {
  // Language Switcher Logic
  const langBtns = document.querySelectorAll('.lang-btn');
  const langContents = document.querySelectorAll('.lang-content');

  if (langBtns.length === 0) return;

  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');

      // Update buttons
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update content
      langContents.forEach(content => {
        if (content.getAttribute('data-lang') === lang) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
  });
});

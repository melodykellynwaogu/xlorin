const text = "Welcome to Xlorin search engine, powered by fast API for better and sufficient results.";
const typewriterTarget = document.getElementById("text");
let i = 0;
function typeWriter() {
    if (i < text.length) {
        typewriterTarget.innerHTML += text.charAt(i);
        i++;
        setTimeout(typeWriter, 100);
    }
}
typeWriter();


document.addEventListener('DOMContentLoaded', () => {
  // Robust element lookups by id
  const lightBtn = document.getElementById('light-btn');
  const darkBtn = document.getElementById('dark-btn');
  const body = document.body;

  const cookieCheckbox = document.getElementById('cookie-toggle');
  const explainBtn = document.getElementById('explain-cookies-btn');
  const explanationContainer = document.getElementById('explanation-container');

  const startupSelect = document.getElementById('startup-select');
  const searchEngineSelect = document.getElementById('search-select');

  // Helper: safe console logging of missing nodes
  function check(name, node) {
    if (!node) console.warn(`${name} not found in DOM`);
  }
  check('lightBtn', lightBtn);
  check('darkBtn', darkBtn);
  check('cookieCheckbox', cookieCheckbox);
  check('explainBtn', explainBtn);
  check('explanationContainer', explanationContainer);
  check('startupSelect', startupSelect);
  check('searchEngineSelect', searchEngineSelect);

  // Apply theme (adds/removes class only)
  function applyTheme(theme) {
    if (theme === 'light') {
      body.classList.add('light-mode');
      body.classList.remove('dark-mode');
    } else {
      body.classList.remove('light-mode');
      body.classList.add('dark-mode');
    }
  }

  function updateThemeButtons(theme) {
    // Visual feedback: toggle active classes if buttons exist
    if (lightBtn && darkBtn) {
      if (theme === 'light') {
        lightBtn.classList.add('bg-sky-600', 'border-sky-500');
        lightBtn.classList.remove('bg-slate-800', 'border-slate-700');
        darkBtn.classList.add('bg-slate-800', 'border-slate-700');
        darkBtn.classList.remove('bg-sky-600', 'border-sky-500');
      } else {
        darkBtn.classList.add('bg-sky-600', 'border-sky-500');
        darkBtn.classList.remove('bg-slate-800', 'border-slate-700');
        lightBtn.classList.add('bg-slate-800', 'border-slate-700');
        lightBtn.classList.remove('bg-sky-600', 'border-sky-500');
      }
    }
  }

  // Load stored preferences
  const storedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(storedTheme);
  updateThemeButtons(storedTheme);

  // Cookie toggle (safe)
  if (cookieCheckbox) {
    const storedCookie = localStorage.getItem('blockThirdPartyCookies');
    if (storedCookie !== null) cookieCheckbox.checked = storedCookie === 'true';
    else {
      cookieCheckbox.checked = true;
      localStorage.setItem('blockThirdPartyCookies', 'true');
    }
    cookieCheckbox.addEventListener('change', () => {
      localStorage.setItem('blockThirdPartyCookies', cookieCheckbox.checked.toString());
    });
  }

  // Explain button
  if (explainBtn && explanationContainer) {
    explainBtn.addEventListener('click', () => {
      const explanationText =
        "Third-party cookies are small files set by sites you don't directly visit. Blocking them limits cross-site tracking and helps protect your privacy.";
      explanationContainer.innerHTML = `<p>${explanationText}</p>`;
      explanationContainer.classList.remove('hidden');
    });
  }

  // selects with persistence
  if (startupSelect) {
    const storedStartup = localStorage.getItem('startupPage');
    if (storedStartup) startupSelect.value = storedStartup;
    startupSelect.addEventListener('change', () => {
      localStorage.setItem('startupPage', startupSelect.value);
    });
  }

  if (searchEngineSelect) {
    const storedSearch = localStorage.getItem('defaultSearchEngine');
    if (storedSearch) searchEngineSelect.value = storedSearch;
    searchEngineSelect.addEventListener('change', () => {
      localStorage.setItem('defaultSearchEngine', searchEngineSelect.value);
    });
  }

  // Safe event binding for theme buttons
  if (lightBtn) {
    lightBtn.addEventListener('click', () => {
      applyTheme('light');
      updateThemeButtons('light');
      localStorage.setItem('theme', 'light');
    });
  }
  if (darkBtn) {
    darkBtn.addEventListener('click', () => {
      applyTheme('dark');
      updateThemeButtons('dark');
      localStorage.setItem('theme', 'dark');
    });
  }
});

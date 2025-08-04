function displaySkeletonLoader() {
  const overlay = document.getElementById("result-overlay");
  overlay.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton-item";
    skeleton.innerHTML = `
      <div class="skeleton-title"></div>
      <div class="skeleton-description"></div>
    `;
    overlay.appendChild(skeleton);
  }

  overlay.style.display = "flex";
}


document.addEventListener('DOMContentLoaded', function() {
    const theme = localStorage.getItem('anchor-theme');
    const body = document.body;
    const overlay = document.querySelector('.video-overlay');
    if (theme === 'dark') {
        body.classList.add('dark-theme');
    } else {
        body.classList.remove('dark-theme');
    }

    const voiceBtn = document.getElementById('voice-btn');
    if (voiceBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        let listening = false;
        voiceBtn.addEventListener('click', function(e) {
            if (listening) {
                recognition.stop();
                return;
            }
            recognition.start();
        });
        recognition.addEventListener('start', function() {
            listening = true;
            voiceBtn.classList.add('active');
            input.placeholder = 'Listening...';
        });
        recognition.addEventListener('end', function() {
            listening = false;
            voiceBtn.classList.remove('active');
            input.placeholder = 'Search ANCHOR...';
        });
        recognition.addEventListener('result', function(event) {
            const transcript = event.results[0][0].transcript;
            input.value = transcript;
            input.dispatchEvent(new Event('input'));
            setTimeout(() => {
                input.focus();
            }, 100);
        });
    } else if (voiceBtn) {
        voiceBtn.style.display = 'none';
    }

    const input = document.getElementById('search');
    const resultOverlay = document.getElementById('result-overlay');
    const autocompleteList = document.getElementById('autocomplete-list');
    let timeout = null;


    let activeIndex = -1;
    let suggestions = [];

    input.addEventListener('input', function(e) {
        clearTimeout(timeout);
        const query = input.value;
        if (!query.trim()) {
            autocompleteList.style.display = 'none';
            autocompleteList.innerHTML = '';
            resultOverlay.innerHTML = "";
            return;
        }

        timeout = setTimeout(() => {
            fetch('/suggest?q=' + encodeURIComponent(query))
            fetch('/live_search?q=' + encodeURIComponent(query))
                .then(res => res.json())
                .then(data => {
                    suggestions = data.suggestions || [];
                    if (suggestions.length) {
                        autocompleteList.innerHTML = suggestions.map((s, i) => `<li${i===0?' class="active"':''}>${s.replace(/</g,'&lt;')}</li>`).join('');
                        autocompleteList.style.display = 'block';
                        activeIndex = 0;
                    } else {
                        autocompleteList.style.display = 'none';
                        autocompleteList.innerHTML = '';
                        activeIndex = -1;
                    }
                });
        }, 180);
    });

    input.addEventListener('keydown', function(e) {
        if (!suggestions.length || autocompleteList.style.display === 'none') return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = (activeIndex + 1) % suggestions.length;
            updateActive();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = (activeIndex - 1 + suggestions.length) % suggestions.length;
            updateActive();
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0 && suggestions[activeIndex]) {
                input.value = suggestions[activeIndex];
                autocompleteList.style.display = 'none';
                autocompleteList.innerHTML = '';
                suggestions = [];
            }
        } else if (e.key === 'Escape') {
            autocompleteList.style.display = 'none';
            autocompleteList.innerHTML = '';
            suggestions = [];
        }
    });

    function updateActive() {
        const items = autocompleteList.querySelectorAll('li');
        items.forEach((li, i) => {
            li.classList.toggle('active', i === activeIndex);
        });
    }

    autocompleteList.addEventListener('mousedown', function(e) {
        if (e.target.tagName === 'LI') {
            input.value = e.target.textContent;
            autocompleteList.style.display = 'none';
            autocompleteList.innerHTML = '';
            suggestions = [];
            input.focus();
        }
    });

    input.addEventListener('blur', function() {
        setTimeout(() => {
            autocompleteList.style.display = 'none';
        }, 120);
    });

    input.addEventListener('change', doSearch);
    function doSearch() {
        const query = input.value;
        if (!query.trim()) return;
        document.querySelector('.container').classList.add('results-active');
        
        const overlayElement = document.querySelector('.video-overlay');
        if (overlayElement) {
            overlayElement.classList.add('results-blur');
        }
        
        const overlayText = document.getElementById('search-overlay-text');
        if (overlayText) {
            overlayText.textContent = query;
            overlayText.style.display = 'block';
        }

       
        displaySkeletonLoader();
        fetch('/live_search?q=' + encodeURIComponent(query))
        .then(res => res.json())
        .then(data => {
            let title = '', summary = '', img = '';
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data.result;

            const html = ` <div class="result-box"> ${tempDiv.innerHTML} </div>`;
            if (resultOverlay) {
                resultOverlay.innerHTML = html;
                resultOverlay.style.display = 'flex';
            }
        });
    }


    // Remove results mode if input is cleared
    input.addEventListener('input', function() {
        if (!input.value.trim()) {
            document.querySelector('.container').classList.remove('results-active');

            const overlayElement = document.querySelector('.video-overlay');
            if (overlayElement) {
                overlayElement.classList.remove('results-blur');
            }

            const overlayText = document.getElementById('search-overlay-text');
            if (overlayText) overlayText.style.display = 'none';

            if (resultOverlay) {
                resultOverlay.innerHTML = '';
                resultOverlay.style.display = 'none';
            }
        }
    });


    document.getElementById('search-form').addEventListener('submit', function(e) {
        e.preventDefault();
        doSearch();
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const settingsForm = document.getElementById('settings-form');
    
    const userKey = 'anchor-user';
    let user = localStorage.getItem(userKey);
    if (!user) {
        loginForm.style.display = 'flex';
    } else {
        loginForm.style.display = 'none';
    }

    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value; 
        if (username) {
            localStorage.setItem(userKey, username);
            loginForm.style.display = 'none';
            alert('Welcome, ' + username + '!');
        } else {
            alert('Please enter a username.');
        }
    });


    if (user) {
        const welcome = document.createElement('div');
        welcome.textContent = 'Welcome, ' + user + '!';
        welcome.style.cssText = 'color:#8ab4f8;font-weight:bold;text-align:center;margin-bottom:12px;';
        settingsForm.insertBefore(welcome, settingsForm.firstChild);
    }

    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');
    const historyToggle = document.getElementById('historyToggle');

    function loadHistory() {
        const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        if (!historyList) return;
        historyList.innerHTML = '';
        if (history.length === 0) {
            historyList.innerHTML = '<li style="color:#888;">No search history.</li>';
        } else {
            history.forEach((item, idx) => {
                const li = document.createElement('li');
                li.textContent = item;
                const delBtn = document.createElement('button');
                delBtn.textContent = 'Delete';
                delBtn.style.marginLeft = '10px';
                delBtn.onclick = () => {
                    history.splice(idx, 1);
                    localStorage.setItem('searchHistory', JSON.stringify(history));
                    loadHistory();
                };
                li.appendChild(delBtn);
                historyList.appendChild(li);
            });
        }
    }
    if (historyList) loadHistory();
    if (clearHistoryBtn) clearHistoryBtn.onclick = () => {
        localStorage.removeItem('searchHistory');
        loadHistory();
    };
    if (historyToggle) {
        historyToggle.checked = localStorage.getItem('saveHistory') === 'true';
        historyToggle.onchange = () => {
            localStorage.setItem('saveHistory', historyToggle.checked);
        };
    }

    
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        const displayName = document.getElementById('display-name');
        const profileColor = document.getElementById('profile-color');

        displayName.value = localStorage.getItem('displayName') || '';
        profileColor.value = localStorage.getItem('profileColor') || '#4285f4';
        profileForm.onsubmit = (e) => {
            e.preventDefault();
            localStorage.setItem('displayName', displayName.value);
            localStorage.setItem('profileColor', profileColor.value);
            alert('Profile saved!');
        };
    }
});
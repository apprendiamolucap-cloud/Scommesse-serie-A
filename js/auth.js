function getCurrentUser() {
    return localStorage.getItem('username');
}

function getCurrentRole() {
    return localStorage.getItem('role');
}

function login() {
    const usernameInput = document.getElementById('username');
    const roleInput = document.getElementById('role');
    const adminCodeInput = document.getElementById('admin-code');
    
    if (!usernameInput || !roleInput) return;

    const username = usernameInput.value.trim();
    const role = roleInput.value;

    if (!username) {
        alert('Inserisci un username valido!');
        return;
    }

    if (role === 'admin') {
        const code = adminCodeInput ? adminCodeInput.value.trim() : '';
        if (code !== 'jamal') {
            alert('Codice segreto Admin errato! Accesso negato.');
            return;
        }
    }

    localStorage.setItem('username', username);
    localStorage.setItem('role', role);

    window.location.href = (role === 'admin') ? 'admin.html' : 'hub.html';
}

function logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location.href = 'index.html';
}

function checkAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    const userDisplay = document.getElementById('user-display');
    if (userDisplay) {
        userDisplay.innerText = `👤 ${user}`;
    }

    const adminLink = document.getElementById('admin-link');
    if (adminLink && getCurrentRole() === 'admin') {
        adminLink.style.display = 'flex';
    }
}

function toggleDeviceMode() {
    let mode = localStorage.getItem('deviceMode') || 'mobile';
    let newMode = mode === 'mobile' ? 'pc' : 'mobile';
    localStorage.setItem('deviceMode', newMode);
    applyDeviceMode();
}

function applyDeviceMode() {
    let mode = localStorage.getItem('deviceMode') || 'mobile';
    const btn = document.getElementById('device-btn');
    if (mode === 'pc') {
        document.body.classList.add('pc-mode');
        if (btn) btn.innerText = '📱 Vista Mobile';
    } else {
        document.body.classList.remove('pc-mode');
        if (btn) btn.innerText = '🖥️ Vista PC';
    }
}

function getUserProfile(username) {
    let profiles = JSON.parse(localStorage.getItem('userProfiles')) || {};
    if (!profiles[username]) {
        profiles[username] = {
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=151f32&color=00e5ff&size=128`,
            color: '#f8fafc',
            unlockedColors: ['#f8fafc'],
            completedMissions: []
        };
        localStorage.setItem('userProfiles', JSON.stringify(profiles));
    }
    return profiles[username];
}

function updateUserAvatar() {
    const avatarUrl = document.getElementById('avatar-url-input').value.trim();
    if (!avatarUrl) return alert("Inserisci un link valido!");
    
    const currentUser = getCurrentUser();
    let profiles = JSON.parse(localStorage.getItem('userProfiles')) || {};
    let profile = getUserProfile(currentUser);
    
    profile.avatar = avatarUrl;
    profiles[currentUser] = profile;
    localStorage.setItem('userProfiles', JSON.stringify(profiles));
    alert("Foto profilo aggiornata!");
    location.reload();
}

function selectNameColor(colorHex) {
    const currentUser = getCurrentUser();
    let profiles = JSON.parse(localStorage.getItem('userProfiles')) || {};
    let profile = getUserProfile(currentUser);

    if (!profile.unlockedColors.includes(colorHex)) {
        return alert("Devi prima sbloccare questo colore completando la missione!");
    }

    profile.color = colorHex;
    profiles[currentUser] = profile;
    localStorage.setItem('userProfiles', JSON.stringify(profiles));
    alert("Colore nome aggiornato!");
    location.reload();
}

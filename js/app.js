/* ==========================================================================
   0. CONFIGURAZIONE & GOOGLE AUTH (GMAIL) VIA FIREBASE CDN
   ========================================================================== */
const firebaseConfig = {
    apiKey: "AIzaSyByIrkfzoKxatFbdsaedpgGs7duWDpYidw",
    authDomain: "serie-a-ce615.firebaseapp.com",
    projectId: "serie-a-ce615",
    storageBucket: "serie-a-ce615.firebasestorage.app",
    messagingSenderId: "476222155796",
    appId: "1:476222155796:web:2cbae94cd5d07955becb01",
    measurementId: "G-90CQRJ2H8H"
};

// Inizializzazione Firebase globale (funziona se carichi gli script SDK nell'HTML)
let auth, googleProvider;
try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    googleProvider = new firebase.auth.GoogleAuthProvider();
} catch (e) {
    console.log("Firebase SDK non ancora caricato o già inizializzato.");
}

function loginWithGoogle() {
    if (!auth) {
        alert("Firebase non è ancora pronto. Ricarica la pagina.");
        return;
    }

    // Controlla se l'utente ha selezionato Admin o Player nel form
    const roleInput = document.getElementById('role');
    const adminCodeInput = document.getElementById('admin-code');
    const selectedRole = roleInput ? roleInput.value : 'player';

    if (selectedRole === 'admin') {
        const code = adminCodeInput ? adminCodeInput.value.trim() : '';
        if (code !== 'jamal') {
            alert('Codice segreto Admin errato! Accesso negato.');
            return;
        }
    }

    auth.signInWithPopup(googleProvider)
        .then((result) => {
            const user = result.user;
            const username = user.displayName || user.email.split('@')[0];
            
            // Salva sessione con il ruolo scelto
            localStorage.setItem('username', username);
            localStorage.setItem('role', selectedRole);
            
            // Inizializza o aggiorna il profilo
            let profiles = JSON.parse(localStorage.getItem('userProfiles')) || {};
            if (!profiles[username]) {
                profiles[username] = {
                    avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=151f32&color=00e5ff&size=128`,
                    color: '#f8fafc',
                    unlockedColors: ['#f8fafc'],
                    completedMissions: []
                };
            } else if (user.photoURL && !profiles[username].customAvatar) {
                // Se non ha impostato un'immagine personalizzata manuale, usa quella di Google
                profiles[username].avatar = user.photoURL;
            }

            localStorage.setItem('userProfiles', JSON.stringify(profiles));

            // Reindirizza in base al ruolo scelto
            window.location.href = (selectedRole === 'admin') ? 'admin.html' : 'hub.html';
        })
        .catch((error) => {
            console.error("ERRORE FIREBASE AUTH:", error.code, error.message);
            alert("Errore Google Login: " + error.message);
        });
}

/* ==========================================================================
   1. CONFIGURAZIONE LOGHI SQUADRE SERIE A & MISSIONI
   ========================================================================== */
const TEAM_LOGOS = {
    "inter": "https://media.api-sports.io/football/teams/505.png",
    "milan": "https://media.api-sports.io/football/teams/489.png",
    "mian": "https://media.api-sports.io/football/teams/489.png",
    "juventus": "https://media.api-sports.io/football/teams/496.png",
    "juve": "https://media.api-sports.io/football/teams/496.png",
    "napoli": "https://media.api-sports.io/football/teams/492.png",
    "roma": "https://media.api-sports.io/football/teams/497.png",
    "lazio": "https://media.api-sports.io/football/teams/487.png",
    "atalanta": "https://media.api-sports.io/football/teams/499.png",
    "fiorentina": "https://media.api-sports.io/football/teams/502.png",
    "bologna": "https://media.api-sports.io/football/teams/500.png",
    "torino": "https://media.api-sports.io/football/teams/503.png",
    "udinese": "https://media.api-sports.io/football/teams/494.png",
    "monza": "https://media.api-sports.io/football/teams/1579.png",
    "verona": "https://media.api-sports.io/football/teams/504.png",
    "hellas verona": "https://media.api-sports.io/football/teams/504.png",
    "cagliari": "https://media.api-sports.io/football/teams/490.png",
    "empoli": "https://media.api-sports.io/football/teams/511.png",
    "parma": "https://media.api-sports.io/football/teams/523.png",
    "genoa": "https://media.api-sports.io/football/teams/495.png",
    "como": "https://media.api-sports.io/football/teams/1580.png",
    "venezia": "https://media.api-sports.io/football/teams/517.png",
    "lecce": "https://media.api-sports.io/football/teams/889.png"
};

function getTeamLogo(teamName) {
    if (!teamName) return "https://via.placeholder.com/48?text=FC";
    const cleanName = teamName.toLowerCase().trim();
    if (TEAM_LOGOS[cleanName]) {
        return TEAM_LOGOS[cleanName];
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=151f32&color=00e5ff&size=64&font-size=0.4`;
}

const MISSIONS = [
    { id: 'submit_schedina', name: 'Esordiente', desc: 'Invia la tua prima schedina', rewardColor: '#00e5ff', rewardName: 'Cyan Neon' },
    { id: 'use_joker', name: 'Tattico', desc: 'Usa il Jolly su una partita', rewardColor: '#00e676', rewardName: 'Emerald Green' },
    { id: 'top_scorer', name: 'Puntatore', desc: 'Raggiungi 10 o più Punti Totali', rewardColor: '#ffd700', rewardName: 'Gold Champion' }
];


/* ==========================================================================
   2. AUTENTICAZIONE, SESSIONE & PROFILI UTENTE
   ========================================================================== */
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


/* ==========================================================================
   3. HUB PRONOSTICI & GESTIONE SCHEDINE PLAYER
   ========================================================================== */
function isPredictionsLocked() {
    return localStorage.getItem('predictionsLocked') === 'true';
}

function loadHubMatches() {
    const container = document.getElementById('matches-list');
    const statusContainer = document.getElementById('lock-status');
    if (!container) return;

    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    let predictions = JSON.parse(localStorage.getItem('predictions')) || {};
    let jokers = JSON.parse(localStorage.getItem('jokers')) || {};
    const currentUser = getCurrentUser();

    let userHasSubmitted = predictions[currentUser] && Object.keys(predictions[currentUser]).length > 0;
    let globalLocked = isPredictionsLocked();
    let userJoker = jokers[currentUser] || null;

    if (statusContainer) {
        if (globalLocked || userHasSubmitted) {
            statusContainer.innerHTML = "<p style='color: var(--danger); font-weight:bold;'>🔒 Schedina inviata o bloccata. Impossibile modificare i pronostici.</p>";
        } else {
            statusContainer.innerHTML = "<p style='color: var(--primary-green); font-weight:bold;'>🔓 Schedina Aperta. Scegli il tuo MATCH JOLLY (2x Punti) e invia!</p>";
        }
    }

    container.innerHTML = '';

    if (matches.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: var(--text-muted); padding: 20px;">Nessuna partita disponibile. L\'admin deve ancora caricare la giornata!</p>';
        return;
    }

    matches.forEach(match => {
        let userPred = (predictions[currentUser] && predictions[currentUser][match.id]) 
            ? predictions[currentUser][match.id] 
            : { res: '', scorer: '', assist: '', ownGoal: '' };

        let isLockedForUser = globalLocked || userHasSubmitted;
        let disabledAttr = isLockedForUser ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : '';
        let isJokerChecked = userJoker == match.id ? 'checked' : '';

        container.innerHTML += `
            <div class="match-box" style="${userJoker == match.id ? 'border: 2px solid #ffd700;' : ''}">
                <div class="match-header">
                    <div class="team-badge">
                        <img src="${getTeamLogo(match.home)}" alt="${match.home}">
                        <span>${match.home}</span>
                    </div>
                    <div class="vs-divider">VS</div>
                    <div class="team-badge">
                        <img src="${getTeamLogo(match.away)}" alt="${match.away}">
                        <span>${match.away}</span>
                    </div>
                </div>

                <div style="background:#0d1424; padding:8px 12px; border-radius:8px; margin-bottom:12px; display:flex; align-items:center; justify-content:space-between;">
                    <span style="font-size:0.85rem; font-weight:bold; color:#ffd700;">🌟 Match Jolly (Punti X2)</span>
                    <input type="radio" name="jokerMatch" value="${match.id}" ${isJokerChecked} ${disabledAttr} style="width:auto; margin:0;">
                </div>

                <label>Risultato Esatto (es. 2-1):</label>
                <input type="text" id="pred-res-${match.id}" value="${userPred.res || ''}" placeholder="es. 2-1" ${disabledAttr}>
                
                <label>Marcatore (+2 pt):</label>
                <input type="text" id="pred-scorer-${match.id}" value="${userPred.scorer || ''}" placeholder="es. Lautaro" ${disabledAttr}>
                
                <label>Assist (+0.5 pt):</label>
                <input type="text" id="pred-assist-${match.id}" value="${userPred.assist || ''}" placeholder="es. Barella" ${disabledAttr}>
                
                <label>Autogol (-2 pt):</label>
                <input type="text" id="pred-owngoal-${match.id}" value="${userPred.ownGoal || ''}" placeholder="es. Gatti" ${disabledAttr}>
            </div>
        `;
    });

    if (!globalLocked && !userHasSubmitted) {
        container.innerHTML += `
            <div style="margin-top:20px;">
                <button onclick="submitAllPredictions()">🚀 Invia e Blocca Schedina</button>
            </div>
        `;
    }
}

function submitAllPredictions() {
    if (isPredictionsLocked()) return alert("Le schedine sono state chiuse dall'admin!");

    const currentUser = getCurrentUser();
    let predictions = JSON.parse(localStorage.getItem('predictions')) || {};
    let jokers = JSON.parse(localStorage.getItem('jokers')) || {};
    let matches = JSON.parse(localStorage.getItem('matches')) || [];

    const selectedJoker = document.querySelector('input[name="jokerMatch"]:checked');
    if (selectedJoker) {
        jokers[currentUser] = selectedJoker.value;
        localStorage.setItem('jokers', JSON.stringify(jokers));
    }

    if (!predictions[currentUser]) predictions[currentUser] = {};

    matches.forEach(match => {
        const resInput = document.getElementById(`pred-res-${match.id}`);
        const scorerInput = document.getElementById(`pred-scorer-${match.id}`);
        const assistInput = document.getElementById(`pred-assist-${match.id}`);
        const ownGoalInput = document.getElementById(`pred-owngoal-${match.id}`);

        predictions[currentUser][match.id] = {
            res: resInput ? resInput.value.trim() : '',
            scorer: scorerInput ? scorerInput.value.trim() : '',
            assist: assistInput ? assistInput.value.trim() : '',
            ownGoal: ownGoalInput ? ownGoalInput.value.trim() : ''
        };
    });

    localStorage.setItem('predictions', JSON.stringify(predictions));
    checkAndRewardMissions(currentUser, 'submit_schedina');
    alert('Pronostici inviati con successo!');
    loadHubMatches();
}

function loadAllPlayerPredictions() {
    const container = document.getElementById('all-predictions-list');
    if (!container) return;

    let predictions = JSON.parse(localStorage.getItem('predictions')) || {};
    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    let users = Object.keys(predictions);

    container.innerHTML = '';

    if (users.length === 0) {
        container.innerHTML = '<p>Nessun pronostico registrato finora.</p>';
        return;
    }

    users.forEach(user => {
        let userProfile = getUserProfile(user);
        let userHtml = `<div class="card">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;">
                <img src="${userProfile.avatar}" style="width:36px; height:36px; border-radius:50%; object-fit:cover;">
                <h3 style="margin:0; color:${userProfile.color};">Player: ${user}</h3>
            </div>`;
            
        let userPreds = predictions[user];

        matches.forEach(match => {
            let p = userPreds[match.id];
            userHtml += `
                <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--card-border);">
                    <strong>${match.home} vs ${match.away}</strong><br>
                    <span style="font-size:0.85rem; color:var(--text-muted);">
                        Risultato: <strong style="color:var(--primary-cyan);">${p ? (p.res || '-') : '-'}</strong> | 
                        Marcatore: <strong>${p ? (p.scorer || '-') : '-'}</strong> | 
                        Assist: <strong>${p ? (p.assist || '-') : '-'}</strong>
                    </span>
                </div>
            `;
        });

        userHtml += `</div>`;
        container.innerHTML += userHtml;
    });
}


/* ==========================================================================
   4. PANNELLO ADMIN & GESTIONE PARTITE
   ========================================================================== */
function togglePredictionsLock() {
    let locked = isPredictionsLocked();
    localStorage.setItem('predictionsLocked', !locked);
    if (!locked) {
        calculateAllPoints();
        alert('Pronostici chiusi per tutti! I punti sono stati calcolati.');
    } else {
        alert('Pronostici riaperti per i player.');
    }
    loadAdminPanel();
}

function loadAdminPanel() {
    loadAdminMatches();
    const desc = document.getElementById('admin-lock-desc');
    const btn = document.getElementById('toggle-lock-btn');
    if (!desc || !btn) return;

    if (isPredictionsLocked()) {
        desc.innerText = "Le schedine sono CHIUSE a livello globale.";
        btn.innerText = "Riapri Pronostici";
        btn.className = "";
    } else {
        desc.innerText = "Le schedine sono APERTE (ogni player le blocca inviandole).";
        btn.innerText = "Chiudi Pronostici Tutti";
        btn.className = "btn-danger";
    }
}

function addMatch() {
    const home = document.getElementById('homeTeam').value.trim();
    const away = document.getElementById('awayTeam').value.trim();

    if (!home || !away) {
        alert('Inserisci entrambe le squadre!');
        return;
    }

    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    matches.push({
        id: Date.now(),
        home: home,
        away: away,
        result: null,
        scorer: null,
        assist: null,
        ownGoal: null
    });

    localStorage.setItem('matches', JSON.stringify(matches));
    document.getElementById('homeTeam').value = '';
    document.getElementById('awayTeam').value = '';
    alert('Partita creata e salvata con successo!');
    loadAdminMatches();
}

function loadSampleSerieAMatches() {
    const sampleMatches = [
        { id: 101, home: "Inter", away: "Milan", result: null, scorer: null, assist: null, ownGoal: null },
        { id: 102, home: "Juventus", away: "Napoli", result: null, scorer: null, assist: null, ownGoal: null },
        { id: 103, home: "Roma", away: "Lazio", result: null, scorer: null, assist: null, ownGoal: null },
        { id: 104, home: "Atalanta", away: "Fiorentina", result: null, scorer: null, assist: null, ownGoal: null }
    ];

    localStorage.setItem('matches', JSON.stringify(sampleMatches));
    alert('Giornata di Serie A caricata con successo!');
    loadAdminMatches();
}

function loadAdminMatches() {
    const container = document.getElementById('admin-matches-list');
    if (!container) return;

    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    container.innerHTML = '';

    if (matches.length === 0) {
        container.innerHTML = '<p>Nessuna partita presente.</p>';
        return;
    }

    matches.forEach(match => {
        container.innerHTML += `
            <div class="match-box">
                <div class="match-header">
                    <div class="team-badge">
                        <img src="${getTeamLogo(match.home)}" alt="${match.home}">
                        <span>${match.home}</span>
                    </div>
                    <div class="vs-divider">VS</div>
                    <div class="team-badge">
                        <img src="${getTeamLogo(match.away)}" alt="${match.away}">
                        <span>${match.away}</span>
                    </div>
                </div>
                <p style="text-align:center;">Status: ${match.result ? 'Completata (' + match.result + ')' : 'In attesa'}</p>
                <input type="text" id="res-${match.id}" placeholder="Risultato Reale (es. 2-1)" value="${match.result || ''}">
                <input type="text" id="scorer-${match.id}" placeholder="Marcatore Reale" value="${match.scorer || ''}">
                <input type="text" id="assist-${match.id}" placeholder="Assist Reale" value="${match.assist || ''}">
                <input type="text" id="owngoal-${match.id}" placeholder="Autogol Reale" value="${match.ownGoal || ''}">
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button onclick="saveRealResult(${match.id})">Salva e Ricalcola Punti</button>
                    <button class="btn-danger" onclick="deleteMatch(${match.id})" style="width: auto;">Elimina</button>
                </div>
            </div>
        `;
    });
}

function saveRealResult(matchId) {
    const res = document.getElementById(`res-${matchId}`).value.trim();
    const scorer = document.getElementById(`scorer-${matchId}`).value.trim();
    const assist = document.getElementById(`assist-${matchId}`).value.trim();
    const ownGoal = document.getElementById(`owngoal-${matchId}`).value.trim();

    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    matches = matches.map(m => {
        if (m.id == matchId) {
            m.result = res;
            m.scorer = scorer;
            m.assist = assist;
            m.ownGoal = ownGoal;
        }
        return m;
    });

    localStorage.setItem('matches', JSON.stringify(matches));
    calculateAllPoints();
    alert('Risultato reale salvato e punti aggiornati!');
    loadAdminMatches();
}

function deleteMatch(matchId) {
    if (!confirm("Eliminare questa partita?")) return;
    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    matches = matches.filter(m => m.id != matchId);
    localStorage.setItem('matches', JSON.stringify(matches));
    calculateAllPoints();
    loadAdminMatches();
}


/* ==========================================================================
   5. CLASSIFICA, PUNTEGGI & MISSIONI
   ========================================================================== */
function checkAndRewardMissions(username, actionType) {
    let profiles = JSON.parse(localStorage.getItem('userProfiles')) || {};
    let profile = getUserProfile(username);
    let scores = JSON.parse(localStorage.getItem('scores')) || {};

    let unlocked = false;

    if (actionType === 'submit_schedina' && !profile.completedMissions.includes('submit_schedina')) {
        profile.completedMissions.push('submit_schedina');
        profile.unlockedColors.push('#00e5ff');
        unlocked = true;
    }

    let jokers = JSON.parse(localStorage.getItem('jokers')) || {};
    if (jokers[username] && !profile.completedMissions.includes('use_joker')) {
        profile.completedMissions.push('use_joker');
        profile.unlockedColors.push('#00e676');
        unlocked = true;
    }

    if ((scores[username] || 0) >= 10 && !profile.completedMissions.includes('top_scorer')) {
        profile.completedMissions.push('top_scorer');
        profile.unlockedColors.push('#ffd700');
        unlocked = true;
    }

    if (unlocked) {
        profiles[username] = profile;
        localStorage.setItem('userProfiles', JSON.stringify(profiles));
    }
}

function calculateAllPoints() {
    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    let predictions = JSON.parse(localStorage.getItem('predictions')) || {};
    let jokers = JSON.parse(localStorage.getItem('jokers')) || {};
    let scores = {};

    Object.keys(predictions).forEach(user => {
        scores[user] = 0;
        let userMatches = predictions[user];
        let userJokerMatchId = jokers[user] || null;

        matches.forEach(match => {
            if (!match.result) return; 

            let pred = userMatches[match.id];
            if (!pred) return;

            let matchPoints = 0;
            let realRes = match.result; 
            let userRes = pred.res;       

            if (userRes === realRes && realRes !== "") {
                matchPoints += 3;
            } else if (userRes && realRes) {
                let [rHome, rAway] = realRes.split('-').map(Number);
                let [uHome, uAway] = userRes.split('-').map(Number);
                if (!isNaN(rHome) && !isNaN(uHome) && !isNaN(rAway) && !isNaN(uAway)) {
                    if (Math.sign(rHome - rAway) === Math.sign(uHome - uAway)) {
                        matchPoints += 1;
                    }
                }
            }

            if (match.scorer && pred.scorer && match.scorer.toLowerCase().trim() === pred.scorer.toLowerCase().trim()) {
                matchPoints += 2;
            }
            if (match.assist && pred.assist && match.assist.toLowerCase().trim() === pred.assist.toLowerCase().trim()) {
                matchPoints += 0.5;
            }
            if (match.ownGoal && pred.ownGoal && match.ownGoal.toLowerCase().trim() === pred.ownGoal.toLowerCase().trim()) {
                matchPoints -= 2;
            }

            if (userJokerMatchId == match.id) {
                matchPoints *= 2;
            }

            scores[user] += matchPoints;
        });

        checkAndRewardMissions(user, 'score_update');
    });

    localStorage.setItem('scores', JSON.stringify(scores));
}

function loadLeaderboard() {
    const tbody = document.getElementById('ranking-body');
    if (!tbody) return;

    let scores = JSON.parse(localStorage.getItem('scores')) || {};
    let sortedUsers = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);

    tbody.innerHTML = '';

    if (sortedUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3">Nessun punteggio registrato.</td></tr>';
        return;
    }

    sortedUsers.forEach((user, index) => {
        let userProfile = getUserProfile(user);
        tbody.innerHTML += `
            <tr>
                <td>#${index + 1}</td>
                <td style="display:flex; align-items:center; gap:8px;">
                    <img src="${userProfile.avatar}" style="width:28px; height:28px; border-radius:50%; object-fit:cover;">
                    <span style="color:${userProfile.color}; font-weight:bold;">${user}</span>
                </td>
                <td><strong>${scores[user]}</strong> pt</td>
            </tr>
        `;
    });
}

function resetLeaderboard() {
    if (!confirm("Sei sicuro di voler azzerare la classifica generale?")) return;
    localStorage.removeItem('scores');
    alert('Classifica azzerata con successo!');
    loadLeaderboard();
}

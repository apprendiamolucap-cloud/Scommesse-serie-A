// --- LOGHI SQUADRE SERIE A (API Affidabile + Mappatura Flessibile) ---
const TEAM_LOGOS = {
    "inter": "https://media.api-sports.io/football/teams/505.png",
    "milan": "https://media.api-sports.io/football/teams/489.png",
    "mian": "https://media.api-sports.io/football/teams/489.png", // Correzione automatica per errore di battitura "mian"
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
    
    // Se la squadra è nella mappa usa l'immagine CDN, altrimenti genera uno stemma dinamico con le prime lettere
    if (TEAM_LOGOS[cleanName]) {
        return TEAM_LOGOS[cleanName];
    }
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=151f32&color=00e5ff&size=64&font-size=0.4`;
}
// --- SELETTORE VISTA MOBILE / PC ---
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

// --- AUTENTICAZIONE ---
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

    if (role === 'admin') {
        window.location.href = 'admin.html';
    } else {
        window.location.href = 'hub.html';
    }
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

function isPredictionsLocked() {
    return localStorage.getItem('predictionsLocked') === 'true';
}

function togglePredictionsLock() {
    let locked = isPredictionsLocked();
    localStorage.setItem('predictionsLocked', !locked);
    if (!locked) {
        calculateAllPoints();
        alert('Pronostici chiusi! I punti sono stati calcolati.');
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
        desc.innerText = "Le schedine sono CHIUSE. Punteggi attivi.";
        btn.innerText = "Riapri Pronostici";
        btn.className = "";
    } else {
        desc.innerText = "Le schedine sono APERTE per tutti i player.";
        btn.innerText = "Chiudi Pronostici";
        btn.className = "btn-danger";
    }
}

// --- ADMIN PARTITE ---
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
                    <button onclick="saveRealResult(${match.id})">Salva e Ricalcola</button>
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
    alert('Dati salvati!');
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

// --- PLAYER HUB PRONOSTICI (RISOLTO BUG SALVATAGGIO) ---
function loadHubMatches() {
    const container = document.getElementById('matches-list');
    const statusContainer = document.getElementById('lock-status');
    if (!container) return;

    let locked = isPredictionsLocked();
    if (statusContainer) {
        if (locked) {
            statusContainer.innerHTML = "<p style='color: var(--danger); font-weight:bold;'>🔒 Schedine Chiuse dall'Admin. Impossibile modificare i pronostici.</p>";
        } else {
            statusContainer.innerHTML = "<p style='color: var(--primary-green); font-weight:bold;'>🔓 Schedine Aperte. Inserisci i tuoi pronostici.</p>";
        }
    }

    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    let predictions = JSON.parse(localStorage.getItem('predictions')) || {};
    const currentUser = getCurrentUser();

    container.innerHTML = '';

    if (matches.length === 0) {
        container.innerHTML = '<p>Nessuna partita disponibile per questa giornata.</p>';
        return;
    }

    matches.forEach(match => {
        let userPred = (predictions[currentUser] && predictions[currentUser][match.id]) 
            ? predictions[currentUser][match.id] 
            : { res: '', scorer: '', assist: '', ownGoal: '' };

        let disabledAttr = locked ? 'disabled style="opacity:0.5;"' : '';
        let btnDisplay = locked ? 'style="display:none;"' : '';

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

                <label>Risultato Esatto (es. 2-1):</label>
                <input type="text" id="pred-res-${match.id}" value="${userPred.res || ''}" placeholder="es. 2-1" ${disabledAttr}>
                
                <label>Marcatore (+2 pt):</label>
                <input type="text" id="pred-scorer-${match.id}" value="${userPred.scorer || ''}" placeholder="es. Lautaro" ${disabledAttr}>
                
                <label>Assist (+0.5 pt):</label>
                <input type="text" id="pred-assist-${match.id}" value="${userPred.assist || ''}" placeholder="es. Barella" ${disabledAttr}>
                
                <label>Autogol (-2 pt):</label>
                <input type="text" id="pred-owngoal-${match.id}" value="${userPred.ownGoal || ''}" placeholder="es. Gatti" ${disabledAttr}>
                
                <div style="display: flex; gap: 10px; margin-top: 15px; ${btnDisplay}">
                    <button onclick="savePrediction('${match.id}')">Salva Pronostico</button>
                    <button class="btn-danger" onclick="deletePrediction('${match.id}')" style="width: auto;">Cancella</button>
                </div>
            </div>
        `;
    });
}

function savePrediction(matchId) {
    if (isPredictionsLocked()) {
        alert("Schedine chiuse!");
        return;
    }

    const resInput = document.getElementById(`pred-res-${matchId}`);
    const scorerInput = document.getElementById(`pred-scorer-${matchId}`);
    const assistInput = document.getElementById(`pred-assist-${matchId}`);
    const ownGoalInput = document.getElementById(`pred-owngoal-${matchId}`);

    const res = resInput ? resInput.value.trim() : '';
    const scorer = scorerInput ? scorerInput.value.trim() : '';
    const assist = assistInput ? assistInput.value.trim() : '';
    const ownGoal = ownGoalInput ? ownGoalInput.value.trim() : '';

    const currentUser = getCurrentUser();
    let predictions = JSON.parse(localStorage.getItem('predictions')) || {};

    if (!predictions[currentUser]) {
        predictions[currentUser] = {};
    }

    predictions[currentUser][matchId] = { res, scorer, assist, ownGoal };
    localStorage.setItem('predictions', JSON.stringify(predictions));
    
    alert('Pronostico salvato con successo!');
}

function deletePrediction(matchId) {
    if (isPredictionsLocked()) {
        alert("Schedine chiuse!");
        return;
    }

    const currentUser = getCurrentUser();
    let predictions = JSON.parse(localStorage.getItem('predictions')) || {};

    if (predictions[currentUser] && predictions[currentUser][matchId]) {
        delete predictions[currentUser][matchId];
        localStorage.setItem('predictions', JSON.stringify(predictions));
        alert('Pronostico cancellato!');
        loadHubMatches();
    }
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
        let userHtml = `<div class="card"><h3>👤 Player: ${user}</h3>`;
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

function calculateAllPoints() {
    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    let predictions = JSON.parse(localStorage.getItem('predictions')) || {};
    let scores = {};

    Object.keys(predictions).forEach(user => {
        scores[user] = 0;
        let userMatches = predictions[user];

        matches.forEach(match => {
            if (!match.result) return; 

            let pred = userMatches[match.id];
            if (!pred) return;

            let realRes = match.result; 
            let userRes = pred.res;       

            if (userRes === realRes && realRes !== "") {
                scores[user] += 3;
            } else if (userRes && realRes) {
                let [rHome, rAway] = realRes.split('-').map(Number);
                let [uHome, uAway] = userRes.split('-').map(Number);

                if (!isNaN(rHome) && !isNaN(uHome) && !isNaN(rAway) && !isNaN(uAway)) {
                    let realWinner = Math.sign(rHome - rAway);
                    let userWinner = Math.sign(uHome - uAway);

                    if (realWinner === userWinner) {
                        scores[user] += 1;
                    }
                }
            }

            if (match.scorer && pred.scorer && match.scorer.toLowerCase().trim() === pred.scorer.toLowerCase().trim()) {
                scores[user] += 2;
            }

            if (match.assist && pred.assist && match.assist.toLowerCase().trim() === pred.assist.toLowerCase().trim()) {
                scores[user] += 0.5;
            }

            if (match.ownGoal && pred.ownGoal && match.ownGoal.toLowerCase().trim() === pred.ownGoal.toLowerCase().trim()) {
                scores[user] -= 2;
            }
        });
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
        tbody.innerHTML += `
            <tr>
                <td>#${index + 1}</td>
                <td>${user}</td>
                <td><strong>${scores[user]}</strong> pt</td>
            </tr>
        `;
    });
}

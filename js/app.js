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
        userDisplay.innerText = `👤 ${user} (${getCurrentRole()})`;
    }

    const adminLink = document.getElementById('admin-link');
    if (adminLink && getCurrentRole() === 'admin') {
        adminLink.style.display = 'inline';
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
        alert('Pronostici chiusi! I punti sono stati attivati e calcolati.');
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
        desc.innerText = "Le schedine sono CHIUSE. I player non possono più modificarle e i punteggi sono attivi.";
        btn.innerText = "Riapri Pronostici";
        btn.className = "";
    } else {
        desc.innerText = "Le schedine sono APERTE. I player possono inserire e modificare i pronostici.";
        btn.innerText = "Chiudi Pronostici";
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
        id: Date.now() + Math.random(),
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
                <strong>${match.home} vs ${match.away}</strong>
                <p>Status: ${match.result ? 'Completata (' + match.result + ')' : 'In attesa'}</p>
                <input type="text" id="res-${match.id}" placeholder="Risultato Reale (es. 2-1)" value="${match.result || ''}">
                <input type="text" id="scorer-${match.id}" placeholder="Marcatore Reale" value="${match.scorer || ''}">
                <input type="text" id="assist-${match.id}" placeholder="Assist Reale" value="${match.assist || ''}">
                <input type="text" id="owngoal-${match.id}" placeholder="Autogol Reale" value="${match.ownGoal || ''}">
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button onclick="saveRealResult(${match.id})">Salva Risultato e Ricalcola</button>
                    <button class="btn-danger" onclick="deleteMatch(${match.id})" style="width: auto;">Elimina Partita</button>
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
    alert('Dati salvati e punti aggiornati!');
    loadAdminMatches();
}

function deleteMatch(matchId) {
    if (!confirm("Sei sicuro di voler eliminare questa partita dall'elenco?")) return;

    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    matches = matches.filter(m => m.id != matchId);
    localStorage.setItem('matches', JSON.stringify(matches));

    calculateAllPoints();
    loadAdminMatches();
}

function loadHubMatches() {
    const container = document.getElementById('matches-list');
    const statusContainer = document.getElementById('lock-status');
    if (!container) return;

    let locked = isPredictionsLocked();
    if (statusContainer) {
        if (locked) {
            statusContainer.innerHTML = "<span style='color: var(--danger);'>🔒 Schedine Chiuse dall'Admin. Non puoi più modificare i pronostici.</span>";
        } else {
            statusContainer.innerHTML = "<span style='color: var(--primary);'>🔓 Schedine Aperte. Inserisci o modifica i tuoi pronostici.</span>";
        }
    }

    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    let predictions = JSON.parse(localStorage.getItem('predictions')) || {};
    const currentUser = getCurrentUser();

    container.innerHTML = '';

    if (matches.length === 0) {
        container.innerHTML = '<p>Nessuna partita disponibile.</p>';
        return;
    }

    matches.forEach(match => {
        let userPred = predictions[currentUser]?.[match.id] || { res: '', scorer: '', assist: '', ownGoal: '' };
        let disabledAttr = locked ? 'disabled style="opacity: 0.6;"' : '';
        let btnDisplay = locked ? 'style="display:none;"' : '';

        container.innerHTML += `
            <div class="match-box">
                <h3>${match.home} vs ${match.away}</h3>
                <label>Risultato Esatto:</label>
                <input type="text" id="pred-res-${match.id}" value="${userPred.res}" placeholder="es. 2-1" ${disabledAttr}>
                
                <label>Marcatore (+2 pt):</label>
                <input type="text" id="pred-scorer-${match.id}" value="${userPred.scorer}" placeholder="es. Lautaro" ${disabledAttr}>
                
                <label>Assist (+0.5 pt):</label>
                <input type="text" id="pred-assist-${match.id}" value="${userPred.assist}" placeholder="es. Barella" ${disabledAttr}>
                
                <label>Autogol (-2 pt):</label>
                <input type="text" id="pred-owngoal-${match.id}" value="${userPred.ownGoal}" placeholder="es. Gatti" ${disabledAttr}>
                
                <div style="display: flex; gap: 10px; margin-top: 10px; ${btnDisplay}">
                    <button onclick="savePrediction(${match.id})">Salva Pronostico</button>
                    <button class="btn-danger" onclick="deletePrediction(${match.id})" style="width: auto;">Cancella Pronostico</button>
                </div>
            </div>
        `;
    });
}

function savePrediction(matchId) {
    if (isPredictionsLocked()) {
        alert("Le schedine sono state chiuse dall'admin! Impossibile salvare.");
        return;
    }

    const res = document.getElementById(`pred-res-${matchId}`).value.trim();
    const scorer = document.getElementById(`pred-scorer-${matchId}`).value.trim();
    const assist = document.getElementById(`assist-${matchId}`).value.trim();
    const ownGoal = document.getElementById(`pred-owngoal-${matchId}`).value.trim();
    const currentUser = getCurrentUser();

    let predictions = JSON.parse(localStorage.getItem('predictions')) || {};
    if (!predictions[currentUser]) predictions[currentUser] = {};

    predictions[currentUser][matchId] = { res, scorer, assist, ownGoal };
    localStorage.setItem('predictions', JSON.stringify(predictions));
    
    alert('Pronostico salvato con successo!');
}

// CANCELLAZIONE SINGOLO PRONOSTICO PER IL PLAYER
function deletePrediction(matchId) {
    if (isPredictionsLocked()) {
        alert("Le schedine sono chiuse! Impossibile cancellare.");
        return;
    }

    const currentUser = getCurrentUser();
    let predictions = JSON.parse(localStorage.getItem('predictions')) || {};

    if (predictions[currentUser] && predictions[currentUser][matchId]) {
        delete predictions[currentUser][matchId];
        localStorage.setItem('predictions', JSON.stringify(predictions));
        alert('Pronostico rimosso per questa partita!');
        loadHubMatches();
    } else {
        alert('Nessun pronostico presente da cancellare.');
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
        container.innerHTML = '<p>Nessun pronostico inserito dai player finora.</p>';
        return;
    }

    users.forEach(user => {
        let userHtml = `<div class="card"><h3>👤 Giocatore: ${user}</h3>`;
        let userPreds = predictions[user];

        matches.forEach(match => {
            let p = userPreds[match.id];
            userHtml += `
                <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid var(--border);">
                    <strong>${match.home} vs ${match.away}</strong><br>
                    <span>Risultato: <strong>${p ? (p.res || '-') : '-'}</strong></span> | 
                    <span>Marcatore: <strong>${p ? (p.scorer || '-') : '-'}</strong></span> | 
                    <span>Assist: <strong>${p ? (p.assist || '-') : '-'}</strong></span> | 
                    <span>Autogol: <strong>${p ? (p.ownGoal || '-') : '-'}</strong></span>
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

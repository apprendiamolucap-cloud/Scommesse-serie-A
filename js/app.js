// Gestione Utente e Autenticazione
let currentUsername = localStorage.getItem('username');
let currentUserRole = localStorage.getItem('role');

function login() {
    const username = document.getElementById('username').value.trim();
    const role = document.getElementById('role').value;

    if (!username) {
        alert('Inserisci un username valido!');
        return;
    }

    localStorage.setItem('username', username);
    localStorage.setItem('role', role);
    window.location.href = 'hub.html';
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

function checkAuth() {
    if (!currentUsername) {
        window.location.href = 'index.html';
        return;
    }
    const userDisplay = document.getElementById('user-display');
    if (userDisplay) userDisplay.innerText = `Utente: ${currentUsername} (${currentUserRole})`;

    const adminLink = document.getElementById('admin-link');
    if (adminLink && currentUserRole === 'admin') {
        adminLink.style.display = 'inline';
    }
}

// Funzionalità Admin: Aggiungi Partita
function addMatch() {
    const home = document.getElementById('homeTeam').value.trim();
    const away = document.getElementById('awayTeam').value.trim();

    if (!home || !away) {
        alert('Inserisci entrambe le squadre');
        return;
    }

    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    matches.push({
        id: Date.now(),
        home: home,
        away: away,
        result: null, // es. "2-1"
        scorer: null   // es. "Lautaro"
    });

    localStorage.setItem('matches', JSON.stringify(matches));
    alert('Partita aggiunta con successo!');
    document.getElementById('homeTeam').value = '';
    document.getElementById('awayTeam').value = '';
    loadAdminMatches();
}

function loadAdminMatches() {
    const container = document.getElementById('admin-matches-list');
    if (!container) return;

    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    container.innerHTML = '';

    if (matches.length === 0) {
        container.innerHTML = '<p>Nessuna partita inserita.</p>';
        return;
    }

    matches.forEach(match => {
        container.innerHTML += `
            <div class="match-box">
                <strong>${match.home} vs ${match.away}</strong>
                <p>Risultato Reale attuale: ${match.result ? match.result : 'Non ancora giocata'}</p>
                <input type="text" id="res-${match.id}" placeholder="Risultato esatto (es. 2-1)">
                <input type="text" id="scorer-${match.id}" placeholder="Marcatore (es. Lautaro)">
                <button onclick="saveRealResult(${match.id})">Salva Risultato e Calcola Punti</button>
            </div>
        `;
    });
}

// Salva Risultato Reale e Calcola Punti per tutti i player
function saveRealResult(matchId) {
    const res = document.getElementById(`res-${matchId}`).value.trim();
    const scorer = document.getElementById(`scorer-${matchId}`).value.trim();

    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    matches = matches.map(m => {
        if (m.id === matchId) {
            m.result = res;
            m.scorer = scorer;
        }
        return m;
    });
    localStorage.setItem('matches', JSON.stringify(matches));

    calculateAllPoints();
    alert('Risultato salvato e classifica aggiornata!');
}

// Hub Player: Carica Partite e Pronostici
function loadHubMatches() {
    const container = document.getElementById('matches-list');
    if (!container) return;

    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    let predictions = JSON.parse(localStorage.getItem('predictions')) || {};

    container.innerHTML = '';
    if (matches.length === 0) {
        container.innerHTML = '<p>Nessuna partita disponibile al momento.</p>';
        return;
    }

    matches.forEach(match => {
        let userPred = predictions[currentUsername]?.[match.id] || { res: '', scorer: '' };

        container.innerHTML += `
            <div class="match-box">
                <h3>${match.home} vs ${match.away}</h3>
                <label>Tuo Pronostico Risultato Esatto:</label>
                <input type="text" id="pred-res-${match.id}" value="${userPred.res}" placeholder="es. 2-1">
                <label>Tuo Marcatore Scelto:</label>
                <input type="text" id="pred-scorer-${match.id}" value="${userPred.scorer}" placeholder="es. Lautaro">
                <button onclick="savePrediction(${match.id})">Salva Pronostico</button>
            </div>
        `;
    });
}

function savePrediction(matchId) {
    const res = document.getElementById(`pred-res-${matchId}`).value.trim();
    const scorer = document.getElementById(`pred-scorer-${matchId}`).value.trim();

    let predictions = JSON.parse(localStorage.getItem('predictions')) || {};
    if (!predictions[currentUsername]) {
        predictions[currentUsername] = {};
    }

    predictions[currentUsername][matchId] = { res, scorer };
    localStorage.setItem('predictions', JSON.stringify(predictions));
    alert('Pronostico salvato con successo!');
}

// Algoritmo di Calcolo Punti (Regolamento richiesto)
function calculateAllPoints() {
    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    let predictions = JSON.parse(localStorage.getItem('predictions')) || {};
    let scores = {};

    // Inizializza i punti dei player
    Object.keys(predictions).forEach(user => {
        scores[user] = 0;
        let userMatches = predictions[user];

        matches.forEach(match => {
            if (!match.result) return; // Se la partita non ha un risultato reale, salta

            let pred = userMatches[match.id];
            if (!pred) return;

            let realRes = match.result; // es. "2-1"
            let userRes = pred.res;       // es. "2-1"

            // 1. Risultato Esatto = 3 punti
            if (userRes === realRes) {
                scores[user] += 3;
            } else {
                // Controlliamo se ha preso almeno il segno (squadra vincitrice) = 1 punto
                let [rHome, rAway] = realRes.split('-').map(Number);
                let [uHome, uAway] = userRes.split('-').map(Number);
                
                if (!isNaN(rHome) && !isNaN(uHome)) {
                    let realWinner = Math.sign(rHome - rAway);
                    let userWinner = Math.sign(uHome - uAway);
                    if (realWinner === userWinner) {
                        scores[user] += 1; // Squadra vincente scelta ma non risultato esatto
                    }
                }
            }

            // 2. Marcatore = 2 punti
            if (match.scorer && pred.scorer && match.scorer.toLowerCase() === pred.scorer.toLowerCase()) {
                scores[user] += 2;
            }
        });
    });

    localStorage.setItem('scores', JSON.stringify(scores));
}

// Carica Classifica
function loadLeaderboard() {
    const tbody = document.getElementById('ranking-body');
    if (!tbody) return;

    let scores = JSON.parse(localStorage.getItem('scores')) || {};
    
    // Ordina i player in base ai punti decrescenti
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


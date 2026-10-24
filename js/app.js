// --- GESTIONE UTENTE E AUTENTICAZIONE ---

function getCurrentUser() {
    return localStorage.getItem('username');
}

function getCurrentRole() {
    return localStorage.getItem('role');
}

function login() {
    const username = document.getElementById('username').value.trim();
    const role = document.getElementById('role').value;

    if (!username) {
        alert('Inserisci un username valido!');
        return;
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
        userDisplay.innerText = `Utente: ${user} (${getCurrentRole()})`;
    }

    const adminLink = document.getElementById('admin-link');
    if (adminLink && getCurrentRole() === 'admin') {
        adminLink.style.display = 'inline';
    }
}


// --- FUNZIONI ADMIN (CREAZIONE E GESTIONE PARTITE) ---

function addMatch() {
    const home = document.getElementById('homeTeam').value.trim();
    const away = document.getElementById('awayTeam').value.trim();

    if (!home || !away) {
        alert('Inserisci entrambe le squadre!');
        return;
    }

    // Recupera la lista globale delle partite (condivisa con tutti i player)
    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    
    const newMatch = {
        id: Date.now(),
        home: home,
        away: away,
        result: null, 
        scorer: null,  
        assist: null,  
        ownGoal: null  
    };

    matches.push(newMatch);
    
    // Salva nel localStorage globale
    localStorage.setItem('matches', JSON.stringify(matches));
    
    alert('Partita creata e salvata con successo!');
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
        container.innerHTML = '<p>Nessuna partita inserita al momento. Usa il form sopra per crearne una.</p>';
        return;
    }

    matches.forEach(match => {
        container.innerHTML += `
            <div class="match-box">
                <strong>${match.home} vs ${match.away}</strong>
                <p>Status: ${match.result ? 'Completata (' + match.result + ')' : 'In attesa del risultato'}</p>
                <input type="text" id="res-${match.id}" placeholder="Risultato Reale (es. 2-1)" value="${match.result || ''}">
                <input type="text" id="scorer-${match.id}" placeholder="Marcatore Reale (es. Lautaro)" value="${match.scorer || ''}">
                <input type="text" id="assist-${match.id}" placeholder="Assistman Reale (es. Barella)" value="${match.assist || ''}">
                <input type="text" id="owngoal-${match.id}" placeholder="Autogol Reale (es. Gatti)" value="${match.ownGoal || ''}">
                <button onclick="saveRealResult(${match.id})">Salva Risultato e Calcola Punti</button>
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
        if (m.id === Number(matchId)) {
            m.result = res;
            m.scorer = scorer;
            m.assist = assist;
            m.ownGoal = ownGoal;
        }
        return m;
    });

    localStorage.setItem('matches', JSON.stringify(matches));
    calculateAllPoints();
    alert('Risultato salvato e punti ricalcolati per tutti i player!');
    loadAdminMatches();
}


// --- FUNZIONI PLAYER (HUB E PRONOSTICI) ---

function loadHubMatches() {
    const container = document.getElementById('matches-list');
    if (!container) return;

    // Legge l'elenco globale delle partite create dall'admin
    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    let predictions = JSON.parse(localStorage.getItem('predictions')) || {};
    const currentUser = getCurrentUser();

    container.innerHTML = '';

    if (matches.length === 0) {
        container.innerHTML = '<p>Nessuna partita creata dall\'admin per questa giornata.</p>';
        return;
    }

    matches.forEach(match => {
        let userPred = predictions[currentUser]?.[match.id] || { res: '', scorer: '', assist: '', ownGoal: '' };

        container.innerHTML += `
            <div class="match-box">
                <h3>${match.home} vs ${match.away}</h3>
                <label>Risultato Esatto:</label>
                <input type="text" id="pred-res-${match.id}" value="${userPred.res}" placeholder="es. 2-1">
                
                <label>Marcatore Scelto (+2 pt):</label>
                <input type="text" id="pred-scorer-${match.id}" value="${userPred.scorer}" placeholder="es. Lautaro">
                
                <label>Assistman Scelto (+0.5 pt):</label>
                <input type="text" id="pred-assist-${match.id}" value="${userPred.assist}" placeholder="es. Barella">
                
                <label>Autogol Previsto (-2 pt):</label>
                <input type="text" id="pred-owngoal-${match.id}" value="${userPred.ownGoal}" placeholder="es. Gatti">
                
                <button onclick="savePrediction(${match.id})">Salva Pronostico</button>
            </div>
        `;
    });
}

function savePrediction(matchId) {
    const res = document.getElementById(`pred-res-${matchId}`).value.trim();
    const scorer = document.getElementById(`pred-scorer-${matchId}`).value.trim();
    const assist = document.getElementById(`pred-assist-${matchId}`).value.trim();
    const ownGoal = document.getElementById(`pred-owngoal-${matchId}`).value.trim();
    const currentUser = getCurrentUser();

    let predictions = JSON.parse(localStorage.getItem('predictions')) || {};

    if (!predictions[currentUser]) {
        predictions[currentUser] = {};
    }

    predictions[currentUser][matchId] = { res, scorer, assist, ownGoal };
    localStorage.setItem('predictions', JSON.stringify(predictions));
    
    calculateAllPoints();
    alert('Pronostico salvato con successo!');
}


// --- ALGORITMO DI CALCOLO PUNTEGGI ---

function calculateAllPoints() {
    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    let predictions = JSON.parse(localStorage.getItem('predictions')) || {};
    let scores = {};

    Object.keys(predictions).forEach(user => {
        scores[user] = 0;
        let userMatches = predictions[user];

        matches.forEach(match => {
            if (!match.result) return; // Salta se non c'è un risultato reale inserito

            let pred = userMatches[match.id];
            if (!pred) return;

            let realRes = match.result; 
            let userRes = pred.res;       

            // 1. Risultato Esatto (+3 pt) o Segno/Squadra Vincitrice (+1 pt)
            if (userRes === realRes && realRes !== "") {

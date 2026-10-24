/* ==========================================================================
   0. CONFIGURAZIONE & GOOGLE AUTH VIA FIREBASE CDN
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

let auth, googleProvider;
try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    googleProvider = new firebase.auth.GoogleAuthProvider();
} catch (e) {
    console.log("Firebase SDK in caricamento...");
}

function loginWithGoogle() {
    if (!auth) return alert("Firebase non è pronto. Ricarica la pagina.");

    const roleInput = document.getElementById('role');
    const adminCodeInput = document.getElementById('admin-code');
    const selectedRole = roleInput ? roleInput.value : 'player';

    if (selectedRole === 'admin' && adminCodeInput && adminCodeInput.value.trim() !== 'jamal') {
        return alert('Codice segreto Admin errato! Accesso negato.');
    }

    auth.signInWithPopup(googleProvider)
        .then((result) => {
            const user = result.user;
            const username = user.displayName || user.email.split('@')[0];
            
            localStorage.setItem('username', username);
            localStorage.setItem('role', selectedRole);
            
            let profiles = JSON.parse(localStorage.getItem('userProfiles')) || {};
            if (!profiles[username]) {
                profiles[username] = {
                    avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=151f32&color=00e5ff&size=128`,
                    color: '#f8fafc',
                    unlockedColors: ['#f8fafc'],
                    completedMissions: [],
                    customAvatar: false
                };
            } else if (user.photoURL && !profiles[username].customAvatar) {
                profiles[username].avatar = user.photoURL;
            }

            localStorage.setItem('userProfiles', JSON.stringify(profiles));
            window.location.href = (selectedRole === 'admin') ? 'admin.html' : 'hub.html';
        })
        .catch((error) => {
            console.error("ERRORE AUTH:", error);
            alert("Errore Google Login: " + error.message);
        });
}


/* ==========================================================================
   1. GESTIONE MENU A TENDINA & SCHERMO
   ========================================================================== */
function toggleNavMenu() {
    const navMenu = document.getElementById('nav-menu');
    if (navMenu) {
        navMenu.classList.toggle('show');
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
        if (btn) btn.innerText = '📱 Vista Tel';
    } else {
        document.body.classList.remove('pc-mode');
        if (btn) btn.innerText = '🖥️ Vista PC';
    }
}


/* ==========================================================================
   2. LOGHI & ROSE SQUADRE SERIE A
   ========================================================================== */
const TEAM_LOGOS = {
    "inter": "https://media.api-sports.io/football/teams/505.png",
    "milan": "https://media.api-sports.io/football/teams/489.png",
    "juventus": "https://media.api-sports.io/football/teams/496.png",
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
    if (TEAM_LOGOS[cleanName]) return TEAM_LOGOS[cleanName];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=151f32&color=00e5ff&size=64&font-size=0.4`;
}

const SERIE_A_ROSTERS = {
    "inter": ["Lautaro Martinez", "Thuram", "Taremi", "Calhanoglu", "Barella", "Mkhitaryan", "Dimarco", "Bastoni", "Pavard", "Dumfries", "Acerbi", "Sommer", "Zielinski", "Frattesi"],
    "milan": ["Leao", "Pulisic", "Morata", "Abraham", "Loftus-Cheek", "Reijnders", "Fofana", "Theo Hernandez", "Tomori", "Calabria", "Maignan", "Okafor", "Chukwueze"],
    "juventus": ["Vlahovic", "Yildiz", "Koopmeiners", "Nico Gonzalez", "Conceicao", "Douglas Luiz", "Locatelli", "Cambiaso", "Bremer", "Gatti", "Di Gregorio", "McKennie"],
    "napoli": ["Lukaku", "Kvaratskhelia", "Politano", "McTominay", "Anguissa", "Lobotka", "Di Lorenzo", "Rrahmani", "Buongiorno", "Olivera", "Meret", "Raspadori", "Simeone"],
    "roma": ["Dybala", "Dovbyk", "Soulé", "Pellegrini", "Cristante", "Koné", "Angeliño", "Mancini", "Ndicka", "Celik", "Svilar", "El Shaarawy", "Baldanzi"],
    "lazio": ["Castellanos", "Dia", "Zaccagni", "Isaksen", "Guendouzi", "Rovella", "Vecino", "Tavares", "Romagnoli", "Gila", "Provedel", "Pedro", "Noslin"],
    "atalanta": ["Retegui", "Lookman", "De Ketelaere", "Ederson", "De Roon", "Zappacosta", "Ruggeri", "Djimsiti", "Hien", "Carnesecchi", "Pasalic", "Zaniolo"],
    "fiorentina": ["Kean", "Gudmundsson", "Colpani", "Bove", "Cataldi", "Mandragora", "Dodo", "Ranieri", "Comuzzo", "Gosens", "De Gea", "Beltran", "Kouamé"],
    "bologna": ["Castro", "Dallinga", "Orsolini", "Ndoye", "Fabbian", "Freuler", "Ferguson", "Posch", "Beukema", "Lucumi", "Skorupski", "Odgaard", "Iling-Junior"],
    "torino": ["Zapata", "Sanabria", "Adams", "Vlasic", "Ricci", "Ilic", "Lazaro", "Bellanova", "Coco", "Milinkovic-Savic", "Vojvoda"],
    "udinese": ["Lucca", "Thauvin", "Brenner", "Lovric", "Payero", "Karlstrom", "Ehizibue", "Kamara", "Bijol", "Giannetti", "Okoye", "Davis"],
    "lecce": ["Krstovic", "Banda", "Morente", "Rafia", "Ramadani", "Coulibaly", "Gallo", "Baschirotto", "Gaspar", "Guilbert", "Falcone", "Pierotti", "Rebic"],
    "cagliari": ["Piccoli", "Luvumbo", "Viola", "Gaetano", "Marin", "Makoumbou", "Zappa", "Mina", "Luperto", "Augello", "Scuffet", "Pavoletti"],
    "monza": ["Djuric", "Maldini", "Caprari", "Pessina", "Bondo", "Akpa Akpro", "Kyriakopoulos", "Pablo Marí", "Izzo", "Birindelli", "Turati", "Mota"],
    "verona": ["Tengstedt", "Mosquera", "Suslov", "Lazovic", "Duda", "Belahyane", "Tchatchoua", "Coppola", "Magnani", "Bradaric", "Montipo"],
    "empoli": ["Colombo", "Esposito", "Fazzini", "Henderson", "Grassi", "Anjorin", "Gyasi", "Viti", "Ismajli", "Cacace", "Vasquez"],
    "parma": ["Bonny", "Man", "Mihaila", "Bernabe", "Sohm", "Estevez", "Valeri", "Del Prato", "Circati", "Coulibaly", "Suzuki"],
    "genoa": ["Pinamonti", "Vitinha", "Messias", "Malinovskyi", "Badelj", "Frendrup", "Martin", "Bani", "Vogliacco", "Sabelli", "Leali"],
    "como": ["Cutrone", "Belotti", "Strefezza", "Nico Paz", "Perrone", "Sergi Roberto", "Moreno", "Dossena", "Goldaniga", "Smolcic", "Audero"],
    "venezia": ["Pohjanpalo", "Oristanio", "Ellertsson", "Duncan", "Nicolussi Caviglia", "Zampano", "Svoboda", "Idzes", "Candela", "Joronen"],
    "default": ["Giocatore 1", "Giocatore 2", "Giocatore 3"]
};

function getTeamPlayers(teamName) {
    if (!teamName) return SERIE_A_ROSTERS["default"];
    const cleanName = teamName.toLowerCase().trim();
    for (let key in SERIE_A_ROSTERS) {
        if (cleanName.includes(key)) return SERIE_A_ROSTERS[key];
    }
    return SERIE_A_ROSTERS["default"];
}

const MISSIONS = [
    { id: 'submit_schedina', name: 'Esordiente', desc: 'Invia la tua prima schedina', rewardColor: '#00e5ff', rewardName: 'Cyan Neon' },
    { id: 'use_joker', name: 'Tattico', desc: 'Usa il Jolly su una partita', rewardColor: '#00e676', rewardName: 'Emerald Green' },
    { id: 'top_scorer', name: 'Puntatore', desc: 'Raggiungi 10 o più Punti Totali', rewardColor: '#ffd700', rewardName: 'Gold Champion' }
];


/* ==========================================================================
   3. AUTENTICAZIONE & PROFILI UTENTE
   ========================================================================== */
function getCurrentUser() { return localStorage.getItem('username'); }
function getCurrentRole() { return localStorage.getItem('role'); }

function login() {
    const usernameInput = document.getElementById('username');
    const roleInput = document.getElementById('role');
    const adminCodeInput = document.getElementById('admin-code');
    
    if (!usernameInput || !roleInput) return;
    const username = usernameInput.value.trim();
    const role = roleInput.value;

    if (!username) return alert('Inserisci un username valido!');
    if (role === 'admin' && adminCodeInput && adminCodeInput.value.trim() !== 'jamal') {
        return alert('Codice segreto Admin errato! Accesso negato.');
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
    if (!user) { window.location.href = 'index.html'; return; }
    
    const userDisplay = document.getElementById('user-display');
    if (userDisplay) userDisplay.innerText = `👤 ${user}`;

    const adminLink = document.getElementById('admin-link');
    if (adminLink && getCurrentRole() === 'admin') adminLink.style.display = 'block';
}

function getUserProfile(username) {
    let profiles = JSON.parse(localStorage.getItem('userProfiles')) || {};
    if (!profiles[username]) {
        profiles[username] = {
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=151f32&color=00e5ff&size=128`,
            color: '#f8fafc',
            unlockedColors: ['#f8fafc'],
            completedMissions: [],
            customAvatar: false
        };
        localStorage.setItem('userProfiles', JSON.stringify(profiles));
    }
    return profiles[username];
}

function updateUserAvatar() {
    const avatarInput = document.getElementById('avatar-url-input');
    if (!avatarInput) return;
    const avatarUrl = avatarInput.value.trim();
    if (!avatarUrl) return alert("Inserisci un URL immagine valido!");

    const currentUser = getCurrentUser();
    let profiles = JSON.parse(localStorage.getItem('userProfiles')) || {};
    let profile = getUserProfile(currentUser);
    
    profile.avatar = avatarUrl;
    profile.customAvatar = true;
    profiles[currentUser] = profile;
    
    localStorage.setItem('userProfiles', JSON.stringify(profiles));
    alert("Foto profilo aggiornata!");
    location.reload();
}

function selectNameColor(colorHex) {
    const currentUser = getCurrentUser();
    let profiles = JSON.parse(localStorage.getItem('userProfiles')) || {};
    let profile = getUserProfile(currentUser);

    if (!profile.unlockedColors.includes(colorHex)) return alert("Colore non sbloccato!");
    profile.color = colorHex;
    profiles[currentUser] = profile;
    localStorage.setItem('userProfiles', JSON.stringify(profiles));
    alert("Colore del nome aggiornato!");
    location.reload();
}


/* ==========================================================================
   4. HUB PRONOSTICI (ISOLAMENTO PER NOME UTENTE)
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

    // Carica SOLO i pronostici dell'utente corrente
    let userPredictions = predictions[currentUser] || {};
    let userHasSubmitted = Object.keys(userPredictions).length > 0;
    let globalLocked = isPredictionsLocked();
    let userJoker = jokers[currentUser] || null;

    if (statusContainer) {
        if (globalLocked || userHasSubmitted) {
            statusContainer.innerHTML = "<p style='color: var(--danger); font-weight:bold;'>🔒 Schedina inviata o bloccata. Impossibile modificare.</p>";
        } else {
            statusContainer.innerHTML = "<p style='color: var(--primary-green); font-weight:bold;'>🔓 Schedina Aperta. Scegli il tuo Jolly e inserisci i pronostici!</p>";
        }
    }

    container.innerHTML = '';
    if (matches.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: var(--text-muted); padding: 20px;">Nessuna partita disponibile. L\'admin deve caricare la giornata!</p>';
        return;
    }

    matches.forEach(match => {
        let userPred = userPredictions[match.id] || { res: '', scorer: '', assist: '', ownGoal: '' };

        let isLockedForUser = globalLocked || userHasSubmitted;
        let disabledAttr = isLockedForUser ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : '';
        let isJokerChecked = userJoker == match.id ? 'checked' : '';

        let matchPlayers = [...getTeamPlayers(match.home), ...getTeamPlayers(match.away)];
        
        let playerOptions = `<option value="">-- Nessuno / Seleziona --</option>`;
        let assistOptions = `<option value="">-- Nessuno / Seleziona --</option>`;
        let ownGoalOptions = `<option value="">-- Nessuno --</option>`;

        matchPlayers.forEach(p => {
            playerOptions += `<option value="${p}" ${userPred.scorer === p ? 'selected' : ''}>${p}</option>`;
            assistOptions += `<option value="${p}" ${userPred.assist === p ? 'selected' : ''}>${p}</option>`;
            ownGoalOptions += `<option value="${p}" ${userPred.ownGoal === p ? 'selected' : ''}>${p}</option>`;
        });

        container.innerHTML += `
            <div class="match-box" style="${userJoker == match.id ? 'border: 2px solid #ffd700;' : ''}">
                <div class="match-header">
                    <div class="team-badge"><img src="${getTeamLogo(match.home)}" alt="${match.home}"><span>${match.home}</span></div>
                    <div class="vs-divider">VS</div>
                    <div class="team-badge"><img src="${getTeamLogo(match.away)}" alt="${match.away}"><span>${match.away}</span></div>
                </div>

                <div style="background:#0d1424; padding:8px 12px; border-radius:8px; margin-bottom:12px; display:flex; align-items:center; justify-content:space-between;">
                    <span style="font-size:0.85rem; font-weight:bold; color:#ffd700;">🌟 Match Jolly (Punti X2)</span>
                    <input type="radio" name="jokerMatch" value="${match.id}" ${isJokerChecked} ${disabledAttr} style="width:auto; margin:0;">
                </div>

                <label>Risultato Esatto (es. 2-1):</label>
                <input type="text" id="pred-res-${match.id}" value="${userPred.res || ''}" placeholder="es. 2-1" ${disabledAttr}>
                
                <label>Marcatore (+2 pt):</label>
                <select id="pred-scorer-${match.id}" ${disabledAttr}>${playerOptions}</select>
                
                <label>Assist (+0.5 pt):</label>
                <select id="pred-assist-${match.id}" ${disabledAttr}>${assistOptions}</select>
                
                <label>Autogol (-2 pt):</label>
                <select id="pred-owngoal-${match.id}" ${disabledAttr}>${ownGoalOptions}</select>
            </div>
        `;
    });

    if (!globalLocked && !userHasSubmitted) {
        container.innerHTML += `<div style="margin-top:20px;"><button onclick="submitAllPredictions()">🚀 Invia e Blocca Schedina</button></div>`;
    }
}

function submitAllPredictions() {
    if (isPredictionsLocked()) return alert("Schedine chiuse!");

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
        predictions[currentUser][match.id] = {
            res: resInput ? resInput.value.trim() : '',
            scorer: document.getElementById(`pred-scorer-${match.id}`).value,
            assist: document.getElementById(`pred-assist-${match.id}`).value,
            ownGoal: document.getElementById(`pred-owngoal-${match.id}`).value
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
    if (users.length === 0) { container.innerHTML = '<p>Nessun pronostico registrato.</p>'; return; }

    users.forEach(user => {
        let userProfile = getUserProfile(user);
        let userHtml = `<div class="card"><div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;"><img src="${userProfile.avatar}" style="width:36px; height:36px; border-radius:50%; object-fit:cover;"><h3 style="margin:0; color:${userProfile.color};">Player: ${user}</h3></div>`;
            
        matches.forEach(match => {
            let p = predictions[user][match.id];
            userHtml += `<div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--card-border);"><strong>${match.home} vs ${match.away}</strong><br><span style="font-size:0.85rem; color:var(--text-muted);">Risultato: <strong style="color:var(--primary-cyan);">${p ? (p.res || '-') : '-'}</strong> | Marcatore: <strong>${p ? (p.scorer || '-') : '-'}</strong> | Assist: <strong>${p ? (p.assist || '-') : '-'}</strong></span></div>`;
        });
        userHtml += `</div>`;
        container.innerHTML += userHtml;
    });
}


/* ==========================================================================
   5. PANNELLO ADMIN
   ========================================================================== */
function togglePredictionsLock() {
    let locked = isPredictionsLocked();
    localStorage.setItem('predictionsLocked', !locked);
    if (!locked) { calculateAllPoints(); alert('Pronostici chiusi e punti calcolati.'); }
    else { alert('Pronostici riaperti.'); }
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
        desc.innerText = "Le schedine sono APERTE.";
        btn.innerText = "Chiudi Pronostici Tutti";
        btn.className = "btn-danger";
    }
}

function addMatch() {
    const home = document.getElementById('homeTeam').value.trim();
    const away = document.getElementById('awayTeam').value.trim();
    if (!home || !away) return alert('Inserisci entrambe le squadre!');

    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    matches.push({ id: Date.now(), home, away, result: null, scorer: null, assist: null, ownGoal: null });
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
    loadAdminMatches();
}

function loadAdminMatches() {
    const container = document.getElementById('admin-matches-list');
    if (!container) return;

    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    container.innerHTML = '';
    if (matches.length === 0) { container.innerHTML = '<p>Nessuna partita presente.</p>'; return; }

    matches.forEach(match => {
        let matchPlayers = [...getTeamPlayers(match.home), ...getTeamPlayers(match.away)];
        
        let pOpts = `<option value="">-- Marcatore Reale --</option>`;
        let aOpts = `<option value="">-- Assist Reale --</option>`;
        let ogOpts = `<option value="">-- Autogol Reale --</option>`;

        matchPlayers.forEach(p => {
            pOpts += `<option value="${p}" ${match.scorer === p ? 'selected' : ''}>${p}</option>`;
            aOpts += `<option value="${p}" ${match.assist === p ? 'selected' : ''}>${p}</option>`;
            ogOpts += `<option value="${p}" ${match.ownGoal === p ? 'selected' : ''}>${p}</option>`;
        });

        container.innerHTML += `
            <div class="match-box">
                <div class="match-header">
                    <div class="team-badge"><img src="${getTeamLogo(match.home)}" alt="${match.home}"><span>${match.home}</span></div>
                    <div class="vs-divider">VS</div>
                    <div class="team-badge"><img src="${getTeamLogo(match.away)}" alt="${match.away}"><span>${match.away}</span></div>
                </div>
                <label>Risultato Reale (es. 2-1):</label>
                <input type="text" id="res-${match.id}" value="${match.result || ''}" placeholder="es. 2-1">
                <label>Marcatore Reale:</label>
                <select id="scorer-${match.id}">${pOpts}</select>
                <label>Assist Reale:</label>
                <select id="assist-${match.id}">${aOpts}</select>
                <label>Autogol Reale:</label>
                <select id="owngoal-${match.id}">${ogOpts}</select>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button onclick="saveRealResult(${match.id})">Salva e Ricalcola</button>
                    <button class="btn-danger" onclick="deleteMatch(${match.id})" style="width: auto;">Elimina</button>
                </div>
            </div>
        `;
    });
}

function saveRealResult(matchId) {
    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    matches = matches.map(m => {
        if (m.id == matchId) {
            const resInput = document.getElementById(`res-${matchId}`);
            m.result = resInput ? resInput.value.trim() : '';
            m.scorer = document.getElementById(`scorer-${matchId}`).value;
            m.assist = document.getElementById(`assist-${matchId}`).value;
            m.ownGoal = document.getElementById(`owngoal-${matchId}`).value;
        }
        return m;
    });
    localStorage.setItem('matches', JSON.stringify(matches));
    calculateAllPoints();
    alert('Risultati salvati e punti aggiornati!');
    loadAdminMatches();
}

function deleteMatch(matchId) {
    if (!confirm("Eliminare?")) return;
    let matches = JSON.parse(localStorage.getItem('matches')) || [];
    matches = matches.filter(m => m.id != matchId);
    localStorage.setItem('matches', JSON.stringify(matches));
    calculateAllPoints();
    loadAdminMatches();
}


/* ==========================================================================
   6. CLASSIFICA & MISSIONI
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
            if (pred.res === match.result && match.result !== "") {
                matchPoints += 3;
            } else if (pred.res && match.result) {
                let [rHome, rAway] = match.result.split('-').map(Number);
                let [uHome, uAway] = pred.res.split('-').map(Number);
                if (!isNaN(rHome) && !isNaN(uHome) && Math.sign(rHome - rAway) === Math.sign(uHome - uAway)) {
                    matchPoints += 1;
                }
            }

            if (match.scorer && pred.scorer && match.scorer.toLowerCase().trim() === pred.scorer.toLowerCase().trim()) matchPoints += 2;
            if (match.assist && pred.assist && match.assist.toLowerCase().trim() === pred.assist.toLowerCase().trim()) matchPoints += 0.5;
            if (match.ownGoal && pred.ownGoal && match.ownGoal.toLowerCase().trim() === pred.ownGoal.toLowerCase().trim()) matchPoints -= 2;

            if (userJokerMatchId == match.id) matchPoints *= 2;
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
    if (sortedUsers.length === 0) { tbody.innerHTML = '<tr><td colspan="3">Nessun punteggio.</td></tr>'; return; }

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
    if (!confirm("Azzerare la classifica?")) return;
    localStorage.removeItem('scores');
    alert('Classifica azzerata!');
    loadLeaderboard();
}

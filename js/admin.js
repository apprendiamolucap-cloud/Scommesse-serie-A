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

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
        container.innerHTML = '<p>Nessuna partita disponibile per questa giornata.</p>';
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

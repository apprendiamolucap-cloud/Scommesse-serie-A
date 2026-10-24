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

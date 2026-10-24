// Mappatura Loghi Squadre Serie A
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

// Configurazione Missioni Sblocco Colori
const MISSIONS = [
    { id: 'submit_schedina', name: 'Esordiente', desc: 'Invia la tua prima schedina', rewardColor: '#00e5ff', rewardName: 'Cyan Neon' },
    { id: 'use_joker', name: 'Tattico', desc: 'Usa il Jolly su una partita', rewardColor: '#00e676', rewardName: 'Emerald Green' },
    { id: 'top_scorer', name: 'Puntatore', desc: 'Raggiungi 10 o più Punti Totali', rewardColor: '#ffd700', rewardName: 'Gold Champion' }
];

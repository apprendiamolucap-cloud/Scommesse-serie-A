// Caricamento modulare automatico
const scripts = [
    'js/config.js',
    'js/auth.js',
    'js/hub.js',
    'js/admin.js',
    'js/leaderboard.js'
];

scripts.forEach(src => {
    let script = document.createElement('script');
    script.src = src;
    script.async = false;
    document.head.appendChild(script);
});

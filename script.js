// Coordonnées de secours si le fichier JSON ne charge pas
const backupRounds = [
    { "lat": 48.87812, "lng": 2.31131 },
    { "lat": 30.81657, "lng": 110.99619 },
    { "lat": 49.53657, "lng": -1.88234 },
    { "lat": 48.61850, "lng": -2.02386 },
];

let map;
let rounds = backupRounds;
let currentRound = 0;
let totalScore = 0;
let playerMarker = null;
let realMarker = null;
let line = null;
let selectedLatLng = null;
let timer = 60;
let timerInterval;

// On attend que la page soit totalement chargée
window.addEventListener('load', function() {
    console.log("Page chargée, initialisation...");
    initMap();
    startRound();
});

function initMap() {
    // Initialisation de la carte sur le div 'map'
    map = L.map('map').setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    map.on('click', function(e) {
        selectedLatLng = e.latlng;
        document.getElementById("validateButton").disabled = false;
        
        if (playerMarker) map.removeLayer(playerMarker);
        playerMarker = L.marker(selectedLatLng).addTo(map);
    });
    
    // Correction d'affichage Leaflet
    setTimeout(() => { map.invalidateSize(); }, 500);
}

function startRound() {
    if (playerMarker) map.removeLayer(playerMarker);
    if (realMarker) map.removeLayer(realMarker);
    if (line) map.removeLayer(line);
    
    selectedLatLng = null;
    document.getElementById("validateButton").disabled = true;
    document.getElementById("nextRoundButton").classList.add("hidden");
    document.getElementById("resultBox").classList.add("hidden");
    
    document.getElementById("roundInfo").textContent = (currentRound + 1) + " / " + rounds.length;
    document.getElementById("score").textContent = totalScore;
    
    timer = 60;
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    timer--;
    document.getElementById("timer").textContent = timer + "s";
    if (timer <= 0) {
        clearInterval(timerInterval);
        validateGuess();
    }
}

document.getElementById("validateButton").addEventListener("click", validateGuess);

function validateGuess() {
    clearInterval(timerInterval);
    document.getElementById("validateButton").disabled = true;

    const realLoc = rounds[currentRound];
    const realLatLng = L.latLng(realLoc.lat, realLoc.lng);
    realMarker = L.marker(realLatLng).addTo(map);

    if (selectedLatLng) {
        line = L.polyline([selectedLatLng, realLatLng], {color: 'red'}).addTo(map);
        const dist = map.distance(selectedLatLng, realLatLng) / 1000;
        const pts = Math.max(0, Math.round(5000 - dist));
        totalScore += pts;

        document.getElementById("resultBox").innerHTML = 
            "<h2>Résultat</h2><p>Distance: " + dist.toFixed(0) + " km</p><p>Score: +" + pts + "</p>";
    } else {
        document.getElementById("resultBox").innerHTML = "<h2>Temps écoulé !</h2><p>0 point</p>";
    }

    document.getElementById("resultBox").classList.remove("hidden");
    document.getElementById("nextRoundButton").classList.remove("hidden");
}

document.getElementById("nextRoundButton").addEventListener("click", function() {
    currentRound++;
    if (currentRound < rounds.length) {
        startRound();
    } else {
        document.getElementById("resultBox").innerHTML = "<h2>Partie finie !</h2><p>Score final: " + totalScore + "</p>";
        document.getElementById("nextRoundButton").classList.add("hidden");
    }
});

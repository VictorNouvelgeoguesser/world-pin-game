// DONNÉES DU JEU : Modifie les lat, lng et les images ici
const roundsData = [
    { "lat": 48.8584, "lng": 2.2945, "image": "assets/photo1.jpg" }, // Paris
    { "lat": 40.6892, "lng": -74.0445, "image": "assets/photo2.jpg" }, // New York
    { "lat": 35.6586, "lng": 139.7454, "image": "assets/photo3.jpg" }, // Tokyo
    { "lat": -22.9519, "lng": -43.2105, "image": "assets/photo4.jpg" }, // Rio
    { "lat": 27.1751, "lng": 78.0421, "image": "assets/photo5.jpg" }  // Taj Mahal
];

let map;
let currentRound = 0;
let totalScore = 0;
let playerMarker = null;
let realMarker = null;
let line = null;
let selectedLatLng = null;
let timer = 60;
let timerInterval;
let hasValidated = false; // Sécurité pour empêcher plusieurs validations

// Lancement au chargement de la page
window.addEventListener('load', function() {
    initMap();
    startRound();
});

function initMap() {
    // Création de la carte Leaflet
    map = L.map('map').setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // Clic sur la carte
    map.on('click', function(e) {
        // On ne peut changer son marqueur que si on n'a pas encore validé
        if (!hasValidated) {
            selectedLatLng = e.latlng;
            document.getElementById("validateButton").disabled = false;
            
            if (playerMarker) map.removeLayer(playerMarker);
            playerMarker = L.marker(selectedLatLng).addTo(map);
        }
    });

    // Correction de bug d'affichage Leaflet au démarrage
    setTimeout(() => { map.invalidateSize(); }, 500);
}

function startRound() {
    // Réinitialisation de l'état
    hasValidated = false;
    selectedLatLng = null;
    
    // Nettoyage carte
    if (playerMarker) map.removeLayer(playerMarker);
    if (realMarker) map.removeLayer(realMarker);
    if (line) map.removeLayer(line);
    
    // UI
    document.getElementById("validateButton").disabled = true;
    document.getElementById("validateButton").classList.remove("hidden");
    document.getElementById("nextRoundButton").classList.add("hidden");
    document.getElementById("resultBox").classList.add("hidden");
    
    // Mise à jour image et textes
    const round = roundsData[currentRound];
    document.getElementById("locationPhoto").src = round.image;
    document.getElementById("roundInfo").textContent = (currentRound + 1) + " / " + roundsData.length;
    document.getElementById("score").textContent = totalScore;
    
    // Timer
    timer = 60;
    document.getElementById("timer").textContent = timer + "s";
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    timer--;
    document.getElementById("timer").textContent = timer + "s";
    if (timer <= 0) {
        clearInterval(timerInterval);
        if (!hasValidated) validateGuess();
    }
}

document.getElementById("validateButton").addEventListener("click", function() {
    if (!hasValidated) validateGuess();
});

function validateGuess() {
    hasValidated = true; // On verrouille la validation
    clearInterval(timerInterval);
    
    document.getElementById("validateButton").disabled = true;
    document.getElementById("validateButton").classList.add("hidden"); // Cache le bouton valider

    const realLoc = roundsData[currentRound];
    const realLatLng = L.latLng(realLoc.lat, realLoc.lng);
    
    // Affiche la vraie position en rouge
    realMarker = L.circleMarker(realLatLng, { color: 'red', radius: 10 }).addTo(map);
    realMarker.bindPopup("C'était ici !").openPopup();

    if (selectedLatLng) {
        // Trace la ligne entre les deux
        line = L.polyline([selectedLatLng, realLatLng], {color: 'red', dashArray: '5, 10'}).addTo(map);
        
        // Calcul distance et score
        const dist = map.distance(selectedLatLng, realLatLng) / 1000;
        const pts = Math.max(0, Math.round(5000 - dist));
        totalScore += pts;

        document.getElementById("resultBox").innerHTML = 
            `<h2>Résultat</h2>
             <p>Distance : <strong>${dist.toFixed(0)} km</strong></p>
             <p>Score : <strong>+${pts} pts</strong></p>`;
    } else {
        document.getElementById("resultBox").innerHTML = `<h2>Temps écoulé !</h2><p>0 point gagné</p>`;
    }

    // Affiche le résultat et le bouton Suivant
    document.getElementById("resultBox").classList.remove("hidden");
    document.getElementById("nextRoundButton").classList.remove("hidden");
    
    // Zoom pour montrer les deux points
    if (selectedLatLng) {
        const group = new L.featureGroup([playerMarker, realMarker]);
        map.fitBounds(group.getBounds().pad(0.2));
    }
}

document.getElementById("nextRoundButton").addEventListener("click", function() {
    currentRound++;
    if (currentRound < roundsData.length) {
        map.setView([20, 0], 2); // Reset vue carte
        startRound();
    } else {
        document.getElementById("resultBox").innerHTML = 
            `<h2>Partie terminée !</h2>
             <p>Score final : <strong>${totalScore} points</strong></p>
             <button onclick="location.reload()" style="margin-top:15px; background:#3b82f6; color:white;">Rejouer</button>`;
        document.getElementById("nextRoundButton").classList.add("hidden");
    }
});

let map;
let rounds = [];
let currentRound = 0;
let totalScore = 0;
let playerMarker = null;
let realMarker = null;
let line = null;
let selectedLatLng = null;
let timer = 60;
let timerInterval;

// Éléments DOM
const validateButton = document.getElementById("validateButton");
const nextRoundButton = document.getElementById("nextRoundButton");
const roundInfo = document.getElementById("roundInfo");
const scoreText = document.getElementById("score");
const timerText = document.getElementById("timer");
const resultBox = document.getElementById("resultBox");

// Lancement automatique
window.onload = async () => {
    await loadRounds();
    initMap();
    startRound();
};

async function loadRounds() {
    try {
        const response = await fetch("./data/rounds.json");
        rounds = await response.json();
    } catch (e) {
        console.error("Erreur de chargement JSON:", e);
        // Fallback si le fichier data/rounds.json est manquant
        rounds = [{ "lat": 48.8584, "lng": 2.2945 }]; 
    }
}

function initMap() {
    map = L.map("map").setView([20, 0], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap"
    }).addTo(map);

    map.on("click", onMapClick);
}

function startRound() {
    clearMap();
    validateButton.disabled = true;
    nextRoundButton.classList.add("hidden");
    resultBox.classList.add("hidden");

    roundInfo.textContent = `${currentRound + 1} / ${rounds.length}`;
    scoreText.textContent = totalScore;
    timer = 60;
    updateTimer();

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer--;
        updateTimer();
        if (timer <= 0) {
            clearInterval(timerInterval);
            validateGuess();
        }
    }, 1000);
}

function updateTimer() {
    timerText.textContent = `${timer}s`;
}

function onMapClick(e) {
    selectedLatLng = e.latlng;
    validateButton.disabled = false;
    if (playerMarker) map.removeLayer(playerMarker);
    playerMarker = L.marker(selectedLatLng).addTo(map);
}

validateButton.addEventListener("click", validateGuess);

function validateGuess() {
    clearInterval(timerInterval);
    validateButton.disabled = true;

    const realLocation = rounds[currentRound];
    const realLatLng = L.latLng(realLocation.lat, realLocation.lng);
    realMarker = L.marker(realLatLng).addTo(map);

    if (selectedLatLng) {
        line = L.polyline([selectedLatLng, realLatLng], { color: "red" }).addTo(map);
        const distanceKm = map.distance(selectedLatLng, realLatLng) / 1000;
        const roundScore = Math.max(0, Math.round(5000 - distanceKm));
        totalScore += roundScore;

        resultBox.innerHTML = `
            <h2>Résultat</h2>
            <p>Distance : ${distanceKm.toFixed(0)} km</p>
            <p>Score : +${roundScore}</p>
        `;
    } else {
        resultBox.innerHTML = `<h2>Temps écoulé</h2><p>0 point</p>`;
    }

    resultBox.classList.remove("hidden");
    nextRoundButton.classList.remove("hidden");
}

nextRoundButton.addEventListener("click", () => {
    currentRound++;
    if (currentRound >= rounds.length) {
        resultBox.innerHTML = `<h2>Terminé !</h2><p>Score final : ${totalScore}</p>`;
        nextRoundButton.classList.add("hidden");
    } else {
        startRound();
    }
});

function clearMap() {
    if (playerMarker) map.removeLayer(playerMarker);
    if (realMarker) map.removeLayer(realMarker);
    if (line) map.removeLayer(line);
    playerMarker = null; realMarker = null; line = null; selectedLatLng = null;
}

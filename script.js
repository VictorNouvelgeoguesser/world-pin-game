const roundsData = [
    { "lat": 48.8584, "lng": 2.2945, "image": "assets/photo1.jpeg" }, 
    { "lat": 40.6892, "lng": -74.0445, "image": "assets/photo2.jpg" }, 
    { "lat": 35.6586, "lng": 139.7454, "image": "assets/photo3.jpg" }, 
    { "lat": -22.9519, "lng": -43.2105, "image": "assets/photo4.webp" }, 
    { "lat": 27.1751, "lng": 78.0421, "image": "assets/photo5.jpg" }
];

let map, currentRound = 0, totalScore = 0;
let playerMarker = null, realMarker = null, line = null, selectedLatLng = null;
let timer = 60, timerInterval, hasValidated = false;

window.addEventListener('load', function() {
    initMap();
    startRound();
});

function initMap() {
    map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    map.on('click', function(e) {
        if (!hasValidated) {
            selectedLatLng = e.latlng;
            document.getElementById("validateButton").disabled = false;
            if (playerMarker) map.removeLayer(playerMarker);
            playerMarker = L.marker(selectedLatLng).addTo(map);
        }
    });
    setTimeout(() => { map.invalidateSize(); }, 500);
}

function startRound() {
    hasValidated = false;
    selectedLatLng = null;
    if (playerMarker) map.removeLayer(playerMarker);
    if (realMarker) map.removeLayer(realMarker);
    if (line) map.removeLayer(line);
    
    document.getElementById("validateButton").disabled = true;
    document.getElementById("validateButton").classList.remove("hidden");
    document.getElementById("nextRoundButton").classList.add("hidden");
    document.getElementById("resultBox").classList.add("hidden");
    
    const round = roundsData[currentRound];
    document.getElementById("locationPhoto").src = round.image;
    document.getElementById("roundInfo").textContent = (currentRound + 1) + " / " + roundsData.length;
    document.getElementById("score").textContent = totalScore;
    
    timer = 60;
    updateTimerText();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    timer--;
    updateTimerText();
    if (timer <= 0) {
        clearInterval(timerInterval);
        if (!hasValidated) validateGuess();
    }
}

function updateTimerText() {
    document.getElementById("timer").textContent = timer + "s";
}

document.getElementById("validateButton").addEventListener("click", validateGuess);

function validateGuess() {
    if (hasValidated) return; // Sécurité : ne valide qu'une seule fois
    hasValidated = true;
    clearInterval(timerInterval);
    
    document.getElementById("validateButton").disabled = true;
    document.getElementById("validateButton").classList.add("hidden");

    const realLoc = roundsData[currentRound];
    const realLatLng = L.latLng(realLoc.lat, realLoc.lng);
    realMarker = L.circleMarker(realLatLng, { color: 'red', radius: 10 }).addTo(map);

    if (selectedLatLng) {
        line = L.polyline([selectedLatLng, realLatLng], {color: 'red', dashArray: '5, 10'}).addTo(map);
        const dist = map.distance(selectedLatLng, realLatLng) / 1000;
        
        // --- NOUVEAUX PALIERS DE SCORE ---
        let pts = 0;
        if (dist < 100) { pts = 50; }
        else if (dist < 500) { pts = 30; }
        else if (dist < 2000) { pts = 15; }
        else if (dist < 4000) { pts = 5; }
        else { pts = 0; }
        
        totalScore += pts;

        document.getElementById("resultBox").innerHTML = 
            `<h2>Résultat</h2>
             <p>Distance : <strong>${dist.toFixed(0)} km</strong></p>
             <p>Score : <strong>+${pts} pts</strong></p>`;
             
        const group = new L.featureGroup([playerMarker, realMarker]);
        map.fitBounds(group.getBounds().pad(0.2));
    } else {
        document.getElementById("resultBox").innerHTML = `<h2>Temps écoulé !</h2><p>0 point gagné</p>`;
    }

    document.getElementById("resultBox").classList.remove("hidden");
    document.getElementById("nextRoundButton").classList.remove("hidden");
}

document.getElementById("nextRoundButton").addEventListener("click", function() {
    currentRound++;
    if (currentRound < roundsData.length) {
        map.setView([20, 0], 2);
        startRound();
    } else {
        document.getElementById("resultBox").innerHTML = 
            `<h2>Fini !</h2><p>Score Total : <strong>${totalScore} pts</strong></p>
             <button onclick="location.reload()" style="margin-top:15px; background:#3b82f6; color:white; padding:10px;">Rejouer</button>`;
        document.getElementById("nextRoundButton").classList.add("hidden");
    }
});

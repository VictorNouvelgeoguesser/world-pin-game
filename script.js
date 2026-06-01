const roundsData = [
    { "lat": 48.8674, "lng": 2.3470, "image": "assets/photo1.jpeg" }, 
    { "lat": 51.4937, "lng": -0.1469, "image": "assets/photo2.jpeg" }, 
    { "lat": 49.535156, "lng": -1.88275, "image": "assets/photo3.jpg" }, 
    { "lat": 48.6182, "lng": -2.0245, "image": "assets/photo4.jpeg" }, 
    { "lat": 30.8235, "lng": 111.0025, "image": "assets/photo5.jpeg" },
    { "lat": 44.1659, "lng": 7.0654, "image": "assets/photo6.jpeg" },
    { "lat": 22.4913, "lng": 114.0331, "image": "assets/photo7.jpeg" },
    { "lat": 51.5383, "lng": -67.9406, "image": "assets/photo8.jpg" },
    { "lat": 49.4688, "lng": 3.6991, "image": "assets/photo9.jpg" },
    { "lat": 46.0518, "lng": 14.5051, "image": "assets/photo10.jpg" }
];

let map, currentRound = 0, totalScore = 0;
let playerMarker = null, realMarker = null, line = null, selectedLatLng = null;
let timer = 60, timerInterval, hasValidated = false;

window.addEventListener('load', function() {
    initMap();
    // Do NOT start the round yet
});

document.getElementById("playButton").addEventListener("click", function() {
    document.getElementById("startScreen").style.display = "none";
    startRound(); // Timer starts only now
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
        if (dist < 50) { pts = 40; }
        else if (dist < 100) { pts = 30; }
        else if (dist < 500) { pts = 20; }   
        else if (dist < 1500) { pts = 15; }
        else if (dist < 3000) { pts = 10; }
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
        // Clear UI and show final score only
        document.getElementById("nextRoundButton").remove(); 
        document.getElementById("validateButton").remove();
        document.getElementById("resultBox").innerHTML = 
            `<h2>Game Over!</h2>
             <p>Your Final Score:</p>
             <h1 style="color:#3b82f6">${totalScore}</h1>
             <p style="font-size: 14px; margin-top:20px;">Well Done.</p>`;
    }
});

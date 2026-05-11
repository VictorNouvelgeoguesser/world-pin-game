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

const startButton = document.getElementById("startButton");
const validateButton = document.getElementById("validateButton");
const nextRoundButton = document.getElementById("nextRoundButton");

const startScreen = document.getElementById("startScreen");
const gameUI = document.getElementById("gameUI");

const teamNameInput = document.getElementById("teamNameInput");

const teamNameText = document.getElementById("teamName");
const roundInfo = document.getElementById("roundInfo");
const scoreText = document.getElementById("score");
const timerText = document.getElementById("timer");

const resultBox = document.getElementById("resultBox");

startButton.addEventListener("click", async () => {

  const teamName = teamNameInput.value.trim();

  if (!teamName) {
    alert("Entre un nom d'équipe");
    return;
  }

  teamNameText.textContent = teamName;

  startScreen.classList.add("hidden");
  gameUI.classList.remove("hidden");

  await loadRounds();

  initMap();

  startRound();

});

async function loadRounds() {

  const response = await fetch("./data/rounds.json");

  rounds = await response.json();

}

function initMap() {

  map = L.map("map").setView([20, 0], 2);

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: "&copy; OpenStreetMap contributors"
    }
  ).addTo(map);

  map.on("click", onMapClick);

}

function startRound() {

  clearMap();

  validateButton.disabled = true;

  roundInfo.textContent =
    `${currentRound + 1} / ${rounds.length}`;

  scoreText.textContent = totalScore;

  resultBox.classList.add("hidden");

  timer = 60;

  updateTimer();

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

  if (playerMarker) {
    map.removeLayer(playerMarker);
  }

  playerMarker = L.marker(selectedLatLng).addTo(map);

}

validateButton.addEventListener("click", validateGuess);

function validateGuess() {

  clearInterval(timerInterval);

  validateButton.disabled = true;

  const realLocation = rounds[currentRound];

  const realLatLng = L.latLng(
    realLocation.lat,
    realLocation.lng
  );

  realMarker = L.marker(realLatLng).addTo(map);

  if (selectedLatLng) {

    line = L.polyline(
      [selectedLatLng, realLatLng],
      { color: "red" }
    ).addTo(map);

    const distanceKm =
      map.distance(selectedLatLng, realLatLng) / 1000;

    const roundScore =
      Math.max(
        0,
        Math.round(50 - distanceKm / 40)
      );

    totalScore += roundScore;

    resultBox.innerHTML = `
      <h2>Résultat</h2>
      <p>Distance : ${distanceKm.toFixed(0)} km</p>
      <p>Score gagné : ${roundScore}</p>
    `;

  } else {

    resultBox.innerHTML = `
      <h2>Temps écoulé</h2>
      <p>0 point gagné</p>
    `;

  }

  resultBox.classList.remove("hidden");

  nextRoundButton.classList.remove("hidden");

}

nextRoundButton.addEventListener("click", () => {

  currentRound++;

  if (currentRound >= rounds.length) {

    endGame();

    return;
  }

  nextRoundButton.classList.add("hidden");

  startRound();

});

function endGame() {

  resultBox.innerHTML = `
    <h2>Partie terminée</h2>
    <p>Score final : ${totalScore}</p>
  `;

  resultBox.classList.remove("hidden");

  nextRoundButton.classList.add("hidden");

}

function clearMap() {

  if (playerMarker) {
    map.removeLayer(playerMarker);
    playerMarker = null;
  }

  if (realMarker) {
    map.removeLayer(realMarker);
    realMarker = null;
  }

  if (line) {
    map.removeLayer(line);
    line = null;
  }

  selectedLatLng = null;

}

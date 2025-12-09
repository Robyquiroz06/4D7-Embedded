let users = [
  { username: "admin", password: "1234" },
  { username: "teacher", password: "classroom" }
];

let currentMode = "AUTO";

let sensors = {
  temp: 26,
  hum: 60,
  light: 450,
  sound: 30
};

let logs = [];

function setMode(mode) {
  currentMode = mode;
  localStorage.setItem("mode", mode);
  window.location.href = mode.toLowerCase() + ".html";
}

if (localStorage.getItem("mode")) {
  currentMode = localStorage.getItem("mode");
}

function updateFakeValues() {
  sensors.temp += Math.random() - 0.5;
  sensors.hum += Math.random() - 0.5;
  sensors.light += Math.random() * 4 - 2;
  sensors.sound += Math.random() * 2 - 1;
}

function handleLogin(e) {

  e.preventDefault();

  let u = document.getElementById("username").value;
  let p = document.getElementById("password").value;
  let error = document.getElementById("error");

  let found = users.find(user => user.username === u && user.password === p);

  if (found) {
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("user", u);
    window.location.href = "auto.html";
  }
  else {
  error.innerText = "Invalid username or password";

  let box = document.querySelector(".login-box");
  box.classList.remove("error-shake");
  void box.offsetWidth; 
  box.classList.add("error-shake");
  }
}

function togglePassword() {
  let pass = document.getElementById("password");
  pass.type = pass.type === "password" ? "text" : "password";
}


function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

function runAuto() {

  setInterval(() => {
    updateFakeValues();
    displayValues();
  }, 2000);

  setInterval(() => {
    saveLog();
  }, 600000);
}

function displayValues() {

  if (currentMode !== "AUTO") return;

  document.querySelector(".card:nth-child(1) span").innerText = sensors.temp.toFixed(1) + " °C";
  document.querySelector(".card:nth-child(2) span").innerText = sensors.hum.toFixed(1) + " %";
  document.querySelector(".card:nth-child(3) span").innerText = Math.round(sensors.light);
  document.querySelector(".card:nth-child(4) span").innerText = Math.round(sensors.sound);

  checkEnvironment();
}

function checkEnvironment() {
  let msg = "Environment is normal.";

  if (sensors.temp > 30) msg = "Room is too hot.";
  else if (sensors.hum < 40) msg = "Humidity too low.";
  else if (sensors.light < 200) msg = "Lighting is insufficient.";
  else if (sensors.sound > 70) msg = "Noise level is high.";

  document.querySelector(".box p").innerText = msg;
}

function saveLog() {

  if (currentMode !== "AUTO") return;

  logs.push({
    time: new Date().toLocaleString(),
    temp: sensors.temp.toFixed(1),
    hum: sensors.hum.toFixed(1),
    light: Math.round(sensors.light),
    sound: Math.round(sensors.sound)
  });

  localStorage.setItem("logs", JSON.stringify(logs));
}

function loadLogs() {

  let rows = document.querySelector("tbody");
  let stored = JSON.parse(localStorage.getItem("logs")) || [];
  rows.innerHTML = "";

  stored.forEach(log => {
    rows.innerHTML += `
      <tr>
        <td>${log.time}</td>
        <td>${log.temp}</td>
        <td>${log.hum}</td>
        <td>${log.light}</td>
        <td>${log.sound}</td>
      </tr>`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
    let protectedPages = ["auto", "maintenance", "sleep", "logs"];
    let currentPage = window.location.pathname.toLowerCase();

    protectedPages.forEach(page => {
    if (currentPage.includes(page) && localStorage.getItem("loggedIn") !== "true") {
        window.location.href = "index.html";
    }
    });

    let page = document.body.className || window.location.pathname;
    if (window.location.pathname.includes("auto")) {
        runAuto();
    }
    if (window.location.pathname.includes("logs")) {
        loadLogs();
    }
    if (document.getElementById("loginForm")) {
    document.getElementById("loginForm").addEventListener("submit", handleLogin);
    }
});

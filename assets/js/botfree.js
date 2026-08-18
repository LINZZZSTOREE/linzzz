// ===== Bot Free page logic =====
// Backend PA (API_BASE) cuma nyimpen status server (online/offline).
// Begitu server dipilih & online, browser manggil LANGSUNG ke URL Termux (bukan lewat PA).

let selectedServer = null;   // { server_id, name, url, online }
let sessionId = null;        // dipakai sebagai nama folder session di server bot = username
let pollStatusTimer = null;
let pollMessagesTimer = null;
let lastMessageTs = "";

const serverGrid = document.getElementById("serverGrid");
const connectBtn = document.getElementById("connectBtn");
const botStatusText = document.getElementById("botStatusText");
const consoleWrap = document.getElementById("consoleWrap");
const consoleBox = document.getElementById("consoleBox");

const connectModal = document.getElementById("connectModal");
const modalStep1 = document.getElementById("modalStep1");
const modalStep2 = document.getElementById("modalStep2");
const modalStep2Title = document.getElementById("modalStep2Title");
const modalStep2Sub = document.getElementById("modalStep2Sub");
const phoneInputWrap = document.getElementById("phoneInputWrap");
const phoneInput = document.getElementById("phoneInput");
const qrWrap = document.getElementById("qrWrap");
const qrImg = document.getElementById("qrImg");
const pairingWrap = document.getElementById("pairingWrap");
const pairingCodeText = document.getElementById("pairingCodeText");
const modalStatusText = document.getElementById("modalStatusText");

// ===== Ambil daftar server dari backend PA =====
async function loadServers(){
  try{
    const servers = await apiFetch("/api/servers");
    renderServers(servers);
  }catch(err){
    serverGrid.innerHTML = `<div style="color:var(--danger); font-size:13px;">Gagal memuat daftar server.</div>`;
  }
}

function renderServers(servers){
  serverGrid.innerHTML = "";
  servers.forEach(s => {
    const pill = document.createElement("div");
    pill.className = "server-pill";
    pill.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <span class="dot ${s.online ? 'online' : 'offline'}"></span>
        <span class="name">${s.name}</span>
      </div>
      <span class="st-text">${s.online ? 'Online' : 'Offline'}</span>
    `;
    if (s.online){
      pill.addEventListener("click", () => selectServer(s, pill));
    } else {
      pill.style.opacity = "0.5";
      pill.style.cursor = "not-allowed";
    }
    serverGrid.appendChild(pill);
  });
}

function selectServer(server, pillEl){
  selectedServer = server;
  document.querySelectorAll(".server-pill").forEach(p => p.classList.remove("selected"));
  pillEl.classList.add("selected");
  connectBtn.disabled = false;
  connectBtn.textContent = "Connect ke " + server.name;
}

// ===== Ambil username buat dijadikan session_id =====
async function ensureSessionId(){
  if (sessionId) return sessionId;
  const me = await apiFetch("/api/me", { auth: true });
  sessionId = me.username;
  return sessionId;
}

// ===== Buka modal connect =====
connectBtn.addEventListener("click", async () => {
  if (!selectedServer) return;
  try{ await ensureSessionId(); }catch(e){ window.location.href = "login.html"; return; }
  modalStep1.style.display = "block";
  modalStep2.style.display = "none";
  resetModalStep2();
  connectModal.classList.add("show");
});

document.getElementById("closeModalBtn1").addEventListener("click", () => connectModal.classList.remove("show"));
document.getElementById("closeModalBtn2").addEventListener("click", () => {
  connectModal.classList.remove("show");
  stopPolling(pollStatusTimer);
});

function resetModalStep2(){
  phoneInputWrap.style.display = "none";
  qrWrap.style.display = "none";
  pairingWrap.style.display = "none";
  modalStatusText.textContent = "";
  phoneInput.value = "";
}

function goToStep2(){
  modalStep1.style.display = "none";
  modalStep2.style.display = "block";
}

document.getElementById("chooseQrBtn").addEventListener("click", async () => {
  goToStep2();
  modalStep2Title.textContent = "Scan QR Code";
  modalStep2Sub.textContent = "Buka WhatsApp > Perangkat Tertaut > Scan QR ini";
  qrWrap.style.display = "block";
  modalStatusText.textContent = "Menyiapkan QR...";
  await startConnect("qr");
});

document.getElementById("choosePairingBtn").addEventListener("click", () => {
  goToStep2();
  modalStep2Title.textContent = "Pairing Code";
  modalStep2Sub.textContent = "Masukkan nomor WhatsApp kamu";
  phoneInputWrap.style.display = "block";
});

document.getElementById("submitPhoneBtn").addEventListener("click", async () => {
  const phone = phoneInput.value.trim().replace(/[^0-9]/g, "");
  if (!phone){ modalStatusText.textContent = "Nomor tidak valid."; return; }
  phoneInputWrap.style.display = "none";
  pairingWrap.style.display = "block";
  modalStatusText.textContent = "Meminta kode pairing...";
  await startConnect("pairing", phone);
});

// ===== Panggil server bot LANGSUNG (bukan lewat backend PA) =====
async function startConnect(method, phone){
  try{
    const res = await fetch(selectedServer.url + "/api/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, method, phone: phone || "" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gagal memulai koneksi.");

    if (method === "qr" && data.qr) qrImg.src = data.qr;
    if (method === "pairing" && data.pairing_code) pairingCodeText.textContent = data.pairing_code;

    modalStatusText.textContent = "Menunggu koneksi WhatsApp...";
    pollSessionStatus();
  }catch(err){
    modalStatusText.textContent = "Error: " + err.message;
  }
}

function pollSessionStatus(){
  stopPolling(pollStatusTimer);
  pollStatusTimer = setInterval(async () => {
    try{
      const res = await fetch(`${selectedServer.url}/api/session/${sessionId}/status`);
      const data = await res.json();

      if (data.status === "qr" && data.qr) qrImg.src = data.qr;
      if (data.status === "pairing" && data.pairing_code) pairingCodeText.textContent = data.pairing_code;

      if (data.status === "connected"){
        stopPolling(pollStatusTimer);
        modalStatusText.textContent = "WhatsApp Connected ✅";
        botStatusText.textContent = "Terhubung";
        botStatusText.classList.add("online");
        setTimeout(() => connectModal.classList.remove("show"), 1200);
        consoleWrap.style.display = "block";
        startConsolePolling();
      }
    }catch(err){ /* server lagi gak bisa dihubungi, diamkan & coba lagi */ }
  }, 2500);
}

// ===== Console: polling pesan masuk dari server bot =====
function startConsolePolling(){
  stopPolling(pollMessagesTimer);
  pollMessagesTimer = setInterval(async () => {
    try{
      const res = await fetch(`${selectedServer.url}/api/session/${sessionId}/messages?after=${encodeURIComponent(lastMessageTs)}`);
      const data = await res.json();
      (data.messages || []).forEach(m => {
        appendConsoleLine(m);
        lastMessageTs = m.time;
      });
    }catch(err){ /* diamkan, coba lagi next tick */ }
  }, 2000);
}

function appendConsoleLine(m){
  const line = document.createElement("div");
  line.className = "line";
  line.innerHTML = `<span class="ts">[${m.time}]</span> Connect Message in ${m.from} : ${escapeHtml(m.text)}`;
  consoleBox.appendChild(line);
  consoleBox.scrollTop = consoleBox.scrollHeight;
}

function escapeHtml(str){
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function stopPolling(timer){ if (timer) clearInterval(timer); }

loadServers();

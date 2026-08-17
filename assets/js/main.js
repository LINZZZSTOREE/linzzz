// ===== Sidebar toggle =====
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const hamburgerBtn = document.getElementById("hamburgerBtn");

function openSidebar(){ sidebar.classList.add("show"); overlay.classList.add("show"); }
function closeSidebar(){ sidebar.classList.remove("show"); overlay.classList.remove("show"); }

hamburgerBtn?.addEventListener("click", openSidebar);
overlay?.addEventListener("click", () => { closeSidebar(); closeAccountPopup(); });

// ===== Account popup =====
const accountBtn = document.getElementById("accountBtn");
const accountPop = document.getElementById("accountPop");

function openAccountPopup(){ accountPop.classList.add("show"); }
function closeAccountPopup(){ accountPop.classList.remove("show"); }

accountBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  accountPop.classList.contains("show") ? closeAccountPopup() : openAccountPopup();
});
document.addEventListener("click", (e) => {
  if (accountPop && !accountPop.contains(e.target) && e.target !== accountBtn) closeAccountPopup();
});

// ===== Render status login di header =====
async function renderAuthState(){
  const token = getToken();
  const authArea = document.getElementById("authArea");
  const emailText = document.getElementById("accountEmail");
  const statusText = document.getElementById("accountStatus");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!token){
    authArea.innerHTML = `
      <a class="btn" href="login.html">Login</a>
      <a class="btn btn-primary" href="signup.html">Sign Up</a>
    `;
    if (emailText) emailText.textContent = "user@gmail.com";
    if (statusText) statusText.textContent = "Belum login";
    if (logoutBtn) logoutBtn.style.display = "none";
    return;
  }

  try{
    const me = await apiFetch("/api/me", { auth: true });
    authArea.innerHTML = "";
    if (emailText) emailText.textContent = me.email;
    if (statusText) statusText.textContent = "@" + me.username + " • Sudah login";
    if (logoutBtn) logoutBtn.style.display = "block";
  }catch(err){
    clearToken();
    renderAuthState();
  }
}

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  try{ await apiFetch("/api/logout", { method: "POST", auth: true }); }catch(e){}
  clearToken();
  window.location.reload();
});

// ===== Tombol "Coba sekarang" =====
document.getElementById("tryFreeBtn")?.addEventListener("click", () => {
  if (!getToken()){
    window.location.href = "login.html";
  } else {
    window.location.href = "bot-free.html";
  }
});

// Track pengunjung (untuk statistik admin)
apiFetch("/api/track-visit", { method: "POST" }).catch(()=>{});

// ===== Banner statistik publik (Maks OTP & Jumlah User) =====
async function renderPublicStats(){
  const otpEl = document.getElementById("statOtpMax");
  const userEl = document.getElementById("statUserCount");
  if (!otpEl && !userEl) return;
  try{
    const s = await apiFetch("/api/public-stats");
    if (otpEl) otpEl.textContent = `${s.otp_sent_today}/${s.otp_daily_limit}`;
    if (userEl) userEl.textContent = s.verified_users;
  }catch(err){ /* diamkan, banner opsional */ }
}
renderPublicStats();

renderAuthState();

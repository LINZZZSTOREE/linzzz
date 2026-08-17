// ===== ADMIN LOGIN =====
const adminLoginForm = document.getElementById("adminLoginForm");
adminLoginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("adminLoginMsg");
  const username = document.getElementById("adminUsername").value.trim();
  const password = document.getElementById("adminPassword").value;

  try{
    msg.textContent = "Memproses..."; msg.className = "form-msg";
    const data = await apiFetch("/api/admin/login", { method:"POST", body:{ username, password } });
    setAdminToken(data.token);
    window.location.href = "dashboard.html";
  }catch(err){
    msg.textContent = err.message; msg.className = "form-msg error";
  }
});

// ===== ADMIN DASHBOARD =====
const adminSidebar = document.getElementById("adminSidebar");
document.getElementById("adminHamburgerBtn")?.addEventListener("click", () => {
  adminSidebar.classList.toggle("collapsed");
});

document.getElementById("adminLogoutBtn")?.addEventListener("click", (e) => {
  e.preventDefault();
  clearAdminToken();
  window.location.href = "index.html";
});

function showSection(name){
  document.querySelectorAll("main > section").forEach(s => s.style.display = "none");
  const el = document.getElementById("section-" + name);
  if (el) el.style.display = "block";
}

async function loadStats(){
  try{
    const s = await apiFetch("/api/admin/stats", { adminAuth: true });
    document.getElementById("statLoginSuccess").textContent = s.login_success;
    document.getElementById("statEmailRequests").textContent = s.email_requests;
    document.getElementById("statVisitors").textContent = s.visitors;
    document.getElementById("statTime").textContent = s.server_time;
  }catch(err){
    if (err.message.toLowerCase().includes("unauthor") || err.message.toLowerCase().includes("token")){
      window.location.href = "index.html";
    }
  }
}

async function loadOtpUsers(){
  try{
    const users = await apiFetch("/api/admin/otp-users", { adminAuth: true });
    const body = document.getElementById("otpTableBody");
    body.innerHTML = "";
    users.forEach(u => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.username}</td>
        <td>${u.email}</td>
        <td>${u.otp_count}</td>
        <td>${u.is_verified ? "Ya" : "Belum"}</td>
        <td><button class="del-btn" data-id="${u.id}">Hapus</button></td>
      `;
      body.appendChild(tr);
    });

    body.querySelectorAll(".del-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!confirm("Yakin hapus akun user ini?")) return;
        try{
          await apiFetch(`/api/admin/users/${btn.dataset.id}`, { method:"DELETE", adminAuth: true });
          loadOtpUsers();
          loadStats();
        }catch(err){ alert(err.message); }
      });
    });
  }catch(err){}
}

if (document.getElementById("section-overview")){
  if (!getAdminToken()) window.location.href = "index.html";
  loadStats();
  loadOtpUsers();
  setInterval(loadStats, 15000);
}

// ===== GANTI SESUAI DOMAIN BACKEND KAMU =====
const API_BASE = "https://linzzzstoree.pythonanywhere.com";

// Helper: ambil token login user dari localStorage
function getToken(){ return localStorage.getItem("lz_token"); }
function setToken(t){ localStorage.setItem("lz_token", t); }
function clearToken(){ localStorage.removeItem("lz_token"); }

function getAdminToken(){ return localStorage.getItem("lz_admin_token"); }
function setAdminToken(t){ localStorage.setItem("lz_admin_token", t); }
function clearAdminToken(){ localStorage.removeItem("lz_admin_token"); }

// Wrapper fetch ke API backend
async function apiFetch(path, options = {}){
  const headers = options.headers || {};
  headers["Content-Type"] = "application/json";
  const token = options.auth ? getToken() : (options.adminAuth ? getAdminToken() : null);
  if (token) headers["Authorization"] = "Bearer " + token;

  const res = await fetch(API_BASE + path, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data = null;
  try { data = await res.json(); } catch (e) { /* no body */ }

  if (!res.ok) {
    const msg = (data && data.message) || "Terjadi kesalahan, coba lagi.";
    throw new Error(msg);
  }
  return data;
}

// ===== Toggle show/hide password (SVG eye icon) =====
function bindEyeToggle(iconId, inputId){
  const icon = document.getElementById(iconId);
  const input = document.getElementById(inputId);
  if (!icon || !input) return;
  icon.addEventListener("click", () => {
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    icon.innerHTML = show
      ? `<path d="M17.94 17.94A10.94 10.94 0 0112 20C5 20 1 12 1 12a21.86 21.86 0 015.06-6.06M9.9 4.24A10.94 10.94 0 0112 4c7 0 11 8 11 8a21.86 21.86 0 01-2.16 3.19M14.12 14.12a3 3 0 11-4.24-4.24"/><path d="M1 1l22 22"/>`
      : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
  });
}
bindEyeToggle("loginEyeIcon", "loginPassword");
bindEyeToggle("signupEyeIcon", "signupPassword");
bindEyeToggle("confirmEyeIcon", "signupConfirmPassword");

function showMsg(el, text, type){
  el.textContent = text;
  el.className = "form-msg " + (type || "");
}

// ===== LOGIN =====
const loginForm = document.getElementById("loginForm");
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("loginMsg");
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!username || !password){ showMsg(msg, "Username dan password wajib diisi.", "error"); return; }

  try{
    showMsg(msg, "Memproses...", "");
    const data = await apiFetch("/api/login", { method:"POST", body:{ username, password } });
    setToken(data.token);
    window.location.href = "bot-free.html";
  }catch(err){
    showMsg(msg, err.message, "error");
  }
});

// ===== SIGN UP =====
const signupForm = document.getElementById("signupForm");
signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("signupMsg");
  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("signupConfirmPassword").value;
  const email = document.getElementById("signupEmail").value.trim();

  if (!username || !password || !confirmPassword || !email){
    showMsg(msg, "Semua kolom wajib diisi.", "error"); return;
  }
  if (password !== confirmPassword){
    showMsg(msg, "Konfirmasi password tidak sama.", "error"); return;
  }
  if (password.length < 6){
    showMsg(msg, "Password minimal 6 karakter.", "error"); return;
  }

  try{
    showMsg(msg, "Mengirim kode verifikasi...", "");
    await apiFetch("/api/register", { method:"POST", body:{ username, password, confirm_password: confirmPassword, email } });
    sessionStorage.setItem("lz_pending_email", email);
    window.location.href = "verify.html";
  }catch(err){
    showMsg(msg, err.message, "error");
  }
});

// ===== VERIFY OTP =====
const verifyForm = document.getElementById("verifyForm");
if (verifyForm){
  const pendingEmail = sessionStorage.getItem("lz_pending_email");
  const emailLabel = document.getElementById("verifyEmailLabel");
  if (!pendingEmail){
    window.location.href = "signup.html";
  } else if (emailLabel) {
    emailLabel.textContent = pendingEmail;
  }

  // Auto-focus antar kotak OTP
  const boxes = document.querySelectorAll(".otp-boxes input");
  boxes.forEach((box, idx) => {
    box.addEventListener("input", () => {
      box.value = box.value.replace(/[^0-9]/g, "").slice(0,1);
      if (box.value && idx < boxes.length - 1) boxes[idx+1].focus();
    });
    box.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !box.value && idx > 0) boxes[idx-1].focus();
    });
  });

  verifyForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("verifyMsg");
    const code = Array.from(boxes).map(b => b.value).join("");

    if (code.length !== boxes.length){ showMsg(msg, "Masukkan kode lengkap.", "error"); return; }

    try{
      showMsg(msg, "Memverifikasi...", "");
      const data = await apiFetch("/api/verify-otp", { method:"POST", body:{ email: pendingEmail, code } });
      setToken(data.token);
      sessionStorage.removeItem("lz_pending_email");
      window.location.href = "bot-free.html";
    }catch(err){
      showMsg(msg, err.message, "error");
    }
  });

  document.getElementById("resendOtpBtn")?.addEventListener("click", async () => {
    const msg = document.getElementById("verifyMsg");
    try{
      showMsg(msg, "Mengirim ulang kode...", "");
      await apiFetch("/api/resend-otp", { method:"POST", body:{ email: pendingEmail } });
      showMsg(msg, "Kode baru sudah dikirim ke email kamu.", "success");
    }catch(err){
      showMsg(msg, err.message, "error");
    }
  });
}

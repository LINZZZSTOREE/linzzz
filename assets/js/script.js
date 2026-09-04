const menuBtn = document.getElementById("menuBtn");
const closeSidebar = document.getElementById("closeSidebar");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

function openSidebar() {
    if (!sidebar || !sidebarOverlay) return;

    sidebar.classList.add("show");
    sidebarOverlay.classList.add("show");
    document.body.style.overflow = "hidden";
}

function hideSidebar() {
    if (!sidebar || !sidebarOverlay) return;

    sidebar.classList.remove("show");
    sidebarOverlay.classList.remove("show");
    document.body.style.overflow = "";
}

if (menuBtn) menuBtn.addEventListener("click", openSidebar);
if (closeSidebar) closeSidebar.addEventListener("click", hideSidebar);
if (sidebarOverlay) sidebarOverlay.addEventListener("click", hideSidebar);

document.querySelectorAll(".sidebar-link").forEach(link => {
    link.addEventListener("click", hideSidebar);
});

const cards = document.querySelectorAll(".service-card");
const modalWrapper = document.getElementById("modalWrapper");
const modalTitle = document.getElementById("modalTitle");
const modalClose = document.getElementById("modalClose");

function openModal(featureName) {
    if (!modalWrapper || !modalTitle) return;

    modalTitle.textContent = `${featureName} Sedang Dibuat`;
    modalWrapper.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    if (!modalWrapper) return;

    modalWrapper.classList.remove("show");
    document.body.style.overflow = "";
}

cards.forEach(card => {
    card.addEventListener("click", () => {
        const link = card.dataset.link;

        if (link) {
            window.location.href = link;
            return;
        }

        openModal(card.dataset.feature);
    });
});

if (modalClose) modalClose.addEventListener("click", closeModal);

if (modalWrapper) {
    modalWrapper.addEventListener("click", event => {
        if (event.target === modalWrapper) closeModal();
    });
}

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeModal();
        hideSidebar();
    }
});

// ================= SIDEBAR =================

const menuBtn = document.getElementById("menuBtn");
const closeSidebar = document.getElementById("closeSidebar");

const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");


function openSidebar() {

    sidebar.classList.add("show");
    sidebarOverlay.classList.add("show");

    document.body.style.overflow = "hidden";
}


function hideSidebar() {

    sidebar.classList.remove("show");
    sidebarOverlay.classList.remove("show");

    document.body.style.overflow = "";
}


menuBtn.addEventListener("click", openSidebar);

closeSidebar.addEventListener("click", hideSidebar);

sidebarOverlay.addEventListener("click", hideSidebar);


// ================= MODAL =================

const cards = document.querySelectorAll(".service-card");

const modalWrapper = document.getElementById("modalWrapper");
const modalTitle = document.getElementById("modalTitle");
const modalClose = document.getElementById("modalClose");


function openModal(featureName) {

    modalTitle.textContent =
        `${featureName} Sedang Dibuat`;

    modalWrapper.classList.add("show");

    document.body.style.overflow = "hidden";
}


function closeModal() {

    modalWrapper.classList.remove("show");

    document.body.style.overflow = "";
}


cards.forEach((card) => {

    card.addEventListener("click", () => {

        const featureName =
            card.dataset.feature;

        openModal(featureName);

    });

});


modalClose.addEventListener(
    "click",
    closeModal
);


modalWrapper.addEventListener(
    "click",
    (event) => {

        if (event.target === modalWrapper) {
            closeModal();
        }

    }
);


// ================= ESC =================

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            closeModal();
            hideSidebar();

        }

    }
);

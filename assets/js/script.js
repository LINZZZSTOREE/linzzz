// ================= SIDEBAR =================

const menuBtn =
    document.getElementById("menuBtn");

const closeSidebar =
    document.getElementById("closeSidebar");

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");


// BUKA SIDEBAR
function openSidebar() {

    if (!sidebar || !sidebarOverlay) {
        return;
    }

    sidebar.classList.add("show");

    sidebarOverlay.classList.add("show");

    document.body.style.overflow =
        "hidden";
}


// TUTUP SIDEBAR
function hideSidebar() {

    if (!sidebar || !sidebarOverlay) {
        return;
    }

    sidebar.classList.remove("show");

    sidebarOverlay.classList.remove("show");

    document.body.style.overflow =
        "";

}


// MENU BUTTON
if (menuBtn) {

    menuBtn.addEventListener(
        "click",
        openSidebar
    );

}


// CLOSE BUTTON
if (closeSidebar) {

    closeSidebar.addEventListener(
        "click",
        hideSidebar
    );

}


// OVERLAY
if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        hideSidebar
    );

}


// TUTUP SIDEBAR SAAT LINK DIKLIK
const sidebarLinks =
    document.querySelectorAll(
        ".sidebar-link"
    );


sidebarLinks.forEach(
    (link) => {

        link.addEventListener(
            "click",
            () => {

                hideSidebar();

            }
        );

    }
);



// ================= POPUP =================

const cards =
    document.querySelectorAll(
        ".service-card"
    );


const modalWrapper =
    document.getElementById(
        "modalWrapper"
    );


const modalTitle =
    document.getElementById(
        "modalTitle"
    );


const modalClose =
    document.getElementById(
        "modalClose"
    );


// BUKA POPUP
function openModal(featureName) {

    if (
        !modalWrapper ||
        !modalTitle
    ) {
        return;
    }

    modalTitle.textContent =
        `${featureName} Sedang Dibuat`;

    modalWrapper.classList.add(
        "show"
    );

    document.body.style.overflow =
        "hidden";

}


// TUTUP POPUP
function closeModal() {

    if (!modalWrapper) {
        return;
    }

    modalWrapper.classList.remove(
        "show"
    );

    document.body.style.overflow =
        "";

}


// CARD CLICK
cards.forEach(
    (card) => {

        card.addEventListener(
            "click",
            () => {

                const featureName =
                    card.dataset.feature;

                openModal(
                    featureName
                );

            }
        );

    }
);


// TOMBOL OKE
if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeModal
    );

}


// CLICK AREA LUAR POPUP
if (modalWrapper) {

    modalWrapper.addEventListener(
        "click",
        (event) => {

            if (
                event.target
                === modalWrapper
            ) {

                closeModal();

            }

        }
    );

}


// ================= ESC BUTTON =================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape"
        ) {

            closeModal();

            hideSidebar();

        }

    }
);

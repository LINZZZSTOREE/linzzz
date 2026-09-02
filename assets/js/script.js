// ================= SIDEBAR =================

const menuBtn =
    document.getElementById("menuBtn");

const closeSidebar =
    document.getElementById("closeSidebar");

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");


function openSidebar() {

    sidebar.classList.add("show");

    sidebarOverlay.classList.add("show");

    document.body.style.overflow =
        "hidden";

}


function hideSidebar() {

    sidebar.classList.remove("show");

    sidebarOverlay.classList.remove("show");

    document.body.style.overflow =
        "";

}


menuBtn.addEventListener(
    "click",
    openSidebar
);


closeSidebar.addEventListener(
    "click",
    hideSidebar
);


sidebarOverlay.addEventListener(
    "click",
    hideSidebar
);



// ================= NAVIGATION =================

const bottomItems =
    document.querySelectorAll(
        ".bottom-item"
    );


const sidebarLinks =
    document.querySelectorAll(
        ".sidebar-link"
    );


function setActiveNavigation(
    section
) {

    bottomItems.forEach(
        (item) => {

            item.classList.toggle(
                "active",
                item.dataset.section
                === section
            );

        }
    );


    sidebarLinks.forEach(
        (item) => {

            item.classList.toggle(
                "active",
                item.dataset.section
                === section
            );

        }
    );

}



document
    .querySelectorAll(
        '[data-section]'
    )
    .forEach(
        (item) => {

            item.addEventListener(
                "click",
                () => {

                    const section =
                        item.dataset.section;

                    setActiveNavigation(
                        section
                    );

                    hideSidebar();

                }
            );

        }
    );



// ================= AUTO ACTIVE ON SCROLL =================

const homeSection =
    document.getElementById(
        "home"
    );


const infoSection =
    document.getElementById(
        "info"
    );


window.addEventListener(
    "scroll",
    () => {

        const infoTop =
            infoSection
                .getBoundingClientRect()
                .top;


        if (
            infoTop
            <
            window.innerHeight * 0.6
        ) {

            setActiveNavigation(
                "info"
            );

        } else {

            setActiveNavigation(
                "home"
            );

        }

    }
);



// ================= CARD POPUP =================

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


function openModal(
    featureName
) {

    modalTitle.textContent =
        `${featureName} Sedang Dibuat`;

    modalWrapper.classList.add(
        "show"
    );

    document.body.style.overflow =
        "hidden";

}


function closeModal() {

    modalWrapper.classList.remove(
        "show"
    );

    document.body.style.overflow =
        "";

}


cards.forEach(
    (card) => {

        card.addEventListener(
            "click",
            () => {

                openModal(
                    card.dataset.feature
                );

            }
        );

    }
);


modalClose.addEventListener(
    "click",
    closeModal
);


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



// ================= ESC =================

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

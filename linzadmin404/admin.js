const config = window.LINZZZ_CONFIG || {};
const API_BASE = String(config.API_BASE || "").replace(/\/$/, "");

let token = localStorage.getItem("linzzz_admin_token");
let categories = [];
let products = [];

const loginPage = document.getElementById("loginPage");
const adminApp = document.getElementById("adminApp");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

const adminMenuBtn = document.getElementById("adminMenuBtn");
const adminSidebar = document.getElementById("adminSidebar");
const adminSidebarOverlay = document.getElementById("adminSidebarOverlay");

const categoryForm = document.getElementById("categoryForm");
const categoryName = document.getElementById("categoryName");
const categoryAdminList = document.getElementById("categoryAdminList");
const productCategory = document.getElementById("productCategory");
const productForm = document.getElementById("productForm");
const productImage = document.getElementById("productImage");
const imagePreview = document.getElementById("imagePreview");
const imagePreviewBox = document.getElementById("imagePreviewBox");
const priceRows = document.getElementById("priceRows");
const addPriceButton = document.getElementById("addPriceButton");

function backendReady() {
    return API_BASE && !API_BASE.includes("GANTI_USERNAME");
}

loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    loginError.textContent = "";

    if (!backendReady()) {
        loginError.textContent =
            "Edit assets/js/config.js dulu untuk mengisi URL PythonAnywhere.";
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/admin/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: document.getElementById("username").value,
                password: document.getElementById("password").value
            })
        });

        const result = await response.json();

        if (!response.ok) {
            loginError.textContent = result.error || "Login gagal.";
            return;
        }

        token = result.token;
        localStorage.setItem("linzzz_admin_token", token);

        await openAdmin();
    } catch (error) {
        console.error(error);
        loginError.textContent = "Tidak dapat terhubung ke server.";
    }
});

async function openAdmin() {
    if (!token || !backendReady()) return;

    try {
        const response = await apiFetch("/api/admin/check");

        if (!response.ok) throw new Error("Token invalid");

        loginPage.classList.add("hidden");
        adminApp.classList.remove("hidden");

        await loadAdminData();
    } catch {
        localStorage.removeItem("linzzz_admin_token");
        token = null;
    }
}

function apiFetch(endpoint, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.set("Authorization", `Bearer ${token}`);

    return fetch(API_BASE + endpoint, {
        ...options,
        headers
    });
}

function updateClock() {
    document.getElementById("adminTime").textContent =
        new Intl.DateTimeFormat("id-ID", {
            timeZone: "Asia/Jakarta",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }).format(new Date());
}

setInterval(updateClock, 1000);
updateClock();

adminMenuBtn.addEventListener("click", () => {
    adminSidebar.classList.add("show");
    adminSidebarOverlay.classList.add("show");
});

adminSidebarOverlay.addEventListener("click", hideAdminSidebar);

function hideAdminSidebar() {
    adminSidebar.classList.remove("show");
    adminSidebarOverlay.classList.remove("show");
}

document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".nav-item").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        document.querySelectorAll(".admin-page").forEach(page => {
            page.classList.add("hidden");
        });

        const page = button.dataset.page;
        document.getElementById(`${page}Page`).classList.remove("hidden");

        hideAdminSidebar();
    });
});

async function loadAdminData() {
    const [categoryResponse, productResponse] = await Promise.all([
        fetch(`${API_BASE}/api/categories`),
        fetch(`${API_BASE}/api/products`)
    ]);

    if (!categoryResponse.ok || !productResponse.ok) {
        throw new Error("Gagal mengambil data");
    }

    categories = await categoryResponse.json();
    products = await productResponse.json();

    renderAdminCategories();
    renderAdminProducts();

    document.getElementById("categoryTotal").textContent = categories.length;
    document.getElementById("productTotal").textContent = products.length;
}

function renderAdminCategories() {
    categoryAdminList.innerHTML = "";
    productCategory.innerHTML = `<option value="">Pilih kategori</option>`;

    categories.forEach(category => {
        const chip = document.createElement("span");
        chip.className = "admin-category";
        chip.textContent = category.name;
        categoryAdminList.appendChild(chip);

        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        productCategory.appendChild(option);
    });
}

categoryForm.addEventListener("submit", async event => {
    event.preventDefault();

    const response = await apiFetch("/api/admin/categories", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: categoryName.value
        })
    });

    const result = await response.json();

    if (!response.ok) {
        showToast(result.error || "Gagal menambahkan kategori");
        return;
    }

    categoryName.value = "";
    showToast("Kategori berhasil ditambahkan");
    await loadAdminData();
});

function addPriceRow() {
    const row = document.createElement("div");
    row.className = "price-row";

    row.innerHTML = `
        <input type="text" class="price-label" placeholder="Contoh: DANA 10K" required>
        <input type="number" class="price-value" placeholder="Harga" min="0" required>
        <button type="button" class="delete-price">
            <i class="fa-solid fa-trash"></i>
        </button>
    `;

    row.querySelector(".delete-price").addEventListener("click", () => {
        if (document.querySelectorAll(".price-row").length > 1) {
            row.remove();
        }
    });

    priceRows.appendChild(row);
}

addPriceButton.addEventListener("click", addPriceRow);
addPriceRow();

productImage.addEventListener("change", () => {
    const file = productImage.files[0];

    if (!file) {
        imagePreviewBox.classList.add("hidden");
        return;
    }

    imagePreview.src = URL.createObjectURL(file);
    imagePreviewBox.classList.remove("hidden");
});

productForm.addEventListener("submit", async event => {
    event.preventDefault();

    const priceLabels = document.querySelectorAll(".price-label");
    const priceValues = document.querySelectorAll(".price-value");
    const prices = [];

    priceLabels.forEach((label, index) => {
        prices.push({
            label: label.value,
            price: Number(priceValues[index].value)
        });
    });

    const formData = new FormData();

    formData.append("category_id", productCategory.value);
    formData.append("name", document.getElementById("productName").value);
    formData.append("description", document.getElementById("productDescription").value);
    formData.append("image", productImage.files[0]);
    formData.append("prices", JSON.stringify(prices));

    const response = await apiFetch("/api/admin/products", {
        method: "POST",
        body: formData
    });

    const result = await response.json();

    if (!response.ok) {
        showToast(result.error || "Gagal menambahkan produk");
        return;
    }

    productForm.reset();
    priceRows.innerHTML = "";
    addPriceRow();
    imagePreviewBox.classList.add("hidden");

    showToast("Produk berhasil ditambahkan");
    await loadAdminData();
});

function getImageUrl(path) {
    if (path?.startsWith("http")) return path;
    return API_BASE + path;
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
}

function renderAdminProducts() {
    const list = document.getElementById("adminProductList");
    list.innerHTML = "";

    if (products.length === 0) {
        list.innerHTML = `
            <p style="color:#8f9bad;font-size:12px;">
                Belum ada produk.
            </p>
        `;
        return;
    }

    products.forEach(product => {
        const item = document.createElement("div");
        item.className = "admin-product-item";

        item.innerHTML = `
            <img src="${getImageUrl(product.image_url)}" alt="">
            <div>
                <strong>${escapeHtml(product.name)}</strong>
                <span>${product.prices.length} pilihan harga</span>
            </div>
        `;

        list.appendChild(item);
    });
}

document.getElementById("logoutButton").addEventListener("click", () => {
    localStorage.removeItem("linzzz_admin_token");
    location.reload();
});

function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

if (token && backendReady()) {
    openAdmin();
}

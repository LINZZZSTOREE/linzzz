const config = window.LINZZZ_CONFIG || {};
const API_BASE = String(config.API_BASE || "").replace(/\/$/, "");
const WHATSAPP_NUMBER = config.WHATSAPP_NUMBER || "6285920262613";

let categories = [];
let products = [];
let activeCategory = "all";
let selectedProduct = null;
let selectedPrice = null;
let quantity = 1;

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const closeSidebar = document.getElementById("closeSidebar");

const categoryStrip = document.getElementById("categoryStrip");
const productGrid = document.getElementById("productGrid");
const productCount = document.getElementById("productCount");
const loadingBox = document.getElementById("loadingBox");
const emptyState = document.getElementById("emptyState");

const productModal = document.getElementById("productModal");
const closeProductModal = document.getElementById("closeProductModal");
const modalProductImage = document.getElementById("modalProductImage");
const modalProductName = document.getElementById("modalProductName");
const modalProductDescription = document.getElementById("modalProductDescription");
const priceList = document.getElementById("priceList");
const minusQty = document.getElementById("minusQty");
const plusQty = document.getElementById("plusQty");
const quantityText = document.getElementById("quantity");
const totalPrice = document.getElementById("totalPrice");
const buyNowButton = document.getElementById("buyNowButton");

const paymentModal = document.getElementById("paymentModal");
const closePaymentModal = document.getElementById("closePaymentModal");
const confirmPayment = document.getElementById("confirmPayment");

menuBtn.addEventListener("click", () => {
    sidebar.classList.add("show");
    sidebarOverlay.classList.add("show");
    document.body.style.overflow = "hidden";
});

function hideSidebar() {
    sidebar.classList.remove("show");
    sidebarOverlay.classList.remove("show");
    document.body.style.overflow = "";
}

closeSidebar.addEventListener("click", hideSidebar);
sidebarOverlay.addEventListener("click", hideSidebar);

function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Number(value) || 0);
}

function getImageUrl(path) {
    if (!path) return "";

    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    return API_BASE + path;
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text ?? "";
    return div.innerHTML;
}

async function loadStore() {
    if (!API_BASE || API_BASE.includes("GANTI_USERNAME")) {
        loadingBox.innerHTML = `
            <i class="fa-solid fa-gear" style="font-size:32px;margin-bottom:15px;color:#69a8ff;"></i>
            <p>Backend belum disambungkan. Edit <b>assets/js/config.js</b> dulu.</p>
        `;
        return;
    }

    try {
        loadingBox.classList.remove("hidden");

        const [categoryResponse, productResponse] = await Promise.all([
            fetch(`${API_BASE}/api/categories`),
            fetch(`${API_BASE}/api/products`)
        ]);

        if (!categoryResponse.ok || !productResponse.ok) {
            throw new Error("Gagal mengambil data");
        }

        categories = await categoryResponse.json();
        products = await productResponse.json();

        renderCategories();
        renderProducts();
        loadingBox.classList.add("hidden");
    } catch (error) {
        console.error(error);

        loadingBox.innerHTML = `
            <i class="fa-solid fa-triangle-exclamation" style="font-size:32px;margin-bottom:15px;color:#ff8f8f;"></i>
            <p>Gagal terhubung ke server.</p>
        `;
    }
}

function renderCategories() {
    categoryStrip.innerHTML = `
        <button class="category-chip active" data-category="all">Semua</button>
    `;

    categories.forEach(category => {
        const button = document.createElement("button");
        button.className = "category-chip";
        button.dataset.category = category.id;
        button.textContent = category.name;
        categoryStrip.appendChild(button);
    });

    document.querySelectorAll(".category-chip").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".category-chip").forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");
            activeCategory = button.dataset.category;
            renderProducts();
        });
    });
}

function renderProducts() {
    let filteredProducts = products;

    if (activeCategory !== "all") {
        filteredProducts = products.filter(
            product => String(product.category_id) === String(activeCategory)
        );
    }

    productCount.textContent = `${filteredProducts.length} Produk`;
    productGrid.innerHTML = "";

    if (filteredProducts.length === 0) {
        emptyState.classList.remove("hidden");
        return;
    }

    emptyState.classList.add("hidden");

    filteredProducts.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";

        card.innerHTML = `
            <div class="product-image">
                <img src="${getImageUrl(product.image_url)}" alt="${escapeHtml(product.name)}">
            </div>
            <h3>${escapeHtml(product.name)}</h3>
        `;

        card.addEventListener("click", () => openProduct(product));
        productGrid.appendChild(card);
    });
}

function openProduct(product) {
    selectedProduct = product;
    quantity = 1;
    selectedPrice = product.prices?.[0] || null;

    modalProductImage.src = getImageUrl(product.image_url);
    modalProductImage.alt = product.name;
    modalProductName.textContent = product.name;
    modalProductDescription.textContent =
        product.description || "Tidak ada deskripsi.";

    renderPriceList();
    updateQuantity();

    productModal.classList.add("show");
    document.body.style.overflow = "hidden";
}

function renderPriceList() {
    priceList.innerHTML = "";

    if (!selectedProduct.prices || selectedProduct.prices.length === 0) {
        priceList.innerHTML = `
            <p style="color:#8f9bad;font-size:13px;">Harga belum tersedia.</p>
        `;
        return;
    }

    selectedProduct.prices.forEach((price, index) => {
        const button = document.createElement("button");
        button.className = "price-item";

        if (index === 0) button.classList.add("active");

        button.innerHTML = `
            <span>${escapeHtml(price.label)}</span>
            <strong>${formatRupiah(price.price)}</strong>
        `;

        button.addEventListener("click", () => {
            selectedPrice = price;

            document.querySelectorAll(".price-item").forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");
            updateQuantity();
        });

        priceList.appendChild(button);
    });
}

function updateQuantity() {
    quantityText.textContent = quantity;

    const price = selectedPrice ? Number(selectedPrice.price) : 0;
    totalPrice.textContent = formatRupiah(price * quantity);
}

minusQty.addEventListener("click", () => {
    if (quantity > 1) {
        quantity--;
        updateQuantity();
    }
});

plusQty.addEventListener("click", () => {
    quantity++;
    updateQuantity();
});

buyNowButton.addEventListener("click", () => {
    if (!selectedPrice) {
        alert("Silakan pilih harga terlebih dahulu.");
        return;
    }

    productModal.classList.remove("show");
    paymentModal.classList.add("show");
});

confirmPayment.addEventListener("click", () => {
    if (!selectedProduct || !selectedPrice) return;

    const unitPrice = Number(selectedPrice.price);
    const finalTotal = unitPrice * quantity;

    const message =
`*Nama :* ${selectedProduct.name} - ${selectedPrice.label}
*Harga :* ${formatRupiah(unitPrice)}
*Total :* ${formatRupiah(finalTotal)} (${quantity}x)`;

    const whatsappURL =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    window.location.href = whatsappURL;
});

function closeAllModal() {
    productModal.classList.remove("show");
    paymentModal.classList.remove("show");
    document.body.style.overflow = "";
}

closeProductModal.addEventListener("click", closeAllModal);
closePaymentModal.addEventListener("click", closeAllModal);

productModal.addEventListener("click", event => {
    if (event.target === productModal) closeAllModal();
});

paymentModal.addEventListener("click", event => {
    if (event.target === paymentModal) closeAllModal();
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeAllModal();
        hideSidebar();
    }
});

loadStore();

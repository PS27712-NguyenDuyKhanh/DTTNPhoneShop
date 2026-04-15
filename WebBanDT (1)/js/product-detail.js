const API = "http://localhost:8081/api/products/";

let selectedVariantId = null;

// ==========================
// CHECK SALE
// ==========================
function isSaleActive(start, end) {
    if (!start || !end) return false;
    const now = new Date();
    return now >= new Date(start) && now <= new Date(end);
}

// ==========================
// RENDER PRICE (QUAN TRỌNG)
// ==========================
function formatDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("vi-VN");
}

function renderPrice(v) {

    if (
        v.salePrice &&
        v.salePrice < v.price &&
        isSaleActive(v.saleStart, v.saleEnd)
    ) {

        const discount = Math.round(100 - (v.salePrice / v.price) * 100);

        return `
            <div class="price-box">

                <div class="price-main">
                    <span class="price-new">${v.salePrice.toLocaleString()} đ</span>
                    <span class="price-old">${v.price.toLocaleString()} đ</span>
                    <span class="price-percent">-${discount}%</span>
                </div>

                <div class="sale-time">
                    ${formatDate(v.saleStart)} - ${formatDate(v.saleEnd)}
                </div>

            </div>
        `;
    }

    return `
        <div class="price-box">
            <span class="price-new">${v.price.toLocaleString()} đ</span>
        </div>
    `;
}
// ==========================
// LOAD PRODUCT DETAIL
// ==========================
async function loadProduct() {

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) return;

    const res = await fetch(API + id);
    const p = await res.json();

    document.getElementById("name").innerText = p.name || "";

    document.getElementById("description").innerHTML = p.description || "";
    document.getElementById("fullDescription").innerHTML = p.description || "";

    const image = document.getElementById("image");
    const price = document.getElementById("price");
    const colors = document.getElementById("colors");
    const specs = document.getElementById("specs");

    const variants = p.variants || [];

    // ==========================
    // SPECIFICATIONS
    // ==========================
    if (p.specification) {

        const s = p.specification;

        specs.innerHTML = `
        <li><span>CPU</span><span>${s.cpu || "-"}</span></li>
        <li><span>RAM</span><span>${s.ram || "-"}</span></li>
        <li><span>ROM</span><span>${s.rom || "-"}</span></li>
        <li><span>GPU</span><span>${s.gpu || "-"}</span></li>
        <li><span>Camera</span><span>${s.camera || "-"}</span></li>
        <li><span>Pin</span><span>${s.battery || "-"}</span></li>
        <li><span>Màn hình</span><span>${s.screen || "-"}</span></li>
        `;
    }

    // ==========================
    // COLORS
    // ==========================
    colors.innerHTML = "";

    variants.forEach((v, index) => {

        const btn = document.createElement("button");

        let color = (v.color || "").toLowerCase();

        if (color === "đen") color = "black";
        else if (color === "trắng") color = "white";
        else if (color === "đỏ") color = "red";
        else if (color === "xanh") color = "green";
        else if (color === "xanh dương") color = "blue";
        else if (color === "vàng") color = "gold";
        else if (color === "cam") color = "orange";
        else if (color === "hồng") color = "#ff6ec7";
        else if (color === "tím") color = "purple";
        else if (color === "xám") color = "gray";
        else if (color === "bạc") color = "silver";

        btn.style.width = "36px";
        btn.style.height = "36px";
        btn.style.borderRadius = "50%";
        btn.style.border = "2px solid #ddd";
        btn.style.cursor = "pointer";
        btn.style.background = color;
        btn.style.marginRight = "10px";

        btn.title = v.color;

        btn.onclick = () => {

            selectedVariantId = v.id;

            const img = v.images?.[0]?.imageUrl || "";
            image.src = "http://localhost:8081" + img;

            // 👉 render giá
            price.innerHTML = renderPrice(v);
        };

        colors.appendChild(btn);

        // ==========================
        // LOAD FIRST VARIANT
        // ==========================
        if (index === 0) {

            selectedVariantId = v.id;

            const img = v.images?.[0]?.imageUrl || "";
            image.src = "http://localhost:8081" + img;

            price.innerHTML = renderPrice(v);
        }

    });

}

// ==========================
// TAB SWITCH
// ==========================
function openTab(tabId, btn) {

    document.querySelectorAll(".tab-content")
        .forEach(tab => tab.classList.remove("active"));

    document.querySelectorAll(".tab-btn")
        .forEach(b => b.classList.remove("active"));

    document.getElementById(tabId).classList.add("active");

    btn.classList.add("active");
}

// ==========================
// ADD TO CART
// ==========================
async function addToCart() {

    const token = sessionStorage.getItem("token");

    if (!token) {
        alert("Vui lòng đăng nhập");
        window.location.href = "login.html";
        return;
    }

    if (!selectedVariantId) {
        alert("Vui lòng chọn phiên bản");
        return;
    }

    try {

        await fetch(`http://localhost:8081/api/cart/add?variantId=${selectedVariantId}&quantity=1`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        alert("Đã thêm vào giỏ hàng");

    } catch (err) {
        console.error(err);
        alert("Lỗi thêm giỏ hàng");
    }
}

// ==========================
// INIT
// ==========================
window.onload = loadProduct;

async function addToCart() {

    const token = sessionStorage.getItem("token");

    if (!token) {
        alert("Vui lòng đăng nhập");
        window.location.href = "login.html";
        return;
    }

    if (!selectedVariantId) {
        alert("Vui lòng chọn phiên bản");
        return;
    }

    try {

        // =========================
        // EFFECT BAY VÀO GIỎ
        // =========================
        const img = document.getElementById("image");
        const cart = document.querySelector(".cart");

        const flyImg = img.cloneNode(true);
        flyImg.classList.add("fly-img");

        const rect = img.getBoundingClientRect();
        flyImg.style.left = rect.left + "px";
        flyImg.style.top = rect.top + "px";

        document.body.appendChild(flyImg);

        // delay để animate
        setTimeout(() => {
            const cartRect = cart.getBoundingClientRect();

            flyImg.style.left = cartRect.left + "px";
            flyImg.style.top = cartRect.top + "px";
            flyImg.style.width = "30px";
            flyImg.style.opacity = "0.5";
        }, 50);

        // xóa sau khi bay xong
        setTimeout(() => {
            flyImg.remove();
        }, 900);

        // =========================
        // CALL API
        // =========================
        await fetch(`http://localhost:8081/api/cart/add?variantId=${selectedVariantId}&quantity=1`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        // =========================
        // UPDATE BADGE
        // =========================
        const badge = document.getElementById("cartCount");

if (badge) {
    let count = parseInt(badge.innerText) || 0;
    count++;

    if (count > 0) {
        badge.innerText = count;
        badge.style.display = "inline-block";
    } else {
        badge.innerText = "";
        badge.style.display = "none";
    }
}

    } catch (err) {
        console.error(err);
        alert("Lỗi thêm giỏ hàng");
    }
}

function buyNow(){

    // 🔥 gọi lại hàm thêm vào giỏ
    addToCart();

    // 🔥 chuyển sang trang giỏ hàng
    window.location.href = "cart.html";
}
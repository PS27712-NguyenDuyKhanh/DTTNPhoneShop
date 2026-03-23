// ==========================
// TOKEN
// ==========================
function getToken() {
    return sessionStorage.getItem("token");
}

// ==========================
// GLOBAL
// ==========================
let vouchers = [];
let selectedVoucher = null;
let cartData = null;

// ==========================
// IMAGE
// ==========================
function buildImageUrl(img) {
    if (!img) return "";

    if (img.startsWith("http")) return img;

    if (img.startsWith("/")) return "http://localhost:8081" + img;

    return "http://localhost:8081/uploads/" + img;
}

// ==========================
// FORMAT
// ==========================
function formatMoney(n) {
    return n.toLocaleString("vi-VN") + "₫";
}

// ==========================
// RENDER CART
// ==========================
function renderCart(data) {

    cartData = data;

    const cartList = document.getElementById("cartList");
    cartList.innerHTML = "";

    if (!data || !data.items || data.items.length === 0) {
        cartList.innerHTML = "<p>Giỏ hàng của bạn đang trống</p>";
        document.getElementById("tong").innerText = "0₫";
        return;
    }

    let total = 0;

    data.items.forEach(item => {

        const img = buildImageUrl(item.image);
        const newPrice = item.price;
        const quantity = item.quantity;

        total += newPrice * quantity;

        cartList.insertAdjacentHTML("beforeend", `
<div class="cart-item">

    <img src="${img}" class="cart-img">

    <div class="cart-info">
        <h4>${item.productName}</h4>

        <button class="btn-delete" onclick="removeItem(${item.id})">
            <i class="fa-solid fa-trash"></i>
        </button>
    </div>

    <div class="cart-right">

        <div class="price-box">
            <span class="new-price">${formatMoney(newPrice)}</span>
        </div>

        <div class="cart-qty">
            <button onclick="updateQty(${item.id}, ${Math.max(1, quantity - 1)})">-</button>
            <input value="${quantity}" readonly>
            <button onclick="updateQty(${item.id}, ${quantity + 1})">+</button>
        </div>

    </div>

</div>
        `);
    });

    updateSummary(total);
}

// ==========================
// UPDATE SUMMARY (🔥 CORE)
// ==========================
function updateSummary(total) {

    const tongEl = document.getElementById("tong");

    let discount = 0;

    if (selectedVoucher) {

        if (selectedVoucher.percent) {
            discount = total * (selectedVoucher.discount / 100);
        } else {
            discount = selectedVoucher.discount;
        }

        if (discount > total) discount = total;
    }

    const finalTotal = total - discount;

    tongEl.innerHTML = `
        ${discount > 0 ? `
            <div style="color:#888">Tạm tính: ${formatMoney(total)}</div>
            <div style="color:#0a0">Giảm: -${formatMoney(discount)}</div>
            <div style="font-size:18px"><strong>${formatMoney(finalTotal)}</strong></div>
        ` : `
            ${formatMoney(total)}
        `}
    `;
}

// ==========================
// LOAD CART
// ==========================
async function loadCart() {

    const token = getToken();

    if (!token) {
        alert("Vui lòng đăng nhập");
        window.location.href = "login.html";
        return;
    }

    try {

        const res = await fetch("http://localhost:8081/api/cart", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                alert("Hết phiên đăng nhập!");
                window.location.href = "login.html";
            }
            return;
        }

        const data = await res.json();

        renderCart(data);

    } catch (err) {
        console.error(err);
        alert("Lỗi server");
    }
}

// ==========================
// REMOVE ITEM
// ==========================
async function removeItem(id) {

    const token = getToken();

    await fetch(`http://localhost:8081/api/cart/item/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    resetVoucher();
    loadCart();
}

// ==========================
// UPDATE QTY
// ==========================
async function updateQty(id, qty) {

    const token = getToken();

    const res = await fetch(`http://localhost:8081/api/cart/item/${id}?quantity=${qty}`, {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    if (!res.ok) {
        alert("Lỗi cập nhật số lượng");
        return;
    }

    resetVoucher();
    loadCart();
}

// ==========================
// RESET VOUCHER
// ==========================
function resetVoucher() {
    selectedVoucher = null;
    document.getElementById("voucher").value = "";
}

// ==========================
// CHECKOUT
// ==========================
async function checkout() {

    const token = getToken();

    const fullName = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const note = document.getElementById("note").value.trim();
    const voucherCode = document.getElementById("voucher").value.trim();

    if (!fullName || !phone || !address) {
        alert("Nhập đầy đủ thông tin");
        return;
    }

    try {

        const res = await fetch("http://localhost:8081/api/orders/checkout", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fullName,
                phone,
                address,
                note,
                voucherCode
            })
        });

        if (!res.ok) throw new Error();

        const data = await res.json(); // 🔥 QUAN TRỌNG

        // ❌ BỎ alert
        // alert("Đặt hàng thành công 🎉");

        // 🚀 CHUYỂN TRANG
        window.location.href = `payment.html?orderId=${data.orderId}`;

    } catch {
        alert("Lỗi đặt hàng");
    }
}

// ==========================
// VOUCHER
// ==========================
const VOUCHER_API = "http://localhost:8081/api/voucher";

async function loadVouchers() {
    try {
        const res = await fetch(VOUCHER_API);
        vouchers = await res.json();
    } catch {
        console.error("Lỗi load voucher");
    }
}

function toggleVoucherList() {

    const box = document.getElementById("voucherList");

    if (box.innerHTML !== "") {
        box.innerHTML = "";
        return;
    }

    renderVoucherList();
}

function renderVoucherList() {

    const box = document.getElementById("voucherList");
    box.innerHTML = "";

    const now = new Date();

    let total = 0;
    cartData.items.forEach(i => total += i.price * i.quantity);

    vouchers.forEach(v => {

        let disabled = false;
        let badge = "";

        // ❌ đã dùng
        if (v.usedByUser) {
            disabled = true;
            badge = "Đã dùng";
        }

        // ❌ hết hạn
        else if (new Date(v.endDate) < now) {
            disabled = true;
            badge = "Hết hạn";
        }

        // ❌ hết lượt
        else if (v.used >= v.quantity) {
            disabled = true;
            badge = "Hết lượt";
        }

        // ❌ chưa đủ tiền
        else if (v.minOrderValue > total) {
            disabled = true;
            badge = "Chưa đủ điều kiện";
        }

        const text = v.percent
            ? `Giảm ${v.discount}%`
            : `Giảm ${formatMoney(v.discount)}`;

        box.innerHTML += `
            <div class="voucher-item ${disabled ? "disabled" : ""}"
                ${!disabled ? `onclick="selectVoucher('${v.code}')"` : ""}>

                <div class="voucher-left">
                    <strong>${v.code}</strong>
                    <div>${text}</div>
                    <small>Min: ${formatMoney(v.minOrderValue)}</small>
                </div>

                ${badge ? `<div class="voucher-badge">${badge}</div>` : ""}

            </div>
        `;
    });
}

function selectVoucher(code) {

    const v = vouchers.find(x => x.code === code);
    selectedVoucher = v;

    document.getElementById("voucher").value = code;
    document.getElementById("voucherList").innerHTML = "";

    let total = 0;
    cartData.items.forEach(i => total += i.price * i.quantity);

    updateSummary(total);
}

// ==========================
// INIT
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    loadCart();
    loadVouchers();
});
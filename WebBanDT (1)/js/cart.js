
function getToken(){
    return sessionStorage.getItem("token");
}

function buildImageUrl(img){
    if(!img) return "";

    if(img.startsWith("http")) return img;

    if(img.startsWith("/")) return "http://localhost:8081" + img;

    return "http://localhost:8081/uploads/" + img;
}

function formatPrice(price) {
    return price.toLocaleString("vi-VN") + "₫";
}

// ==========================
// RENDER CART
// ==========================

function renderCart(data) {

    const cartList = document.getElementById("cartList");
    const tong = document.getElementById("tong");

    cartList.innerHTML = "";

    if (!data || !data.items || data.items.length === 0) {
        cartList.innerHTML = "<p>Giỏ hàng của bạn đang trống</p>";
        tong.innerText = "0₫";
        return;
    }

    let total = 0;

    data.items.forEach(item => {

        const name = item.productName;
        const price = item.price;
        const quantity = item.quantity;
        const img = buildImageUrl(item.image);

        total += price * quantity;

        cartList.insertAdjacentHTML("beforeend", `
<div class="cart-item">

    <img src="${img}">

    <div class="cart-info">
        <h4>${name}</h4>

        <div class="row">
            <span class="remove" onclick="removeItem(${item.id})">× Xóa</span>
        </div>
    </div>

    <div class="cart-right">
        <div class="price">
            <span class="new">${formatPrice(price)}</span>
        </div>

        <div class="cart-qty">
            <button onclick="updateQty(${item.id}, ${Math.max(1, quantity - 1)})">-</button>
            <input value="${quantity}">
            <button onclick="updateQty(${item.id}, ${quantity + 1})">+</button>
        </div>
    </div>

</div>
        `);
    });

    tong.innerText = formatPrice(total);
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
// REMOVE ITEM (FIX)
// ==========================

async function removeItem(id) {

    const token = getToken();

    await fetch(`http://localhost:8081/api/cart/item/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    loadCart();
}

// ==========================
// UPDATE QTY (FIX CHUẨN)
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

        if (res.status === 401 || res.status === 403) {
            alert("Phiên đăng nhập hết hạn!");
            window.location.href = "login.html";
        }

        return;
    }

    loadCart();
}

async function checkout(){

    const token = sessionStorage.getItem("token");

    if(!token){
        alert("Vui lòng đăng nhập");
        return;
    }

    const fullName = document.getElementById("fullName").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
    const note = document.getElementById("note").value;
    const voucherCode = document.getElementById("voucher").value; // 🔥 NEW

    if(!fullName || !phone || !address){
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    try{

        const res = await fetch("http://localhost:8081/api/orders/checkout", {
            method: "POST",
            headers:{
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fullName,
                phone,
                address,
                note,
                voucherCode // 🔥 NEW
            })
        });

        if(!res.ok){
            throw new Error("Đặt hàng thất bại");
        }

        alert("Đặt hàng thành công 🎉");

        loadCart();

    }catch(err){
        console.error(err);
        alert("Lỗi đặt hàng");
    }
}

document.addEventListener("DOMContentLoaded", loadCart);

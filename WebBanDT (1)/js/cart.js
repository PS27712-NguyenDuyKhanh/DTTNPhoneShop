const API_CART = "http://localhost:8081/api/cart";

// ==========================
// LOAD CART
// ==========================

async function loadCart(){

    const token = getToken();

    if(!token){
        alert("Vui lòng đăng nhập");
        window.location.href = "login.html";
        return;
    }

    try{

        const res = await fetch(API_CART, {
            headers: getAuthHeader()
        });

        if(!res.ok){

            if(res.status === 401){
                alert("Hết phiên đăng nhập");
                window.location.href = "login.html";
            }

            return;
        }

        const data = await res.json();

        console.log("Cart:", data);

        renderCart(data);

    }catch(err){
        console.error("Lỗi:", err);
    }
}

// ==========================
// RENDER
// ==========================

function renderCart(data){

    const cartList = document.getElementById("cartList");
    const tong = document.getElementById("tong");

    cartList.innerHTML = "";

    if(!data || !data.items || data.items.length === 0){
        cartList.innerHTML = "<p>Giỏ hàng của bạn đang trống</p>";
        tong.innerText = "0₫";
        return;
    }

    data.items.forEach(item => {

        const name = item.productName;
        const price = item.price;
        const quantity = item.quantity;
        const img = item.image;

        cartList.insertAdjacentHTML("beforeend", `
        <div class="cart-item">

            <img src="http://localhost:8081${img}">

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
                    <button onclick="updateQty(${item.id}, ${Math.max(1, quantity-1)})">-</button>
                    <input value="${quantity}">
                    <button onclick="updateQty(${item.id}, ${quantity+1})">+</button>
                </div>
            </div>

        </div>
        `);

    });

    tong.innerText = formatPrice(data.totalAmount);
}

// ==========================
// DELETE
// ==========================

async function removeItem(id){

    await fetch(`${API_CART}/remove/${id}`, {
        method: "DELETE",
        headers: getAuthHeader()
    });

    loadCart();
}

// ==========================
// UPDATE
// ==========================

async function updateQty(id, quantity){

    if(quantity < 1) return;

    await fetch(`${API_CART}/update`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeader()
        },
        body: JSON.stringify({
            itemId: id,
            quantity: quantity
        })
    });

    loadCart();
}

// ==========================
// INIT
// ==========================

document.addEventListener("DOMContentLoaded", loadCart);
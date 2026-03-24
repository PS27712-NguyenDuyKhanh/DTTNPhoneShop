// ==========================
// CONFIG
// ==========================
const API = "http://localhost:8081/api/admin/orders";

let allOrders = [];
let lastNewCount = 0;

// ==========================
// AUTH
// ==========================
function getToken(){
    return sessionStorage.getItem("token");
}

function getAuthHeader(){
    return {
        "Authorization": "Bearer " + getToken(),
        "Content-Type": "application/json"
    };
}

// ==========================
// UTIL
// ==========================
function formatMoney(n){
    return n.toLocaleString("vi-VN") + "₫";
}

function formatDate(d){
    if(!d) return "";
    return new Date(d).toLocaleDateString("vi-VN");
}

function getStatusClass(s){
    return {
        PENDING:"status-pending",
        CONFIRMED:"status-shipping",
        SHIPPING:"status-shipping",
        DONE:"status-success",
        CANCELLED:"status-cancel"
    }[s];
}

function translate(s){
    return {
        PENDING: "Chờ xác nhận",
        CONFIRMED: "Đã xác nhận",
        SHIPPING: "Đang giao",
        DONE: "Hoàn thành",
        CANCELLED: "Đã hủy"
    }[s] || s;
}

// ==========================
// LOAD ORDERS
// ==========================
let currentPage = 0;
const size = 10;

async function loadOrders(page = 0){

    currentPage = page;

    try {

        const res = await fetch(`${API}?page=${page}&size=${size}`, {
            headers: getAuthHeader()
        });

        if (!res.ok) {
            if (res.status === 401) {
                alert("Hết phiên đăng nhập!");
                window.location.href = "../login.html";
                return;
            }
            if (res.status === 403) {
                alert("Bạn không có quyền!");
                return;
            }
            return alert("Không load được đơn hàng!");
        }

        const data = await res.json();

        console.log("ORDERS:", data);

        // 🔥 FIX CHUẨN
        const orders = data.content || [];

        allOrders = orders;

        renderOrders(orders);

        // 🔥 render pagination
        renderPagination(data);

    } catch (err) {
        console.error(err);
        alert("Lỗi server!");
    }
}

function renderPagination(data){

    const container = document.getElementById("pagination");
    if (!container) return;

    container.innerHTML = "";

    if (!data.totalPages) return;

    // Prev
    container.innerHTML += `
        <button ${data.first ? 'disabled' : ''} 
            onclick="loadOrders(${data.number - 1})">
            ←
        </button>
    `;

    // Pages
    for(let i = 0; i < data.totalPages; i++){
        container.innerHTML += `
            <button 
                onclick="loadOrders(${i})"
                class="${i === data.number ? 'active-page' : ''}">
                ${i + 1}
            </button>
        `;
    }

    // Next
    container.innerHTML += `
        <button ${data.last ? 'disabled' : ''} 
            onclick="loadOrders(${data.number + 1})">
            →
        </button>
    `;
}

// ==========================
// RENDER TABLE (🔥 FIX CHÍNH)
// ==========================
function renderOrders(orders){

    const tbody = document.getElementById("orderTable");
    tbody.innerHTML = "";

    orders.forEach(o => {

        tbody.innerHTML += `
        <tr>
            <td>#DH${o.id}</td>
            <td>${o.fullName}</td>
            <td>${o.items.length} sản phẩm</td>
            <td class="price">${formatMoney(o.total)}</td>
            <td>${formatDate(o.createdAt)}</td>

            <!-- ORDER STATUS -->
            <td class="${getStatusClass(o.status)}">
                ${translate(o.status)}
            </td>

            <!-- 🔥 PAYMENT STATUS -->
            <td style="color:${o.paid ? 'green' : 'red'};">
                ${o.paid ? "Đã thanh toán" : "Chưa thanh toán"}
            </td>

            <!-- ACTION -->
            <td>
                <div class="action-buttons">

                    <!-- VIEW -->
                    <button class="view" onclick="viewOrder(${o.id})">
                        👁
                    </button>

                    <!-- 🔥 PAYMENT CONFIRM -->
                    ${!o.paid ? `
                        <button onclick="confirmPayment(${o.id})" 
                            style="background:orange;color:white;">
                            💰
                        </button>
                    ` : ""}

                    <!-- ORDER FLOW -->
                    ${o.status === "PENDING" ? `
                        <button onclick="updateStatus(${o.id}, 'CONFIRMED')">✔</button>
                    ` : ""}

                    ${o.status === "CONFIRMED" ? `
                        <button onclick="updateStatus(${o.id}, 'SHIPPING')">🚚</button>
                    ` : ""}

                    ${o.status === "SHIPPING" ? `
                        <button onclick="updateStatus(${o.id}, 'DONE')">✔✔</button>
                    ` : ""}

                    ${o.status !== "DONE" && o.status !== "CANCELLED" ? `
                        <button onclick="updateStatus(${o.id}, 'CANCELLED')">✖</button>
                    ` : ""}

                </div>
            </td>
        </tr>
        `;
    });
}

// ==========================
// CONFIRM PAYMENT (🔥 NEW)
// ==========================
async function confirmPayment(orderId){

    if(!confirm("Xác nhận đã nhận tiền từ khách?")) return;

    try {
        const res = await fetch(
            `http://localhost:8081/api/admin/payments/confirm/${orderId}`,
            {
                method: "PUT",
                headers: {
                    "Authorization": "Bearer " + getToken()
                }
            }
        );

        if(!res.ok){
            return alert("Xác nhận thất bại!");
        }

        alert("Đã xác nhận thanh toán!");

        loadOrders();

    } catch(err){
        console.error(err);
        alert("Lỗi server!");
    }
}

// ==========================
// VIEW DETAIL
// ==========================
function viewOrder(id){

    const o = allOrders.find(x => x.id === id);

    const box = document.getElementById("orderDetailContent");

    box.innerHTML = `
        <p><b>Khách:</b> ${o.fullName}</p>
        <p><b>SĐT:</b> ${o.phone}</p>
        <p><b>Địa chỉ:</b> ${o.address}</p>

        <hr>

        ${o.items.map(i => `
            <div class="order-item-row">
                <span>${i.productName}</span>
                <span>x${i.quantity}</span>
                <span>${formatMoney(i.price)}</span>
            </div>
        `).join("")}

        <hr>
        <b>Tổng: ${formatMoney(o.total)}</b>
    `;

    document.getElementById("orderDetail").style.display = "flex";
}

function closeDetail(){
    document.getElementById("orderDetail").style.display = "none";
}

async function checkNewOrders(){

    try {

        const res = await fetch(`${API}/new-count`, {
            headers: getAuthHeader()
        });

        const count = Number(await res.text());

        // 🔴 update badge
        updateBadge(count);

        // 🔔 nếu có đơn mới
        if(count > lastNewCount){
            toast("🛒 Có đơn hàng mới!");
        }

        lastNewCount = count;

    } catch (err) {
        console.error("Lỗi check đơn mới:", err);
    }
}
function updateBadge(count){

    const badge = document.getElementById("orderBadge");

    if(!badge) return;

    if(count > 0){
        badge.innerText = count;
        badge.style.display = "inline-block";
    }else{
        badge.style.display = "none";
    }
}

// ==========================
// UPDATE STATUS
// ==========================
async function updateStatus(id, status){

    try {

        const res = await fetch(
            `${API}/${id}/status?status=${status}`,
            {
                method: "PUT",
                headers: {
                    "Authorization": "Bearer " + getToken()
                }
            }
        );

        if (!res.ok) {
            return alert("Cập nhật thất bại!");
        }

        loadOrders();

    } catch (err) {
        console.error(err);
        alert("Lỗi server!");
    }
}

function toast(msg){

    const t = document.createElement("div");

    t.innerText = msg;

    t.style = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: black;
        color: white;
        padding: 10px 15px;
        border-radius: 8px;
        z-index: 9999;
    `;

    document.body.appendChild(t);

    setTimeout(() => t.remove(), 3000);
}

// ==========================
// INIT
// ==========================
document.addEventListener("DOMContentLoaded", () => {

    if (!getToken()) {
        window.location.href = "../login.html";
        return;
    }

    loadOrders();

// 🔥 chạy lần đầu
checkNewOrders();

// 🔥 chạy mỗi 5 giây
setInterval(checkNewOrders, 5000);
});
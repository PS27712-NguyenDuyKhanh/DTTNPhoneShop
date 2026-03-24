// ==========================
// CONFIG
// ==========================
const API = "http://localhost:8081/api/admin/orders";

let allOrders = [];

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
async function loadOrders(){

    try {

        const res = await fetch(API, {
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
        allOrders = data;

        renderOrders(data);

    } catch (err) {
        console.error(err);
        alert("Lỗi server!");
    }
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

// ==========================
// INIT
// ==========================
document.addEventListener("DOMContentLoaded", () => {

    if (!getToken()) {
        window.location.href = "../login.html";
        return;
    }

    loadOrders();
});
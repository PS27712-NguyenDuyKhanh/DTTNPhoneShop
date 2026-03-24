const API = "http://localhost:8081/api/orders";
const BASE_URL = "http://localhost:8081";

function getToken() {
    return sessionStorage.getItem("token");
}

async function loadOrders() {
    try {
        const res = await fetch(API, {
            headers: {
                "Authorization": "Bearer " + getToken()
            }
        });

        const orders = await res.json();

        const container = document.getElementById("orderList");
        container.innerHTML = "";

        if (!orders || orders.length === 0) {
            container.innerHTML = "<p>Chưa có đơn hàng</p>";
            return;
        }

        orders.forEach(order => {

            let itemsHTML = "";

            (order.items || []).forEach(i => {

                let imgPath = "";

                // ✅ FIX CHÍNH: API của bạn dùng i.image
                if (i.image) {
                    imgPath = i.image;
                }
                else if (i.variant?.images?.length > 0) {
                    imgPath =
                        i.variant.images[0].imageUrl ||
                        i.variant.images[0].url;
                }
                else if (i.variant?.image) {
                    imgPath = i.variant.image;
                }
                else if (i.product?.image) {
                    imgPath = i.product.image;
                }

                let image = "";

                if (!imgPath) {
                    image = "https://dummyimage.com/80x80/ccc/000.png&text=No+Img";
                }
                else if (imgPath.startsWith("http")) {
                    image = imgPath;
                }
                else {
                    image = BASE_URL + (imgPath.startsWith("/") ? imgPath : "/" + imgPath);
                }

                // ===== THÔNG TIN =====
                const name =
                    i.variant?.productName ||
                    i.product?.name ||
                    "Sản phẩm";

                const quantity = i.quantity || 1;

                const price =
                    i.price ||
                    i.variant?.price ||
                    0;

                // ===== BUILD HTML ĐÚNG CHỖ =====
                itemsHTML += `
                    <div class="order-item">
                        <div style="display:flex;gap:10px;align-items:center;">
                            <img src="${image}" 
                                onclick="showOrderDetail(${order.id})"  
                                style="width:80px;height:80px;object-fit:cover;cursor:pointer;">
                            <div>
                                <div>${name}</div>
                                <div>x${quantity}</div>
                            </div>
                        </div>

                        <div>${formatMoney(price)}</div>
                    </div>
                `;
            });

            // ===== RENDER ORDER =====
            container.innerHTML += `
                <div class="order-card">

                    <div class="order-header">
                        <div>Mã đơn: ${order.id}</div>
                        <div class="status ${order.status}">
                            ${getStatusText(order.status)}
                        </div>
                    </div>

                    ${itemsHTML}

                    <div class="order-footer">
                        Tổng: ${formatMoney(order.total || 0)}
                    </div>

                </div>
            `;
        });

    } catch (err) {
        console.error(err);
        alert("Lỗi server!");
    }
}

// ===== FORMAT =====
function formatMoney(n) {
    return Number(n).toLocaleString("vi-VN") + "₫";
}

// ===== STATUS =====
function getStatusText(status) {
    switch (status) {
        case "PENDING": return "Đang xử lý";
        case "COMPLETED": return "Hoàn thành";
        case "CANCELLED": return "Đã huỷ";
        default: return status;
    }
}

// ===== LOAD =====
document.addEventListener("DOMContentLoaded", loadOrders);

async function showOrderDetail(orderId) {

    const modal = document.getElementById("orderModal");
    const content = document.getElementById("orderDetailContent");

    content.innerHTML = "Đang tải...";

    try {
        const res = await fetch(`${API}/${orderId}`, {
            headers: {
                "Authorization": "Bearer " + getToken()
            }
        });

        const order = await res.json();
        // 🔥 THÊM ĐOẠN NÀY
        const paymentHtml = order.paid
            ? `<span class="payment-status payment-paid">Đã thanh toán</span>`
            : `<span class="payment-status payment-unpaid">Chưa thanh toán</span>`;

        let html = `
            <h3>Mã đơn: ${order.id}</h3>

            <p><b>👤 Người nhận:</b> ${order.fullName}</p>
            <p><b>📞 SĐT:</b> ${order.phone}</p>
            <p><b>📍 Địa chỉ:</b> ${order.address}</p>
            <p><b>📝 Ghi chú:</b> ${order.note || "Không có"}</p>
            <p><b>⏱ Thời gian:</b> ${order.createdAt || ""}</p>
        `;

        // ===== DANH SÁCH SẢN PHẨM =====
        html += `<hr/><h4>Sản phẩm</h4>`;

        (order.items || []).forEach(i => {

            let img = i.image
                ? (i.image.startsWith("http") ? i.image : BASE_URL + i.image)
                : "https://dummyimage.com/60x60/ccc/000.png&text=No";

            html += `
                <div style="display:flex;gap:10px;margin-bottom:10px;">
                    <img src="${img}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">
                    <div>
                        <div><b>${i.productName}</b></div>
                        <div>Số lượng: x${i.quantity}</div>
                        <div>Giá: ${formatMoney(i.price)}</div>
                    </div>
                </div>
            `;
        });

        // ===== STATUS =====
        html += `<hr/><h4>Trạng thái</h4>`;

 const statusHtml = `<span class="status-badge status-${order.status.toLowerCase()}">
    ${getStatusText(order.status)}
</span>`;

html += `
    <div class="status-step">
        ${statusHtml}
        ${paymentHtml}
    </div>
`;

        // ===== TOTAL =====
        html += `
            <hr/>
            <h3 style="color:#f87171">Tổng: ${formatMoney(order.total)}</h3>
        `;

        content.innerHTML = html;
        modal.style.display = "block";

    } catch (err) {
        console.error(err);
        content.innerHTML = "Lỗi tải dữ liệu!";
    }
}

function closeModal() {
    document.getElementById("orderModal").style.display = "none";
}
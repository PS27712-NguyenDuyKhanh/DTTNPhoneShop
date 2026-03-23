const API = "http://localhost:8081/api";

const orderId = new URLSearchParams(window.location.search).get("orderId");

// ==========================
// LOAD ORDER INFO
// ==========================
async function loadOrder(){

    try {
        const res = await fetch(`${API}/orders/${orderId}`, {
            headers:{
                "Authorization":"Bearer " + sessionStorage.getItem("token")
            }
        });

        if(!res.ok){
            return alert("Không load được đơn hàng!");
        }

        const o = await res.json();

        // 🔥 nếu đã thanh toán rồi → redirect luôn
        if(o.isPaid){
            window.location.href = `success.html?orderId=${orderId}`;
            return;
        }

        document.getElementById("orderInfo").innerHTML = `
            <p><b>Mã đơn:</b> #${o.id}</p>
            <p><b>Khách:</b> ${o.fullName || "N/A"}</p>
            <p><b>Tổng tiền:</b> ${(o.total || 0).toLocaleString()}₫</p>
            <p style="color:red;"><b>Trạng thái:</b> ${o.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}</p>
        `;

    } catch(err){
        console.error(err);
        alert("Lỗi load đơn!");
    }
}

// ==========================
// CONFIRM PAYMENT
// ==========================
async function confirmPayment(){

    const selected = document.querySelector('input[name="method"]:checked');

    if (!selected) {
        alert("Vui lòng chọn phương thức thanh toán!");
        return;
    }

    const method = selected.value;

    try {

        const res = await fetch(`${API}/payments`, {
            method:"POST",
            headers:{
                "Authorization":"Bearer " + sessionStorage.getItem("token"),
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                orderId: orderId,
                method: method
            })
        });

        if(!res.ok){
            return alert("Thanh toán thất bại!");
        }

        // =========================
        // COD / ZALOPAY
        // =========================
        if(method === "COD" || method === "ZALOPAY"){
            alert("Thanh toán thành công!");
            window.location.href = `success.html?orderId=${orderId}`;
        }

        // =========================
        // BANK
        // =========================
        else if(method === "BANK"){
            alert("Vui lòng chuyển khoản. Hệ thống sẽ tự xác nhận!");

            startPolling(); // 🔥 bắt đầu check
        }

    } catch(err){
        console.error(err);
        alert("Lỗi server!");
    }
}

// ==========================
// POLLING CHECK STATUS (SỬA)
// ==========================
function startPolling(){

    const interval = setInterval(async () => {

        try {

            // 🔥 đổi sang check order luôn
            const res = await fetch(`${API}/orders/${orderId}`, {
                headers:{
                    "Authorization":"Bearer " + sessionStorage.getItem("token")
                }
            });

            if(!res.ok) return;

            const o = await res.json();

            if(o.isPaid){
                clearInterval(interval);

                alert("Thanh toán thành công!");
                window.location.href = `success.html?orderId=${orderId}`;
            }

        } catch(err){
            console.error(err);
        }

    }, 3000);
}

// ==========================
// RADIO CHANGE (HIỆN QR)
// ==========================
document.querySelectorAll('input[name="method"]').forEach(radio => {

    radio.addEventListener("change", () => {

        const bankBox = document.getElementById("bankBox");
        const btn = document.querySelector("button");

        if (radio.value === "BANK" && radio.checked) {

            bankBox.style.display = "block";
            btn.disabled = true;

            document.getElementById("qrImg").src =
                "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAY-" + orderId;

        } else {

            bankBox.style.display = "none";
            btn.disabled = false;
        }
    });
});

// ==========================
// INIT
// ==========================
loadOrder();
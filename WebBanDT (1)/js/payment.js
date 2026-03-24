const API = "http://localhost:8081/api";
const orderId = new URLSearchParams(window.location.search).get("orderId");

// ==========================
// LOAD ORDER
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
        renderOrder(o);

    } catch(err){
        console.error(err);
        alert("Lỗi load đơn!");
    }
}

// ==========================
// RENDER UI
// ==========================
function renderOrder(o){

    document.getElementById("orderInfo").innerHTML = `
        <p><b>Mã đơn:</b> #${o.id}</p>
        <p><b>Khách:</b> ${o.fullName || "N/A"}</p>
        <p><b>Tổng tiền:</b> ${(o.total || 0).toLocaleString()}₫</p>
        <p style="color:${o.paid ? 'green' : 'red'};">
            <b>Trạng thái:</b> ${o.paid ? "Đã thanh toán" : "Chưa thanh toán"}
        </p>
    `;

    const btn = document.getElementById("confirmBtn");

    if(o.paid){
        btn.disabled = false;
        btn.innerText = "Hoàn tất";
    } else {
        btn.disabled = true;
        btn.innerText = "Chờ xác nhận...";
    }
}

// ==========================
// CREATE PAYMENT (BANK)
// ==========================
async function createBankPayment(){
    try {
        await fetch(`${API}/payments`, {
            method:"POST",
            headers:{
                "Authorization":"Bearer " + sessionStorage.getItem("token"),
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                orderId: orderId,
                method: "BANK"
            })
        });
    } catch(err){
        console.error("Lỗi tạo payment:", err);
    }
}

// ==========================
// HANDLE BUTTON CLICK
// ==========================
async function handlePayment(){

    const res = await fetch(`${API}/orders/${orderId}`, {
        headers:{
            "Authorization":"Bearer " + sessionStorage.getItem("token")
        }
    });

    const o = await res.json();

    // 🔥 nếu đã thanh toán → đi luôn
    if(o.paid){
        window.location.href = `success.html?orderId=${orderId}`;
        return;
    }

    const selected = document.querySelector('input[name="method"]:checked');

    if (!selected) {
        alert("Vui lòng chọn phương thức thanh toán!");
        return;
    }

    const method = selected.value;

    // =========================
    // COD / ZALO
    // =========================
    if(method === "COD" || method === "ZALOPAY"){

        const payRes = await fetch(`${API}/payments`, {
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

        if(!payRes.ok){
            return alert("Thanh toán thất bại!");
        }

        window.location.href = `success.html?orderId=${orderId}`;
    }

    // =========================
    // BANK
    // =========================
    else if(method === "BANK"){
        alert("Vui lòng chuyển khoản. Admin sẽ xác nhận!");
        startPolling();
    }
}

// ==========================
// POLLING
// ==========================
function startPolling(){

    const interval = setInterval(async () => {

        try {
            const res = await fetch(`${API}/orders/${orderId}`, {
                headers:{
                    "Authorization":"Bearer " + sessionStorage.getItem("token")
                }
            });

            if(!res.ok) return;

            const o = await res.json();

            renderOrder(o);

            if(o.paid){
                clearInterval(interval);
            }

        } catch(err){
            console.error(err);
        }

    }, 3000);
}

// ==========================
// RADIO CHANGE
// ==========================
document.querySelectorAll('input[name="method"]').forEach(radio => {

    radio.addEventListener("change", () => {

        const bankBox = document.getElementById("bankBox");

        if (radio.value === "BANK" && radio.checked) {

            bankBox.style.display = "block";

            createBankPayment();

            document.getElementById("qrImg").src =
                "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAY-" + orderId;

        } else {

            bankBox.style.display = "none";
        }
    });
});

// ==========================
// INIT
// ==========================
loadOrder();
startPolling();
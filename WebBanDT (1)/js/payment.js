
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

    btn.disabled = false;
    btn.innerText = o.paid ? "Hoàn tất" : "Thanh toán";
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
// HANDLE PAYMENT
// ==========================
async function handlePayment(){

    const res = await fetch(`${API}/orders/${orderId}`, {
        headers:{
            "Authorization":"Bearer " + sessionStorage.getItem("token")
        }
    });

    const o = await res.json();

    if(o.paid){
        showSuccess();
        return;
    }

    const selected = document.querySelector('input[name="method"]:checked');

    if (!selected) {
        alert("Vui lòng chọn phương thức thanh toán!");
        return;
    }

    const method = selected.value;

    // =========================
    // COD
    // =========================
    if(method === "COD"){

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

        showSuccess();
    }

    // =========================
    // BANK
    // =========================
    else if(method === "BANK"){

        showWaiting(); // 🔥 popup chờ

        startPolling(); // check admin
    }

    // =========================
    // VNPAY
    // =========================
    else if(method === "VNPAY"){

        try {
            const res = await fetch(`${API}/payments/vnpay?orderId=${orderId}`, {
                headers:{
                    "Authorization":"Bearer " + sessionStorage.getItem("token")
                }
            });

            if(!res.ok){
                return alert("Không tạo được thanh toán VNPAY!");
            }

            const data = await res.json();

            window.location.href = data.url;

        } catch(err){
            console.error(err);
            alert("Lỗi kết nối VNPAY!");
        }
    }
}

// ==========================
// POLLING
// ==========================
let pollingInterval = null;

function startPolling(){

    if(pollingInterval) return;

    pollingInterval = setInterval(async () => {

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
                clearInterval(pollingInterval);
                pollingInterval = null;

                hideWaiting();   // 🔥 tắt chờ
                showSuccess();   // 🔥 hiện success
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
        const btn = document.getElementById("confirmBtn");

        if (radio.value === "BANK" && radio.checked) {

            bankBox.style.display = "block";

            createBankPayment();

            btn.disabled = false;
            btn.innerText = "Thanh toán";

            document.getElementById("qrImg").src =
                "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAY-" + orderId;

        } else {

            bankBox.style.display = "none";

            btn.innerText = "Thanh toán";
        }
    });
});

// ==========================
// MODAL
// ==========================
function showWaiting(){
    document.getElementById("waitingModal").style.display = "flex";
}

function hideWaiting(){
    document.getElementById("waitingModal").style.display = "none";
}

function showSuccess(){
    document.getElementById("successModal").style.display = "flex";
}

function goHome(){
    window.location.href = "home.html";
}

// ==========================
// INIT
// ==========================
loadOrder();


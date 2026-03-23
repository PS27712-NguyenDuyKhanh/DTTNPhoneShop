const API = "http://localhost:8081/api";

const orderId = new URLSearchParams(window.location.search).get("orderId");

// ==========================
// LOAD ORDER INFO
// ==========================
async function loadOrder(){

    const res = await fetch(`${API}/orders/${orderId}`, {
        headers:{
            "Authorization":"Bearer " + sessionStorage.getItem("token")
        }
    });

    const o = await res.json();

    document.getElementById("orderInfo").innerHTML = `
        <p><b>Mã đơn:</b> #${o.id}</p>
        <p><b>Khách:</b> ${o.fullName}</p>
        <p><b>Tổng tiền:</b> ${o.total.toLocaleString()}₫</p>
    `;
}

// ==========================
// CONFIRM PAYMENT
// ==========================
async function confirmPayment(){

    const method = document.querySelector('input[name="pay"]:checked').value;

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

        alert("Thanh toán thành công!");

        // 👉 chuyển sang trang success
        window.location.href = `success.html?orderId=${orderId}`;

    } catch(err){
        console.error(err);
        alert("Lỗi server!");
    }
}

loadOrder();
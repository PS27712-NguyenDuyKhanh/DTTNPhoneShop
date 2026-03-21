const API = "http://localhost:8081/api/admin/vouchers";
let editingId = null;

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
// FORM
// ==========================

function showForm(){
    document.getElementById("voucherForm").style.display = "block";
    document.getElementById("overlay").style.display = "block";

    // đổi title
    document.querySelector("#voucherForm h3").innerText =
        editingId ? "Sửa voucher" : "Thêm voucher";
}

function closeForm(){
    document.getElementById("voucherForm").style.display = "none";
    document.getElementById("overlay").style.display = "none";
    resetForm();
    editingId = null;
}

function resetForm(){
    document.querySelectorAll("#voucherForm input").forEach(i => {
        if(i.type === "checkbox") i.checked = false;
        else i.value = "";
    });
}

// ==========================
// CREATE + UPDATE
// ==========================

async function saveVoucher(){

    const data = {
        code: document.getElementById("code").value.trim(),
        discount: Number(document.getElementById("discount").value),
        percent: document.getElementById("percent").checked,
        minOrderValue: Number(document.getElementById("min").value),
        maxDiscount: Number(document.getElementById("max").value),
        quantity: Number(document.getElementById("quantity").value),
        startDate: document.getElementById("start").value,
        endDate: document.getElementById("end").value,
        active: true
    };

    // VALIDATE
    if(!data.code) return alert("Nhập mã voucher!");
    if(data.discount <= 0) return alert("Giảm phải > 0");
    if(data.quantity <= 0) return alert("Số lượng phải > 0");

    if(!data.startDate || !data.endDate){
        return alert("Chọn ngày!");
    }

    if(new Date(data.startDate) >= new Date(data.endDate)){
        return alert("Ngày kết thúc phải sau ngày bắt đầu");
    }

    try {

        let url = API;
        let method = "POST";

        // 👉 UPDATE
        if(editingId){
            url = API + "/" + editingId;
            method = "PUT";
        }

        const res = await fetch(url, {
            method: method,
            headers: getAuthHeader(),
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            let msg = "Lưu thất bại";
            try { msg = await res.text(); } catch {}
            alert(msg);
            return;
        }

        alert(editingId ? "Cập nhật thành công!" : "Tạo thành công!");

        closeForm();
        loadAdminVouchers();

    } catch (err) {
        console.error(err);
        alert("Lỗi server!");
    }
}

// ==========================
// LOAD
// ==========================

async function loadAdminVouchers() {

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
            return alert("Không load được!");
        }

        const vouchers = await res.json();

        const table = document.getElementById("voucherTable");
        table.innerHTML = "";

        vouchers.forEach(v => {

            const discount = v.percent
                ? v.discount + "%"
                : formatMoney(v.discount);

            const status = getStatus(v);

            table.insertAdjacentHTML("beforeend", `
                <tr>
                    <td>${v.code}</td>
                    <td>${discount}</td>
                    <td>${formatMoney(v.minOrderValue)}</td>
                    <td>${v.used} / ${v.quantity}</td>
                    <td>${formatDate(v.endDate)}</td>
                    <td>${status}</td>
                    <td>

                        <!-- 🔥 FIX -->
                        <button onclick='editVoucher(${JSON.stringify(v)})'>
                            <i class="fa fa-pen"></i>
                        </button>

                        <button onclick="deleteVoucher(${v.id})">
                            <i class="fa fa-trash"></i>
                        </button>

                    </td>
                </tr>
            `);

        });

    } catch (err) {
        console.error(err);
        alert("Lỗi server!");
    }
}

// ==========================
// EDIT
// ==========================

function editVoucher(v){

    editingId = v.id;

    document.getElementById("code").value = v.code;
    document.getElementById("discount").value = v.discount;
    document.getElementById("percent").checked = v.percent;
    document.getElementById("min").value = v.minOrderValue;
    document.getElementById("max").value = v.maxDiscount;
    document.getElementById("quantity").value = v.quantity;

    document.getElementById("start").value = toInputDate(v.startDate);
    document.getElementById("end").value = toInputDate(v.endDate);

    showForm();
}

// ==========================
// DELETE
// ==========================

async function deleteVoucher(id) {

    if (!confirm("Xóa voucher này?")) return;

    try {

        const res = await fetch(API + "/" + id, {
            method: "DELETE",
            headers: getAuthHeader()
        });

        if (!res.ok) {
            let msg = "Xóa thất bại";
            try { msg = await res.text(); } catch {}
            return alert(msg);
        }

        alert("Xóa thành công!");
        loadAdminVouchers();

    } catch (err) {
        console.error(err);
        alert("Lỗi server!");
    }
}

// ==========================
// UTIL
// ==========================

function formatMoney(n){
    return n.toLocaleString() + "₫";
}

function formatDate(date){
    return new Date(date).toLocaleDateString("vi-VN");
}

function toInputDate(date){
    return new Date(date).toISOString().slice(0,16);
}

function getStatus(v){
    const now = new Date();
    if (!v.active) return "Tắt";
    if (new Date(v.endDate) < now) return "Hết hạn";
    if (v.used >= v.quantity) return "Hết lượt";
    return "Hoạt động";
}

// ==========================
// INIT
// ==========================

document.addEventListener("DOMContentLoaded", () => {

    if (!getToken()) {
        window.location.href = "../login.html";
        return;
    }

    loadAdminVouchers();
});
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
    clearAllErrors();
}

// ==========================
// ERROR UI
// ==========================
function setError(id, message){
    const input = document.getElementById(id);
    const err = document.getElementById("err-" + id);

    if(err){
        err.innerText = message;
    }
    input.classList.add("input-error");
}

function clearError(id){
    const input = document.getElementById(id);
    const err = document.getElementById("err-" + id);

    if(err){
        err.innerText = "";
    }
    input.classList.remove("input-error");
}

function clearAllErrors(){
    ["code","discount","min","max","quantity","start","end"]
        .forEach(clearError);
}

// ==========================
// CREATE + UPDATE
// ==========================
async function saveVoucher(){

    clearAllErrors();

    const code = document.getElementById("code").value.trim();
    const discount = Number(document.getElementById("discount").value);
    const percent = document.getElementById("percent").checked;
    const min = Number(document.getElementById("min").value);
    const max = Number(document.getElementById("max").value);
    const quantity = Number(document.getElementById("quantity").value);
    const start = document.getElementById("start").value;
    const end = document.getElementById("end").value;

    let isValid = true;

    // ===== VALIDATE =====
    if(!code){
        setError("code", "Không được để trống");
        isValid = false;
    }

    if(isNaN(discount) || discount <= 0){
        setError("discount", "Giảm phải > 0");
        isValid = false;
    }

    if(percent && discount > 100){
        setError("discount", "Không vượt quá 100%");
        isValid = false;
    }

    if(isNaN(min) || min < 0){
        setError("min", "Không hợp lệ");
        isValid = false;
    }

    if(percent && (!max || max <= 0)){
        setError("max", "Nhập giảm tối đa");
        isValid = false;
    }

    if(isNaN(quantity) || quantity <= 0){
        setError("quantity", "Phải > 0");
        isValid = false;
    }

    if(!start){
        setError("start", "Chọn ngày bắt đầu");
        isValid = false;
    }

    if(!end){
        setError("end", "Chọn ngày kết thúc");
        isValid = false;
    }

    if(start && end){
        if(new Date(start) >= new Date(end)){
            setError("end", "Phải sau ngày bắt đầu");
            isValid = false;
        }
    }

    if(!isValid) return;

    // ===== DATA =====
    const data = {
        code,
        discount,
        percent,
        minOrderValue: min,
        maxDiscount: percent ? max : 0,
        quantity,
        startDate: start,
        endDate: end,
        active: true
    };

    try {

        let url = API;
        let method = "POST";

        if(editingId){
            url = API + "/" + editingId;
            method = "PUT";
        }

        const res = await fetch(url, {
            method,
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
let currentPage = 0;
const size = 10;
async function loadAdminVouchers(page = 0) {

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
            return alert("Không load được!");
        }

        const data = await res.json();

        console.log("DATA:", data);

        const vouchers = data.content || [];

        const table = document.getElementById("voucherTable");
        table.innerHTML = "";

        if(vouchers.length === 0){
            table.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center">Không có voucher</td>
                </tr>
            `;
        }

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

        // 🔥 thêm dòng này
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
            onclick="loadAdminVouchers(${data.number - 1})">
            ←
        </button>
    `;

    // Pages
    for(let i = 0; i < data.totalPages; i++){
        container.innerHTML += `
            <button 
                onclick="loadAdminVouchers(${i})"
                class="${i === data.number ? 'active-page' : ''}">
                ${i + 1}
            </button>
        `;
    }

    // Next
    container.innerHTML += `
        <button ${data.last ? 'disabled' : ''} 
            onclick="loadAdminVouchers(${data.number + 1})">
            →
        </button>
    `;
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
const API_BASE = "http://localhost:8081/api/voucher";

// ==========================
// APPLY VOUCHER
// ==========================
async function applyVoucher() {

    const code = document.getElementById("voucherCode").value;
    const total = 20000000;

    const token = sessionStorage.getItem("token");

    try {

        const res = await fetch(`${API_BASE}/apply?code=${code}&total=${total}`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) {

            if (res.status === 401) {
                alert("Vui lòng đăng nhập");
                window.location.href = "login.html";
                return;
            }

            if (res.status === 403) {
                alert("Bạn không có quyền dùng voucher");
                return;
            }

            const text = await res.text();
            throw new Error(text);
        }

        const data = await res.json();

        document.getElementById("discountResult").innerHTML = `
            <p style="color:green;">
                Giảm: ${data.discount.toLocaleString()} đ
            </p>
        `;

    } catch (err) {
        console.error("Apply error:", err);
        alert("Mã không hợp lệ");
    }
}


// ==========================
// CLAIM VOUCHER
// ==========================
async function claimVoucher(id) {

    const token = sessionStorage.getItem("token");

    try {

        const res = await fetch(`${API_BASE}/claim/${id}`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) {

            if (res.status === 401) {
                alert("Vui lòng đăng nhập");
                return;
            }

            if (res.status === 403) {
                alert("Bạn không có quyền nhận voucher");
                return;
            }

            const text = await res.text();
            throw new Error(text);
        }

        alert("Nhận mã thành công");

    } catch (err) {
        console.error("Claim error:", err);
    }
}


// ==========================
// LOAD VOUCHER
// ==========================
async function loadVoucher() {

    const token = sessionStorage.getItem("token");
    console.log("TOKEN:", token);

    try {

        const res = await fetch(API_BASE, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        // 🚨 FIX 403 + JSON CRASH
        if (!res.ok) {

            if (res.status === 401) {
                alert("Chưa đăng nhập");
                window.location.href = "login.html";
                return;
            }

            if (res.status === 403) {
                alert("❌ Backend đang chặn USER (cần sửa SecurityConfig)");
                return;
            }

            const text = await res.text();
            throw new Error(text);
        }

        const vouchers = await res.json();

        const list = document.getElementById("voucherList");
        list.innerHTML = "";

        if (!vouchers || vouchers.length === 0) {
            list.innerHTML = `<p>Không có voucher</p>`;
            return;
        }

        vouchers.forEach(v => {

            const text = v.type === "PERCENT"
                ? `Giảm ${v.value}%`
                : `Giảm ${v.value.toLocaleString()}đ`;

            list.innerHTML += `
                <div class="voucher-card">
                    <div class="voucher-info">
                        <div class="voucher-code" onclick="selectVoucher('${v.code}')">
                            ${v.code}
                        </div>
                        <div>${text}</div>
                    </div>
                    <button class="claim-btn" onclick="claimVoucher(${v.id})">
                        Nhận
                    </button>
                </div>
            `;
        });

    } catch (err) {
        console.error("Load error:", err);
        alert("Không load được voucher");
    }
}


// ==========================
// CLICK AUTO FILL
// ==========================
function selectVoucher(code) {
    document.getElementById("voucherCode").value = code;
}


// ==========================
document.addEventListener("DOMContentLoaded", loadVoucher);

list.innerHTML += `
    <div class="voucher-card">
        <div class="voucher-info">
            <div class="voucher-code" onclick="selectVoucher('${v.code}')">
                ${v.code}
            </div>
            <div>${text}</div>
        </div>
        <button class="claim-btn" onclick="claimVoucher(${v.id})">
            Nhận
        </button>
    </div>
`;
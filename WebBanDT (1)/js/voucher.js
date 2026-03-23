const API_BASE = "http://localhost:8081/api/voucher";

// ==========================
// LOCAL STORAGE (SAVE CLAIM)
// ==========================
function getClaimedList() {
    return JSON.parse(localStorage.getItem("claimedVoucher")) || [];
}

function saveClaimed(id) {
    let claimed = getClaimedList();

    if (!claimed.includes(id)) {
        claimed.push(id);
        localStorage.setItem("claimedVoucher", JSON.stringify(claimed));
    }
}

function isClaimed(id) {
    return getClaimedList().includes(id);
}


// ==========================
// CLAIM VOUCHER
// ==========================
async function claimVoucher(id, btn) {

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

            throw new Error("Claim failed");
        }

        // ✅ LƯU TRẠNG THÁI
        saveClaimed(id);

        // ✅ UPDATE UI
        btn.innerText = "Đã nhận";
        btn.disabled = true;
        btn.style.background = "#555";
        btn.style.cursor = "not-allowed";

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

        if (!res.ok) {

            if (res.status === 401) {
                alert("Chưa đăng nhập");
                window.location.href = "login.html";
                return;
            }

            if (res.status === 403) {
                alert("Backend đang chặn USER");
                return;
            }

            throw new Error("API lỗi");
        }

        const vouchers = await res.json();

        const list = document.getElementById("voucherList");
        list.innerHTML = "";

        if (!vouchers || vouchers.length === 0) {
            list.innerHTML = `<p>Không có voucher</p>`;
            return;
        }

        vouchers.forEach(v => {

            const value = v.value || v.discount || 0;

            const text = v.percent
                ? `Giảm ${value}%`
                : `Giảm ${value.toLocaleString()}đ`;

            const claimed = isClaimed(v.id);

            list.innerHTML += `
                <div class="voucher-card">

                    <div class="voucher-info">

                        <div class="voucher-icon">
                            <i class="fa-solid fa-ticket"></i>
                        </div>

                        <div>
                            <div class="voucher-code">${v.code}</div>
                            <div>${text}</div>
                        </div>

                    </div>

                    ${claimed
                    ? `<button class="claim-btn" disabled style="background:#555; cursor:not-allowed;">
                                Đã nhận
                           </button>`
                    : `<button class="claim-btn" onclick="claimVoucher(${v.id}, this)">
                                Nhận
                           </button>`
                }

                </div>
            `;
        });

    } catch (err) {
        console.error("Load error:", err);
        alert("Không load được voucher");
    }
}


// ==========================
document.addEventListener("DOMContentLoaded", loadVoucher);
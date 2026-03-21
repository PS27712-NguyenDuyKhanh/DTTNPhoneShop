const API = "http://localhost:8081/api/admin/products/";

async function loadProduct() {

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    // ✅ FIX AUTH (đồng bộ với trang list)
    const token = sessionStorage.getItem("token");

    if (!token) {
        alert("Vui lòng đăng nhập");
        window.location.href = "../login.html";
        return;
    }

    try {

        const res = await fetch(API + id, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) {
            console.log("API lỗi", res.status);
            return;
        }

        const p = await res.json();

        /* =========================
           THÔNG TIN CHUNG
        ========================== */

        document.getElementById("productName").innerText = p.name || "";
        document.getElementById("productSku").innerText = p.sku || "";
        document.getElementById("productDesc").innerHTML = p.description || "";

        /* =========================
           SPEC
        ========================== */

        const spec = p.specification;
        const specList = document.getElementById("specList");

        if (spec) {
            specList.innerHTML = `
<li>CPU: ${spec.cpu || ""}</li>
<li>RAM: ${spec.ram || ""}</li>
<li>ROM: ${spec.rom || ""}</li>
<li>GPU: ${spec.gpu || ""}</li>
<li>Camera: ${spec.camera || ""}</li>
<li>Battery: ${spec.battery || ""}</li>
<li>Screen: ${spec.screen || ""}</li>
`;
        } else {
            specList.innerHTML = "<li>Không có thông tin cấu hình</li>";
        }

        /* =========================
           VARIANTS
        ========================== */

        const table = document.getElementById("variantTable");
        table.innerHTML = "";

        p.variants?.forEach(v => {

            const img = v.images?.[0]?.imageUrl || "";

            // ✅ FIX IMAGE FULL LOGIC
            let imgUrl = "";

            if (img.startsWith("http")) {
                imgUrl = img;
            } else if (img.startsWith("/")) {
                imgUrl = "http://localhost:8081" + img;
            } else if (img) {
                imgUrl = "http://localhost:8081/uploads/" + img;
            } else {
                imgUrl = "https://via.placeholder.com/60?text=No+Image";
            }

            const sale = v.salePrice ? `
<div class="sale-price">
    Giảm còn: ${formatPrice(v.salePrice)}
</div>
<div class="sale-time">
    ${v.saleStart?.slice(0, 10)} → ${v.saleEnd?.slice(0, 10)}
</div>
` : `<div class="no-sale">Không giảm</div>`;

            table.innerHTML += `
<tr>
<td>${v.color || ""}</td>

<td class="price">
    <div class="old-price">
        Giá gốc: ${formatPrice(v.price)}
    </div>
    ${sale}
</td>

<td>${v.stock || 0}</td>

<td>
    <img src="${imgUrl}" class="variant-img">
</td>
</tr>
`;
        });

    } catch (err) {
        console.error("Lỗi:", err);
    }
}

/* =========================
   FORMAT GIÁ TIỀN
========================= */
function formatPrice(price) {
    if (!price) return "0₫";
    return price.toLocaleString("vi-VN") + "₫";
}

loadProduct();

/* =========================
   TOGGLE MÔ TẢ
========================= */

const btn = document.getElementById("toggleDesc");
const wrapper = document.querySelector(".desc-wrapper");

btn.addEventListener("click", () => {

    wrapper.classList.toggle("open");

    if (wrapper.classList.contains("open")) {
        btn.innerText = "Thu gọn";
    } else {
        btn.innerText = "Xem thêm";
    }

});
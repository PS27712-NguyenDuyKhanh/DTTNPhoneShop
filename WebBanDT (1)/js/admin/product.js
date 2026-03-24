const API = "http://localhost:8081/api/admin/products";

let currentPage = 0;
const size = 10;

/* ================= LOAD PRODUCTS ================= */
async function loadProducts(page = 0) {

    currentPage = page;

    const token = sessionStorage.getItem("token");

    try {

        const res = await fetch(`${API}?page=${page}&size=${size}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) {
            console.error("API lỗi:", res.status);
            return;
        }

        const data = await res.json();

        console.log("DATA:", data);

        const table = document.getElementById("productTable");
        table.innerHTML = "";

        const products = data.content || [];

        if(products.length === 0){
            table.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;padding:20px">
                        Không có sản phẩm
                    </td>
                </tr>
            `;
        }

        products.forEach(p => {

            const img = p.variants?.[0]?.images?.[0]?.imageUrl || "";
            const stock = p.variants?.reduce((t, v) => t + (v.stock || 0), 0);
            const status = stock > 0 ? "Đang bán" : "Hết hàng";

            table.innerHTML += `
<tr onclick="viewProduct(${p.id})" style="cursor:pointer">

    <td>${p.id}</td>

    <td>
        <img src="http://localhost:8081${img}" width="50">
    </td>

    <td>${p.sku || ""}</td>

    <td>${p.name}</td>

    <td>${stock}</td>

    <td>${status}</td>

    <td onclick="event.stopPropagation()">
        <button onclick="editProduct(${p.id})">Sửa</button>
        <button onclick="deleteProduct(${p.id})">Xóa</button>
    </td>

</tr>
`;
        });

        // 🔥 RENDER PAGINATION
        renderPagination(data);

    } catch (err) {
        console.error("Lỗi load sản phẩm:", err);
    }
}

/* ================= PAGINATION ================= */
function renderPagination(data){

    const container = document.getElementById("pagination");
    container.innerHTML = "";

    if (!data.totalPages) return;

    // Prev
    container.innerHTML += `
        <button ${data.first ? 'disabled' : ''} 
            onclick="loadProducts(${data.number - 1})">
            ←
        </button>
    `;

    // Pages
    for(let i = 0; i < data.totalPages; i++){
        container.innerHTML += `
            <button 
                onclick="loadProducts(${i})"
                class="${i === data.number ? 'active-page' : ''}">
                ${i + 1}
            </button>
        `;
    }

    // Next
    container.innerHTML += `
        <button ${data.last ? 'disabled' : ''} 
            onclick="loadProducts(${data.number + 1})">
            →
        </button>
    `;
}

/* ================= ACTION ================= */
function goCreateProduct() {
    window.location.href = "create-product.html";
}

function viewProduct(id) {
    window.location.href = "product-detail-admin.html?id=" + id;
}

function editProduct(id){
    window.location.href = "edit-product.html?id=" + id;
}

async function deleteProduct(id) {

    const token = sessionStorage.getItem("token");

    if (!confirm("Xóa sản phẩm này?")) return;

    await fetch(API + "/" + id, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    loadProducts(currentPage); // 🔥 giữ trang
}

/* ================= INIT ================= */
loadProducts(0);
const API = "http://localhost:8081/api/admin/products";
const API_VARIANT = "http://localhost:8081/api/admin/variants";
const API_CATEGORY = "http://localhost:8081/api/categories";

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "../login.html";
}

const headers = {
    "Authorization": "Bearer " + token,
    "Content-Type": "application/json"
};

// =============================
// LOAD PRODUCTS
// =============================

async function loadProducts() {

    const res = await fetch(API, { headers });
    const products = await res.json();

    const table = document.getElementById("productTable");
    table.innerHTML = "";

    products.forEach(p => {

        // lấy ảnh từ variant đầu tiên
        const image = p.variants?.[0]?.images?.[0]?.imageUrl
            ? "http://localhost:8081/" + p.variants[0].images[0].imageUrl
            : "";

        const stock = p.variants?.reduce((s,v)=>s+v.stock,0) || 0;

        table.innerHTML += `
        <tr>

            <td>${p.id}</td>

            <td>
                <img src="${image}" width="50">
            </td>

            <td>${p.name}</td>

            <td>${p.variants?.[0]?.price?.toLocaleString() || 0}đ</td>

            <td>${stock}</td>

            <td class="${stock > 0 ? "status-active" : "locked"}">
                ${stock > 0 ? "Đang bán" : "Hết hàng"}
            </td>

            <td>

                <button class="delete" onclick="deleteProduct(${p.id})">
                    <i class="fa fa-trash"></i>
                </button>

                <button class="color" onclick="openVariant(${p.id})">
                    🎨
                </button>

            </td>

        </tr>
        `;
    });
}

// =============================
// DELETE PRODUCT
// =============================

async function deleteProduct(id) {

    if (!confirm("Xóa sản phẩm này?")) return;

    await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers
    });

    loadProducts();
}

// =============================
// LOAD CATEGORY
// =============================

async function loadCategories() {

    const res = await fetch(API_CATEGORY);
    const categories = await res.json();

    const select = document.getElementById("categoryId");

    select.innerHTML = `<option value="">Chọn danh mục</option>`;

    categories.forEach(c => {

        const name = c.parent
            ? `${c.parent.name} → ${c.name}`
            : c.name;

        select.innerHTML += `
        <option value="${c.id}">
            ${name}
        </option>
        `;
    });
}

// =============================
// CREATE PRODUCT
// =============================

async function createProduct() {

    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const categoryId = document.getElementById("categoryId").value;

    const color = document.getElementById("color").value;
    const storage = document.getElementById("storage").value;
    const price = document.getElementById("price").value;
    const stock = document.getElementById("stock").value;

    const file = document.getElementById("imageFile").files[0];

    // 1️⃣ tạo product
    const resProduct = await fetch(API, {
        method: "POST",
        headers,
        body: JSON.stringify({
            name,
            description,
            categoryId
        })
    });

    const product = await resProduct.json();


    // 2️⃣ tạo variant
    const resVariant = await fetch(`${API}/${product.id}/variants`,{
        method:"POST",
        headers,
        body: JSON.stringify({
            color,
            storage,
            price,
            stock
        })
    });

    const variant = await resVariant.json();


    // 3️⃣ upload image
    if(file){

        const formData = new FormData();
        formData.append("file", file);

        await fetch(`${API_VARIANT}/${variant.id}/images`,{
            method:"POST",
            headers:{
                "Authorization": "Bearer " + token
            },
            body: formData
        });
    }

    alert("Tạo sản phẩm thành công");

    clearForm();
    loadProducts();
}

// =============================
// ADD VARIANT (popup)
// =============================

async function addVariant(){

    const color = document.getElementById("variantColor").value;
    const storage = document.getElementById("variantStorage").value;
    const price = document.getElementById("variantPrice").value;
    const stock = document.getElementById("variantStock").value;

    const file = document.getElementById("variantImage").files[0];

    // tạo variant
    const res = await fetch(`${API}/${currentProductId}/variants`,{
        method:"POST",
        headers,
        body: JSON.stringify({
            color,
            storage,
            price,
            stock
        })
    });

    const variant = await res.json();

    // upload image
    if(file){

        const formData = new FormData();
        formData.append("file", file);

        await fetch(`${API_VARIANT}/${variant.id}/images`,{
            method:"POST",
            headers:{
                "Authorization": "Bearer " + token
            },
            body: formData
        });
    }

    alert("Đã thêm biến thể");

    closeVariant();
}

// =============================
// FORM
// =============================

function clearForm(){

    document.getElementById("name").value="";
    document.getElementById("description").value="";
    document.getElementById("categoryId").value="";

    document.getElementById("color").value="";
    document.getElementById("storage").value="";
    document.getElementById("price").value="";
    document.getElementById("stock").value="";
    document.getElementById("imageFile").value="";
}

// =============================
// POPUP
// =============================

let currentProductId = null;

function openVariant(productId){

    currentProductId = productId;
    document.getElementById("variantModal").style.display = "flex";
}

function closeVariant(){

    document.getElementById("variantModal").style.display = "none";
}

// =============================
// LOAD PAGE
// =============================

loadProducts();
loadCategories();
const API = "http://localhost:8081/api/admin/products";
const CATEGORY_API = "http://localhost:8081/api/categories";

let variantIndex = 0;
let editor;

/* ================= TOKEN ================= */
function getToken(){
    return sessionStorage.getItem("token");
}

/* ================= IMAGE URL ================= */
function buildImageUrl(path){

    if(!path) return "";

    if(path.startsWith("http")) return path;

    if(path.startsWith("/")) return "http://localhost:8081" + path;

    return "http://localhost:8081/uploads/" + path;
}

/* ================= LOAD CATEGORY ================= */

async function loadCategories() {

    const res = await fetch(CATEGORY_API);
    const data = await res.json();

    const select = document.getElementById("categoryId");

    select.innerHTML = `<option value="">-- Chọn danh mục --</option>`;

    data.forEach(c => {
        if (c.parent) {
            select.innerHTML += `
<option value="${c.id}">
${c.parent.name} > ${c.name}
</option>`;
        }
    });
}

loadCategories();

/* ================= CKEDITOR ================= */

ClassicEditor
.create(document.querySelector("#description"))
.then(e => {
    editor = e;
})
.catch(console.error);

/* ================= UPLOAD IMAGE ================= */

async function uploadImage(file) {

    const token = getToken();

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:8081/api/file/upload", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token
        },
        body: formData
    });

    const path = await res.text();

    // ✅ CHỈ TRẢ VỀ PATH
    return path;
}uildImageUrl(path);

/* ================= ADD VARIANT ================= */

function addVariant() {

    const container = document.getElementById("variantContainer");

    variantIndex++;

    const html = `
<div class="variant-card">

<div class="variant-header" onclick="toggleVariant(${variantIndex})">
Biến thể ${variantIndex}
</div>

<div class="variant-body" id="variantBody${variantIndex}">

<input placeholder="Màu sắc" id="color${variantIndex}">
<input placeholder="Giá bán" id="price${variantIndex}">
<input placeholder="Giá khuyến mãi" id="salePrice${variantIndex}">
<input type="datetime-local" id="saleStart${variantIndex}">
<input type="datetime-local" id="saleEnd${variantIndex}">
<input placeholder="Tồn kho" id="stock${variantIndex}">
<input type="file" id="image${variantIndex}">

<!-- preview ảnh -->
<img id="preview${variantIndex}" width="60" style="margin-top:5px;display:none">

</div>

</div>
`;

    container.insertAdjacentHTML("beforeend", html);

    // preview ảnh khi chọn
    document.getElementById("image"+variantIndex).addEventListener("change", e=>{
        const file = e.target.files[0];
        if(file){
            const preview = document.getElementById("preview"+variantIndex);
            preview.src = URL.createObjectURL(file);
            preview.style.display = "block";
        }
    });
}

/* ================= TOGGLE ================= */

function toggleVariant(index){
    const body = document.getElementById("variantBody"+index);
    body.style.display = body.style.display === "none" ? "block" : "none";
}

/* ================= GET VARIANTS ================= */

async function getVariants() {

    let variants = [];

    for (let i = 1; i <= variantIndex; i++) {

        const color = document.getElementById("color" + i)?.value;
        if (!color) continue;

        const file = document.getElementById("image" + i)?.files[0];

        let imageUrl = "";

        if (file) {
            imageUrl = await uploadImage(file); // ✅ đã convert URL
        }

        variants.push({

            color: color,

            price: Number(document.getElementById("price"+i).value) || 0,

            salePrice: Number(document.getElementById("salePrice"+i).value) || null,

            saleStart: document.getElementById("saleStart"+i).value || null,

            saleEnd: document.getElementById("saleEnd"+i).value || null,

            stock: Number(document.getElementById("stock"+i).value) || 0,

            images: [
                { imageUrl: imageUrl }
            ]

        });
    }

    return variants;
}

/* ================= CREATE PRODUCT ================= */

async function createProduct() {

    const token = getToken();

    if (!token) {
        alert("Chưa đăng nhập");
        window.location.href = "../login.html";
        return;
    }

    const name = document.getElementById("name").value;
    const sku = document.getElementById("sku").value;

    if (!name || !sku) {
        alert("Nhập đầy đủ tên và SKU");
        return;
    }

    const variants = await getVariants();

    if (variants.length === 0) {
        alert("Phải có ít nhất 1 biến thể");
        return;
    }

    const data = {

        name,
        sku,
        os: document.getElementById("os").value,

        description: editor.getData(),

        categoryId: Number(document.getElementById("categoryId").value) || null,

        specification: {
            cpu: document.getElementById("cpu").value,
            ram: document.getElementById("ram").value,
            rom: document.getElementById("rom").value,
            gpu: document.getElementById("gpu").value,
            camera: document.getElementById("camera").value,
            battery: document.getElementById("battery").value,
            screen: document.getElementById("screen").value
        },

        variants
    };

    await fetch(API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify(data)
    });

    alert("Thêm sản phẩm thành công");
    window.location.href = "product.html";
}
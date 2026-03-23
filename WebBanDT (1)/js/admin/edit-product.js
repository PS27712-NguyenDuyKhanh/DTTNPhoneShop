const API = "http://localhost:8081/api/admin/products/";
const CATEGORY_API = "http://localhost:8081/api/categories";

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

let variantIndex = 0;
let editor;

/* ================= TOKEN DÙNG CHUNG ================= */
function getToken() {
    return sessionStorage.getItem("token"); // ✅ thống nhất
}

/* ================= CKEDITOR ================= */

ClassicEditor
.create(document.querySelector("#description"))
.then(e => {

    editor = e;

    loadCategories();
    loadProduct();

})
.catch(error => console.error(error));

/* ================= LOAD CATEGORY ================= */

async function loadCategories(){

    const res = await fetch(CATEGORY_API);
    const data = await res.json();

    const select = document.getElementById("categoryId");

    select.innerHTML = `<option value="">-- Chọn danh mục --</option>`;

    data.forEach(c=>{
        select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
    });

}

/* ================= UPLOAD IMAGE ================= */

async function uploadImage(file){

    const token = getToken();

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:8081/api/file/upload",{
        method:"POST",
        headers:{
            Authorization:"Bearer " + token
        },
        body:formData
    });

    const path = await res.text();

    // ✅ FIX IMAGE URL CHUẨN
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return "http://localhost:8081" + path;

    return "http://localhost:8081/uploads/" + path;
}

/* ================= ADD VARIANT ================= */

function addVariant(data = null){

    const container = document.getElementById("variantContainer");

    variantIndex++;

    const html = `
    <div class="variant-card">

        <div class="variant-header" onclick="toggleVariant(${variantIndex})">
            Biến thể ${variantIndex}
        </div>

        <div class="variant-body"
            id="variantBody${variantIndex}"
            data-id="${data?.id || ""}"
            data-image="${data?.images?.[0]?.imageUrl || ""}">

            <input placeholder="Màu sắc"
                   id="color${variantIndex}"
                   value="${data?.color || ""}">

            <input placeholder="Giá bán"
                   id="price${variantIndex}"
                   value="${data?.price || ""}">

            <input placeholder="Giá khuyến mãi"
                   id="salePrice${variantIndex}"
                   value="${data?.salePrice || ""}">

            <input type="datetime-local"
                   id="saleStart${variantIndex}"
                   value="${formatDate(data?.saleStart)}">

            <input type="datetime-local"
                   id="saleEnd${variantIndex}"
                   value="${formatDate(data?.saleEnd)}">

            <input placeholder="Tồn kho"
                   id="stock${variantIndex}"
                   value="${data?.stock || ""}">

            <input type="file" id="image${variantIndex}">

        </div>

    </div>
    `;

    container.insertAdjacentHTML("beforeend", html);

}

/* ================= FORMAT DATE ================= */

function formatDate(date){
    if(!date) return "";
    return date.substring(0,16);
}

/* ================= TOGGLE ================= */

function toggleVariant(index){

    const body = document.getElementById("variantBody"+index);

    body.style.display =
        body.style.display === "none"
        ? "block"
        : "none";

}

/* ================= GET VARIANTS ================= */

async function getVariants(){

    let variants = [];

    for(let i=1;i<=variantIndex;i++){

        const body = document.getElementById("variantBody"+i);
        if(!body) continue;

        const color = document.getElementById("color"+i)?.value;
        if(!color) continue;

        const variantId = body.getAttribute("data-id");
        const oldImage = body.getAttribute("data-image");

        const file = document.getElementById("image"+i)?.files[0];

        let imageUrl = oldImage;

        if(file){
            imageUrl = await uploadImage(file);
        }

        variants.push({

            id: variantId ? Number(variantId) : null,

            color: color,

            price: Number(document.getElementById("price"+i).value) || 0,

            salePrice: Number(document.getElementById("salePrice"+i).value) || null,

            saleStart: document.getElementById("saleStart"+i).value || null,

            saleEnd: document.getElementById("saleEnd"+i).value || null,

            stock: Number(document.getElementById("stock"+i).value) || 0,

            images:[
                { imageUrl:imageUrl }
            ]

        });

    }

    return variants;
}

/* ================= LOAD PRODUCT ================= */

async function loadProduct(){

    const token = getToken();

    if (!token) {
        alert("Chưa đăng nhập");
        window.location.href = "../login.html";
        return;
    }

    const res = await fetch(API + productId,{
        headers:{
            Authorization:"Bearer "+token
        }
    });

    const p = await res.json();

    document.getElementById("name").value = p.name || "";
    document.getElementById("sku").value = p.sku || "";
    document.getElementById("os").value = p.os || "";

    editor.setData(p.description || "");

    document.getElementById("categoryId").value = p.categoryId || "";

    /* SPEC */
    if(p.specification){

        const s = p.specification;

        document.getElementById("cpu").value = s.cpu || "";
        document.getElementById("ram").value = s.ram || "";
        document.getElementById("rom").value = s.rom || "";
        document.getElementById("gpu").value = s.gpu || "";
        document.getElementById("camera").value = s.camera || "";
        document.getElementById("battery").value = s.battery || "";
        document.getElementById("screen").value = s.screen || "";
    }

    /* RESET VARIANT */
    variantIndex = 0;
    document.getElementById("variantContainer").innerHTML = "";

    (p.variants || []).forEach(v=>{
        addVariant(v);
    });

}

/* ================= UPDATE PRODUCT ================= */

async function updateProduct(){

    const token = getToken();

    const variants = await getVariants();

    const data = {

        name:document.getElementById("name").value,
        sku:document.getElementById("sku").value,
        os:document.getElementById("os").value,

        description:editor.getData(),

        categoryId:Number(document.getElementById("categoryId").value) || null,

        specification:{
            cpu:document.getElementById("cpu").value,
            ram:document.getElementById("ram").value,
            rom:document.getElementById("rom").value,
            gpu:document.getElementById("gpu").value,
            camera:document.getElementById("camera").value,
            battery:document.getElementById("battery").value,
            screen:document.getElementById("screen").value
        },

        variants:variants
    };

    await fetch(API + productId,{
        method:"PUT",
        headers:{
            "Content-Type":"application/json",
            Authorization:"Bearer "+token
        },
        body:JSON.stringify(data)
    });

    alert("Cập nhật sản phẩm thành công");
    window.location.href = "product.html";
}

/* ===================================================== */
/* 🔥 VALIDATE ADD-ON (KHÔNG ĐỤNG CODE CŨ) */
/* ===================================================== */

function setError(id, msg){
    const el = document.getElementById(id);
    if(el) el.innerText = msg;
}

function clearError(){
    document.querySelectorAll(".error").forEach(e => e.innerText = "");
}

// clear khi nhập
document.addEventListener("input", e => {
    if(e.target.tagName === "INPUT" || e.target.tagName === "SELECT"){
        const error = e.target.parentElement.querySelector(".error");
        if(error) error.innerText = "";
    }
});

// override updateProduct
const oldUpdateProduct = updateProduct;

updateProduct = async function(){

    clearError();

    let isValid = true;

    const name = document.getElementById("name").value.trim();
    const sku = document.getElementById("sku").value.trim();
    const category = document.getElementById("categoryId").value;

    // ==========================
    // NAME
    // ==========================
    if(!name){
        setError("errorName", "Bạn chưa nhập tên sản phẩm");
        isValid = false;
    }

    // ==========================
    // SKU
    // ==========================
    if(!sku){
        setError("errorSku", "Bạn chưa nhập SKU");
        isValid = false;
    }

    // ==========================
    // CATEGORY
    // ==========================
    if(!category){
        setError("errorCategory", "Bạn chưa chọn danh mục");
        isValid = false;
    }

    // ==========================
    // VARIANT
    // ==========================
    let hasValidVariant = false;

    for(let i = 1; i <= variantIndex; i++){

        const price = Number(document.getElementById("price"+i)?.value || 0);
        const salePrice = Number(document.getElementById("salePrice"+i)?.value || 0);

        if(price <= 0){
            alert(`Biến thể ${i}: Giá phải > 0`);
            isValid = false;
            break;
        }

        if(price < 0){
            alert(`Biến thể ${i}: Giá không được âm`);
            isValid = false;
            break;
        }

        if(salePrice && salePrice >= price){
            alert(`Biến thể ${i}: Giá khuyến mãi phải nhỏ hơn giá bán`);
            isValid = false;
            break;
        }

        if(price > 0){
            hasValidVariant = true;
        }
    }

    if(!hasValidVariant){
        alert("Phải có ít nhất 1 biến thể hợp lệ");
        isValid = false;
    }

    if(!isValid) return;

    // gọi lại hàm gốc
    await oldUpdateProduct();
};
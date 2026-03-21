const API = "http://localhost:8081/api/products/category/";

let page = 0;
const size = 8;

const params = new URLSearchParams(window.location.search);
const categoryId = params.get("category");

// ==========================
// CHECK SALE
// ==========================
function isSaleActive(start, end){
    if(!start || !end) return false;
    const now = new Date();
    return now >= new Date(start) && now <= new Date(end);
}

// ==========================
// LOAD
// ==========================
async function loadProducts(){

    const res = await fetch(`${API}${categoryId}?page=${page}&size=${size}`);
    const data = await res.json();

    renderProducts(data.content);
    renderPagination(data.totalPages);
}

// ==========================
// RENDER PRODUCTS
// ==========================
function renderProducts(products){

    const list = document.getElementById("productList");
    list.innerHTML = "";

    products.forEach(p => {

        const variants = p.variants || [];
        if(variants.length === 0) return;

        const img = variants[0]?.images?.[0]?.imageUrl || "";

        let minPrice = Infinity;
        let minSalePrice = Infinity;
        let hasSale = false;

        variants.forEach(v => {

            if(v.price < minPrice) minPrice = v.price;

            if(
                v.salePrice &&
                v.salePrice < v.price &&
                isSaleActive(v.saleStart, v.saleEnd)
            ){
                hasSale = true;
                if(v.salePrice < minSalePrice){
                    minSalePrice = v.salePrice;
                }
            }

        });

        // ==========================
        // HTML GIÁ + BADGE
        // ==========================
        let priceHTML = "";
        let badgeHTML = "";

        if(hasSale){

            const discount = Math.round(100 - (minSalePrice / minPrice) * 100);

            // 👉 BADGE TRÊN ẢNH
            badgeHTML = `<span class="product-badge">-${discount}%</span>`;

            // 👉 KHÔNG còn % bên dưới
            priceHTML = `
                <div class="price-box">
                    <span class="price-new">${minSalePrice.toLocaleString()} đ</span>
                    <span class="price-old">${minPrice.toLocaleString()} đ</span>
                </div>
            `;

        }else{

            priceHTML = `
                <div class="price-box">
                    <span class="price-new">${minPrice.toLocaleString()} đ</span>
                </div>
            `;
        }

        const stock = variants.reduce((sum,v)=>sum+(v.stock||0),0);

        list.innerHTML += `
        <div class="product-card">

            ${badgeHTML}

            <img src="http://localhost:8081${img}">

            <h3>${p.name}</h3>

            ${priceHTML}

            <p class="stock">Còn ${stock} sản phẩm</p>

            <a href="product-detail.html?id=${p.id}">
                Xem chi tiết
            </a>

        </div>
        `;
    });
}

// ==========================
// PAGINATION
// ==========================
function renderPagination(totalPages){

    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    for(let i=0;i<totalPages;i++){
        pagination.innerHTML += `
        <button onclick="changePage(${i})">${i+1}</button>
        `;
    }
}

function changePage(p){
    page = p;
    loadProducts();
}

// ==========================
// INIT
// ==========================
loadProducts();
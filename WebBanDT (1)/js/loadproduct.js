const API_PRODUCT = "http://localhost:8081/api/products";

// ==========================
// CHECK SALE
// ==========================
function isSaleActive(start, end) {
    if (!start || !end) return false;
    const now = new Date();
    return now >= new Date(start) && now <= new Date(end);
}

// ==========================
// FORMAT PRICE
// ==========================
function formatPrice(price) {
    return price.toLocaleString("vi-VN") + " đ";
}

// ==========================
// RENDER PRODUCT (CHUNG)
// ==========================
function renderProductList(products){

    const list = document.getElementById("productList");

    if (!list) return;

    list.innerHTML = "";

    // lọc sản phẩm có variant
    const validProducts = products.filter(p => p.variants && p.variants.length > 0);

    if(validProducts.length === 0){
        list.innerHTML = `<p>Không tìm thấy sản phẩm</p>`;
        return;
    }

    validProducts.forEach(p => {

        const variants = p.variants;

        // ảnh
        const img = variants[0]?.images?.[0]?.imageUrl || "";

        // ===== TÍNH GIÁ =====
        let minPrice = Infinity;
        let minSalePrice = Infinity;
        let hasSale = false;

        variants.forEach(v => {

            if (v.price < minPrice) minPrice = v.price;

            if (
                v.salePrice &&
                v.salePrice < v.price &&
                isSaleActive(v.saleStart, v.saleEnd)
            ) {
                hasSale = true;
                if (v.salePrice < minSalePrice) {
                    minSalePrice = v.salePrice;
                }
            }
        });

        // ===== HTML GIÁ =====
        let priceHTML = "";
        let badgeHTML = "";

        if (hasSale) {
            const discount = Math.round(100 - (minSalePrice / minPrice) * 100);

            priceHTML = `
                <div class="price-box">
                    <span class="price-new">${formatPrice(minSalePrice)}</span>
                    <span class="price-old">${formatPrice(minPrice)}</span>
                    <span class="discount">-${discount}%</span>
                </div>
            `;

            badgeHTML = `<span class="sale-badge">-${discount}%</span>`;
        } else {
            priceHTML = `
                <div class="price-box">
                    <span class="price-new">${formatPrice(minPrice)}</span>
                </div>
            `;
        }

        // ===== STOCK =====
        const stock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

        // ===== RENDER =====
        list.innerHTML += `
        <div class="product-card">

            ${badgeHTML}

            <img src="http://localhost:8081${img || '/img/default.jpg'}" class="product-img">

            <h3>${p.name}</h3>

            ${priceHTML}

            <p class="stock">Còn ${stock} sản phẩm</p>

            <a href="product-detail.html?id=${p.id}" class="btn-main">
                Xem chi tiết
            </a>

        </div>
        `;
    });
}


// ==========================
// LOAD PRODUCT (MẶC ĐỊNH)
// ==========================
async function loadProduct() {

    try {

        const res = await fetch(API_PRODUCT);

        if (!res.ok) {
            console.error("Lỗi API:", res.status);
            return;
        }

        const data = await res.json();

        const products = data.content || data;

        // lấy 6 sản phẩm đầu
        const topProducts = products.slice(0, 6);

        renderProductList(topProducts);

    } catch (err) {
        console.error("Lỗi load product:", err);
    }
}


// ==========================
// SEARCH PRODUCT
// ==========================
async function searchProduct() {

    const input = document.getElementById("searchInput");

    if (!input) return;

    const keyword = input.value.trim();

    // nếu xoá input → load lại
    if (!keyword) {
        loadProduct();
        return;
    }

    try {

        const res = await fetch(
            `${API_PRODUCT}/search?keyword=${keyword}`
        );

        if (!res.ok) {
            console.error("Lỗi search:", res.status);
            return;
        }

        const data = await res.json();

        const products = data.content || data;

        renderProductList(products);

    } catch (err) {
        console.error("Lỗi search:", err);
    }
}


// ==========================
// EVENT
// ==========================
document.addEventListener("DOMContentLoaded", function () {

    // load mặc định
    loadProduct();

    const input = document.getElementById("searchInput");

    if (!input) return;

    // Enter search
    input.addEventListener("keypress", function(e){
        if(e.key === "Enter"){
            searchProduct();
        }
    });

    // Gõ là search (debounce)
    let timer;

    input.addEventListener("input", function(){
        clearTimeout(timer);
        timer = setTimeout(searchProduct, 400);
    });

});
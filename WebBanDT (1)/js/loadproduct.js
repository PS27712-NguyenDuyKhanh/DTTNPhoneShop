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
// LOAD PRODUCT
// ==========================
async function loadProduct() {

    try {

        const res = await fetch(API_PRODUCT);

        if (!res.ok) {
            console.error("Lỗi API:", res.status);
            return;
        }

        const data = await res.json();

        // FIX pagination
        const products = data.content || data;

        // lọc sản phẩm có variant
        const validProducts = products.filter(p => p.variants && p.variants.length > 0);

        // lấy tối đa 6 sản phẩm
        const topProducts = validProducts.slice(0, 6);

        const list = document.getElementById("productList");
        list.innerHTML = "";

        topProducts.forEach(p => {

            const variants = p.variants;

            // ảnh
            const img = variants[0]?.images?.[0]?.imageUrl || "";

            // ==========================
            // TÍNH GIÁ
            // ==========================

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

            // ==========================
            // HTML GIÁ
            // ==========================

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

            // ==========================
            // STOCK
            // ==========================
            const stock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

            // ==========================
            // RENDER
            // ==========================
            list.innerHTML += `
            <div class="product-card">

                ${badgeHTML}

                <img src="http://localhost:8081${img}" class="product-img">

                <h3>${p.name}</h3>

                ${priceHTML}

                <p class="stock">Còn ${stock} sản phẩm</p>

                <a href="product-detail.html?id=${p.id}" class="btn-main">
                    Xem chi tiết
                </a>

            </div>
            `;
        });

    } catch (err) {
        console.error("Lỗi load product:", err);
    }
}

// ==========================
// INIT
// ==========================
window.onload = loadProduct;
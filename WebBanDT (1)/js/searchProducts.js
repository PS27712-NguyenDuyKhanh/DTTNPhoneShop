const BASE_URL = "http://localhost:8081";

async function searchProducts() {

    const input = document.getElementById("searchInput");
    const container = document.getElementById("searchResult");

    if (!input || !container) return;

    const keyword = input.value.trim();

    if (!keyword) {
        container.innerHTML = "";
        return;
    }

    try {
        const res = await fetch(
            `${BASE_URL}/api/products/search?keyword=${encodeURIComponent(keyword)}`
        );

        const data = await res.json();

        renderSearchResult(data.content);

    } catch (err) {
        console.error("Lỗi API:", err);
    }
}


// ===== RENDER DROPDOWN =====
function renderSearchResult(products) {

    const container = document.getElementById("searchResult");
    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = `<div class="search-item">Không tìm thấy</div>`;
        return;
    }

    let html = "";

    products.forEach(p => {

        const imageUrl = p.image 
            ? BASE_URL + p.image 
            : "../img/default.jpg";

        html += `
            <div class="search-item" onclick="goToDetail(${p.id})">
                <img src="${imageUrl}">
                <span>${p.name}</span>
            </div>
        `;
    });

    container.innerHTML = html;
}


// ===== CLICK → CHI TIẾT =====
function goToDetail(id){
    window.location.href = `product-detail.html?id=${id}`;
}


// ===== SEARCH REALTIME =====
document.addEventListener("DOMContentLoaded", function () {

    const input = document.getElementById("searchInput");

    input.addEventListener("input", function(){
        searchProducts();
    });

});
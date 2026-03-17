const API = "http://localhost:8081/api/products/category/";

let page = 0;
const size = 8;

const params = new URLSearchParams(window.location.search);
const categoryId = params.get("category");

async function loadProducts(){

const res = await fetch(`${API}${categoryId}?page=${page}&size=${size}`);

const data = await res.json();

renderProducts(data.content);
renderPagination(data.totalPages);

}

function renderProducts(products){

const list = document.getElementById("productList");

list.innerHTML = "";

products.forEach(p=>{

const img = p.variants?.[0]?.images?.[0]?.imageUrl || "";
const price = p.variants?.[0]?.price || 0;

list.innerHTML += `

<div class="product-card">

<img src="http://localhost:8081${img}">

<h3>${p.name}</h3>

<p>${price.toLocaleString()} đ</p>

<a href="product-detail.html?id=${p.id}">
Xem chi tiết
</a>

</div>
`;

});

}

function renderPagination(totalPages){

const pagination = document.getElementById("pagination");

pagination.innerHTML = "";

for(let i=0;i<totalPages;i++){

pagination.innerHTML += `<button onclick="changePage(${i})">
${i+1} </button>`;

}

}

function changePage(p){

page = p;
loadProducts();

}

loadProducts();

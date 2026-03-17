const API = "http://localhost:8081/api/products/";

/* =========================
LOAD PRODUCT DETAIL
========================= */

async function loadProduct() {

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) return;

const res = await fetch(API + id);
const p = await res.json();

document.getElementById("name").innerText = p.name || "";

/* HIỂN THỊ HTML DESCRIPTION */

document.getElementById("description").innerHTML = p.description || "";
document.getElementById("fullDescription").innerHTML = p.description || "";

const image = document.getElementById("image");
const price = document.getElementById("price");
const colors = document.getElementById("colors");
const specs = document.getElementById("specs");

const variants = p.variants || [];

/* =========================
SPECIFICATIONS
========================= */

if (p.specification) {

const s = p.specification;

specs.innerHTML = `

<li><span>CPU</span><span>${s.cpu || "-"}</span></li>
<li><span>RAM</span><span>${s.ram || "-"}</span></li>
<li><span>ROM</span><span>${s.rom || "-"}</span></li>
<li><span>GPU</span><span>${s.gpu || "-"}</span></li>
<li><span>Camera</span><span>${s.camera || "-"}</span></li>
<li><span>Pin</span><span>${s.battery || "-"}</span></li>
<li><span>Màn hình</span><span>${s.screen || "-"}</span></li>
`;

}

/* =========================
COLORS
========================= */

colors.innerHTML = "";

variants.forEach((v, index) => {

const btn = document.createElement("button");

let color = (v.color || "").toLowerCase();

if (color === "đen") color = "black";
else if (color === "trắng") color = "white";
else if (color === "đỏ") color = "red";
else if (color === "xanh") color = "green";
else if (color === "xanh dương") color = "blue";
else if (color === "vàng") color = "gold";
else if (color === "cam") color = "orange";
else if (color === "hồng") color = "#ff6ec7";
else if (color === "tím") color = "purple";
else if (color === "xám") color = "gray";
else if (color === "bạc") color = "silver";

btn.style.width = "36px";
btn.style.height = "36px";
btn.style.borderRadius = "50%";
btn.style.border = "2px solid #ddd";
btn.style.cursor = "pointer";
btn.style.background = color;
btn.style.marginRight = "10px";

btn.title = v.color;

btn.onclick = () => {

const img = v.images?.[0]?.imageUrl || "";
image.src = "http://localhost:8081" + img;

const finalPrice = v.salePrice || v.price || 0;
price.innerText = finalPrice.toLocaleString() + " đ";

};

colors.appendChild(btn);

/* LOAD FIRST VARIANT */

if (index === 0) {

const img = v.images?.[0]?.imageUrl || "";
image.src = "http://localhost:8081" + img;

const finalPrice = v.salePrice || v.price || 0;
price.innerText = finalPrice.toLocaleString() + " đ";

}

});

}

/* =========================
TAB SWITCH
========================= */

function openTab(tabId, btn) {

document.querySelectorAll(".tab-content")
.forEach(tab => tab.classList.remove("active"));

document.querySelectorAll(".tab-btn")
.forEach(b => b.classList.remove("active"));

document.getElementById(tabId).classList.add("active");

btn.classList.add("active");

}

/* =========================
LOAD PAGE
========================= */

window.onload = loadProduct;

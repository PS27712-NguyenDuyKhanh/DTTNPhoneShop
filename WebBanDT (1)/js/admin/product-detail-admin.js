
const API = "http://localhost:8081/api/admin/products/";

async function loadProduct() {

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const token = localStorage.getItem("token");

    const res = await fetch(API + id, {
        headers: {
            Authorization: "Bearer " + token
        }
    });

    if (!res.ok) {
        console.log("API lỗi", res.status);
        return;
    }

    const p = await res.json();


    document.getElementById("productName").innerText = p.name;

    document.getElementById("productSku").innerText = p.sku;


    /* HIỂN THỊ HTML MÔ TẢ */
    document.getElementById("productDesc").innerHTML = p.description;


    /* SPEC */

    const spec = p.specification;

    const specList = document.getElementById("specList");

    specList.innerHTML = `
<li>CPU: ${spec.cpu}</li>
<li>RAM: ${spec.ram}</li>
<li>ROM: ${spec.rom}</li>
<li>GPU: ${spec.gpu}</li>
<li>Camera: ${spec.camera}</li>
<li>Battery: ${spec.battery}</li>
<li>Screen: ${spec.screen}</li>
`;


    /* VARIANTS */

    const table = document.getElementById("variantTable");

    table.innerHTML = "";

    p.variants.forEach(v => {

        const img = v.images?.[0]?.imageUrl || "";

        const sale = v.salePrice ? `
<div class="sale-price">
Giảm còn: ${v.salePrice}
</div>

<div class="sale-time">
${v.saleStart?.slice(0, 10)} → ${v.saleEnd?.slice(0, 10)}
</div>
` : `<div class="no-sale">Không giảm</div>`;

        table.innerHTML += `

<tr>

<td>${v.color}</td>

<td class="price">

<div class="old-price">
Giá gốc: ${v.price}
</div>

${sale}

</td>

<td>${v.stock}</td>

<td>
<img src="http://localhost:8081${img}" class="variant-img">
</td>

</tr>

`;

    });

}

loadProduct();

const btn = document.getElementById("toggleDesc");
const wrapper = document.querySelector(".desc-wrapper");

btn.addEventListener("click", () => {

wrapper.classList.toggle("open");

if(wrapper.classList.contains("open")){
btn.innerText="Thu gọn";
}else{
btn.innerText="Xem thêm";
}

});
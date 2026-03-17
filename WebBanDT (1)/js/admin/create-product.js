
        const API = "http://localhost:8081/api/admin/products";
        const CATEGORY_API = "http://localhost:8081/api/categories";

        let variantIndex = 0;
        let editor;


        /* LOAD CATEGORY */

        async function loadCategories() {

            const res = await fetch(CATEGORY_API);
            const data = await res.json();

            const select = document.getElementById("categoryId");

            select.innerHTML = `<option value="">-- Chọn danh mục --</option>`;

            data.forEach(c => {

                // chỉ hiển thị category con
                if (c.parent) {

                    select.innerHTML += `
        <option value="${c.id}">
            ${c.parent.name} > ${c.name}
        </option>
        `;

                }

            });

        }

        loadCategories();


        /* CKEDITOR */

        ClassicEditor
            .create(document.querySelector("#description"))
            .then(e => {
                editor = e;
            })
            .catch(error => {
                console.error(error);
            });


        /* UPLOAD IMAGE */

        async function uploadImage(file) {

            const formData = new FormData();
            formData.append("file", file);

            const token = localStorage.getItem("token");

            const res = await fetch("http://localhost:8081/api/file/upload", {

                method: "POST",

                headers: {
                    "Authorization": "Bearer " + token
                },

                body: formData

            });

            return await res.text();

        }


        /* ADD VARIANT */

        function addVariant() {

            const container = document.getElementById("variantContainer");

            document.querySelectorAll(".variant-body").forEach(v => {
                v.style.display = "none";
            });

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

</div>

</div>

`;

            container.insertAdjacentHTML("beforeend", html);

        }


        /* TOGGLE VARIANT */

        function toggleVariant(index) {

            const body = document.getElementById("variantBody" + index);

            if (body.style.display === "none") {
                body.style.display = "block";
            } else {
                body.style.display = "none";
            }

        }


        /* GET VARIANTS */

        async function getVariants() {

            let variants = [];

            for (let i = 1; i <= variantIndex; i++) {

                const color = document.getElementById("color" + i)?.value;
                if (!color) continue;

                const file = document.getElementById("image" + i)?.files[0];

                let imageUrl = "";

                if (file) {
                    imageUrl = await uploadImage(file);
                }

                variants.push({

                    color: color,

                    price: Number(document.getElementById("price" + i).value),

                    salePrice: Number(document.getElementById("salePrice" + i).value),

                    saleStart: document.getElementById("saleStart" + i).value,

                    saleEnd: document.getElementById("saleEnd" + i).value,

                    stock: Number(document.getElementById("stock" + i).value),

                    images: [
                        {
                            imageUrl: imageUrl
                        }
                    ]

                });

            }

            return variants;

        }


        /* CREATE PRODUCT */

        async function createProduct() {

            const token = localStorage.getItem("token");

            const variants = await getVariants();

            const data = {

                name: document.getElementById("name").value,

                sku: document.getElementById("sku").value,

                os: document.getElementById("os").value,

                description: editor.getData(),

                categoryId: Number(document.getElementById("categoryId").value),

                specification: {

                    cpu: document.getElementById("cpu").value,

                    ram: document.getElementById("ram").value,

                    rom: document.getElementById("rom").value,

                    gpu: document.getElementById("gpu").value,

                    camera: document.getElementById("camera").value,

                    battery: document.getElementById("battery").value,

                    screen: document.getElementById("screen").value

                },

                variants: variants

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

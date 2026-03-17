

        const API = "http://localhost:8081/api/admin/products";

        async function loadProducts() {

            const token = localStorage.getItem("token");

            try {

                const res = await fetch(API, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token
                    }
                });

                if (!res.ok) {
                    console.error("API lỗi:", res.status);
                    return;
                }

                const data = await res.json();

                const table = document.getElementById("productTable");

                table.innerHTML = "";

                const products = data.content || data;

                products.forEach(p => {

                    const img = p.variants?.[0]?.images?.[0]?.imageUrl || "";

                    const stock = p.variants?.reduce((total, v) => total + (v.stock || 0), 0);

                    const status = stock > 0 ? "Đang bán" : "Hết hàng";

                    table.innerHTML += `
    <tr onclick="viewProduct(${p.id})" style="cursor:pointer">

        <td>${p.id}</td>

        <td>
            <img src="http://localhost:8081${img}" width="50">
        </td>

        <td>${p.sku || ""}</td>

        <td>${p.name}</td>

        <td>${stock}</td>

        <td>${status}</td>

        <td onclick="event.stopPropagation()">
            <button onclick="editProduct(${p.id})">Sửa</button>
            <button onclick="deleteProduct(${p.id})">Xóa</button>
        </td>

    </tr>
    `;
                });

            } catch (err) {
                console.error("Lỗi load sản phẩm:", err);
            }

        }


        function goCreateProduct() {

            window.location.href = "create-product.html";

        }

        function viewProduct(id) {

            window.location.href = "product-detail-admin.html?id=" + id;

        }

        function editProduct(id){

    window.location.href = "edit-product.html?id=" + id;

}


        async function deleteProduct(id) {

            const token = localStorage.getItem("token");

            if (!confirm("Xóa sản phẩm này?")) return;

            await fetch(API + "/" + id, {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            loadProducts();
        }

        loadProducts();
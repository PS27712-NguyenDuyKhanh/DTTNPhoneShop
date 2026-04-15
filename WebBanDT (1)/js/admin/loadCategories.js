const API_ADMIN = "http://localhost:8081/api/admin/categories";

let editingId = null;
let currentPage = 0;
const size = 10;

// ==========================
// AUTH
// ==========================

function getToken() {
    return sessionStorage.getItem("token");
}

function getAuthHeader() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + getToken()
    };
}

// ==========================
// LOAD CATEGORIES
// ==========================

async function loadAdminCategories(page = 0) {

    currentPage = page;

    try {

        const res = await fetch(`${API_ADMIN}?page=${page}&size=${size}`, {
            headers: getAuthHeader()
        });

        if (!res.ok) {

            if (res.status === 401) {
                alert("Hết phiên đăng nhập!");
                window.location.href = "login.html";
            }

            console.error("Không load được danh mục:", res.status);
            return;
        }

        const data = await res.json();

        console.log("DATA:", data);

        const categories = Array.isArray(data) ? data : (data.content || []);

        const table = document.getElementById("categoryTable");
        const parent = document.getElementById("parent");

        if (!table || !parent) return;

        table.innerHTML = "";
        parent.innerHTML = `<option value="">Danh mục cha</option>`;

        if (categories.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center">
                        Không có danh mục
                    </td>
                </tr>
            `;
        }

        categories.forEach(c => {

            // dropdown
            parent.insertAdjacentHTML("beforeend", `
                <option value="${c.id}">
                    ${c.name}
                </option>
            `);

            // table
            table.insertAdjacentHTML("beforeend", `
                <tr>

                    <td>${c.id}</td>

                    <td>${c.name}</td>

                    <td>
                        ${c.parent ? c.parent.name : "-"}
                    </td>

                    <td>

                        <button onclick="editCategory(${c.id}, '${c.name}')">
                            <i class="fa fa-pen"></i>
                        </button>

                        <button onclick="deleteCategory(${c.id})">
                            <i class="fa fa-trash"></i>
                        </button>

                    </td>

                </tr>
            `);

        });

        // 🔥 thêm pagination
        renderPagination(data);

    } catch (err) {

        console.error("Lỗi load categories:", err);

    }
}

function renderPagination(data) {

    const container = document.getElementById("pagination");
    if (!container) return;

    container.innerHTML = "";

    if (!data.totalPages) return;

    // Prev
    container.innerHTML += `
        <button ${data.first ? 'disabled' : ''} 
            onclick="loadAdminCategories(${data.number - 1})">
            ←
        </button>
    `;

    // Pages
    for (let i = 0; i < data.totalPages; i++) {
        container.innerHTML += `
            <button 
                onclick="loadAdminCategories(${i})"
                class="${i === data.number ? 'active-page' : ''}">
                ${i + 1}
            </button>
        `;
    }

    // Next
    container.innerHTML += `
        <button ${data.last ? 'disabled' : ''} 
            onclick="loadAdminCategories(${data.number + 1})">
            →
        </button>
    `;
}

// ==========================
// SHOW FORM
// ==========================

function showForm() {
    document.getElementById("categoryForm").style.display = "block";
    document.getElementById("overlay").style.display = "block";
}

function closeForm() {
    document.getElementById("categoryForm").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

// ==========================
// SAVE CATEGORY
// ==========================

async function saveCategory() {

    const name = document.getElementById("name").value;
    const parentId = document.getElementById("parent").value;

    if (!name.trim()) {
        alert("Tên danh mục không được để trống!");
        return;
    }

    const body = {
        name: name,
        parentId: parentId || null
    };

    try {

        let res;

        if (editingId) {

            res = await fetch(API_ADMIN + "/" + editingId, {
                method: "PUT",
                headers: getAuthHeader(),
                body: JSON.stringify(body)
            });

            editingId = null;

        } else {

            res = await fetch(API_ADMIN, {
                method: "POST",
                headers: getAuthHeader(),
                body: JSON.stringify(body)
            });

        }

        if (!res.ok) {

            let errorMsg = "Tên danh mục đã tồn tại!";

            try {
                const data = await res.json(); // 👉 đọc JSON
                errorMsg = data.message || errorMsg;
            } catch (e) { }

            alert(errorMsg); // 👉 hiện đúng message

            return;
        }

        // reset form
        document.getElementById("name").value = "";
        document.getElementById("parent").value = "";

        closeForm();
        loadAdminCategories();

    } catch (err) {

        console.error("Lỗi lưu danh mục:", err);

    }

}

// ==========================
// EDIT
// ==========================

function editCategory(id, name) {

    editingId = id;

    document.getElementById("name").value = name;

    showForm();
}

// ==========================
// DELETE
// ==========================

async function deleteCategory(id) {

    if (!confirm("Xóa danh mục này?")) return;

    try {

        const res = await fetch(API_ADMIN + "/" + id, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + getToken()
            }
        });

        if (!res.ok) {
            alert("Xóa thất bại!");
            return;
        }

        loadAdminCategories(currentPage);

    } catch (err) {

        console.error("Lỗi xóa danh mục:", err);

    }

}

// ==========================
// INIT
// ==========================

document.addEventListener("DOMContentLoaded", () => {

    const token = getToken();

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    loadAdminCategories(0);
});
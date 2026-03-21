const API_ADMIN = "http://localhost:8081/api/admin/categories";

let editingId = null;

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

async function loadAdminCategories() {

    try {

        const res = await fetch(API_ADMIN, {
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

        const categories = await res.json();

        const table = document.getElementById("categoryTable");
        const parent = document.getElementById("parent");

        if (!table || !parent) return;

        table.innerHTML = "";
        parent.innerHTML = `<option value="">Danh mục cha</option>`;

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

    } catch (err) {

        console.error("Lỗi load categories:", err);

    }

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
            alert("Lỗi khi lưu danh mục!");
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

        loadAdminCategories();

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

    loadAdminCategories();
});
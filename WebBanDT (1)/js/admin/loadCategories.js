const API_ADMIN = "http://localhost:8081/api/admin/categories";
const token = localStorage.getItem("token");

let editingId = null;

// ==========================
// LOAD CATEGORIES
// ==========================

async function loadAdminCategories() {

    try {

        const res = await fetch(API_ADMIN, {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        if (!res.ok) {
            console.error("Không load được danh mục");
            return;
        }

        const categories = await res.json();

        const table = document.getElementById("categoryTable");
        const parent = document.getElementById("parent");

        table.innerHTML = "";
        parent.innerHTML = `<option value="">Danh mục cha</option>`;

        categories.forEach(c => {

            // dropdown danh mục cha
            parent.innerHTML += `
                <option value="${c.id}">
                    ${c.name}
                </option>
            `;

            // bảng danh mục
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

function showForm(){

    document.getElementById("categoryForm").style.display = "block";
    document.getElementById("overlay").style.display = "block";

}

function closeForm(){

    document.getElementById("categoryForm").style.display = "none";
    document.getElementById("overlay").style.display = "none";

}

// ==========================
// SAVE CATEGORY
// ==========================

async function saveCategory(){

    const name = document.getElementById("name").value;
    const parentId = document.getElementById("parent").value;

    const body = {
        name: name,
        parentId: parentId || null
    };

    try {

        if(editingId){

            await fetch(API_ADMIN + "/" + editingId, {

                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify(body)

            });

            editingId = null;

        }else{

            await fetch(API_ADMIN, {

                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify(body)

            });

        }

        // reset form
        document.getElementById("name").value = "";
        document.getElementById("parent").value = "";

        closeForm();
        loadAdminCategories();

    } catch(err){

        console.error("Lỗi lưu danh mục:", err);

    }

}

// ==========================
// EDIT CATEGORY
// ==========================

function editCategory(id, name){

    editingId = id;

    document.getElementById("name").value = name;

    showForm();

}

// ==========================
// DELETE CATEGORY
// ==========================

async function deleteCategory(id){

    if(!confirm("Xóa danh mục này?")) return;

    try{

        await fetch(API_ADMIN + "/" + id, {

            method: "DELETE",
            headers: {
                Authorization: "Bearer " + token
            }

        });

        loadAdminCategories();

    }catch(err){

        console.error("Lỗi xóa danh mục:", err);

    }

}

// ==========================
// INIT
// ==========================

loadAdminCategories();
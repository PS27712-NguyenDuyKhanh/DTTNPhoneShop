const API = "http://localhost:8081/api/admin/users";

// ==========================
// AUTH
// ==========================

function getToken() {
    return sessionStorage.getItem("token");
}

function getAuthHeader() {
    return {
        "Authorization": "Bearer " + getToken()
    };
}

// ==========================
// LOAD USERS
// ==========================

async function loadUsers() {

    try {

        const res = await fetch(API, {
            headers: getAuthHeader()
        });

        // 🔥 handle lỗi
        if (!res.ok) {

            if (res.status === 401) {
                alert("Hết phiên đăng nhập!");
                window.location.href = "../login.html";
            }

            console.error("API lỗi:", res.status);
            return;
        }

        const users = await res.json();

        const table = document.getElementById("userTable");

        if (!table) return;

        table.innerHTML = "";

        users.forEach(u => {

    table.insertAdjacentHTML("beforeend", `
    <tr>
        <td>${u.id}</td>
        <td>${u.username}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>

        <td class="${u.active ? 'active' : 'locked'}">
            ${u.active ? 'Hoạt động' : 'Bị khóa'}
        </td>

        <td>
            <button onclick="changeStatus(${u.id})">
                <i class="fa ${u.active ? 'fa-lock-open' : 'fa-lock'}"></i>
            </button>

            <button onclick="deleteUser(${u.id})">
                <i class="fa fa-trash"></i>
            </button>
        </td>
    </tr>
    `);

});

    } catch (error) {

        console.error("Lỗi load user", error);

    }

}

// ==========================
// INIT
// ==========================

document.addEventListener("DOMContentLoaded", () => {

    const token = getToken();

    if (!token) {
        window.location.href = "../login.html";
        return;
    }

    loadUsers();

});
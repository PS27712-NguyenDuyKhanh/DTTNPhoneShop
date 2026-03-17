const API = "http://localhost:8081/api/admin/users";

async function loadUsers() {

    const token = localStorage.getItem("token");

    try {

        const res = await fetch(API, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const users = await res.json();

        const table = document.getElementById("userTable");
        table.innerHTML = "";

        users.forEach(u => {

            table.innerHTML += `
            <tr>
                <td>${u.id}</td>
                <td>${u.username}</td>
                <td>${u.email}</td>
                <td>${u.role}</td>
                <td class="${u.status ? 'active' : 'locked'}">
                    ${u.status ? 'Hoạt động' : 'Bị khóa'}
                </td>
                <td>

                    <button onclick="changeStatus(${u.id})">
                        <i class="fa fa-lock"></i>
                    </button>

                    <button onclick="deleteUser(${u.id})">
                        <i class="fa fa-trash"></i>
                    </button>

                </td>
            </tr>
            `;

        });

    } catch (error) {

        console.error("Lỗi load user", error);

    }

}

loadUsers();
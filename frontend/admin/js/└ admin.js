const token = localStorage.getItem("token")

async function loadUsers(){

    const res = await fetch("http://localhost:8081/api/admin/users",{
        headers:{
            "Authorization":"Bearer " + token
        }
    })

    const users = await res.json()

    let html = ""

    users.forEach(u=>{

        html += `
        <tr>
            <td>${u.id}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>
                <button onclick="deleteUser(${u.id})"
                 class="btn btn-danger btn-sm">Delete</button>
            </td>
        </tr>
        `
    })

    document.getElementById("userTable").innerHTML = html
}

loadUsers()
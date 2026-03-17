const USER_API = "http://localhost:8081/api/user";

async function loadProfile() {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {

        const res = await fetch(USER_API + "/profile", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (res.ok) {

            const data = await res.json();

            document.getElementById("username").value = data.username;
            document.getElementById("email").value = data.email;
            document.getElementById("phone").value = data.phone || "";
            document.getElementById("address").value = data.address || "";

        } else {

            showMessage("Không lấy được thông tin user", "danger");

        }

    } catch (error) {

        showMessage("Server error", "danger");

    }

}

async function updateProfile() {

    const token = localStorage.getItem("token");

    const username = document.getElementById("username").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;

    try {

        const res = await fetch("http://localhost:8081/api/user/profile", {

            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },

            body: JSON.stringify({
                username,
                phone,
                address
            })

        });

        if (res.ok) {

            showMessage("Cập nhật thành công", "success");

        } else {

            showMessage("Cập nhật thất bại", "danger");

        }

    } catch (e) {

        showMessage("Server error", "danger");

    }

}
function showMessage(text, type) {

    const box = document.getElementById("message");

    if (!box) return;

    box.innerHTML = `
        <div class="alert alert-${type}">
            ${text}
        </div>
    `;
}
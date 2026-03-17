const API = "http://localhost:8081/api/auth";

async function login() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        const res = await fetch(API + "/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        if (res.ok) {

            const data = await res.json();

            // lưu token
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("name", data.username);
            

            showMessage("Đăng nhập thành công", "success");

            setTimeout(() => {

                if (data.role === "ADMIN") {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "home.html";
                }

            }, 1000);

        } else {

            const text = await res.text();
            showMessage(text || "Sai email hoặc mật khẩu", "danger");

        }

    } catch (error) {

        showMessage("Không kết nối được server", "danger");

    }

}


function showMessage(text, type) {

    const box = document.getElementById("message");

    box.innerHTML = `
        <div class="alert alert-${type}">
            ${text}
        </div>
    `;

}
const API = "http://localhost:8081/api/auth";

// ==========================
// MESSAGE
// ==========================
function showMessage(text, type) {

    const box = document.getElementById("message");

    if (!box) return;

    box.innerHTML = `
        <div class="alert alert-${type}">
            ${text}
        </div>
    `;
}

// ==========================
// ERROR
// ==========================
function setError(id, message){
    document.getElementById(id).innerText = message;
}

function clearError(){
    document.querySelectorAll(".error").forEach(e => e.innerText = "");
}

// clear lỗi khi nhập lại
document.addEventListener("input", function(e){
    if(e.target.tagName === "INPUT"){
        const error = e.target.parentElement.querySelector(".error");
        if(error) error.innerText = "";
    }
});

// ==========================
// LOGIN
// ==========================
async function login() {

    clearError();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    let isValid = true;

    if(!email){
        setError("errorEmail", "Bạn chưa nhập email");
        isValid = false;
    }

    if(!password){
        setError("errorPassword", "Bạn chưa nhập mật khẩu");
        isValid = false;
    }

    if(!isValid) return;

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

            // lưu session
            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("role", data.role);
            sessionStorage.setItem("name", data.username);

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
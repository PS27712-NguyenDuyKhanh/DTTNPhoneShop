const API = "http://localhost:8081/api/auth";

function showMessage(text, type) {

    const box = document.getElementById("message");

    box.innerHTML =
        `<div class="alert alert-${type}">
            ${text}
        </div>`;
}


// SEND OTP
async function sendOtp() {

    const email = document.getElementById("email").value;

    const res = await fetch(API + "/send-otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
    });

    const text = await res.text();

    if (res.ok) {

        showMessage(text || "OTP đã được gửi", "success");

        document.getElementById("otp").disabled = false;
        document.getElementById("verifyBtn").disabled = false;

    } else {

        showMessage(text || "Email đã tồn tại", "danger");

    }

}



// VERIFY OTP
async function verifyOtp() {

    const email = document.getElementById("email").value;
    const otp = document.getElementById("otp").value;

    const res = await fetch(API + "/verify-otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, otp })
    });

    const text = await res.text();

    if (res.ok) {

        showMessage(text || "OTP chính xác", "success");

        document.getElementById("password").disabled = false;
        document.getElementById("createBtn").disabled = false;

    } else {

        showMessage(text || "OTP không đúng", "danger");

    }

}



// CREATE ACCOUNT
async function createPassword() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch(API + "/create-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    const text = await res.text();

    if (res.ok) {

        showMessage(text || "Tạo tài khoản thành công", "success");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);

    } else {

        showMessage(text || "Tạo tài khoản thất bại", "danger");

    }

}

async function login() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch("http://localhost:8081/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    if (!res.ok) {

        const text = await res.text();
        showMessage(text, "danger");
        return;
    }

    const data = await res.json();

    localStorage.setItem("token", data.token);

    showMessage("Đăng nhập thành công", "success");

    // redirect theo role
    setTimeout(() => {

        if (data.role === "ADMIN") {
            window.location.href = "admin/dashboard.html";
        } else {
            window.location.href = "index.html";
        }

    }, 1000);

}
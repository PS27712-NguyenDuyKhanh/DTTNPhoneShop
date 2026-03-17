document.addEventListener("DOMContentLoaded", function () {

    const username = localStorage.getItem("name");

    const btnLogin = document.getElementById("btnLogin");
    const userName = document.getElementById("userName");
    const btnLogout = document.getElementById("btnLogout");

    if (!username) {

        btnLogin.style.display = "inline-block";
        userName.style.display = "none";
        btnLogout.style.display = "none";
        return;

    }

    btnLogin.style.display = "none";

    userName.style.display = "inline-block";
    userName.innerHTML = `<i class="fa-solid fa-user"></i> ${username}`;

    btnLogout.style.display = "inline-block";

    userName.onclick = function () {
        window.location.href = "profile.html";
    };

    btnLogout.onclick = function () {

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        localStorage.removeItem("userId");

        alert("Đã đăng xuất");

        window.location.href = "login.html";

    };

});
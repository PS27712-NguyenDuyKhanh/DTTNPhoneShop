document.addEventListener("DOMContentLoaded", () => {

    const name = sessionStorage.getItem("name");
    const token = sessionStorage.getItem("token");

    const btnLogin = document.getElementById("btnLogin");
    const userName = document.getElementById("userName");
    const btnLogout = document.getElementById("btnLogout");

    if (!btnLogin || !userName || !btnLogout) return;

    // chưa login
    if (!token) {
        btnLogin.style.display = "inline-block";
        userName.style.display = "none";
        btnLogout.style.display = "none";
        return;
    }

    // đã login
    btnLogin.style.display = "none";

    userName.style.display = "inline-block";
    userName.innerText = "👋 " + (name || "User");

    btnLogout.style.display = "inline-block";

    btnLogout.onclick = () => {
        sessionStorage.clear();
        window.location.href = "login.html";
    };

});
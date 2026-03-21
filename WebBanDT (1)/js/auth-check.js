document.addEventListener("DOMContentLoaded", () => {

    const name = sessionStorage.getItem("name");
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    const btnLogin = document.getElementById("btnLogin");
    const userName = document.getElementById("userName");
    const btnLogout = document.getElementById("btnLogout");
    const adminName = document.getElementById("adminName");

    // ==========================
    // CHƯA LOGIN
    // ==========================
    if (!token) {

        // nếu là admin page → đá về login
        if (window.location.pathname.includes("admin") ||
            window.location.pathname.includes("account")) {

            window.location.href = "../login.html";
            return;
        }

        // user page
        if (btnLogin) btnLogin.style.display = "inline-block";
        if (userName) userName.style.display = "none";
        if (btnLogout) btnLogout.style.display = "none";

        return;
    }

    // ==========================
    // ADMIN PAGE
    // ==========================
    if (adminName) {

        if (role !== "ADMIN") {
            alert("Không có quyền!");
            window.location.href = "../home.html";
            return;
        }

        adminName.innerText = name || "Admin";
    }

    // ==========================
    // USER PAGE
    // ==========================
    // USER PAGE
if (btnLogin && userName && btnLogout) {

    btnLogin.style.display = "none";

    userName.style.display = "inline-block";
    userName.innerText = "👋 " + (name || "User");

    btnLogout.style.display = "inline-block";

    // ✅ thêm đoạn này
    userName.style.cursor = "pointer";
    userName.onclick = () => {
        window.location.href = "profile.html";
    };
}

    // ==========================
    // LOGOUT
    // ==========================
    if (btnLogout) {
        btnLogout.onclick = () => {
            sessionStorage.clear();
            window.location.href = "login.html";
        };
    }

});
document.addEventListener("DOMContentLoaded", function(){

    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    const role = sessionStorage.getItem("role") || localStorage.getItem("role");

    // chưa đăng nhập
    if(!token){
        alert("Vui lòng đăng nhập");
        window.location.href = "login.html";
        return;
    }

    // không phải admin
    if(role !== "ADMIN"){
        alert("Bạn không có quyền truy cập trang admin");
        window.location.href = "home.html";
    }

});

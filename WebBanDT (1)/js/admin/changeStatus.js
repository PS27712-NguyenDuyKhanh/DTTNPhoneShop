function getToken() {
    return sessionStorage.getItem("token");
}

async function changeStatus(id){

    try {

        const res = await fetch(`http://localhost:8081/api/admin/users/status/${id}`,{
            method:"PUT",
            headers:{
                "Authorization":"Bearer " + getToken()
            }
        });

        if (!res.ok) {

            if (res.status === 401) {
                alert("Hết phiên đăng nhập!");
                window.location.href = "../login.html";
            }

            console.error("Lỗi đổi trạng thái:", res.status);
            return;
        }

        // reload lại bảng
        loadUsers();

    } catch (err) {
        console.error("Lỗi changeStatus:", err);
    }
}
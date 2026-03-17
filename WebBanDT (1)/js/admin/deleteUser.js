
async function deleteUser(id){

    const token = localStorage.getItem("token");

    if(!confirm("Bạn có chắc muốn xoá user này?")) return;

    await fetch(`http://localhost:8081/api/admin/users/${id}`,{
        method:"DELETE",
        headers:{
            "Authorization":"Bearer " + token
        }
    });

    loadUsers();
}
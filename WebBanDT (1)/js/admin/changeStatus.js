
async function changeStatus(id){

    const token = localStorage.getItem("token");

    await fetch(`http://localhost:8081/api/admin/users/status/${id}`,{
        method:"PUT",
        headers:{
            "Authorization":"Bearer " + token
        }
    });

    loadUsers();
}
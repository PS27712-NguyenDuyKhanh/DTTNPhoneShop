const user = localStorage.getItem("name")

if (!user) {
    window.location.href = "login.html"
}

document.getElementById("username").innerText = user

function logout(){

    localStorage.clear()

    window.location.href = "home.html"

}
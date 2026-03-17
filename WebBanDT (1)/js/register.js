
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

    const res = await fetch(API + "/send-otp",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({email})
    });

    const text = await res.text();

    if(res.ok){

        showMessage(text || "OTP đã gửi","success");

        document.getElementById("step1").style.display="none";
        document.getElementById("step2").style.display="block";

    }else{

        showMessage(text || "Gửi OTP thất bại","danger");

    }

}



// VERIFY OTP
async function verifyOtp(){

    const email = document.getElementById("email").value;
    const otp = document.getElementById("otp").value;

    const res = await fetch(API + "/verify-otp",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({email,otp})
    });

    const text = await res.text();

    if(res.ok){

        showMessage(text || "OTP đúng","success");

        document.getElementById("step2").style.display="none";
        document.getElementById("step3").style.display="block";

    }else{

        showMessage(text || "OTP sai","danger");

    }

}



// CREATE PASSWORD
async function createPassword(){

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm").value;

    if(password !== confirm){

        showMessage("Mật khẩu không khớp","danger");
        return;

    }

    const res = await fetch(API + "/create-password",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({email,password})
    });

    const text = await res.text();

    if(res.ok){

        showMessage("Đăng ký thành công","success");

        setTimeout(()=>{
            window.location.href="login.html";
        },1500);

    }else{

        showMessage(text || "Tạo tài khoản thất bại","danger");

    }

}
const API = "http://localhost:8081/api/auth";

// ==========================
// MESSAGE
// ==========================

function showMessage(text, type) {

    const box = document.getElementById("message");

    box.innerHTML =
        `<div class="alert alert-${type}">
            ${text}
        </div>`;
}

// ==========================
// ERROR HANDLING
// ==========================

function setError(id, message){
    document.getElementById(id).innerText = message;
}

function clearError(){
    document.querySelectorAll(".error").forEach(e => e.innerText = "");
}

// clear lỗi khi nhập lại
document.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", () => {
        const error = input.nextElementSibling;
        if(error && error.classList.contains("error")){
            error.innerText = "";
        }
    });
});

// ==========================
// SEND OTP
// ==========================

async function sendOtp() {

    clearError();

    const email = document.getElementById("email").value.trim();

    if(!email){
        setError("errorEmail", "Bạn chưa nhập email");
        return;
    }

    try{

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

    }catch(err){
        console.error(err);
        showMessage("Lỗi server","danger");
    }
}

// ==========================
// VERIFY OTP
// ==========================

async function verifyOtp(){

    clearError();

    const email = document.getElementById("email").value;
    const otp = document.getElementById("otp").value.trim();

    if(!otp){
        setError("errorOtp", "Bạn chưa nhập OTP");
        return;
    }

    try{

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

    }catch(err){
        console.error(err);
        showMessage("Lỗi server","danger");
    }
}

// ==========================
// CREATE PASSWORD
// ==========================

async function createPassword(){

    clearError();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value.trim();
    const confirm = document.getElementById("confirm").value.trim();

    let isValid = true;

    if(!password){
        setError("errorPassword", "Bạn chưa nhập mật khẩu");
        isValid = false;
    }

    if(!confirm){
        setError("errorConfirm", "Bạn chưa nhập xác nhận mật khẩu");
        isValid = false;
    }

    if(password && confirm && password !== confirm){
        setError("errorConfirm", "Mật khẩu không khớp");
        isValid = false;
    }

    if(!isValid) return;

    try{

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

    }catch(err){
        console.error(err);
        showMessage("Lỗi server","danger");
    }
}
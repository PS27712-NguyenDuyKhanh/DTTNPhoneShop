

        // BIỂU ĐỒ DOANH THU

        const revenueCtx = document.getElementById('revenueChart');

        new Chart(revenueCtx, {

            type: 'line',

            data: {

                labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],

                datasets: [{

                    label: 'Doanh thu (VNĐ)',

                    data: [20000000, 35000000, 15000000, 50000000, 42000000, 70000000, 65000000],

                    borderColor: '#3b82f6',

                    backgroundColor: 'rgba(59,130,246,0.2)',

                    fill: true,

                    tension: 0.4

                }]

            },

            options: {

                responsive: true,

                plugins: {
                    legend: {
                        display: true
                    }
                }

            }

        });


        // BIỂU ĐỒ SẢN PHẨM

        const productCtx = document.getElementById('productChart');

        new Chart(productCtx, {

            type: 'bar',

            data: {

                labels: ['Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo'],

                datasets: [{

                    label: 'Số lượng sản phẩm',

                    data: [25, 18, 12, 10, 8],

                    backgroundColor: [

                        '#3b82f6',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6'

                    ]

                }]

            },

            options: {

                responsive: true,

                plugins: {
                    legend: {
                        display: false
                    }
                }

            }

        });

        // ================== THÊM PHẦN ADMIN ==================

// Hiển thị tên admin
document.addEventListener("DOMContentLoaded", function(){

    const adminName = sessionStorage.getItem("name");

    const adminSpan = document.querySelector(".admin span");

    if(adminName){
        adminSpan.innerText = adminName;
    }

});


// Logout admin
const logoutBtn = document.querySelector(".logout");

if(logoutBtn){

    logoutBtn.onclick = function(){

        sessionStorage.removeItem("token");
        sessionStorage.removeItem("role");
        sessionStorage.removeItem("name");
        
        alert("Đã đăng xuất");

        window.location.href = "login.html";

    }

}

document.addEventListener("DOMContentLoaded", function(){

    const name = sessionStorage.getItem("name") || localStorage.getItem("name");

    if(name){
        const adminName = document.getElementById("adminName");
        adminName.innerText = name;
    }

});


const API = "http://localhost:8081/api/admin";

// ================= TOKEN =================
function getToken(){
    return sessionStorage.getItem("token");
}

const token = getToken();

if (!token) {
    window.location.href = "../login.html";
}

const headers = {
    "Authorization": "Bearer " + token,
    "Content-Type": "application/json"
};

// ================= HELPER =================
async function callAPI(url){
    const res = await fetch(API + url, { headers });

    if (!res.ok) {
        console.error("API lỗi:", url, res.status);
        return null;
    }

    return res.json();
}

// ================= DASHBOARD =================
async function loadDashboard() {
    const data = await callAPI("/dashboard");
    if (!data) return;

    document.querySelector(".revenue p").innerText =
        data.revenue.toLocaleString() + "đ";

    document.querySelector(".orders p").innerText = data.orders;
    document.querySelector(".products p").innerText = data.products;
    document.querySelector(".users p").innerText = data.users;
}

// ================= REVENUE CHART =================
let revenueChart;
let currentMode = "month";

function changeMode(mode){
    currentMode = mode;
    loadRevenueChart();
}

async function loadRevenueChart() {

    let url = "/revenue-month";

    if (currentMode === "day") url = "/revenue-day";
    if (currentMode === "year") url = "/revenue-year";

    const data = await callAPI(url);
    if (!data) return;

    let labels;

    if (currentMode === "day") {
        labels = data.map(i => i[0]); // yyyy-mm-dd
    } 
    else if (currentMode === "year") {
        labels = data.map(i => "Năm " + i[0]);
    } 
    else {
        labels = data.map(i => "T" + i[0]);
    }

    const values = data.map(i => i[1]);

    // 🔥 destroy chart cũ
    if (revenueChart) revenueChart.destroy();

    revenueChart = new Chart(document.getElementById("revenueChart"), {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Doanh thu (VNĐ)",
                data: values,
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59,130,246,0.2)",
                fill: true,
                tension: 0.4,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true }
            }
        }
    });
}
// ================= PRODUCT CATEGORY =================
let productChart;

async function loadProductChart() {
    const data = await callAPI("/product-category");
    if (!data) return;

    const labels = data.map(i => i[0]);
    const values = data.map(i => i[1]);

    if (productChart) productChart.destroy();

    productChart = new Chart(document.getElementById("productChart"), {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Số lượng sản phẩm",
                data: values,
                backgroundColor: [
                    "#3b82f6",
                    "#10b981",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6"
                ]
            }]
        }
    });
}

// ================= TOP PRODUCTS =================
async function loadTopProducts() {
    const data = await callAPI("/top-products");
    if (!data) return;

    const list = document.getElementById("topProducts");
    if (!list) return;

    list.innerHTML = "";

    data.forEach(item => {
        const li = document.createElement("li");
        li.innerText = `${item[0]} - ${item[1]} đã bán`;
        list.appendChild(li);
    });
}

// ================= TOP CUSTOMERS =================
async function loadTopCustomers() {
    const data = await callAPI("/top-customers");
    if (!data) return;

    const list = document.getElementById("topCustomers");
    if (!list) return;

    list.innerHTML = "";

    data.forEach(item => {
        const li = document.createElement("li");
        li.innerText = `${item[0]} - ${item[1].toLocaleString()}đ`;
        list.appendChild(li);
    });
}

// ================= PAYMENT METHOD =================
let paymentChart;

async function loadPaymentChart() {
    const data = await callAPI("/payment-method");
    if (!data) return;

    const labels = data.map(i => i[0]);
    const values = data.map(i => i[1]);

    if (paymentChart) paymentChart.destroy();

    paymentChart = new Chart(document.getElementById("paymentChart"), {
        type: "pie",
        data: {
            labels,
            datasets: [{
                data: values
            }]
        }
    });
}

// ================= ADMIN INFO =================
document.addEventListener("DOMContentLoaded", function () {

    const name = sessionStorage.getItem("name") || localStorage.getItem("name");

    if (name) {
        const adminName = document.getElementById("adminName");
        adminName.innerText = name;
    }

});

// ================= LOGOUT =================
const logoutBtn = document.querySelector(".logout");

if (logoutBtn) {
    logoutBtn.onclick = function () {
        sessionStorage.clear();
        localStorage.clear();

        alert("Đã đăng xuất");

        window.location.href = "login.html";
    };
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {

    loadDashboard();
    loadRevenueChart();
    loadProductChart();
    loadTopProducts();
    loadTopCustomers();
    loadPaymentChart();

});

async function filterDay(){
    const date = document.getElementById("datePicker").value;

    const data = await callAPI(`/revenue/filter/day?date=${date}`);
    if (data == null) return;

    updateSinglePointChart("Ngày " + date, data);
}

async function filterMonth(){
    const value = document.getElementById("monthPicker").value;
    const [year, month] = value.split("-");

    const data = await callAPI(`/revenue/filter/month?month=${month}&year=${year}`);
    if (data == null) return;

    updateSinglePointChart(`Tháng ${month}/${year}`, data);
}

async function filterYear(){
    const year = document.getElementById("yearPicker").value;

    const data = await callAPI(`/revenue/filter/year?year=${year}`);
    if (data == null) return;

    updateSinglePointChart("Năm " + year, data);
}

function updateSinglePointChart(label, value){

    if (revenueChart) revenueChart.destroy();

    revenueChart = new Chart(document.getElementById("revenueChart"), {
        type: "bar",
        data: {
            labels: [label],
            datasets: [{
                label: "Doanh thu (VNĐ)",
                data: [value],
                backgroundColor: "#4f46e5"
            }]
        }
    });
}
async function loadAllCustomers(){
    const data = await callAPI("/customers-revenue");
    if (!data) return;

    const table = document.getElementById("customerTable");
    table.innerHTML = "";

    data.forEach(c => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${c[0]}</td>
            <td>${c[1]}</td>
            <td>${Number(c[2]).toLocaleString()}đ</td>
        `;

        table.appendChild(tr);
    });

    document.getElementById("customerModal").style.display = "block";
}
function closeModal(){
    document.getElementById("customerModal").style.display = "none";
}
document.addEventListener("DOMContentLoaded", function () {

    const userCard = document.querySelector(".users-card");

    if(userCard){
        userCard.onclick = loadAllCustomers;
    }

});
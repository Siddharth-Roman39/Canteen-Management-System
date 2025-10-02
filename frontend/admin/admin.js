// =========================================================
// js/admin.js - CONSOLIDATED JAVASCRIPT (Updated for API)
// =========================================================

// I. SHARED UTILITIES
function showTempMessage(message, type = 'success') {
    const container = document.getElementById('messageContainer');
    if (!container) {
        console.error("Message container not found. Using console only.");
        console.log(`MESSAGE (${type.toUpperCase()}): ${message}`);
        return;
    }
    const alertDiv = document.createElement('div');
    alertDiv.textContent = message;
    alertDiv.style.cssText = `
        padding: 10px 20px; margin-bottom: 15px; border-radius: 4px;
        font-weight: bold; color: white; text-align: center;
        opacity: 0; transition: opacity 0.5s ease;
    `;
    if (type === 'success') alertDiv.style.backgroundColor = '#28a745';
    else if (type === 'error') alertDiv.style.backgroundColor = '#dc3545';
    else alertDiv.style.backgroundColor = '#007bff';

    container.innerHTML = '';
    container.appendChild(alertDiv);
    setTimeout(() => { alertDiv.style.opacity = 1; }, 10);
    setTimeout(() => {
        alertDiv.style.opacity = 0;
        setTimeout(() => { if (container.contains(alertDiv)) container.removeChild(alertDiv); }, 500);
    }, 3000);
}

// II. AUTHENTICATION (JWT)
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        console.log("📥 Login Response:", data); // log full response

        if (data.token && data.role === "admin") {
            localStorage.setItem("token", data.token);

            // ✅ print token to console so you can verify
            console.log("🔑 JWT Token stored:", data.token);

            alert("Admin login successful!");
            window.location.href = "dashboard.html";
        } else {
            showTempMessage("Invalid admin credentials!", "error");
        }
    })
    .catch(err => {
        console.error("🚨 Login error:", err);
        showTempMessage("Login failed. Try again later.", "error");
    });
}

function checkAuth() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.log("⚠️ No JWT token found. Redirecting to login.");
        window.location.href = "../common/login.html";
        return false;
    }

    // ✅ show token in console when checking
    console.log("✅ JWT token found in localStorage:", token);
    return true;
}

function handleLogout() {
    console.log("🗑️ Logging out. Token before removal:", localStorage.getItem("token"));

    localStorage.removeItem("token");

    console.log("✅ Token removed. Current token value:", localStorage.getItem("token"));
    alert("Logged out!");
    window.location.href = "../common/login.html";
}


// III. DASHBOARD & ANALYTICS
function updateDashboardMetrics() {
    fetch("http://localhost:5000/api/admin/stats", {
        headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('todayRevenue').textContent = `₹ ${data.todayRevenue?.toLocaleString('en-IN') || 0}`;
        document.getElementById('todayOrders').textContent = data.todayOrders || 0;
        document.getElementById('pendingPayments').textContent = data.pendingPayments || 0;
        document.getElementById('activeStaff').textContent = data.activeStaff || 0;

        const ordersList = document.getElementById('recentOrdersList');
        if (ordersList && data.recentOrders) {
            ordersList.innerHTML = '';
            data.recentOrders.forEach(order => {
                const statusStyle = order.status === 'Pending'
                    ? 'style="color:red; font-weight:bold;"'
                    : 'style="color:green;"';
                const li = document.createElement('li');
                li.innerHTML = `#${order.id} - ${order.item} (${order.payment}) <span ${statusStyle}>${order.status}</span>`;
                ordersList.appendChild(li);
            });
        }
    })
    .catch(err => console.error("🚨 Dashboard fetch error:", err));
}

function initAnalytics() {
    console.log("Analytics Initialized.");
    // still static charts unless you add API
}

// IV. ANNOUNCEMENTS
function handleCreateNotice(event) {
    event.preventDefault();
    const title = document.getElementById('noticeTitle').value;
    const content = document.getElementById('noticeContent').value;
    const audience = document.getElementById('noticeAudience').value;

    if (!title || !content || !audience) {
        showTempMessage("All fields must be filled.", 'error');
        return;
    }

    console.log(`Notice Created: Title: ${title}, Audience: ${audience}`);
    showTempMessage("Notice successfully posted!");
    document.getElementById('noticeForm').reset();
}

function initAnnouncements() {
    const form = document.getElementById('noticeForm');
    if (form) form.addEventListener('submit', handleCreateNotice);
}

// V. STAFF MANAGEMENT (API version)
function renderStaffTable(staffList) {
    const tbody = document.getElementById('staffTableBody');
    if (!tbody) return;
    tbody.innerHTML = staffList.map(staff => `
        <tr data-id="${staff._id}">
            <td>${staff._id}</td>
            <td>${staff.name}</td>
            <td>${staff.role}</td>
            <td><span style="color:${staff.status === 'Active' ? 'green' : 'red'}; font-weight:bold;">${staff.status || 'Active'}</span></td>
            <td>
                <button class="edit-btn">Edit Role</button>
                <button class="delete-btn">Remove</button>
            </td>
        </tr>
    `).join('');
}

function initStaffManagement() {
    fetch("http://localhost:5000/api/admin/staff", {
        headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
    })
    .then(res => res.json())
    .then(staffList => {
        renderStaffTable(staffList);
        const staffTable = document.getElementById('staffTable');
        if (staffTable) staffTable.addEventListener('click', handleStaffAction);
    })
    .catch(err => console.error("🚨 Staff fetch error:", err));
}

function handleStaffAction(event) {
    const target = event.target;
    if (target.tagName !== 'BUTTON') return;
    const id = target.closest('tr').dataset.id;
    console.log(`Staff action on ID: ${id}`);
}

// VI. GLOBAL INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'login.html') {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) loginForm.addEventListener('submit', handleLogin);
    } else {
        if (checkAuth()) {
            if (currentPage === 'dashboard.html') updateDashboardMetrics();
            else if (currentPage === 'analytics.html') initAnalytics();
            else if (currentPage === 'announcements.html') initAnnouncements();
            else if (currentPage === 'staff.html') initStaffManagement();

            const logoutLink = document.querySelector('.sidebar a[href="../common/login.html"]');
            if (logoutLink) {
                logoutLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    handleLogout();
                });
            }
        }
    }
});

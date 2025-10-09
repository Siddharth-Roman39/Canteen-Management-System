/* |--------------------------------------------------------------------------
 | staff.js - COMPLETE STAFF PORTAL WITH MENU MANAGEMENT
 |--------------------------------------------------------------------------
 */

// STATE & GLOBAL DATA
let activeOrders = [];
let completedOrders = [];
let dashboardStats = {};
let historicalOrders = [];
let reportData = {};
let staffMenuItems = [];

// SHARED UTILITIES
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    const container = document.getElementById('messageContainer');
    if (container) {
        const alertDiv = document.createElement('div');
        alertDiv.textContent = message;
        alertDiv.style.cssText = `
            padding: 10px 20px;
            margin-bottom: 15px;
            border-radius: 4px;
            font-weight: bold;
            color: white;
            text-align: center;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;
        if (type === 'success') alertDiv.style.backgroundColor = '#28a745';
        else if (type === 'error') alertDiv.style.backgroundColor = '#dc3545';
        else alertDiv.style.backgroundColor = '#007bff';

        container.innerHTML = '';
        container.appendChild(alertDiv);

        setTimeout(() => { alertDiv.style.opacity = 1; }, 10);
        setTimeout(() => {
            alertDiv.style.opacity = 0;
            setTimeout(() => {
                if (container.contains(alertDiv)) container.removeChild(alertDiv);
            }, 500);
        }, 3000);
    }
}

function formatCurrency(amount) {
    return amount.toLocaleString('en-IN');
}

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

// JWT AUTHENTICATION
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;

    if (!email || !password) {
        showNotification("Please enter email and password!", "error");
        return;
    }

    fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        console.log("📥 Staff Login Response:", data);
        if (data.token && data.role === "staff") {
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", "staff");
            console.log("🔑 Staff JWT Token stored:", data.token);
            alert("Staff login successful!");
            window.location.href = "dashboard.html";
        } else {
            showNotification("Invalid staff credentials!", "error");
        }
    })
    .catch(err => {
        console.error("🚨 Staff Login error:", err);
        showNotification("Login failed. Try again later.", "error");
    });
}

function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        console.log("⚠️ No Staff JWT token found. Redirecting to login.");
        window.location.href = "../common/login.html";
        return false;
    }
    console.log("✅ Staff JWT token found in localStorage:", token);
    return true;
}

function handleLogoutStaff() {
    console.log('🗑️ Logging out staff...');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    console.log('✅ Token removed.');
    showNotification('Staff logged out successfully!', 'success');
    window.location.href = '../common/login.html';
}

// DASHBOARD LOGIC
async function fetchDashboardData() {
    try {
        const res = await fetch("http://localhost:5000/api/staff/dashboard", {
            method: "GET",
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("📊 Staff Dashboard Data:", data);

        dashboardStats = data.dashboardStats || {};
        activeOrders = data.activeOrders || [];
        completedOrders = data.completedOrders || [];
        historicalOrders = data.historicalOrders || [];
        reportData = data.reportData || {};

        updateStatCounters();
        renderActiveOrders();
        showNotification("Dashboard data loaded successfully!", "success");
    } catch (err) {
        console.error("🚨 Error fetching staff dashboard data:", err);
        showNotification("Failed to load dashboard. Please login again.", "error");
        handleLogoutStaff();
    }
}

function updateStatCounters() {
    const mappings = {
        totalOrders: "totalOrders",
        queueOrders: "queueOrders",
        completedOrders: "completedOrders",
        cancelledOrders: "cancelledOrders"
    };

    Object.keys(mappings).forEach(key => {
        const el = document.getElementById(key);
        if (el) {
            el.innerText = dashboardStats[key] || 0;
            console.log(`📈 Updated ${key}:`, dashboardStats[key] || 0);
        }
    });
}

function renderActiveOrders() {
    const container = document.getElementById("activeOrders");
    if (!container) return;

    container.innerHTML = "";
    activeOrders.forEach(order => {
        const li = document.createElement("li");
        li.className = 'order-list-item active';
        li.innerHTML = `
            #${order.id} – ${order.item}
            <button class="btn-complete" onclick="completeOrder(${order.id})">✓ Complete</button>
        `;
        container.appendChild(li);
    });
}

function initDashboard() {
    fetchDashboardData();
}

// REPORTS
function loadReportData() {
    fetch("http://localhost:5000/api/staff/reports", {
        headers: getAuthHeaders()
    })
    .then(res => res.json())
    .then(data => {
        console.log("📈 Report Data:", data);
        if (data.success) {
            displayReportData(data.reportData);
        }
    })
    .catch(err => console.error("🚨 Report fetch error:", err));
}

function displayReportData(data) {
    const container = document.getElementById('reportContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="report-card">
            <h3>Total Orders</h3>
            <p class="stat-number">${data.totalOrders || 0}</p>
        </div>
        <div class="report-card">
            <h3>Total Revenue</h3>
            <p class="stat-number">₹${formatCurrency(data.totalRevenue || 0)}</p>
        </div>
        <div class="report-card">
            <h3>Average Order Value</h3>
            <p class="stat-number">₹${formatCurrency(data.avgOrderValue || 0)}</p>
        </div>
    `;
}

function initReports() {
    loadReportData();
}

// =====================================================
// MENU STOCK MANAGEMENT - THIS WAS MISSING!
// =====================================================

async function loadStaffMenuItems() {
    console.log("📦 Loading staff menu items...");
    try {
        const res = await fetch("http://localhost:5000/api/staff/menu", {
            method: "GET",
            headers: getAuthHeaders()
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        console.log("📥 Staff Menu Items Response:", data);

        if (data.success && data.data) {
            staffMenuItems = data.data;
            renderStaffMenuGrid(data.data);
            showNotification(`✅ Loaded ${data.data.length} menu items!`, "success");
        } else {
            console.error("❌ No menu items in response");
            showNotification("No menu items found", "error");
        }
    } catch (err) {
        console.error("🚨 Error loading staff menu items:", err);
        showNotification("Failed to load menu items: " + err.message, "error");
    }
}

function renderStaffMenuGrid(items) {
    const container = document.getElementById('stockManagementGrid');
    if (!container) {
        console.error("❌ stockManagementGrid container not found!");
        return;
    }

    if (!items || items.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#666; grid-column: 1/-1;">No menu items available</p>';
        return;
    }

    console.log(`📋 Rendering ${items.length} items...`);

    container.innerHTML = items.map(item => {
        const isInStock = item.availability === 'In Stock';
        const statusClass = isInStock ? 'in-stock' : 'out-of-stock';
        const statusText = isInStock ? 'IN' : 'OUT';
        const toggleClass = isInStock ? 'toggle-on' : 'toggle-off';

        return `
            <div class="stock-card ${statusClass}">
                <h3>${item.itemName}</h3>
                <p class="stock-status">(${item.availability})</p>
                <div class="toggle-container">
                    <button 
                        class="toggle-btn ${toggleClass}" 
                        onclick="toggleItemAvailability('${item._id}')"
                        data-id="${item._id}">
                        <span class="status-badge">${statusText}</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

async function toggleItemAvailability(itemId) {
    const item = staffMenuItems.find(i => i._id === itemId);
    if (!item) {
        console.error("Item not found:", itemId);
        return;
    }

    const newAvailability = item.availability === 'In Stock' ? 'Out of Stock' : 'In Stock';

    console.log(`🔄 Toggling ${item.itemName} from "${item.availability}" to "${newAvailability}"`);

    try {
        const res = await fetch(`http://localhost:5000/api/staff/menu/availability/${itemId}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ availability: newAvailability })
        });

        const data = await res.json();
        console.log("📥 Toggle Response:", data);

        if (data.success) {
            showNotification(`${item.itemName} is now ${newAvailability}! ✅`, "success");
            loadStaffMenuItems();
        } else {
            showNotification(data.message || "Failed to update availability", "error");
        }
    } catch (err) {
        console.error("🚨 Error toggling availability:", err);
        showNotification("Error updating availability: " + err.message, "error");
    }
}

function initStockManagement() {
    console.log("📦 Initializing Stock Management...");
    loadStaffMenuItems();
}

// MAIN INITIALIZER
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Staff portal JavaScript loaded successfully');
    const currentPage = window.location.pathname.split('/').pop();
    console.log('🎯 Staff portal initializing on page:', currentPage);

    if (currentPage === 'login.html') {
        const form = document.getElementById('loginForm');
        if (form) form.addEventListener('submit', handleLogin);
    } else {
        if (checkAuth()) {
            if (currentPage === 'dashboard.html') {
                console.log("📊 Initializing dashboard...");
                initDashboard();
            }
            if (currentPage === 'reports.html') {
                console.log("📈 Initializing reports...");
                initReports();
            }
            if (currentPage === 'outofstock.html') {
                console.log("📦 Calling initStockManagement...");
                initStockManagement();
            }

            const logoutBtn = document.querySelector('.logout-btn, .logout-link');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleLogoutStaff();
                });
            }
        }
    }
});

console.log("✅ staff.js loaded");

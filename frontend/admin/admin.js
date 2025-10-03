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

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
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
        console.log("📥 Login Response:", data);

        if (data.token && data.role === "admin") {
            localStorage.setItem("token", data.token);
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
    console.log("✅ JWT token found in localStorage:", token);
    return true;
}

function handleLogout() {
    console.log("🗑️ Logging out. Token before removal:", localStorage.getItem("token"));
    localStorage.removeItem("token");
    localStorage.removeItem("role");
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

// ============================================
// VI. MENU MANAGEMENT (API Integration)
// ============================================

let currentMenuItems = [];

// Load all menu items for admin
async function loadAdminMenuItems() {
    try {
        const res = await fetch("http://localhost:5000/api/admin/menu", {
            method: "GET",
            headers: getAuthHeaders()
        });
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const data = await res.json();
        console.log("📥 Admin Menu Items:", data);
        
        if (data.success && data.data) {
            currentMenuItems = data.data;
            renderAdminMenuTable(data.data);
            showTempMessage("Menu items loaded successfully!", "success");
        }
    } catch (err) {
        console.error("🚨 Error loading menu items:", err);
        showTempMessage("Failed to load menu items", "error");
    }
}

// Render menu items in admin table
function renderAdminMenuTable(items) {
    const tbody = document.getElementById('menuTableBody');
    if (!tbody) return;
    
    if (!items || items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No menu items found</td></tr>';
        return;
    }
    
    tbody.innerHTML = items.map(item => `
        <tr>
            <td>${item._id.substring(0, 8)}...</td>
            <td>${item.itemName}</td>
            <td>₹ ${item.price}</td>
            <td>${item.category}</td>
            <td>
                <span style="color: ${item.availability === 'In Stock' ? 'green' : 'red'}; font-weight: bold;">
                    ${item.availability}
                </span>
            </td>
            <td>
                <button class="btn btn-primary" onclick="editMenuItem('${item._id}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteMenuItem('${item._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Add new menu item
async function handleAddMenuItem(event) {
    event.preventDefault();
    
    const itemName = document.getElementById('itemName')?.value?.trim();
    const price = document.getElementById('itemPrice')?.value;
    const category = document.getElementById('itemCategory')?.value;
    const description = document.getElementById('itemDescription')?.value?.trim();
    
    if (!itemName || !price || !category) {
        showTempMessage("Please fill out all required fields", "error");
        return;
    }
    
    try {
        const res = await fetch("http://localhost:5000/api/admin/menu/add", {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ itemName, price: parseFloat(price), category, description })
        });
        
        const data = await res.json();
        console.log("📥 Add Menu Item Response:", data);
        
        if (data.success) {
            showTempMessage("Menu item added successfully! ✅", "success");
            document.getElementById('menuItemForm')?.reset();
            loadAdminMenuItems();
        } else {
            showTempMessage(data.message || "Failed to add item", "error");
        }
    } catch (err) {
        console.error("🚨 Error adding menu item:", err);
        showTempMessage("Error adding menu item", "error");
    }
}

// Edit menu item (populate form)
function editMenuItem(id) {
    const item = currentMenuItems.find(item => item._id === id);
    if (!item) return;
    
    document.getElementById('itemName').value = item.itemName;
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemDescription').value = item.description || '';
    
    const form = document.getElementById('menuItemForm');
    form.onsubmit = (e) => handleUpdateMenuItem(e, id);
    
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Update Item';
}

// Update menu item
async function handleUpdateMenuItem(event, id) {
    event.preventDefault();
    
    const itemName = document.getElementById('itemName')?.value?.trim();
    const price = document.getElementById('itemPrice')?.value;
    const category = document.getElementById('itemCategory')?.value;
    const description = document.getElementById('itemDescription')?.value?.trim();
    
    try {
        const res = await fetch(`http://localhost:5000/api/admin/menu/update/${id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ itemName, price: parseFloat(price), category, description })
        });
        
        const data = await res.json();
        
        if (data.success) {
            showTempMessage("Menu item updated successfully! ✅", "success");
            resetMenuForm();
            loadAdminMenuItems();
        } else {
            showTempMessage(data.message || "Failed to update item", "error");
        }
    } catch (err) {
        console.error("🚨 Error updating menu item:", err);
        showTempMessage("Error updating menu item", "error");
    }
}

// Delete menu item
async function deleteMenuItem(id) {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    
    try {
        const res = await fetch(`http://localhost:5000/api/admin/menu/delete/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
        
        const data = await res.json();
        
        if (data.success) {
            showTempMessage("Menu item deleted successfully! ✅", "success");
            loadAdminMenuItems();
        } else {
            showTempMessage(data.message || "Failed to delete item", "error");
        }
    } catch (err) {
        console.error("🚨 Error deleting menu item:", err);
        showTempMessage("Error deleting menu item", "error");
    }
}

// Reset form to add mode
function resetMenuForm() {
    const form = document.getElementById('menuItemForm');
    form?.reset();
    form.onsubmit = handleAddMenuItem;
    
    const submitBtn = form?.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = '+ Add Item';
}

// Initialize menu management page
function initMenuManagement() {
    console.log("📋 Initializing Menu Management...");
    loadAdminMenuItems();
    
    const form = document.getElementById('menuItemForm');
    if (form) {
        form.addEventListener('submit', handleAddMenuItem);
    }
}

// ============================================
// VII. GLOBAL INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ admin.js loaded");
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'login.html') {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) loginForm.addEventListener('submit', handleLogin);
    } else {
        if (checkAuth()) {
            // Initialize page-specific functions
            if (currentPage === 'dashboard.html') updateDashboardMetrics();
            else if (currentPage === 'analytics.html') initAnalytics();
            else if (currentPage === 'announcements.html') initAnnouncements();
            else if (currentPage === 'staff.html') initStaffManagement();
            else if (currentPage === 'menu.html') initMenuManagement(); // ← IMPORTANT!

            // Logout handler
            const logoutBtn = document.querySelector('.logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    handleLogout();
                });
            }
        }
    }
});

// =================================================================================
// I. UTILITY & HELPERS
// =================================================================================

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

// =================================================================================
// II. AUTHENTICATION (JWT)
// =================================================================================

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
            localStorage.setItem("role", "admin");
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
    return true;
}

function handleLogout() {
    console.log("🗑️ Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    alert("Logged out!");
    window.location.href = "../common/login.html";
}

// =================================================================================
// III. DASHBOARD & ANALYTICS
// =================================================================================

function updateDashboardMetrics() {
    fetch("http://localhost:5000/api/admin/stats", {
        headers: getAuthHeaders()
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('todayRevenue').textContent = `₹ ${data.todayRevenue?.toLocaleString('en-IN') || 0}`;
        document.getElementById('todayOrders').textContent = data.todayOrders || 0;
        document.getElementById('pendingPayments').textContent = data.pendingPayments || 0;
        document.getElementById('activeStaff').textContent = data.activeStaff || 0;
    })
    .catch(err => console.error("🚨 Dashboard fetch error:", err));
}

// =================================================================================
// V. MENU MANAGEMENT
// =================================================================================

async function loadMenuItems() {
    try {
        const res = await fetch("http://localhost:5000/api/admin/menu", { 
            headers: getAuthHeaders() 
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        
        const menuItemsObject = await res.json();
        renderMenuTable(menuItemsObject.data); 
        
    } catch (err) {
        console.error("❌ Menu loading error:", err);
        showTempMessage("Unable to load menu: " + err.message, "error");
        const tbody = document.getElementById('menuTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;">Failed to load menu data</td></tr>';
        }
    }
}

function renderMenuTable(menuItems) {
    const tbody = document.getElementById('menuTableBody');
    if (!tbody) {
        console.error("Could not find the menu table body with id='menuTableBody'");
        return;
    }
    
    if (!Array.isArray(menuItems) || menuItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No menu items found. Add one!</td></tr>';
        return;
    }
    
    tbody.innerHTML = menuItems.map(item => {
        const isAvailable = item.availability !== 'Out of Stock'; 

        return `
            <tr data-id="${item._id}">
                <td>${(item._id || '').substring(0, 8)}...</td>
                <td>${item.itemName || 'N/A'}</td>
                <td>₹ ${item.price?.toFixed(2) || '0.00'}</td>
                <td>${item.category || 'Uncategorized'}</td>
                <td>
                    <span style="color:${isAvailable ? 'green' : 'gray'}; font-weight:bold;">
                        ${isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                </td>
                <td>
                    <button class="delete-btn" onclick="deleteMenuItem('${item._id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
    
    console.log(`✅ Rendered ${menuItems.length} menu items`);
}

async function addMenuItem(event) {
    event.preventDefault();
    
    const name = document.getElementById('itemName').value;
    const price = document.getElementById('itemPrice').value;
    const category = document.getElementById('itemCategory').value;
    const description = document.getElementById('itemDescription').value;

    if (!name || !price || !category) {
        showTempMessage("Name, price, and category are required.", "error");
        return;
    }

    try {
        // <<< FIX: URL updated to match backend route /api/admin/menu/add >>>
        const res = await fetch("http://localhost:5000/api/admin/menu/add", {
            method: "POST",
            headers: getAuthHeaders(),
            // <<< FIX: Also sending the description field >>>
            body: JSON.stringify({ itemName: name, price, category, description })
        });
        
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || `HTTP ${res.status}: Failed to add item`);
        }
        
        showTempMessage("Menu item added successfully!");
        document.getElementById('addMenuForm').reset();
        loadMenuItems(); // Reload the list to show the new item
        
    } catch (err) {
        console.error("❌ Add menu item error:", err);
        showTempMessage(err.message, "error");
    }
}

async function deleteMenuItem(id) {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    try {
        // <<< FIX: URL updated to match backend route /api/admin/menu/delete/:id >>>
        const res = await fetch(`http://localhost:5000/api/admin/menu/delete/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to delete item');

        showTempMessage("Item deleted successfully!");
        loadMenuItems(); // Refresh the list
    } catch (err) {
        console.error("❌ Delete menu item error:", err);
        showTempMessage(err.message, "error");
    }
}

// =================================================================================
// VI. STAFF MANAGEMENT
// =================================================================================

async function loadStaffList() {
    try {
        console.log("🔄 Loading staff list...");
        const res = await fetch("http://localhost:5000/api/admin/staff", { 
            headers: getAuthHeaders() 
        });
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log("📋 Staff data received:", data);
        
        const staffList = data.data || data.staff || data || [];
        renderStaffTable(staffList);
        
    } catch (err) {
        console.error("❌ Staff loading error:", err);
        showTempMessage("Unable to load staff: " + err.message, "error");
        
        const tbody = document.getElementById('staffTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;">Failed to load staff data</td></tr>';
        }
    }
}

function renderStaffTable(staffList) {
    const tbody = document.getElementById('staffTableBody');
    if (!tbody) {
        console.warn("Staff table body not found");
        return;
    }
    
    if (!Array.isArray(staffList) || staffList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No staff members found</td></tr>';
        return;
    }
    
    tbody.innerHTML = staffList.map(staff => `
        <tr data-id="${staff._id || staff.id}">
            <td>${(staff._id || staff.id || '').substring(0,8)}</td>
            <td>${staff.name || 'N/A'}</td>
            <td>${staff.email || 'N/A'}</td>
            <td><span style="color:${staff.role === 'admin' ? 'red' : 'blue'}; font-weight:bold;">${staff.role || 'staff'}</span></td>
            <td>${staff.subrole || 'Other'}</td>
            <td><span style="color:${staff.status === 'Active' ? 'green' : 'red'}; font-weight:bold;">${staff.status || 'Active'}</span></td>
            <td>
                <button onclick="openEditStaff('${staff._id || staff.id}')">Edit</button>
                <button onclick="deleteStaff('${staff._id || staff.id}')">Remove</button>
            </td>
        </tr>
    `).join('');
    
    console.log(`✅ Rendered ${staffList.length} staff members`);
}

async function addStaff(event) {
    event.preventDefault();
    
    const name = document.getElementById('staffName').value.trim();
    const email = document.getElementById('staffEmail').value.trim();
    const password = document.getElementById('staffPassword').value;
    const role = document.getElementById('staffRole').value;
    const subrole = document.getElementById('staffSubrole')?.value.trim() || "Other";

    if (!name || !email || !password || !role) {
        showTempMessage("All required fields must be filled.", "error");
        return;
    }

    if (password.length < 6) {
        showTempMessage("Password must be at least 6 characters long.", "error");
        return;
    }

    if (!['admin', 'staff'].includes(role)) {
        showTempMessage("Role must be either 'admin' or 'staff'.", "error");
        return;
    }

    console.log("📤 Adding staff:", { name, email, role, subrole });

    try {
        const res = await fetch("http://localhost:5000/api/admin/staff", {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, email, password, role, subrole, status: 'Active' })
        });
        
        const data = await res.json();
        console.log("📥 Add staff response:", data);
        
        if (!res.ok) {
            throw new Error(data.message || `HTTP ${res.status}: Failed to add staff`);
        }
        
        showTempMessage("Staff member added successfully!");
        document.getElementById('addStaffForm').reset();
        
        setTimeout(() => {
            window.location.href = 'staff.html';
        }, 1500);
        
    } catch (err) {
        console.error("❌ Add staff error:", err);
        showTempMessage(err.message, "error");
    }
}

async function deleteStaff(id) {
    if (!confirm("Remove this staff member? This action cannot be undone.")) return;
    
    try {
        const res = await fetch(`http://localhost:5000/api/admin/staff/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to delete staff');
        
        showTempMessage("Staff member removed successfully!");
        loadStaffList();
        
    } catch (err) {
        console.error("❌ Delete staff error:", err);
        showTempMessage(err.message, "error");
    }
}

function openEditStaff(id) {
    const newRole = prompt("Enter new role (admin/staff):");
    if (!newRole || !['admin', 'staff'].includes(newRole.toLowerCase())) {
        showTempMessage("Invalid role. Must be 'admin' or 'staff'.", "error");
        return;
    }
    
    const newSubrole = prompt("Enter new subrole (Chef, Waiter, Manager, etc.):");
    if (!newSubrole) return;
    
    updateStaff(id, { role: newRole.toLowerCase(), subrole: newSubrole });
}

async function updateStaff(id, body) {
    try {
        const res = await fetch(`http://localhost:5000/api/admin/staff/${id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(body)
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update staff');
        
        showTempMessage("Staff member updated successfully!");
        loadStaffList();
        
    } catch (err) {
        console.error("❌ Update staff error:", err);
        showTempMessage(err.message, "error");
    }
}

// =================================================================================
// VII. STUDENT MANAGEMENT
// =================================================================================

async function loadStudents() {
    try {
        console.log("🔄 Loading students...");
        const res = await fetch("http://localhost:5000/api/admin/students", { 
            headers: getAuthHeaders() 
        });
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log("📋 Students data received:", data);
        
        const students = data.data || data.students || data || [];
        renderStudentsTable(students);
        
    } catch (err) {
        console.error("❌ Students loading error:", err);
        showTempMessage("Unable to load students: " + err.message, "error");
        
        const tbody = document.getElementById("studentsTableBody");
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red;">Failed to load student data</td></tr>';
        }
    }
}

function renderStudentsTable(students) {
    const tbody = document.getElementById("studentsTableBody");
    if (!tbody) {
        console.warn("Students table body not found");
        return;
    }
    
    if (!Array.isArray(students) || students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No students found</td></tr>';
        return;
    }
    
    tbody.innerHTML = students.map(s => `
        <tr data-id="${s._id || s.id}">
            <td>${(s._id || s.id || '').substring(0,8)}</td>
            <td>${s.name || 'N/A'}</td>
            <td>${s.email || 'N/A'}</td>
            <td>₹ ${s.balance || 0}</td>
            <td>
                <span style="color:${s.isBanned ? 'red' : 'green'}; font-weight:bold;">
                    ${s.isBanned ? 'BANNED' : 'Active'}
                </span>
            </td>
            <td>
                <button onclick="toggleBan('${s._id || s.id}', ${s.isBanned || false})">${s.isBanned ? 'Unban' : 'Ban'}</button>
                <button onclick="deleteStudent('${s._id || s.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
    
    console.log(`✅ Rendered ${students.length} students`);
}

async function toggleBan(id, currentlyBanned) {
    const action = currentlyBanned ? "Unban" : "Ban";
    if (!confirm(`${action} this student?`)) return;
    
    try {
        const res = await fetch(`http://localhost:5000/api/admin/students/${id}/ban`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ ban: !currentlyBanned })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `Failed to ${action.toLowerCase()} student`);
        
        showTempMessage(`Student ${action.toLowerCase()}ned successfully!`);
        loadStudents();
        
    } catch (err) {
        console.error(`❌ ${action} student error:`, err);
        showTempMessage(err.message, "error");
    }
}

async function deleteStudent(id) {
    if (!confirm("Delete this student permanently? This action cannot be undone.")) return;
    
    try {
        const res = await fetch(`http://localhost:5000/api/admin/students/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to delete student');
        
        showTempMessage("Student deleted successfully!");
        loadStudents();
        
    } catch (err) {
        console.error("❌ Delete student error:", err);
        showTempMessage(err.message, "error");
    }
}

// =================================================================================
// VIII. INIT (Page Loader)
// =================================================================================

document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    console.log("🚀 Initializing page:", currentPage);

    if (currentPage === 'login.html') {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) loginForm.addEventListener('submit', handleLogin);
    } else {
        if (checkAuth()) {
            if (currentPage === 'dashboard.html') {
                updateDashboardMetrics();
            }
            else if (currentPage === 'menu.html') {
                loadMenuItems();
                const addMenuForm = document.getElementById('addMenuForm');
                if (addMenuForm) {
                    addMenuForm.addEventListener('submit', addMenuItem);
                }
            }
            // Add your other page initializations here (staff.html, etc.)

            const logoutBtn = document.querySelector('.logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => { 
                    e.preventDefault(); 
                    handleLogout(); 
                });
            }
        }
    }
});
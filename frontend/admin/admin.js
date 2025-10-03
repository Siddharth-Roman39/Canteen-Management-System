
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

// III. DASHBOARD & ANALYTICS
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

// V. STAFF MANAGEMENT - Updated for Staff Schema
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
        
        // Handle different response formats
        const staffList = data.data || data.staff || data || [];
        renderStaffTable(staffList);
        
    } catch (err) {
        console.error("❌ Staff loading error:", err);
        showTempMessage("Unable to load staff: " + err.message, "error");
        
        // Show empty table with error message
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
    
    // Get all form values according to Staff schema
    const name = document.getElementById('staffName').value.trim();
    const email = document.getElementById('staffEmail').value.trim();
    const password = document.getElementById('staffPassword').value;
    const role = document.getElementById('staffRole').value; // admin or staff
    const subrole = document.getElementById('staffSubrole')?.value.trim() || "Other";

    // Validation
    if (!name || !email || !password || !role) {
        showTempMessage("All required fields must be filled.", "error");
        return;
    }

    if (password.length < 6) {
        showTempMessage("Password must be at least 6 characters long.", "error");
        return;
    }

    // Validate role (must be admin or staff)
    if (!['admin', 'staff'].includes(role)) {
        showTempMessage("Role must be either 'admin' or 'staff'.", "error");
        return;
    }

    console.log("📤 Adding staff:", { name, email, role, subrole });

    try {
        const res = await fetch("http://localhost:5000/api/admin/staff", {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ 
                name, 
                email, 
                password, 
                role, 
                subrole,
                status: 'Active'
            })
        });
        
        const data = await res.json();
        console.log("📥 Add staff response:", data);
        
        if (!res.ok) {
            throw new Error(data.message || `HTTP ${res.status}: Failed to add staff`);
        }
        
        showTempMessage("Staff member added successfully!");
        document.getElementById('addStaffForm').reset();
        
        // Redirect back to staff list after successful addition
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

// VI. STUDENT MANAGEMENT (if needed)
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

// VII. INIT
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
            else if (currentPage === 'analytics.html') {
                initAnalytics();
            }
            else if (currentPage === 'announcements.html') {
                initAnnouncements();
            }
            else if (currentPage === 'staff.html') {
                console.log("📋 Initializing staff management page");
                loadStaffList();
                loadStudents(); // Load students if needed
                
                const addStaffForm = document.getElementById('addStaffForm');
                if (addStaffForm) {
                    addStaffForm.addEventListener('submit', addStaff);
                }
            }
            else if (currentPage === 'addstaff.html') {
                console.log("➕ Initializing add staff page");
                const addStaffForm = document.getElementById('addStaffForm');
                if (addStaffForm) {
                    addStaffForm.addEventListener('submit', addStaff);
                }
            }
            else if (currentPage === 'students.html') {
                loadStudents();
            }

            // Setup logout button
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
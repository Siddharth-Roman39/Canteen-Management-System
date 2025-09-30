// =========================================================
// js/admin.js - CONSOLIDATED JAVASCRIPT
// Handles Auth, Navigation, and Page-Specific Initialization
// (This is your original file with only syntax errors corrected)
// =========================================================

// =================================
// I. SHARED UTILITIES
// =================================

/**
 * Custom function to display a temporary message in a dedicated container.
 * @param {string} message - The message text.
 * @param {string} type - 'success', 'error', or 'info'.
 */
function showTempMessage(message, type = 'success') {
    const container = document.getElementById('messageContainer');
    if (!container) {
        console.error("Message container not found. Using console only.");
        // SYNTAX FIX: Added backticks (`) for template literal
        console.log(`MESSAGE (${type.toUpperCase()}): ${message}`);
        return;
    }

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

    if (type === 'success') {
        alertDiv.style.backgroundColor = '#28a745'; // Green
    } else if (type === 'error') {
        alertDiv.style.backgroundColor = '#dc3545'; // Red
    } else {
        alertDiv.style.backgroundColor = '#007bff'; // Blue
    }

    container.innerHTML = ''; // Clear previous message
    container.appendChild(alertDiv);

    // Fade in
    setTimeout(() => {
        alertDiv.style.opacity = 1;
    }, 10);

    // Fade out and remove after 3 seconds
    setTimeout(() => {
        alertDiv.style.opacity = 0;
        setTimeout(() => {
            // Check if the element is still a child before trying to remove it
            if (container.contains(alertDiv)) {
                container.removeChild(alertDiv);
            }
        }, 500);
    }, 3000);
}

/**
 * Checks if the admin is logged in. If not, redirects to the login page.
 * @returns {boolean} True if logged in, false otherwise.
 */
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isAdminLoggedIn');
    const currentPage = window.location.pathname.split('/').pop();
    
    if (isLoggedIn !== 'true') {
        // Only redirect if we are not already on the login page
        if (currentPage !== 'index.html' && currentPage !== '') {
            console.log("Not authenticated. Redirecting to login.");
            window.location.href = "index.html";
            return false;
        }
    }
    return isLoggedIn === 'true';
}

// Function to handle logout
function handleLogout() {
    sessionStorage.removeItem('isAdminLoggedIn');
    console.log("Logged out.");
    window.location.href = "index.html";
}


// =================================
// II. AUTHENTICATION LOGIC (for index.html)
// =================================

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // --- Mock Authentication Logic ---
    // User credentials: admin@cms.com / admin123
    if (email === "admin@cms.com" && password === "admin123") {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        console.log("Login Successful! Redirecting...");
        window.location.href = "dashboard.html";
    } else {
        showTempMessage("Invalid credentials. Please use admin@cms.com and admin123.", 'error');
    }
}


// =================================
// III. DASHBOARD & ANALYTICS LOGIC 
// =================================

function updateDashboardMetrics() {
    // --- MOCK DATA ---
    const metrics = {
        todayRevenue: 15450,
        todayOrders: 124,
        pendingPayments: 3,
        activeStaff: 8
    };

    const recentOrders = [
        { id: 153, item: 'Veg Thali', status: 'Paid', payment: '₹ 250' },
        { id: 152, item: 'Sandwich', status: 'Pending', payment: '₹ 120' },
        { id: 151, item: 'Cold Coffee', status: 'Paid', payment: '₹ 80' },
        { id: 150, item: 'Chicken Roll', status: 'Paid', payment: '₹ 180' }
    ];
    // -----------------

    // Update stat cards
    // SYNTAX FIX: Added backticks (`) and moved currency symbol inside
    document.getElementById('todayRevenue').textContent = `₹ ${metrics.todayRevenue.toLocaleString('en-IN')}`;
    document.getElementById('todayOrders').textContent = metrics.todayOrders;
    document.getElementById('pendingPayments').textContent = metrics.pendingPayments;
    document.getElementById('activeStaff').textContent = metrics.activeStaff;

    // Render Recent Orders List
    const ordersList = document.getElementById('recentOrdersList');
    if (ordersList) {
        ordersList.innerHTML = '';
        recentOrders.forEach(order => {
            const statusStyle = order.status === 'Pending' ? 'style="color:red; font-weight:bold;"' : 'style="color:green;"';
            const li = document.createElement('li');
            // SYNTAX FIX: Added backticks (`) for template literal
            li.innerHTML = `#${order.id} - ${order.item} (${order.payment}) <span ${statusStyle}>${order.status}</span>`;
            ordersList.appendChild(li);
        });
    }
}

// NOTE: Chart.js is assumed to be loaded for initAnalytics to work.
function initAnalytics() {
    console.log("Analytics Initialized.");
    const ctxBar = document.getElementById('salesChart');
    const ctxLine = document.getElementById('revenueChart');

    // MOCK DATA for Chart.js
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const salesData = [520, 480, 410, 600, 750, 450, 300];
    const revenueData = [12000, 11500, 9800, 14500, 18000, 10500, 7500];

    // Ensure Chart is available (as it would be loaded via a script tag in analytics.html)
    if (typeof Chart !== 'undefined') {
        if (ctxBar) {
            new Chart(ctxBar, { type: 'bar', data: { labels: labels, datasets: [{ label: 'Units Sold', data: salesData, backgroundColor: 'rgba(63, 81, 181, 0.7)', borderColor: 'rgba(63, 81, 181, 1)', borderWidth: 1 }] }, options: { responsive: true, scales: { y: { beginAtZero: true } } } });
        }
        if (ctxLine) {
            new Chart(ctxLine, { type: 'line', data: { labels: labels, datasets: [{ label: 'Daily Revenue (₹)', data: revenueData, borderColor: 'rgba(255, 152, 0, 1)', backgroundColor: 'rgba(255, 152, 0, 0.2)', fill: true, tension: 0.3 }] }, options: { responsive: true, scales: { y: { beginAtZero: false } } } });
        }
    } else {
        console.warn("Chart.js not loaded. Analytics charts will not display.");
    }
}


// =================================
// IV. ANNOUNCEMENTS LOGIC
// =================================

function handleCreateNotice(event) {
    event.preventDefault();
    const title = document.getElementById('noticeTitle').value;
    const content = document.getElementById('noticeContent').value;
    const audience = document.getElementById('noticeAudience').value;

    if (!title || !content || !audience) {
        showTempMessage("All fields must be filled.", 'error');
        return;
    }

    // --- Mock Data Submission ---
    // SYNTAX FIX: Added backticks (`) for template literal
    console.log(`Notice Created: Title: ${title}, Audience: ${audience}`);
    showTempMessage("Notice successfully posted!");

    // Reset form
    document.getElementById('noticeForm').reset();
}

function initAnnouncements() {
    console.log("Announcements Initialized.");
    const form = document.getElementById('noticeForm');
    if (form) {
        form.addEventListener('submit', handleCreateNotice);
    }
}

// =================================
// V. STAFF MANAGEMENT LOGIC (for staff.html and add-staff.html)
// =================================

// --- MOCK DATA ---
const mockStaffData = [
    { id: 'S001', name: 'Priya Sharma', role: 'Manager', status: 'Active' },
    { id: 'S002', name: 'Ravi Kumar', role: 'Chef', status: 'Active' },
    { id: 'S003', name: 'Anjali Desai', role: 'Cashier', status: 'Active' },
    { id: 'S004', name: 'Vikram Singh', role: 'Waiter', status: 'On Leave' }
];

const mockStudentData = [
    { id: '1001', name: 'Amit Singh', email: 'amit@college.edu', balance: 550 },
    { id: '1002', name: 'Neha Patel', email: 'neha@college.edu', balance: 120 },
    { id: '1003', name: 'Karan Joshi', email: 'karan@college.edu', balance: -50, status: 'Suspended' } // Negative balance example
];

// Action Handlers (Stubs)
function handleEditRole(staffId) {
    // SYNTAX FIX: Added backticks (`) for template literal
    console.log(`Editing role for staff ID: ${staffId}`);
    // SYNTAX FIX: Added backticks (`) for template literal
    showTempMessage(`Action: Ready to edit role for ${staffId}`, 'info');
}

function handleRemoveStaff(staffId) {
    // SYNTAX FIX: Added backticks (`) for template literal
    console.log(`Removing staff ID: ${staffId}`);
    // SYNTAX FIX: Added backticks (`) for template literal
    showTempMessage(`Action: Staff member ${staffId} removed (mock action)`, 'error');
}

function handleResetPass(studentId) {
    // SYNTAX FIX: Added backticks (`) for template literal
    console.log(`Resetting password for student ID: ${studentId}`);
    // SYNTAX FIX: Added backticks (`) for template literal
    showTempMessage(`Action: Password reset initiated for ${studentId}`, 'success');
}

function handleSuspendStudent(studentId) {
    // SYNTAX FIX: Added backticks (`) for template literal
    console.log(`Suspending student ID: ${studentId}`);
    // SYNTAX FIX: Added backticks (`) for template literal
    showTempMessage(`Action: Student ${studentId} suspended (mock action)`, 'error');
}

function handleStaffAction(event) {
    const target = event.target;
    if (target.tagName !== 'BUTTON') return;

    const id = target.closest('tr').dataset.id;
    const action = target.textContent.trim();
    
    const isStudentTable = target.closest('table').id === 'studentTable';

    if (isStudentTable) {
        switch (action) {
            case 'Reset Pass':
                handleResetPass(id);
                break;
            case 'Suspend':
                handleSuspendStudent(id);
                break;
            default:
                // SYNTAX FIX: Added backticks (`) for template literal
                console.warn(`Unknown student action: ${action}`);
        }
    } else {
        switch (action) {
            case 'Edit Role':
                handleEditRole(id);
                break;
            case 'Remove':
                handleRemoveStaff(id);
                break;
            default:
                // SYNTAX FIX: Added backticks (`) for template literal
                console.warn(`Unknown staff action: ${action}`);
        }
    }
}

function renderStaffTable() {
    const tbody = document.getElementById('staffTableBody');
    if (!tbody) return;

    tbody.innerHTML = mockStaffData.map(staff => `
        <tr data-id="${staff.id}">
            <td>${staff.id}</td>
            <td>${staff.name}</td>
            <td>${staff.role}</td>
            <td><span style="color:${staff.status === 'Active' ? 'green' : 'red'}; font-weight:bold;">${staff.status}</span></td>
            <td>
                <button class="edit-btn">Edit Role</button>
                <button class="delete-btn">Remove</button>
            </td>
        </tr>
    `).join('');
}

function renderStudentTable() {
    const tbody = document.getElementById('studentTableBody');
    if (!tbody) return;

    tbody.innerHTML = mockStudentData.map(student => `
        <tr data-id="${student.id}">
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td><span style="color:${student.balance < 0 ? 'red' : 'green'}; font-weight:bold;">₹ ${student.balance}</span></td>
            <td>
                <button class="edit-btn">Reset Pass</button>
                <button class="delete-btn">Suspend</button>
            </td>
        </tr>
    `).join('');
}

function initStaffManagement() {
    console.log("Staff Management Initialized.");
    
    // 1. Render data
    renderStaffTable();
    renderStudentTable();

    // 2. Attach click listeners using event delegation to the table wrappers
    const staffTable = document.getElementById('staffTable');
    const studentTable = document.getElementById('studentTable');

    if (staffTable) {
        staffTable.addEventListener('click', handleStaffAction);
    }
    if (studentTable) {
        studentTable.addEventListener('click', handleStaffAction);
    }
}

function initAddStaffPage() {
    console.log("Add Staff Page Initialized.");
    const form = document.getElementById('addStaffForm');
    if (form) {
        form.addEventListener('submit', handleAddStaff);
    }
}

function handleAddStaff(event) {
    event.preventDefault();
    const name = document.getElementById('staffName').value;
    const email = document.getElementById('staffEmail').value;
    const role = document.getElementById('staffRole').value;

    if (!name || !email || !role) {
        showTempMessage("All fields must be filled.", 'error');
        return;
    }

    // --- Mock Staff Creation ---
    // SYNTAX FIX: Added backticks (`) for template literal
    console.log(`New Staff Created: Name: ${name}, Email: ${email}, Role: ${role}`);
    // SYNTAX FIX: Added backticks (`) for template literal
    showTempMessage(`Staff member '${name}' added successfully!`, 'success');
    
    // Reset form
    document.getElementById('addStaffForm').reset();
}


// =================================
// VI. GLOBAL INITIALIZATION
// =================================

document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'index.html' || currentPage === '') {
        // 1. Login Page Initialization
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
    } else {
        // 2. Authenticate all other Admin Pages
        if (checkAuth()) { 
            // 3. Initialize specific page functions
            if (currentPage === 'dashboard.html') {
                updateDashboardMetrics();
            } else if (currentPage === 'menu.html') {
                // initMenuManagement(); // Placeholder
            } else if (currentPage === 'reports.html') {
                // initReports(); // Placeholder
            } else if (currentPage === 'analytics.html') {
                initAnalytics();
            } else if (currentPage === 'announcements.html') {
                initAnnouncements();
            } else if (currentPage === 'staff.html') {
                initStaffManagement();
            } else if (currentPage === 'add-staff.html') {
                initAddStaffPage();
            }

            // 4. Attach logout handler to the sidebar logout link
            const logoutLink = document.querySelector('.sidebar a[href="index.html"]');
            if (logoutLink) {
                logoutLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    handleLogout();
                });
            }
        }
    }
});
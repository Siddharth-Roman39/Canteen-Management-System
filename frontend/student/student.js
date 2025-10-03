/* |--------------------------------------------------------------------------
 | student.js - COMPLETE STUDENT PORTAL WITH MENU VIEWING
 |-------------------------------------------------------------------------- */

// SHARED UTILITIES
function showTempMessage(message, type = 'success') {
    const container = document.getElementById('messageContainer');
    if (!container) {
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

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// AUTHENTICATION (JWT)
function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('name')?.value?.trim();
    const email = document.getElementById('email')?.value?.trim();
    const password = document.getElementById('password')?.value;

    if (!name || !email || !password) {
        showTempMessage('All fields are required', 'error');
        return;
    }

    console.log('📝 Attempting student signup...');

    fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    })
    .then(res => res.json())
    .then(data => {
        console.log('📥 Signup Response:', data);
        if (data.token && (data.role === 'student' || !data.role)) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', 'student');
            console.log('🔑 Token saved:', data.token);
            showTempMessage('Student registered & logged in!', 'success');
            window.location.href = 'dashboard.html';
        } else {
            showTempMessage('Signup failed', 'error');
        }
    })
    .catch(err => {
        console.error('🚨 Signup error:', err);
        showTempMessage('Signup error. Try again later.', 'error');
    });
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email')?.value?.trim();
    const password = document.getElementById('password')?.value;

    if (!email || !password) {
        showTempMessage('Please enter email and password', 'error');
        return;
    }

    console.log('🔐 Attempting student login...');

    fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        console.log('📥 Login Response:', data);
        if (data.token && data.role === 'student') {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            console.log('✅ STUDENT LOGIN SUCCESSFUL');
            showTempMessage('Student login successful!', 'success');
            window.location.href = 'dashboard.html';
        } else {
            console.error('❌ Student login failed: wrong role or no token');
            showTempMessage('Invalid student credentials!', 'error');
        }
    })
    .catch(err => {
        console.error('🚨 Login error:', err);
        showTempMessage('Login error. Try again later.', 'error');
    });
}

function checkAuth(roleRequired = 'student') {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== roleRequired) {
        console.log('⚠️ Unauthorized! Redirecting to login.');
        window.location.href = '../common/login.html';
        return false;
    }

    console.log('✅ JWT present for role:', role);
    return true;
}

function handleLogout() {
    console.log('🗑️ Logging out student...');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    showTempMessage('Logged out successfully!', 'success');
    window.location.href = '../common/login.html';
}

// DASHBOARD
async function fetchStudentDashboard() {
    try {
        const res = await fetch("http://localhost:5000/api/student/dashboard", {
            headers: getAuthHeaders()
        });
        const data = await res.json();
        console.log("📊 Student Dashboard Data:", data);

        if (data.success) {
            const { totalOrders, completedOrders, liveOrders } = data;

            document.getElementById('totalOrders').textContent = totalOrders || 0;
            document.getElementById('completedOrders').textContent = completedOrders || 0;
            document.getElementById('pendingOrders').textContent = liveOrders?.length || 0;
        }
    } catch (err) {
        console.error("🚨 Dashboard fetch error:", err);
        showTempMessage("Failed to load dashboard", "error");
    }
}

// =====================================================
// STUDENT MENU VIEWING - FIXED VERSION
// =====================================================

let studentMenuItems = [];
let currentCategory = 'All';

async function loadStudentMenu(category = 'All', searchQuery = '') {
    console.log(`📋 Loading student menu... Category: ${category}, Search: "${searchQuery}"`);
    try {
        let url = "http://localhost:5000/api/student/menu?";
        if (category !== 'All') url += `category=${encodeURIComponent(category)}&`;
        if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}`;

        console.log("🌐 Fetching from URL:", url);

        const res = await fetch(url, {
            method: "GET",
            headers: getAuthHeaders()
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        console.log("📥 Student Menu Items Response:", data);

        if (data.success && data.data) {
            studentMenuItems = data.data;
            renderStudentMenuItems(data.data);
            showTempMessage(`✅ Found ${data.data.length} available items!`, "success");
        } else {
            console.error("❌ No menu items in response");
            renderStudentMenuItems([]);
        }
    } catch (err) {
        console.error("🚨 Error loading student menu:", err);
        showTempMessage("Failed to load menu items: " + err.message, "error");
    }
}

function renderStudentMenuItems(items) {
    const menuContainer = document.getElementById('menuContainer');
    if (!menuContainer) {
        console.error("❌ menuContainer not found!");
        return;
    }

    if (!items || items.length === 0) {
        menuContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#666; grid-column: 1/-1;">No items available</p>';
        return;
    }

    console.log(`🍽️ Rendering ${items.length} menu items...`);

    menuContainer.innerHTML = '';

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.innerHTML = `
            <div class="card-header">
                <span class="available-badge">Available</span>
            </div>
            <h3>${item.itemName}</h3>
            <p class="item-description">${item.description || 'A delicious item from our canteen.'}</p>
            <div class="card-footer">
                <span class="price">₹${item.price}</span>
                <button 
                    class="order-btn" 
                    onclick="orderItem('${item._id}', '${item.itemName}', ${item.price})">
                    Order Now
                </button>
            </div>
        `;
        menuContainer.appendChild(card);
    });
}

function filterByCategory(category) {
    console.log("🔍 Filtering by category:", category);
    currentCategory = category;

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-category') === category) {
            btn.classList.add('active');
        }
    });

    const searchInput = document.getElementById('searchInput');
    loadStudentMenu(category, searchInput ? searchInput.value : '');
}

function searchMenu() {
    const searchQuery = document.getElementById('searchInput')?.value || '';
    console.log("🔍 Searching for:", searchQuery);
    loadStudentMenu(currentCategory, searchQuery);
}

function orderItem(itemId, itemName, price) {
    console.log(`🛒 Adding to cart: ${itemName} (₹${price})`);
    showTempMessage(`Added ${itemName} to cart! 🎉`, 'success');
}

function loadMenuPage() {
    console.log("📋 Loading Student Menu Page...");
    loadStudentMenu('All', '');

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            filterByCategory(this.getAttribute('data-category'));
        });
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', searchMenu);
    }
}

// GLOBAL INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Student frontend scripts loaded successfully.');
    const currentPage = window.location.pathname.split('/').pop();
    console.log('🎯 Student portal initializing on page:', currentPage);

    if (currentPage === 'login.html') {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        if (loginForm) loginForm.addEventListener('submit', handleLogin);
        if (signupForm) signupForm.addEventListener('submit', handleSignup);
    } else {
        if (checkAuth('student')) {
            if (currentPage === 'dashboard.html') {
                console.log("📊 Initializing dashboard...");
                fetchStudentDashboard();
            }
            if (currentPage === 'menu.html') {
                console.log("🍽️ Calling loadMenuPage...");
                loadMenuPage();
            }

            const logoutBtns = document.querySelectorAll('.logout-link, .logout-btn, .sidebar a[href="../common/login.html"]');
            logoutBtns.forEach(btn => btn.addEventListener('click', (e) => {
                e.preventDefault();
                handleLogout();
            }));
        }
    }
});

console.log('✅ student.js loaded');

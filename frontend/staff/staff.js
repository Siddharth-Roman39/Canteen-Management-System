/*
|--------------------------------------------------------------------------
| staff.js - CONSOLIDATED JAVASCRIPT FOR STAFF PORTAL (JWT-API VERSION)
|--------------------------------------------------------------------------
| This file contains all client-side logic for the CMS staff portal.
| Now fully integrated with backend API, JWT, and DB data.
| Updated to match admin.js authentication pattern.
*/

// ========================================================
// 1. STATE & GLOBAL DATA
// ========================================================
let activeOrders = [];
let completedOrders = [];
let dashboardStats = {};
let historicalOrders = [];
let reportData = {};

// ========================================================
// 2. SHARED UTILITIES
// ========================================================
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Optional: Add visual notification similar to admin.js
    const container = document.getElementById('messageContainer');
    if (container) {
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
}

function formatCurrency(amount) {
    return amount.toLocaleString('en-IN');
}

function getAuthHeaders() {
    const token = localStorage.getItem("token"); // ✅ Using same key as admin
    return { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
    };
}

// ========================================================
// 3. JWT AUTHENTICATION (Updated to match admin.js pattern)
// ========================================================
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
        console.log("📥 Staff Login Response:", data); // ✅ Log full response

        if (data.token && data.role === "staff") {
            localStorage.setItem("token", data.token); // ✅ Using same key as admin

            // ✅ Print token to console so you can verify
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
    const token = localStorage.getItem("token"); // ✅ Using same key as admin

    if (!token) {
        console.log("⚠️ No Staff JWT token found. Redirecting to login.");
        window.location.href = "../common/login.html";
        return false;
    }

    // ✅ Show token in console when checking
    console.log("✅ Staff JWT token found in localStorage:", token);
    return true;
}
function handleLogoutStaff() {
  console.log('🗑️ Logging out staff...');

  // Remove token and role
  localStorage.removeItem('token');
  localStorage.removeItem('role');

  // Confirm removal
  const tokenAfter = localStorage.getItem('token');
  const roleAfter = localStorage.getItem('role');
  console.log('✅ Token removed. Current token:', tokenAfter); // should log null
  console.log('✅ Role removed. Current role:', roleAfter);     // should log null

  // Show message
  showNotification('Staff logged out successfully!', 'success');

  // Redirect to login page
  window.location.href = '../common/login.html';
}


// ========================================================
// 4. DASHBOARD LOGIC (Updated with proper error handling)
// ========================================================
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
        console.log("📊 Staff Dashboard Data:", data); // ✅ Log dashboard data
        
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

function removeOrderFromQueueDOM(id) {
    const queueList = document.querySelector("#liveQueueOrders");
    if (!queueList) return;

    const listItem = Array.from(queueList.children).find(li => li.innerText.includes(`#${id}`));
    if (listItem) {
        queueList.removeChild(listItem);
        console.log(`🗑️ Removed order #${id} from queue DOM`);
    }
}

async function acceptOrder(id, item) {
    try {
        const res = await fetch(`http://localhost:5000/api/staff/orders/${id}/accept`, {
            method: "POST",
            headers: getAuthHeaders()
        });
        
        if (res.ok) {
            activeOrders.push({ id, item, time: 0 });
            dashboardStats.queueOrders--;
            updateStatCounters();
            removeOrderFromQueueDOM(id);
            renderActiveOrders();
            showNotification(`Order #${id} Accepted ✅`, "success");
            console.log(`✅ Order #${id} accepted successfully`);
        } else {
            throw new Error(`Failed to accept order: ${res.status}`);
        }
    } catch (err) {
        console.error("🚨 Accept order error:", err);
        showNotification(`Failed to accept order #${id}`, "error");
    }
}

async function rejectOrder(id) {
    try {
        const res = await fetch(`http://localhost:5000/api/staff/orders/${id}/reject`, {
            method: "POST",
            headers: getAuthHeaders()
        });
        
        if (res.ok) {
            dashboardStats.cancelledOrders++;
            dashboardStats.queueOrders--;
            updateStatCounters();
            removeOrderFromQueueDOM(id);
            showNotification(`Order #${id} Rejected ❌`, "success");
            console.log(`❌ Order #${id} rejected successfully`);
        } else {
            throw new Error(`Failed to reject order: ${res.status}`);
        }
    } catch (err) {
        console.error("🚨 Reject order error:", err);
        showNotification(`Failed to reject order #${id}`, "error");
    }
}

async function completeOrder(id) {
    try {
        const res = await fetch(`http://localhost:5000/api/staff/orders/${id}/complete`, {
            method: "POST",
            headers: getAuthHeaders()
        });
        
        if (res.ok) {
            const index = activeOrders.findIndex(o => o.id === id);
            if (index > -1) {
                completedOrders.push(activeOrders[index]);
                activeOrders.splice(index, 1);
                dashboardStats.completedOrders++;
                updateStatCounters();
                renderActiveOrders();
                showNotification(`Order #${id} Completed! 🎉`, "success");
                console.log(`🎉 Order #${id} completed successfully`);
            }
        } else {
            throw new Error(`Failed to complete order: ${res.status}`);
        }
    } catch (err) {
        console.error("🚨 Complete order error:", err);
        showNotification(`Failed to complete order #${id}`, "error");
    }
}

function renderActiveOrders() {
    const container = document.getElementById("activeOrders");
    if (!container) return;

    container.innerHTML = "";
    activeOrders.forEach(order => {
        const li = document.createElement("li");
        li.className = 'order-list-item active';
        li.innerHTML = `
            <span>#${order.id} – ${order.item}</span>
            <div>
                <span class="timer" id="timer-${order.id}">00:00</span>
                <button class="btn btn-success" onclick="completeOrder(${order.id})">✔ Done</button>
            </div>
        `;
        container.appendChild(li);
    });
    
    console.log(`📋 Rendered ${activeOrders.length} active orders`);
}

// Timer for active orders
setInterval(() => {
    activeOrders.forEach(order => {
        order.time++;
        const timerEl = document.getElementById("timer-" + order.id);
        if (timerEl) {
            const mins = String(Math.floor(order.time / 60)).padStart(2, '0');
            const secs = String(order.time % 60).padStart(2, '0');
            timerEl.innerText = `${mins}:${secs}`;
        }
    });
}, 1000);

// ========================================================
// 5. REPORTS LOGIC (Updated with better error handling)
// ========================================================
function updateSalesReport() {
    try {
        const now = new Date();
        const oneDayMs = 24 * 60 * 60 * 1000;

        const dailyOrders = historicalOrders.filter(o => new Date(o.timestamp).getTime() >= now.getTime() - oneDayMs);
        const weeklyOrders = historicalOrders.filter(o => new Date(o.timestamp).getTime() >= now.getTime() - 7 * oneDayMs);
        const monthlyOrders = historicalOrders.filter(o => new Date(o.timestamp).getTime() >= now.getTime() - 30 * oneDayMs);

        const calcTotals = orders => ({
            orders: orders.length,
            revenue: orders.reduce((sum, o) => sum + (o.price || 0), 0)
        });

        const dailyStats = calcTotals(dailyOrders);
        const weeklyStats = calcTotals(weeklyOrders);
        const monthlyStats = calcTotals(monthlyOrders);

        const mapping = [
            { el: '.orders-today', value: dailyStats.orders },
            { el: '.revenue-today', value: `₹${formatCurrency(dailyStats.revenue)}` },
            { el: '.orders-week', value: weeklyStats.orders },
            { el: '.revenue-week', value: `₹${formatCurrency(weeklyStats.revenue)}` },
            { el: '.orders-month', value: monthlyStats.orders },
            { el: '.revenue-month', value: `₹${formatCurrency(monthlyStats.revenue)}` }
        ];

        mapping.forEach(m => {
            const el = document.querySelector(m.el);
            if (el) {
                el.textContent = m.value + (m.el.includes('revenue') ? ' Revenue' : ' Orders');
            }
        });
        
        console.log("📊 Sales report updated:", { dailyStats, weeklyStats, monthlyStats });
    } catch (err) {
        console.error("🚨 Error updating sales report:", err);
        showNotification("Failed to update sales report", "error");
    }
}

function renderFeedback() {
    try {
        const ratingEl = document.querySelector(".feedback-card .rating");
        if (ratingEl) {
            const rating = reportData.rating || 0;
            const totalReviews = reportData.totalReviews || 0;
            ratingEl.innerHTML = `⭐ ${rating} / 5 <span>(${totalReviews} Reviews)</span>`;
            console.log("⭐ Feedback rendered:", { rating, totalReviews });
        }
    } catch (err) {
        console.error("🚨 Error rendering feedback:", err);
    }
}

function renderComments() {
    try {
        const commentsList = document.querySelector(".comments-list");
        if (!commentsList) return;
        
        commentsList.innerHTML = "";
        (reportData.comments || []).forEach(c => {
            const li = document.createElement("li");
            li.textContent = `${c.emoji || ''} "${c.text}" – ${c.user}`;
            commentsList.appendChild(li);
        });
        
        console.log(`💬 Rendered ${reportData.comments?.length || 0} comments`);
    } catch (err) {
        console.error("🚨 Error rendering comments:", err);
    }
}

function renderInsights() {
    try {
        const insightsList = document.querySelector(".insights-card ul");
        if (!insightsList) return;

        insightsList.innerHTML = "";
        
        (reportData.insights?.strengths || []).forEach(str => {
            const li = document.createElement("li");
            li.textContent = str;
            li.classList.add('strength');
            insightsList.appendChild(li);
        });

        (reportData.insights?.improvements || []).forEach(imp => {
            const li = document.createElement("li");
            li.textContent = imp;
            li.classList.add('improvement');
            insightsList.appendChild(li);
        });
        
        console.log("💡 Insights rendered:", reportData.insights);
    } catch (err) {
        console.error("🚨 Error rendering insights:", err);
    }
}

// ========================================================
// 6. STOCK LOGIC
// ========================================================
function toggleStock(el) {
    try {
        el.classList.toggle('active');
        const itemName = el.parentElement.querySelector('.stock-name').innerText;
        const status = el.classList.contains('active') ? 'IN STOCK' : 'OUT OF STOCK';
        showNotification(`${itemName} is now ${status}`, "success");
        console.log(`📦 Stock updated: ${itemName} - ${status}`);
    } catch (err) {
        console.error("🚨 Error toggling stock:", err);
        showNotification("Failed to update stock status", "error");
    }
}

// ========================================================
// 7. INITIALIZATION (Updated to match admin.js pattern)
// ========================================================
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    console.log("🚀 Staff portal initializing on page:", currentPage);

    if (currentPage === 'login.html') {
        // Login page
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
            console.log("🔐 Staff login form initialized");
        }
    } else {
        // Protected pages - check authentication first
        if (checkAuth()) {
            console.log("✅ Staff authentication verified");
            
            // Initialize based on current page
            if (currentPage === 'dashboard.html') {
                console.log("📊 Initializing staff dashboard");
                fetchDashboardData();
            } else if (currentPage === 'reports.html') {
                console.log("📈 Initializing staff reports");
                // Load reports data first, then render
                fetchDashboardData().then(() => {
                    updateSalesReport();
                    renderFeedback();
                    renderComments();
                    renderInsights();
                });
            } else if (currentPage === 'stock.html') {
                console.log("📦 Initializing stock management");
                // Initialize stock management if needed
            }

            // Setup logout functionality (matches admin.js pattern)
            const logoutLink = document.querySelector('.sidebar a[href="../common/login.html"]');
            if (logoutLink) {
                logoutLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    handleLogoutStaff();
                });
                console.log("🚪 Staff logout link initialized");
            }
            
            // Alternative logout button selectors
            const logoutLinks = document.querySelectorAll('.logout-link, .logout-btn');
            logoutLinks.forEach(link => {
                link.addEventListener('click', e => {
                    e.preventDefault();
                    handleLogoutStaff();
                });
            });
            
            if (logoutLinks.length > 0) {
                console.log(`🚪 ${logoutLinks.length} additional logout links initialized`);
            }
            
        } else {
            console.log("❌ Staff authentication failed - redirecting to login");
        }
    }
});

// ========================================================
// 8. ADDITIONAL HELPER FUNCTIONS
// ========================================================

// Function to refresh authentication token if needed
function refreshAuthIfNeeded() {
    const token = localStorage.getItem("token");
    if (token) {
        // Decode JWT to check expiration (basic implementation)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Date.now() / 1000;
            
            if (payload.exp && payload.exp < now) {
                console.log("⚠️ Staff token expired, logging out");
                handleLogoutStaff();
                return false;
            }
        } catch (err) {
            console.error("🚨 Error checking token expiration:", err);
        }
    }
    return true;
}

// Periodic token check (optional)
setInterval(refreshAuthIfNeeded, 60000); // Check every minute

console.log("✅ Staff portal JavaScript loaded successfully");
/*
|--------------------------------------------------------------------------
| Staff Portal Logic (Corrected & Refactored)
|--------------------------------------------------------------------------
| This file contains all the client-side logic for the CMS staff portal.
| It has been corrected to fix bugs and restructured for better readability.
|
*/

// ========================================================
// 1. STATE & GLOBAL DATA
// ========================================================

// In-memory state for the dashboard. NOTE: This will reset on page reload.
let activeOrders = [];
let completedOrders = [];

// State for the dashboard's quick stat counters.
let dashboardStats = {
    totalOrders: 45,
    queueOrders: 8,
    completedOrders: 30,
    cancelledOrders: 7
};

// Simulated historical data for the reports page.
const historicalOrders = [
    // Today's orders
    { id: 105, item: 'Fries', price: 60, timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) }, 
    { id: 106, item: 'Veg Burger', price: 150, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) }, 
    { id: 107, item: 'Chicken Roll', price: 180, timestamp: new Date(Date.now() - 30 * 60 * 1000) }, 
    { id: 108, item: 'Juice', price: 50, timestamp: new Date(Date.now() - 15 * 60 * 1000) }, 
    
    // Yesterday and Older
    { id: 104, item: 'Sandwich', price: 120, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { id: 103, item: 'Cold Coffee', price: 75, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { id: 102, item: 'Pizza Slice', price: 90, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { id: 101, item: 'Veg Burger', price: 150, timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
    
    // Monthly context
    { id: 109, item: 'Salad', price: 110, timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
    { id: 110, item: 'Pasta', price: 200, timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
];

// Simulated feedback data for the reports page.
const reportData = {
    rating: 4.2,
    totalReviews: 120,
    comments: [
        { text: "Pizza was fresh and tasty!", user: "Rahul", emoji: "🍕" },
        { text: "Sandwich could use more filling.", user: "Priya", emoji: "🥪" },
        { text: "Burger was hot and quick delivery!", user: "Amit", emoji: "🍔" },
        { text: "Paneer curry was excellent!", user: "Neha", emoji: "🥘" }
    ],
    insights: {
        strengths: ["Fast service during peak hours", "Wide vegetarian options"],
        improvements: ["Better packaging for takeaways", "More cold drink options"]
    }
};


// ========================================================
// 2. SHARED UTILITY FUNCTIONS
// ========================================================

function showNotification(message) {
    console.log("NOTIFICATION:", message);
    // In a real app, replace this with a toast notification library.
}

function formatCurrency(amount) {
    return amount.toLocaleString('en-IN');
}

function login(event) {
    event.preventDefault();
    window.location.href = "dashboard.html";
}


// ========================================================
// 3. DASHBOARD-SPECIFIC LOGIC
// ========================================================

function updateStatCounters() {
    const totalEl = document.getElementById("totalOrders");
    if (totalEl) totalEl.innerText = dashboardStats.totalOrders;

    const queueEl = document.getElementById("queueOrders");
    if (queueEl) queueEl.innerText = dashboardStats.queueOrders;

    const completedEl = document.getElementById("completedOrders");
    if (completedEl) completedEl.innerText = dashboardStats.completedOrders;

    const cancelledEl = document.getElementById("cancelledOrders");
    if (cancelledEl) cancelledEl.innerText = dashboardStats.cancelledOrders;
}

function removeOrderFromQueueDOM(id) {
    const queueList = document.querySelector("#liveQueueOrders");
    if (!queueList) return;
    
    // *** SYNTAX FIX APPLIED HERE ***
    const listItemToRemove = Array.from(queueList.children).find(li => 
        li.innerText.includes(`#${id}`)
    );

    if (listItemToRemove) {
        queueList.removeChild(listItemToRemove);
    }
}

function acceptOrder(id, item) {
    const order = { id, item, time: 0 };
    activeOrders.push(order);
    
    dashboardStats.queueOrders--;
    updateStatCounters();
    
    removeOrderFromQueueDOM(id);
    renderActiveOrders();
    showNotification(`Order #${id} Accepted ✅`);
}

function rejectOrder(id) {
    dashboardStats.cancelledOrders++;
    dashboardStats.queueOrders--;
    updateStatCounters();
    
    removeOrderFromQueueDOM(id);
    showNotification(`Order #${id} Rejected ❌. Cancelled count incremented.`);
}

function completeOrder(id) {
    const index = activeOrders.findIndex(o => o.id === id);
    if (index > -1) {
        completedOrders.push(activeOrders[index]);
        activeOrders.splice(index, 1);
        
        dashboardStats.completedOrders++;
        updateStatCounters();

        renderActiveOrders();
        showNotification(`Order #${id} Completed!`);
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
}

// Timer update for Active Orders
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
// 4. REPORTS-SPECIFIC LOGIC
// ========================================================

function updateSalesReport() {
    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const sevenDaysMs = 7 * oneDayMs;
    const thirtyDaysMs = 30 * oneDayMs;

    const dailyOrders = historicalOrders.filter(o => o.timestamp.getTime() >= (now.getTime() - oneDayMs));
    const weeklyOrders = historicalOrders.filter(o => o.timestamp.getTime() >= (now.getTime() - sevenDaysMs));
    const monthlyOrders = historicalOrders.filter(o => o.timestamp.getTime() >= (now.getTime() - thirtyDaysMs));

    const calculateTotals = (orders) => ({
        orders: orders.length,
        revenue: orders.reduce((sum, order) => sum + order.price, 0)
    });

    const dailyStats = calculateTotals(dailyOrders);
    const weeklyStats = calculateTotals(weeklyOrders);
    const monthlyStats = calculateTotals(monthlyOrders);

    // Day
    const ordersTodayEl = document.querySelector('.orders-today');
    if(ordersTodayEl) ordersTodayEl.textContent = `${dailyStats.orders} Orders`;
    const revenueTodayEl = document.querySelector('.revenue-today');
    if(revenueTodayEl) revenueTodayEl.textContent = `₹${formatCurrency(dailyStats.revenue)} Revenue`;

    // Week
    const ordersWeekEl = document.querySelector('.orders-week');
    if(ordersWeekEl) ordersWeekEl.textContent = `${weeklyStats.orders} Orders`;
    const revenueWeekEl = document.querySelector('.revenue-week');
    if(revenueWeekEl) revenueWeekEl.textContent = `₹${formatCurrency(weeklyStats.revenue)} Revenue`;

    // Month
    const ordersMonthEl = document.querySelector('.orders-month');
    if(ordersMonthEl) ordersMonthEl.textContent = `${monthlyStats.orders} Orders`;
    const revenueMonthEl = document.querySelector('.revenue-month');
    if(revenueMonthEl) revenueMonthEl.textContent = `₹${formatCurrency(monthlyStats.revenue)} Revenue`;
}

function renderFeedback() {
    const ratingElement = document.querySelector(".feedback-card .rating");
    if (ratingElement) {
        ratingElement.innerHTML = `⭐ ${reportData.rating} / 5 <span>(${reportData.totalReviews} Reviews)</span>`;
    }
}

function renderComments() {
    const commentsList = document.querySelector(".comments-list");
    if (!commentsList) return; 

    commentsList.innerHTML = "";
    reportData.comments.forEach(c => {
        const li = document.createElement("li");
        li.textContent = `${c.emoji} "${c.text}" – ${c.user}`;
        commentsList.appendChild(li);
    });
}

function renderInsights() {
    const insightsList = document.querySelector(".insights-card ul");
    if (!insightsList) return;

    insightsList.innerHTML = "";
    reportData.insights.strengths.forEach(str => {
        const li = document.createElement("li");
        li.textContent = ` ${str}`;
        li.classList.add('strength');
        insightsList.appendChild(li);
    });
    reportData.insights.improvements.forEach(imp => {
        const li = document.createElement("li");
        li.textContent = ` ${imp}`;
        li.classList.add('improvement');
        insightsList.appendChild(li);
    });
}


// ========================================================
// 5. STOCK-SPECIFIC LOGIC
// ========================================================

// *** DUPLICATE FUNCTION REMOVED - THIS IS THE CORRECT ONE ***
function toggleStock(el) {
    el.classList.toggle('active');
    const itemName = el.parentElement.querySelector('.stock-name').innerText;
    const status = el.classList.contains('active') ? 'IN STOCK' : 'OUT OF STOCK';
    showNotification(`${itemName} is now ${status}`);
}


// ========================================================
// 6. INITIALIZATION
// ========================================================

// *** CONSOLIDATED EVENT LISTENER ***
document.addEventListener('DOMContentLoaded', function() {
    
    // --- Run functions for the DASHBOARD page ---
    if (document.getElementById('dashboard-main')) {
        updateStatCounters();
        renderActiveOrders();
    }
    
    // --- Run functions for the REPORTS page ---
    if (document.getElementById('reports-main')) {
        updateSalesReport();
        renderFeedback();
        renderComments();
        renderInsights();
    }

    // Note: The Stock page doesn't need any initial JS to run,
    // as `toggleStock` is called directly via `onclick` in the HTML.
});
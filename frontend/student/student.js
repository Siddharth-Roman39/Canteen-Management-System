/*
|--------------------------------------------------------------------------
| student.js - CONSOLIDATED JAVASCRIPT FOR STUDENT PORTAL (JWT-API VERSION)
|--------------------------------------------------------------------------
| Client-side logic for the CMS student portal.
| Matches the style/pattern of admin.js and updated staff.js:
| - Uses localStorage key "token" (and stores "role")
| - Prints JWT token on successful login/signup
| - Removes token on logout and redirects to login
| - Protects pages via checkAuth() and role check
*/

// =========================================================
// I. SHARED UTILITIES
// =========================================================
function showTempMessage(message, type = 'success') {
  const container = document.getElementById('messageContainer');
  if (!container) {
    console.log(`MESSAGE (${type.toUpperCase()}): ${message}`);
    return;
  }
  const alertDiv = document.createElement('div');
  alertDiv.textContent = message;
  alertDiv.style.cssText = `
    padding: 10px 20px; margin-bottom: 15px; border-radius: 4px;
    font-weight: bold; color: white; text-align: center;
    opacity: 0; transition: opacity 0.5s ease;`;
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
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
}

// =========================================================
// II. AUTHENTICATION (JWT)
// =========================================================
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
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  })
  .then(res => res.json())
  .then(data => {
    console.log('📥 Signup Response:', data);
    if (data.token && (data.role === 'student' || !data.role)) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', 'student');
      console.log('🔑 Token saved:', data.token);
      console.log('👤 Registered as:', email, '| Role: student');
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
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    console.log('📥 Login Response:', data);
    if (data.token && data.role === 'student') {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      console.log('✅ STUDENT LOGIN SUCCESSFUL');
      console.log('🔑 Token saved in localStorage:', localStorage.getItem('token'));
      console.log('👤 Logged in as:', data.email, '| Role:', data.role);
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
  console.log('✅ JWT present for role:', role, '| Token:', token);
  return true;
}

function handleLogout() {
  console.log('🗑️ Logging out student...');
  
  // Remove token and role
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  
  // Confirm removal
  const tokenAfter = localStorage.getItem('token');
  const roleAfter = localStorage.getItem('role');
  console.log('✅ Token removed. Current token:', tokenAfter); // should log null
  console.log('✅ Role removed. Current role:', roleAfter);     // should log null

  // Show message
  showTempMessage('Logged out successfully!', 'success');

  // Redirect to login page
  window.location.href = '../common/login.html';
}


// =========================================================
// III. DASHBOARD
// =========================================================
function renderLiveQueue(liveOrders) {
  const orderQueueContainer = document.getElementById('order-queue');
  if (!orderQueueContainer) return;
  orderQueueContainer.innerHTML = '';
  liveOrders.forEach(order => {
    const li = document.createElement('li');
    li.className = 'flex items-center';
    let statusColorClass = '', pulseAnimation = '';
    switch (order.status) {
      case 'Preparing': statusColorClass = 'bg-yellow-400'; pulseAnimation = 'animate-pulse'; break;
      case 'Ready for pickup': statusColorClass = 'bg-green-500'; break;
      case 'Accepted': statusColorClass = 'bg-blue-500'; break;
      default: statusColorClass = 'bg-gray-400';
    }
    li.innerHTML = `
      <span class="${statusColorClass} ${pulseAnimation} w-2 h-2 rounded-full mr-3"></span>
      <div>
        <p class="text-sm font-semibold">Order ${order.id}</p>
        <p class="text-xs text-gray-500">${order.status}</p>
      </div>`;
    orderQueueContainer.appendChild(li);
  });
}

async function fetchStudentDashboard() {
  const token = localStorage.getItem('token');
  console.log('📤 Fetching student dashboard with token:', token);
  if (!token) { window.location.href = '../common/login.html'; return; }
  try {
    const res = await fetch('http://localhost:5000/api/student/dashboard', { headers: getAuthHeaders() });
    console.log('📡 Dashboard API Response Status:', res.status);
    if (!res.ok) throw new Error('Not authorized');
    const data = await res.json();
    console.log('📊 Student Dashboard Data:', data);
    // Render live queue if provided, else render sample for UX
    if (Array.isArray(data.liveOrders)) {
      renderLiveQueue(data.liveOrders);
    } else {
      renderLiveQueue([
        { id: '#7891', status: 'Preparing' },
        { id: '#7890', status: 'Ready for pickup' },
        { id: '#7889', status: 'Accepted' },
        { id: '#7888', status: 'Preparing' }
      ]);
    }
    // Mount raw JSON to a debug area if present
    const debug = document.getElementById('student-data');
    if (debug) debug.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    console.error('🚨 Dashboard fetch error:', err);
    alert('Not authorized!');
    window.location.href = '../common/login.html';
  }
}

// =========================================================
// IV. MENU PAGE
// =========================================================
function renderMenuGrid(menuItems) {
  const menuGridContainer = document.getElementById('menu-grid');
  if (!menuGridContainer) return;
  menuGridContainer.innerHTML = '';
  menuItems.forEach(item => {
    const card = document.createElement('div');
    const statusColor = item.status === 'Available' ? 'bg-green-500' : 'bg-red-500';
    const buttonText = item.status === 'Available' ? 'Order Now' : 'Unavailable';
    const buttonClass = item.status === 'Available' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed';
    card.className = 'bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col';
    card.innerHTML = `
      <div class="relative">
        <img src="${item.image}" alt="${item.name}" class="w-full h-40 object-cover">
        <span class="absolute top-3 right-3 text-white text-xs font-semibold px-3 py-1 rounded-full ${statusColor}">${item.status}</span>
      </div>
      <div class="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 class="font-bold text-lg">${item.name}</h3>
          <p class="text-gray-500 text-sm mb-4">A delicious item from our canteen.</p>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-2xl font-bold text-blue-600">₹${item.price}</span>
          <a href="item-details.html" class="text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors transform hover:scale-105 ${buttonClass}">${buttonText}</a>
        </div>
      </div>`;
    menuGridContainer.appendChild(card);
  });
}

function loadMenuPage() {
  // Static sample; replace with API when available
  const sampleMenu = [
    { name: 'Samosa (2 pcs)', price: 25, image: 'https://placehold.co/400x250/f0ad4e/ffffff?text=Samosa', status: 'Available' },
    { name: 'Veg Thali', price: 90, image: 'https://placehold.co/400x250/28a745/ffffff?text=Thali', status: 'Available' },
    { name: 'Masala Dosa', price: 50, image: 'https://placehold.co/400x250/d9534f/ffffff?text=Dosa', status: 'Available' },
    { name: 'Chole Bhature', price: 70, image: 'https://placehold.co/400x250/5bc0de/ffffff?text=Chole+Bhature', status: 'Unavailable' },
    { name: 'Veg Noodles', price: 60, image: 'https://placehold.co/400x250/9c27b0/ffffff?text=Noodles', status: 'Available' },
    { name: 'Masala Chai', price: 15, image: 'https://placehold.co/400x250/6c757d/ffffff?text=Chai', status: 'Available' }
  ];
  renderMenuGrid(sampleMenu);
}

// =========================================================
// V. GLOBAL INITIALIZATION (Matches admin.js style)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('Student frontend scripts loaded successfully.');
  const currentPage = window.location.pathname.split('/').pop();

  if (currentPage === 'login.html') {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (signupForm) signupForm.addEventListener('submit', handleSignup);
  } else {
    if (checkAuth('student')) {
      if (currentPage === 'dashboard.html') fetchStudentDashboard();
      if (currentPage === 'menu.html') loadMenuPage();

      const logoutLink = document.querySelector('.sidebar a[href="../common/login.html"]');
      if (logoutLink) logoutLink.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
      const logoutBtns = document.querySelectorAll('.logout-link, .logout-btn');
      logoutBtns.forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); }));
    }
  }
});

// =========================================================
// VI. OPTIONAL: TOKEN EXPIRY CHECK
// =========================================================
function checkTokenExpiry() {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    if (payload?.exp && payload.exp < now) {
      console.log('⚠️ Token expired. Logging out...');
      handleLogout();
    }
  } catch (e) {
    console.warn('Could not decode token payload');
  }
}
setInterval(checkTokenExpiry, 60000); // every 1 minute

console.log('✅ student.js loaded');

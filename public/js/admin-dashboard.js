// ==================== ADMIN DASHBOARD JS ====================

console.log("✅ Admin Dashboard JS loaded");

// Check if user is authenticated
function checkAuth() {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    console.log("No admin token, redirecting to login");
    window.location.href = '/admin-login.html';
    return false;
  }
  return true;
}

// Run auth check on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log("Dashboard loaded");
  checkAuth();
  initializeDashboard();
});

function initializeDashboard() {
  // Add click handlers to all buttons

  // Module Cards
  document.querySelectorAll('.module-card').forEach(card => {
    card.addEventListener('click', function(e) {
      if (e.target.tagName !== 'BUTTON') {
        const btn = card.querySelector('.module-btn');
        if (btn) btn.click();
      }
    });
  });

  // Sidebar navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', handleNavClick);
  });

  // Topbar links
  document.querySelectorAll('.topbar-link').forEach(link => {
    link.addEventListener('click', handleTopbarClick);
  });

  // Avatar (Logout)
  document.querySelector('.avatar').addEventListener('click', handleLogout);
}

function initializeDashboard() {

  // Module Cards Click (SAFE)
  document.querySelectorAll('.module-card').forEach(card => {
    card.addEventListener('click', function(e) {
      if (e.target.tagName !== 'BUTTON') {
        const btn = card.querySelector('.module-btn');
        if (btn) btn.click();
      }
    });
  });

  // Sidebar navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', handleNavClick);
  });

  // Topbar links
  document.querySelectorAll('.topbar-link').forEach(link => {
    link.addEventListener('click', handleTopbarClick);
  });

  // Avatar (Logout)
  const avatar = document.querySelector('.avatar');
  if (avatar) {
    avatar.addEventListener('click', handleLogout);
  }
}
function handleNavClick(e) {
  const item = e.currentTarget;
  const text = item.textContent.trim().toLowerCase();

  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  item.classList.add('active');

  if (text.includes('dashboard')) {
    navigateTo('/admin/admin-dashboard.html');
  } 
  else if (text.includes('orders')) {
    navigateTo('/admin/manage-orders.html');
  } 
  else if (text.includes('drivers')) {
    navigateTo('/admin/drivers.html');
  } 
  else if (text.includes('customers')) {
    navigateTo('/admin/customers.html');
  } 
  else if (text.includes('inventory')) {
    navigateTo('/admin/inventory.html');
  } 
  else if (text.includes('fleet')) {
    navigateTo('/admin/fleet.html');
  } 
  else if (text.includes('payments')) {
    navigateTo('/admin/payments.html');
  } 
  else if (text.includes('pricing')) {
    navigateTo('/admin/pricing.html');
  } 
  else if (text.includes('reports')) {
    navigateTo('/admin/reports.html');
  } 
  else if (text.includes('settings')) {
    navigateTo('/admin/settings.html');
  }
}

function handleTopbarClick(e) {
  const link = e.currentTarget;
  const text = link.textContent.trim().toLowerCase();

  console.log("Topbar link clicked:", text);

  // Remove active from all links
  document.querySelectorAll('.topbar-link').forEach(l => l.classList.remove('active'));
  
  // Add active to clicked link
  link.classList.add('active');
}

function handleLogout(e) {
  e.preventDefault();
  const confirmed = confirm('Are you sure you want to logout?');
  
  if (confirmed) {
    // Clear localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    console.log("Admin logged out");
    window.location.href = '/admin-login.html';
  }
}

function navigateTo(page) {
  console.log("Navigating to:", page);
  window.location.href = page;
}

function showNotification(message, type = 'success') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    border-radius: 8px;
    font-weight: 500;
    z-index: 10000;
    animation: slideIn 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);

console.log("✅ Dashboard functionality initialized");
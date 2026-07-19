// Global Variables
let allCustomers = [];
let filteredCustomers = [];
let currentPage = 1;
const itemsPerPage = 10;
let editingId = null;
const API_URL = '/api/customers';
const AUTH_TOKEN = localStorage.getItem('adminToken');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  loadCustomers();
});

// Check Authentication
function checkAuth() {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = '/admin-login.html';
    return false;
  }
  return true;
}

// Load Customers
async function loadCustomers() {
  try {
    const response = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin-login.html';
      return;
    }

    const result = await response.json();
    allCustomers = result.data || [];
    filteredCustomers = [...allCustomers];
    renderTable();
    setupPagination();
  } catch (error) {
    showNotification('Error loading customers: ' + error.message, 'error');
  }
}

// Render Table
function renderTable() {
  const tbody = document.getElementById('tableBody');
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageData = filteredCustomers.slice(start, end);

  if (pageData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty-state">No customers found</td></tr>';
    return;
  }

  tbody.innerHTML = pageData.map(customer => `
    <tr>
      <td><strong>${customer.name}</strong></td>
      <td>${customer.phone}</td>
      <td>${customer.email || '-'}</td>
      <td>${customer.city || '-'}</td>
      <td>${customer.tankCapacity || 0}L</td>
      <td>${customer.totalOrders || 0}</td>
      <td>₹${(customer.totalSpent || 0).toLocaleString()}</td>
      <td><span class="badge badge-${customer.status}">${customer.status}</span></td>
      <td>
        <button class="action-btn action-view" onclick="viewCustomer('${customer._id}')"><i class="fas fa-eye"></i></button>
        <button class="action-btn action-edit" onclick="editCustomer('${customer._id}')"><i class="fas fa-edit"></i></button>
        <button class="action-btn action-delete" onclick="deleteCustomer('${customer._id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

// Setup Pagination
function setupPagination() {
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginationDiv = document.getElementById('pagination');
  
  if (totalPages <= 1) {
    paginationDiv.innerHTML = '';
    return;
  }

  let paginationHtml = '<button class="pagination-btn" onclick="previousPage()" ' + (currentPage === 1 ? 'disabled' : '') + '><i class="fas fa-chevron-left"></i></button>';
  
  for (let i = 1; i <= Math.min(totalPages, 5); i++) {
    paginationHtml += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }
  
  if (totalPages > 5) {
    paginationHtml += '<span>...</span>';
    paginationHtml += `<button class="pagination-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
  }
  
  paginationHtml += '<button class="pagination-btn" onclick="nextPage()" ' + (currentPage === totalPages ? 'disabled' : '') + '><i class="fas fa-chevron-right"></i></button>';
  
  paginationDiv.innerHTML = paginationHtml;
}

// Pagination Functions
function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
    setupPagination();
  }
}

function nextPage() {
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTable();
    setupPagination();
  }
}

function goToPage(page) {
  currentPage = page;
  renderTable();
  setupPagination();
}

// Filter Table
function filterTable() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const status = document.getElementById('statusFilter').value;

  filteredCustomers = allCustomers.filter(customer => {
    const matchSearch = !search || 
                       customer.name.toLowerCase().includes(search) ||
                       customer.phone.includes(search) ||
                       (customer.city && customer.city.toLowerCase().includes(search));
    const matchStatus = !status || customer.status === status;
    return matchSearch && matchStatus;
  });

  currentPage = 1;
  renderTable();
  setupPagination();
}

// Reset Filters
function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('statusFilter').value = '';
  filteredCustomers = [...allCustomers];
  currentPage = 1;
  renderTable();
  setupPagination();
}

// Open Add Modal
function openAddModal() {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Add Customer';
  document.getElementById('name').value = '';
  document.getElementById('phone').value = '';
  document.getElementById('email').value = '';
  document.getElementById('city').value = '';
  document.getElementById('capacity').value = '';
  document.getElementById('status').value = 'active';
  document.getElementById('modal').classList.add('active');
}

// Edit Customer
function editCustomer(id) {
  const customer = allCustomers.find(c => c._id === id);
  if (!customer) return;

  editingId = id;
  document.getElementById('modalTitle').textContent = 'Edit Customer';
  document.getElementById('name').value = customer.name;
  document.getElementById('phone').value = customer.phone;
  document.getElementById('email').value = customer.email || '';
  document.getElementById('city').value = customer.city || '';
  document.getElementById('capacity').value = customer.tankCapacity || '';
  document.getElementById('status').value = customer.status;
  document.getElementById('modal').classList.add('active');
}

// View Customer
function viewCustomer(id) {
  const customer = allCustomers.find(c => c._id === id);
  if (!customer) return;

  const details = `
    Name: ${customer.name}
    Phone: ${customer.phone}
    Email: ${customer.email || 'N/A'}
    City: ${customer.city || 'N/A'}
    Tank Capacity: ${customer.tankCapacity}L
    Total Orders: ${customer.totalOrders || 0}
    Total Spent: ₹${(customer.totalSpent || 0).toLocaleString()}
    Status: ${customer.status}
  `;
  alert(details);
}

// Close Modal
function closeModal() {
  document.getElementById('modal').classList.remove('active');
  editingId = null;
}

// Save Customer
async function saveCustomer(event) {
  if (event) {
    event.preventDefault();
  }

  const nameVal = document.getElementById('name').value.trim();
  const phoneVal = document.getElementById('phone').value.trim();
  const emailVal = document.getElementById('email').value.trim();
  const cityVal = document.getElementById('city').value.trim();
  const capacityVal = document.getElementById('capacity').value;
  const statusVal = document.getElementById('status').value;

  if (!nameVal || !phoneVal || !capacityVal || !statusVal) {
    showNotification('❌ Please fill all required fields (Name, Phone, Tank Capacity, Status)', 'error');
    return;
  }

  const formData = {
    name: nameVal,
    phone: phoneVal,
    email: emailVal || '',
    city: cityVal || '',
    tankCapacity: Number(capacityVal),
    status: statusVal
  };

  try {
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;
    const method = editingId ? 'PUT' : 'POST';

    console.log('Saving customer:', formData);
    console.log('URL:', url);
    console.log('Method:', method);

    const response = await fetch(url, {
      method: method,
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    console.log('Response status:', response.status);

    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin-login.html';
      return;
    }

    const result = await response.json();
    console.log('Response:', result);

    if (result.success) {
      showNotification('✅ ' + (editingId ? 'Customer updated!' : 'Customer added!'), 'success');
      closeModal();
      loadCustomers();
    } else {
      showNotification('❌ ' + (result.message || 'Error saving customer'), 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showNotification('❌ Error: ' + error.message, 'error');
  }
}

// Delete Customer
async function deleteCustomer(id) {
  if (!confirm('Are you sure you want to delete this customer?')) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    if (result.success) {
      showNotification('Customer deleted!', 'success');
      loadCustomers();
    } else {
      showNotification(result.message || 'Error deleting customer', 'error');
    }
  } catch (error) {
    showNotification('Error: ' + error.message, 'error');
  }
}

// Logout
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin-login.html';
  }
}

// Show Notification
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Close modal on outside click
document.addEventListener('click', function(event) {
  const modal = document.getElementById('modal');
  if (event.target === modal) {
    closeModal();
  }
});
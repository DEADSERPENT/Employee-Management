// API Base URL
const API_URL = 'http://localhost:3000';
let currentEmployeeId = null;
let employeeList = [];
let updateOriginalData = {};

// Helper to handle fetch responses
async function handleResponse(response) {
    if (!response.ok) {
    if (response.status === 500) {
        throw new Error('Internal server error. Please try again later.');
    } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData && errorData.message ? errorData.message : `Error: ${response.statusText}`);
    }
    }
    return response;
}

// Toast notification function
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => {
    toast.style.display = 'none';
    }, duration);
}

// Display loading state
function showLoading(isLoading) {
    const tableBody = document.getElementById('empTableBody');
    tableBody.innerHTML = isLoading ? '<tr><td colspan="7">Loading...</td></tr>' : '';
}

// Modal functions
function openUpdateModal(employeeId, username, phonenumber, designation) {
    currentEmployeeId = employeeId;
    document.getElementById('updateUsername').value = username;
    document.getElementById('updatePhone').value = phonenumber;
    document.getElementById('updateDesignation').value = designation;
    // Store the original values for comparison later
    updateOriginalData = { username, phonenumber, designation };
    const modal = document.getElementById('updateModal');
    modal.style.display = 'flex';
    // Focus management for accessibility
    setTimeout(() => document.getElementById('updateUsername').focus(), 100);
}
function closeUpdateModal() {
    document.getElementById('updateModal').style.display = 'none';
}
function openDeleteModal(employeeId) {
    currentEmployeeId = employeeId;
    const modal = document.getElementById('deleteModal');
    modal.style.display = 'flex';
    // Focus management for accessibility
    setTimeout(() => document.getElementById('confirmDeleteBtn').focus(), 100);
}
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

// Load Employees and ensure safe handling of empty lists
async function loadEmployees() {
    showLoading(true);
    try {
        const response = await fetch(`${API_URL}/getAll`);
        await handleResponse(response);
        const data = await response.json();
        employeeList = Array.isArray(data) ? data : [];
        employeeList.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        updateEmployeeTable();
    } catch (error) {
        showToast(error.message);
        employeeList = [];
        updateEmployeeTable();
    }
}

// Helper function to sanitize text and prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update Employee Table
function updateEmployeeTable() {
    const tableBody = document.getElementById('empTableBody');
    tableBody.innerHTML = '';

    if (employeeList.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 7;
        cell.textContent = 'No employees found';
        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }

    employeeList.forEach(emp => {
        const row = document.createElement('tr');

        // Create cells with textContent (safe from XSS)
        const idCell = document.createElement('td');
        idCell.textContent = emp.id;

        const usernameCell = document.createElement('td');
        usernameCell.textContent = emp.username;

        const emailCell = document.createElement('td');
        emailCell.textContent = emp.email;

        const phoneCell = document.createElement('td');
        phoneCell.textContent = emp.phonenumber || '';

        const designationCell = document.createElement('td');
        designationCell.textContent = emp.designation;

        const employeeIdCell = document.createElement('td');
        employeeIdCell.textContent = emp.employeeId;

        // Create actions cell
        const actionsCell = document.createElement('td');
        actionsCell.className = 'actions';

        const updateBtn = document.createElement('button');
        updateBtn.className = 'btn-primary';
        updateBtn.textContent = 'Update';
        updateBtn.dataset.employeeId = emp.employeeId;
        updateBtn.dataset.username = emp.username;
        updateBtn.dataset.phonenumber = emp.phonenumber || '';
        updateBtn.dataset.designation = emp.designation;
        updateBtn.addEventListener('click', function() {
            openUpdateModal(this.dataset.employeeId, this.dataset.username, this.dataset.phonenumber, this.dataset.designation);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.dataset.employeeId = emp.employeeId;
        deleteBtn.addEventListener('click', function() {
            openDeleteModal(this.dataset.employeeId);
        });

        actionsCell.appendChild(updateBtn);
        actionsCell.appendChild(deleteBtn);

        // Append all cells to row
        row.appendChild(idCell);
        row.appendChild(usernameCell);
        row.appendChild(emailCell);
        row.appendChild(phoneCell);
        row.appendChild(designationCell);
        row.appendChild(employeeIdCell);
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
    });
}

// Validate form inputs
function validateInputs(inputs) {
    return inputs.every(input => input.trim() !== '');
}

// Form Submission with enhanced validation
document.getElementById('empForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const newEmployeeId = document.getElementById('employeeId').value.trim();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const designation = document.getElementById('designation').value.trim();

    // Client-side validation
    if (!validateInputs([newEmployeeId, username, email, phone, designation])) {
        showToast('All fields are required!');
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address');
        return;
    }

    // Validate phone number format (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
        showToast('Phone number must be exactly 10 digits');
        return;
    }

    // Validate username length
    if (username.length < 2) {
        showToast('Username must be at least 2 characters');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/addEmp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                email,
                phonenumber: phone,
                designation,
                employeeId: newEmployeeId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.details || 'Failed to add employee');
        }

        showToast('Employee added successfully');
        resetForm();
        loadEmployees();
    } catch (error) {
        showToast(error.message);
        console.error(error);
    }
});

// Reset Form Fields
function resetForm() {
    document.getElementById('empForm').reset();
}

// Confirm Employee Deletion
async function confirmDelete() {
    try {
    const response = await fetch(`${API_URL}/deleteEmp/${currentEmployeeId}`, { method: 'DELETE' });
    await handleResponse(response);
    showToast('Employee deleted successfully');
    closeDeleteModal();
    loadEmployees();
    } catch (error) {
    showToast(error.message);
    console.error(error);
    }
}

// Confirm Employee Update
async function confirmUpdate() {
    const newUsername = document.getElementById('updateUsername').value.trim();
    const newPhone = document.getElementById('updatePhone').value.trim();
    const newDesignation = document.getElementById('updateDesignation').value.trim();

    // Client-side validation
    if (!validateInputs([newUsername, newPhone, newDesignation])) {
        showToast('All fields are required!');
        return;
    }

    // Validate phone number format (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(newPhone)) {
        showToast('Phone number must be exactly 10 digits');
        return;
    }

    // Validate username length
    if (newUsername.length < 2) {
        showToast('Username must be at least 2 characters');
        return;
    }

    // Check if no changes were made based on stored original data
    if (
        newUsername === updateOriginalData.username &&
        newPhone === updateOriginalData.phonenumber &&
        newDesignation === updateOriginalData.designation
    ) {
        showToast('No changes detected');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/updateEmp/${currentEmployeeId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: newUsername,
                phonenumber: newPhone,
                designation: newDesignation
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.details || 'Failed to update employee');
        }

        showToast('Employee updated successfully');
        closeUpdateModal();
        loadEmployees();
    } catch (error) {
        showToast(error.message);
        console.error(error);
    }
}

// Search Employees Function (Bug Fix: Added missing function)
function searchEmployees() {
    const query = document.getElementById('search').value.toLowerCase();
    const rows = document.querySelectorAll('#empTableBody tr');
    rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    const match = Array.from(cells).some(cell => cell.textContent.toLowerCase().includes(query));
    row.style.display = match ? '' : 'none';
    });
}

// Search on input event as well
document.getElementById('search').addEventListener('input', searchEmployees);

// Event listeners for buttons
document.getElementById('resetBtn').addEventListener('click', resetForm);
document.getElementById('searchBtn').addEventListener('click', searchEmployees);
document.getElementById('closeUpdateModalBtn').addEventListener('click', closeUpdateModal);
document.getElementById('cancelUpdateBtn').addEventListener('click', closeUpdateModal);
document.getElementById('confirmUpdateBtn').addEventListener('click', confirmUpdate);
document.getElementById('closeDeleteModalBtn').addEventListener('click', closeDeleteModal);
document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);
document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);

// Close modals when clicking on overlay
document.getElementById('updateModal').addEventListener('click', function(e) {
    if (e.target === this) closeUpdateModal();
});
document.getElementById('deleteModal').addEventListener('click', function(e) {
    if (e.target === this) closeDeleteModal();
});

// Keyboard accessibility - ESC key to close modals
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeUpdateModal();
        closeDeleteModal();
    }
});

// Initial Load
loadEmployees();
// API Base URL
const API_URL = 'http://localhost:8000';
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
    document.getElementById('updateModal').style.display = 'flex';
}
function closeUpdateModal() {
    document.getElementById('updateModal').style.display = 'none';
}
function openDeleteModal(employeeId) {
    currentEmployeeId = employeeId;
    document.getElementById('deleteModal').style.display = 'flex';
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
    console.log("Fetched employee list:", data);
    employeeList = Array.isArray(data) ? data : [];
    employeeList.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    updateEmployeeTable();
    } catch (error) {
    showToast(error.message);
    employeeList = [];
    updateEmployeeTable();
    console.error(error);
    }
}

// Update Employee Table
function updateEmployeeTable() {
    const tableBody = document.getElementById('empTableBody');
    tableBody.innerHTML = '';

    if (employeeList.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="7">No employees found</td></tr>';
    return;
    }

    employeeList.forEach(emp => {
    console.log("Employee data:", emp);
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${emp.id}</td>
        <td>${emp.username}</td>
        <td>${emp.email}</td>
        <td>${emp.phonenumber || ''}</td>
        <td>${emp.designation}</td>
        <td>${emp.employeeId}</td>
        <td class="actions">
        <button class="btn-primary" onclick="openUpdateModal('${emp.employeeId}', '${emp.username}', '${emp.phonenumber || ''}', '${emp.designation}')">Update</button>
        <button class="btn-danger" onclick="openDeleteModal('${emp.employeeId}')">Delete</button>
        </td>
    `;
    tableBody.appendChild(row);
    });
}

// Validate form inputs
function validateInputs(inputs) {
    return inputs.every(input => input.trim() !== '');
}

// Form Submission with enhanced validation and duplicate checks
document.getElementById('empForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const newId = document.getElementById('id').value;
    const newEmployeeId = document.getElementById('employeeId').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const designation = document.getElementById('designation').value;

    if (!validateInputs([newId, newEmployeeId, username, email, phone, designation])) {
    showToast('All fields are required!');
    return;
    }

    // Check for duplicate IDs in the current list
    if (employeeList.some(emp => emp.id === newId || emp.employeeId === newEmployeeId)) {
    showToast('Error: Employee ID or ID already exists!');
    return;
    }
    
    // Check for duplicate phone number in the current list
    if (employeeList.some(emp => emp.phonenumber === phone)) {
    showToast('Error: Phone number already exists!');
    return;
    }

    // Check for duplicate email in the current list (for Gmail)
    if (employeeList.some(emp => emp.email === email)) {
    showToast('Error: Email already exists!');
    return;
    }

    try {
    const response = await fetch(`${API_URL}/addEmp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newId, username, email, phonenumber: phone, designation, employeeId: newEmployeeId })
    });
    await handleResponse(response);
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
    const newUsername = document.getElementById('updateUsername').value;
    const newPhone = document.getElementById('updatePhone').value;
    const newDesignation = document.getElementById('updateDesignation').value;

    if (!validateInputs([newUsername, newPhone, newDesignation])) {
    showToast('All fields are required!');
    return;
    }

    // Check if no changes were made based on stored original data
    if (
        newUsername === updateOriginalData.username &&
        newPhone === updateOriginalData.phonenumber &&
        newDesignation === updateOriginalData.designation
    ) {
        showToast('Nothing changed');
        return;
    }

    try {
    const response = await fetch(`${API_URL}/updateEmp/${currentEmployeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, phonenumber: newPhone, designation: newDesignation })
    });
    await handleResponse(response);
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

// Initial Load
loadEmployees();
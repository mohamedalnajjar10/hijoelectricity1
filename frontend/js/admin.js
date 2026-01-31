/**
 * Admin Dashboard JavaScript
 * Handles project management CRUD operations
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!await checkAuth()) {
        return;
    }

    // Initialize components
    initEventListeners();
    await loadProjects();
});

// ========== Authentication ==========

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
async function checkAuth() {
    const token = localStorage.getItem('token');

    if (!token) {
        redirectToLogin();
        return false;
    }

    try {
        await API.auth.verify(token);
        return true;
    } catch (error) {
        console.error('Auth verification failed:', error);
        clearAuth();
        redirectToLogin();
        return false;
    }
}

/**
 * Clear authentication data
 */
function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
}

/**
 * Redirect to login page
 */
function redirectToLogin() {
    window.location.href = 'login.html';
}

// ========== State Management ==========

let currentProjectId = null;
let currentImageUrl = null;

// ========== Event Listeners ==========

/**
 * Initialize all event listeners
 */
function initEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Add project button
    const addProjectBtn = document.getElementById('addProjectBtn');
    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', () => openModal());
    }

    // Modal controls
    const modal = document.getElementById('projectModal');
    const modalClose = document.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancelBtn');

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }

    // Close modal on outside click
    if (modal) {
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Image preview
    const imageInput = document.getElementById('image');
    if (imageInput) {
        imageInput.addEventListener('change', handleImagePreview);
    }

    // Form submission
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', handleFormSubmit);
    }
}

// ========== Logout ==========

/**
 * Handle logout
 */
function handleLogout() {
    clearAuth();
    redirectToLogin();
}

// ========== Modal Management ==========

/**
 * Open modal for add/edit
 * @param {Object|null} project - Project to edit (null for new)
 */
function openModal(project = null) {
    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modalTitle');
    const projectForm = document.getElementById('projectForm');
    const formMessage = document.getElementById('formMessage');
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');

    currentProjectId = project ? project.id : null;
    currentImageUrl = project ? project.image : null;

    if (project) {
        // Edit mode
        modalTitle.textContent = 'Edit Project';
        document.getElementById('titleEn').value = project.titleEn || '';
        document.getElementById('titleAr').value = project.titleAr || '';
        document.getElementById('descriptionEn').value = project.descriptionEn || '';
        document.getElementById('descriptionAr').value = project.descriptionAr || '';

        if (project.image) {
            imagePreview.src = `${API.BASE_URL}${project.image}`;
            imagePreview.style.display = 'block';
        }

        imageInput.required = false;
    } else {
        // Add mode
        modalTitle.textContent = 'Add Project';
        projectForm.reset();
        imagePreview.style.display = 'none';
        imageInput.required = true;
    }

    // Clear messages
    formMessage.textContent = '';
    formMessage.className = 'form-message';

    modal.style.display = 'block';
}

/**
 * Close modal
 */
function closeModal() {
    const modal = document.getElementById('projectModal');
    const projectForm = document.getElementById('projectForm');
    const imagePreview = document.getElementById('imagePreview');

    modal.style.display = 'none';
    projectForm.reset();
    imagePreview.style.display = 'none';
    currentProjectId = null;
    currentImageUrl = null;
}

// ========== Image Preview ==========

/**
 * Handle image preview
 * @param {Event} event - Change event
 */
function handleImagePreview(event) {
    const file = event.target.files[0];
    const imagePreview = document.getElementById('imagePreview');

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.style.display = 'none';
    }
}

// ========== Form Submission ==========

/**
 * Handle form submission
 * @param {Event} event - Submit event
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('formMessage');
    const imageInput = document.getElementById('image');

    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    formMessage.textContent = '';
    formMessage.className = 'form-message';

    // Build form data
    const formData = new FormData();
    formData.append('titleEn', document.getElementById('titleEn').value);
    formData.append('titleAr', document.getElementById('titleAr').value);
    formData.append('descriptionEn', document.getElementById('descriptionEn').value);
    formData.append('descriptionAr', document.getElementById('descriptionAr').value);

    const imageFile = imageInput.files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        if (currentProjectId) {
            await API.projects.update(currentProjectId, formData);
            showMessage(formMessage, 'Project updated successfully!', 'success');
        } else {
            await API.projects.create(formData);
            showMessage(formMessage, 'Project created successfully!', 'success');
        }

        // Refresh projects list after delay
        setTimeout(() => {
            closeModal();
            loadProjects();
        }, 1500);
    } catch (error) {
        showMessage(formMessage, error.message || 'Failed to save project', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Project';
    }
}

// ========== Projects Loading ==========

/**
 * Load all projects
 */
async function loadProjects() {
    const loading = document.getElementById('loading');
    const projectsList = document.getElementById('projectsList');
    const noProjects = document.getElementById('noProjects');

    loading.style.display = 'block';
    projectsList.innerHTML = '';
    noProjects.style.display = 'none';

    try {
        const projects = await API.projects.getAll();

        loading.style.display = 'none';

        if (!projects || projects.length === 0) {
            noProjects.style.display = 'block';
            return;
        }

        projects.forEach(project => {
            const card = createProjectCard(project);
            projectsList.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading projects:', error);
        loading.textContent = 'Error loading projects';
    }
}

/**
 * Create project card element
 * @param {Object} project - Project data
 * @returns {HTMLElement} - Card element
 */
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'admin-project-card';

    const imageUrl = `${API.BASE_URL}${project.image}`;

    card.innerHTML = `
        <div class="admin-project-image">
            <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(project.titleEn)}" 
                 onerror="this.src='images/placeholder.jpg'">
        </div>
        <div class="admin-project-info">
            <h3>${escapeHtml(project.titleEn)}</h3>
            <p><strong>Arabic:</strong> ${escapeHtml(project.titleAr) || 'N/A'}</p>
            <p>${escapeHtml(project.descriptionEn?.substring(0, 150))}...</p>
            <p><strong>Arabic:</strong> ${project.descriptionAr ? escapeHtml(project.descriptionAr.substring(0, 150)) + '...' : 'N/A'}</p>
        </div>
        <div class="admin-project-actions">
            <button class="btn btn-edit">Edit</button>
            <button class="btn btn-delete">Delete</button>
        </div>
    `;

    // Edit button
    card.querySelector('.btn-edit').addEventListener('click', () => {
        openModal(project);
    });

    // Delete button
    card.querySelector('.btn-delete').addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this project?')) {
            await deleteProject(project.id);
        }
    });

    return card;
}

/**
 * Delete project
 * @param {number} id - Project ID
 */
async function deleteProject(id) {
    try {
        await API.projects.delete(id);
        await loadProjects();
    } catch (error) {
        alert('Failed to delete project: ' + error.message);
    }
}

// ========== Utilities ==========

/**
 * Show form message
 * @param {HTMLElement} element - Message element
 * @param {string} message - Message text
 * @param {string} type - 'success' or 'error'
 */
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `form-message ${type}`;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
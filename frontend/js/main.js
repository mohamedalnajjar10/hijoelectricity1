/**
 * Main JavaScript - Homepage functionality
 * Handles navigation, language switching, and project loading
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initLanguageSwitcher();
    initMobileMenu();
    loadProjects();
});

// ========== Navigation ==========

/**
 * Initialize navigation handling and scroll spy
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    // Update active nav on scroll (debounced)
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
        scrollTimeout = requestAnimationFrame(() => updateActiveNav(navLinks, sections));
    });

    // Handle nav link clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            handleNavClick(link, navLinks);
        });
    });

    // Handle hash on page load
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            setTimeout(() => {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }
}

/**
 * Update active navigation based on scroll position
 */
function updateActiveNav(navLinks, sections) {
    const scrollPosition = window.scrollY + 300;

    navLinks.forEach(link => link.classList.remove('active'));

    for (const section of sections) {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            const activeLink = document.querySelector(`.nav-link[href="#${section.id}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
            break;
        }
    }
}

/**
 * Handle navigation click
 */
function handleNavClick(link, navLinks) {
    const targetId = link.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
        // Close mobile menu
        closeMobileMenu();

        // Smooth scroll
        targetSection.scrollIntoView({ behavior: 'smooth' });

        // Update active state
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Update URL
        window.history.pushState(null, null, `#${targetId}`);
    }
}

// ========== Language Switcher ==========

/**
 * Initialize language switcher buttons
 */
function initLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    const currentLang = typeof i18n !== 'undefined' ? i18n.getLanguage() : 'en';

    // Set initial active state
    langButtons.forEach(btn => {
        if (btn.dataset.lang === currentLang) {
            btn.classList.add('active');
        }
    });

    // Handle language switch
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            
            if (typeof i18n !== 'undefined') {
                i18n.setLanguage(lang);
            }

            langButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// ========== Mobile Menu ==========

/**
 * Initialize mobile menu toggle
 */
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
    if (navMenu) navMenu.classList.remove('active');
    if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
}

// ========== Projects Loading ==========

/**
 * Load and display projects in portfolio section
 */
async function loadProjects() {
    const loading = document.getElementById('loading');
    const projectsGrid = document.getElementById('projects-grid');
    const noProjects = document.getElementById('no-projects');

    if (!projectsGrid) return;

    try {
        const projects = await API.projects.getAll();

        if (loading) loading.style.display = 'none';

        if (!projects || projects.length === 0) {
            if (noProjects) noProjects.style.display = 'block';
            return;
        }

        projectsGrid.innerHTML = projects.map(project => createProjectCard(project)).join('');
    } catch (error) {
        console.error('Error loading projects:', error);
        if (loading) loading.style.display = 'none';
        if (noProjects) noProjects.style.display = 'block';
    }
}

/**
 * Create project card HTML
 * @param {Object} project - Project data
 * @returns {string} - HTML string
 */
function createProjectCard(project) {
    const currentLang = typeof i18n !== 'undefined' ? i18n.getLanguage() : 'en';
    const title = currentLang === 'ar' ? (project.titleAr || project.titleEn) : project.titleEn;
    const description = currentLang === 'ar' 
        ? (project.descriptionAr || project.descriptionEn) 
        : project.descriptionEn;
    const imageUrl = project.image || '/images/placeholder.jpg';

    return `
        <div class="project-card">
            <div class="project-image">
                <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" loading="lazy">
            </div>
            <div class="project-info">
                <h3>${escapeHtml(title)}</h3>
                <p>${escapeHtml(description.substring(0, 100))}...</p>
            </div>
        </div>
    `;
}

/**
 * Escape HTML special characters
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ========== Event Listeners ==========

// Reload projects on language change
document.addEventListener('languageChanged', () => {
    loadProjects();
});
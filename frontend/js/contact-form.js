/**
 * Contact Form Handler
 * Manages contact form submission with validation
 */

/**
 * Handle contact form submission
 * @param {Event} event - Form submit event
 */
window.handleContactSubmit = async (event) => {
    if (event) event.preventDefault();

    const form = document.getElementById("contactForm");
    const submitBtn = document.getElementById("submitBtn");
    const formMessage = document.getElementById("formMessage");

    if (!form || !submitBtn || !formMessage) {
        console.error("Contact form elements not found");
        return false;
    }

    // Get form data
    const formData = {
        name: document.getElementById("name")?.value?.trim() || '',
        email: document.getElementById("email")?.value?.trim() || '',
        phone: document.getElementById("phone")?.value?.trim() || '',
        message: document.getElementById("message")?.value?.trim() || ''
    };

    // Client-side validation
    const validationError = validateContactForm(formData);
    if (validationError) {
        showFormMessage(formMessage, validationError, 'error');
        return false;
    }

    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = getTranslation("sending");
    clearFormMessage(formMessage);

    try {
        if (typeof API === 'undefined') {
            throw new Error("API module not loaded");
        }

        await API.contact.send(formData);
        
        showFormMessage(formMessage, getTranslation("successMessage"), 'success');
        form.reset();
    } catch (error) {
        console.error("Contact form error:", error);
        const errorMsg = error.message || getTranslation("errorMessage");
        showFormMessage(formMessage, errorMsg, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = getTranslation("send");
    }

    return false;
};

/**
 * Validate contact form data
 * @param {Object} data - Form data
 * @returns {string|null} - Error message or null if valid
 */
function validateContactForm(data) {
    if (!data.name || data.name.length < 2) {
        return "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        return "Please enter a valid email address";
    }

    if (!data.message || data.message.length < 10) {
        return "Message must be at least 10 characters";
    }

    return null;
}

/**
 * Show form message
 * @param {HTMLElement} element - Message element
 * @param {string} message - Message text
 * @param {string} type - 'success' or 'error'
 */
function showFormMessage(element, message, type) {
    element.textContent = message;
    element.className = `form-message ${type}`;
}

/**
 * Clear form message
 * @param {HTMLElement} element - Message element
 */
function clearFormMessage(element) {
    element.textContent = '';
    element.className = 'form-message';
}

/**
 * Get translation with fallback
 * @param {string} key - Translation key
 * @returns {string} - Translated text
 */
function getTranslation(key) {
    const fallbacks = {
        sending: "Sending...",
        send: "Send Message",
        successMessage: "Message sent successfully!",
        errorMessage: "Failed to send message. Please try again."
    };

    if (typeof i18n !== 'undefined' && i18n.t) {
        return i18n.t(key);
    }
    
    return fallbacks[key] || key;
}

// ========== Initialization ==========

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById("contactForm");
    
    if (form) {
        // Remove any inline onsubmit to prevent duplicate handlers
        form.removeAttribute("onsubmit");
        
        form.addEventListener("submit", (event) => {
            window.handleContactSubmit(event);
        });
    }
});

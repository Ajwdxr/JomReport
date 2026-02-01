/**
 * Simple utility to sanitize HTML strings to prevent XSS attacks.
 */
export const sanitizeHTML = (str) => {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

/**
 * Validates report data before submission.
 */
export const validateReport = (data) => {
    const errors = {};
    if (!data.title || data.title.trim().length < 5) {
        errors.title = 'Tajuk mestilah sekurang-kurangnya 5 aksara.';
    }
    if (!data.description || data.description.trim().length < 10) {
        errors.description = 'Penerangan mestilah sekurang-kurangnya 10 aksara.';
    }
    if (!data.category) {
        errors.category = 'Sila pilih kategori.';
    }
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

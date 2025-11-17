// Input validation middleware

export const validateEmployee = (req, res, next) => {
    const { username, email, phonenumber, designation, employeeId } = req.body;
    const errors = [];

    // Username validation
    if (!username || typeof username !== 'string' || username.trim().length < 2) {
        errors.push('Username must be at least 2 characters long');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Invalid email format');
    }

    // Phone number validation
    const phoneRegex = /^\d{10}$/;
    if (!phonenumber || !phoneRegex.test(phonenumber)) {
        errors.push('Phone number must be exactly 10 digits');
    }

    // Designation validation
    if (!designation || typeof designation !== 'string' || designation.trim().length === 0) {
        errors.push('Designation is required');
    }

    // Employee ID validation
    if (!employeeId || typeof employeeId !== 'string' || employeeId.trim().length === 0) {
        errors.push('Employee ID is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors
        });
    }

    next();
};

export const validateUpdate = (req, res, next) => {
    const { username, phonenumber, designation } = req.body;
    const errors = [];

    // Only validate fields that are being updated
    if (username !== undefined) {
        if (typeof username !== 'string' || username.trim().length < 2) {
            errors.push('Username must be at least 2 characters long');
        }
    }

    if (phonenumber !== undefined) {
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phonenumber)) {
            errors.push('Phone number must be exactly 10 digits');
        }
    }

    if (designation !== undefined) {
        if (typeof designation !== 'string' || designation.trim().length === 0) {
            errors.push('Designation is required');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors
        });
    }

    next();
};

export const sanitizeInput = (req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        });
    }
    next();
};

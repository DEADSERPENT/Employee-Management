import { getUserModel } from '../postgres/postgres.js';

export const getAllEmp = async (req, res) => {
    try {
        const UserModel = getUserModel();
        const users = await UserModel.findAll({
            order: [['id', 'ASC']]
        });

        if (users.length === 0) {
            return res.status(200).json({ message: "No users found" });
        }

        return res.status(200).json(users);
    } catch (error) {
        console.error('Error in getAllEmp:', error);
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

export const addEmp = async (req, res) => {
    const { username, email, phonenumber, designation, employeeId } = req.body;

    // Validate required fields
    if (!username || !email || !phonenumber || !designation || !employeeId) {
        return res.status(400).json({
            error: "All fields are required",
            required: ["username", "email", "phonenumber", "designation", "employeeId"]
        });
    }

    try {
        const UserModel = getUserModel();

        // Check if employee already exists
        const existingEmp = await UserModel.findOne({ where: { employeeId } });
        if (existingEmp) {
            return res.status(409).json({ error: "Employee ID already exists" });
        }

        // Check if email already exists
        const existingEmail = await UserModel.findOne({ where: { email: email.toLowerCase() } });
        if (existingEmail) {
            return res.status(409).json({ error: "Email already exists" });
        }

        // Check if phone number already exists
        const existingPhone = await UserModel.findOne({ where: { phonenumber } });
        if (existingPhone) {
            return res.status(409).json({ error: "Phone number already exists" });
        }

        // Create new employee
        const newEmployee = await UserModel.create({
            username,
            email,
            phonenumber,
            designation,
            employeeId
        });

        return res.status(201).json({
            message: "Employee created successfully",
            data: newEmployee
        });
    } catch (error) {
        console.error('Error in addEmp:', error);

        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: "Validation error",
                details: error.errors.map(e => e.message)
            });
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                error: "Duplicate entry",
                details: error.errors.map(e => e.message)
            });
        }

        return res.status(500).json({ error: "Failed to create employee", details: error.message });
    }
};

export const updateEmp = async (req, res) => {
    const employeeId = req.params.employeeId;
    const updateData = req.body;

    if (!employeeId) {
        return res.status(400).json({ error: "Employee ID is required" });
    }

    try {
        const UserModel = getUserModel();

        // Find employee
        const emp = await UserModel.findOne({ where: { employeeId } });
        if (!emp) {
            return res.status(404).json({ error: "Employee not found" });
        }

        // Remove fields that shouldn't be updated
        delete updateData.employeeId;
        delete updateData.id;
        delete updateData.email; // Prevent email updates for security

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "No valid update data provided" });
        }

        // Check if phone number is being updated and already exists
        if (updateData.phonenumber && updateData.phonenumber !== emp.phonenumber) {
            const existingPhone = await UserModel.findOne({ where: { phonenumber: updateData.phonenumber } });
            if (existingPhone) {
                return res.status(409).json({ error: "Phone number already exists" });
            }
        }

        // Update employee
        await emp.update(updateData);

        // Fetch updated employee
        const updatedEmp = await UserModel.findOne({ where: { employeeId } });

        return res.status(200).json({
            message: "Employee updated successfully",
            data: updatedEmp
        });
    } catch (error) {
        console.error('Error in updateEmp:', error);

        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: "Validation error",
                details: error.errors.map(e => e.message)
            });
        }

        return res.status(500).json({ error: "Failed to update employee", details: error.message });
    }
};

export const deleteEmp = async (req, res) => {
    const employeeId = req.params.employeeId;

    if (!employeeId) {
        return res.status(400).json({ error: "Employee ID is required" });
    }

    try {
        const UserModel = getUserModel();

        const emp = await UserModel.findOne({ where: { employeeId } });
        if (!emp) {
            return res.status(404).json({ error: "Employee not found" });
        }

        await emp.destroy();

        return res.status(200).json({
            message: "Employee deleted successfully",
            employeeId: employeeId
        });
    } catch (error) {
        console.error('Error in deleteEmp:', error);
        return res.status(500).json({ error: "Failed to delete employee", details: error.message });
    }
};

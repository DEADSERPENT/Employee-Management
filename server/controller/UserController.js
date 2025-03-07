import { UserModel } from '../postgres/postgres.js';

export const getAllEmp = async (req, res) => {  
    try {
        const users = await UserModel.findAll();
        if (users.length === 0) {
            return res.status(200).json({ "message": "No users found" });
        }
        return res.status(200).json(users);
    } catch (error) {
        console.error('Error in getAllEmp:', error);
        return res.status(500).json({ "error": "Internal server error" });
    } 
};

export const addEmp = async (req, res) => {
    const { username, email, designation, employeeId } = req.body;
    try {
        const emp = await UserModel.findOne({ where: { employeeId } });
        if (emp === null) {
            await UserModel.create(req.body);
            return res.status(201).json({ message: "Employee created successfully" });
        }
        return res.status(200).json({ message: "Employee already exists" });
    } catch (error) {
        console.error('Error in addEmp:', error);
        return res.status(500).json({ "error": "Failed to create employee" });
    }
};

export const updateEmp = async (req, res) => {
    const employeeId = req.params.employeeId;
    const updateData = req.body;

    if (!employeeId) {
        return res.status(400).json({ error: "Employee ID is required" });
    }

    try {
        const emp = await UserModel.findOne({ where: { employeeId } });
        if (!emp) {
            return res.status(404).json({ message: "Employee not found" });
        }
        delete updateData.employeeId;
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "No update data provided" });
        }
        await emp.update(updateData);
        const updatedEmp = await UserModel.findOne({ where: { employeeId } });
        return res.status(200).json({ message: "Employee updated successfully", data: updatedEmp });
    } catch (error) {
        console.error('Error in updateEmp:', error);
        return res.status(500).json({ error: "Failed to update employee" });
    }
};

export const deleteEmp = async (req, res) => {
    const employeeId = req.params.employeeId;

    if (!employeeId) {
        return res.status(400).json({ error: "Employee ID is required" });
    }

    try {
        const emp = await UserModel.findOne({ where: { employeeId } });
        if (!emp) {
            return res.status(404).json({ message: "Employee not found" });
        }
        await emp.destroy();
        return res.status(200).json({ message: "Employee deleted successfully" });
    } catch (error) {
        console.error('Error in deleteEmp:', error);
        return res.status(500).json({ error: "Failed to delete employee" });
    }
};

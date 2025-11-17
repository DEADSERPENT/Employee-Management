import express from 'express';
import {
    getAllEmp,
    addEmp,
    updateEmp,
    deleteEmp
} from '../controller/UserController.js';
import { validateEmployee, validateUpdate, sanitizeInput } from '../middleware/validator.js';

const router = express.Router();

// Apply sanitization to all routes
router.use(sanitizeInput);

// Employee routes with validation
router.get('/getAll', getAllEmp);
router.post('/addEmp', validateEmployee, addEmp);
router.put('/updateEmp/:employeeId', validateUpdate, updateEmp);
router.delete('/deleteEmp/:employeeId', deleteEmp);

export default router;  
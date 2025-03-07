import express from 'express';
import { 
    getAllEmp,
    addEmp,
    updateEmp,
    deleteEmp 
} from '../controller/UserController.js';

const router = express.Router();

router.get('/getAll', getAllEmp);
router.post('/addEmp', addEmp);
router.put('/updateEmp/:employeeId', updateEmp);    
router.delete('/deleteEmp/:employeeId', deleteEmp); 

export default router;  
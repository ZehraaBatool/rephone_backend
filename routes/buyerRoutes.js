import express from 'express';
import { getAllBuyers, addBuyer } from '../controllers/buyerController.js';
import { validateRegistration, validateLogin, validateUpdateSeller } from '../middlewares/validation.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// get all buyers (users that are not sellers)
router.get('/all', protect, getAllBuyers)

// add a new buyer
router.post('/add', protect, addBuyer)

export default router;
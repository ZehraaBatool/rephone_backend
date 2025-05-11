import express from 'express';
import {registerAdmin, loginAdmin, getAdminDashboardAnalytics, getVerificationRequestsList, getVerificationStatus, verifyPhone, getVerifiedPhonesList, getSellersList, getAllOrders} from '../controllers/adminController.js';
import { validateAdminRegistration, validateLogin } from '../middlewares/validation.js';
import { protectAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// register
router.post('/register',validateAdminRegistration, registerAdmin)

// login
router.post('/login',validateLogin, loginAdmin)

// dashboard
router.get('/dashboard', protectAdmin, getAdminDashboardAnalytics)

// get verification requests list
router.get('/verification-list', protectAdmin, getVerificationRequestsList) 

//Note: get the request details from the product routes getPhoneDetails api

// get the phone status from the imei.info api
router.get('/verify/:imei', protectAdmin, getVerificationStatus)

// update the verification status
router.put('/verify/:imei', protectAdmin, verifyPhone)

// get the list of all the verified phones along with the details of the admin who verified it
router.get('/verified-phones', protectAdmin, getVerifiedPhonesList)

// get the list of all sellers
router.get('/sellers', protectAdmin, getSellersList)

// get the list of all orders
router.get('/orders', protectAdmin, getAllOrders)

export default router;
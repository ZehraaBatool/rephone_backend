import express from 'express';
import { initiatePayment, paymentNotification, getPaymentStatus } from '../controllers/paymentController.js';
const router = express.Router();

// checkout
router.post('/initiate/:orderId',initiatePayment)

// payment notification
router.post('/notify', paymentNotification)

// get payment status
router.get('/status/:orderId', getPaymentStatus);
  

export default router;
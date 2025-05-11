import express from 'express';
import { createOrder } from '../controllers/orderController.js';
import { getOrderDetails } from '../controllers/orderController.js';

const router = express.Router();

// checkout
router.post('/create',createOrder)

// get an order details by orderId
router.get('/:orderId', getOrderDetails);

export default router;
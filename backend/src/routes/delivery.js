import express from 'express';
const router = express.Router();

import Delivery from '../controllers/delivery';
import grantAccess from '../middlewares/grantAccess';

// Admin route to mark an order as delivered and generate SDC
router.post(
  '/admin/deliver/:order_id',
  grantAccess('update', 'order'), // Only admin can mark as delivered
  Delivery.MarkAsDelivered
);

// Route to verify SDC before review submission
router.post(
  '/verifySDC',
  grantAccess('create', 'review'), // User must have permission to create reviews
  Delivery.VerifySDC
);

// Route to get user's deliveries
router.get(
  '/my-deliveries',
  grantAccess('read', 'delivery'), // User can read their own deliveries
  Delivery.GetUserDeliveries
);

export default router; 